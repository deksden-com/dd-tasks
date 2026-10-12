import { createRequire } from "node:module";
import { evidence, progress } from "./test-observation.mjs";

const version = createRequire(import.meta.url)("vitest/package.json").version;
export default class Reporter {
  counts = { passed: 0, failed: 0, skipped: 0 };
  failures = [];
  onTestRunStart() {
    progress("test_run_started", "startup");
  }
  onTestModuleCollected(module) {
    progress(`module_collected:${module.moduleId}`, "startup");
  }
  onTestCaseReady(test) {
    progress(`test_started:${test.id}`);
  }
  onTestCaseResult(test) {
    const result = test.result();
    if (result.state === "passed") this.counts.passed++;
    else if (result.state === "failed") {
      this.counts.failed++;
      const errors = result.errors ?? [];
      for (const error of errors.length ? errors : [{}])
        this.failures.push({
          category:
            error.name === "AssertionError" ? "assertion" : "unclassified",
          code: error.name ?? "test_failure",
          message: String(error.message ?? "Test failed"),
        });
    } else this.counts.skipped++;
    progress(`test_completed:${test.id}`);
  }
  onTestRunEnd(_modules, errors, reason) {
    for (const error of errors)
      this.failures.push({
        category: "tooling",
        code: error.name ?? "runner_error",
        message: String(error.message),
      });
    evidence(
      { name: "vitest", version },
      this.counts,
      this.failures,
      reason === "passed" || reason === "failed",
    );
    progress("test_run_completed");
  }
}
