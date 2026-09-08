import { randomUUID } from "node:crypto";
import postgres, { type Sql } from "postgres";

const prefix = "dd_tasks_foundation_test_";
export function requireTestWorld(env = process.env): string {
  const token = env.DD_TASKS_TEST_WORLD;
  if (!token || !/^[a-f0-9]{32}$/.test(token) || !env.DATABASE_URL)
    throw new Error(
      "Run database tests through the project pnpm test launcher",
    );
  const url = new URL(env.DATABASE_URL);
  if (
    url.pathname !== `/${prefix}${token}` ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)
  )
    throw new Error("Test database does not belong to this invocation");
  return env.DATABASE_URL;
}

export async function assertTestWorld(
  sql: Sql<Record<string, unknown>>,
): Promise<void> {
  const rows = await sql<{ name: string; owner: string | null }[]>`
    SELECT current_database() AS name,
      shobj_description(oid, 'pg_database') AS owner
    FROM pg_database WHERE datname = current_database()
  `;
  if (!rows[0]?.name.startsWith(prefix)) return;
  const url = new URL(requireTestWorld());
  if (
    rows[0].name !== url.pathname.slice(1) ||
    rows[0].owner !== `dd-tasks:${process.env.DD_TASKS_TEST_WORLD}`
  )
    throw new Error("Test-world ownership is not confirmed; mutation refused");
}

export async function createTestWorld() {
  const token = randomUUID().replaceAll("-", "");
  const url = new URL(
    process.env.DD_TASKS_TEST_ADMIN_URL ??
      "postgresql://dd_tasks:dd_tasks_local@127.0.0.1:55433/postgres",
  );
  if (
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    url.pathname !== "/postgres" ||
    url.search ||
    url.hash
  )
    throw new Error("Test-world admin must be a loopback postgres database");
  const name = `${prefix}${token}`,
    admin = postgres(url.toString(), { max: 1 });
  try {
    // Never reuse an existing name, even if another invocation supplied it.
    await admin.unsafe(`CREATE DATABASE "${name}"`);
    await admin.unsafe(`COMMENT ON DATABASE "${name}" IS 'dd-tasks:${token}'`);
  } finally {
    await admin.end({ timeout: 5 });
  }
  url.pathname = `/${name}`;
  return {
    token,
    name,
    url: url.toString(),
    async drop() {
      const target = postgres(url.toString(), { max: 1 });
      try {
        const rows = await target<
          { owner: string | null }[]
        >`SELECT shobj_description(oid, 'pg_database') AS owner FROM pg_database WHERE datname = current_database()`;
        if (rows[0]?.owner !== `dd-tasks:${token}`)
          throw new Error("Foreign test-world ownership; drop refused");
      } finally {
        await target.end({ timeout: 5 });
      }
      const adminUrl = new URL(url);
      adminUrl.pathname = "/postgres";
      const cleanup = postgres(adminUrl.toString(), { max: 1 });
      try {
        await cleanup.unsafe(`DROP DATABASE "${name}" WITH (FORCE)`);
      } finally {
        await cleanup.end({ timeout: 5 });
      }
    },
  };
}
