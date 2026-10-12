import type { ChildProcess } from "node:child_process";
export function liveLeader(child: ChildProcess): boolean;
export function signalOwnedGroup(
  child: ChildProcess,
  signal: NodeJS.Signals,
): void;
export function observeGroupSettlement(
  child: ChildProcess,
  timeout?: number,
): Promise<{ settled: boolean; reason?: string }>;
