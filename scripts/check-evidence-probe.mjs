import { spawnSync } from "node:child_process";
import {
  cpSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const sourceRoot = path.resolve(import.meta.dirname, "..");
const json = (file, value) => writeFileSync(file, JSON.stringify(value));

// Run the actual producers in a disposable candidate, never in the scored workspace.
export function produceEvidenceProbe({ outputRoot, binding, contract = "dd-tasks/check-evidence-probe@1" }) {
  if (!["dd-tasks/check-evidence-probe@1", "dd-tasks/check-evidence-probe@2"].includes(contract)) throw new Error("Unsupported producer probe contract");
  let output = path.resolve(outputRoot);
  if (
    !binding ||
    [
      "invocation_id",
      "check_id",
      "command",
      "input_hash",
      "verification_epoch",
    ].some(
      (key) =>
        typeof binding[key] !== "string" ||
        !binding[key] ||
        Buffer.byteLength(binding[key]) > 4096,
    )
  )
    throw new Error(
      "Producer probe requires a complete bounded invocation binding",
    );
  mkdirSync(output, { recursive: true });
  const relative = path.relative(
    realpathSync(sourceRoot),
    realpathSync(output),
  );
  if (
    lstatSync(output).isSymbolicLink() ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  )
    throw new Error(
      "Producer probe output must be outside the scored workspace",
    );
  output = realpathSync(output);
  const project = path.join(output, "project");
  mkdirSync(path.join(project, "scripts"), { recursive: true });
  for (const name of [
    "check-evidence-probe",
    "test-observation",
    "source-diagnostic",
    "runner-progress",
    "browser-observation",
    "playwright-observation",
    "tool-diagnostic-runner",
    "quality-runner",
    "owned-process",
  ])
    cpSync(
      path.join(sourceRoot, "scripts", `${name}.mjs`),
      path.join(project, "scripts", `${name}.mjs`),
      { errorOnExist: true, force: false },
    );
  symlinkSync(
    path.join(sourceRoot, "node_modules"),
    path.join(project, "node_modules"),
    "dir",
  );
  mkdirSync(path.join(project, "apps", "web"), { recursive: true });
  cpSync(
    path.join(sourceRoot, "apps", "web", "package.json"),
    path.join(project, "apps", "web", "package.json"),
  );
  symlinkSync(
    path.join(sourceRoot, "apps", "web", "node_modules"),
    path.join(project, "apps", "web", "node_modules"),
    "dir",
  );
  writeFileSync(
    path.join(project, "probe.test.ts"),
    'export function readRows(rows: Element[]) { return rows.map(row => row.querySelector(".row-copy strong")?.textContent()); }\n',
  );
  json(path.join(project, "tsconfig.json"), {
    compilerOptions: {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
      lib: ["ES2022", "DOM"],
    },
    files: ["probe.test.ts"],
  });
  if (contract.endsWith("@2")) {
    const require = createRequire(path.join(sourceRoot, "apps/web/package.json"));
    const installed = path.dirname(createRequire(require.resolve("@testing-library/react")).resolve("@testing-library/dom/package.json"));
    const local = path.join(project, ".probe-library/node_modules/@testing-library/dom");
    mkdirSync(path.dirname(local), { recursive: true });
    cpSync(installed, local, { recursive: true, errorOnExist: true, force: false, filter: file => file === installed || path.basename(file) !== "node_modules" });
    // Ancillary dependencies may be shared read-only; the attested helper
    // package itself is a real candidate-owned installation, never an escape.
    symlinkSync(path.dirname(path.dirname(installed)), path.join(local, "node_modules"), "dir");
    cpSync(path.join(sourceRoot, "pnpm-lock.yaml"), path.join(project, "pnpm-lock.yaml"));
    writeFileSync(path.join(project, "library-query.test.cjs"), `module.exports = function query(document) { return require('./.probe-library/node_modules/@testing-library/dom').getByText(document.body, 'duplicate'); };\n`);
  }
  const cases = [];
  for (const id of [
    "browser-window",
    "runtime-error",
    "runtime-typeerror",
    "compiler",
    "composite",
    ...(contract.endsWith("@2") ? ["library-query"] : []),
  ]) {
    const root = path.join(output, id),
      owner = {
        ...binding,
        invocation_id: `${binding.invocation_id}:${id}`,
        check_id: `${binding.check_id}:${id}`,
      };
    mkdirSync(root);
    const env = {
      ...process.env,
      DD_FLOW_CHECK_INVOCATION_ID: owner.invocation_id,
      DD_FLOW_CHECK_ID: owner.check_id,
      DD_FLOW_CHECK_COMMAND: owner.command,
      DD_FLOW_CHECK_INPUT_HASH: owner.input_hash,
      DD_FLOW_CHECK_VERIFICATION_EPOCH: owner.verification_epoch,
      DD_TASKS_RUNNER_REPORT: path.join(root, "report.json"),
      DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: path.join(root, "report.json"),
      DD_FLOW_CHECK_RUNNER_PROGRESS_PATH: path.join(root, "progress.jsonl"),
      DD_TASKS_BROWSER_OBSERVATION_DIR: path.join(root, "browser-observation"),
      DD_TASKS_TEST_WORLD_RECEIPT: path.join(root, "world.json"),
      DD_TASKS_TEST_WORLD: "a".repeat(32),
    };
    const result = spawnSync(
      process.execPath,
      [
        path.join(project, "scripts", "check-evidence-probe.mjs"),
        "--produce",
        id,
      ],
      { cwd: project, env, encoding: "utf8", maxBuffer: 2 * 1024 * 1024 },
    );
    if (result.status !== 0)
      throw new Error(
        `Evidence producer probe ${id} failed: ${result.stderr.slice(-2000)}`,
      );
    cases.push({
      id,
      root: id,
      candidate_root: "project",
      contract: {
        schema_id: "dd-flow/check-runner-evidence@2",
        path: "report.json",
      },
      binding: owner,
      expected: "source_repair",
    });
  }
  const manifest = { schema_id: contract, cases };
  json(path.join(output, "probe.json"), manifest);
  return manifest;
}

async function emitRuntime(type = "Error") {
  const { normalizeFailure, evidence } = await import("./test-observation.mjs");
  const file = path.join(sourceRoot, "probe.test.ts");
  const message =
    type === "Error"
      ? "Expected synchronized query lock: UPDATE projects"
      : "Invalid native test operation";
  const failure = normalizeFailure(
    {
      name: type,
      message,
      stack: `${type}: ${message}\n    at waitForQueryLock (${file}:1:9)`,
    },
    { file, phase: "test" },
  );
  if (!failure.repair_evidence)
    throw new Error("Native runtime error was not attributed");
  evidence(
    { name: "native-runtime-probe", version: "1" },
    { passed: 0, failed: 1, skipped: 0 },
    [failure],
  );
}

async function produce(id) {
  if (id === "library-query") {
    const require = createRequire(path.join(sourceRoot, "apps/web/package.json"));
    const { JSDOM } = require("jsdom");
    const { normalizeFailure, evidence } = await import("./test-observation.mjs");
    const file = path.join(sourceRoot, "library-query.test.cjs");
    let error;
    try { createRequire(import.meta.url)(file)(new JSDOM('<p>duplicate</p><p>duplicate</p>').window.document); }
    catch (failure) { error = failure; }
    const failure = normalizeFailure(error ?? {}, { file, phase: "test", test_id: "native-library-query" });
    if (failure.repair_evidence?.rule !== "candidate_library_query_error") throw new Error(`Actual library query was not attributed: ${failure.classification_reason}`);
    evidence({ name: "vitest-native-query-probe", version: "1" }, { passed: 0, failed: 1, skipped: 0 }, [failure]);
    return;
  }
  if (id.startsWith("runtime-"))
    return emitRuntime(id === "runtime-error" ? "Error" : "TypeError");
  if (id === "compiler") {
    const { runTool } = await import("./tool-diagnostic-runner.mjs");
    if (
      (await runTool([
        "typescript",
        path.join(sourceRoot, "tsconfig.json"),
      ])) !== 1
    )
      throw new Error("Expected DOM textContent compiler diagnostic");
    const report = JSON.parse(readFileSync(process.env.DD_TASKS_RUNNER_REPORT));
    if (
      !report.failures.some(
        (failure) =>
          ["TS2349", "TS6234"].includes(failure.native_code) &&
          failure.repair_evidence?.rule === "candidate_tool_diagnostic",
      )
    )
      throw new Error("Missing bound native compiler diagnostic");
    return;
  }
  if (id === "composite") {
    const { runQuality } = await import("./quality-runner.mjs");
    if (
      (await runQuality([
        {
          id: "runtime",
          wrapped: true,
          argv: [
            process.execPath,
            import.meta.filename,
            "--produce",
            "runtime-error",
            "--failed-check",
          ],
        },
      ])) !== 1
    )
      throw new Error("Expected composite failure");
    return;
  }
  if (id !== "browser-window") throw new Error("Unsupported producer probe");
  const { default: Reporter } = await import("./playwright-observation.mjs");
  const { binding, evidence } = await import("./test-observation.mjs");
  const world = {
    schema_id: "dd-tasks/test-world-ready@1",
    invocation_id: binding().invocation_id,
    world_id: process.env.DD_TASKS_TEST_WORLD,
    ready: true,
    setup_completed: true,
    migrations_sha256: "b".repeat(64),
    role: "browser",
  };
  json(process.env.DD_TASKS_TEST_WORLD_RECEIPT, world);
  const test = { id: "probe-browser", repeatEachIndex: 0 },
    attempt = {
      invocation_id: binding().invocation_id,
      test_id: test.id,
      retry: 0,
      repeat_each_index: 0,
      worker_index: 0,
    };
  const now = Date.now(),
    deadline = now - 20;
  const snapshot = {
    schema_id: "dd-tasks/browser-worker-observation@1",
    binding: binding(),
    attempt,
    phase: "body",
    observation_contract: "dd-tasks/browser-observation@2",
    target: { page_id: "probe-page", context_id: "probe-context" },
    window_epoch: 1,
    step: {
      id: "probe-step",
      category: "pw:api",
      file: path.join(sourceRoot, "probe.test.ts"),
      line: 1,
    },
    sequence: 1,
    quiet_ms: 1000,
    last_progress_at: new Date(deadline - 1000).toISOString(),
    deadline_at: new Date(deadline).toISOString(),
    observed_at: new Date(deadline - 10).toISOString(),
    health_observed_at: new Date(deadline - 10).toISOString(),
    observation_gap: false,
    browser: { connected: true, page_closed: false, crashed: false },
    world_health: { api: true, web: true, db: true },
    world,
  };
  const result = {
    status: "timedOut",
    errors: [{ message: "Test timeout of 1000ms exceeded." }],
  };
  const reporter = new Reporter(),
    failure = reporter.browserProof(test, result, snapshot, { attempt });
  if (!failure)
    throw new Error("Actual browser reporter rejected @2 observation");
  evidence(
    { name: "playwright", version: "1.62.1" },
    { passed: 0, failed: 1, skipped: 0 },
    [failure],
  );
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv[2] === "--produce") {
    process.env.DD_TASKS_RUNNER_REPORT ??=
      process.env.DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH;
    await produce(process.argv[3]);
    if (process.argv.includes("--failed-check")) process.exitCode = 1;
  } else {
    const args = process.argv.slice(2),
      outputRoot = args[args.indexOf("--output") + 1],
      raw = args[args.indexOf("--binding-json") + 1];
    if (
      !args.includes("--output") ||
      !args.includes("--binding-json") ||
      !outputRoot ||
      !raw
    )
      throw new Error(
        "Usage: --output <new directory> --binding-json <binding>",
      );
    const contract = args.includes("--contract") ? args[args.indexOf("--contract") + 1] : undefined;
    produceEvidenceProbe({ outputRoot, binding: JSON.parse(raw), ...(contract ? { contract } : {}) });
  }
}
