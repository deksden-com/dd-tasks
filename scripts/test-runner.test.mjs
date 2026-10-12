import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const observation = new URL("./test-observation.mjs", import.meta.url).href;
async function invoke(source, budgets = {}) {
  const directory = mkdtempSync(
    path.join(os.tmpdir(), "dd-tasks-watchdog-test-"),
  );
  const evidence = path.join(directory, "evidence.json");
  try {
    const child = spawn(
      process.execPath,
      [
        path.join(root, "scripts/test-runner.mjs"),
        process.execPath,
        "--input-type=module",
        "-e",
        source,
      ],
      {
        env: {
          ...process.env,
          DD_FLOW_CHECK_INVOCATION_ID: "test",
          DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: evidence,
          DD_FLOW_CHECK_RUNNER_PROGRESS_PATH: path.join(
            directory,
            "progress.jsonl",
          ),
          DD_FLOW_TEST_STARTUP_SILENCE_MS: "10000",
          DD_FLOW_TEST_EXECUTION_SILENCE_MS: "1000",
          ...budgets,
        },
        stdio: "pipe",
      },
    );
    let stderr = "";
    child.stderr.on("data", (bytes) => {
      stderr += bytes;
    });
    const code = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", resolve);
    });
    return { code, report: JSON.parse(readFileSync(evidence, "utf8")), stderr };
  } finally {
    rmSync(directory, { recursive: true });
  }
}
test("real completed steps slide the window beyond total duration", async () => {
  const result = await invoke(
    `import { progress, evidence } from ${JSON.stringify(observation)}; for(let i=0;i<6;i++){progress('step_completed:'+i);await new Promise(r=>setTimeout(r,300));} evidence({name:'fixture',version:'1'},{passed:1,failed:0,skipped:0},[]);`,
  );
  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.report.completed, true);
});
test("silent setup terminates as tooling, not an assertion verdict", async () => {
  const result = await invoke("setInterval(()=>{},100);", {
    DD_FLOW_TEST_STARTUP_SILENCE_MS: "1000",
  });
  assert.equal(result.code, 1);
  assert.equal(result.report.completed, false);
  assert.equal(result.report.failures[0].code, "inactivity_timeout");
  assert.equal(result.report.failures[0].category, "tooling");
});
test("repeated evidence identity does not extend the window", async () => {
  const result = await invoke(
    `import { progress } from ${JSON.stringify(observation)}; progress('step_completed:same'); setInterval(()=>progress('step_completed:same'),100);`,
  );
  assert.equal(result.code, 1);
  assert.equal(result.report.failures[0].code, "inactivity_timeout");
});
test("nonzero exit cannot be certified by an empty passing reporter", async () => {
  const result = await invoke(
    `import { evidence } from ${JSON.stringify(observation)}; evidence({name:'fixture',version:'1'},{passed:1,failed:0,skipped:0},[]); process.exitCode=1;`,
  );
  assert.equal(result.code, 1);
  assert.equal(result.report.failures[0].category, "unclassified");
});
test("reporter preserves assertion identity from structured runner error", async () => {
  const reporterUrl = new URL("./vitest-observation.mjs", import.meta.url).href;
  const result = await invoke(
    `import Reporter from ${JSON.stringify(reporterUrl)}; const reporter=new Reporter(); reporter.onTestCaseResult({id:'case',result:()=>({state:'failed',errors:[{name:'AssertionError',message:'expected'}]})}); reporter.onTestRunEnd([],[],'failed');process.exitCode=1;`,
  );
  assert.equal(result.report.counts.failed, 1);
  assert.equal(result.report.failures[0].category, "assertion");
});
