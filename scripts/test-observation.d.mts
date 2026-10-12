export function progress(event: string, phase?: "startup" | "execution"): void;
export function managedVitest(): {
  testTimeout?: number;
  hookTimeout?: number;
  reporters?: string[];
};
export function evidence(
  runner: { name: string; version: string },
  counts: { passed: number; failed: number; skipped: number },
  failures: unknown[],
  completed?: boolean,
): void;
export function hasTestWatchdog(
  command: string,
  args: string[],
  cwd: string,
): boolean;
