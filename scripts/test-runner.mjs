import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { observeGroupSettlement, signalOwnedGroup } from "./owned-process.mjs";
import {
  binding,
  boundReport,
  readJson,
  readProgress,
  validReport,
} from "./test-observation.mjs";

const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error("test-runner requires a command");
const temp = mkdtempSync(path.join(os.tmpdir(), "dd-tasks-observation-"));
process.env.DD_TASKS_TEST_INVOCATION_ID =
  process.env.DD_FLOW_CHECK_INVOCATION_ID ?? randomUUID();
process.env.DD_TASKS_TEST_COMMAND = [command, ...args].join(" ");
const progressPath =
  process.env.DD_FLOW_CHECK_RUNNER_PROGRESS_PATH ??
  path.join(temp, "progress.jsonl");
const reportPath = path.join(temp, "report.json");
const worldReceipt = path.join(temp, "world-ready.json");
const worldFinal = path.join(temp, "world-final.json");
const startedAt = Date.now();
const startup = Number(process.env.DD_FLOW_TEST_STARTUP_SILENCE_MS ?? 120000);
const execution = Number(
  process.env.DD_FLOW_TEST_EXECUTION_SILENCE_MS ?? 600000,
);
if (![startup, execution].every((value) => Number.isFinite(value) && value > 0))
  throw new Error("Invalid test observation budget");
let initialSequence = -1;
try {
  const prior = JSON.parse(
    readProgress(progressPath).trim().split("\n").at(-1),
  );
  if (
    prior.invocation_id === binding().invocation_id &&
    Number.isSafeInteger(prior.sequence)
  )
    initialSequence = prior.sequence;
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const child = spawn(command, args, {
  stdio: "inherit",
  detached: true,
  env: {
    ...process.env,
    DD_TASKS_TEST_WATCHDOG: "1",
    DD_TASKS_RUNNER_REPORT: reportPath,
    DD_TASKS_TEST_WORLD_RECEIPT: worldReceipt,
    DD_TASKS_TEST_WORLD_FINAL_RECEIPT: worldFinal,
    DD_FLOW_CHECK_RUNNER_PROGRESS_PATH: progressPath,
  },
});
let last = performance.now(),
  previousWall = Date.now(),
  previousMono = last,
  sequence = initialSequence,
  phase = "startup",
  failure,
  escalation;
let leaderSettled = false;
let cleanupFailure;
const seen = new Set();
const acceptedEvents = new Set([
  "setup_step_completed",
  "run_started",
  "module_collected",
  "test_started",
  "test_completed",
  "step_completed",
  "run_completed",
]);
const kill = (signal) => {
  if (leaderSettled || child.exitCode !== null || child.signalCode !== null)
    return;
  signalOwnedGroup(child, signal);
};
const stop = (signal) => {
  kill(signal);
  escalation ??= setTimeout(() => kill("SIGKILL"), 5000);
};
const terminate = () => {
  failure ??= { category: "tooling", code: "cancelled" };
  stop("SIGTERM");
};
process.on("SIGTERM", terminate);
process.on("SIGINT", terminate);
const timer = setInterval(
  () => {
    const now = performance.now(),
      wall = Date.now();
    if (
      now - previousMono > 60000 ||
      Math.abs(wall - previousWall - (now - previousMono)) > 60000
    ) {
      failure ??= { category: "tooling", code: "observation_gap" };
      stop("SIGTERM");
    }
    previousWall = wall;
    previousMono = now;
    try {
      const bytes = readProgress(progressPath);
      if (bytes.length > 4 * 1024 * 1024)
        throw new Error("Runner progress exceeds bound");
      const event = JSON.parse(bytes.trim().split("\n").at(-1));
      const eventAt = Date.parse(event.at);
      if (
        event.schema_id === "dd-flow/check-runner-progress@1" &&
        event.invocation_id === binding().invocation_id &&
        Number.isSafeInteger(event.sequence) &&
        event.sequence > sequence &&
        Number.isFinite(eventAt) &&
        eventAt >= startedAt &&
        eventAt <= wall &&
        wall - eventAt < (phase === "startup" ? startup : execution) &&
        ["startup", "execution"].includes(event.phase) &&
        acceptedEvents.has(event.event)
      ) {
        sequence = event.sequence;
        const identity = `${event.event}:${event.detail ?? ""}`;
        if (!seen.has(identity)) {
          seen.add(identity);
          if (phase !== "execution") phase = event.phase;
          last = now - Math.max(0, wall - eventAt);
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) {
        failure ??= {
          category: "tooling",
          code: "invalid_progress",
          message: error.message,
        };
        stop("SIGTERM");
      }
    }
    if (now - last >= (phase === "startup" ? startup : execution)) {
      failure ??= {
        category: "tooling",
        code: "inactivity_timeout",
        message: `No ${phase} progress`,
      };
      stop("SIGTERM");
    }
  },
  Math.min(100, startup, execution),
);
let exit;
try {
  exit = await new Promise((resolve) => {
    child.once("error", (error) => {
      leaderSettled = true;
      failure = {
        category: "tooling",
        code: "spawn_error",
        message: error.message,
      };
      resolve(1);
    });
    child.once("exit", (code) => {
      leaderSettled = true;
      resolve(code ?? 1);
    });
  });
} finally {
  clearInterval(timer);
  process.off("SIGTERM", terminate);
  process.off("SIGINT", terminate);
  if (escalation) clearTimeout(escalation);
  const settlement = await observeGroupSettlement(child);
  if (!settlement.settled)
    cleanupFailure = {
      category: "tooling",
      code: "cleanup_unconfirmed",
      message: settlement.reason,
    };
}
let report;
try {
  report = readJson(reportPath);
  if (
    !validReport(report) ||
    JSON.stringify(report.binding) !== JSON.stringify(binding())
  )
    throw new Error("Invalid runner report");
} catch {
  report = {
    schema_id: "dd-flow/check-runner-evidence@1",
    binding: binding(),
    runner: { name: "test-wrapper", version: "1" },
    completed: false,
    counts: { passed: 0, failed: 0, skipped: 0 },
    failures: [
      {
        category: "tooling",
        code: "invalid_runner_evidence",
        message: "Runner did not publish valid bound structured evidence",
      },
    ],
  };
}
if (failure) {
  report.failures.unshift(failure);
  report.completed = false;
  report.observation_unknown = true;
}
if (cleanupFailure) {
  report.failures.push(cleanupFailure);
  report.completed = false;
  report.observation_unknown = true;
}
try {
  const ready = readJson(worldReceipt, 16384);
  const final = readJson(worldFinal, 65536);
  if (
    final.schema_id !== "dd-tasks/test-world@1" ||
    ready.schema_id !== "dd-tasks/test-world-ready@1" ||
    final.world_id !== ready.world_id ||
    ready.invocation_id !== binding().invocation_id ||
    final.invocation_id !== binding().invocation_id ||
    final.state !== "cleaned" ||
    !Array.isArray(final.cleanup_errors ?? []) ||
    final.cleanup_errors?.length
  )
    throw new Error("Test world cleanup not confirmed");
} catch (error) {
  const exists = (file) => {
    try {
      lstatSync(file);
      return true;
    } catch (cause) {
      return cause.code !== "ENOENT";
    }
  };
  if (error.code !== "ENOENT" || exists(worldReceipt) || exists(worldFinal)) {
    cleanupFailure = {
      category: "tooling",
      code: "cleanup_unconfirmed",
      message: error.message,
    };
    report.failures.push(cleanupFailure);
    report.completed = false;
  }
}
if (exit !== 0 && !report.failures.length)
  report.failures.push({ category: "unclassified", code: "nonzero_exit" });
const destination = process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH;
if (destination) {
  mkdirSync(path.dirname(destination), { recursive: true });
  try {
    if (!lstatSync(destination).isFile())
      throw new Error("Invalid runner evidence destination");
    const prior = readJson(destination);
    if (
      !validReport(prior) ||
      JSON.stringify(prior.binding) !== JSON.stringify(report.binding)
    )
      throw new Error("Invalid prior evidence binding or schema");
    for (const key of ["passed", "failed", "skipped"])
      report.counts[key] += prior.counts[key];
    report.failures.unshift(...prior.failures);
    report.completed &&= prior.completed;
    report.observation_unknown ||= prior.observation_unknown;
  } catch (error) {
    if (error.code !== "ENOENT") {
      report.completed = false;
      report.failures.push({
        category: "tooling",
        code: "invalid_prior_evidence",
      });
    }
  }
  const publication = `${destination}.${process.pid}.tmp`;
  writeFileSync(publication, JSON.stringify(boundReport(report)), {
    flag: "wx",
    mode: 0o600,
  });
  renameSync(publication, destination);
}
rmSync(temp, { recursive: true });
process.exitCode =
  failure || cleanupFailure || !report.completed || report.failures.length
    ? 1
    : exit;
