import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

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
test("native browser quiet window rearms and completes body/teardown timeouts", async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "dd-browser-observation-"));
  let world, server;
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
test('long healthy body and teardown',async({page})=>{await page.setContent('<button>ok</button>');for(let i=0;i<7;i++){await new Promise(r=>setTimeout(r,300));await test.step('body '+i,async()=>expect(await page.title()).toBe(''));}});
test.afterEach(async({},info)=>{if(info.title.includes('long healthy'))for(let i=0;i<7;i++){await new Promise(r=>setTimeout(r,300));await test.step('cleanup '+i,async()=>expect(true).toBe(true));}if(info.title==='hung afterEach')await new Promise(()=>{});});
test('missing locator',async({page})=>{await page.setContent('<p>not a button</p>');await page.getByRole('button',{name:'missing'}).click();});
test('hung afterEach',async({page})=>{await page.setContent('<p>ok</p>');});`,
    );
    writeFileSync(
      file("config.mjs"),
      `export default {testDir:${JSON.stringify(dir)},testMatch:'*.spec.mjs',workers:1,retries:0,timeout:0,reporter:[[${JSON.stringify(path.join(root, "scripts/playwright-observation.mjs"))}],['json',{outputFile:${JSON.stringify(file("native.json"))}}]],use:{headless:true}};`,
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
          DD_FLOW_TEST_EXECUTION_SILENCE_MS: "2000",
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
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (world) await world.drop();
    rmSync(dir, { recursive: true, force: true });
  }
});
