import { createHash, randomUUID } from "node:crypto";
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { binding, readJson, sanitizeDiagnostic } from "./test-observation.mjs";

const root = path.resolve(import.meta.dirname, "..");
export const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");
export function atomicJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  writeFileSync(temporary, JSON.stringify(value), { flag: "wx", mode: 0o600 });
  renameSync(temporary, file);
}
export function candidatePath(file, directory = root) {
  const absolute = path.resolve(directory, file);
  const relative = path.relative(realpathSync(root), realpathSync(absolute));
  if (
    !relative ||
    relative.startsWith(`..${path.sep}`) ||
    relative === ".." ||
    path.isAbsolute(relative) ||
    !lstatSync(absolute).isFile()
  )
    throw new Error("Diagnostic file is not a candidate regular file");
  return absolute;
}
export function nativeArtifact(value) {
  const report =
    process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH ??
    process.env.DD_TASKS_RUNNER_REPORT;
  if (!report) return null;
  const relative_path = `native-diagnostic-${randomUUID()}.json`;
  const bytes = JSON.stringify({
    ...sanitizeDiagnostic(value),
    binding: binding(),
  });
  if (Buffer.byteLength(bytes) > 256 * 1024)
    throw new Error("Native diagnostic exceeded bound");
  const file = path.join(path.dirname(report), relative_path);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, bytes, { flag: "wx", mode: 0o600 });
  return { relative_path, sha256: sha256(bytes) };
}
export function toolFailure({
  tool,
  step,
  diagnostic_code,
  file,
  message,
  declaration,
  diagnostic,
  missing = false,
}) {
  let absolute, file_sha256;
  if (missing) {
    absolute = path.resolve(root, file);
    const relative = path.relative(root, absolute);
    if (
      !relative ||
      relative === ".." ||
      relative.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relative)
    )
      throw new Error("Unowned absent diagnostic path");
    let parent = path.dirname(absolute);
    while (true) {
      try {
        realpathSync(parent);
        break;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        parent = path.dirname(parent);
      }
    }
    if (
      !path.relative(realpathSync(root), realpathSync(parent)).startsWith("..")
    ) {
      try {
        lstatSync(absolute);
        throw new Error("Expected absent file exists");
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    } else throw new Error("Absent file parent escapes candidate");
    file_sha256 = null;
  } else {
    absolute = candidatePath(file);
    file_sha256 = sha256(readFileSync(absolute));
  }
  const proof = {
    rule: "candidate_tool_diagnostic",
    tool,
    step,
    diagnostic_code,
    file: absolute,
    file_sha256,
    ...(missing
      ? { path_state: "missing", declaration }
      : { path_state: "present" }),
  };
  const ref = nativeArtifact({
    ...proof,
    ...(diagnostic ? { diagnostic } : {}),
  });
  if (!ref)
    return {
      category: "unclassified",
      code: diagnostic_code,
      message,
      origin: "unknown",
      phase: "collection",
    };
  return {
    category: "unclassified",
    code: diagnostic_code,
    native_code: diagnostic_code,
    message,
    origin: "candidate",
    phase: "collection",
    file: absolute,
    classification_reason: "candidate_tool_diagnostic",
    repair_evidence: { ...proof, native_artifact: ref },
    diagnostic_artifact: ref,
  };
}
export function retainMigrationFailure(error, file, checksum) {
  const destination = process.env.DD_TASKS_SETUP_FAILURE_PATH;
  if (!destination) return;
  const native_code =
    typeof error?.code === "string" ? error.code : "migration_failed";
  const operation_id = `${binding().invocation_id}:migration:${path.basename(file)}`;
  if (error && typeof error === "object")
    Object.assign(error, { dd_tasks_migration_operation_id: operation_id });
  const failure = {
    operation_id,
    category: /^(08|28|53|57|58)/.test(native_code)
      ? "tooling"
      : "unclassified",
    code: native_code,
    native_code,
    origin: "unknown",
    phase: "setup",
    message: `Migration failed (${native_code})`,
  };
  try {
    const ready = readJson(process.env.DD_TASKS_TEST_WORLD_RECEIPT, 16384);
    const absolute = candidatePath(file);
    if (
      native_code === "42601" &&
      ready.invocation_id === binding().invocation_id &&
      ready.world_id === process.env.DD_TASKS_TEST_WORLD &&
      /^[a-f0-9]{32}$/.test(ready.world_id) &&
      /^[a-f0-9]{64}$/.test(ready.migrations_sha256) &&
      ready.ready === false &&
      ready.setup_completed === false &&
      typeof ready.role === "string" &&
      sha256(readFileSync(absolute)) === checksum
    ) {
      const world = {
        invocation_id: ready.invocation_id,
        world_id: ready.world_id,
        role: ready.role,
        migrations_sha256: ready.migrations_sha256,
        phase: "migrating",
        setup_completed: false,
      };
      const proof = {
        rule: "candidate_migration_sql",
        file: absolute,
        file_sha256: checksum,
        native_code,
        operation_id,
        world,
      };
      const ref = nativeArtifact(proof);
      if (ref)
        Object.assign(failure, {
          origin: "candidate",
          file: absolute,
          classification_reason: proof.rule,
          repair_evidence: { ...proof, native_artifact: ref },
          diagnostic_artifact: ref,
        });
    }
  } catch (cause) {
    failure.classification_reason = cause.code ?? "migration_proof_unavailable";
  }
  atomicJson(destination, { binding: binding(), failure });
}

export function retainedSetupFailure() {
  const file = process.env.DD_TASKS_SETUP_FAILURE_PATH;
  if (!file) return null;
  try {
    const value = readJson(file);
    if (JSON.stringify(value.binding) !== JSON.stringify(binding()))
      throw new Error("Setup failure binding mismatch");
    return value.failure;
  } catch (error) {
    if (error.code === "ENOENT") return null;
    return {
      category: "tooling",
      code: "invalid_setup_evidence",
      origin: "tooling",
      phase: "setup",
      message: error.message,
    };
  }
}
