import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
test("native PostgreSQL selected migration failure survives global setup and cleanup", {
  skip: !process.env.DD_TASKS_TEST_ADMIN_URL,
}, async () => {
  const directory = mkdtempSync(path.join(root, ".migration-test-"));
  const foreign = mkdtempSync(path.join(os.tmpdir(), "foreign-migration-"));
  try {
    writeFileSync(
      path.join(directory, "probe.test.mjs"),
      "import {test,expect} from 'vitest'; test('body reached',()=>expect(true).toBe(true));",
    );
    const config = path.join(directory, "vitest.config.mjs");
    writeFileSync(
      config,
      `import {managedVitest} from ${JSON.stringify(pathToFileURL(path.join(root, "scripts/test-observation.mjs")).href)}; export default {test:{...managedVitest(),include:[${JSON.stringify(path.join(directory, "probe.test.mjs"))}],globalSetup:[${JSON.stringify(path.join(root, "apps/api/tests/global-setup.ts"))}],fileParallelism:false}};`,
    );
    const run = (migrations, id, extraEnv = {}) => {
      const reportPath = path.join(directory, `${id}.json`);
      const child = spawnSync(
        process.execPath,
        [
          "scripts/test-runner.mjs",
          "pnpm",
          "--filter",
          "@dd-tasks/api",
          "exec",
          "tsx",
          "scripts/test-world.ts",
          "integration",
          process.execPath,
          path.join(root, "node_modules/vitest/vitest.mjs"),
          "run",
          "--config",
          config,
        ],
        {
          cwd: root,
          encoding: "utf8",
          env: {
            ...process.env,
            MIGRATIONS_DIR: migrations,
            DD_FLOW_CHECK_INVOCATION_ID: id,
            DD_FLOW_CHECK_COMMAND: "native migration probe",
            DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: reportPath,
            ...extraEnv,
          },
        },
      );
      return {
        child,
        report: JSON.parse(readFileSync(reportPath)),
        reportPath,
      };
    };
    const badSql = "DO $$ BEGIN NULL END $$;";
    writeFileSync(path.join(directory, "001.sql"), badSql);
    const bad = run(directory, "native-bad-migration");
    assert.equal(bad.child.status, 1, bad.child.stderr);
    const failure = bad.report.failures.find(
      (item) => item.repair_evidence?.rule === "candidate_migration_sql",
    );
    assert.ok(failure, JSON.stringify(bad.report) + bad.child.stderr);
    assert.equal(failure.native_code, "42601");
    assert.equal(bad.report.completed, true, JSON.stringify(bad.report));
    assert.ok(
      !bad.report.failures.some((item) => item.code === "cleanup_unconfirmed"),
    );
    if (process.env.DD_TASKS_ENGINE_EVIDENCE_MODULE) {
      const engine = await import(
        pathToFileURL(process.env.DD_TASKS_ENGINE_EVIDENCE_MODULE).href
      );
      const read = engine.readRunnerEvidence(
        directory,
        {
          schema_id: "dd-flow/check-runner-evidence@1",
          path: path.basename(bad.reportPath),
        },
        bad.report.binding,
      );
      assert.ok(read);
      const disposition = engine.checkRepairDisposition({
        status: "failed",
        exit_code: 1,
        runner_evidence: read,
        candidate_files: engine.candidateFailureFiles(read, root),
        candidate_absences: engine.candidateFailureAbsences(read, root),
      });
      assert.equal(
        disposition.kind ?? disposition,
        "source_repair",
        JSON.stringify(disposition),
      );
    }
    writeFileSync(
      path.join(directory, "001.sql"),
      "CREATE TABLE native_probe (id integer);",
    );
    const good = run(directory, "native-good-migration");
    assert.equal(good.child.status, 0, good.child.stderr);
    assert.equal(good.report.counts.passed, 1);
    writeFileSync(path.join(foreign, "001.sql"), badSql);
    const outside = run(foreign, "native-foreign-migration");
    assert.equal(outside.child.status, 1);
    assert.ok(outside.report.failures.every((item) => !item.repair_evidence));
    const deniedUrl = new URL(process.env.DD_TASKS_TEST_ADMIN_URL);
    deniedUrl.password = "incorrect-disposable-test-password";
    const denied = run(directory, "native-auth-migration", {
      DD_TASKS_TEST_ADMIN_URL: deniedUrl.toString(),
    });
    assert.equal(denied.child.status, 1);
    assert.ok(denied.report.failures.every((item) => !item.repair_evidence));
  } finally {
    rmSync(directory, { recursive: true, force: true });
    rmSync(foreign, { recursive: true, force: true });
  }
});
