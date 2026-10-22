import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  retainedSetupFailure,
  retainMigrationFailure,
  sha256,
  toolFailure,
} from "./source-diagnostic.mjs";
import { binding, evidence, validReport } from "./test-observation.mjs";
import { biomeFailures } from "./tool-diagnostic-runner.mjs";
import Reporter from "./vitest-observation.mjs";

const root = path.resolve(import.meta.dirname, "..");
test("invalid setup sidecar cannot suppress an unrelated native runner error", () => {
  const dir = mkdtempSync(path.join(root, ".diagnostic-test-"));
  const prior = process.env.DD_TASKS_SETUP_FAILURE_PATH;
  const report = process.env.DD_TASKS_RUNNER_REPORT;
  try {
    process.env.DD_TASKS_SETUP_FAILURE_PATH = path.join(
      dir,
      "invalid-setup.json",
    );
    delete process.env.DD_TASKS_RUNNER_REPORT;
    writeFileSync(process.env.DD_TASKS_SETUP_FAILURE_PATH, "not JSON");
    const reporter = new Reporter();
    reporter.onTestRunEnd(
      [],
      [{ name: "NativeError", message: "original native error" }],
      "failed",
    );
    assert.ok(
      reporter.failures.some((item) => item.code === "invalid_setup_evidence"),
    );
    assert.ok(
      reporter.failures.some(
        (item) => item.message === "original native error",
      ),
    );
  } finally {
    if (prior === undefined) delete process.env.DD_TASKS_SETUP_FAILURE_PATH;
    else process.env.DD_TASKS_SETUP_FAILURE_PATH = prior;
    if (report === undefined) delete process.env.DD_TASKS_RUNNER_REPORT;
    else process.env.DD_TASKS_RUNNER_REPORT = report;
    rmSync(dir, { recursive: true, force: true });
  }
});
test("native candidate diagnostics bind content, missing declaration and migration pre-ready identity", () => {
  const dir = mkdtempSync(path.join(root, ".diagnostic-test-"));
  const saved = { ...process.env };
  try {
    process.env.DD_FLOW_CHECK_INVOCATION_ID = "producer-test";
    process.env.DD_FLOW_CHECK_COMMAND = "producer-test";
    process.env.DD_TASKS_RUNNER_REPORT = path.join(dir, "report.json");
    Object.assign(process.env, {
      DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: path.join(dir, "report.json"),
      DD_TASKS_SETUP_FAILURE_PATH: path.join(dir, "setup.json"),
      DD_TASKS_TEST_WORLD_RECEIPT: path.join(dir, "world.json"),
      DD_TASKS_TEST_WORLD: "a".repeat(32),
    });
    const file = path.join(dir, "migration.sql"),
      bytes = "SELECT broken;";
    writeFileSync(file, bytes);
    const step = { id: "format", ordinal: 0, command_sha256: "b".repeat(64) };
    const native = biomeFailures(
      {
        diagnostics: [
          {
            severity: "error",
            category: "format",
            location: { path: { file } },
          },
        ],
      },
      "2.0",
      step,
    )[0];
    assert.equal(native.repair_evidence.file_sha256, sha256(bytes));
    assert.deepEqual(
      JSON.parse(
        readFileSync(path.join(dir, native.diagnostic_artifact.relative_path)),
      ).binding,
      binding(),
    );
    const missing = toolFailure({
      tool: { name: "docs", version: "1" },
      step,
      diagnostic_code: "required_path_missing",
      file: path.join(dir, "absent.md"),
      message: "missing",
      missing: true,
      declaration: { file, sha256: sha256(bytes) },
    });
    assert.equal(missing.repair_evidence.path_state, "missing");
    assert.equal(missing.repair_evidence.file_sha256, null);
    writeFileSync(
      process.env.DD_TASKS_TEST_WORLD_RECEIPT,
      JSON.stringify({
        invocation_id: binding().invocation_id,
        world_id: process.env.DD_TASKS_TEST_WORLD,
        role: "owner",
        migrations_sha256: "c".repeat(64),
        ready: false,
        setup_completed: false,
      }),
    );
    retainMigrationFailure(
      { code: "42601", message: "secret SQL" },
      file,
      sha256(bytes),
    );
    const migration = retainedSetupFailure();
    assert.equal(migration.repair_evidence.rule, "candidate_migration_sql");
    assert.equal(migration.repair_evidence.world.setup_completed, false);
    assert.ok(!JSON.stringify(migration).includes("secret SQL"));
    evidence(
      { name: "fixture", version: "1" },
      { passed: 0, failed: 0, skipped: 0 },
      [native, missing, migration],
    );
    assert.equal(
      validReport(
        JSON.parse(
          readFileSync(process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH),
        ),
      ),
      true,
    );
    retainMigrationFailure({ code: "08006" }, file, sha256(bytes));
    assert.equal(retainedSetupFailure().origin, "unknown");
    assert.equal(retainedSetupFailure().repair_evidence, undefined);
    assert.throws(
      () =>
        toolFailure({
          tool: { name: "docs", version: "1" },
          step,
          diagnostic_code: "missing",
          file,
          missing: true,
        }),
      /exists/,
    );
  } finally {
    for (const key of Object.keys(process.env))
      if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
    rmSync(dir, { recursive: true, force: true });
  }
});
