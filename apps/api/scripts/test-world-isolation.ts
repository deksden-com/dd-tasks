import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import postgres from "postgres";

const require = createRequire(import.meta.url);
const tsx = require.resolve("tsx/cli");
const api = path.resolve(import.meta.dirname, "..");
const root = path.resolve(api, "../..");
const temp = await mkdtemp(path.join(os.tmpdir(), "dd-tasks-isolation-"));
const adminUrl = new URL(
  process.env.DD_TASKS_TEST_ADMIN_URL ??
    "postgresql://dd_tasks:dd_tasks_local@127.0.0.1:55433/postgres",
);
const admin = postgres(adminUrl.toString(), { max: 1 });
const children: ReturnType<typeof spawn>[] = [];
async function launch(marker: string, checkout = root) {
  const migrations = path.join(temp, marker);
  await mkdir(migrations);
  await writeFile(path.join(migrations, "0000.sql"), `-- ${marker}\n`);
  const child = spawn(
    process.execPath,
    [
      tsx,
      "scripts/test-world.ts",
      "integration",
      process.execPath,
      tsx,
      "tests/fixtures/test-world-probe.ts",
    ],
    {
      cwd: path.join(checkout, "apps/api"),
      env: { ...process.env, MIGRATIONS_DIR: migrations, PROBE_MARKER: marker },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  children.push(child);
  let output = "",
    errors = "";
  child.stderr?.on("data", (data) => {
    errors += String(data);
  });
  const ready = await new Promise<{ token: string }>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`probe timeout: ${errors}`)),
      20000,
    );
    child.once("exit", () => {
      clearTimeout(timer);
      reject(new Error(`probe exited: ${errors}`));
    });
    child.stdout?.on("data", (data) => {
      output += String(data);
      const line = output
        .split("\n")
        .find((line) => line.startsWith('{"ready":'));
      if (line) {
        clearTimeout(timer);
        resolve(JSON.parse(line));
      }
    });
  });
  const receiptPath = path.join(
    checkout,
    ".test-worlds",
    ready.token,
    "receipt.json",
  );
  const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
  return { child, token: ready.token, receipt, receiptPath };
}
try {
  const [first, second] = await Promise.all([
    launch("first-migration"),
    launch("second-migration", process.env.DD_TASKS_SECOND_CHECKOUT ?? root),
  ]);
  assert.notEqual(first.token, second.token);
  assert.notEqual(
    first.receipt.migrations_sha256,
    second.receipt.migrations_sha256,
  );
  const exited = once(first.child, "exit");
  first.child.kill("SIGTERM");
  await exited;
  const rows = await admin<
    { datname: string }[]
  >`SELECT datname FROM pg_database WHERE datname IN (${first.receipt.database}, ${second.receipt.database})`;
  assert.deepEqual(
    rows.map((row) => row.datname),
    [second.receipt.database],
  );
  const survivorUrl = new URL(adminUrl);
  survivorUrl.pathname = `/${second.receipt.database}`;
  const survivor = postgres(survivorUrl.toString(), { max: 1 });
  try {
    assert.equal(
      (await survivor`SELECT value FROM isolation_probe`)[0].value,
      "second-migration",
    );
  } finally {
    await survivor.end();
  }
  assert.equal(
    JSON.parse(await readFile(first.receiptPath, "utf8")).state,
    "cleaned",
  );
  console.log(
    "PASS concurrent worlds have distinct migration digests; cancelling one preserves the other's database and data",
  );
} finally {
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill("SIGTERM");
      await exited;
    }
  }
  await admin.end();
  await rm(temp, { recursive: true, force: true });
}
