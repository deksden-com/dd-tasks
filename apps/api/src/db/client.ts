import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema.js";

export const DEFAULT_LOCAL_DATABASE_URL =
  "postgresql://dd_tasks:dd_tasks_local@127.0.0.1:55433/dd_tasks_foundation_local";

export function getDatabaseUrl(value = process.env.DATABASE_URL): string {
  return value ?? DEFAULT_LOCAL_DATABASE_URL;
}

/**
 * dd-flow supplies an opaque checkout-derived suffix while it runs local CODE
 * checks. This isolates mutable local/test state without changing normal
 * developer or preview targets.
 */
export function getFlowScopedLocalDatabaseUrl(
  value = getDatabaseUrl(),
  runId: string | null = null,
  suffix = process.env.DD_FLOW_LOCAL_DATABASE_SUFFIX,
): string {
  if (process.env.DD_TASKS_TEST_WORLD) return value;
  if (!runId || !suffix || !/^[a-f0-9]{8,64}$/.test(suffix)) return value;
  const url = new URL(value);
  const name = decodeURIComponent(url.pathname.slice(1));
  if (
    !/^dd_tasks_foundation_(?:local|test)(?:_[a-z0-9][a-z0-9_-]*)?$/.test(name)
  )
    return value;
  url.pathname = `/${name}_${suffix}`;
  return url.toString();
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
