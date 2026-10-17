import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { hasTestWatchdog } from "./test-observation.mjs";

const root = path.resolve(import.meta.dirname, "..");
const postgres = createRequire(
  new URL("../apps/api/package.json", import.meta.url),
)("postgres");
async function verify(env, extraArgs = []) {
  const directory = mkdtempSync(path.join(os.tmpdir(), "dd-db-verify-"));
  const destination = path.join(directory, "evidence.json");
  const child = spawn(
    "pnpm",
    [
      "db:verify",
      "--",
      "--target",
      "local",
      "--run-id",
      "RUN-091-regression",
      ...extraArgs,
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        DD_TASKS_TEST_WORLD: "",
        DD_FLOW_CHECK_INVOCATION_ID: "db-verify-regression",
        DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: destination,
        ...env,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let stdout = "",
    stderr = "";
  child.stdout.on("data", (bytes) => {
    stdout += bytes;
  });
  child.stderr.on("data", (bytes) => {
    stderr += bytes;
  });
  try {
    const code = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", resolve);
    });
    return {
      code,
      report: JSON.parse(readFileSync(destination, "utf8")),
      stdout,
      stderr,
    };
  } finally {
    rmSync(directory, { recursive: true });
  }
}
test("DB verify rejects unscoped developer target and redacts malformed/transport errors", async () => {
  const result = await verify({
    DD_FLOW_LOCAL_DATABASE_SUFFIX: "",
    DATABASE_URL:
      "postgresql://private:private@127.0.0.1:1/dd_tasks_foundation_local",
  });
  assert.equal(result.code, 1);
  assert.equal(result.report.completed, false);
  assert.equal(result.report.failures[0].native_code, "TARGET_REJECTED");
  assert.equal(result.report.failures[0].category, "tooling");
  assert.equal(JSON.stringify(result.report).includes("private"), false);
  const malformed = await verify({
    DD_FLOW_LOCAL_DATABASE_SUFFIX: "a".repeat(32),
    DATABASE_URL: "invalid",
  });
  assert.equal(malformed.report.completed, false);
  assert.equal(malformed.report.failures[0].category, "tooling");
  const transport = await verify({
    DD_FLOW_LOCAL_DATABASE_SUFFIX: "b".repeat(32),
    DATABASE_URL:
      "postgresql://private:private@127.0.0.1:1/dd_tasks_foundation_local",
  });
  assert.equal(transport.report.completed, false);
  assert.equal(
    transport.report.failures[0].classification_reason,
    "database_prepare",
  );
  assert.equal(JSON.stringify(transport.report).includes("private"), false);
  assert.equal(hasTestWatchdog("pnpm", ["db:verify"], root), true);
});
test("fresh scoped verify prepares then inspects, repeat verifies, distinct suffixes stay isolated", {
  skip: !process.env.DD_TASKS_TEST_ADMIN_URL,
}, async () => {
  const adminUrl = new URL(process.env.DD_TASKS_TEST_ADMIN_URL);
  assert.ok(["127.0.0.1", "localhost"].includes(adminUrl.hostname));
  adminUrl.pathname = "/postgres";
  const admin = postgres(adminUrl.toString(), { max: 1 });
  const base = new URL(adminUrl);
  base.pathname = "/dd_tasks_foundation_local";
  const suffixes = [
    randomBytes(16).toString("hex"),
    randomBytes(16).toString("hex"),
  ];
  const fixtures = mkdtempSync(path.join(os.tmpdir(), "dd-db-migrations-"));
  try {
    for (const suffix of suffixes) {
      const env = {
        DATABASE_URL: base.toString(),
        DD_FLOW_LOCAL_DATABASE_SUFFIX: suffix,
      };
      for (let attempt = 0; attempt < 2; attempt++) {
        const result = await verify(env);
        assert.equal(result.code, 0, result.stdout + result.stderr);
        assert.equal(result.report.completed, true);
        assert.deepEqual(result.report.counts, {
          passed: 1,
          failed: 0,
          skipped: 0,
        });
        assert.deepEqual(result.report.failures, []);
      }
    }
    const names = suffixes.map(
      (suffix) => `dd_tasks_foundation_local_${suffix}`,
    );
    const rows =
      await admin`SELECT datname FROM pg_database WHERE datname = ANY(${names})`;
    assert.equal(rows.length, 2);
    writeFileSync(path.join(fixtures, "0000_invalid.sql"), "THIS IS NOT SQL;");
    const failed = await verify({
      DATABASE_URL: base.toString(),
      DD_FLOW_LOCAL_DATABASE_SUFFIX: suffixes[0],
      MIGRATIONS_DIR: fixtures,
    });
    assert.equal(failed.code, 1);
    assert.equal(failed.report.completed, false);
    assert.equal(failed.report.failures[0].native_code, "42601");
    assert.equal(
      failed.report.failures[0].classification_reason,
      "database_migrate",
    );
    assert.equal(failed.stdout.includes('"operation":"check"'), false);
  } finally {
    for (const suffix of suffixes)
      await admin.unsafe(
        `DROP DATABASE IF EXISTS "dd_tasks_foundation_local_${suffix}" WITH (FORCE)`,
      );
    await admin.end();
    rmSync(fixtures, { recursive: true });
  }
});
