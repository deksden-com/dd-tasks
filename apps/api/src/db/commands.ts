import {
  evidence,
  normalizeFailure,
  progress,
} from "../../../../scripts/test-observation.mjs";
import {
  createSqlClient,
  getDatabaseUrl,
  getFlowScopedLocalDatabaseUrl,
} from "./client.js";
import { type SeedOptions, seedDemoData } from "./fixtures.js";
import {
  applyMigrations,
  migrationState,
  migrationStateMatches,
  resetAndMigrate,
} from "./migrations.js";
import {
  classifyMutationTarget,
  parseCommandArgs,
  type TargetClassification,
} from "./target-guard.js";

const command = process.argv[2] ?? "help";
const commandArgs = process.argv.slice(3);
let parsed: ReturnType<typeof parseCommandArgs>;
let databaseUrl: string;
let phase = "resolve";

function emit(value: Record<string, unknown>): void {
  console.log(JSON.stringify(value));
}

function classificationFor(
  operation: "migrate" | "reset" | "seed" | "check",
  requireWorldBinding = false,
): TargetClassification {
  return classifyMutationTarget({
    databaseUrl,
    profile: parsed.profile ?? parsed.target,
    target: parsed.target,
    runId: parsed.runId,
    worldId: parsed.worldId,
    composeProject: parsed.composeProject,
    volume: parsed.volume,
    operation,
    requireRunId: operation !== "check",
    requireWorldBinding,
  });
}

function rejectClassification(
  operation: string,
  classification: TargetClassification,
): never {
  emit({
    status: "rejected",
    operation,
    code: "TARGET_REJECTED",
    profile: classification.profile,
    target: classification.target,
    hostClass: classification.hostClass,
    databaseName: classification.databaseName,
    binding: classification.binding,
    reason: classification.reason,
    mutated: false,
  });
  process.exitCode = 2;
  throw new Error("target rejected");
}

function requireSafeTarget(
  operation: "migrate" | "reset" | "seed" | "check",
): TargetClassification {
  const classification = classificationFor(operation, operation !== "check");
  if (!classification.safe)
    return rejectClassification(operation, classification);
  return classification;
}

function previewSeedOptions(
  profile: TargetClassification["profile"],
): SeedOptions {
  if (!profile?.startsWith("preview-")) {
    return {
      profile: profile ?? "local",
      runId: parsed.runId ?? undefined,
      worldId: parsed.worldId ?? undefined,
    };
  }
  const previewPasswords = {
    owner: process.env.PREVIEW_OWNER_PASSWORD,
    member: process.env.PREVIEW_MEMBER_PASSWORD,
    outsider: process.env.PREVIEW_OUTSIDER_PASSWORD,
  };
  if (
    !previewPasswords.owner ||
    !previewPasswords.member ||
    !previewPasswords.outsider
  ) {
    emit({
      status: "rejected",
      operation: "seed",
      code: "PREVIEW_SECRETS_MISSING",
      profile,
      reason: "named preview actor secret inputs are required",
      mutated: false,
    });
    process.exitCode = 2;
    throw new Error("preview secrets missing");
  }
  return {
    profile,
    runId: parsed.runId ?? undefined,
    worldId: parsed.worldId ?? undefined,
    previewPasswords,
  };
}

async function migrate(): Promise<void> {
  phase = "migrate";
  const classification = requireSafeTarget("migrate");
  await ensureLocalFlowDatabase(classification);
  const sql = createSqlClient(databaseUrl);
  try {
    const applied = await applyMigrations(sql);
    emit({
      status: "ok",
      operation: "migrate",
      profile: classification.profile,
      target: classification.target,
      runId: parsed.runId,
      applied,
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function check(
  classification = requireSafeTarget("check"),
): Promise<boolean> {
  phase = "inspect";
  const sql = createSqlClient(databaseUrl);
  try {
    const state = await migrationState(sql);
    const tables = await sql<
      { foundation: string | null; tasks: string | null }[]
    >`
      SELECT to_regclass('public.foundation_metadata') AS foundation,
             to_regclass('public.tasks') AS tasks
    `;
    const schemaExists =
      tables[0]?.foundation === "foundation_metadata" &&
      tables[0]?.tasks === "tasks";
    const migrationsMatch = migrationStateMatches(state);
    if (!schemaExists || !migrationsMatch) {
      emit({
        status: "failed",
        operation: "check",
        profile: classification.profile,
        schemaExists,
        migrationsMatch,
      });
      process.exitCode = 1;
      return false;
    }
    emit({
      status: "ok",
      operation: "check",
      profile: classification.profile,
      schemaExists,
      migrationCount: state.applied.length,
      migrationOrder: state.applied,
    });
    return true;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function reset(): Promise<void> {
  phase = "reset";
  const classification = requireSafeTarget("reset");
  await ensureLocalFlowDatabase(classification);
  const sql = createSqlClient(databaseUrl);
  try {
    const applied = await resetAndMigrate(sql);
    emit({
      status: "ok",
      operation: "reset",
      profile: classification.profile,
      target: classification.target,
      databaseName: classification.databaseName,
      runId: parsed.runId,
      worldId: parsed.worldId,
      applied,
      mutated: true,
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

/** Create the isolated local/test database before a mutating flow command. */
async function ensureLocalFlowDatabase(
  classification: TargetClassification,
): Promise<void> {
  if (!parsed.runId || !process.env.DD_FLOW_LOCAL_DATABASE_SUFFIX) return;
  if (classification.profile !== "local" && classification.profile !== "test")
    return;
  if (
    !classification.databaseName ||
    !/^[a-z0-9_]+$/.test(classification.databaseName)
  )
    return;

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = "/postgres";
  const admin = createSqlClient(adminUrl.toString());
  try {
    const rows = await admin<{ present: number }[]>`
      SELECT 1 AS present FROM pg_database WHERE datname = ${classification.databaseName}
    `;
    if (!rows[0]) {
      try {
        await admin.unsafe(`CREATE DATABASE "${classification.databaseName}"`);
      } catch (error) {
        if ((error as { code?: string }).code !== "42P04") throw error;
        const readback = await admin<
          { present: number }[]
        >`SELECT 1 AS present FROM pg_database WHERE datname = ${classification.databaseName}`;
        if (!readback[0]) throw error;
      }
    }
  } finally {
    await admin.end({ timeout: 5 });
  }
}

async function seed(): Promise<void> {
  phase = "seed";
  const classification = requireSafeTarget("seed");
  const options = previewSeedOptions(classification.profile);
  const sql = createSqlClient(databaseUrl);
  try {
    const state = await migrationState(sql);
    if (!migrationStateMatches(state)) {
      emit({ status: "failed", operation: "seed", code: "SCHEMA_NOT_READY" });
      process.exitCode = 1;
      return;
    }
    const seed = await seedDemoData(sql, options);
    emit({
      status: "ok",
      operation: "seed",
      profile: classification.profile,
      target: classification.target,
      databaseName: classification.databaseName,
      seed,
      mutated: true,
      runId: parsed.runId,
      worldId: parsed.worldId,
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function main(): Promise<void> {
  parsed = parseCommandArgs(commandArgs);
  databaseUrl = getFlowScopedLocalDatabaseUrl(getDatabaseUrl(), parsed.runId);
  if (command === "verify") return verify();
  if (command === "migrate") return migrate();
  if (command === "check") {
    await check();
    return;
  }
  if (command === "reset") return reset();
  if (command === "seed") return seed();
  emit({
    status: "failed",
    operation: command,
    code: "UNKNOWN_DATABASE_COMMAND",
  });
  process.exitCode = 2;
}

async function verify(): Promise<void> {
  const suffix = process.env.DD_FLOW_LOCAL_DATABASE_SUFFIX;
  const classification = classificationFor("migrate", true);
  if (
    !classification.safe ||
    classification.profile !== "local" ||
    parsed.target !== "local" ||
    !parsed.runId ||
    !/^RUN-[A-Za-z0-9_-]+$/.test(parsed.runId) ||
    !suffix ||
    !/^[a-f0-9]{8,64}$/.test(suffix) ||
    process.env.DD_TASKS_TEST_WORLD ||
    !classification.databaseName?.endsWith(`_${suffix}`)
  ) {
    throw Object.assign(
      new Error(
        "DB verify requires an explicit flow-owned scoped local target",
      ),
      { code: "TARGET_REJECTED" },
    );
  }
  phase = "prepare";
  await ensureLocalFlowDatabase(classification);
  progress("setup_step_completed:database_created", "startup");
  phase = "migrate";
  const sql = createSqlClient(databaseUrl);
  try {
    await applyMigrations(sql);
  } finally {
    await sql.end({ timeout: 5 });
  }
  progress("setup_step_completed:database_migrated", "startup");
  const matched = await check(classification);
  progress("step_completed:database_inspected");
  evidence(
    { name: "db-verify", version: "1" },
    { passed: matched ? 1 : 0, failed: matched ? 0 : 1, skipped: 0 },
    matched
      ? []
      : [
          {
            category: "unclassified",
            code: "DATABASE_SCHEMA_MISMATCH",
            origin: "unknown",
            phase: "test",
            message: "Schema or migration ledger differs after migration",
          },
        ],
    true,
  );
}

main().catch((error: unknown) => {
  const failure = normalizeFailure(error as Record<string, unknown>, {
    tooling: true,
    phase: "setup",
  });
  if (command === "verify")
    evidence(
      { name: "db-verify", version: "1" },
      { passed: 0, failed: 0, skipped: 0 },
      [{ ...failure, classification_reason: `database_${phase}` }],
      false,
    );
  if (process.exitCode !== 2) {
    emit({
      status: "failed",
      operation: command,
      code: "DATABASE_OPERATION_FAILED",
      phase,
      message: failure.message,
      native_code: failure.native_code,
      cause: failure.code,
    });
    process.exitCode = 1;
  }
});
