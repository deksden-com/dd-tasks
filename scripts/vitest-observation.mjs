import { createRequire } from "node:module";
import { evidence, normalizeFailure, progress } from "./test-observation.mjs";

const version = createRequire(import.meta.url)("vitest/package.json").version;
export default class Reporter {
  counts = { passed: 0, failed: 0, skipped: 0 };
  failures = [];
  hookErrors = new Set();
  pendingHooks = new Map();
  onHookStart(hook) {
    this.captureHook(hook.entity);
    this.pendingHooks.set(hook.entity.id, hook);
  }
  onHookEnd(hook) {
    this.pendingHooks.delete(hook.entity.id);
  }
  captureHook(entity) {
    const hook = this.pendingHooks.get(entity.id);
    if (!hook) return;
    const errors = entity.errors?.() ?? entity.result?.().errors ?? [];
    for (const error of errors) {
      if (this.hookErrors.has(error)) continue;
      this.hookErrors.add(error);
      this.failures.push(
        normalizeFailure(error, {
          phase: hook.name.startsWith("before") ? "setup" : "teardown",
          file: hook.entity.module?.moduleId ?? hook.entity.moduleId,
          test_id: hook.entity.id,
          assertion: error.name === "AssertionError",
        }),
      );
    }
  }
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
    this.captureHook(test);
    const result = test.result();
    if (result.state === "passed") this.counts.passed++;
    else if (result.state === "failed") {
      this.counts.failed++;
      const errors = result.errors ?? [];
      for (const error of errors.length ? errors : [{}])
        if (!this.hookErrors.has(error))
          this.failures.push(
            normalizeFailure(error, {
              phase: "test",
              file: test.module?.moduleId,
              test_id: test.id,
              assertion: error.name === "AssertionError",
            }),
          );
    } else this.counts.skipped++;
    progress(`test_completed:${test.id}`);
  }
  onTestRunEnd(modules, errors, reason) {
    const visit = (suite) => {
      this.captureHook(suite);
      for (const error of suite.errors?.() ?? []) {
        if (this.hookErrors.has(error)) continue;
        this.failures.push(
          normalizeFailure(error, {
            phase: "collection",
            file: suite.module?.moduleId ?? suite.moduleId,
            test_id: suite.id,
          }),
        );
      }
      for (const child of suite.children ?? [])
        if (child.type !== "test") visit(child);
    };
    for (const module of modules) visit(module);
    for (const error of errors)
      this.failures.push(
        normalizeFailure(error, { phase: "runner", tooling: true }),
      );
    evidence(
      { name: "vitest", version },
      this.counts,
      this.failures,
      reason === "passed" || reason === "failed",
    );
    progress("test_run_completed");
  }
}
