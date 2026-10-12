import { createRequire } from "node:module";
import { evidence, progress } from "./test-observation.mjs";

const version = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
)("@playwright/test/package.json").version;
export default class Reporter {
  counts = { passed: 0, failed: 0, skipped: 0 };
  failures = [];
  onBegin() {
    progress("test_run_started");
  }
  onTestBegin(test) {
    progress(`test_started:${test.id}`);
  }
  onStepEnd(test, _result, step) {
    progress(
      `step_completed:${test.id}:${step.startTime.toISOString()}:${step.title}`,
    );
  }
  onTestEnd(test, result) {
    if (result.status === "passed") this.counts.passed++;
    else if (result.status === "skipped") this.counts.skipped++;
    else {
      this.counts.failed++;
      this.failures.push({
        category:
          result.status === "timedOut" || result.status === "interrupted"
            ? "tooling"
            : "unclassified",
        code: result.status,
        message: result.errors.map((error) => error.message).join("\n"),
      });
    }
    progress(`test_completed:${test.id}`);
  }
  onError(error) {
    this.failures.push({
      category: "tooling",
      code: "runner_error",
      message: error.message,
    });
  }
  onEnd(result) {
    evidence(
      { name: "playwright", version },
      this.counts,
      this.failures,
      result.status !== "interrupted",
    );
    progress("test_run_completed");
  }
}
