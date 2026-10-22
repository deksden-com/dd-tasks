import { spawn } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stopOwnedGroup } from "./owned-process.mjs";
import { atomicJson, sha256 } from "./source-diagnostic.mjs";
import {
  binding,
  evidence,
  progress,
  readJson,
  validReport,
} from "./test-observation.mjs";

const root = path.resolve(import.meta.dirname, "..");
export const unitSteps = [
  {
    id: "api-unit",
    wrapped: true,
    argv: ["pnpm", "--filter", "@dd-tasks/api", "test:unit"],
  },
  {
    id: "web-unit",
    wrapped: true,
    argv: ["pnpm", "--filter", "@dd-tasks/web", "test:unit"],
  },
];
export const qualitySteps = [
  {
    id: "format",
    argv: [
      process.execPath,
      "scripts/tool-diagnostic-runner.mjs",
      "biome",
      "check",
      ".",
    ],
  },
  {
    id: "lint",
    argv: [
      process.execPath,
      "scripts/tool-diagnostic-runner.mjs",
      "biome",
      "lint",
      ".",
    ],
  },
  {
    id: "typecheck",
    argv: [
      process.execPath,
      "scripts/tool-diagnostic-runner.mjs",
      "typescript",
      "apps/api/tsconfig.json",
      "apps/api/tsconfig.test.json",
      "apps/web/tsconfig.json",
      "apps/web/tsconfig.browser.json",
    ],
  },
  ...unitSteps,
  { id: "integration", wrapped: true, argv: ["pnpm", "test:integration"] },
  {
    id: "build",
    argv: [
      process.execPath,
      "scripts/tool-diagnostic-runner.mjs",
      "command",
      "pnpm",
      "build",
    ],
  },
  {
    id: "value-absence",
    argv: [
      process.execPath,
      "scripts/value-absence-check.mjs",
      "package.json",
      "vitest.config.ts",
      "apps/api/src/contracts/http.ts",
      "apps/api/src/db/target-guard.ts",
      "apps/web/src/foundation/api.ts",
      "apps/web/src/foundation/foundation-contract.ts",
      "apps/web/src/App.tsx",
    ],
  },
];

// Only this fixed pipeline is production-authoritative; tests inject explicit argv in-process.
export async function runQuality(steps = qualitySteps) {
  const parent = binding();
  const reportRoot = path.dirname(
    process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH ??
      process.env.DD_TASKS_RUNNER_REPORT,
  );
  const counts = { passed: 0, failed: 0, skipped: 0 },
    failures = [];
  const result = steps.map(({ id, argv }, ordinal) => ({
    id,
    ordinal,
    command_sha256: sha256(JSON.stringify(argv)),
    state: "unreached",
  }));
  let active,
    stopping,
    cancelled = false,
    observationUnknown = false,
    partialReason;
  const terminate = () => {
    cancelled = true;
    if (active) stopping ??= stopOwnedGroup(active, { signal: "SIGTERM" });
  };
  process.on("SIGTERM", terminate);
  process.on("SIGINT", terminate);
  try {
    for (const [ordinal, step] of steps.entries()) {
      if (cancelled) break;
      const identity = result[ordinal],
        dir = path.join(reportRoot, "steps", step.id);
      mkdirSync(dir, { recursive: true });
      const childBinding = {
        ...parent,
        invocation_id: `${parent.invocation_id}:step:${step.id}`,
        check_id: `${parent.check_id}/${step.id}`,
        command: JSON.stringify(step.argv),
        input_hash: sha256(
          JSON.stringify([parent.input_hash, identity.command_sha256]),
        ),
      };
      const env = {
        ...process.env,
        DD_FLOW_CHECK_INVOCATION_ID: childBinding.invocation_id,
        DD_FLOW_CHECK_ID: childBinding.check_id,
        DD_FLOW_CHECK_COMMAND: childBinding.command,
        DD_FLOW_CHECK_INPUT_HASH: childBinding.input_hash,
        DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: path.join(dir, "report.json"),
        DD_FLOW_CHECK_RUNNER_PROGRESS_PATH: path.join(dir, "progress.jsonl"),
        DD_TASKS_CHECK_STEP: JSON.stringify({
          id: step.id,
          ordinal,
          command_sha256: identity.command_sha256,
        }),
      };
      delete env.DD_TASKS_PROGRESS_PUBLISHER;
      delete env.DD_TASKS_PROGRESS_MAILBOX_DIR;
      delete env.DD_TASKS_RUNNER_REPORT;
      progress(`step_completed:dispatch:${step.id}`);
      const nestedWrappers = step.wrapped === true;
      active = nestedWrappers
        ? spawn(step.argv[0], step.argv.slice(1), {
            cwd: root,
            env,
            stdio: "inherit",
            detached: true,
          })
        : spawn(
            process.execPath,
            [path.join(root, "scripts/test-runner.mjs"), ...step.argv],
            { cwd: root, env, stdio: "inherit", detached: true },
          );
      let cursor = 0;
      const relay = setInterval(() => {
        try {
          const text = readFileSync(path.join(dir, "progress.jsonl"), "utf8");
          for (const line of text.split("\n").slice(0, -1)) {
            const event = JSON.parse(line);
            if (
              event.invocation_id === childBinding.invocation_id &&
              event.sequence > cursor
            ) {
              cursor = event.sequence;
              progress(`step_completed:${step.id}:${cursor}:${event.event}`);
            }
          }
        } catch (error) {
          if (error.code !== "ENOENT") {
            cancelled = true;
            terminate();
          }
        }
      }, 100);
      let exit;
      try {
        exit = await new Promise((resolve, reject) => {
          active.once("exit", (code, signal) => {
            if (signal) observationUnknown = true;
            if (signal)
              failures.push({
                category: "tooling",
                code: "child_signal",
                message: `${step.id}: ${signal}`,
              });
            resolve(code ?? 1);
          });
          active.once("error", reject);
        });
      } catch (error) {
        failures.push({
          category: "tooling",
          code: "spawn_error",
          message: error.message,
        });
        exit = 1;
      } finally {
        clearInterval(relay);
      }
      if (stopping) {
        const settled = await stopping;
        if (!settled.settled) {
          observationUnknown = true;
          failures.push({ category: "tooling", code: "cleanup_unconfirmed" });
        }
      }
      Object.assign(identity, {
        binding: childBinding,
        exit_code: exit,
        state: exit === 0 ? "passed" : "failed",
      });
      try {
        const file = path.join(dir, "report.json"),
          bytes = readFileSync(file),
          report = readJson(file);
        if (
          !validReport(report) ||
          JSON.stringify(report.binding) !== JSON.stringify(childBinding)
        )
          throw new Error("Invalid child report binding/schema");
        const ref = {
          relative_path: path.relative(reportRoot, file),
          sha256: sha256(bytes),
        };
        identity.report = ref;
        if (!report.completed || report.observation_unknown) {
          observationUnknown ||=
            report.observation_unknown === true || !report.failure_projection;
          partialReason ??= report.failure_projection?.reason;
          if (!report.failures.length)
            failures.push({
              category: "tooling",
              code: "child_observation_unknown",
              message: step.id,
            });
        }
        for (const key of Object.keys(counts))
          counts[key] += report.counts[key];
        failures.push(
          ...report.failures.map((failure) => ({
            ...failure,
            child_evidence: {
              step_id: step.id,
              report: ref,
              binding: childBinding,
            },
          })),
        );
        if (exit !== 0 && !report.failures.length)
          failures.push({
            category: "unclassified",
            code: "step_nonzero_exit",
            message: step.id,
          });
        if (exit === 0 && report.failures.length) identity.state = "failed";
      } catch (error) {
        failures.push({
          category: "tooling",
          code: "invalid_child_evidence",
          message: `${step.id}: ${error.message}`,
        });
        identity.state = "failed";
      }
      atomicJson(path.join(reportRoot, "pipeline-steps.json"), {
        binding: parent,
        steps: result,
      });
      progress(`step_completed:terminal:${step.id}`);
      if (identity.state !== "passed" || failures.length) break;
    }
  } finally {
    process.off("SIGTERM", terminate);
    process.off("SIGINT", terminate);
    if (cancelled)
      failures.push({
        category: "tooling",
        code: "cancelled",
        origin: "tooling",
      });
    evidence(
      { name: "quality", version: "1" },
      counts,
      failures,
      !cancelled && !observationUnknown,
      {
        steps: result,
        ...(partialReason
          ? {
              failure_projection: {
                state: "partial",
                reason: partialReason,
                represented: failures.filter((item) => item.child_evidence)
                  .length,
                omitted: 0,
              },
            }
          : {}),
        ...(cancelled || observationUnknown
          ? { observation_unknown: true }
          : {}),
      },
    );
  }
  return failures.length ? 1 : 0;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  process.exitCode = await runQuality(
    process.argv[2] === "--unit" ? unitSteps : qualitySteps,
  );
