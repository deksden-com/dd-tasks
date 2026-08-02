import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema.js";

export const DEFAULT_LOCAL_DATABASE_URL =
  "postgresql://dd_tasks:dd_tasks_local@127.0.0.1:55433/dd_tasks_foundation_local";

export function getDatabaseUrl(value = process.env.DATABASE_URL): string {
  return value ?? DEFAULT_LOCAL_DATABASE_URL;
}

export function createSqlClient(
  databaseUrl = getDatabaseUrl(),
): Sql<Record<string, unknown>> {
  return postgres(databaseUrl, { max: 1 });
}

export function createDatabase(
  client: Sql<Record<string, unknown>> = createSqlClient(),
) {
  return drizzle(client, { schema });
}
