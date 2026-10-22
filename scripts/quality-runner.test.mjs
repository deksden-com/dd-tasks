import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { sha256 } from "./source-diagnostic.mjs";
import { validReport } from "./test-observation.mjs";

const root = path.resolve(import.meta.dirname, "..");
const observation = pathToFileURL(
  path.join(root, "scripts/test-observation.mjs"),
).href;
const runner = pathToFileURL(
  path.join(root, "scripts/quality-runner.mjs"),
).href;
for (const kind of ["incomplete", "signal", "zero-exit", "full-report"])
  test(`incomplete child observation remains unknown: ${kind}`, async () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), "quality-unknown-"));
    try {
      const reportPath = path.join(directory, "report.json");
      const signal = kind === "signal";
      const native = `import {evidence} from ${JSON.stringify(observation)};evidence({name:'fixture',version:'1'},{passed:0,failed:0,skipped:0},${kind === "zero-exit" ? "[]" : kind === "full-report" ? "Array.from({length:64},(_,index)=>({category:'unclassified',code:'original_child_failure',message:'retained original cause '+index}))" : "[{category:'unclassified',code:'original_child_failure',message:'retained original cause'}]"},${signal});${signal ? "process.kill(process.pid,'SIGTERM');" : `process.exitCode=${kind === "zero-exit" ? 0 : 1};`}`;
      const child = spawnSync(
        process.execPath,
        [
          "scripts/test-runner.mjs",
          process.execPath,
          "--input-type=module",
          "-e",
          `import {runQuality} from ${JSON.stringify(runner)};process.exitCode=await runQuality([{id:'first',argv:[process.execPath,'--input-type=module','-e',${JSON.stringify(native)}]},{id:'next',argv:[process.execPath,'-e','process.exit(0)']}]);`,
        ],
        {
          cwd: root,
          encoding: "utf8",
          env: {
            ...process.env,
            DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: reportPath,
            DD_FLOW_CHECK_INVOCATION_ID: "unknown-test",
            DD_FLOW_CHECK_COMMAND: "quality",
          },
        },
      );
      assert.equal(child.status, 1, child.stderr);
      const report = JSON.parse(readFileSync(reportPath));
      assert.equal(report.completed, false);
      assert.equal(report.observation_unknown, true);
      assert.equal(report.steps[1].state, "unreached");
      if (kind === "full-report") {
        assert.equal(report.failures.length, 64);
        assert.ok(report.failures.every((failure) => failure.child_evidence));
      }
      if (kind !== "zero-exit")
        assert.ok(
          report.failures.some(
            (item) => item.code === "original_child_failure",
          ),
        );
      if (signal)
        assert.ok(report.failures.some((item) => item.code === "child_signal"));
      if (process.env.DD_TASKS_ENGINE_EVIDENCE_MODULE) {
        const engine = await import(
          pathToFileURL(process.env.DD_TASKS_ENGINE_EVIDENCE_MODULE).href
        );
        const accepted = engine.readRunnerEvidence(
          directory,
          { schema_id: "dd-flow/check-runner-evidence@1", path: "report.json" },
          report.binding,
        );
        assert.ok(accepted, JSON.stringify(report));
        assert.equal(
          engine.checkRepairDisposition({
            status: "failed",
            exit_code: 1,
            runner_evidence: accepted,
          }),
          "settlement_required",
        );
        assert.ok(
          engine
            .runnerProofArtifacts(accepted)
            .includes(report.steps[0].report.relative_path),
        );
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
test("separate nested runner owners sum leaf counts exactly once", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "quality-leaf-"));
  try {
    const reportPath = path.join(directory, "report.json");
    const steps = [1, 2].map((passed, index) => ({
      id: `unit-${index}`,
      wrapped: true,
      argv: [
        process.execPath,
        path.join(root, "scripts/test-runner.mjs"),
        process.execPath,
        "--input-type=module",
        "-e",
        `import {evidence} from ${JSON.stringify(observation)};evidence({name:'fixture',version:'1'},{passed:${passed},failed:0,skipped:0},[]);`,
      ],
    }));
    const child = spawnSync(
      process.execPath,
      [
        "scripts/test-runner.mjs",
        process.execPath,
        "--input-type=module",
        "-e",
        `import {runQuality} from ${JSON.stringify(runner)};process.exitCode=await runQuality(${JSON.stringify(steps)});`,
      ],
      {
        cwd: root,
        encoding: "utf8",
        env: {
          ...process.env,
          DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: reportPath,
          DD_FLOW_CHECK_INVOCATION_ID: "leaf-test",
          DD_FLOW_CHECK_COMMAND: "unit",
        },
      },
    );
    assert.equal(child.status, 0, child.stderr);
    const report = JSON.parse(readFileSync(reportPath));
    assert.equal(report.counts.passed, 3);
    assert.equal(
      new Set(report.steps.map((item) => item.binding.invocation_id)).size,
      2,
    );
    assert.equal(
      new Set(report.steps.map((item) => item.report.relative_path)).size,
      2,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
test("unbound developer entry uses outer observation owner", () => {
  const env = { ...process.env };
  for (const key of Object.keys(env))
    if (key.startsWith("DD_FLOW_CHECK_") || key.startsWith("DD_TASKS_"))
      delete env[key];
  const child = spawnSync(
    process.execPath,
    [
      "scripts/test-runner.mjs",
      process.execPath,
      "--input-type=module",
      "-e",
      `import {runQuality} from ${JSON.stringify(runner)}; process.exitCode=await runQuality([{id:'one',argv:[process.execPath,'--input-type=module','-e',${JSON.stringify(`import {evidence} from ${JSON.stringify(observation)}; evidence({name:'fixture',version:'1'},{passed:1,failed:0,skipped:0},[]);`)}]}]);`,
    ],
    { cwd: root, env, encoding: "utf8" },
  );
  assert.equal(child.status, 0, child.stderr);
});
for (const failedIndex of [0, 1, 2, 3, 4, 5, 6, 7])
  test(`pipeline retains failure at step ${failedIndex} and unreached steps`, () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), "quality-proof-"));
    try {
      const reportPath = path.join(directory, "report.json");
      const steps = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => ({
        id: `phase-${index}`,
        argv: [
          process.execPath,
          "--input-type=module",
          "-e",
          `import {evidence} from ${JSON.stringify(observation)}; evidence({name:'fixture',version:'1'},{passed:${index === failedIndex ? 0 : 1},failed:${index === failedIndex ? 1 : 0},skipped:0},${index === failedIndex ? "[{category:'unclassified',code:'original_native',native_code:'42601',message:'original cause'}]" : "[]"}); process.exitCode=${index === failedIndex ? 1 : 0};`,
        ],
      }));
      const child = spawnSync(
        process.execPath,
        [
          "scripts/test-runner.mjs",
          process.execPath,
          "--input-type=module",
          "-e",
          `import {runQuality} from ${JSON.stringify(runner)}; process.exitCode=await runQuality(${JSON.stringify(steps)});`,
        ],
        {
          cwd: root,
          encoding: "utf8",
          env: {
            ...process.env,
            DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: reportPath,
            DD_FLOW_CHECK_INVOCATION_ID: "pipeline-test",
            DD_FLOW_CHECK_COMMAND: "quality",
          },
        },
      );
      assert.equal(child.status, 1, child.stderr);
      const report = JSON.parse(readFileSync(reportPath));
      assert.equal(validReport(report), true);
      assert.equal(report.steps[failedIndex].state, "failed");
      assert.equal(report.steps[failedIndex + 1].state, "unreached");
      const failure = report.failures.find(
        (item) => item.native_code === "42601",
      );
      assert.ok(failure, JSON.stringify(report));
      const reference = failure.child_evidence.report;
      const bytes = readFileSync(path.join(directory, reference.relative_path));
      assert.equal(reference.sha256, sha256(bytes));
      assert.equal(JSON.parse(bytes).failures[0].message, "original cause");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
