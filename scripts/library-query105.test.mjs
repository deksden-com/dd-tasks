import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

test("native synchronous library queries retain machine frames before DOM diagnostic truncation", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "query105-"));
  const prior = process.env.DD_TASKS_RUNNER_REPORT, priorOfficial = process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH;
  try {
    const root = realpathSync(directory), scripts = path.join(root, "scripts"); mkdirSync(scripts);
    for (const name of ["test-observation", "source-diagnostic", "runner-progress"]) cpSync(new URL(`./${name}.mjs`, import.meta.url), path.join(scripts, `${name}.mjs`));
    const require = createRequire(new URL("../apps/web/package.json", import.meta.url));
    const installed = path.dirname(createRequire(require.resolve("@testing-library/react")).resolve("@testing-library/dom/package.json"));
    const local = path.join(root, "node_modules/@testing-library/dom"); mkdirSync(path.dirname(local), { recursive: true });
    cpSync(installed, local, { recursive: true, filter: file => file === installed || path.basename(file) !== "node_modules" }); symlinkSync(path.dirname(path.dirname(installed)), path.join(local, "node_modules"), "dir");
    cpSync(new URL("../pnpm-lock.yaml", import.meta.url), path.join(root, "pnpm-lock.yaml"));
    const file = path.join(root, "query.test.cjs");
    writeFileSync(file, `module.exports = (document, method, text) => require('./node_modules/@testing-library/dom')[method](document.body, text);\n`);
    const query = createRequire(import.meta.url)(file), { JSDOM } = require("jsdom");
    const { normalizeFailure, validReport } = await import(pathToFileURL(path.join(scripts, "test-observation.mjs")));
    process.env.DD_TASKS_RUNNER_REPORT = path.join(root, "report.json"); delete process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH;
    const context = { file, phase: "test", test_id: "native-query-test" };
    for (const [method, html, text] of [["getByText", "<p>duplicate</p><p>duplicate</p>", "duplicate"], ["queryByText", "<p>duplicate</p><p>duplicate</p>", "duplicate"], ["getByText", "<p>present</p>", "absent"]]) {
      let error; try { query(new JSDOM(html).window.document, method, text); } catch (caught) { error = caught; }
      assert.equal(error?.name, "TestingLibraryElementError");
      const failure = normalizeFailure(error, context);
      assert.equal(failure.repair_evidence?.rule, "candidate_library_query_error", JSON.stringify(failure));
      assert.equal(failure.origin, "candidate");
      const native = JSON.parse(readFileSync(path.join(root, failure.repair_evidence.native_artifact.relative_path)));
      assert.equal(native.frames_complete, true); assert.equal(native.library_inputs.length, 4);
      assert.ok(native.frame_lines.every(line => Buffer.byteLength(line) <= 4096));
      assert.equal(validReport({ schema_id: "dd-flow/check-runner-evidence@2", binding: { invocation_id: "i", check_id: "c", command: "t", input_hash: "h", verification_epoch: "e" }, runner: { name: "vitest", version: "3.2.7" }, completed: true, counts: { passed: 0, failed: 1, skipped: 0 }, failures: [failure] }), true);
      const large = { name: error.name, message: "large DOM", stack: `${error.name}: ${"DOM".repeat(7000)}\n${error.stack.split("\n").filter(line => /^\s*at\s/.test(line)).join("\n")}` };
      assert.equal(normalizeFailure(large, context).repair_evidence?.rule, "candidate_library_query_error");
      for (const mutation of [
        { ...error, name: error.name, stack: `${error.name}: spoof\n    at ${file}:1:1` },
        { name: error.name, stack: error.stack.replace("getElementError", "waitForWrapper") },
        { name: error.name, stack: `${error.name}: ${"x".repeat(256 * 1024)}` },
      ]) assert.equal(normalizeFailure(mutation, context).repair_evidence, undefined);
      for (const phase of ["setup", "collection", "teardown", "runner"]) assert.equal(normalizeFailure(error, { ...context, phase }).repair_evidence, undefined);
    }
    let asyncError;
    try { await query(new JSDOM("<p>present</p>").window.document, "findByText", "absent"); } catch (caught) { asyncError = caught; }
    const unsupported = normalizeFailure(asyncError ?? {}, context);
    assert.equal(unsupported.repair_evidence, undefined);
    assert.equal(unsupported.classification_reason, "unsupported_library_query_shape");
  } finally {
    if (prior === undefined) delete process.env.DD_TASKS_RUNNER_REPORT; else process.env.DD_TASKS_RUNNER_REPORT = prior;
    if (priorOfficial === undefined) delete process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH; else process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH = priorOfficial;
    rmSync(directory, { recursive: true, force: true });
  }
});
