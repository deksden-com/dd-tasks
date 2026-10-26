import {
  closeSync,
  constants,
  fstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export { progress, readProgress } from "./runner-progress.mjs";

const bounded = (value, limit) => {
  const bytes = Buffer.from(
    String(value ?? "")
      .replace(/\b(Bearer|Basic)\s+[^\s"']+/gi, "$1 [redacted]")
      .replace(
        /(^|[^\w-])([\w-]+)(["']?\s*[:=]\s*["']?)([^"'\s,;&}]+)/g,
        (whole, prefix, key, separator) =>
          /password|token|secret|api[_-]?key|authorization/i.test(key)
            ? `${prefix}${key}${separator}[redacted]`
            : whole,
      )
      .replace(
        /(\b[a-z][a-z0-9+.-]*:\/\/)[^\s/@]+:[^\s/@]+@/gi,
        "$1[redacted]@",
      )
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
  // Error attribution is diagnostic metadata, never authority to run repair.
  // Preserve native data without parsing stacks or hashing dependency internals.
  return {
    category: context.assertion
      ? "assertion"
      : context.tooling
        ? "tooling"
        : "unclassified",
    code: bounded(error.name ?? context.code ?? "test_failure", 256),
    message: bounded(error.message ?? error.value ?? "Test failed", 4096),
    origin: context.tooling ? "tooling" : "unknown",
    phase: context.phase ?? "test",
    ...(typeof context.file === "string"
      ? { file: path.resolve(context.file) }
      : {}),
    ...(context.test_id ? { test_id: bounded(context.test_id, 1024) } : {}),
    ...((error.stack ?? error.stackStr)
      ? { stack: bounded(error.stack ?? error.stackStr, 16384) }
      : {}),
    ...(typeof error.code === "string"
      ? { native_code: bounded(error.code, 256) }
      : {}),
    classification_reason: "native_diagnostic",
  };
}
export function validReport(report) {
  return (
    [
      "dd-flow/check-runner-evidence@1",
      "dd-flow/check-runner-evidence@2",
    ].includes(report?.schema_id) &&
    (report.failure_projection === undefined ||
      (report.schema_id === "dd-flow/check-runner-evidence@2" &&
        report.failure_projection.state === "partial" &&
        ["count_bound", "byte_bound", "interrupt"].includes(
          report.failure_projection.reason,
        ) &&
        ["represented", "omitted"].every(
          (key) =>
            Number.isSafeInteger(report.failure_projection[key]) &&
            report.failure_projection[key] >= 0,
        ) &&
        report.completed === false)) &&
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
          validRepairEvidence(
            f.repair_evidence,
            f.child_evidence?.binding ?? report.binding,
          )),
    )
  );
}
function validRepairEvidence(proof, owner) {
  const world = proof?.world;
  const reference = (value) =>
    value &&
    typeof value.relative_path === "string" &&
    value.relative_path.length <= 4096 &&
    !path.isAbsolute(value.relative_path) &&
    !value.relative_path
      .split(/[\\/]/)
      .some((part) => !part || part === "." || part === "..") &&
    /^[a-f0-9]{64}$/.test(value.sha256);
  if (proof?.rule === "candidate_library_query_error")
    return (
      proof.exception_type === "TestingLibraryElementError" &&
      proof.phase === "test" &&
      typeof proof.test_id === "string" &&
      proof.test_id.length > 0 &&
      Buffer.byteLength(proof.test_id) <= 4096 &&
      path.isAbsolute(proof.file ?? "") &&
      /^[a-f0-9]{64}$/.test(proof.file_sha256) &&
      [proof.line, proof.column].every(
        (n) => Number.isSafeInteger(n) && n > 0,
      ) &&
      proof.library?.name === "@testing-library/dom" &&
      proof.library.version === "10.4.1" &&
      [proof.library.package_json_sha256, proof.library.lockfile_sha256].every(
        (x) => /^[a-f0-9]{64}$/.test(x),
      ) &&
      Array.isArray(proof.helper_frames) &&
      proof.helper_frames.length >= 2 &&
      proof.helper_frames.length <= 8 &&
      proof.helper_frames.every(
        (frame) =>
          path.isAbsolute(frame.file ?? "") &&
          /^[a-f0-9]{64}$/.test(frame.file_sha256) &&
          [frame.line, frame.column].every(
            (n) => Number.isSafeInteger(n) && n > 0,
          ),
      ) &&
      reference(proof.native_artifact)
    );
  if (proof?.rule === "candidate_test_runtime_error")
    return (
      ["TypeError", "ReferenceError", "Error"].includes(proof.exception_type) &&
      (proof.exception_type !== "Error" || proof.phase === "test") &&
      ["test", "setup", "collection"].includes(proof.phase) &&
      path.isAbsolute(proof.file ?? "") &&
      /^[a-f0-9]{64}$/.test(proof.file_sha256) &&
      [proof.line, proof.column].every(
        (value) => Number.isSafeInteger(value) && value > 0,
      ) &&
      reference(proof.native_artifact)
    );
  if (proof?.rule === "candidate_migration_sql")
    return (
      proof.native_code === "42601" &&
      path.isAbsolute(proof.file ?? "") &&
      /^[a-f0-9]{64}$/.test(proof.file_sha256) &&
      typeof proof.operation_id === "string" &&
      world?.invocation_id === owner.invocation_id &&
      /^[a-f0-9]{32}$/.test(world.world_id) &&
      /^[a-f0-9]{64}$/.test(world.migrations_sha256) &&
      typeof world.role === "string" &&
      world.phase === "migrating" &&
      world.setup_completed === false &&
      reference(proof.native_artifact)
    );
  if (proof?.rule === "candidate_tool_diagnostic")
    return (
      typeof proof.tool?.name === "string" &&
      typeof proof.tool.version === "string" &&
      typeof proof.step?.id === "string" &&
      Number.isSafeInteger(proof.step.ordinal) &&
      proof.step.ordinal >= 0 &&
      /^[a-f0-9]{64}$/.test(proof.step.command_sha256) &&
      typeof proof.diagnostic_code === "string" &&
      path.isAbsolute(proof.file ?? "") &&
      reference(proof.native_artifact) &&
      ((proof.path_state === "present" &&
        /^[a-f0-9]{64}$/.test(proof.file_sha256)) ||
        (proof.path_state === "missing" &&
          proof.file_sha256 === null &&
          path.isAbsolute(proof.declaration?.file ?? "") &&
          /^[a-f0-9]{64}$/.test(proof.declaration.sha256)))
    );
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
      proof.observation_contract === "dd-tasks/browser-observation@2" &&
      typeof proof.target?.page_id === "string" &&
      typeof proof.target?.context_id === "string" &&
      Number.isSafeInteger(proof.window_epoch) &&
      proof.window_epoch > 0 &&
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
        "steps",
        "failure_projection",
      ].includes(key)
    )
      delete report[key];
  if (
    report.failures.length > 64 ||
    Buffer.byteLength(JSON.stringify(report)) > 768 * 1024
  ) {
    const composite = Array.isArray(report.steps);
    const original = report.failures;
    const projected = original.filter((item) => item.child_evidence);
    const locals = original.filter(
      (item) => !item.child_evidence && item.code !== "report_truncated",
    );
    const reason = original.length > 64 ? "count_bound" : "byte_bound";
    // Keep local primary errors ahead of flattened child projections. Child refs
    // retain the complete source; flattening is a bounded diagnostic convenience.
    report.failures = [...locals, ...projected].slice(0, 63);
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
    const represented = composite
      ? report.failures.filter((item) => item.child_evidence).length
      : report.failures.length - 1;
    const before = composite
      ? projected.length
      : original.filter((item) => item.code !== "report_truncated").length;
    report.failure_projection = {
      state: "partial",
      reason,
      represented,
      omitted: (report.failure_projection?.omitted ?? 0) + before - represented,
    };
    if (Buffer.byteLength(JSON.stringify(report)) > 768 * 1024)
      throw new Error(
        "evidence_incomplete: required report identity exceeds bound",
      );
  }
  if (report.failure_projection) report.completed = false;
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
export function evidence(
  runner,
  counts,
  failures,
  completed = true,
  metadata = {},
) {
  const file = process.env.DD_TASKS_RUNNER_REPORT;
  if (!file) return;
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(
    file,
    JSON.stringify(
      boundReport({
        schema_id: "dd-flow/check-runner-evidence@2",
        binding: binding(),
        runner,
        completed,
        counts,
        failures,
        ...metadata,
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
