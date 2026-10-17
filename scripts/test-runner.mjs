import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
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
import { stopOwnedGroup } from "./owned-process.mjs";
import { createProgressPublisher } from "./runner-progress.mjs";
import {
  assertWorldCleanup,
  binding,
  boundReport,
  readJson,
  sanitizeDiagnostic,
  validReport,
  worldObservationPaths,
} from "./test-observation.mjs";

const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error("test-runner requires a command");
const temp = mkdtempSync(path.join(os.tmpdir(), "dd-tasks-observation-"));
const paths = worldObservationPaths(temp);
process.env.DD_TASKS_TEST_INVOCATION_ID =
  process.env.DD_FLOW_CHECK_INVOCATION_ID ?? randomUUID();
process.env.DD_TASKS_TEST_COMMAND = [command, ...args].join(" ");
const progressPath =
  process.env.DD_FLOW_CHECK_RUNNER_PROGRESS_PATH ??
  paths.DD_FLOW_CHECK_RUNNER_PROGRESS_PATH;
const reportPath = paths.DD_TASKS_RUNNER_REPORT;
const worldReceipt = paths.DD_TASKS_TEST_WORLD_RECEIPT;
const worldFinal = paths.DD_TASKS_TEST_WORLD_FINAL_RECEIPT;
const startedAt = Date.now();
const startup = Number(process.env.DD_FLOW_TEST_STARTUP_SILENCE_MS ?? 120000);
const execution = Number(
  process.env.DD_FLOW_TEST_EXECUTION_SILENCE_MS ?? 600000,
);
if (![startup, execution].every((value) => Number.isFinite(value) && value > 0))
  throw new Error("Invalid test observation budget");
const mailbox = path.join(temp, "mailboxes");
const publisher = createProgressPublisher(
  progressPath,
  mailbox,
  binding().invocation_id,
);
const evidenceRoot = path.dirname(
  process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH ?? reportPath,
);
const browserDirectory = path.join(evidenceRoot, "browser-observation");
mkdirSync(browserDirectory, { recursive: true });
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
    DD_TASKS_PROGRESS_MAILBOX_DIR: mailbox,
    DD_TASKS_PROGRESS_PUBLISHER: "1",
    DD_TASKS_BROWSER_OBSERVATION_DIR: browserDirectory,
  },
});
let last = performance.now(),
  previousWall = Date.now(),
  previousMono = last,
  phase = "startup",
  failure,
  stopping;
let cleanupFailure;
let processSettlement;
let resolveExecution;
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
const stop = (signal) => {
  stopping ??= stopOwnedGroup(child, { signal });
  // Timer/signal callbacks only initiate a handled stop; final publication owns errors.
  void stopping
    .then((result) => {
      if (!result.settled) {
        // A denied signal must not prevent final evidence publication forever.
        child.unref();
        resolveExecution?.(1);
      }
    })
    .catch((error) => {
      cleanupFailure ??= {
        category: "tooling",
        code: "cleanup_unconfirmed",
        message: error.message,
      };
      child.unref();
      resolveExecution?.(1);
    });
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
      const events = publisher.collect();
      for (const event of events) {
        const eventAt = Date.parse(event.at);
        if (
          event.schema_id === "dd-flow/check-runner-progress@1" &&
          event.invocation_id === binding().invocation_id &&
          Number.isSafeInteger(event.sequence) &&
          Number.isFinite(eventAt) &&
          eventAt >= startedAt &&
          eventAt <= wall &&
          wall - eventAt < (phase === "startup" ? startup : execution) &&
          ["startup", "execution"].includes(event.phase) &&
          acceptedEvents.has(event.event)
        ) {
          const identity = `${event.event}:${event.detail ?? ""}`;
          if (!seen.has(identity)) {
            seen.add(identity);
            if (seen.size > 4096) seen.delete(seen.values().next().value);
            if (phase !== "execution") phase = event.phase;
            last = now - Math.max(0, wall - eventAt);
          }
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        failure ??= {
          category: "tooling",
          code: error.code ?? "invalid_progress",
          message: error.message,
        };
        stop("SIGTERM");
      }
    }
    if (now - last >= (phase === "startup" ? startup : execution + 5000)) {
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
    resolveExecution = resolve;
    child.once("error", (error) => {
      failure = {
        category: "tooling",
        code: "spawn_error",
        message: error.message,
      };
      resolve(1);
    });
    child.once("exit", (code) => {
      resolve(code ?? 1);
    });
  });
} finally {
  clearInterval(timer);
  process.off("SIGTERM", terminate);
  process.off("SIGINT", terminate);
  try {
    publisher.collect();
  } catch (error) {
    failure ??= {
      category: "tooling",
      code: error.code ?? "invalid_progress",
      message: error.message,
    };
  }
  const settlement = await (stopping ?? stopOwnedGroup(child));
  processSettlement = settlement;
  // Preserve warnings even when the group disappeared after a denied signal.
  const diagnostics = path.join(
    evidenceRoot,
    `process-cleanup-${randomUUID()}.json`,
  );
  try {
    writeFileSync(
      diagnostics,
      JSON.stringify({ binding: binding(), settlement }),
      { flag: "wx", mode: 0o600 },
    );
  } catch (error) {
    cleanupFailure ??= {
      category: "tooling",
      code: "diagnostic_capture_failed",
      message: error.message,
    };
  }
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
  assertWorldCleanup(ready, final, binding().invocation_id);
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
// Capture before report publication, so publication failures cannot erase the only copy.
let captured = true;
const retained = [];
const diagnostic = {
  binding: binding(),
  process_cleanup: processSettlement,
  progress: publisher.diagnostics,
};
for (const [name, file, limit] of [
  ["world-ready", worldReceipt, 16384],
  ["world-final", worldFinal, 65536],
  ["native-report", reportPath, 1024 * 1024],
]) {
  try {
    let value;
    try {
      value = readJson(file, limit);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    value = sanitizeDiagnostic(value);
    const artifact = `${name}-${randomUUID()}.json`;
    writeFileSync(path.join(evidenceRoot, artifact), JSON.stringify(value), {
      flag: "wx",
      mode: 0o600,
    });
    retained.push(artifact);
    diagnostic[name.replaceAll("-", "_")] = value;
  } catch (error) {
    captured = false;
    report.completed = false;
    report.failures.push({
      category: "tooling",
      code: "diagnostic_capture_failed",
      message: `${error.message}; retained private evidence: ${temp}`.slice(
        0,
        4096,
      ),
    });
  }
}
try {
  const relative_path = `runner-diagnostics-${randomUUID()}.json`;
  const bytes = JSON.stringify({
    ...sanitizeDiagnostic(diagnostic),
    binding: binding(),
  });
  if (Buffer.byteLength(bytes) > 2 * 1024 * 1024)
    throw new Error(
      "Diagnostic bundle exceeds 2MiB; private evidence retained",
    );
  writeFileSync(path.join(evidenceRoot, relative_path), bytes, {
    flag: "wx",
    mode: 0o600,
  });
  const reference = {
    relative_path,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
  for (const item of report.failures) item.diagnostic_artifact = reference;
} catch (error) {
  captured = false;
  report.completed = false;
  report.failures.push({
    category: "tooling",
    code: "diagnostic_capture_failed",
    message: `${error.message}; retained private evidence: ${temp}`.slice(
      0,
      4096,
    ),
  });
}
if (cleanupFailure && retained.length)
  cleanupFailure.message =
    `${cleanupFailure.message}; artifacts: ${retained.join(", ")}`.slice(
      0,
      4096,
    );
const destination = process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH;
try {
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
    report.failures = report.failures.map((item) => sanitizeDiagnostic(item));
    writeFileSync(publication, JSON.stringify(boundReport(report)), {
      flag: "wx",
      mode: 0o600,
    });
    renameSync(publication, destination);
  }
} catch (error) {
  captured = false;
  console.error(
    JSON.stringify({
      code: "evidence_publication_failed",
      message: error.message,
      retained_temp: temp,
    }),
  );
}
try {
  publisher.release();
} catch (error) {
  captured = false;
  console.error(
    JSON.stringify({
      code: "progress_ownership_error",
      message: error.message,
      retained_temp: temp,
    }),
  );
}
if (captured) rmSync(temp, { recursive: true });
process.exitCode =
  !captured ||
  failure ||
  cleanupFailure ||
  !report.completed ||
  report.failures.length
    ? 1
    : exit;
