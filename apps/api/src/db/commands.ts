import { createSqlClient, getDatabaseUrl } from "./client.js";
import { type SeedOptions, seedDemoData } from "./fixtures.js";
import {
  applyMigrations,
  migrationState,
  resetAndMigrate,
} from "./migrations.js";
import {
  classifyMutationTarget,
  parseCommandArgs,
  type TargetClassification,
} from "./target-guard.js";

const command = process.argv[2] ?? "help";
const commandArgs = process.argv.slice(3);
const parsed = parseCommandArgs(commandArgs);
const databaseUrl = getDatabaseUrl();

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
  const classification = classificationFor(
    operation,
    operation === "reset" || operation === "seed",
  );
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
  const classification = requireSafeTarget("migrate");
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

async function check(): Promise<void> {
  const classification = requireSafeTarget("check");
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
    const migrationsMatch =
      state.applied.length === state.expected.length &&
      state.applied.every(
        (migration, index) =>
          migration === state.expected[index] &&
          state.appliedChecksums[migration] ===
            state.expectedChecksums[migration],
      );
    if (!schemaExists || !migrationsMatch) {
      emit({
        status: "failed",
        operation: "check",
        profile: classification.profile,
        schemaExists,
        migrationsMatch,
      });
      process.exitCode = 1;
      return;
    }
    emit({
      status: "ok",
      operation: "check",
      profile: classification.profile,
      schemaExists,
      migrationCount: state.applied.length,
      migrationOrder: state.applied,
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function reset(): Promise<void> {
  const classification = requireSafeTarget("reset");
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

async function seed(): Promise<void> {
  const classification = requireSafeTarget("seed");
  const options = previewSeedOptions(classification.profile);
  const sql = createSqlClient(databaseUrl);
  try {
    const state = await migrationState(sql);
    if (state.applied.length !== state.expected.length) {
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
  if (command === "migrate") return migrate();
  if (command === "check") return check();
  if (command === "reset") return reset();
  if (command === "seed") return seed();
  emit({
    status: "failed",
    operation: command,
    code: "UNKNOWN_DATABASE_COMMAND",
  });
  process.exitCode = 2;
}

main().catch(() => {
  if (process.exitCode !== 2) {
    emit({
      status: "failed",
      operation: command,
      code: "DATABASE_OPERATION_FAILED",
      message: "Database operation failed",
    });
    process.exitCode = 1;
  }
});
