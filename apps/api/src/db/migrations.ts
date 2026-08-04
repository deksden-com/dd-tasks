import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Sql, TransactionSql } from "postgres";

const migrationsDirectory = process.env.MIGRATIONS_DIR
  ? { pathname: resolve(process.env.MIGRATIONS_DIR) }
  : new URL("../../drizzle/", import.meta.url);

export async function listMigrationFiles(): Promise<string[]> {
  const directory = migrationsDirectory.pathname;
  const files = await readdir(directory);
  return files.filter((file) => file.endsWith(".sql")).sort();
}

export async function applyMigrations(
  sql: Sql<Record<string, unknown>>,
): Promise<string[]> {
  return sql.begin(async (transaction) => {
    await transaction`SELECT pg_advisory_xact_lock(42420302)`;
    return applyMigrationsInTransaction(transaction);
  });
}

export async function resetAndMigrate(
  sql: Sql<Record<string, unknown>>,
): Promise<string[]> {
  return sql.begin(async (transaction) => {
    await transaction`SELECT pg_advisory_xact_lock(42420302)`;
    await transaction`DROP TABLE IF EXISTS tasks, projects, memberships, workspaces, sessions, accounts CASCADE`;
    await transaction`DROP TYPE IF EXISTS membership_role CASCADE`;
    await transaction`DROP TABLE IF EXISTS foundation_metadata CASCADE`;
    await transaction`DROP TABLE IF EXISTS foundation_migrations CASCADE`;
    return applyMigrationsInTransaction(transaction);
  });
}

async function applyMigrationsInTransaction(
  transaction: TransactionSql<Record<string, unknown>>,
): Promise<string[]> {
  await transaction`
    CREATE TABLE IF NOT EXISTS foundation_migrations (
      id text PRIMARY KEY,
      checksum text,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await transaction`ALTER TABLE foundation_migrations ADD COLUMN IF NOT EXISTS checksum text`;

  const appliedNow: string[] = [];
  const appliedRows = await transaction<
    { id: string; checksum: string | null }[]
  >`
    SELECT id, checksum FROM foundation_migrations ORDER BY id
  `;
  const applied = new Map(appliedRows.map((row) => [row.id, row.checksum]));

  for (const file of await listMigrationFiles()) {
    const content = await readFile(
      join(migrationsDirectory.pathname, file),
      "utf8",
    );
    const checksum = createHash("sha256").update(content).digest("hex");
    if (applied.has(file)) {
      const existingChecksum = applied.get(file);
      if (existingChecksum && existingChecksum !== checksum) {
        throw new Error(`Applied migration changed: ${file}`);
      }
      if (!existingChecksum) {
        await transaction`
          UPDATE foundation_migrations SET checksum = ${checksum} WHERE id = ${file}
        `;
      }
      continue;
    }
    await transaction.unsafe(content);
    await transaction`
      INSERT INTO foundation_migrations (id, checksum) VALUES (${file}, ${checksum})
    `;
    appliedNow.push(file);
  }

  return appliedNow;
}

export async function migrationState(
  sql: Sql<Record<string, unknown>>,
): Promise<{
  applied: string[];
  expected: string[];
  appliedChecksums: Record<string, string | null>;
  expectedChecksums: Record<string, string>;
}> {
  const expected = await listMigrationFiles();
  const expectedChecksums: Record<string, string> = {};
  for (const file of expected) {
    expectedChecksums[file] = createHash("sha256")
      .update(await readFile(join(migrationsDirectory.pathname, file), "utf8"))
      .digest("hex");
  }
  const rows = await sql<{ id: string; checksum: string | null }[]>`
    SELECT id, checksum FROM foundation_migrations ORDER BY id
  `;
  const appliedChecksums = Object.fromEntries(
    rows.map((row) => [row.id, row.checksum]),
  );
  return {
    applied: rows.map((row) => row.id),
    expected,
    appliedChecksums,
    expectedChecksums,
  };
}
