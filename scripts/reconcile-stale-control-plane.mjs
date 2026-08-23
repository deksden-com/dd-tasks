#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DD_FLOW_HOME =
  process.env.DD_FLOW_HOME ?? path.join(os.homedir(), ".dd-flow");
const DB_PATH = process.env.DD_FLOW_DB ?? path.join(DD_FLOW_HOME, "db.sqlite");
const BACKUP_PATH =
  process.env.DD_FLOW_RECONCILE_BACKUP ??
  path.join(DD_FLOW_HOME, "backups", "mb-upgrade-3.2.0-20260813", "db.sqlite");
const RUNTIME_RECOVERY_BACKUP_DIR =
  process.env.DD_FLOW_RECONCILE_RUNTIME_BACKUP_DIR ??
  path.join(path.dirname(BACKUP_PATH), "recovered-runtime");
const LEGACY_ENGINE = process.env.DD_FLOW_LEGACY_ENGINE ?? "0.3.1";
const FLOW_RUN_V1_ENGINE = process.env.DD_FLOW_RUN_V1_ENGINE ?? "0.4.1";
const FLOW_RUN_V3_ENGINE = process.env.DD_FLOW_RUN_V3_ENGINE ?? "0.4.2";
const REPO_ROOT = process.cwd();
const PROTECTED_PROTOCOLS = new Set(["PRT-344-plan-execution-guidance"]);
const PROTECTED_RUNS = new Set(["RUN-312-plan-execution-guidance"]);
const reconcileProtectedCurrent = process.argv.includes(
  "--reconcile-protected-current",
);
const TERMINAL_PROTOCOLS = new Set([
  "closed",
  "cancelled",
  "canceled",
  "done",
  "completed",
  "failed",
]);
const TERMINAL_RUNS = new Set([
  "done",
  "blocked",
  "cancelled",
  "canceled",
  "failed",
  "completed",
  "discarded",
]);
const TERMINAL_SESSIONS = new Set([
  "stopped",
  "closed",
  "completed",
  "cancelled",
  "canceled",
]);
const execute = process.argv.includes("--execute");
const startedAt = new Date().toISOString();

function fail(message) {
  console.error(`reconcile-stale-control-plane: ${message}`);
  process.exit(2);
}

function json(value) {
  return JSON.stringify(value, null, 2);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function sqlite(sql, db = DB_PATH) {
  try {
    const output = execFileSync("sqlite3", ["-json", db, sql], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    return JSON.parse(output || "[]");
  } catch (error) {
    fail(`read-only sqlite query failed: ${error.message}`);
  }
}

function integrity(db) {
  try {
    return execFileSync("sqlite3", [db, "pragma integrity_check;"], {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    fail(`sqlite integrity check failed for ${db}: ${error.message}`);
  }
}

function localDayStart() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kaliningrad",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return new Date(
    `${values.year}-${values.month}-${values.day}T00:00:00+02:00`,
  );
}

function parseDate(value) {
  const time = Date.parse(value ?? "");
  return Number.isFinite(time) ? time : 0;
}

function addAlias(aliases, value) {
  if (typeof value !== "string" || !path.isAbsolute(value)) return;
  const normalized = path.normalize(value);
  if (normalized.length > 1) aliases.add(normalized.replace(/\/$/, ""));
}

function collectAbsoluteStrings(value, aliases) {
  if (typeof value === "string") {
    addAlias(aliases, value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectAbsoluteStrings(item, aliases);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value))
      collectAbsoluteStrings(item, aliases);
  }
}

function pathMentioned(command, alias) {
  let offset = command.indexOf(alias);
  while (offset >= 0) {
    const before = offset === 0 ? "" : command[offset - 1];
    const after = command[offset + alias.length] ?? "";
    const validBefore = !before || /[\s"'([{=:]/.test(before) || before === "/";
    const validAfter = !after || /[\s"'\])},;:=/]/.test(after);
    if (validBefore && validAfter) return true;
    offset = command.indexOf(alias, offset + 1);
  }
  return false;
}

function processSnapshot() {
  const output = execFileSync("ps", ["-axo", "pid=,command="], {
    encoding: "utf8",
  });
  return output.split("\n").flatMap((line) => {
    const match = line.match(/^\s*(\d+)\s+(.*)$/);
    if (!match) return [];
    const pid = Number(match[1]);
    const command = match[2];
    if (pid === process.pid) return [];
    if (
      /reconcile-stale-control-plane\.mjs|(?:^|\s)(?:ps|rg|sqlite3|jq)(?:\s|$)/.test(
        command,
      )
    )
      return [];
    return [{ pid, command }];
  });
}

function engineRoot(version) {
  const packageName = "@deksden-com_dd-flow-cli";
  const root = path.join(DD_FLOW_HOME, "engines", packageName, version);
  const manifest = readJson(path.join(root, "engine.json"));
  if (
    !manifest ||
    !fs.existsSync(path.join(root, manifest.entrypoint ?? "dist/cli.js"))
  )
    return null;
  return root;
}

function runCli(args, { projectRoot, engine = "router" } = {}) {
  const env = {
    ...process.env,
    DD_FLOW_HOME,
    DD_FLOW_DB: DB_PATH,
  };
  let command = "dd-flow";
  let commandArgs = args;
  if (engine !== "router") {
    const root = engineRoot(engine);
    if (!root)
      return {
        exitCode: 127,
        stdout: "",
        stderr: `engine ${engine} is not installed`,
      };
    const manifest = readJson(path.join(root, "engine.json"));
    command = process.execPath;
    commandArgs = [
      path.join(root, manifest.entrypoint ?? "dist/cli.js"),
      ...args,
    ];
    env.DD_FLOW_ENGINE_MODE = "1";
    env.DD_FLOW_ENGINE_HOME = root;
  }
  const result = spawnSync(command, commandArgs, {
    cwd: projectRoot && fs.existsSync(projectRoot) ? projectRoot : REPO_ROOT,
    env,
    encoding: "utf8",
    timeout: 45_000,
  });
  return {
    exitCode: result.status ?? 1,
    signal: result.signal ?? null,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function compactOutput(result) {
  const raw = `${result.stdout}\n${result.stderr}`.trim();
  if (!raw) return "";
  try {
    const parsed = JSON.parse(result.stdout);
    return JSON.stringify({
      ok: parsed.ok ?? null,
      action: parsed.action ?? null,
      changed: parsed.changed ?? null,
      error: parsed.error ?? null,
      exit_code: parsed.exit_code ?? null,
    });
  } catch {
    return raw.slice(-1200);
  }
}

function action(label, row, args, projectRoot, engine = "router") {
  const record = {
    label,
    id: row.id ?? row.short_id ?? row.session_id,
    project_root: projectRoot,
    engine,
    args,
    placeholder: false,
    authority_recovery: null,
    exit_code: null,
    changed: null,
    output: "",
  };
  if (!execute) {
    record.output = "dry-run";
    return record;
  }
  let prepared;
  try {
    if (label === "run.complete")
      record.authority_recovery = recoverLegacyRuntimeAuthority(row);
    prepared = prepareInvocationRoot(projectRoot);
    record.placeholder = prepared.created.length > 0;
    const result = runCli(args, { projectRoot: prepared.root, engine });
    record.exit_code = result.exitCode;
    record.output = compactOutput(result);
    try {
      const parsed = JSON.parse(result.stdout);
      record.changed = parsed.changed ?? null;
    } catch {
      record.changed = null;
    }
  } catch (error) {
    record.exit_code = 1;
    record.output = error instanceof Error ? error.message : String(error);
  } finally {
    if (prepared) removeEmptyPlaceholder(prepared);
  }
  return record;
}

function assertSafety() {
  if (!fs.existsSync(DB_PATH)) fail(`database does not exist: ${DB_PATH}`);
  if (!fs.existsSync(BACKUP_PATH))
    fail(`backup does not exist: ${BACKUP_PATH}`);
  if (integrity(DB_PATH) !== "ok")
    fail(`database integrity is not ok: ${DB_PATH}`);
  if (integrity(BACKUP_PATH) !== "ok")
    fail(`backup integrity is not ok: ${BACKUP_PATH}`);
  if (!engineRoot(LEGACY_ENGINE))
    fail(`legacy engine ${LEGACY_ENGINE} is not installed`);
  if (!engineRoot(FLOW_RUN_V1_ENGINE))
    fail(`flow-run@1 engine ${FLOW_RUN_V1_ENGINE} is not installed`);
  if (!engineRoot(FLOW_RUN_V3_ENGINE))
    fail(`flow-run-index@3 engine ${FLOW_RUN_V3_ENGINE} is not installed`);
}

function loadState() {
  const projects = sqlite("select id, root, state_root, status from projects;");
  const protocols = sqlite(
    "select id, project_id, project_root, status, stage, workspace_json, created_at, updated_at from protocols;",
  );
  const runs = sqlite(
    "select id, short_id, project_id, project_root, workspace_root, status, runtime_path, run_index_path, index_json, created_at, updated_at from flow_runs;",
  );
  const sessions = sqlite(
    "select session_id, project_id, project_root, status, protocol_id, run_id, workspace_path, created_at, updated_at from flow_sessions;",
  );
  const aliases = new Map(projects.map((project) => [project.id, new Set()]));
  for (const project of projects) {
    addAlias(aliases.get(project.id), project.root);
    addAlias(aliases.get(project.id), project.state_root);
    if (project.state_root)
      addAlias(aliases.get(project.id), path.dirname(project.state_root));
  }
  for (const protocol of protocols) {
    if (!aliases.has(protocol.project_id))
      aliases.set(protocol.project_id, new Set());
    collectAbsoluteStrings(
      readJsonFromText(protocol.workspace_json),
      aliases.get(protocol.project_id),
    );
  }
  for (const run of runs) {
    if (!aliases.has(run.project_id)) aliases.set(run.project_id, new Set());
    addAlias(aliases.get(run.project_id), run.project_root);
    addAlias(aliases.get(run.project_id), run.workspace_root);
    addAlias(aliases.get(run.project_id), run.run_index_path);
  }
  for (const session of sessions) {
    if (!aliases.has(session.project_id))
      aliases.set(session.project_id, new Set());
    addAlias(aliases.get(session.project_id), session.project_root);
    addAlias(aliases.get(session.project_id), session.workspace_path);
  }
  return {
    projects,
    protocols,
    runs,
    sessions,
    aliases,
    projectRoots: new Map(
      projects.map((project) => [project.id, project.root]),
    ),
  };
}

function readJsonFromText(value) {
  try {
    return JSON.parse(value ?? "{}");
  } catch {
    return {};
  }
}

function sha256File(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function isWithin(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return (
    Boolean(relative) &&
    !relative.startsWith("..") &&
    !path.isAbsolute(relative)
  );
}

function writeJsonAtomic(file, value) {
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporary, `${json(value)}\n`);
  fs.renameSync(temporary, file);
}

function recoverLegacyRuntimeAuthority(row) {
  const runtimePath = path.resolve(row.runtime_path ?? "");
  if (!isWithin(DD_FLOW_HOME, runtimePath)) {
    throw new Error(
      `refusing runtime authority outside DD_FLOW_HOME: ${runtimePath}`,
    );
  }
  const current = readJson(runtimePath);
  if (current?.schema_id !== "dd-flow/run@1") return null;

  const index =
    readJson(row.run_index_path) ?? readJsonFromText(row.index_json);
  if (
    index?.schema_id !== "dd-flow/flow-run-index@3" ||
    index.run_id !== row.id
  ) {
    throw new Error(
      `cannot recover legacy authority for ${row.id}: flow-run-index@3 is missing or mismatched`,
    );
  }
  if (!index.flow_flags || !index.snapshot_checksum) {
    throw new Error(
      `cannot recover legacy authority for ${row.id}: flow flag snapshot is incomplete`,
    );
  }

  fs.mkdirSync(RUNTIME_RECOVERY_BACKUP_DIR, { recursive: true });
  const backupPath = path.join(
    RUNTIME_RECOVERY_BACKUP_DIR,
    `${row.id}.run.json`,
  );
  const currentChecksum = sha256File(runtimePath);
  if (fs.existsSync(backupPath)) {
    if (sha256File(backupPath) !== currentChecksum) {
      throw new Error(
        `runtime recovery backup already exists with different content: ${backupPath}`,
      );
    }
  } else {
    fs.copyFileSync(runtimePath, backupPath);
  }

  const recovered = {
    ...index,
    schema_id: "dd-flow/flow-run@1",
    run_index_schema_id: index.schema_id,
    runtime_revision: Math.max(1, Number(index.runtime_revision) || 1),
    snapshot_revision: Math.max(1, Number(index.snapshot_revision) || 1),
    snapshot_checksum: index.snapshot_checksum,
    flow_flags: index.flow_flags,
  };
  writeJsonAtomic(runtimePath, recovered);
  return {
    from_schema: current.schema_id,
    to_schema: recovered.schema_id,
    source_index: row.run_index_path,
    backup_path: backupPath,
    backup_sha256: currentChecksum,
  };
}

function stableProjectRoot(state, row) {
  return state.projectRoots.get(row.project_id) ?? row.project_root;
}

function pathStat(file) {
  try {
    return fs.lstatSync(file);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function prepareInvocationRoot(projectRoot) {
  if (typeof projectRoot !== "string" || !path.isAbsolute(projectRoot)) {
    throw new Error(`project root must be absolute: ${String(projectRoot)}`);
  }
  const absolute = path.normalize(projectRoot);
  if (absolute === path.parse(absolute).root) {
    throw new Error(
      `refusing to use filesystem root as project root: ${absolute}`,
    );
  }
  const existing = pathStat(absolute);
  if (existing) {
    if (!existing.isDirectory())
      throw new Error(`project root is not a directory: ${absolute}`);
    return { root: absolute, created: [] };
  }

  const created = [];
  let cursor = absolute;
  while (!pathStat(cursor)) {
    created.push(cursor);
    cursor = path.dirname(cursor);
    if (cursor === path.parse(cursor).root) break;
  }
  const parent = pathStat(cursor);
  if (!parent?.isDirectory())
    throw new Error(`cannot create placeholder below non-directory: ${cursor}`);
  for (const directory of [...created].reverse()) fs.mkdirSync(directory);
  return { root: absolute, created };
}

function removeEmptyPlaceholder(prepared) {
  for (const directory of prepared.created) {
    try {
      if (fs.readdirSync(directory).length === 0) fs.rmdirSync(directory);
    } catch {
      // Keep any directory that the command or another process populated.
    }
  }
}

function protectReason(row, kind, liveProjects, dayStart) {
  const id =
    kind === "protocol" ? row.id : kind === "run" ? row.id : row.session_id;
  const explicitlyReconciled =
    (kind === "protocol" && PROTECTED_PROTOCOLS.has(id)) ||
    (kind === "run" &&
      (PROTECTED_RUNS.has(id) || PROTECTED_RUNS.has(row.short_id))) ||
    (kind === "session" &&
      (PROTECTED_PROTOCOLS.has(row.protocol_id) ||
        PROTECTED_RUNS.has(row.run_id)));
  if (explicitlyReconciled && !reconcileProtectedCurrent)
    return `current protected ${kind}`;
  if (explicitlyReconciled && reconcileProtectedCurrent) return null;
  if (parseDate(row.created_at) >= dayStart.getTime())
    return "created during current local day";
  if (liveProjects.has(row.project_id)) return "project has a live process";
  return null;
}

function classifyLiveProjects(state, processes) {
  const live = new Map();
  for (const [projectId, projectAliases] of state.aliases) {
    for (const process of processes) {
      for (const alias of projectAliases) {
        if (!pathMentioned(process.command, alias)) continue;
        if (!live.has(projectId)) live.set(projectId, []);
        live.get(projectId).push({
          pid: process.pid,
          command: process.command.slice(0, 500),
          alias,
        });
        break;
      }
      if (
        live.has(projectId) &&
        live.get(projectId).at(-1)?.pid === process.pid
      )
        break;
    }
  }
  return live;
}

function runEngineFor(row) {
  const runtime = readJson(row.runtime_path);
  if (runtime?.schema_id === "dd-flow/run@1") return FLOW_RUN_V1_ENGINE;
  if (runtime?.schema_id === "dd-flow/flow-run@2") return "router";
  const candidates = [row.run_index_path, row.index_json].filter(Boolean);
  for (const candidate of candidates) {
    const index =
      typeof candidate === "string" && candidate.trim().startsWith("{")
        ? readJsonFromText(candidate)
        : readJson(candidate);
    if (index?.schema_id === "dd-flow/flow-run-index@3")
      return FLOW_RUN_V3_ENGINE;
  }
  // Historical rows predate the router's current authority contract. The
  // installed legacy engine is the only supported recovery path for them.
  return LEGACY_ENGINE;
}

function main() {
  assertSafety();
  const dayStart = localDayStart();
  const state = loadState();
  const processes = processSnapshot();
  const liveProjects = classifyLiveProjects(state, processes);
  const report = {
    schema_id: "dd-flow/stale-control-plane-reconcile@1",
    started_at: startedAt,
    finished_at: null,
    mode: execute ? "execute" : "dry_run",
    db_path: DB_PATH,
    backup_path: BACKUP_PATH,
    backup_sha256: crypto
      .createHash("sha256")
      .update(fs.readFileSync(BACKUP_PATH))
      .digest("hex"),
    local_day_start: dayStart.toISOString(),
    protected_protocols: [...PROTECTED_PROTOCOLS],
    protected_runs: [...PROTECTED_RUNS],
    reconcile_protected_current: reconcileProtectedCurrent,
    live_projects: Object.fromEntries(liveProjects),
    actions: [],
    skipped: [],
    errors: [],
  };

  const staleProtocols = state.protocols.filter(
    (row) => !TERMINAL_PROTOCOLS.has(row.status),
  );
  const staleRuns = state.runs.filter((row) => !TERMINAL_RUNS.has(row.status));
  const staleSessions = state.sessions.filter(
    (row) => !TERMINAL_SESSIONS.has(row.status),
  );

  console.log(
    `${report.mode}: ${staleProtocols.length} protocols, ${staleRuns.length} runs, ${staleSessions.length} sessions; ${liveProjects.size} projects protected by live processes`,
  );
  for (const row of staleProtocols) {
    const reason = protectReason(row, "protocol", liveProjects, dayStart);
    if (reason) {
      report.skipped.push({
        kind: "protocol",
        id: row.id,
        project_id: row.project_id,
        reason,
      });
      continue;
    }
    const projectRoot = stableProjectRoot(state, row);
    const args = [
      "protocol",
      "cancel",
      row.id,
      "--project-root",
      projectRoot,
      "--reason",
      "stale control-plane reconciliation before Memory Bank migration",
      "--close-sessions",
      "true",
      "--cancel-queue",
      "true",
      "--release-locks",
      "true",
      "--worktree",
      "keep",
      "--json",
    ];
    const result = action("protocol.cancel", row, args, projectRoot);
    report.actions.push(result);
    console.log(
      `${result.exit_code === null ? "PLAN" : result.exit_code === 0 ? "OK" : "ERR"} protocol ${row.id} ${result.output}`,
    );
  }
  for (const row of staleRuns) {
    const reason = protectReason(row, "run", liveProjects, dayStart);
    if (reason) {
      report.skipped.push({
        kind: "run",
        id: row.id,
        project_id: row.project_id,
        reason,
      });
      continue;
    }
    const projectRoot = stableProjectRoot(state, row);
    const args = [
      "run",
      "complete",
      row.id,
      "--project-root",
      projectRoot,
      "--status",
      "cancelled",
      "--verdict",
      "cancelled during stale control-plane reconciliation",
      "--next-action",
      "none",
      "--json",
    ];
    const result = action(
      "run.complete",
      row,
      args,
      projectRoot,
      runEngineFor(row),
    );
    report.actions.push(result);
    console.log(
      `${result.exit_code === null ? "PLAN" : result.exit_code === 0 ? "OK" : "ERR"} run ${row.short_id ?? row.id} [${result.engine}] ${result.output}`,
    );
  }
  for (const row of staleSessions) {
    const reason = protectReason(row, "session", liveProjects, dayStart);
    if (reason) {
      report.skipped.push({
        kind: "session",
        id: row.session_id,
        project_id: row.project_id,
        reason,
      });
      continue;
    }
    const projectRoot = stableProjectRoot(state, row);
    const args = [
      "session",
      "stop",
      "--project-root",
      projectRoot,
      "--session-id",
      row.session_id,
      "--reason",
      "stale control-plane reconciliation before Memory Bank migration",
      "--json",
    ];
    const result = action("session.stop", row, args, projectRoot);
    report.actions.push(result);
    console.log(
      `${result.exit_code === null ? "PLAN" : result.exit_code === 0 ? "OK" : "ERR"} session ${row.session_id} ${result.output}`,
    );
  }

  report.finished_at = new Date().toISOString();
  report.summary = {
    requested: report.actions.length,
    succeeded: report.actions.filter((item) => item.exit_code === 0).length,
    failed: report.actions.filter(
      (item) => item.exit_code !== null && item.exit_code !== 0,
    ).length,
    skipped: report.skipped.length,
  };
  const reportPath = path.join(
    os.tmpdir(),
    `dd-flow-stale-control-plane-${Date.now()}.json`,
  );
  fs.writeFileSync(reportPath, `${json(report)}\n`);
  console.log(`REPORT ${reportPath}`);
  console.log(`SUMMARY ${JSON.stringify(report.summary)}`);
  if (report.summary.failed > 0) process.exitCode = 1;
}

if (!execute) {
  console.error(
    "dry-run only; rerun with --execute to apply штатные CLI transitions",
  );
}
main();
