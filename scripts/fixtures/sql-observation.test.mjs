import { createRequire } from "node:module";
import { afterAll, beforeAll, test } from "vitest";

const postgres = createRequire(
  new URL("../../apps/api/package.json", import.meta.url),
)("postgres");
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
beforeAll(async () => {
  await sql`CREATE TEMP TABLE observation_parent(id integer PRIMARY KEY)`;
  await sql`CREATE TEMP TABLE observation_child(parent integer REFERENCES observation_parent(id))`;
  await sql`INSERT INTO observation_child VALUES(1)`;
});
afterAll(async () => {
  await sql.end();
});
test("skipped after real SQLSTATE23503", () => {});
