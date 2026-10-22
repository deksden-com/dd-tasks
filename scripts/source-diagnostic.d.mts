export function retainMigrationFailure(
  error: unknown,
  file: string,
  checksum: string,
): void;
export function observeToolErrors(runner: {
  name: string;
  version: string;
}): void;
