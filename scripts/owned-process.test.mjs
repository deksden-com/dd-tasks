import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { test } from "node:test";
import { stopOwnedGroup, stopOwnedGroups } from "./owned-process.mjs";

test("signal refusal reobserves disappearance, persistent refusal never escalates", async () => {
  const original = process.kill;
  for (const disappears of [true, false]) {
    const calls = [];
    const child = { pid: 123456, exitCode: null, signalCode: null };
    process.kill = (pid, signal) => {
      calls.push([pid, signal]);
      throw Object.assign(new Error("denied"), {
        code: signal === 0 && disappears ? "ESRCH" : "EPERM",
        syscall: "kill",
      });
    };
    try {
      const result = await stopOwnedGroup(child);
      assert.equal(result.settled, disappears);
      assert.equal(result.errors[0].code, "EPERM");
      assert.equal(result.errors[0].pid, child.pid);
      assert.equal(
        calls.some((call) => call[1] === "SIGKILL"),
        false,
      );
    } finally {
      process.kill = original;
    }
  }
});
test("exited leader has no signal authority and concurrent calls coalesce", async () => {
  const original = process.kill;
  const signals = [];
  process.kill = (_pid, signal) => {
    signals.push(signal);
    throw Object.assign(new Error("gone"), { code: "ESRCH" });
  };
  try {
    const child = { pid: 123456, exitCode: 0, signalCode: null };
    const first = stopOwnedGroup(child);
    assert.equal(stopOwnedGroup(child), first);
    assert.equal((await first).settled, true);
    assert.deepEqual(signals, [0]);
  } finally {
    process.kill = original;
  }
});
test("batch settles all own detached children", async () => {
  const children = [0, 1].map(() =>
    spawn(process.execPath, ["-e", "setInterval(()=>{},1000)"], {
      detached: true,
      stdio: "ignore",
    }),
  );
  try {
    await Promise.all(children.map((child) => once(child, "spawn")));
    const results = await stopOwnedGroups(children);
    assert.equal(
      results.every((result) => result.settled),
      true,
    );
  } finally {
    for (const child of children)
      if (child.exitCode === null && child.signalCode === null)
        child.kill("SIGKILL");
  }
});
