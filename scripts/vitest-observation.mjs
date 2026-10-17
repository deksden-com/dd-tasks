import { createRequire } from "node:module";
import { evidence, normalizeFailure, progress } from "./test-observation.mjs";

const version = createRequire(import.meta.url)("vitest/package.json").version;
// Vitest can reconstruct serialized Error objects between hook and suite views.
// Only a full native trace within the same entity identifies that projection.
function errorIdentity(error) {
  if (!error.stack && !error.stackStr && !error.stacks?.length) return error;
  try {
    return JSON.stringify([
      error.name,
      error.message,
      error.value,
      error.code,
      error.stack ?? error.stackStr ?? error.stacks,
    ]);
  } catch {
    return error;
  }
}
export default class Reporter {
  counts = { passed: 0, failed: 0, skipped: 0 };
  failures = [];
  hookErrors = new Map();
  capturedHooks = new WeakMap();
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
    const captured = this.capturedHooks.get(hook) ?? new Map();
    const occurrences = new Map();
    this.capturedHooks.set(hook, captured);
    const owner = entity.id ?? entity;
    const projections = this.hookErrors.get(owner) ?? new Map();
    this.hookErrors.set(owner, projections);
    for (const error of errors) {
      const identity = errorIdentity(error);
      const occurrence = (occurrences.get(identity) ?? 0) + 1;
      occurrences.set(identity, occurrence);
      if (occurrence <= (captured.get(identity) ?? 0)) continue;
      captured.set(identity, occurrence);
      projections.set(identity, (projections.get(identity) ?? 0) + 1);
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
  withoutHookProjections(entity, errors) {
    const remaining = new Map(this.hookErrors.get(entity.id ?? entity));
    return errors.filter((error) => {
      const identity = errorIdentity(error),
        count = remaining.get(identity) ?? 0;
      if (!count) return true;
      remaining.set(identity, count - 1);
      return false;
    });
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
      for (const error of this.withoutHookProjections(
        test,
        errors.length ? errors : [{}],
      ))
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
      for (const error of this.withoutHookProjections(
        suite,
        suite.errors?.() ?? [],
      )) {
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
