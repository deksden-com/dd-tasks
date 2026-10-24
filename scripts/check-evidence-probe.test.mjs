import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { produceEvidenceProbe } from "./check-evidence-probe.mjs";
import { validReport } from "./test-observation.mjs";

test("failure capability probe executes real isolated producers", () => {
  const outputRoot = mkdtempSync(path.join(os.tmpdir(), "evidence-probe101-"));
  const binding = {
    invocation_id: "probe",
    check_id: "probe",
    command: "producer capability probe",
    input_hash: "a".repeat(64),
    verification_epoch: "b".repeat(64),
  };
  try {
    const manifest = produceEvidenceProbe({ outputRoot, binding });
    assert.equal(manifest.schema_id, "dd-tasks/check-evidence-probe@1");
    assert.deepEqual(
      manifest.cases.map((item) => item.id),
      [
        "browser-window",
        "runtime-error",
        "runtime-typeerror",
        "compiler",
        "composite",
      ],
    );
    for (const item of manifest.cases) {
      const report = JSON.parse(
        readFileSync(path.join(outputRoot, item.root, item.contract.path)),
      );
      assert.equal(validReport(report), true, JSON.stringify(report));
      assert.equal(report.completed, true);
      assert.ok(report.failures.length);
      assert.deepEqual(report.binding, item.binding);
      assert.equal(item.expected, "source_repair");
    }
    assert.throws(() => produceEvidenceProbe({ outputRoot, binding }), /exist/);
    assert.throws(
      () => produceEvidenceProbe({ outputRoot, binding: {} }),
      /binding/,
    );
  } finally {
    rmSync(outputRoot, { recursive: true });
  }
});
