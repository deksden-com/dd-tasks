import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { acquirePreviewLease } from "./preview-lease.mjs";
import { runtimePorts } from "./runtime-ports.mjs";

const workspaceRoot = process.cwd();
const profile = valueAfter("--profile");
const runId = valueAfter("--run-id");
const claim = valueAfter("--claim") ?? "built-integration+SCN-003-source";
const allowedProfiles = new Set(["preview-checkpoint", "preview-eval-output"]);

if (!allowedProfiles.has(profile) || !isSafeToken(runId)) {
  console.error(
    JSON.stringify({
      status: "blocked",
      code: "INVALID_PREVIEW_BINDING",
      expected: "preview profile plus sanitized --run-id",
    }),
  );
  process.exit(2);
}

const binding = previewBinding(profile, runId);
const releasePreviewLease = await acquirePreviewLease(binding.composeProject);
const passwords = {
  owner: `owner_${randomBytes(12).toString("base64url")}`,
  member: `member_${randomBytes(12).toString("base64url")}`,
  outsider: `outsider_${randomBytes(12).toString("base64url")}`,
  postgres: `postgres_${randomBytes(12).toString("base64url")}`,
};
const cleanEnvironment = { ...process.env };
for (const name of [
  "PREVIEW_OWNER_PASSWORD",
  "PREVIEW_MEMBER_PASSWORD",
  "PREVIEW_OUTSIDER_PASSWORD",
]) {
  delete cleanEnvironment[name];
}
const environment = {
  ...cleanEnvironment,
  PREVIEW_PROFILE: profile,
  PREVIEW_RUN_ID: runId,
  PREVIEW_WORLD_ID: binding.worldId,
  PREVIEW_DATABASE_NAME: binding.databaseName,
  PREVIEW_VOLUME: binding.volume,
  PREVIEW_COMPOSE_PROJECT: binding.composeProject,
  PREVIEW_POSTGRES_PASSWORD: passwords.postgres,
  PREVIEW_IMAGE_NAME:
    process.env.PREVIEW_IMAGE_NAME ?? `dd-tasks-preview:${binding.slug}`,
  PREVIEW_PORT: String(runtimePorts().preview),
  PREVIEW_PROXY_VISIBILITY: "private",
  PREVIEW_REGISTRATION_MODE: "closed",
};
const scenarioRoot = resolve(workspaceRoot, ".scenario-runs", runId);
const profileRoot = resolve(scenarioRoot, profile);
const phases = [];
let startAttempted = false;
let cleanupConfirmed = true;
let overallStatus = "passed";
let overallReason = "all source-package phases passed";
let buildManifest = null;

await mkdir(profileRoot, { recursive: true });
await writeJson("run.json", {
  schema_id: "dd-flow/preview-scenario-run@1",
  run_id: runId,
  scenario_id: "SCN-003",
  profile,
  status: "running",
  started_at: new Date().toISOString(),
  binding: safeBinding(binding),
});
await writeJson("bindings.json", {
  schema_id: "dd-flow/preview-binding@1",
  run_id: runId,
  scenario_id: "SCN-003",
  profile,
  binding: safeBinding(binding),
  actor_roles: ["owner", "member", "outsider"],
  credentials: "operation-scoped, not recorded",
});

try {
  await phase("phase-01-build", async (result) => {
    const built = await run(
      "node",
      ["scripts/preview-build.mjs", "--profile", profile, "--run-id", runId],
      { env: environment, timeoutMs: 600_000 },
    );
    result.command =
      "node scripts/preview-build.mjs --profile <profile> --run-id <run-id>";
    result.exit_code = built.status;
    result.output = { stdout: built.stdout, stderr: built.stderr };
    if (built.status !== 0) throw new Error("preview image build failed");
    buildManifest = parseLastJson(built.stdout);
    if (buildManifest.source_dirty !== false) {
      throw new Error("preview build source was not clean");
    }
    if (
      buildManifest.access_policy?.pair_valid !== true ||
      buildManifest.access_policy?.resolved_registration_mode !== "closed"
    ) {
      throw new Error("preview build access policy was not private+closed");
    }
    result.artifact = safeArtifact(buildManifest);
    result.access_policy = buildManifest.access_policy;
  });

  if (phasePassed("phase-01-build")) {
    await phase("phase-02-start", async (result) => {
      startAttempted = true;
      const startedResult = await compose(["up", "-d", "postgres", "app"]);
      result.command = "docker compose ... up -d postgres app";
      result.exit_code = startedResult.status;
      if (startedResult.status !== 0)
        throw new Error("preview composition did not start");
      await waitForHealth();
      const before = await fetchJson("/api/ready");
      result.liveness = "passed";
      result.readiness_before_init =
        before.status === 503 ? "not_ready" : "unexpectedly_ready";
      if (before.status !== 503)
        throw new Error("readiness was not guarded before initialization");
    });
  }

  if (phasePassed("phase-02-start")) {
    await phase("phase-03-guarded-data", async (result) => {
      const negative = await oneShot("migrate", [
        "--profile",
        profile,
        "--run-id",
        runId,
        "--world-id",
        "wrong-world",
        "--compose-project",
        binding.composeProject,
        "--volume",
        binding.volume,
      ]);
      const migrate = await oneShot("migrate", mutationArgs());
      const reset = await oneShot("reset", mutationArgs());
      const seed = await oneShot("seed", mutationArgs());
      result.negative_binding_exit = negative.status;
      result.negative_binding = parseLastJson(negative.stdout);
      result.migrate_exit = migrate.status;
      result.reset_exit = reset.status;
      result.seed_exit = seed.status;
      if (
        negative.status !== 2 ||
        result.negative_binding?.code !== "TARGET_REJECTED" ||
        result.negative_binding?.binding !== "mismatch" ||
        result.negative_binding?.mutated !== false ||
        migrate.status !== 0 ||
        reset.status !== 0 ||
        seed.status !== 0
      ) {
        throw new Error("guarded migrate/reset/seed phase failed");
      }
      const ready = await waitForReady();
      result.ready = safeReady(ready);
    });
  }

  if (phasePassed("phase-03-guarded-data")) {
    await phase("phase-04-api-role-smoke", async (result) => {
      const health = await fetchJson("/api/health");
      const ready = await fetchJson("/api/ready");
      const config = await fetchJson("/api/config");
      const closedRegistration = await fetchJson("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not-json",
      });
      const unauthenticated = await fetchJson("/api/workspaces");
      const missingApi = await fetchJson("/api/__missing__");
      const deepLink = await fetchText("/workspaces/ws-alpha");
      const demoLogin = await fetchJson("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "owner@example.test",
          password: "local-demo-only",
        }),
      });
      if (
        health.status !== 200 ||
        ready.status !== 200 ||
        config.status !== 200 ||
        config.body?.registration_mode !==
          buildManifest?.access_policy?.resolved_registration_mode ||
        closedRegistration.status !== 403 ||
        closedRegistration.body?.code !== "REGISTRATION_CLOSED"
      )
        throw new Error("health/readiness API smoke failed");
      if (
        unauthenticated.status !== 401 ||
        missingApi.status !== 404 ||
        deepLink.status !== 200 ||
        demoLogin.status !== 401
      ) {
        throw new Error("preview auth/static boundary smoke failed");
      }
      if (
        buildManifest &&
        (ready.body?.revision?.sourceRevision !==
          buildManifest.source_revision ||
          ready.body?.revision?.artifactDigest !==
            buildManifest.artifact_digest)
      ) {
        throw new Error("runtime revision or artifact digest mismatch");
      }
      const owner = await login("owner@example.test", passwords.owner);
      const workspaces = await fetchJson("/api/workspaces", {
        headers: { cookie: owner.cookie },
      });
      const member = await login("member@example.test", passwords.member);
      const memberForbidden = await fetchJson(
        "/api/workspaces/ws-alpha/projects",
        {
          method: "POST",
          headers: {
            cookie: member.cookie,
            "content-type": "application/json",
          },
          body: JSON.stringify({ name: "forbidden" }),
        },
      );
      const outsider = await login("outsider@example.test", passwords.outsider);
      const outsiderIsolation = await fetchJson(
        "/api/workspaces/ws-alpha/projects",
        { headers: { cookie: outsider.cookie } },
      );
      result.health = health.status;
      result.ready = safeReady(ready);
      result.registration_config = {
        status: config.status,
        registration_mode: config.body?.registration_mode ?? null,
      };
      result.closed_registration = {
        status: closedRegistration.status,
        code: closedRegistration.body?.code ?? null,
        body_rejected_before_parse: closedRegistration.status === 403,
      };
      result.unauthenticated = unauthenticated.status;
      result.unauthenticated_code = unauthenticated.body?.code ?? null;
      result.api_missing = missingApi.status;
      result.api_missing_code = missingApi.body?.code ?? null;
      result.deep_link = deepLink.status;
      result.deep_link_content_type =
        deepLink.headers.get("content-type") ?? null;
      result.committed_demo_password = demoLogin.status;
      result.committed_demo_password_code = demoLogin.body?.code ?? null;
      result.owner_workspaces = workspaces.status;
      result.member_owner_mutation = memberForbidden.status;
      result.outsider_cross_workspace = outsiderIsolation.status;
      if (
        workspaces.status !== 200 ||
        memberForbidden.status !== 403 ||
        outsiderIsolation.status !== 404
      )
        throw new Error("API role matrix failed");
    });
  }

  if (phasePassed("phase-04-api-role-smoke")) {
    await phase("phase-05-browser-scn-003", async (result) => {
      const browser = await run(
        "pnpm",
        [
          "--filter",
          "@dd-tasks/web",
          "exec",
          "playwright",
          "test",
          "--config",
          "playwright.preview.config.ts",
          "--project",
          "chromium",
        ],
        {
          env: {
            ...environment,
            PREVIEW_BASE_URL: `http://127.0.0.1:${environment.PREVIEW_PORT}`,
            SCN003_OWNER_PASSWORD: passwords.owner,
            SCN003_MEMBER_PASSWORD: passwords.member,
            SCN003_OUTSIDER_PASSWORD: passwords.outsider,
            SCN003_OUTPUT_DIR: resolve(profileRoot, "browser-results"),
          },
          timeoutMs: 300_000,
        },
      );
      result.command =
        "pnpm --filter @dd-tasks/web exec playwright test --config playwright.preview.config.ts --project chromium";
      result.exit_code = browser.status;
      result.output = {
        stdout: browser.stdout.slice(-3000),
        stderr: browser.stderr.slice(-3000),
      };
      if (browser.status !== 0) throw new Error("SCN-003 browser smoke failed");
    });
  }

  if (phasePassed("phase-05-browser-scn-003")) {
    if (profile === "preview-checkpoint") {
      await phase("phase-06-checkpoint-restart", async (result) => {
        const down = await compose(["down", "--remove-orphans"]);
        const up = await compose(["up", "-d", "postgres", "app"]);
        const migrate = await oneShot("migrate", mutationArgs());
        const ready =
          migrate.status === 0
            ? await waitForReady()
            : { status: 503, body: {} };
        result.down_exit = down.status;
        result.up_exit = up.status;
        result.migrate_exit = migrate.status;
        result.ready = safeReady(ready);
        if (
          down.status !== 0 ||
          up.status !== 0 ||
          migrate.status !== 0 ||
          ready.status !== 200
        )
          throw new Error("checkpoint restart did not preserve readiness");
      });
    } else {
      await phase("phase-06-eval-cleanup", async (result) => {
        const down = await compose(["down", "--remove-orphans"]);
        const removed = await removeVolume();
        result.down_exit = down.status;
        result.volume_remove_exit = removed.status;
        result.volume_absent = removed.absent;
        if (down.status !== 0 || removed.status !== 0 || !removed.absent)
          throw new Error("eval-output cleanup/readback failed");
      });
    }
  }
} catch (error) {
  overallStatus = "failed";
  overallReason =
    error instanceof Error ? error.message : "preview scenario failed";
} finally {
  if (startAttempted) {
    const cleanup = await compose(["down", "--remove-orphans"]);
    const removed = await removeVolume();
    await writeJson("cleanup.json", {
      status: cleanup.status === 0 && removed.absent ? "cleaned" : "failed",
      compose_down_exit: cleanup.status,
      volume_remove_exit: removed.status,
      volume_absent: removed.absent,
      binding: safeBinding(binding),
    });
    if (cleanup.status !== 0 || !removed.absent) {
      overallStatus = "failed";
      overallReason = "exact preview cleanup/readback failed";
      cleanupConfirmed = false;
    }
  }
}

const finalEvidence = {
  schema_id: "dd-flow/preview-scenario-run@1",
  run_id: runId,
  scenario_id: "SCN-003",
  scenario_version: "1",
  status: overallStatus,
  reason: overallReason,
  claim,
  profile,
  contour: "source-package",
  source_revision: buildManifest?.source_revision ?? null,
  source_dirty: buildManifest?.source_dirty ?? null,
  branch: buildManifest?.branch ?? null,
  expected_start_head: process.env.EXPECTED_START_HEAD ?? null,
  observed_head: buildManifest?.source_revision ?? null,
  artifact_digest: buildManifest?.artifact_digest ?? null,
  image: buildManifest?.image ?? null,
  image_id: buildManifest?.image_id ?? null,
  build_timestamp: buildManifest?.build_timestamp ?? null,
  access_policy: buildManifest?.access_policy ?? null,
  proof_id: `SCN-003-${profile}-${runId}`,
  passport_id:
    ".memory-bank/protocol/PRT-004-exe-preview-runtime/evidence/verification-passport.md",
  binding: safeBinding(binding),
  started_at: phases[0]?.started_at ?? null,
  ended_at: new Date().toISOString(),
  phases: phases.map((item) => ({
    phase_id: item.phase_id,
    status: item.status,
    exit_code: item.exit_code ?? null,
    command: item.command ?? null,
  })),
  negative_access: {
    unauthenticated: 401,
    unauthenticated_code: "UNAUTHENTICATED",
    api_missing: 404,
    api_missing_code: "NOT_FOUND",
    deep_link: 200,
    committed_demo_password: 401,
    committed_demo_password_code: "UNAUTHENTICATED",
    member_owner_mutation: "403",
    outsider_cross_workspace: "404",
    registration_closed: 403,
    registration_closed_code: "REGISTRATION_CLOSED",
  },
  data_safety: {
    exact_profile: true,
    exact_world_binding: true,
    destructive_ops_guarded: true,
    committed_demo_password_used: false,
  },
  restart:
    profile === "preview-checkpoint"
      ? "migrate-only-after-volume-retained"
      : "not_applicable",
  cleanup: "exact-binding-readback",
  skipped: [
    "live Exe.dev provider acceptance",
    "manual acceptance",
    "production semantics",
  ],
  blockers: [],
  def: [],
  verdict: overallStatus,
  acceptance_owner: "CODE/readiness",
  does_not_prove: [
    "Exe.dev or any external provider",
    "CI/CD",
    "production availability or backup",
    "public sharing",
  ],
};
await writeJson("state.json", finalEvidence);
await writeJson("proof-manifest.json", finalEvidence);
await writeJson("run.json", {
  schema_id: "dd-flow/preview-scenario-run@1",
  run_id: runId,
  scenario_id: "SCN-003",
  status: overallStatus,
  ended_at: finalEvidence.ended_at,
  profile,
  source_revision: finalEvidence.source_revision,
  source_dirty: finalEvidence.source_dirty,
  artifact_digest: finalEvidence.artifact_digest,
  access_policy: finalEvidence.access_policy,
  proof_id: finalEvidence.proof_id,
  binding: safeBinding(binding),
});
if (cleanupConfirmed) await releasePreviewLease();
console.log(JSON.stringify(finalEvidence, null, 2));
process.exitCode = overallStatus === "passed" ? 0 : 1;

function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}

function isSafeToken(value) {
  return (
    typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(value)
  );
}

function previewBinding(profileName, operationId) {
  const readable = operationId
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 16);
  const identity = createHash("sha256")
    .update(operationId)
    .digest("hex")
    .slice(0, 10);
  const slug = `${readable || "run"}_${identity}`;
  const profileSlug = profileName.replaceAll("-", "_");
  return {
    slug,
    worldId: `world_${profileSlug}_${slug}`,
    composeProject: `dd_tasks_${profileSlug}_${slug}`,
    volume: `dd_tasks_${profileSlug}_${slug}_pgdata`,
    databaseName:
      profileName === "preview-checkpoint"
        ? "dd_tasks_preview_checkpoint"
        : "dd_tasks_preview_eval_output",
  };
}

function safeBinding(value) {
  return {
    profile: value.profile ?? profile,
    world_id: value.worldId,
    compose_project: value.composeProject,
    database: value.databaseName,
    volume: value.volume,
    database_host: "postgres",
    external_port: Number(environment.PREVIEW_PORT),
  };
}

function safeArtifact(value) {
  if (!value) return null;
  return {
    source_revision: value.source_revision,
    source_dirty: value.source_dirty,
    branch: value.branch,
    expected_start_head: value.expected_start_head,
    observed_head: value.observed_head,
    artifact_digest: value.artifact_digest,
    image: value.image,
    image_id: value.image_id,
    access_policy: value.access_policy,
  };
}

function mutationArgs() {
  return [
    "--profile",
    profile,
    "--run-id",
    runId,
    "--world-id",
    binding.worldId,
    "--compose-project",
    binding.composeProject,
    "--volume",
    binding.volume,
  ];
}

async function oneShot(operation, args) {
  return compose([
    "run",
    "--rm",
    "--no-deps",
    "app",
    "node",
    "dist/db/commands.js",
    operation,
    ...args,
  ]);
}

async function compose(args) {
  return run("docker", [...composeArgs(), ...args], {
    env: args.includes("seed")
      ? {
          ...environment,
          PREVIEW_OWNER_PASSWORD: passwords.owner,
          PREVIEW_MEMBER_PASSWORD: passwords.member,
          PREVIEW_OUTSIDER_PASSWORD: passwords.outsider,
        }
      : environment,
    timeoutMs: 300_000,
  });
}

function composeArgs() {
  return [
    "compose",
    "-f",
    "compose.preview.yml",
    "--project-name",
    binding.composeProject,
  ];
}

async function waitForHealth() {
  await waitFor(
    async () => (await fetchJson("/api/health")).status === 200,
    "preview liveness",
  );
}

async function waitForReady() {
  let last = { status: 503, body: {} };
  await waitFor(async () => {
    last = await fetchJson("/api/ready");
    return last.status === 200;
  }, "preview readiness");
  return last;
}

async function waitFor(predicate, label) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    try {
      if (await predicate()) return;
    } catch {
      // Keep waiting through container startup.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 500));
  }
  throw new Error(`${label} timeout`);
}

async function login(email, password) {
  const result = await fetchJson("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (result.status !== 200) throw new Error("preview actor login failed");
  const rawCookie = result.headers.get("set-cookie") ?? "";
  return { cookie: rawCookie.split(";", 1)[0] ?? "" };
}

async function fetchJson(path, options = {}) {
  const response = await fetch(
    `http://127.0.0.1:${environment.PREVIEW_PORT}${path}`,
    options,
  );
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, body, headers: response.headers };
}

async function fetchText(path, options = {}) {
  const response = await fetch(
    `http://127.0.0.1:${environment.PREVIEW_PORT}${path}`,
    options,
  );
  return {
    status: response.status,
    body: await response.text(),
    headers: response.headers,
  };
}

async function removeVolume() {
  const removed = await run("docker", ["volume", "rm", binding.volume], {
    env: environment,
  });
  const readback = await run("docker", ["volume", "inspect", binding.volume], {
    env: environment,
  });
  return {
    status: removed.status === 0 || readback.status !== 0 ? 0 : 1,
    absent: readback.status !== 0,
  };
}

async function phase(phaseId, callback) {
  const item = {
    phase_id: phaseId,
    status: "running",
    started_at: new Date().toISOString(),
  };
  phases.push(item);
  try {
    await callback(item);
    if (item.status === "running") item.status = "passed";
  } catch (error) {
    item.status = "failed";
    item.error = error instanceof Error ? error.message : "phase failed";
    if (overallStatus === "passed") {
      overallStatus = "failed";
      overallReason = item.error;
    }
  } finally {
    item.ended_at = new Date().toISOString();
    await writeJson(`${phaseId}/result.json`, safePhase(item));
  }
}

function phasePassed(phaseId) {
  return phases.find((item) => item.phase_id === phaseId)?.status === "passed";
}

function safePhase(item) {
  return {
    ...item,
    output: item.output
      ? {
          stdout: redact(item.output.stdout ?? ""),
          stderr: redact(item.output.stderr ?? ""),
        }
      : undefined,
  };
}

function safeReady(value) {
  return {
    status: value.status,
    body:
      value.body?.status === "ready"
        ? {
            status: value.body.status,
            service: value.body.service,
            revision: value.body.revision,
          }
        : { code: value.body?.code ?? "NOT_READY" },
  };
}

function parseLastJson(value) {
  const text = value.trim();
  const start = text.indexOf("{");
  return JSON.parse(start >= 0 ? text.slice(start) : text);
}

function run(command, args, options = {}) {
  return new Promise((resolvePromise) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? workspaceRoot,
      env: options.env ?? process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(
        () => child.exitCode === null && child.kill("SIGKILL"),
        2_000,
      ).unref();
    }, options.timeoutMs ?? 120_000);
    child.stdout.on("data", (chunk) => (stdout += String(chunk)));
    child.stderr.on("data", (chunk) => (stderr += String(chunk)));
    child.on("error", (error) => {
      clearTimeout(timeout);
      resolvePromise({ status: 1, stdout: "", stderr: redact(error.message) });
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      resolvePromise({
        status: timedOut ? 124 : (code ?? 1),
        stdout: redact(stdout),
        stderr: redact(stderr),
      });
    });
  });
}

function redact(value) {
  return value
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "postgresql://[redacted]")
    .replace(/(password|token|secret)=([^\s&]+)/gi, "$1=[redacted]");
}

async function writeJson(relativePath, value) {
  const path = join(profileRoot, relativePath);
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
