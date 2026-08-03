import { createSqlClient, getDatabaseUrl } from "./client.js";
import { resetProductData, seedDemoData } from "./fixtures.js";
import { applyMigrations, migrationState } from "./migrations.js";
import { classifyResetTarget, parseCommandArgs } from "./target-guard.js";

const command = process.argv[2] ?? "help";
const commandArgs = process.argv.slice(3);
const { runId, target } = parseCommandArgs(commandArgs);
const databaseUrl = getDatabaseUrl();

function emit(value: Record<string, unknown>): void {
  console.log(JSON.stringify(value));
}

async function migrate(): Promise<void> {
  const sql = createSqlClient(databaseUrl);
  try {
    const applied = await applyMigrations(sql);
    emit({ status: "ok", operation: "migrate", applied });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function check(): Promise<void> {
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
        (migration, index) => migration === state.expected[index],
      );
    if (!schemaExists || !migrationsMatch) {
      emit({
        status: "failed",
        operation: "check",
        schemaExists,
        migrationsMatch,
      });
      process.exitCode = 1;
      return;
    }
    emit({
      status: "ok",
      operation: "check",
      schemaExists,
      migrationCount: state.applied.length,
      migrationOrder: state.applied,
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function reset(): Promise<void> {
  const classification = classifyResetTarget({
    databaseUrl,
    target: target ?? undefined,
  });
  if (!classification.safe) {
    emit({
      status: "rejected",
      operation: "reset",
      code: "RESET_TARGET_REJECTED",
      target: classification.target,
      hostClass: classification.hostClass,
      databaseName: classification.databaseName,
      reason: classification.reason,
      mutated: false,
    });
    process.exitCode = 2;
    return;
  }

  const sql = createSqlClient(databaseUrl);
  try {
    await sql`DROP TABLE IF EXISTS tasks, projects, memberships, workspaces, sessions, accounts CASCADE`;
    await sql`DROP TYPE IF EXISTS membership_role CASCADE`;
    await sql`DROP TABLE IF EXISTS foundation_metadata CASCADE`;
    await sql`DROP TABLE IF EXISTS foundation_migrations CASCADE`;
    const applied = await applyMigrations(sql);
    emit({
      status: "ok",
      operation: "reset",
      target: classification.target,
      hostClass: classification.hostClass,
      databaseName: classification.databaseName,
      applied,
      runId,
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function seed(): Promise<void> {
  const classification = classifyResetTarget({
    databaseUrl,
    target: target ?? undefined,
  });
  if (!classification.safe) {
    emit({
      status: "rejected",
      operation: "seed",
      code: "SEED_TARGET_REJECTED",
      target: classification.target,
      hostClass: classification.hostClass,
      databaseName: classification.databaseName,
      reason: classification.reason,
      mutated: false,
    });
    process.exitCode = 2;
    return;
  }

  const sql = createSqlClient(databaseUrl);
  try {
    const state = await migrationState(sql);
    if (state.applied.length !== state.expected.length) {
      emit({ status: "failed", operation: "seed", code: "SCHEMA_NOT_READY" });
      process.exitCode = 1;
      return;
    }
    await resetProductData(sql);
    const seed = await seedDemoData(sql);
    emit({
      status: "ok",
      operation: "seed",
      target: classification.target,
      hostClass: classification.hostClass,
      databaseName: classification.databaseName,
      seed,
      mutated: true,
      runId,
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function main(): Promise<void> {
  if (command === "migrate") {
    await migrate();
    return;
  }
  if (command === "check") {
    await check();
    return;
  }
  if (command === "reset") {
    await reset();
    return;
  }
  if (command === "seed") {
    await seed();
    return;
  }
  emit({
    status: "failed",
    operation: command,
    code: "UNKNOWN_DATABASE_COMMAND",
  });
  process.exitCode = 2;
}

main().catch(() => {
  emit({
    status: "failed",
    operation: command,
    code: "DATABASE_OPERATION_FAILED",
    message: "Database operation failed",
  });
  process.exitCode = 1;
});
