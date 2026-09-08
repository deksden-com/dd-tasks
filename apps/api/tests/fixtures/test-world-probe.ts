import postgres from "postgres";
import { requireTestWorld } from "../../src/db/test-world.js";

const sql = postgres(requireTestWorld(), { max: 1 });
await sql`CREATE TABLE isolation_probe (value text)`;
await sql`INSERT INTO isolation_probe VALUES (${process.env.PROBE_MARKER ?? "probe"})`;
console.log(
  JSON.stringify({
    ready: true,
    token: process.env.DD_TASKS_TEST_WORLD,
    pid: process.ppid,
  }),
);
const stop = async () => {
  await sql.end();
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
setInterval(() => {}, 1000);
