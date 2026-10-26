import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  assertWorldCleanup,
  boundReport,
  hasTestWatchdog,
  normalizeFailure,
  sanitizeDiagnostic,
  validReport,
  worldObservationPaths,
} from "./test-observation.mjs";
import VitestReporter from "./vitest-observation.mjs";

test("parallel world observations survive reverse final order and reject foreign cleanup", () => {
  const directory = mkdtempSync(
    path.join(os.tmpdir(), "dd-tasks-world-owners-"),
  );
  try {
    const owners = ["a", "b"].map((id) => {
      const folder = path.join(directory, id);
      mkdirSync(folder);
      const paths = worldObservationPaths(folder);
      const ready = {
        schema_id: "dd-tasks/test-world-ready@1",
        invocation_id: "test",
        world_id: id.repeat(32),
      };
      const final = {
        schema_id: "dd-tasks/test-world@1",
        invocation_id: "test",
        world_id: ready.world_id,
        state: "cleaned",
      };
      writeFileSync(paths.DD_TASKS_TEST_WORLD_RECEIPT, JSON.stringify(ready));
      return { paths, ready, final };
    });
    assert.equal(
      new Set(owners.flatMap((owner) => Object.values(owner.paths))).size,
      8,
    );
    for (const owner of [...owners].reverse())
      writeFileSync(
        owner.paths.DD_TASKS_TEST_WORLD_FINAL_RECEIPT,
        JSON.stringify(owner.final),
      );
    for (const owner of owners)
      assertWorldCleanup(
        JSON.parse(readFileSync(owner.paths.DD_TASKS_TEST_WORLD_RECEIPT)),
        JSON.parse(readFileSync(owner.paths.DD_TASKS_TEST_WORLD_FINAL_RECEIPT)),
        "test",
      );
    assert.throws(
      () => assertWorldCleanup(owners[0].ready, owners[1].final, "test"),
      /cleanup not confirmed/,
    );
    assert.throws(
      () =>
        assertWorldCleanup(
          owners[0].ready,
          { ...owners[0].final, state: "cleanup_unconfirmed" },
          "test",
        ),
      /cleanup not confirmed/,
    );
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test("installed Vitest retains native SQLSTATE and hook phases without invented failed counts", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "dd-tasks-native-"));
  try {
    const reportPath = path.join(directory, "report.json");
    const child = spawn(
      process.execPath,
      [
        path.join(root, "node_modules/vitest/vitest.mjs"),
        "run",
        "--config",
        "scripts/fixtures/observation.config.mjs",
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          DD_TASKS_RUNNER_REPORT: reportPath,
          DD_TASKS_TEST_INVOCATION_ID: "native",
          DD_TASKS_TEST_COMMAND: "native",
        },
        stdio: "ignore",
      },
    );
    const exit = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", resolve);
    });
    assert.equal(exit, 1);
    const report = JSON.parse(readFileSync(reportPath, "utf8"));
    assert.deepEqual(report.counts, { passed: 1, failed: 5, skipped: 2 });
    assert.equal(report.failures.length, 9);
    assert.equal(
      report.failures.find((x) => x.native_code === "COLLECTION_NATIVE").phase,
      "collection",
    );
    assert.deepEqual(
      report.failures
        .filter((x) => x.native_code === "23503")
        .map((x) => x.phase)
        .sort(),
      ["setup", "setup", "setup", "teardown", "teardown", "test", "test"],
    );
    assert.equal(
      report.failures
        .filter((x) => x.native_code === "23503")
        .every((x) => x.origin === "unknown" && !x.repair_evidence),
      true,
    );
    assert.equal(new Set(report.failures.map((x) => x.test_id)).size, 9);
    assert.equal(validReport(report), true);
  } finally {
    rmSync(directory, { recursive: true });
  }
});
test("aggregate overflow is incomplete and preserves counts", () => {
  const report = {
    failures: Array.from({ length: 100 }, () => ({
      category: "unclassified",
      code: "Error",
      message: "cause",
    })),
    completed: true,
    counts: { passed: 1, failed: 100, skipped: 0 },
  };
  boundReport(report);
  assert.equal(report.completed, false);
  assert.equal(report.failures.at(-1).code, "report_truncated");
  assert.equal(report.counts.failed, 100);
});

const root = fileURLToPath(new URL("../", import.meta.url));
const observation = new URL("./test-observation.mjs", import.meta.url).href;
test("Vitest cloned hook projections deduplicate only within the same entity and occurrence", () => {
  const error = {
    name: "PostgresError",
    code: "23503",
    message: "foreign key violation",
    stack: "PostgresError: foreign key violation\n at source:9",
  };
  const reporter = new VitestReporter();
  const entity = {
    id: "suite",
    moduleId: "fixture",
    errors: () => [error],
    children: [],
  };
  for (const name of ["beforeAll", "afterAll"]) {
    const hook = { name, entity };
    reporter.onHookStart(hook);
    reporter.captureHook(entity);
    reporter.captureHook(entity);
    reporter.onHookEnd(hook);
  }
  assert.deepEqual(
    reporter.failures.map((failure) => failure.phase),
    ["setup", "teardown"],
  );
  entity.errors = () => [
    { ...error },
    { ...error },
    { ...error, stack: "different native stack" },
  ];
  const other = {
    ...entity,
    id: "different suite",
    errors: () => [{ ...error }],
  };
  reporter.onTestRunEnd([entity, other], [{ ...error }], "failed");
  assert.deepEqual(
    reporter.failures.map((failure) => failure.phase),
    ["setup", "teardown", "collection", "collection", "runner"],
  );
  assert.equal(
    reporter.failures.every((failure) => failure.native_code === "23503"),
    true,
  );
});
test("diagnostics redact credentials and preserve UTF8 byte bounds", () => {
  const failure = normalizeFailure({
    message: `Authorization: Bearer private Authorization:Basic private postgresql://user:password@localhost/db https://user:private@localhost/path token=private access_token=private db_password:private secret:private Bearer private Basic private api-key = private {"api_key":"private"} ${"я".repeat(5000)}`,
    stack: `api_key=private ${"я".repeat(10000)}`,
  });
  assert.equal(JSON.stringify(failure).includes("private"), false);
  assert.equal(JSON.stringify(failure).includes("user:password"), false);
  assert.ok(Buffer.byteLength(failure.message) <= 4096);
  assert.ok(Buffer.byteLength(failure.stack) <= 16384);
  assert.equal(failure.message.includes("�"), false);
  const diagnostic = sanitizeDiagnostic({
    password: "private",
    error: {
      message: "token=private postgresql://private:private@localhost/db",
    },
  });
  assert.equal(JSON.stringify(diagnostic).includes("private"), false);
});
test("owned migrated PostgreSQL world retains real beforeAll SQLSTATE23503 diagnostics", {
  skip: !process.env.DD_TASKS_TEST_ADMIN_URL,
}, async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "dd-tasks-sql-native-"));
  try {
    const reportPath = path.join(directory, "report.json");
    const child = spawn(
      process.execPath,
      [
        path.join(root, "scripts/test-runner.mjs"),
        "pnpm",
        "--filter",
        "@dd-tasks/api",
        "exec",
        "tsx",
        "scripts/test-world.ts",
        "api",
        "pnpm",
        "-C",
        "../..",
        "exec",
        "vitest",
        "run",
        "--config",
        "scripts/fixtures/sql-observation.config.mjs",
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          DD_FLOW_CHECK_INVOCATION_ID: "native-sql",
          DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: reportPath,
        },
        stdio: "ignore",
      },
    );
    const exit = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", resolve);
    });
    assert.equal(exit, 1);
    const report = JSON.parse(readFileSync(reportPath, "utf8"));
    assert.equal(report.completed, true);
    assert.deepEqual(report.counts, { passed: 0, failed: 0, skipped: 1 });
    assert.equal(report.failures.length, 1, JSON.stringify(report.failures));
    const failure = report.failures[0];
    assert.equal(failure.native_code, "23503");
    assert.equal(failure.phase, "setup");
    assert.equal(failure.origin, "unknown");
    assert.equal(failure.repair_evidence, undefined);
    assert.equal(validReport(report), true);
  } finally {
    rmSync(directory, { recursive: true });
  }
});
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
    let stderr = "",
      stdout = "";
    child.stdout.on("data", (bytes) => {
      stdout += bytes;
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
    const report = JSON.parse(readFileSync(evidence, "utf8"));
    const reference = report.failures.find(
      (failure) => failure.diagnostic_artifact,
    )?.diagnostic_artifact;
    let diagnostic;
    if (reference) {
      const bytes = readFileSync(path.join(directory, reference.relative_path));
      assert.equal(
        createHash("sha256").update(bytes).digest("hex"),
        reference.sha256,
      );
      diagnostic = JSON.parse(bytes);
    }
    return {
      code,
      report,
      diagnostic,
      stderr,
      stdout,
      marker: existsSync(`${evidence}.marker`),
    };
  } finally {
    rmSync(directory, { recursive: true });
  }
}
test("real completed steps slide the window beyond total duration", async () => {
  const result = await invoke(
    `import { progress, evidence } from ${JSON.stringify(observation)}; for(let i=0;i<40;i++){progress('step_completed:'+i);await new Promise(r=>setTimeout(r,300));} evidence({name:'fixture',version:'1'},{passed:1,failed:0,skipped:0},[]);`,
    // Still outlives a fixed 10s deadline, without assuming the host schedules
    // both real processes within the 1s synthetic negative-test budget.
    {
      DD_FLOW_TEST_STARTUP_SILENCE_MS: "120000",
      DD_FLOW_TEST_EXECUTION_SILENCE_MS: "10000",
    },
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
for (const mode of ["beforeAll", "afterAll", "dead-worker"]) {
  test(`native Playwright ${mode} cannot bypass outer settlement or fabricate browser repair`, async () => {
    const reporter = path.join(root, "scripts/playwright-observation.mjs");
    const fixture = new URL("./browser-fixture.mjs", import.meta.url).href;
    const marker = `OUTER_CONTRACT_${mode}`;
    const body =
      mode === "dead-worker"
        ? `test('dead worker',async()=>{console.log(${JSON.stringify(marker)});process.kill(process.pid,'SIGKILL');});`
        : `test.${mode}(async()=>{console.log(${JSON.stringify(marker)});await new Promise(()=>{});});test('body',async()=>{console.log('OUTER_BODY_EXECUTED');});`;
    const source = `import {mkdirSync,writeFileSync} from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {spawnSync} from 'node:child_process';const require=createRequire(${JSON.stringify(path.join(root, "apps/web/package.json"))});const dir=path.join(path.dirname(process.env.DD_TASKS_RUNNER_REPORT),'native-outer');mkdirSync(dir,{recursive:true});writeFileSync(path.join(dir,'outer.spec.mjs'),${JSON.stringify(`import {test} from ${JSON.stringify(fixture)};\n${body}`)});writeFileSync(path.join(dir,'config.cjs'),'module.exports='+JSON.stringify({testDir:dir,testMatch:'outer.spec.mjs',workers:1,retries:0,timeout:0,reporter:[['list'],[${JSON.stringify(reporter)}]],outputDir:path.join(dir,'output')}));const result=spawnSync(process.execPath,[require.resolve('@playwright/test/cli'),'test','--config',path.join(dir,'config.cjs')],{cwd:${JSON.stringify(root)},env:process.env,stdio:'inherit'});process.exitCode=result.status??1;`;
    const result = await invoke(source, {
      DD_FLOW_TEST_STARTUP_SILENCE_MS: "120000",
      DD_FLOW_TEST_EXECUTION_SILENCE_MS: "4000",
    });
    assert.equal(result.code, 1, result.stderr);
    assert.match(
      result.stdout,
      new RegExp(marker),
      JSON.stringify({ report: result.report, stderr: result.stderr }),
    );
    const missingFinal = result.report.failures.some(
      (failure) => failure.code === "invalid_runner_evidence",
    );
    assert.equal(
      result.report.counts.passed,
      mode === "afterAll" && !missingFinal ? 1 : 0,
      JSON.stringify(result.report),
    );
    if (mode === "afterAll")
      assert.match(result.stdout, /OUTER_BODY_EXECUTED/, result.stdout);
    assert.ok(result.report.failures.length, JSON.stringify(result.report));
    assert.ok(
      result.report.failures.every((failure) => !failure.repair_evidence),
      JSON.stringify(result.report),
    );
    assert.equal(
      result.diagnostic.process_cleanup.settled,
      true,
      JSON.stringify(result.diagnostic),
    );
    if (mode === "dead-worker")
      assert.match(JSON.stringify(result.report), /SIGKILL/);
    else {
      assert.equal(result.report.completed, false);
      assert.equal(result.report.observation_unknown, true);
      assert.ok(
        result.report.failures.some(
          (failure) =>
            failure.category === "tooling" &&
            failure.code === "inactivity_timeout",
        ),
      );
    }
  });
}
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
test("late world cleanup failure blocks an otherwise passing reporter", async () => {
  const result = await invoke(`
    import { writeFileSync } from 'node:fs';
    import { evidence, binding } from '${observation}';
    const world_id = 'a'.repeat(32);
    writeFileSync(process.env.DD_TASKS_TEST_WORLD_RECEIPT, JSON.stringify({schema_id:'dd-tasks/test-world-ready@1',invocation_id:binding().invocation_id,world_id}));
    writeFileSync(process.env.DD_TASKS_TEST_WORLD_FINAL_RECEIPT, JSON.stringify({schema_id:'dd-tasks/test-world@1',invocation_id:binding().invocation_id,world_id,state:'cleanup_unconfirmed',cleanup_errors:['drop refused']}));
    evidence({name:'fixture',version:'1'},{passed:1,failed:0,skipped:0},[]);
  `);
  assert.equal(result.code, 1);
  assert.equal(result.report.completed, false);
  assert.equal(result.report.failures.at(-1).code, "cleanup_unconfirmed");
  assert.equal(result.report.counts.passed, 1);
  assert.deepEqual(result.diagnostic.world_final.cleanup_errors, [
    "drop refused",
  ]);
  assert.equal(result.diagnostic.process_cleanup.settled, true);
});
test("foreign prior report and malformed current report cannot certify zero exit", async () => {
  const prior = await invoke(`
    import { writeFileSync } from 'node:fs';
    import { evidence, binding } from '${observation}';
    writeFileSync(process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH,JSON.stringify({schema_id:'dd-flow/check-runner-evidence@1',binding:{...binding(),invocation_id:'foreign'},runner:{name:'fixture',version:'1'},completed:true,counts:{passed:1,failed:0,skipped:0},failures:[]}));
    evidence({name:'fixture',version:'1'},{passed:1,failed:0,skipped:0},[]);
  `);
  assert.equal(prior.code, 1);
  assert.equal(prior.report.completed, false);
  assert.equal(prior.report.failures.at(-1).code, "invalid_prior_evidence");
  const current = await invoke(
    `import {writeFileSync} from 'node:fs';writeFileSync(process.env.DD_TASKS_RUNNER_REPORT,'{}');`,
  );
  assert.equal(current.code, 1);
  assert.equal(current.report.failures[0].code, "invalid_runner_evidence");
});
test("safe individual counts cannot overflow into a passing aggregate", async () => {
  for (const key of ["passed", "skipped"]) {
    const result = await invoke(`
      import { writeFileSync } from 'node:fs';
      import { evidence, binding } from '${observation}';
      const counts = {passed:0,failed:0,skipped:0};
      writeFileSync(process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH, JSON.stringify({schema_id:'dd-flow/check-runner-evidence@1',binding:binding(),runner:{name:'fixture',version:'1'},completed:true,counts:{...counts,${key}:Number.MAX_SAFE_INTEGER},failures:[]}));
      evidence({name:'fixture',version:'1'},{...counts,${key}:1},[]);
    `);
    assert.equal(result.code, 1);
    assert.equal(result.report.completed, false);
    assert.ok(
      result.report.failures.some(
        (failure) => failure.code === "invalid_aggregate_counts",
      ),
    );
    assert.equal(result.report.counts[key], Number.MAX_SAFE_INTEGER + 1);
  }
});
test("foreign or orphan final world receipt cannot certify cleanup", async () => {
  for (const orphan of [false, true]) {
    const result = await invoke(`
      import { writeFileSync } from 'node:fs';
      import { evidence, binding } from '${observation}';
      ${orphan ? "" : "writeFileSync(process.env.DD_TASKS_TEST_WORLD_RECEIPT, JSON.stringify({schema_id:'dd-tasks/test-world-ready@1',invocation_id:binding().invocation_id,world_id:'a'.repeat(32)}));"}
      writeFileSync(process.env.DD_TASKS_TEST_WORLD_FINAL_RECEIPT, JSON.stringify({schema_id:'dd-tasks/test-world@1',invocation_id:binding().invocation_id,world_id:'b'.repeat(32),state:'cleaned'}));
      evidence({name:'fixture',version:'1'},{passed:1,failed:0,skipped:0},[]);
    `);
    assert.equal(result.code, 1);
    assert.equal(result.report.completed, false);
    assert.equal(result.report.failures.at(-1).code, "cleanup_unconfirmed");
  }
});
test("orphan malformed and symlink final world receipts block cleanup", async () => {
  for (const corrupt of ["malformed", "symlink", "directory"]) {
    const result = await invoke(`
      import { writeFileSync, symlinkSync, mkdirSync } from 'node:fs';
      import { evidence } from '${observation}';
      const file = process.env.DD_TASKS_TEST_WORLD_FINAL_RECEIPT;
      if ('${corrupt}' === 'malformed') writeFileSync(file, '{');
      else if ('${corrupt}' === 'directory') mkdirSync(file);
      else { writeFileSync(file+'.target', '{}'); symlinkSync(file+'.target',file); }
      evidence({name:'fixture',version:'1'},{passed:1,failed:0,skipped:0},[]);
    `);
    assert.equal(result.code, 1);
    assert.equal(result.report.completed, false);
    assert.ok(
      result.report.failures.some(
        (failure) => failure.code === "cleanup_unconfirmed",
      ),
    );
  }
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
    // Real runner boot/worker import uses production silence windows; the
    // small budgets in invoke() are only for synthetic watchdog regressions.
    {
      DD_FLOW_TEST_STARTUP_SILENCE_MS: "120000",
      DD_FLOW_TEST_EXECUTION_SILENCE_MS: "600000",
    },
  );
  assert.equal(result.code, 1);
  assert.equal(result.report.completed, true, result.stderr);
  assert.equal(result.report.counts.failed, 3);
  assert.deepEqual(
    result.report.failures.map((error) => error.category),
    ["assertion", "unclassified", "assertion", "unclassified"],
  );
});
