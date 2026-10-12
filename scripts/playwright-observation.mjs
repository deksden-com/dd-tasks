import { createRequire } from "node:module";
import { evidence, progress } from "./test-observation.mjs";

const version = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
)("@playwright/test/package.json").version;

function errorSignature(error) {
  if (!error || typeof error.stack !== "string" || !error.stack) return null;
  return JSON.stringify([
    error.message ?? null,
    error.stack,
    error.value ?? null,
  ]);
}
export default class Reporter {
  counts = { passed: 0, failed: 0, skipped: 0 };
  failures = [];
  expectationErrors = new WeakMap();
  onBegin() {
    progress("test_run_started");
  }
  onTestBegin(test, result) {
    if (result) this.expectationErrors.set(result, new Set());
    progress(`test_started:${test.id}`);
  }
  onStepEnd(test, result, step) {
    if (step.category === "expect" && step.error) {
      const signature = errorSignature(step.error);
      if (signature) {
        const errors = this.expectationErrors.get(result) ?? new Set();
        errors.add(signature);
        this.expectationErrors.set(result, errors);
      }
    }
    progress(
      `step_completed:${test.id}:${step.startTime.toISOString()}:${step.title}`,
    );
  }
  onTestEnd(test, result) {
    if (result.status === "passed") this.counts.passed++;
    else if (result.status === "skipped") this.counts.skipped++;
    else {
      this.counts.failed++;
      const tooling =
        result.status === "timedOut" || result.status === "interrupted";
      const proof = this.expectationErrors.get(result) ?? new Set();
      const failures = (result.errors.length ? result.errors : [{}]).map(
        (error) => ({
          category: proof.has(errorSignature(error))
            ? "assertion"
            : tooling
              ? "tooling"
              : "unclassified",
          code: result.status,
          message:
            error.message ??
            error.value ??
            "Test failed without structured error",
        }),
      );
      if (tooling && !failures.some((error) => error.category === "tooling"))
        failures.push({
          category: "tooling",
          code: result.status,
          message: "Runner did not complete normally",
        });
      this.failures.push(...failures);
    }
    this.expectationErrors.delete(result);
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
