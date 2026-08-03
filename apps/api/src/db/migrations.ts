import { createHash } from "node:crypto";
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
      checksum text,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`ALTER TABLE foundation_migrations ADD COLUMN IF NOT EXISTS checksum text`;

  const appliedNow: string[] = [];
  await sql.begin(async (transaction) => {
    await transaction`SELECT pg_advisory_xact_lock(42420302)`;
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
  });

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
