import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { hasTestWatchdog } from "./test-observation.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const observation = new URL("./test-observation.mjs", import.meta.url).href;
test("only exact owned test launcher routes delegate outer timeouts", () => {
  assert.equal(
    hasTestWatchdog(
      "pnpm",
      [
        "--filter",
        "@dd-tasks/web",
        "test:browser",
        "--",
        "--project",
        "chromium",
      ],
      root,
    ),
    true,
  );
  assert.equal(hasTestWatchdog("pnpm", ["test:world"], root), true);
  assert.equal(
    hasTestWatchdog(
      process.execPath,
      ["scripts/test-runner.mjs", "pnpm", "exec", "playwright"],
      root,
    ),
    true,
  );
  assert.equal(hasTestWatchdog("docker", ["compose", "up"], root), false);
  assert.equal(
    hasTestWatchdog(
      "pnpm",
      ["--filter", "@dd-tasks/web", "exec", "playwright"],
      root,
    ),
    false,
  );
  assert.equal(
    hasTestWatchdog(process.execPath, ["somewhere/test-runner.mjs"], root),
    false,
  );
  assert.equal(hasTestWatchdog("pnpm", ["test:browser"], os.tmpdir()), false);
});
async function invoke(source, budgets = {}, cancelOnReady = false) {
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
    child.stdout.on("data", (bytes) => {
      if (cancelOnReady && String(bytes).includes("READY"))
        child.kill("SIGTERM");
    });
    child.stderr.on("data", (bytes) => {
      stderr += bytes;
    });
    const code = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", resolve);
    });
    return {
      code,
      report: JSON.parse(readFileSync(evidence, "utf8")),
      stderr,
      marker: existsSync(`${evidence}.marker`),
    };
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
test("naturally exiting leader cannot SIGKILL its finishing helper", async () => {
  const result = await invoke(
    `import {spawn} from 'node:child_process';import {evidence} from ${JSON.stringify(observation)}; evidence({name:'fixture',version:'1'},{passed:1,failed:0,skipped:0},[]);const helper=spawn(process.execPath,['--input-type=module','-e',"import {writeFileSync} from 'node:fs';setTimeout(()=>writeFileSync(process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH+'.marker','settled'),500);"],{stdio:'ignore'});helper.unref();`,
  );
  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.marker, true);
});
test("cancellation allows live owned leader to clean up", async () => {
  const result = await invoke(
    `import {writeFileSync} from 'node:fs'; process.on('SIGTERM',()=>setTimeout(()=>{writeFileSync(process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH+'.marker','cleaned');process.exit(0);},100));console.log('READY');setInterval(()=>{},100);`,
    {},
    true,
  );
  assert.equal(result.code, 1);
  assert.equal(result.marker, true);
  assert.equal(result.report.failures[0].code, "cancelled");
});
test("future timestamps do not extend a silent operation", async () => {
  const result = await invoke(
    `import {appendFileSync} from 'node:fs';let sequence=0;setInterval(()=>appendFileSync(process.env.DD_FLOW_CHECK_RUNNER_PROGRESS_PATH,JSON.stringify({schema_id:'dd-flow/check-runner-progress@1',invocation_id:'test',sequence:++sequence,phase:'execution',event:'step_completed',detail:String(sequence),at:new Date(Date.now()+60000).toISOString()})+'\\n'),100);`,
    { DD_FLOW_TEST_STARTUP_SILENCE_MS: "1000" },
  );
  assert.equal(result.code, 1);
  assert.equal(result.report.failures[0].code, "inactivity_timeout");
});
test("stale timestamps do not extend a silent operation", async () => {
  const result = await invoke(
    `import {appendFileSync} from 'node:fs';let sequence=0;setInterval(()=>appendFileSync(process.env.DD_FLOW_CHECK_RUNNER_PROGRESS_PATH,JSON.stringify({schema_id:'dd-flow/check-runner-progress@1',invocation_id:'test',sequence:++sequence,phase:'execution',event:'step_completed',detail:String(sequence),at:new Date(Date.now()-60000).toISOString()})+'\\n'),100);`,
    { DD_FLOW_TEST_STARTUP_SILENCE_MS: "1000" },
  );
  assert.equal(result.code, 1);
  assert.equal(result.report.failures[0].code, "inactivity_timeout");
});
test("Playwright requires matching expectation proof and retains mixed outcomes", async () => {
  const reporter = new URL("./playwright-observation.mjs", import.meta.url)
    .href;
  const result = await invoke(
    `import Reporter from ${JSON.stringify(reporter)}; const r=new Reporter(); const assertion={message:'expected',stack:'expect at fixture:1'};const exception={message:'unexpected',stack:'throw at fixture:2'};const test={id:'case'};const outcome={status:'failed',errors:[{...assertion},exception]};r.onTestBegin(test,outcome);r.onStepEnd(test,outcome,{category:'expect',error:assertion,title:'check',startTime:new Date()});r.onTestEnd(test,outcome);const missing={status:'failed',errors:[assertion]};r.onTestBegin(test,missing);r.onTestEnd(test,missing);r.onEnd({status:'failed'});process.exitCode=1;`,
  );
  assert.deepEqual(
    result.report.failures.map((error) => error.category),
    ["assertion", "unclassified", "unclassified"],
  );
  assert.equal(result.report.counts.failed, 2);
});
test("Playwright interrupted and timedOut remain tooling even with an assertion", async () => {
  const reporter = new URL("./playwright-observation.mjs", import.meta.url)
    .href;
  const result = await invoke(
    `import Reporter from ${JSON.stringify(reporter)};const r=new Reporter();for(const status of ['timedOut','interrupted']){const error={message:'expected',stack:'expect at fixture:1'};const outcome={status,errors:[error]};const test={id:status};r.onTestBegin(test,outcome);r.onStepEnd(test,outcome,{category:'expect',error,title:'check',startTime:new Date()});r.onTestEnd(test,outcome);}r.onEnd({status:'failed'});process.exitCode=1;`,
  );
  assert.deepEqual(
    result.report.failures.map((error) => error.category),
    ["assertion", "tooling", "assertion", "tooling"],
  );
});
test("real installed Playwright reports assertion, exception and mixed failures structurally", async () => {
  const reporter = fileURLToPath(
    new URL("./playwright-observation.mjs", import.meta.url),
  );
  const playwright = path.join(root, "apps/web/node_modules/@playwright/test");
  const result = await invoke(
    `import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';const dir=mkdtempSync(path.join(os.tmpdir(),'dd-tasks-real-playwright-'));try{writeFileSync(path.join(dir,'fixture.spec.cjs'),${JSON.stringify(`const {test,expect}=require(${JSON.stringify(playwright)}); test('assertion',()=>expect(1).toBe(2));test('exception',()=>{throw new Error('unexpected')});test('mixed',()=>{expect.soft(1).toBe(2);throw new Error('unexpected')});`)});writeFileSync(path.join(dir,'config.cjs'),'module.exports='+JSON.stringify({testDir:dir,testMatch:'fixture.spec.cjs',workers:1,retries:0,reporter:[[${JSON.stringify(reporter)}]],outputDir:path.join(dir,'output')}));const child=spawnSync('pnpm',['--filter','@dd-tasks/web','exec','playwright','test','--config',path.join(dir,'config.cjs')],{cwd:${JSON.stringify(root)},env:process.env,stdio:'inherit'});process.exitCode=child.status??1;}finally{rmSync(dir,{recursive:true});}`,
    { DD_FLOW_TEST_EXECUTION_SILENCE_MS: "10000" },
  );
  assert.equal(result.code, 1);
  assert.equal(result.report.completed, true, result.stderr);
  assert.equal(result.report.counts.failed, 3);
  assert.deepEqual(
    result.report.failures.map((error) => error.category),
    ["assertion", "unclassified", "assertion", "unclassified"],
  );
});
