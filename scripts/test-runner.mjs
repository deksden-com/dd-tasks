import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { binding, readProgress } from "./test-observation.mjs";

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
  try {
    if (child.pid) process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
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
      if (
        event.schema_id === "dd-flow/check-runner-progress@1" &&
        event.invocation_id === binding().invocation_id &&
        Number.isSafeInteger(event.sequence) &&
        event.sequence > sequence &&
        ["startup", "execution"].includes(event.phase) &&
        acceptedEvents.has(event.event)
      ) {
        sequence = event.sequence;
        const identity = `${event.event}:${event.detail ?? ""}`;
        if (!seen.has(identity)) {
          seen.add(identity);
          if (phase !== "execution") phase = event.phase;
          last = now;
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
      failure = {
        category: "tooling",
        code: "spawn_error",
        message: error.message,
      };
      resolve(1);
    });
    child.once("exit", (code) => resolve(code ?? 1));
  });
} finally {
  clearInterval(timer);
  process.off("SIGTERM", terminate);
  process.off("SIGINT", terminate);
  if (failure && child.pid) {
    const deadline = performance.now() + 5000;
    while (performance.now() < deadline) {
      try {
        process.kill(-child.pid, 0);
      } catch (error) {
        if (error.code === "ESRCH") break;
        failure ??= {
          category: "tooling",
          code: "cleanup_unconfirmed",
          message: error.message,
        };
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  if (escalation) clearTimeout(escalation);
  try {
    kill("SIGKILL");
  } catch (error) {
    failure ??= {
      category: "tooling",
      code: "cleanup_unconfirmed",
      message: error.message,
    };
  }
}
let report;
try {
  report = JSON.parse(readFileSync(reportPath, "utf8"));
} catch {
  report = {
    schema_id: "dd-flow/check-runner-evidence@1",
    binding: binding(),
    runner: { name: "test-wrapper", version: "1" },
    completed: false,
    counts: { passed: 0, failed: 0, skipped: 0 },
    failures: [],
  };
}
if (failure) {
  report.failures.push(failure);
  report.completed = false;
  report.observation_unknown = true;
}
if (exit !== 0 && !report.failures.length)
  report.failures.push({ category: "unclassified", code: "nonzero_exit" });
const destination = process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH;
if (destination) {
  mkdirSync(path.dirname(destination), { recursive: true });
  try {
    if (!lstatSync(destination).isFile())
      throw new Error("Invalid runner evidence destination");
    const prior = JSON.parse(readFileSync(destination, "utf8"));
    if (JSON.stringify(prior.binding) === JSON.stringify(report.binding)) {
      for (const key of ["passed", "failed", "skipped"])
        report.counts[key] += prior.counts[key];
      report.failures.unshift(...prior.failures);
      report.completed &&= prior.completed;
      report.observation_unknown ||= prior.observation_unknown;
    }
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
  writeFileSync(publication, JSON.stringify(report), {
    flag: "wx",
    mode: 0o600,
  });
  renameSync(publication, destination);
}
rmSync(temp, { recursive: true });
process.exitCode = failure ? 1 : exit;
