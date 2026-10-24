import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import Reporter from "./playwright-observation.mjs";
import { qualitySteps } from "./quality-runner.mjs";
import { observerGapReason } from "./runner-progress.mjs";
import {
  boundReport,
  normalizeFailure,
  validReport,
} from "./test-observation.mjs";

test("candidate runtime authority uses exact top frame, native type and executing module", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "runtime-proof-"));
  const previous = process.env.DD_TASKS_RUNNER_REPORT;
  process.env.DD_TASKS_RUNNER_REPORT = path.join(directory, "report.json");
  try {
    const native = {
      message: "missing matcher",
      stack: `TypeError: missing matcher\n    at ${import.meta.filename}:15:3`,
    };
    const context = { file: import.meta.filename, phase: "test" };
    const failure = normalizeFailure(native, context);
    assert.equal(failure.repair_evidence.rule, "candidate_test_runtime_error");
    assert.equal(failure.origin, "candidate");
    const proof = failure.repair_evidence;
    const bytes = readFileSync(
      path.join(directory, proof.native_artifact.relative_path),
    );
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      proof.native_artifact.sha256,
    );
    assert.deepEqual(JSON.parse(bytes).top_frame, {
      file: import.meta.filename,
      line: 15,
      column: 3,
    });
    for (const [error, scope] of [
      [{ ...native, name: "Error" }, context],
      [
        {
          ...native,
          stack: `TypeError: missing matcher\n    at /tmp/dependency.js:1:1\n    at ${import.meta.filename}:15:3`,
        },
        context,
      ],
      [native, { ...context, phase: "teardown" }],
      [{ message: "TypeError arbitrary stderr" }, context],
      [{ ...native, name: "RangeError" }, context],
    ])
      assert.equal(normalizeFailure(error, scope).repair_evidence, undefined);
    assert.ok(
      normalizeFailure(
        {
          ...native,
          name: "ReferenceError",
          stack: native.stack.replace("TypeError:", "ReferenceError:"),
        },
        { ...context, phase: "collection" },
      ).repair_evidence,
    );
    const helperError = {
      name: "Error",
      message: "Expected synchronized query lock: UPDATE projects",
      stack: `Error: Expected synchronized query lock: UPDATE projects\n    at waitForQueryLock (${import.meta.filename}:100:9)`,
    };
    assert.equal(
      normalizeFailure(helperError, context).repair_evidence?.exception_type,
      "Error",
    );
    for (const phase of ["setup", "collection", "teardown", "runner"])
      assert.equal(
        normalizeFailure(helperError, { ...context, phase }).repair_evidence,
        undefined,
      );
    assert.equal(
      normalizeFailure(
        {
          ...helperError,
          stack: `Error: network\n    at /tmp/dependency.js:1:1\n    at ${import.meta.filename}:100:9`,
        },
        context,
      ).repair_evidence,
      undefined,
    );
  } finally {
    if (previous === undefined) delete process.env.DD_TASKS_RUNNER_REPORT;
    else process.env.DD_TASKS_RUNNER_REPORT = previous;
    rmSync(directory, { recursive: true });
  }
});

test("partial @2 keeps native counters, local errors and bounded child projections", () => {
  const base = {
    schema_id: "dd-flow/check-runner-evidence@2",
    binding: {
      invocation_id: "test",
      check_id: "check",
      command: "test",
      input_hash: "hash",
      verification_epoch: "epoch",
    },
    runner: { name: "fixture", version: "1" },
    completed: true,
    counts: { passed: 0, failed: 100, skipped: 0 },
  };
  const leaf = boundReport({
    ...base,
    failures: Array.from({ length: 100 }, () => ({
      category: "unclassified",
      code: "native_failure",
    })),
  });
  assert.equal(validReport(leaf), true);
  assert.equal(leaf.counts.failed, 100);
  assert.deepEqual(leaf.failure_projection, {
    state: "partial",
    reason: "count_bound",
    represented: 63,
    omitted: 37,
  });
  assert.equal(leaf.observation_unknown, undefined);
  const aggregate = boundReport({
    ...base,
    steps: [],
    failures: [
      ...Array.from({ length: 64 }, () => ({
        category: "unclassified",
        code: "child",
        child_evidence: { step_id: "child" },
      })),
      { category: "tooling", code: "cancelled" },
    ],
  });
  assert.equal(aggregate.failures[0].code, "cancelled");
  assert.equal(aggregate.failure_projection.represented, 62);
  assert.equal(aggregate.failure_projection.omitted, 2);
  assert.equal(aggregate.completed, false);
  assert.equal(
    validReport({ ...leaf, schema_id: "dd-flow/check-runner-evidence@1" }),
    false,
  );
  assert.equal(validReport({ ...leaf, completed: true }), false);
});

test("native action start advances once, not duplicate delivery", () => {
  const reporter = new Reporter(),
    result = {},
    subject = { id: "test", repeatEachIndex: 0 };
  reporter.onTestBegin(subject, result);
  const state = reporter.observations.get(result);
  state.last_progress_at = 0;
  const step = {
    startTime: new Date(),
    category: "pw:api",
    location: { file: import.meta.filename, line: 1 },
  };
  reporter.onStepBegin(subject, result, step);
  assert.ok(state.last_progress_at > 0);
  const at = state.last_progress_at,
    sequence = state.sequence;
  reporter.onStepBegin(subject, result, step);
  assert.equal(state.sequence, sequence);
  assert.equal(state.last_progress_at, at);
  reporter.onStepEnd(subject, result, step);
  const ended = state.sequence;
  state.last_progress_at = 0;
  reporter.onStepEnd(subject, result, step);
  assert.equal(state.sequence, ended);
  assert.equal(state.last_progress_at, 0);
});

test("outer observer collects buffered progress before testing lag", () => {
  const source = readFileSync(
    new URL("./test-runner.mjs", import.meta.url),
    "utf8",
  );
  assert.ok(
    source.indexOf("const events = publisher.collect()") <
      source.indexOf("const gapReason = observerGapReason"),
  );
  assert.equal(observerGapReason(70000, 70000, true), null);
  assert.equal(observerGapReason(70000, 70000, false), "observation_gap");
  assert.equal(
    observerGapReason(100, 70000, true),
    "observation_clock_discontinuity",
  );
  assert.equal(
    observerGapReason(70000, 100, true),
    "observation_clock_discontinuity",
  );
});
test("unsupported native timeout capability fails before executing the test body", async () => {
  const previous = process.env.DD_TASKS_TEST_WATCHDOG;
  process.env.DD_TASKS_TEST_WATCHDOG = "1";
  try {
    const { observeInactivity } = await import("./browser-fixture.mjs");
    let executed = false;
    await assert.rejects(
      observeInactivity(
        {},
        async () => {
          executed = true;
        },
        {},
      ),
      { code: "browser_timeout_capability_unavailable" },
    );
    assert.equal(executed, false);
  } finally {
    if (previous === undefined) delete process.env.DD_TASKS_TEST_WATCHDOG;
    else process.env.DD_TASKS_TEST_WATCHDOG = previous;
  }
});

const root = path.resolve(import.meta.dirname, "..");
test("native tsc and compiler API use the same application and test configurations", () => {
  const native = ["api", "web"].flatMap((app) => {
    const packageFile = JSON.parse(
      readFileSync(path.join(root, "apps", app, "package.json")),
    );
    return [...packageFile.scripts.typecheck.matchAll(/tsc -p ([^\s]+)/g)].map(
      (match) => `apps/${app}/${match[1]}`,
    );
  });
  assert.deepEqual(
    qualitySteps.find((step) => step.id === "typecheck").argv.slice(3),
    native,
  );
  assert.ok(native.includes("apps/api/tsconfig.test.json"));
  assert.ok(native.includes("apps/web/tsconfig.browser.json"));
});
const webRequire = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
);
async function nativeRun(args, env) {
  const child = spawn(process.execPath, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  for (const stream of [child.stdout, child.stderr])
    stream.on("data", (chunk) => {
      output += chunk;
    });
  const status = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  return { status, output };
}
test("real outer observer accepts buffered work after lag, but rejects clock discontinuity", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "observer-lag097-"));
  try {
    for (const skew of [false, true]) {
      const report = path.join(directory, `${skew}.json`),
        progressPath = path.join(directory, `${skew}.jsonl`);
      // Clock injection is confined to this owned wrapper process. The child
      // publishes genuine native signals; no production budget is shortened.
      const preload = `import {performance} from 'node:perf_hooks';import {existsSync} from 'node:fs';const mono=performance.now.bind(performance),wall=Date.now.bind(Date);let first;function offset(){if(first===undefined&&existsSync(process.env.DD_FLOW_CHECK_RUNNER_PROGRESS_PATH))first=mono();return first!==undefined&&mono()-first>200?70000:0;}Object.defineProperty(performance,'now',{value:()=>mono()+offset()});${skew ? "" : "Date.now=()=>wall()+offset();"}`;
      const source = `import {progress,evidence} from ${JSON.stringify(pathToFileURL(path.join(root, "scripts/test-observation.mjs")).href)};for(let i=0;i<15;i++){progress('step_completed:'+i);await new Promise(r=>setTimeout(r,80));}evidence({name:'fixture',version:'1'},{passed:1,failed:0,skipped:0},[]);`;
      const result = await nativeRun(
        [
          "--import",
          `data:text/javascript,${encodeURIComponent(preload)}`,
          path.join(root, "scripts/test-runner.mjs"),
          process.execPath,
          "--input-type=module",
          "-e",
          source,
        ],
        {
          DD_FLOW_CHECK_INVOCATION_ID: `lag-${skew}`,
          DD_FLOW_CHECK_COMMAND: "observer lag regression",
          DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: report,
          DD_FLOW_CHECK_RUNNER_PROGRESS_PATH: progressPath,
          DD_FLOW_TEST_STARTUP_SILENCE_MS: "120000",
          DD_FLOW_TEST_EXECUTION_SILENCE_MS: "120000",
        },
      );
      const observed = JSON.parse(readFileSync(report));
      assert.equal(result.status, skew ? 1 : 0, result.output);
      if (skew)
        assert.equal(
          observed.failures[0].code,
          "observation_clock_discontinuity",
        );
      else assert.equal(observed.completed, true);
    }
  } finally {
    rmSync(directory, { recursive: true });
  }
});
test("native Playwright hook Errors never acquire test-body repair authority", async () => {
  const directory = mkdtempSync(path.join(root, "scripts/.hooks101-"));
  try {
    const spec = path.join(directory, "hooks.spec.mjs");
    const report = path.join(directory, "report.json");
    const config = path.join(directory, "playwright.config.mjs");
    writeFileSync(
      spec,
      `import native from ${JSON.stringify(pathToFileURL(webRequire.resolve("@playwright/test")).href)};
const {test}=native;
test.describe('setup',()=>{test.beforeEach(()=>{throw new Error('native setup refusal');});test('body',()=>{});});
test.describe('teardown',()=>{test.afterEach(()=>{throw new Error('native teardown refusal');});test('body',()=>{});});
test('ordinary step title is not a native hook',()=>test.step('setup then teardown',()=>{throw new Error('native body refusal');}));`,
    );
    writeFileSync(
      config,
      `export default {testDir:${JSON.stringify(directory)},testMatch:'hooks.spec.mjs',workers:1,retries:0,reporter:[[${JSON.stringify(path.join(root, "scripts/playwright-observation.mjs"))}]],outputDir:${JSON.stringify(path.join(directory, "artifacts"))}};`,
    );
    const result = await nativeRun(
      [webRequire.resolve("@playwright/test/cli"), "test", "--config", config],
      {
        DD_TASKS_RUNNER_REPORT: report,
        DD_FLOW_CHECK_INVOCATION_ID: "native-hooks101",
        DD_FLOW_CHECK_COMMAND: "native hook regression",
      },
    );
    assert.equal(result.status, 1, result.output);
    const observed = JSON.parse(readFileSync(report));
    assert.equal(validReport(observed), true, result.output);
    assert.equal(observed.failures.length, 3);
    assert.deepEqual(
      observed.failures.map((item) => item.phase),
      ["setup", "teardown", "test"],
    );
    assert.ok(
      observed.failures
        .slice(0, 2)
        .every((item) => !item.repair_evidence && item.origin === "unknown"),
    );
    assert.equal(
      observed.failures[2].repair_evidence?.rule,
      "candidate_test_runtime_error",
    );
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test("native Playwright and Vitest preserve candidate runtime proof, not arbitrary message text", async () => {
  const directory = mkdtempSync(path.join(root, "scripts/.runtime097-"));
  try {
    for (const runner of ["playwright", "vitest"]) {
      const report = path.join(directory, `${runner}.json`);
      const spec = path.join(directory, `${runner}.spec.mjs`);
      writeFileSync(
        spec,
        `${runner === "playwright" ? `import native from ${JSON.stringify(pathToFileURL(webRequire.resolve("@playwright/test")).href)}; const {test,expect}=native;` : `import {test,expect} from ${JSON.stringify(pathToFileURL(path.join(root, "node_modules/vitest/dist/index.js")).href)};`}\n` +
          `test('native runtime error',()=>{${runner === "playwright" ? "expect(1).doesNotExist();" : "const value=null;value.doesNotExist();"}});\ntest('native helper Error',()=>{throw new Error('Expected synchronized query lock: UPDATE projects');});\ntest('unsupported native error',()=>{throw new RangeError('TypeError arbitrary message');});`,
      );
      const config = path.join(directory, `${runner}.config.mjs`);
      const reporter = path.join(root, `scripts/${runner}-observation.mjs`);
      writeFileSync(
        config,
        runner === "playwright"
          ? `export default {testDir:${JSON.stringify(directory)},testMatch:'playwright.spec.mjs',workers:1,retries:0,reporter:[[${JSON.stringify(reporter)}]],outputDir:${JSON.stringify(path.join(directory, "artifacts"))}};`
          : `export default {test:{include:[${JSON.stringify(spec)}],reporters:[${JSON.stringify(reporter)}],fileParallelism:false}};`,
      );
      const args =
        runner === "playwright"
          ? [
              webRequire.resolve("@playwright/test/cli"),
              "test",
              "--config",
              config,
            ]
          : [
              path.join(root, "node_modules/vitest/vitest.mjs"),
              "run",
              "--config",
              config,
            ];
      const result = await nativeRun(args, {
        DD_TASKS_RUNNER_REPORT: report,
        DD_FLOW_CHECK_INVOCATION_ID: `native-${runner}`,
        DD_FLOW_CHECK_COMMAND: "native runtime regression",
      });
      assert.equal(result.status, 1, result.output);
      const observed = JSON.parse(readFileSync(report));
      assert.equal(validReport(observed), true, result.output);
      assert.equal(
        observed.failures.filter(
          (item) =>
            item.repair_evidence?.rule === "candidate_test_runtime_error",
        ).length,
        2,
        JSON.stringify(observed),
      );
      assert.equal(
        observed.failures.find((item) =>
          item.message.includes("arbitrary message"),
        ).repair_evidence,
        undefined,
      );
      if (process.env.DD_TASKS_ENGINE_EVIDENCE_MODULE) {
        const engine = await import(
          pathToFileURL(process.env.DD_TASKS_ENGINE_EVIDENCE_MODULE).href
        );
        const accepted = engine.readRunnerEvidence(
          directory,
          { schema_id: observed.schema_id, path: path.basename(report) },
          observed.binding,
        );
        assert.ok(accepted, JSON.stringify(observed));
        const failure = accepted.failures.find(
          (item) =>
            item.repair_evidence?.rule === "candidate_test_runtime_error",
        );
        assert.equal(
          engine.checkRepairDisposition({
            status: "failed",
            exit_code: 1,
            runner_evidence: { ...accepted, failures: [failure] },
            candidate_root: root,
          }),
          "source_repair",
        );
        assert.equal(
          engine.checkRepairDisposition({
            status: "failed",
            exit_code: 1,
            runner_evidence: accepted,
            candidate_root: root,
          }),
          "unclassified",
        );
      }
    }
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test("native browser gap recovery and auxiliary close use a fresh target window", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "browser-window097-"));
  let failed = false;
  try {
    const fixture = pathToFileURL(
      path.join(root, "scripts/browser-fixture.mjs"),
    ).href;
    writeFileSync(
      path.join(directory, "window.spec.mjs"),
      `import {observeInactivity} from ${JSON.stringify(fixture)};
import native from ${JSON.stringify(pathToFileURL(webRequire.resolve("@playwright/test")).href)};
// This regression starts its body window after native page startup; startup is
// not the deliberately quiet action being tested.
const test=native.test.extend({_observeInactivity:[async({browser,page},use,info)=>observeInactivity(browser,use,info),{auto:true}]});
test('gap then progress',async({page})=>{await page.setContent('<p>ok</p>');await new Promise(r=>setTimeout(r,100));const until=Date.now()+1200;while(Date.now()<until){};await new Promise(r=>setTimeout(r,100));await page.title();await page.getByRole('button',{name:'missing'}).click();});
test('auxiliary close then progress',async({page})=>{await page.setContent('<p>ok</p>');const auxiliary=await page.context().newPage();await new Promise(r=>setTimeout(r,100));await auxiliary.close();await page.title();await page.getByRole('button',{name:'missing'}).click();});`,
    );
    const config = path.join(directory, "config.mjs");
    writeFileSync(
      config,
      `export default {testDir:${JSON.stringify(directory)},testMatch:'window.spec.mjs',workers:1,retries:0,timeout:0,reporter:[[${JSON.stringify(path.join(root, "scripts/playwright-observation.mjs"))}]],outputDir:${JSON.stringify(path.join(directory, "artifacts"))},use:{headless:true}};`,
    );
    const observations = path.join(directory, "observations");
    const result = await nativeRun(
      [webRequire.resolve("@playwright/test/cli"), "test", "--config", config],
      {
        DD_TASKS_TEST_WATCHDOG: "1",
        DD_FLOW_TEST_EXECUTION_SILENCE_MS: "4000",
        DD_TASKS_BROWSER_OBSERVATION_DIR: observations,
        DD_TASKS_RUNNER_REPORT: path.join(directory, "report.json"),
        DD_FLOW_CHECK_INVOCATION_ID: "window097",
      },
    );
    assert.equal(result.status, 1, result.output);
    const workers = readdirSync(observations)
      .filter((name) => name.endsWith(".worker.json"))
      .map((name) => JSON.parse(readFileSync(path.join(observations, name))));
    assert.equal(workers.length, 2, result.output);
    for (const snapshot of workers) {
      assert.equal(
        snapshot.observation_contract,
        "dd-tasks/browser-observation@2",
      );
      assert.equal(snapshot.observation_gap, false, JSON.stringify(snapshot));
      assert.equal(snapshot.browser.page_closed, false);
      assert.ok(snapshot.target.page_id && snapshot.target.context_id);
      assert.ok(snapshot.window_epoch > snapshot.gap.window_epoch);
    }
    assert.ok(workers.some((item) => item.gap.reason === "event_loop_gap"));
    assert.ok(
      workers.some((item) =>
        ["target_ambiguous", "target_closed"].includes(item.gap.reason),
      ),
    );
  } catch (error) {
    failed = true;
    error.message += `\nNative diagnostics: ${directory}`;
    throw error;
  } finally {
    if (!failed) rmSync(directory, { recursive: true });
  }
});
