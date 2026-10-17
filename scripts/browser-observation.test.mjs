import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
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
import Reporter from "./playwright-observation.mjs";
import { binding } from "./test-observation.mjs";

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
      server = createServer((_, response) => {
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
      `import {test,expect} from ${JSON.stringify(pathToFileURL(path.join(root, "scripts/browser-fixture.mjs")).href)};
test('long healthy body and teardown',async({page})=>{await page.setContent('<button>ok</button>');for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,750));await test.step('body '+i,async()=>expect(await page.title()).toBe(''));}});
test.afterEach(async({},info)=>{if(info.title.includes('long healthy'))for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,750));await test.step('cleanup '+i,async()=>expect(true).toBe(true));}if(info.title==='hung afterEach')await new Promise(()=>{});});
test('missing locator',async({page})=>{await page.setContent('<p>not a button</p>');await page.getByRole('button',{name:'missing'}).click();});
test('hung afterEach',async({page})=>{await page.setContent('<p>ok</p>');});`,
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
    const observations = readdirSync(file("observations")).filter((name) =>
      name.endsWith(".worker.json"),
    );
    assert.ok(
      observations.length >= 1,
      "predeadline worker snapshot survives a native timeout",
    );
    const evidence = JSON.parse(readFileSync(file("report.json"), "utf8"));
    assert.equal(evidence.counts.passed, 1);
    assert.equal(evidence.counts.failed, 2);
    if (world) {
      assert.equal(
        evidence.failures.filter(
          (failure) =>
            failure.repair_evidence?.rule ===
            "candidate_browser_action_inactivity",
        ).length,
        1,
        "only the body action with healthy browser/world gets proof",
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
