import { createRequire } from "node:module";
import { stripVTControlCharacters } from "node:util";
import {
  artifactReference,
  attempt,
  attemptKey,
  readObservation,
  writeObservation,
} from "./browser-observation.mjs";
import {
  binding,
  evidence,
  normalizeFailure,
  progress,
  readyWorldProof,
} from "./test-observation.mjs";

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
  observations = new WeakMap();
  onBegin() {
    progress("test_run_started");
  }
  onTestBegin(test, result) {
    if (result) this.expectationErrors.set(result, new Set());
    this.observations.set(result, {
      attempt: attempt(test, result),
      sequence: 0,
      active: new Map(),
      steps: new WeakMap(),
      last_progress_at: Date.now(),
      progress_phase: "body",
    });
    progress(`test_started:${test.id}`);
  }
  onStepBegin(test, result, step) {
    const state = this.observations.get(result);
    if (!state) return;
    const id = `${test.id}:${step.startTime.toISOString()}:${state.sequence++}`;
    state.steps.set(step, id);
    let hook = false;
    for (let item = step.parent; item; item = item.parent)
      if (item.category === "hook" || item.category === "fixture") hook = true;
    if (!hook && ["pw:api", "expect"].includes(step.category))
      state.active.set(id, {
        id,
        category: step.category,
        file: step.location?.file,
        line: step.location?.line,
      });
    this.publish(state);
  }
  publish(state, terminal = false) {
    writeObservation(attemptKey(state.attempt), "reporter", {
      attempt: state.attempt,
      sequence: state.sequence,
      last_progress_at: state.last_progress_at,
      progress_phase: state.progress_phase,
      active_step: [...state.active.values()].at(-1),
      terminal,
    });
  }
  onStepEnd(test, result, step) {
    const state = this.observations.get(result);
    if (state) {
      state.active.delete(state.steps.get(step));
      const teardown = (() => {
        for (let item = step; item; item = item.parent)
          if (/afterEach|After Hooks|teardown/i.test(item.title)) return true;
        return false;
      })();
      if (
        !step.error &&
        ["pw:api", "expect", "test.step"].includes(step.category)
      ) {
        state.last_progress_at = Date.now();
        state.progress_phase = teardown ? "teardown" : "body";
      }
      state.sequence++;
      this.publish(state);
    }
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
    const state = this.observations.get(result);
    const snapshot =
      state && readObservation(attemptKey(state.attempt), "worker");
    if (state) this.publish(state, true);
    if (result.status === "passed") this.counts.passed++;
    else if (result.status === "skipped") this.counts.skipped++;
    else {
      this.counts.failed++;
      const tooling =
        result.status === "timedOut" || result.status === "interrupted";
      const proof = this.expectationErrors.get(result) ?? new Set();
      const browserProof = this.browserProof(test, result, snapshot, state);
      const failures = browserProof
        ? [browserProof]
        : (result.errors.length ? result.errors : [{}]).map((error) =>
            normalizeFailure(error, {
              phase: "test",
              file: test.location?.file,
              test_id: test.id,
              assertion: proof.has(errorSignature(error)),
              tooling,
              code: result.status,
            }),
          );
      if (
        tooling &&
        !browserProof &&
        !failures.some((error) => error.category === "tooling")
      )
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
  browserProof(test, result, snapshot, state) {
    const step = snapshot?.step;
    const world = readyWorldProof();
    const deadline = Date.parse(snapshot?.deadline_at);
    const observed = Date.parse(snapshot?.observed_at);
    if (
      Date.now() < deadline ||
      Date.now() - deadline > 5000 ||
      !result.errors.length ||
      result.errors.length > 64 ||
      result.errors.some(
        (error) => Buffer.byteLength(String(error.message ?? "")) > 4096,
      ) ||
      result.errors.some(
        (error) =>
          !/^(?:Error: )?(?:[A-Za-z][\w.]*: )?Test timeout of [1-9]\d*ms exceeded\.(?:\nCall log:[\s\S]*)?$/.test(
            stripVTControlCharacters(error.message ?? ""),
          ),
      ) ||
      result.errors.some((error) =>
        /afterEach|afterAll|fixture.*timeout/i.test(error.message ?? ""),
      )
    )
      return null;
    if (
      result.status !== "timedOut" ||
      !snapshot ||
      !state ||
      JSON.stringify(snapshot.attempt) !== JSON.stringify(state.attempt) ||
      snapshot.phase !== "body" ||
      snapshot.observation_gap !== false ||
      !step?.file ||
      !Number.isSafeInteger(step.line) ||
      !["pw:api", "expect"].includes(step.category) ||
      !world ||
      JSON.stringify(snapshot.world) !== JSON.stringify(world) ||
      snapshot.browser?.connected !== true ||
      snapshot.browser?.page_closed !== false ||
      snapshot.browser?.crashed !== false ||
      !["api", "web", "db"].every(
        (key) => snapshot.world_health?.[key] === true,
      ) ||
      !(
        deadline >= observed &&
        deadline - observed <= Math.min(1000, snapshot.quiet_ms / 4)
      )
    )
      return null;
    const key = attemptKey(state.attempt);
    const nativeResult = {
      binding: binding(),
      attempt: state.attempt,
      step,
      status: result.status,
      phase: "test",
      file: step.file,
      ended_at: new Date().toISOString(),
      errors: result.errors.map((error) => String(error.message ?? "")),
    };
    if (Buffer.byteLength(JSON.stringify(nativeResult)) > 256 * 1024)
      return null;
    const native = writeObservation(key, "native", nativeResult);
    const worker = writeObservation(key, "frozen-worker", snapshot);
    if (!native || !worker) return null;
    return {
      category: "unclassified",
      origin: "candidate",
      phase: "test",
      native_code: "PLAYWRIGHT_ACTION_INACTIVITY",
      code: "timedOut",
      message: "Native browser action made no progress within the quiet window",
      file: step.file,
      test_id: test.id,
      classification_reason: "candidate_browser_action_inactivity",
      repair_evidence: {
        rule: "candidate_browser_action_inactivity",
        native_code: "PLAYWRIGHT_ACTION_INACTIVITY",
        file: step.file,
        world,
        attempt: state.attempt,
        step,
        worker_snapshot: artifactReference(worker),
        native_result: artifactReference(native),
      },
    };
  }
  onError(error) {
    this.failures.push(
      normalizeFailure(error, {
        phase: "runner",
        tooling: true,
        code: "runner_error",
      }),
    );
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
