import postgres from "postgres";
import { createSqlClient } from "../src/db/client.js";
import { resetAndMigrate } from "../src/db/migrations.js";

export const TEST_DATABASE_URL =
  "postgresql://dd_tasks:dd_tasks_local@127.0.0.1:55433/dd_tasks_foundation_test_vitest";

export default async function setup(): Promise<void> {
  const admin = postgres(
    "postgresql://dd_tasks:dd_tasks_local@127.0.0.1:55433/postgres",
    { max: 1 },
  );
  try {
    const exists = await admin<{ present: number }[]>`
      SELECT 1 AS present FROM pg_database WHERE datname = 'dd_tasks_foundation_test_vitest'
    `;
    if (!exists[0])
      await admin.unsafe('CREATE DATABASE "dd_tasks_foundation_test_vitest"');
  } finally {
    await admin.end({ timeout: 5 });
  }

  const sql = createSqlClient(TEST_DATABASE_URL);
  try {
    await resetAndMigrate(sql);
  } finally {
    await sql.end({ timeout: 5 });
  }
}
