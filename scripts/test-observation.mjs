import {
  closeSync,
  constants,
  fstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

// ponytail: exact browser/world routes; new launchers stay bounded until added.
export function hasTestWatchdog(command, args, cwd) {
  const root = path.resolve(import.meta.dirname, "..");
  if (command === process.execPath)
    return (
      path.resolve(cwd, args[0] ?? "") ===
      path.join(root, "scripts/test-runner.mjs")
    );
  if (command !== "pnpm" || path.resolve(cwd) !== root) return false;
  try {
    const scripts = JSON.parse(
      readFileSync(path.join(root, "package.json"), "utf8"),
    ).scripts;
    const web = JSON.parse(
      readFileSync(path.join(root, "apps/web/package.json"), "utf8"),
    ).scripts;
    const browser =
      web["test:browser"] ===
      "node ../../scripts/test-runner.mjs pnpm --filter @dd-tasks/api exec tsx scripts/test-world.ts browser pnpm --filter @dd-tasks/web exec playwright test --config playwright.config.ts";
    if (
      args[0] === "--filter" &&
      args[1] === "@dd-tasks/web" &&
      args[2] === "test:browser"
    )
      return browser;
    if (args[0] === "test:browser")
      return (
        browser &&
        scripts["test:browser"] === "pnpm --filter @dd-tasks/web test:browser"
      );
    return (
      args[0] === "test:world" &&
      scripts["test:world"] ===
        "node scripts/test-runner.mjs pnpm --filter @dd-tasks/api exec tsx scripts/test-world-isolation.ts"
    );
  } catch {
    return false;
  }
}

export function readProgress(file) {
  const fd = openSync(
    file,
    constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
  );
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > 4 * 1024 * 1024)
      throw new Error("Invalid runner progress file");
    return readFileSync(fd, "utf8");
  } finally {
    closeSync(fd);
  }
}

export const binding = () => ({
  invocation_id:
    process.env.DD_FLOW_CHECK_INVOCATION_ID ??
    process.env.DD_TASKS_TEST_INVOCATION_ID,
  check_id: process.env.DD_FLOW_CHECK_ID ?? "standalone",
  command:
    process.env.DD_FLOW_CHECK_COMMAND ?? process.env.DD_TASKS_TEST_COMMAND,
  input_hash: process.env.DD_FLOW_CHECK_INPUT_HASH ?? "standalone",
  verification_epoch:
    process.env.DD_FLOW_CHECK_VERIFICATION_EPOCH ?? "standalone",
});
export function progress(event, phase = "execution") {
  const file = process.env.DD_FLOW_CHECK_RUNNER_PROGRESS_PATH;
  if (!file) return;
  mkdirSync(path.dirname(file), { recursive: true });
  let sequence = 0;
  try {
    const bytes = readProgress(file);
    if (bytes.length > 4 * 1024 * 1024)
      throw new Error("Runner progress exceeds bound");
    const last = bytes.trim().split("\n").at(-1);
    if (last) sequence = JSON.parse(last).sequence;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const [name, ...detail] = event.split(":");
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
  const fd = openSync(
    file,
    constants.O_APPEND |
      constants.O_CREAT |
      constants.O_WRONLY |
      constants.O_NOFOLLOW |
      constants.O_NONBLOCK,
    0o600,
  );
  try {
    if (!fstatSync(fd).isFile())
      throw new Error("Invalid runner progress destination");
    writeFileSync(
      fd,
      `${JSON.stringify({ schema_id: "dd-flow/check-runner-progress@1", invocation_id: binding().invocation_id, sequence: sequence + 1, phase, event: normalized, detail: detail.join(":") || name, at: new Date().toISOString() })}\n`,
    );
  } finally {
    closeSync(fd);
  }
}
export function evidence(runner, counts, failures, completed = true) {
  const file = process.env.DD_TASKS_RUNNER_REPORT;
  if (!file) return;
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(
    file,
    JSON.stringify({
      schema_id: "dd-flow/check-runner-evidence@1",
      binding: binding(),
      runner,
      completed,
      counts,
      failures,
    }),
  );
}
export const managedVitest = () =>
  process.env.DD_TASKS_TEST_WATCHDOG === "1"
    ? {
        testTimeout: 0,
        hookTimeout: 0,
        reporters: [
          "default",
          path.resolve(import.meta.dirname, "vitest-observation.mjs"),
        ],
      }
    : {};
