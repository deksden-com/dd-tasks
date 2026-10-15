export function progress(event: string, phase?: "startup" | "execution"): void;
export function binding(): { invocation_id?: string };
export function readJson(file: string, limit?: number): Record<string, unknown>;
export function worldObservationPaths(directory: string): {
  DD_TASKS_RUNNER_REPORT: string;
  DD_FLOW_CHECK_RUNNER_PROGRESS_PATH: string;
  DD_TASKS_TEST_WORLD_RECEIPT: string;
  DD_TASKS_TEST_WORLD_FINAL_RECEIPT: string;
};
export function assertWorldCleanup(
  ready: Record<string, unknown>,
  final: Record<string, unknown>,
  invocationId: string | undefined,
): void;
export function writeWorldProof(proof: unknown): void;
export function completeWorldSetup(): void;
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
