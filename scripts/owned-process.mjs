import { performance } from "node:perf_hooks";

export function liveLeader(child) {
  return (
    Boolean(child?.pid) && child.exitCode === null && child.signalCode === null
  );
}

export function signalOwnedGroup(child, signal) {
  if (!liveLeader(child)) return;
  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

// Leader exit retires signaling authority, not proof that descendants settled.
export async function observeGroupSettlement(child, timeout = 5000) {
  if (!child?.pid) return { settled: true };
  const deadline = performance.now() + timeout;
  do {
    try {
      process.kill(-child.pid, 0);
    } catch (error) {
      return error.code === "ESRCH"
        ? { settled: true }
        : { settled: false, reason: error.message };
    }
    if (performance.now() >= deadline) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  } while (performance.now() < deadline);
  return {
    settled: false,
    reason:
      "Process group remains; retired leader grants no signaling authority",
  };
}
