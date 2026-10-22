import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import {
  attempt,
  attemptKey,
  writeObservation,
} from "./browser-observation.mjs";
import Reporter from "./playwright-observation.mjs";
import { binding, validReport } from "./test-observation.mjs";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
);
test("all browser specs use the observed test base", () => {
  for (const file of readdirSync(
    path.join(root, "apps/web/tests/browser"),
  ).filter((name) => name.endsWith(".spec.ts"))) {
    const source = readFileSync(
      path.join(root, "apps/web/tests/browser", file),
      "utf8",
    );
    assert.match(
      source,
      /from "\.\.\/\.\.\/\.\.\/\.\.\/scripts\/browser-fixture\.mjs"/,
    );
    assert.doesNotMatch(
      source,
      /import\s*\{[^}]*\btest\b[^}]*\}\s*from\s*["']@playwright\/test/,
    );
  }
});
test("browser proof keeps mixed errors and UTF8 or count overflow fail-closed", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "dd-browser-proof-"));
  const keys = [
    "DD_FLOW_CHECK_INVOCATION_ID",
    "DD_TASKS_TEST_WORLD",
    "DD_TASKS_TEST_WORLD_RECEIPT",
    "DD_TASKS_BROWSER_OBSERVATION_DIR",
    "DD_TASKS_RUNNER_REPORT",
  ];
  const previous = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );
  try {
    Object.assign(process.env, {
      DD_FLOW_CHECK_INVOCATION_ID: "proof-unit",
      DD_TASKS_TEST_WORLD: "a".repeat(32),
      DD_TASKS_TEST_WORLD_RECEIPT: path.join(dir, "ready.json"),
      DD_TASKS_BROWSER_OBSERVATION_DIR: path.join(dir, "observations"),
      DD_TASKS_RUNNER_REPORT: path.join(dir, "report.json"),
    });
    const world = {
      schema_id: "dd-tasks/test-world-ready@1",
      invocation_id: "proof-unit",
      world_id: "a".repeat(32),
      ready: true,
      setup_completed: true,
      migrations_sha256: "b".repeat(64),
      role: "browser",
    };
    writeFileSync(
      process.env.DD_TASKS_TEST_WORLD_RECEIPT,
      JSON.stringify(world),
    );
    const attempt = {
        invocation_id: "proof-unit",
        test_id: "case",
        retry: 0,
        repeat_each_index: 0,
        worker_index: 0,
      },
      step = {
        id: "step",
        category: "pw:api",
        file: import.meta.filename,
        line: 1,
      };
    const deadline = Date.now() - 20;
    const snapshot = {
      observation_contract: "dd-tasks/browser-observation@2",
      target: { page_id: "page", context_id: "context" },
      window_epoch: 1,
      binding: binding(),
      attempt,
      step,
      world,
      phase: "body",
      observation_gap: false,
      browser: { connected: true, page_closed: false, crashed: false },
      world_health: { api: true, web: true, db: true },
      quiet_ms: 4000,
      last_progress_at: new Date(deadline - 4000).toISOString(),
      deadline_at: new Date(deadline).toISOString(),
      observed_at: new Date(deadline - 30).toISOString(),
      health_observed_at: new Date(deadline - 40).toISOString(),
    };
    const reporter = new Reporter(),
      timeout = { message: "Test timeout of 4000ms exceeded." };
    const proof = (errors) =>
      reporter.browserProof(
        { id: "case" },
        { status: "timedOut", errors },
        snapshot,
        { attempt },
      );
    assert.ok(proof([timeout]));
    snapshot.observation_gap = true;
    assert.equal(proof([timeout]), null);
    snapshot.observation_gap = false;
    assert.equal(
      proof([timeout, { message: "write CONNECTION_DESTROYED" }]),
      null,
    );
    assert.equal(proof(Array(65).fill(timeout)), null);
    assert.equal(
      proof([
        {
          message: `Test timeout of 4000ms exceeded.\nCall log:\n${"я".repeat(2100)}`,
        },
      ]),
      null,
    );
    assert.equal(proof([]), null);
  } finally {
    for (const key of keys)
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    rmSync(dir, { recursive: true, force: true });
  }
});
test("browser observation publication refusal preserves the native failure and blocks repair", () => {
  const keys = [
    "DD_FLOW_CHECK_INVOCATION_ID",
    "DD_FLOW_CHECK_COMMAND",
    "DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH",
    "DD_TASKS_TEST_WORLD",
    "DD_TASKS_TEST_WORLD_RECEIPT",
    "DD_TASKS_BROWSER_OBSERVATION_DIR",
    "DD_TASKS_RUNNER_REPORT",
  ];
  const previous = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );
  const directory = mkdtempSync(path.join(os.tmpdir(), "browser-publication-"));
  try {
    for (const role of [
      "reporter",
      "proof-diagnostic",
      "native",
      "frozen-worker",
    ]) {
      const root = path.join(directory, role);
      mkdirSync(root);
      const reportPath = path.join(root, "report.json");
      Object.assign(process.env, {
        DD_FLOW_CHECK_INVOCATION_ID: `refused-${role}`,
        DD_FLOW_CHECK_COMMAND: "browser publication regression",
        DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: reportPath,
        DD_TASKS_RUNNER_REPORT: reportPath,
        DD_TASKS_BROWSER_OBSERVATION_DIR: path.join(root, "observations"),
        DD_TASKS_TEST_WORLD: "a".repeat(32),
        DD_TASKS_TEST_WORLD_RECEIPT: path.join(root, "ready.json"),
      });
      const world = {
        schema_id: "dd-tasks/test-world-ready@1",
        invocation_id: process.env.DD_FLOW_CHECK_INVOCATION_ID,
        world_id: process.env.DD_TASKS_TEST_WORLD,
        ready: true,
        setup_completed: true,
        migrations_sha256: "b".repeat(64),
        role: "browser",
      };
      writeFileSync(
        process.env.DD_TASKS_TEST_WORLD_RECEIPT,
        JSON.stringify(world),
      );
      const subject = {
        id: "refused",
        repeatEachIndex: 0,
        location: { file: import.meta.filename },
      };
      const result = {
        workerIndex: 0,
        retry: 0,
        status: "timedOut",
        errors: [{ message: "Test timeout of 4000ms exceeded." }],
      };
      const identity = attempt(subject, result),
        key = attemptKey(identity);
      if (["native", "frozen-worker"].includes(role)) {
        const deadline = Date.now() - 20;
        writeObservation(key, "worker", {
          observation_contract: "dd-tasks/browser-observation@2",
          target: { page_id: "page", context_id: "context" },
          window_epoch: 1,
          binding: binding(),
          attempt: identity,
          world,
          phase: "body",
          observation_gap: false,
          step: {
            id: "step",
            category: "pw:api",
            file: import.meta.filename,
            line: 1,
          },
          browser: { connected: true, page_closed: false, crashed: false },
          world_health: { api: true, web: true, db: true },
          quiet_ms: 4000,
          last_progress_at: new Date(deadline - 4000).toISOString(),
          deadline_at: new Date(deadline).toISOString(),
          observed_at: new Date(deadline - 30).toISOString(),
          health_observed_at: new Date(deadline - 40).toISOString(),
        });
      }
      mkdirSync(
        path.join(
          process.env.DD_TASKS_BROWSER_OBSERVATION_DIR,
          `${key}.${role}.json`,
        ),
        { recursive: true },
      );
      const reporter = new Reporter();
      reporter.onTestBegin(subject, result);
      assert.doesNotThrow(() => reporter.onTestEnd(subject, result), role);
      reporter.onEnd({ status: "failed" });
      const report = JSON.parse(readFileSync(reportPath));
      assert.equal(validReport(report), true, role);
      assert.equal(report.counts.failed, 1);
      assert.ok(
        report.failures.some(
          (failure) => failure.message === result.errors[0].message,
        ),
        role,
      );
      assert.ok(
        report.failures.some(
          (failure) =>
            failure.code === "browser_observation_publication_failed",
        ),
        role,
      );
      assert.ok(
        report.failures.every((failure) => !failure.repair_evidence),
        role,
      );
    }
  } finally {
    for (const key of keys)
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    rmSync(directory, { recursive: true, force: true });
  }
});
test("native missing browser installation is tooling, not an arbitrary launch error", async () => {
  const directory = mkdtempSync(
    path.join(os.tmpdir(), "browser-missing-install-"),
  );
  try {
    const reportPath = path.join(directory, "report.json");
    const config = path.join(directory, "config.mjs");
    const nativeModule = pathToFileURL(
      require.resolve("@playwright/test"),
    ).href;
    writeFileSync(
      path.join(directory, "probe.spec.mjs"),
      `import native from ${JSON.stringify(nativeModule)}; const {test}=native;
test('missing installed browser',async({browser})=>{});
test('generic launch error',()=>{throw new Error('browserType.launch: arbitrary launch failure');});`,
    );
    writeFileSync(
      config,
      `export default {testDir:${JSON.stringify(directory)},outputDir:${JSON.stringify(path.join(directory, "artifacts"))},testMatch:'probe.spec.mjs',workers:1,retries:0,reporter:[[${JSON.stringify(path.join(root, "scripts/playwright-observation.mjs"))}]]};`,
    );
    const child = spawn(
      process.execPath,
      [require.resolve("@playwright/test/cli"), "test", "--config", config],
      {
        cwd: root,
        env: {
          ...process.env,
          PLAYWRIGHT_BROWSERS_PATH: path.join(directory, "empty-browser-cache"),
          DD_FLOW_CHECK_INVOCATION_ID: "missing-install",
          DD_FLOW_CHECK_COMMAND: "native missing install regression",
          DD_TASKS_RUNNER_REPORT: reportPath,
          DD_TASKS_BROWSER_OBSERVATION_DIR: path.join(
            directory,
            "observations",
          ),
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let output = "";
    for (const stream of [child.stdout, child.stderr])
      stream.on("data", (chunk) => {
        output += chunk;
      });
    const status = await new Promise((resolve, reject) => {
      child.on("error", reject);
      child.on("close", resolve);
    });
    assert.equal(status, 1, output);
    const report = JSON.parse(readFileSync(reportPath));
    assert.equal(validReport(report), true, output);
    assert.equal(report.counts.failed, 2);
    const missing = report.failures.find(
      (failure) => failure.code === "playwright_browser_executable_missing",
    );
    assert.ok(missing, JSON.stringify(report));
    assert.equal(missing.category, "tooling");
    assert.equal(missing.origin, "tooling");
    const generic = report.failures.find((failure) =>
      failure.message.includes("arbitrary launch failure"),
    );
    assert.equal(generic.category, "unclassified");
    assert.equal(generic.origin, "unknown");
    assert.ok(report.failures.every((failure) => !failure.repair_evidence));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
test("native browser quiet window rearms and completes body/teardown timeouts", async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "dd-browser-observation-"));
  let world, server;
  let failed = false;
  try {
    const file = (name) => path.join(dir, name);
    const environment = {};
    if (process.env.DD_TASKS_TEST_ADMIN_URL) {
      const api = createRequire(
        new URL("../apps/api/package.json", import.meta.url),
      );
      const { tsImport } = api("tsx/esm/api");
      const { createTestWorld } = await tsImport(
        "../apps/api/src/db/test-world.ts",
        import.meta.url,
      );
      world = await createTestWorld();
      let healthy = true;
      server = createServer((request, response) => {
        if (request.url === "/make-unhealthy") healthy = false;
        response.statusCode = healthy ? 200 : 503;
        response.end("healthy contract fixture");
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      environment.DATABASE_URL = world.url;
      environment.DD_TASKS_TEST_WORLD = world.token;
      environment.DD_FLOW_PORT_API = String(server.address().port);
      environment.DD_FLOW_PORT_WEB = String(server.address().port);
      environment.DD_TASKS_TEST_WORLD_RECEIPT = file("ready.json");
      writeFileSync(
        file("ready.json"),
        JSON.stringify({
          schema_id: "dd-tasks/test-world-ready@1",
          invocation_id: "browser-contract",
          world_id: world.token,
          ready: true,
          setup_completed: true,
          migrations_sha256: "a".repeat(64),
          role: "browser",
        }),
      );
    }
    writeFileSync(
      file("contract.spec.mjs"),
      `import {test,expect,observeInactivity} from ${JSON.stringify(pathToFileURL(path.join(root, "scripts/browser-fixture.mjs")).href)};
import nativePlaywright from ${JSON.stringify(pathToFileURL(require.resolve("@playwright/test")).href)};
const {test:nativeBase}=nativePlaywright;
test('long healthy body and teardown',async({page})=>{await page.setContent('<button>ok</button>');for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,750));await test.step('body '+i,async()=>expect(await page.title()).toBe(''));}});
test.afterEach(async({},info)=>{if(info.title.includes('long healthy'))for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,750));await test.step('cleanup '+i,async()=>expect(true).toBe(true));}if(info.title==='hung afterEach')await new Promise(()=>{});});
test('missing locator',async({page})=>{await page.setContent('<p>not a button</p>');await page.getByRole('button',{name:'missing'}).click();});
test('hung afterEach',async({page})=>{await page.setContent('<p>ok</p>');});
const delayed=nativeBase.extend({_startupDelay:async({},use)=>{await new Promise(r=>setTimeout(r,2000));await use();},_observeInactivity:[async({browser,_startupDelay},use,info)=>observeInactivity(browser,use,info),{auto:true}]});
delayed('delayed fixture missing locator',async({page})=>{await page.setContent('<p>not a button</p>');await page.getByRole('button',{name:'missing'}).click();});
delayed('delayed fixture passes',async({page})=>{await page.setContent('<button>ok</button>');await page.getByRole('button').click();});
test('unhealthy missing locator',async({page})=>{if(process.env.DD_FLOW_PORT_API)await fetch('http://127.0.0.1:'+process.env.DD_FLOW_PORT_API+'/make-unhealthy');await page.setContent('<p>not a button</p>');await page.getByRole('button',{name:'missing'}).click();});`,
    );
    writeFileSync(
      file("config.mjs"),
      `export default {testDir:${JSON.stringify(dir)},outputDir:${JSON.stringify(file("artifacts"))},testMatch:'*.spec.mjs',workers:1,retries:0,timeout:0,reporter:[[${JSON.stringify(path.join(root, "scripts/playwright-observation.mjs"))}],['json',{outputFile:${JSON.stringify(file("native.json"))}}]],use:{headless:true,trace:'retain-on-failure'}};`,
    );
    const child = spawn(
      process.execPath,
      [
        require.resolve("@playwright/test/cli"),
        "test",
        "--config",
        file("config.mjs"),
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          ...environment,
          DD_TASKS_TEST_WATCHDOG: "1",
          DD_FLOW_TEST_EXECUTION_SILENCE_MS: "4000",
          DD_TASKS_BROWSER_OBSERVATION_DIR: file("observations"),
          DD_TASKS_RUNNER_REPORT: file("report.json"),
          DD_FLOW_CHECK_INVOCATION_ID: "browser-contract",
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let output = "";
    child.stdout.on("data", (data) => {
      output += data;
    });
    child.stderr.on("data", (data) => {
      output += data;
    });
    const status = await new Promise((resolve, reject) => {
      child.on("error", reject);
      child.on("close", resolve);
    });
    assert.equal(status, 1, output);
    const report = JSON.parse(readFileSync(file("native.json"), "utf8"));
    const results = report.suites.flatMap((suite) =>
      suite.specs.map((spec) => [spec.title, spec.tests[0].results[0].status]),
    );
    assert.deepEqual(
      results,
      [
        ["long healthy body and teardown", "passed"],
        ["missing locator", "timedOut"],
        ["hung afterEach", "timedOut"],
        ["delayed fixture missing locator", "timedOut"],
        ["delayed fixture passes", "passed"],
        ["unhealthy missing locator", "timedOut"],
      ],
      output,
    );
    const missingLocator = report.suites
      .flatMap((suite) => suite.specs)
      .find((spec) => spec.title === "missing locator");
    const trace = missingLocator.tests[0].results[0].attachments.find(
      (attachment) => attachment.name === "trace",
    );
    assert.ok(
      trace?.path,
      "native missing-locator timeout retains its trace attachment",
    );
    const tracePath = realpathSync(trace.path);
    const relativeTrace = path.relative(
      realpathSync(file("artifacts")),
      tracePath,
    );
    assert.ok(
      !path.isAbsolute(relativeTrace) &&
        relativeTrace !== ".." &&
        !relativeTrace.startsWith(`..${path.sep}`),
      "trace stays in this isolated invocation's artifact directory",
    );
    assert.equal(path.basename(tracePath), "trace.zip");
    assert.equal(
      readFileSync(tracePath).subarray(0, 2).toString(),
      "PK",
      "native trace archive is present before private temp cleanup",
    );
    const specs = report.suites.flatMap((suite) => suite.specs);
    for (const title of [
      "missing locator",
      "delayed fixture missing locator",
      "unhealthy missing locator",
    ]) {
      const spec = specs.find((spec) => spec.title === title);
      const result = spec.tests[0].results[0];
      const key = attemptKey({
        invocation_id: "browser-contract",
        test_id: spec.id,
        retry: result.retry ?? 0,
        repeat_each_index: spec.tests[0].repeatEachIndex ?? 0,
        worker_index: result.workerIndex,
      });
      const snapshot = JSON.parse(
        readFileSync(file(`observations/${key}.worker.json`), "utf8"),
      );
      assert.equal(
        snapshot.attempt.test_id,
        spec.id,
        `${title} has its own snapshot`,
      );
      assert.equal(snapshot.native_timeout.supported, true);
      if (title === "unhealthy missing locator" && world)
        assert.equal(snapshot.world_health.api, false);
    }
    const evidence = JSON.parse(readFileSync(file("report.json"), "utf8"));
    assert.equal(evidence.counts.passed, 2);
    assert.equal(evidence.counts.failed, 4);
    const unhealthyId = specs.find(
      (spec) => spec.title === "unhealthy missing locator",
    ).id;
    const unhealthyFailures = evidence.failures.filter(
      (failure) => failure.test_id === unhealthyId,
    );
    assert.ok(unhealthyFailures.length > 0);
    assert.ok(unhealthyFailures.every((failure) => !failure.repair_evidence));
    if (world) {
      assert.equal(
        evidence.failures.filter(
          (failure) =>
            failure.repair_evidence?.rule ===
            "candidate_browser_action_inactivity",
        ).length,
        2,
        "both ordinary and delayed-fixture body actions receive proof; teardown does not",
      );
    } else
      assert.ok(
        evidence.failures.every((failure) => !failure.repair_evidence),
        "unknown world health must not grant source repair",
      );
  } catch (error) {
    failed = true;
    error.message += `\nRetained browser contract diagnostics: ${dir}`;
    throw error;
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (world) await world.drop();
    if (!failed) rmSync(dir, { recursive: true, force: true });
  }
});
