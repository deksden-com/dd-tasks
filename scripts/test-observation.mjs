import {
  closeSync,
  constants,
  fstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const bounded = (value, limit) => {
  const bytes = Buffer.from(
    String(value ?? "")
      .replace(
        /\b(password|token|secret|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi,
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
    return JSON.parse(readFileSync(fd, "utf8"));
  } finally {
    closeSync(fd);
  }
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
        (f.repair_evidence === undefined ||
          validRepairEvidence(f.repair_evidence, report.binding)),
    )
  );
}
function validRepairEvidence(proof, owner) {
  const world = proof?.world;
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

export function readProgress(file) {
  const fd = openSync(
    file,
    constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
  );
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > 4 * 1024 * 1024)
      throw new Error("Invalid runner progress file");
    return readFileSync(fd, "utf8");
  } finally {
    closeSync(fd);
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
export function progress(event, phase = "execution") {
  const file = process.env.DD_FLOW_CHECK_RUNNER_PROGRESS_PATH;
  if (!file) return;
  mkdirSync(path.dirname(file), { recursive: true });
  let sequence = 0;
  try {
    const bytes = readProgress(file);
    if (bytes.length > 4 * 1024 * 1024)
      throw new Error("Runner progress exceeds bound");
    const last = bytes.trim().split("\n").at(-1);
    if (last) sequence = JSON.parse(last).sequence;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const [name, ...detail] = event.split(":");
  const normalized =
    name === "test_run_started"
      ? "run_started"
      : name === "test_run_completed"
        ? "run_completed"
        : [
              "test_world_created",
              "ports_allocated",
              "migrations_hashed",
              "database_migrated",
            ].includes(name)
          ? "setup_step_completed"
          : name;
  const fd = openSync(
    file,
    constants.O_APPEND |
      constants.O_CREAT |
      constants.O_WRONLY |
      constants.O_NOFOLLOW |
      constants.O_NONBLOCK,
    0o600,
  );
  try {
    if (!fstatSync(fd).isFile())
      throw new Error("Invalid runner progress destination");
    writeFileSync(
      fd,
      `${JSON.stringify({ schema_id: "dd-flow/check-runner-progress@1", invocation_id: binding().invocation_id, sequence: sequence + 1, phase, event: normalized, detail: detail.join(":") || name, at: new Date().toISOString() })}\n`,
    );
  } finally {
    closeSync(fd);
  }
}
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
