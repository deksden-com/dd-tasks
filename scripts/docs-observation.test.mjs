import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
test("docs checker publishes exact missing declaration and document errors, not I/O repair", (context) => {
  const directory = mkdtempSync(path.join(root, ".docs-test-"));
  const locked = path.join(directory, ".memory-bank/index.md");
  try {
    for (const file of [
      ".memory-bank",
      "scripts",
      "README.md",
      "Dockerfile",
      "compose.preview.yml",
      "package.json",
    ])
      cpSync(path.join(root, file), path.join(directory, file), {
        recursive: true,
      });
    const reportPath = path.join(directory, "report.json");
    const run = () => {
      const child = spawnSync(
        process.execPath,
        [
          "scripts/test-runner.mjs",
          process.execPath,
          "--input-type=module",
          "-e",
          `process.chdir(${JSON.stringify(directory)}); await import(${JSON.stringify(pathToFileURL(path.join(root, "scripts/docs-check.mjs")).href)});`,
        ],
        {
          cwd: root,
          encoding: "utf8",
          env: {
            ...process.env,
            DD_FLOW_CHECK_INVOCATION_ID: "docs-test",
            DD_FLOW_CHECK_COMMAND: "docs-check",
            DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: reportPath,
          },
        },
      );
      const report = JSON.parse(readFileSync(reportPath));
      rmSync(reportPath);
      return { child, report };
    };
    assert.equal(run().child.status, 0);
    rmSync(path.join(directory, "README.md"));
    const missing = run();
    assert.equal(missing.child.status, 1);
    const proof = missing.report.failures.find(
      (failure) => failure.repair_evidence?.path_state === "missing",
    )?.repair_evidence;
    assert.ok(proof, JSON.stringify(missing.report) + missing.child.stderr);
    assert.equal(proof.file, path.join(directory, "README.md"));
    assert.equal(proof.file_sha256, null);
    assert.equal(
      proof.declaration.file,
      path.join(directory, "scripts/docs-check.mjs"),
    );
    cpSync(path.join(root, "README.md"), path.join(directory, "README.md"));
    writeFileSync(
      locked,
      `${readFileSync(locked, "utf8")}\n[broken](not-a-document.md)\n`,
    );
    const broken = run();
    assert.equal(broken.child.status, 1);
    assert.ok(
      broken.report.failures.some(
        (failure) =>
          failure.repair_evidence?.file === locked &&
          failure.repair_evidence?.path_state === "present",
      ),
    );
    chmodSync(locked, 0);
    const denied = run();
    if (
      denied.child.status === 0 ||
      denied.report.failures.some((failure) => failure.repair_evidence)
    )
      context.diagnostic(
        "Permission negative unavailable on this filesystem identity",
      );
    else
      assert.ok(
        denied.report.failures.every((failure) => !failure.repair_evidence) &&
          denied.report.failures.some(
            (failure) =>
              failure.code === "EACCES" && failure.native_code === "EACCES",
          ),
      );
  } finally {
    try {
      chmodSync(locked, 0o600);
    } catch {}
    rmSync(directory, { recursive: true, force: true });
  }
});
