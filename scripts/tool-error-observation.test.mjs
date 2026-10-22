import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
test("value checker retains native ENOENT as tooling rather than invalid runner evidence", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "tool-io-"));
  try {
    const reportPath = path.join(directory, "report.json");
    const child = spawnSync(
      process.execPath,
      [
        "scripts/test-runner.mjs",
        process.execPath,
        "scripts/value-absence-check.mjs",
        path.join(directory, "missing.md"),
      ],
      {
        cwd: root,
        encoding: "utf8",
        env: {
          ...process.env,
          DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: reportPath,
          DD_FLOW_CHECK_INVOCATION_ID: "tool-io",
          DD_FLOW_CHECK_COMMAND: "value-absence",
        },
      },
    );
    assert.equal(child.status, 1);
    const report = JSON.parse(readFileSync(reportPath));
    assert.equal(report.completed, true);
    assert.ok(
      report.failures.some(
        (item) => item.code === "ENOENT" && item.native_code === "ENOENT",
      ),
    );
    assert.ok(
      report.failures.every(
        (item) => item.category === "tooling" && !item.repair_evidence,
      ),
    );
    if (process.env.DD_TASKS_ENGINE_EVIDENCE_MODULE) {
      const engine = await import(
        pathToFileURL(process.env.DD_TASKS_ENGINE_EVIDENCE_MODULE).href
      );
      const accepted = engine.readRunnerEvidence(
        directory,
        { schema_id: "dd-flow/check-runner-evidence@1", path: "report.json" },
        report.binding,
      );
      assert.ok(accepted);
      assert.equal(
        engine.checkRepairDisposition({
          status: "failed",
          exit_code: 1,
          runner_evidence: accepted,
        }),
        "tooling_blocker",
      );
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("fatal native monitor preserves prior cause and never replaces the original on publication failure", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "tool-monitor-"));
  const helper = pathToFileURL(
    path.join(root, "scripts/source-diagnostic.mjs"),
  ).href;
  const observation = pathToFileURL(
    path.join(root, "scripts/test-observation.mjs"),
  ).href;
  try {
    const file = path.join(directory, "report.json");
    const env = {
      ...process.env,
      DD_TASKS_RUNNER_REPORT: file,
      DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: file,
      DD_FLOW_CHECK_INVOCATION_ID: "monitor-test",
      DD_FLOW_CHECK_COMMAND: "monitor-test",
    };
    const source = `import {observeToolErrors} from ${JSON.stringify(helper)};import {evidence} from ${JSON.stringify(observation)};observeToolErrors({name:'docs',version:'1'});evidence({name:'docs',version:'1'},{passed:0,failed:0,skipped:0},[{category:'unclassified',code:'first_native_failure'}]);throw Object.assign(new Error('original fatal cause'),{code:'EACCES'});`;
    const child = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", source],
      { cwd: root, env, encoding: "utf8" },
    );
    assert.equal(child.status, 1);
    const report = JSON.parse(readFileSync(file));
    assert.deepEqual(
      report.failures.map((item) => item.code),
      ["first_native_failure", "EACCES"],
    );
    const blocked = path.join(directory, "blocked-parent");
    writeFileSync(blocked, "not a directory");
    const script = `import {observeToolErrors} from ${JSON.stringify(helper)};observeToolErrors({name:'docs',version:'1'});throw Object.assign(new Error('original fatal cause'),{code:'EACCES'});`;
    const retained = path.join(directory, "private-report.json");
    const artifactFailure = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", script],
      {
        cwd: root,
        env: {
          ...env,
          DD_TASKS_RUNNER_REPORT: retained,
          DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: path.join(blocked, "report.json"),
        },
        encoding: "utf8",
      },
    );
    assert.equal(artifactFailure.status, 1);
    assert.deepEqual(
      JSON.parse(readFileSync(retained)).failures.map((item) => item.code),
      ["EACCES", "diagnostic_capture_failed"],
    );
    const failing = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", script],
      {
        cwd: root,
        env: {
          ...env,
          DD_TASKS_RUNNER_REPORT: path.join(blocked, "report.json"),
          DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: path.join(blocked, "report.json"),
        },
        encoding: "utf8",
      },
    );
    assert.equal(failing.status, 1);
    assert.match(failing.stderr, /original fatal cause/);
    assert.match(failing.stderr, /evidence_publication_failed/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
