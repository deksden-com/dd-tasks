import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Sql } from "postgres";

const migrationsDirectory = new URL("../../drizzle/", import.meta.url);

export async function listMigrationFiles(): Promise<string[]> {
  const directory = migrationsDirectory.pathname;
  const files = await readdir(directory);
  return files.filter((file) => file.endsWith(".sql")).sort();
}

export async function applyMigrations(
  sql: Sql<Record<string, unknown>>,
): Promise<string[]> {
  await sql`
    CREATE TABLE IF NOT EXISTS foundation_migrations (
      id text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  const appliedRows = await sql<{ id: string }[]>`
    SELECT id FROM foundation_migrations ORDER BY id
  `;
  const applied = new Set(appliedRows.map((row) => row.id));
  const appliedNow: string[] = [];

  for (const file of await listMigrationFiles()) {
    if (applied.has(file)) {
      continue;
    }
    const content = await readFile(
      join(migrationsDirectory.pathname, file),
      "utf8",
    );
    await sql.unsafe(content);
    await sql`INSERT INTO foundation_migrations (id) VALUES (${file})`;
    appliedNow.push(file);
  }

  return appliedNow;
}

export async function migrationState(
  sql: Sql<Record<string, unknown>>,
): Promise<{
  applied: string[];
  expected: string[];
}> {
  const expected = await listMigrationFiles();
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM foundation_migrations ORDER BY id
  `;
  return { applied: rows.map((row) => row.id), expected };
}
