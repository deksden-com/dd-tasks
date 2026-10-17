import { performance } from "node:perf_hooks";

const stopping = new WeakMap();
export function processDiagnostic(error, child, signal) {
  return {
    code:
      typeof error?.code === "string" ? error.code : "process_cleanup_failed",
    syscall: typeof error?.syscall === "string" ? error.syscall : "kill",
    pid: child?.pid ?? null,
    pgid: child?.pid ?? null,
    signal,
    message: String(error?.message ?? error).slice(0, 4096),
  };
}

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
  let lastError;
  do {
    try {
      process.kill(-child.pid, 0);
    } catch (error) {
      if (error.code === "ESRCH") return { settled: true };
      lastError = error;
    }
    if (performance.now() >= deadline) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  } while (performance.now() < deadline);
  return {
    settled: false,
    ...(lastError ? { error: processDiagnostic(lastError, child, 0) } : {}),
    reason:
      lastError?.message ??
      "Process group remains; retired leader grants no signaling authority",
  };
}

// Retained freshly-spawned detached handles only: never reacquire authority by PID.
export function stopOwnedGroup(child, options = {}) {
  if (stopping.has(child)) return stopping.get(child);
  const operation = (async () => {
    const errors = [];
    const before = { live_leader: liveLeader(child), pid: child?.pid ?? null };
    let signalError = false;
    const signal = (value) => {
      try {
        signalOwnedGroup(child, value);
      } catch (error) {
        errors.push(processDiagnostic(error, child, value));
        signalError = true;
      }
    };
    signal(options.signal ?? "SIGTERM");
    let settlement = await observeGroupSettlement(
      child,
      signalError ? 250 : (options.graceMs ?? 5000),
    );
    // A permission/identity error never grants escalation authority.
    if (!settlement.settled && !signalError && liveLeader(child)) {
      signal("SIGKILL");
      settlement = await observeGroupSettlement(
        child,
        signalError ? 250 : 1000,
      );
    }
    return {
      ...settlement,
      before,
      after: { live_leader: liveLeader(child) },
      errors,
    };
  })();
  stopping.set(child, operation);
  return operation;
}
export async function stopOwnedGroups(children, options = {}) {
  // All groups share one parallel drain, rather than N sequential grace periods.
  return Promise.all(children.map((child) => stopOwnedGroup(child, options)));
}
