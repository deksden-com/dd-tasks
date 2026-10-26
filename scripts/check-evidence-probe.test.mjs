import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { produceEvidenceProbe } from "./check-evidence-probe.mjs";
import { validReport } from "./test-observation.mjs";

test("explicit diagnostic probe executes real isolated producers", () => {
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
      assert.equal(
        report.failures.some((failure) => failure.category === "tooling"),
        false,
        JSON.stringify(report),
      );
      if (item.id === "composite") {
        assert.ok(report.steps[0].report);
        assert.equal(report.steps[0].state, "failed");
        assert.equal(report.steps[0].exit_code, 1);
        assert.ok(report.failures[0].child_evidence);
      }
      assert.deepEqual(report.binding, item.binding);
      assert.equal(item.expected, "diagnosis_required");
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

test("probe @2 adds a real library query while @1 stays backward compatible", () => {
  const outputRoot = mkdtempSync(path.join(os.tmpdir(), "evidence-probe105-"));
  try {
    const manifest = produceEvidenceProbe({
      outputRoot,
      contract: "dd-tasks/check-evidence-probe@2",
      binding: {
        invocation_id: "query",
        check_id: "query",
        command: "probe",
        input_hash: "a".repeat(64),
        verification_epoch: "b".repeat(64),
      },
    });
    assert.equal(manifest.schema_id, "dd-tasks/check-evidence-probe@2");
    assert.equal(manifest.cases.length, 6);
    const item = manifest.cases.find((item) => item.id === "library-query");
    const report = JSON.parse(
      readFileSync(path.join(outputRoot, item.root, item.contract.path)),
    );
    assert.equal(validReport(report), true);
    assert.equal(report.failures[0].repair_evidence, undefined);
    assert.equal(report.failures[0].category, "unclassified");
    assert.throws(
      () => produceEvidenceProbe({ outputRoot, contract: "foreign" }),
      /contract/,
    );
  } finally {
    rmSync(outputRoot, { recursive: true });
  }
});
