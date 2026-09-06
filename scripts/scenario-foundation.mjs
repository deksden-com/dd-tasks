import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import net from "node:net";
import { join, resolve } from "node:path";
import { runtimePorts } from "./runtime-ports.mjs";

const postgres = createRequire(
  new URL("../apps/api/package.json", import.meta.url),
)("postgres");
const workspaceRoot = process.cwd();
const runId = valueAfter("--run-id") ?? process.env.RUN_ID ?? "";
const runIdPattern = /^RUN-[0-9]{8}-[0-9]{3}__SCN-001$/;

if (!runIdPattern.test(runId)) {
  console.error(
    JSON.stringify({
      status: "blocked",
      code: "INVALID_RUN_ID",
      expected: "RUN-YYYYMMDD-NNN__SCN-001",
    }),
  );
  process.exit(2);
}

const runToken = runId
  .replace(/^RUN-/, "")
  .replace(/__SCN-001$/, "")
  .toLowerCase();
const invocation = randomUUID().replaceAll("-", "");
const databaseName = `dd_tasks_foundation_local_${invocation}`;
const owner = `dd-tasks:foundation:${invocation}`;
const schemaName = `foundation_${runToken.replaceAll("-", "_")}_scn001`;
const baseDatabase = "postgres";
process.env.DD_FLOW_PORT_API ??= await availablePort();
process.env.DD_FLOW_PORT_WEB ??= await availablePort();
const ports = runtimePorts();
const apiUrl = ports.apiUrl;
const databaseUrl = new URL(
  process.env.DD_TASKS_TEST_ADMIN_URL ??
    "postgresql://dd_tasks:dd_tasks_local@127.0.0.1:55433/postgres",
);
assert(
  ["127.0.0.1", "localhost", "[::1]"].includes(databaseUrl.hostname),
  "Foundation database must be loopback",
);
databaseUrl.pathname = `/${databaseName}`;
const scenarioRoot = resolve(
  workspaceRoot,
  ".scenario-runs",
  runId,
  invocation,
);
const durableEvidencePath = process.env.DD_FLOW_EVIDENCE_PATH
  ? resolve(workspaceRoot, process.env.DD_FLOW_EVIDENCE_PATH)
  : join(scenarioRoot, "phase-05-collect", "foundation-scenario-run.json");

const phases = [];
let ownedApiProcess = null;
let databaseCreated = false;
let overallStatus = "passed";
let overallReason = "all phases passed";
let cancelled = false;
const activeCommands = new Set();
const cancel = () => {
  cancelled = true;
  overallStatus = "failed";
  overallReason = "scenario cancelled";
  for (const child of activeCommands) signalGroup(child, "SIGTERM");
  if (ownedApiProcess) signalGroup(ownedApiProcess, "SIGTERM");
};
process.on("SIGTERM", cancel);
process.on("SIGINT", cancel);

await mkdir(scenarioRoot, { recursive: true });
await writeJson("run.json", {
  run_id: runId,
  scenario_id: "SCN-001",
  status: "running",
  started_at: new Date().toISOString(),
  world: { database: databaseName, schema: schemaName, target: "local" },
});
await writeJson("bindings.json", {
  run_id: runId,
  world_id: `foundation-local-${runToken}-scn001`,
  target_profile: "local",
  database: databaseName,
  schema: schemaName,
  host_class: "loopback",
  credentials: "not_recorded",
});

try {
  await phase("phase-01-world", async (result) => {
    const collision = await psql(
      baseDatabase,
      `SELECT datname FROM pg_database WHERE datname = '${sqlString(databaseName)}'`,
    );
    if (collision.stdout.trim() === databaseName) {
      result.status = "blocked";
      result.next_action =
        "Use a new unique run id; no database mutation was attempted.";
      overallStatus = "blocked";
      overallReason = "derived database already exists; fail-closed collision";
      return;
    }
    const created = await psql(
      baseDatabase,
      `CREATE DATABASE "${databaseName}"`,
    );
    if (created.status !== 0) {
      throw new Error("derived local database creation failed");
    }
    databaseCreated = true;
    const marked = await psql(
      baseDatabase,
      `COMMENT ON DATABASE "${databaseName}" IS '${owner}'`,
    );
    assert(marked.status === 0, "database ownership marker failed");
    result.status = "passed";
    result.world = {
      world_id: `foundation-local-${runToken}-scn001`,
      database: databaseName,
      schema: schemaName,
      target_profile: "local",
      host_class: "loopback",
      collision: "absent_before_mutation",
    };
  });

  if (phasePassed("phase-01-world")) {
    await phase("phase-02-migrate-schema", async (result) => {
      await assertDatabaseOwner();
      const migration = await readFile(
        join(workspaceRoot, "apps/api/drizzle/0000_foundation.sql"),
        "utf8",
      );
      const setup = [
        `CREATE SCHEMA "${schemaName}"`,
        `SET search_path TO "${schemaName}"`,
        "CREATE TABLE foundation_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
        migration,
        `INSERT INTO foundation_migrations (id) VALUES ('0000_foundation.sql')`,
      ].join(";\n");
      const migrated = await psql(databaseName, setup);
      if (migrated.status !== 0) {
        throw new Error("migration application failed");
      }
      const checked = await psql(
        databaseName,
        `SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = '${sqlString(schemaName)}' AND table_name IN ('foundation_metadata', 'foundation_migrations') ORDER BY table_name`,
      );
      const tables = checked.stdout.trim().split("\n").filter(Boolean);
      if (
        checked.status !== 0 ||
        tables.length !== 2 ||
        !tables.every((table) => table.startsWith(`${schemaName}|`))
      ) {
        throw new Error("migration/schema readback failed");
      }
      result.status = "passed";
      result.evidence = {
        migration: "0000_foundation.sql",
        schema: schemaName,
        tables,
        migration_history: ["0000_foundation.sql"],
      };
    });
  }

  if (phasePassed("phase-02-migrate-schema")) {
    await phase("phase-03-api-contract", async (result) => {
      const processReady = await ensureApi();
      const health = await fetchJson(`${apiUrl}/api/health`, {
        headers: { "x-request-id": "caller-controlled-value" },
      });
      const missing = await fetchJson(`${apiUrl}/api/__foundation_missing__`);
      const fault = await fetchJson(`${apiUrl}/api/health`, {
        headers: { "x-foundation-test-fault": "unexpected" },
      });
      assert(
        health.status === 200 && health.body.status === "ok",
        "health contract failed",
      );
      assert(
        health.body.requestId !== "caller-controlled-value",
        "caller request id was reflected",
      );
      assert(
        missing.status === 404 && missing.body.code === "NOT_FOUND",
        "not-found contract failed",
      );
      assert(
        fault.status === 500 && fault.body.code === "INTERNAL_ERROR",
        "fault contract failed",
      );
      for (const response of [health, missing, fault]) {
        const serialized = JSON.stringify(response.body);
        assert(
          !/(stack|sql|postgres|password|\/Users\/|caller-controlled-value)/i.test(
            serialized,
          ),
          "public API response leaked internal detail",
        );
      }
      result.status = "passed";
      result.evidence = {
        server: processReady,
        endpoints: {
          health: {
            status: health.status,
            keys: Object.keys(health.body).sort(),
          },
          missing: {
            status: missing.status,
            keys: Object.keys(missing.body).sort(),
          },
          fault: { status: fault.status, keys: Object.keys(fault.body).sort() },
        },
        correlation: "caller-controlled request id not reflected",
        public_error_boundary: "value-free",
      };
    });
  }

  if (phasePassed("phase-03-api-contract")) {
    await phase("phase-04-browser", async (result) => {
      await stopOwnedApi();
      const browser = await runCommand(
        "pnpm",
        [
          "--filter",
          "@dd-tasks/web",
          "test:browser",
          "--",
          "--project",
          "chromium",
        ],
        {
          cwd: workspaceRoot,
          env: {
            ...process.env,
            CI: "",
            DD_TASKS_BROWSER_RESULTS: join(
              scenarioRoot,
              "browser-results.json",
            ),
          },
          timeoutMs: 180_000,
        },
      );
      result.command =
        "pnpm --filter @dd-tasks/web test:browser -- --project chromium";
      result.command_result = {
        exit_status: browser.status,
        stdout: browser.stdout.slice(-4000),
        stderr: browser.stderr.slice(-4000),
      };
      if (browser.status !== 0) {
        throw new Error("managed localhost Playwright proof failed");
      }
      const browserResultPath = join(scenarioRoot, "browser-results.json");
      let browserSummary = { path: browserResultPath, available: false };
      try {
        const raw = JSON.parse(await readFile(browserResultPath, "utf8"));
        browserSummary = {
          path: browserResultPath,
          available: true,
          suites: Array.isArray(raw.suites) ? raw.suites.length : 0,
          status: raw.status ?? "unknown",
        };
      } catch {
        browserSummary = { path: browserResultPath, available: false };
      }
      result.status = "passed";
      result.evidence = {
        contour: "managed_localhost",
        base_url: ports.webUrl,
        file_url_used: false,
        command:
          "pnpm --filter @dd-tasks/web test:browser -- --project chromium",
        browser_summary: browserSummary,
      };
    });
  }

  if (phasePassed("phase-04-browser")) {
    await phase("phase-05-collect", async (result) => {
      const evidence = {
        schema_id: "dd-flow/foundation-scenario-run@1",
        run_id: runId,
        scenario_id: "SCN-001",
        status: "passed",
        world: {
          world_id: `foundation-local-${runToken}-scn001`,
          database: databaseName,
          schema: schemaName,
          target_profile: "local",
          host_class: "loopback",
        },
        phases: phases.map((item) => ({
          phase_id: item.phase_id,
          status: item.status,
          command: item.command,
        })),
        evidence_contour: "local",
        seed: "not_applicable",
        browser: "managed_localhost_only",
        cleanup: "pending_until_phase_06",
        proof_limits: [
          "does not prove CI, beta/staging, production or live provider",
          "does not prove product/task-tracker behavior",
        ],
      };
      const artifactDir = join(scenarioRoot, "phase-05-collect", "artifacts");
      const apiEvidence =
        phases.find((item) => item.phase_id === "phase-03-api-contract")
          ?.evidence ?? {};
      const persistenceEvidence =
        phases.find((item) => item.phase_id === "phase-02-migrate-schema")
          ?.evidence ?? {};
      const browserEvidence =
        phases.find((item) => item.phase_id === "phase-04-browser")?.evidence ??
        {};
      const artifacts = {
        api_json_contract: "phase-05-collect/artifacts/api-json-contract.json",
        persistence_lifecycle:
          "phase-05-collect/artifacts/persistence-lifecycle.json",
        browser_proof: "phase-05-collect/artifacts/browser-proof.json",
        security_boundary: "phase-05-collect/artifacts/security-boundary.json",
        pipeline_stage_status:
          "phase-05-collect/artifacts/pipeline-stage-status.json",
      };
      await writeJsonAt(join(artifactDir, "api-json-contract.json"), {
        schema_id: "dd-flow/foundation-api-evidence@1",
        run_id: runId,
        ...apiEvidence,
      });
      await writeJsonAt(join(artifactDir, "persistence-lifecycle.json"), {
        schema_id: "dd-flow/foundation-persistence-evidence@1",
        run_id: runId,
        ...persistenceEvidence,
      });
      await writeJsonAt(join(artifactDir, "browser-proof.json"), {
        schema_id: "dd-flow/foundation-browser-evidence@1",
        run_id: runId,
        ...browserEvidence,
      });
      await writeJsonAt(join(artifactDir, "security-boundary.json"), {
        schema_id: "dd-flow/foundation-security-evidence@1",
        run_id: runId,
        no_secret_values: true,
        caller_correlation_id_not_reflected: true,
        browser_contour: "managed_localhost_only",
        value_absence_checks: "phase-03 API responses and browser assertion",
      });
      await writeJsonAt(join(artifactDir, "pipeline-stage-status.json"), {
        schema_id: "dd-flow/foundation-pipeline-evidence@1",
        run_id: runId,
        scenario_phases: phases.map((item) => ({
          phase_id: item.phase_id,
          status: item.status,
        })),
        status: "passed",
        contour: "local",
      });
      evidence.artifacts = artifacts;
      await writeJson("phase-05-collect/result.json", evidence);
      await mkdir(resolve(durableEvidencePath, ".."), { recursive: true });
      await writeJsonAt(durableEvidencePath, evidence);
      result.status = "passed";
      result.evidence_path = durableEvidencePath;
      result.artifacts = artifacts;
    });
  }
} catch (error) {
  overallStatus = overallStatus === "blocked" ? "blocked" : "failed";
  overallReason =
    error instanceof Error ? error.message : "scenario phase failed";
}

await phase("phase-06-cleanup", async (result) => {
  const cleanup = { database: databaseName, schema: schemaName, owner: runId };
  if (ownedApiProcess) {
    await stopOwnedApi();
  }
  if (!databaseCreated) {
    result.status = overallStatus === "blocked" ? "not_applicable" : "failed";
    result.readback = "no owned database existed to clean";
    await writeJson("phase-06-cleanup/cleanup.json", {
      schema_id: "dd-flow/foundation-cleanup-evidence@1",
      run_id: runId,
      database: databaseName,
      schema: schemaName,
      owner: runId,
      status: result.status,
      database_created_by_run: false,
      readback: result.readback,
    });
    return;
  }
  await assertDatabaseOwner();
  const dropped = await psql(
    baseDatabase,
    `DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`,
  );
  const readback = await psql(
    baseDatabase,
    `SELECT datname FROM pg_database WHERE datname = '${sqlString(databaseName)}'`,
  );
  const cleaned = dropped.status === 0 && readback.stdout.trim() === "";
  result.status = cleaned ? "passed" : "failed";
  result.cleanup = cleanup;
  result.readback = {
    drop_exit_status: dropped.status,
    database_absent_after_cleanup: readback.stdout.trim() === "",
  };
  await writeJson("phase-06-cleanup/cleanup.json", {
    schema_id: "dd-flow/foundation-cleanup-evidence@1",
    run_id: runId,
    ...cleanup,
    ...result.readback,
    status: cleaned ? "cleaned" : "failed",
  });
  if (!cleaned) {
    overallStatus = "failed";
    overallReason = "owner-matched database cleanup/readback failed";
  }
});

if (overallStatus === "passed" && !phasePassed("phase-06-cleanup")) {
  overallStatus = "failed";
  overallReason = "cleanup phase did not pass";
}

const finalEvidence = {
  schema_id: "dd-flow/foundation-scenario-run@1",
  run_id: runId,
  scenario_id: "SCN-001",
  status: overallStatus,
  reason: overallReason,
  world: {
    world_id: `foundation-local-${runToken}-scn001`,
    database: databaseName,
    schema: schemaName,
    target_profile: "local",
    host_class: "loopback",
  },
  phases: phases.map((item) => ({
    phase_id: item.phase_id,
    status: item.status,
    command: item.command,
    evidence_path: item.evidence_path ?? null,
  })),
  cleanup:
    phases.find((item) => item.phase_id === "phase-06-cleanup")?.readback ??
    null,
  artifacts:
    phases.find((item) => item.phase_id === "phase-05-collect")?.artifacts ??
    {},
  seed: "not_applicable",
  evidence_contour: "local",
  browser: "managed_localhost_only",
  proof_limits: [
    "does not prove CI, beta/staging, production or live provider",
    "does not prove product/task-tracker behavior",
  ],
};
await writeJson("state.json", finalEvidence);
await writeJsonAt(durableEvidencePath, finalEvidence);
await writeJson("run.json", {
  run_id: runId,
  scenario_id: "SCN-001",
  status: overallStatus,
  reason: overallReason,
  completed_at: new Date().toISOString(),
  world: finalEvidence.world,
});
console.log(JSON.stringify(finalEvidence, null, 2));
process.exitCode =
  overallStatus === "passed" ? 0 : overallStatus === "blocked" ? 2 : 1;

function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function phase(phaseId, callback) {
  const item = {
    phase_id: phaseId,
    status: "running",
    command: phaseId,
    started_at: new Date().toISOString(),
  };
  phases.push(item);
  try {
    if (cancelled && phaseId !== "phase-06-cleanup")
      throw new Error("scenario cancelled");
    await callback(item);
    if (item.status === "running") item.status = "passed";
  } catch (error) {
    item.status = overallStatus === "blocked" ? "blocked" : "failed";
    item.error = error instanceof Error ? error.message : "phase failed";
    if (overallStatus === "passed") {
      overallStatus = "failed";
      overallReason = item.error;
    }
  } finally {
    item.ended_at = new Date().toISOString();
    await writeJson(`${phaseId}/result.json`, item);
  }
}

function phasePassed(phaseId) {
  return phases.find((item) => item.phase_id === phaseId)?.status === "passed";
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sqlString(value) {
  return value.replaceAll("'", "''");
}

async function psql(database, statement) {
  const url = new URL(databaseUrl);
  url.pathname = `/${database}`;
  const client = postgres(url.toString(), { max: 1, connect_timeout: 10 });
  try {
    const rows = await client.unsafe(statement);
    return {
      status: 0,
      stdout: rows.map((row) => Object.values(row).join("|")).join("\n"),
      stderr: "",
    };
  } catch (error) {
    return { status: 1, stdout: "", stderr: redact(error.message) };
  } finally {
    await client.end({ timeout: 5 });
  }
}

async function ensureApi() {
  try {
    const response = await fetch(`${apiUrl}/api/health`);
    if (response.ok) throw new Error("API port is already occupied");
  } catch (error) {
    if (error.message === "API port is already occupied") throw error;
  }
  ownedApiProcess = spawn("pnpm", ["--filter", "@dd-tasks/api", "start"], {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl.toString(),
      PORT: String(ports.api),
      NODE_ENV: "development",
      RUNTIME_PROFILE: "local",
    },
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (ownedApiProcess.exitCode !== null) break;
    try {
      const response = await fetch(`${apiUrl}/api/health`);
      if (response.ok)
        return {
          owned: true,
          reused: false,
          api_url: apiUrl,
          database: databaseName,
          pid: ownedApiProcess.pid,
        };
    } catch {
      // Keep polling the owned process.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error("API did not become ready on managed localhost");
}

async function stopOwnedApi() {
  const processToStop = ownedApiProcess;
  ownedApiProcess = null;
  if (!processToStop || processToStop.exitCode !== null) return;
  signalGroup(processToStop, "SIGTERM");
  await new Promise((resolvePromise) => {
    const timer = setTimeout(resolvePromise, 2_000);
    processToStop.once("exit", () => {
      clearTimeout(timer);
      resolvePromise();
    });
  });
  if (processToStop.exitCode === null) signalGroup(processToStop, "SIGKILL");
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json();
  return { status: response.status, body };
}

function runCommand(command, args, options = {}) {
  return new Promise((resolvePromise) => {
    const child = spawn(command, args, {
      detached: true,
      cwd: options.cwd ?? workspaceRoot,
      env: options.env ?? process.env,
      stdio: [options.input ? "pipe" : "ignore", "pipe", "pipe"],
    });
    activeCommands.add(child);
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      signalGroup(child, "SIGTERM");
      setTimeout(() => {
        signalGroup(child, "SIGKILL");
      }, 2_000).unref();
    }, options.timeoutMs ?? 120_000);
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      activeCommands.delete(child);
      clearTimeout(timeout);
      resolvePromise({ status: 1, stdout, stderr: error.message });
    });
    child.on("close", (status, signal) => {
      if (settled) return;
      settled = true;
      activeCommands.delete(child);
      clearTimeout(timeout);
      resolvePromise({
        status: timedOut ? 124 : (status ?? 1),
        signal,
        timed_out: timedOut,
        stdout: redact(stdout),
        stderr: redact(stderr),
      });
    });
    if (options.input) child.stdin.end(options.input);
  });
}

function redact(value) {
  return value
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "postgresql://[redacted]")
    .replace(/(password|token|secret)=([^\s&]+)/gi, "$1=[redacted]");
}

async function writeJson(relativePath, value) {
  await writeJsonAt(join(scenarioRoot, relativePath), value);
}

async function writeJsonAt(path, value) {
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function assertDatabaseOwner() {
  const result = await psql(
    baseDatabase,
    `SELECT shobj_description(oid, 'pg_database') FROM pg_database WHERE datname = '${databaseName}'`,
  );
  assert(
    result.status === 0 && result.stdout.trim() === owner,
    "Database ownership is not confirmed; mutation refused",
  );
}

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return String(port);
}

function signalGroup(child, signal) {
  if (!child?.pid) return;
  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}
