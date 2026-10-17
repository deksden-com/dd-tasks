import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  createProgressPublisher,
  progressRecords,
  readProgress,
} from "./runner-progress.mjs";

const module = new URL("./runner-progress.mjs", import.meta.url).href;
test("concurrent sources have one increasing cursor and sequential publishers hand it off", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "dd-progress-"));
  const file = path.join(directory, "progress.jsonl"),
    mailbox = path.join(directory, "mailboxes");
  const publisher = createProgressPublisher(file, mailbox, "owner");
  try {
    assert.throws(() => createProgressPublisher(file, mailbox, "owner"), {
      code: "progress_ownership_error",
    });
    const children = ["a", "b"].map((name) =>
      spawn(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          `import {progress} from ${JSON.stringify(module)};for(let i=0;i<64;i++)progress('step_completed:${name}'+i);`,
        ],
        {
          env: {
            ...process.env,
            DD_TASKS_PROGRESS_MAILBOX_DIR: mailbox,
            DD_TASKS_TEST_INVOCATION_ID: "owner",
          },
          stdio: "ignore",
        },
      ),
    );
    const exits = await Promise.all(
      children.map(
        (child) => new Promise((resolve) => child.once("exit", resolve)),
      ),
    );
    assert.deepEqual(exits, [0, 0]);
    assert.equal(publisher.collect().length, 128);
    assert.equal(publisher.collect().length, 0);
    const records = progressRecords(readProgress(file));
    assert.deepEqual(
      records.map((item) => item.sequence),
      Array.from({ length: 128 }, (_, index) => index + 1),
    );
    publisher.release();
    const successor = createProgressPublisher(
      file,
      path.join(directory, "next"),
      "owner",
    );
    const next = spawn(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `import {progress} from ${JSON.stringify(module)};progress('step_completed:next');`,
      ],
      {
        env: {
          ...process.env,
          DD_TASKS_PROGRESS_MAILBOX_DIR: path.join(directory, "next"),
          DD_TASKS_TEST_INVOCATION_ID: "owner",
        },
        stdio: "ignore",
      },
    );
    assert.equal(await new Promise((resolve) => next.once("exit", resolve)), 0);
    assert.equal(successor.collect()[0].sequence, 129);
    successor.release();
    assert.equal(
      progressRecords(readFileSync(file, "utf8")).at(-1).sequence,
      129,
    );
  } finally {
    publisher.release();
    rmSync(directory, { recursive: true });
  }
});
test("publisher rolls official window without resetting sequence and marks compacted source gaps", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "dd-progress-roll-"));
  const mailbox = path.join(directory, "mailboxes"),
    file = path.join(directory, "progress.jsonl");
  const publisher = createProgressPublisher(file, mailbox, "owner");
  const source = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  try {
    for (let batch = 0; batch < 20; batch++) {
      const records = Array.from({ length: 30 }, (_, index) => ({
        invocation_id: "owner",
        source,
        local_sequence: batch * 30 + index + 1,
        phase: "execution",
        event: "step_completed",
        detail: `${batch}:${index}:${"x".repeat(8000)}`,
        at: new Date().toISOString(),
      }));
      writeFileSync(
        path.join(mailbox, `${source}.json`),
        JSON.stringify(records),
      );
      assert.equal(publisher.collect().length, 30);
    }
    const bytes = readProgress(file),
      records = progressRecords(bytes);
    assert.ok(Buffer.byteLength(bytes) <= 4 * 1024 * 1024);
    assert.ok(records[0].sequence > 1);
    assert.equal(records.at(-1).sequence, 600);
    assert.equal(publisher.diagnostics.compacted_records, 0);
    writeFileSync(
      path.join(mailbox, `${source}.json`),
      JSON.stringify([
        {
          invocation_id: "owner",
          source,
          local_sequence: 700,
          phase: "execution",
          event: "step_completed",
          detail: "gap",
          at: new Date().toISOString(),
        },
      ]),
    );
    publisher.collect();
    assert.equal(publisher.diagnostics.compacted_records, 99);
  } finally {
    publisher.release();
    rmSync(directory, { recursive: true });
  }
});
test("partial tail waits but malformed full or oversized records fail", () => {
  assert.deepEqual(progressRecords('{"partial":'), []);
  assert.throws(() => progressRecords("{\n"), { code: "invalid_progress" });
  assert.throws(() => progressRecords(`${"a".repeat(16385)}\n`), {
    code: "invalid_progress",
  });
});
test("reader accepts healthy files beyond 1MiB and rejects unsafe/oversized sources", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "dd-progress-bounds-"));
  try {
    const file = path.join(directory, "progress");
    writeFileSync(file, "x".repeat(2 * 1024 * 1024));
    assert.equal(readProgress(file).length, 2 * 1024 * 1024);
    writeFileSync(file, "x".repeat(4 * 1024 * 1024 + 1));
    assert.throws(() => readProgress(file), { code: "invalid_progress" });
  } finally {
    rmSync(directory, { recursive: true });
  }
});
