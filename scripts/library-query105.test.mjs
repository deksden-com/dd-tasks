import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeFailure } from "./test-observation.mjs";

test("library and browser errors remain diagnostics without causal proofs", () => {
  for (const [name, message, stack] of [
    [
      "Error",
      "expect(element).toHaveTextContent()",
      "Error: mismatch\n    at dependency.js:1:1",
    ],
    [
      "Error",
      "Invalid Chai property: toBeSelected",
      "Error: invalid matcher\n    at chai.js:1:1",
    ],
    [
      "TestingLibraryElementError",
      "Unable to find element",
      "Error: query\n    at library.js:1:1",
    ],
    [
      "SyntaxError",
      "Unexpected end of JSON input",
      "Error: page.evaluate\n    at eval (:311:30)",
    ],
    ["FutureError", "a new native error", undefined],
  ]) {
    const failure = normalizeFailure(
      { name, message, stack },
      { phase: "test", file: import.meta.filename },
    );
    assert.equal(failure.message, message);
    assert.equal(failure.code, name);
    assert.equal(failure.origin, "unknown");
    assert.equal(failure.repair_evidence, undefined);
    if (stack) assert.equal(failure.stack, stack);
  }
});
