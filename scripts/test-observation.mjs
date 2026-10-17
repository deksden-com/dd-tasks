import {
  closeSync,
  constants,
  fstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  realpathSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export { progress, readProgress } from "./runner-progress.mjs";

const root = path.resolve(import.meta.dirname, "..");
const bounded = (value, limit) => {
  const bytes = Buffer.from(
    String(value ?? "")
      .replace(
        /\b(password|token|secret|api[_-]?key)["']?\s*[:=]\s*["']?[^"'\s,;&}]+/gi,
        "$1=[redacted]",
      )
      .replace(/\bBearer\s+[^\s]+/gi, "Bearer [redacted]")
      .replace(/(?:postgres(?:ql)?:\/\/)[^\s]+/gi, "[redacted database URL]"),
  );
  let end = Math.min(limit, bytes.length);
  while (end < bytes.length && end > 0 && (bytes[end] & 0xc0) === 0x80) end--;
  return bytes.subarray(0, end).toString("utf8");
};
export function readJson(file, limit = 1024 * 1024) {
  const fd = openSync(
    file,
    constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
  );
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > limit)
      throw new Error("Invalid evidence file");
    const bytes = Buffer.alloc(Math.min(limit + 1, stat.size + 1));
    let offset = 0;
    while (offset < bytes.length) {
      const count = readSync(fd, bytes, offset, bytes.length - offset, null);
      if (!count) break;
      offset += count;
    }
    if (offset > limit || fstatSync(fd).size > limit)
      throw new Error("Evidence grew beyond bound");
    return JSON.parse(bytes.subarray(0, offset).toString("utf8"));
  } finally {
    closeSync(fd);
  }
}
export function sanitizeDiagnostic(value, depth = 0) {
  if (typeof value === "string") return bounded(value, 16384);
  if (depth > 12) return "[diagnostic depth truncated]";
  if (Array.isArray(value))
    return value
      .slice(0, 64)
      .map((item) => sanitizeDiagnostic(item, depth + 1));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 64)
        .map(([key, item]) => [
          key,
          /password|token|secret|api[_-]?key|authorization/i.test(key)
            ? "[redacted]"
            : sanitizeDiagnostic(item, depth + 1),
        ]),
    );
  return value;
}
export function worldObservationPaths(directory) {
  return {
    DD_TASKS_RUNNER_REPORT: path.join(directory, "report.json"),
    DD_FLOW_CHECK_RUNNER_PROGRESS_PATH: path.join(directory, "progress.jsonl"),
    DD_TASKS_TEST_WORLD_RECEIPT: path.join(directory, "world-ready.json"),
    DD_TASKS_TEST_WORLD_FINAL_RECEIPT: path.join(directory, "world-final.json"),
  };
}
export function assertWorldCleanup(ready, final, invocationId) {
  if (
    typeof invocationId !== "string" ||
    !invocationId ||
    final.schema_id !== "dd-tasks/test-world@1" ||
    ready.schema_id !== "dd-tasks/test-world-ready@1" ||
    typeof ready.world_id !== "string" ||
    !/^[a-f0-9]{32}$/.test(ready.world_id) ||
    final.world_id !== ready.world_id ||
    ready.invocation_id !== invocationId ||
    final.invocation_id !== invocationId ||
    final.state !== "cleaned" ||
    !Array.isArray(final.cleanup_errors ?? []) ||
    final.cleanup_errors?.length
  )
    throw new Error("Test world cleanup not confirmed");
}
export function writeWorldProof(proof) {
  const file = process.env.DD_TASKS_TEST_WORLD_RECEIPT;
  if (!file) return;
  const temporary = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(proof), { flag: "wx", mode: 0o600 });
  renameSync(temporary, file);
}
export function completeWorldSetup() {
  const file = process.env.DD_TASKS_TEST_WORLD_RECEIPT;
  if (!file) return;
  const proof = readJson(file, 16384);
  if (
    proof.schema_id !== "dd-tasks/test-world-ready@1" ||
    proof.invocation_id !== binding().invocation_id ||
    proof.world_id !== process.env.DD_TASKS_TEST_WORLD ||
    proof.ready !== false ||
    proof.setup_completed !== false ||
    !/^[a-f0-9]{32}$/.test(proof.world_id) ||
    !/^[a-f0-9]{64}$/.test(proof.migrations_sha256) ||
    typeof proof.role !== "string"
  )
    throw new Error("Invalid test-world setup binding");
  writeWorldProof({ ...proof, ready: true, setup_completed: true });
}
export function readyWorldProof() {
  try {
    const proof = readJson(process.env.DD_TASKS_TEST_WORLD_RECEIPT, 16384);
    return proof.schema_id === "dd-tasks/test-world-ready@1" &&
      proof.invocation_id === binding().invocation_id &&
      proof.world_id === process.env.DD_TASKS_TEST_WORLD &&
      /^[a-f0-9]{32}$/.test(proof.world_id) &&
      /^[a-f0-9]{64}$/.test(proof.migrations_sha256) &&
      proof.ready === true &&
      proof.setup_completed === true &&
      typeof proof.role === "string"
      ? proof
      : null;
  } catch {
    return null;
  }
}
export function normalizeFailure(error, context = {}) {
  const file =
    typeof context.file === "string" ? path.resolve(context.file) : undefined;
  let candidate = false;
  try {
    candidate =
      file &&
      !path.relative(realpathSync(root), realpathSync(file)).startsWith("..") &&
      !path.isAbsolute(path.relative(realpathSync(root), realpathSync(file)));
  } catch {}
  const nativeCode = typeof error.code === "string" ? error.code : undefined;
  const world = readyWorldProof();
  const sql =
    candidate &&
    world &&
    ["23502", "23503", "23505", "23514"].includes(nativeCode) &&
    ["test", "setup"].includes(context.phase);
  const assertion = context.assertion === true;
  const tooling =
    context.tooling === true || /^(08|28|53|57|58)/.test(nativeCode ?? "");
  return {
    category: assertion ? "assertion" : tooling ? "tooling" : "unclassified",
    code: bounded(error.name ?? context.code ?? "test_failure", 256),
    message: bounded(error.message ?? error.value ?? "Test failed", 4096),
    origin: tooling
      ? "tooling"
      : (assertion && candidate) || sql
        ? "candidate"
        : "unknown",
    phase: context.phase ?? "test",
    ...(file ? { file } : {}),
    ...(context.test_id ? { test_id: bounded(context.test_id, 1024) } : {}),
    ...(error.stack ? { stack: bounded(error.stack, 16384) } : {}),
    ...(nativeCode ? { native_code: bounded(nativeCode, 256) } : {}),
    classification_reason: tooling
      ? "runner_or_infrastructure"
      : sql
        ? "candidate_sql_integrity"
        : assertion
          ? "native_expectation"
          : "unsupported_attribution",
    ...(sql && !tooling
      ? {
          repair_evidence: {
            rule: "candidate_sql_integrity",
            native_code: nativeCode,
            file,
            world,
          },
        }
      : {}),
  };
}
export function validReport(report) {
  return (
    report?.schema_id === "dd-flow/check-runner-evidence@1" &&
    report.binding &&
    [
      "invocation_id",
      "check_id",
      "command",
      "input_hash",
      "verification_epoch",
    ].every(
      (key) =>
        typeof report.binding[key] === "string" &&
        Buffer.byteLength(report.binding[key]) <= 4096,
    ) &&
    typeof report.completed === "boolean" &&
    report.runner &&
    typeof report.runner.name === "string" &&
    typeof report.runner.version === "string" &&
    Buffer.byteLength(report.runner.name) <= 256 &&
    Buffer.byteLength(report.runner.version) <= 256 &&
    (report.observation_unknown === undefined ||
      typeof report.observation_unknown === "boolean") &&
    report.counts &&
    ["passed", "failed", "skipped"].every(
      (key) =>
        Number.isSafeInteger(report.counts[key]) && report.counts[key] >= 0,
    ) &&
    Array.isArray(report.failures) &&
    (report.counts.failed === 0 || report.failures.length > 0) &&
    report.failures.every(
      (f) =>
        f &&
        ["assertion", "tooling", "unclassified"].includes(f.category) &&
        typeof f.code === "string" &&
        Buffer.byteLength(f.code) <= 256 &&
        (f.message === undefined || typeof f.message === "string") &&
        (f.message === undefined || Buffer.byteLength(f.message) <= 4096) &&
        (f.origin === undefined ||
          ["candidate", "tooling", "unknown"].includes(f.origin)) &&
        (f.phase === undefined ||
          ["test", "setup", "teardown", "collection", "runner"].includes(
            f.phase,
          )) &&
        [
          "file",
          "test_id",
          "stack",
          "native_code",
          "classification_reason",
        ].every(
          (key) =>
            f[key] === undefined ||
            (typeof f[key] === "string" &&
              Buffer.byteLength(f[key]) <= (key === "stack" ? 16384 : 8192)),
        ) &&
        (f.stack === undefined || Buffer.byteLength(f.stack) <= 16384) &&
        (f.diagnostic_artifact === undefined ||
          (typeof f.diagnostic_artifact.relative_path === "string" &&
            f.diagnostic_artifact.relative_path.length <= 4096 &&
            !path.isAbsolute(f.diagnostic_artifact.relative_path) &&
            !f.diagnostic_artifact.relative_path
              .split(/[\\/]/)
              .includes("..") &&
            /^[a-f0-9]{64}$/.test(f.diagnostic_artifact.sha256))) &&
        (f.repair_evidence === undefined ||
          validRepairEvidence(f.repair_evidence, report.binding)),
    )
  );
}
function validRepairEvidence(proof, owner) {
  const world = proof?.world;
  if (proof?.rule === "candidate_browser_action_inactivity") {
    const reference = (value) =>
      value &&
      typeof value.relative_path === "string" &&
      value.relative_path.length <= 4096 &&
      !path.isAbsolute(value.relative_path) &&
      !value.relative_path.split(/[\\/]/).includes("..") &&
      /^[a-f0-9]{64}$/.test(value.sha256);
    return (
      proof.native_code === "PLAYWRIGHT_ACTION_INACTIVITY" &&
      typeof proof.file === "string" &&
      world?.schema_id === "dd-tasks/test-world-ready@1" &&
      world.invocation_id === owner.invocation_id &&
      /^[a-f0-9]{32}$/.test(world.world_id) &&
      /^[a-f0-9]{64}$/.test(world.migrations_sha256) &&
      world.ready === true &&
      world.setup_completed === true &&
      typeof world.role === "string" &&
      proof.attempt?.invocation_id === owner.invocation_id &&
      typeof proof.attempt.test_id === "string" &&
      ["retry", "repeat_each_index", "worker_index"].every(
        (key) =>
          Number.isSafeInteger(proof.attempt[key]) && proof.attempt[key] >= 0,
      ) &&
      ["pw:api", "expect"].includes(proof.step?.category) &&
      typeof proof.step.id === "string" &&
      typeof proof.step.file === "string" &&
      Number.isSafeInteger(proof.step.line) &&
      proof.step.line > 0 &&
      reference(proof.worker_snapshot) &&
      reference(proof.native_result)
    );
  }
  return (
    proof?.rule === "candidate_sql_integrity" &&
    ["23502", "23503", "23505", "23514"].includes(proof.native_code) &&
    typeof proof.file === "string" &&
    world?.schema_id === "dd-tasks/test-world-ready@1" &&
    world.invocation_id === owner.invocation_id &&
    typeof world.world_id === "string" &&
    /^[a-f0-9]{32}$/.test(world.world_id) &&
    typeof world.migrations_sha256 === "string" &&
    /^[a-f0-9]{64}$/.test(world.migrations_sha256) &&
    world.ready === true &&
    world.setup_completed === true &&
    typeof world.role === "string"
  );
}
export function boundReport(report) {
  if (
    !["passed", "failed", "skipped"].every(
      (key) =>
        Number.isSafeInteger(report.counts?.[key]) && report.counts[key] >= 0,
    )
  ) {
    report.failures.push({
      category: "tooling",
      code: "invalid_aggregate_counts",
      message: "Aggregate runner counts exceed the safe integer range",
    });
    report.completed = false;
  }
  for (const key of Object.keys(report))
    if (
      ![
        "schema_id",
        "binding",
        "runner",
        "completed",
        "counts",
        "failures",
        "observation_unknown",
      ].includes(key)
    )
      delete report[key];
  if (
    report.failures.length > 64 ||
    Buffer.byteLength(JSON.stringify(report)) > 768 * 1024
  ) {
    report.failures = report.failures.slice(0, 63);
    while (
      report.failures.length &&
      Buffer.byteLength(JSON.stringify(report)) > 740 * 1024
    )
      report.failures.pop();
    report.failures.push({
      category: "tooling",
      code: "report_truncated",
      message: "Runner diagnostics exceeded retained evidence bound",
    });
    report.completed = false;
  }
  return report;
}

// ponytail: exact browser/world routes; new launchers stay bounded until added.
export function hasTestWatchdog(command, args, cwd) {
  const root = path.resolve(import.meta.dirname, "..");
  if (command === process.execPath)
    return (
      path.resolve(cwd, args[0] ?? "") ===
      path.join(root, "scripts/test-runner.mjs")
    );
  if (command !== "pnpm" || path.resolve(cwd) !== root) return false;
  try {
    const scripts = JSON.parse(
      readFileSync(path.join(root, "package.json"), "utf8"),
    ).scripts;
    const web = JSON.parse(
      readFileSync(path.join(root, "apps/web/package.json"), "utf8"),
    ).scripts;
    const api = JSON.parse(
      readFileSync(path.join(root, "apps/api/package.json"), "utf8"),
    ).scripts;
    if (args[0] === "db:verify")
      return (
        scripts["db:verify"] === "pnpm --filter @dd-tasks/api db:verify" &&
        api["db:verify"] ===
          "node ../../scripts/test-runner.mjs tsx src/db/commands.ts verify"
      );
    if (
      args[0] === "--filter" &&
      args[1] === "@dd-tasks/api" &&
      args[2] === "db:verify"
    )
      return (
        api["db:verify"] ===
        "node ../../scripts/test-runner.mjs tsx src/db/commands.ts verify"
      );
    const browser =
      web["test:browser"] ===
      "node ../../scripts/test-runner.mjs pnpm --filter @dd-tasks/api exec tsx scripts/test-world.ts browser pnpm --filter @dd-tasks/web exec playwright test --config playwright.config.ts";
    if (
      args[0] === "--filter" &&
      args[1] === "@dd-tasks/web" &&
      args[2] === "test:browser"
    )
      return browser;
    if (args[0] === "test:browser")
      return (
        browser &&
        scripts["test:browser"] === "pnpm --filter @dd-tasks/web test:browser"
      );
    return (
      args[0] === "test:world" &&
      scripts["test:world"] ===
        "node scripts/test-runner.mjs pnpm --filter @dd-tasks/api exec tsx scripts/test-world-isolation.ts"
    );
  } catch {
    return false;
  }
}

export const binding = () => ({
  invocation_id:
    process.env.DD_FLOW_CHECK_INVOCATION_ID ??
    process.env.DD_TASKS_TEST_INVOCATION_ID,
  check_id: process.env.DD_FLOW_CHECK_ID ?? "standalone",
  command:
    process.env.DD_FLOW_CHECK_COMMAND ?? process.env.DD_TASKS_TEST_COMMAND,
  input_hash: process.env.DD_FLOW_CHECK_INPUT_HASH ?? "standalone",
  verification_epoch:
    process.env.DD_FLOW_CHECK_VERIFICATION_EPOCH ?? "standalone",
});
export function evidence(runner, counts, failures, completed = true) {
  const file = process.env.DD_TASKS_RUNNER_REPORT;
  if (!file) return;
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(
    file,
    JSON.stringify(
      boundReport({
        schema_id: "dd-flow/check-runner-evidence@1",
        binding: binding(),
        runner,
        completed,
        counts,
        failures,
      }),
    ),
  );
}
export const managedVitest = () =>
  process.env.DD_TASKS_TEST_WATCHDOG === "1"
    ? {
        testTimeout: 0,
        hookTimeout: 0,
        reporters: [
          "default",
          path.resolve(import.meta.dirname, "vitest-observation.mjs"),
        ],
      }
    : {};
