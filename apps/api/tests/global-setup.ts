import { createSqlClient } from "../src/db/client.js";
import { resetAndMigrate } from "../src/db/migrations.js";
import { requireTestWorld } from "../src/db/test-world.js";

export const TEST_DATABASE_URL = requireTestWorld();
export default async function setup(): Promise<void> {
  const sql = createSqlClient(TEST_DATABASE_URL);
  try {
    await resetAndMigrate(sql);
  } finally {
    await sql.end({ timeout: 5 });
  }
}
