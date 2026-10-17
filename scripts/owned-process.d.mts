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
export interface ProcessSettlement {
  settled: boolean;
  reason?: string;
  before: { live_leader: boolean; pid: number | null };
  after: { live_leader: boolean };
  errors: Record<string, unknown>[];
}
export function stopOwnedGroup(
  child: ChildProcess,
  options?: { signal?: NodeJS.Signals; graceMs?: number },
): Promise<ProcessSettlement>;
export function stopOwnedGroups(
  children: ChildProcess[],
  options?: { signal?: NodeJS.Signals; graceMs?: number },
): Promise<ProcessSettlement[]>;
