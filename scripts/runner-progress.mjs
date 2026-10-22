import { randomUUID } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  readSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export const PROGRESS_LIMIT = 4 * 1024 * 1024;
export const RECORD_LIMIT = 16 * 1024;
export function observerGapReason(monotonicElapsed, wallElapsed, progressed) {
  if (Math.abs(wallElapsed - monotonicElapsed) > 60000)
    return "observation_clock_discontinuity";
  return monotonicElapsed > 60000 && !progressed ? "observation_gap" : null;
}
const source = randomUUID();
let localSequence = 0;
const records = [];
const accepted = new Set([
  "setup_step_completed",
  "run_started",
  "module_collected",
  "test_started",
  "test_completed",
  "step_completed",
  "step_started",
  "run_completed",
]);
function problem(code, message) {
  return Object.assign(new Error(message), { code });
}
export function readProgress(file, limit = PROGRESS_LIMIT) {
  const fd = openSync(
    file,
    constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
  );
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > limit)
      throw problem(
        "invalid_progress",
        "Runner progress is not a bounded regular file",
      );
    const bytes = Buffer.alloc(Math.min(limit + 1, stat.size + 1));
    let offset = 0;
    while (offset < bytes.length) {
      const count = readSync(fd, bytes, offset, bytes.length - offset, null);
      if (!count) break;
      offset += count;
    }
    if (offset > limit || fstatSync(fd).size > limit)
      throw problem("invalid_progress", "Runner progress grew beyond bound");
    return bytes.subarray(0, offset).toString("utf8");
  } finally {
    closeSync(fd);
  }
}
function atomic(file, value) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  writeFileSync(temporary, value, { flag: "wx", mode: 0o600 });
  try {
    renameSync(temporary, file);
  } catch (error) {
    try {
      unlinkSync(temporary);
    } catch (cleanup) {
      if (cleanup.code !== "ENOENT") error.cleanup_error = cleanup.message;
    }
    throw error;
  }
}
export function progress(event, phase = "execution") {
  const directory = process.env.DD_TASKS_PROGRESS_MAILBOX_DIR;
  if (!directory) return; // Wrapperless execution cannot publish managed proof.
  const [name, ...details] = event.split(":");
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
  const record = {
    invocation_id:
      process.env.DD_FLOW_CHECK_INVOCATION_ID ??
      process.env.DD_TASKS_TEST_INVOCATION_ID,
    source,
    local_sequence: ++localSequence,
    phase,
    event: normalized,
    detail: details.join(":") || name,
    at: new Date().toISOString(),
  };
  if (
    !accepted.has(normalized) ||
    !["startup", "execution"].includes(phase) ||
    Buffer.byteLength(JSON.stringify(record)) > RECORD_LIMIT
  )
    throw problem("invalid_progress", "Invalid producer progress record");
  records.push(record);
  while (
    records.length > 64 ||
    Buffer.byteLength(JSON.stringify(records)) > 256 * 1024
  )
    records.shift();
  atomic(path.join(directory, `${source}.json`), JSON.stringify(records));
}
export function progressRecords(bytes) {
  // A partial final record is not a completed fact.
  return bytes
    .slice(0, bytes.lastIndexOf("\n") + 1)
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      if (Buffer.byteLength(line) > RECORD_LIMIT)
        throw problem(
          "invalid_progress",
          "Runner progress record exceeds bound",
        );
      try {
        return JSON.parse(line);
      } catch {
        throw problem("invalid_progress", "Malformed complete progress record");
      }
    });
}
export function createProgressPublisher(file, directory, invocationId) {
  if (process.env.DD_TASKS_PROGRESS_PUBLISHER)
    throw problem(
      "progress_ownership_error",
      "Nested progress publisher is not permitted",
    );
  mkdirSync(path.dirname(file), { recursive: true });
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const lock = `${file}.publisher.lock`,
    nonce = randomUUID();
  try {
    writeFileSync(lock, nonce, { flag: "wx", mode: 0o600 });
  } catch (error) {
    if (error.code === "EEXIST")
      throw problem(
        "progress_ownership_error",
        "Progress publisher already owns invocation; stale lock requires explicit settlement",
      );
    throw error;
  }
  let sequence = 0,
    official = [],
    released = false;
  const cursors = new Map();
  const diagnostics = { compacted_records: 0 };
  try {
    try {
      official = progressRecords(readProgress(file));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    for (const item of official) {
      if (
        item.invocation_id !== invocationId ||
        !Number.isSafeInteger(item.sequence) ||
        item.sequence <= sequence
      )
        throw problem(
          "invalid_progress",
          "Prior progress binding or cursor invalid",
        );
      sequence = item.sequence;
    }
  } catch (error) {
    unlinkSync(lock);
    throw error;
  }
  return {
    diagnostics,
    collect() {
      const files = readdirSync(directory).filter((name) =>
        name.endsWith(".json"),
      );
      if (files.length > 64)
        throw problem(
          "progress_capacity_exceeded",
          "More than 64 progress sources",
        );
      const fresh = [];
      for (const name of files) {
        if (!/^[a-f0-9-]{36}\.json$/.test(name))
          throw problem("invalid_progress", "Invalid source mailbox");
        const snapshot = readProgress(path.join(directory, name), 256 * 1024);
        const previous = cursors.get(name);
        if (previous?.snapshot === snapshot) continue;
        let batch;
        try {
          batch = JSON.parse(snapshot);
        } catch {
          throw problem("invalid_progress", "Malformed source snapshot");
        }
        if (!Array.isArray(batch) || batch.length > 64)
          throw problem("invalid_progress", "Invalid source snapshot capacity");
        if (batch[0]?.local_sequence > (previous?.sequence ?? 0) + 1)
          diagnostics.compacted_records +=
            batch[0].local_sequence - (previous?.sequence ?? 0) - 1;
        let local = 0;
        for (const record of batch) {
          const at = Date.parse(record.at);
          if (
            record.source !== name.slice(0, -5) ||
            record.invocation_id !== invocationId ||
            !Number.isSafeInteger(record.local_sequence) ||
            record.local_sequence <= local ||
            !accepted.has(record.event) ||
            !["startup", "execution"].includes(record.phase) ||
            !Number.isFinite(at) ||
            typeof record.detail !== "string" ||
            Buffer.byteLength(JSON.stringify(record)) > RECORD_LIMIT
          )
            throw problem(
              "invalid_progress",
              "Invalid bound source progress record",
            );
          local = record.local_sequence;
          if (local > (previous?.sequence ?? 0)) fresh.push(record);
        }
        cursors.set(name, {
          sequence: Math.max(local, previous?.sequence ?? 0),
          snapshot,
        });
      }
      fresh.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
      const published = fresh.map(
        ({ source: _source, local_sequence: _local, ...record }) => ({
          schema_id: "dd-flow/check-runner-progress@1",
          ...record,
          sequence: ++sequence,
        }),
      );
      if (published.length) {
        official.push(...published);
        while (
          Buffer.byteLength(
            official.map((record) => JSON.stringify(record)).join("\n"),
          ) +
            1 >
          PROGRESS_LIMIT
        )
          official.shift();
        atomic(
          file,
          `${official.map((record) => JSON.stringify(record)).join("\n")}\n`,
        );
      }
      return published;
    },
    release() {
      if (released) return;
      if (readProgress(lock, 128) !== nonce)
        throw problem(
          "progress_ownership_error",
          "Progress publisher lock identity changed",
        );
      unlinkSync(lock);
      released = true;
    },
  };
}
