import { createHash } from "node:crypto";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { binding, readJson } from "./test-observation.mjs";

export const attempt = (info, result = info) => ({
  invocation_id: binding().invocation_id,
  test_id: info.testId ?? info.id,
  retry: result.retry,
  repeat_each_index: info.repeatEachIndex,
  worker_index: result.workerIndex,
});
export const attemptKey = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
export function observationDirectory() {
  const base = process.env.DD_TASKS_BROWSER_OBSERVATION_DIR;
  return base ? path.resolve(base) : null;
}
export function writeObservation(key, role, value) {
  const dir = observationDirectory();
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${key}.${role}.json`);
  const temporary = `${file}.${process.pid}.tmp`;
  const text = JSON.stringify(value);
  if (Buffer.byteLength(text) > 256 * 1024)
    throw new Error("Browser observation capacity exceeded");
  writeFileSync(temporary, text, { mode: 0o600 });
  renameSync(temporary, file);
  return file;
}
export function readObservation(key, role) {
  const dir = observationDirectory();
  if (!dir) return null;
  try {
    return readJson(path.join(dir, `${key}.${role}.json`), 256 * 1024);
  } catch (error) {
    return error.code === "ENOENT" ? null : { observation_error: true };
  }
}
export function artifactReference(file) {
  const root = path.dirname(
    process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH ??
      process.env.DD_TASKS_RUNNER_REPORT ??
      "",
  );
  return {
    relative_path: path.relative(root, file),
    sha256: createHash("sha256")
      .update(JSON.stringify(readJson(file, 256 * 1024)))
      .digest("hex"),
  };
}
