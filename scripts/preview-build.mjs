import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { runtimePorts } from "./runtime-ports.mjs";

const workspaceRoot = process.cwd();
const profile = valueAfter("--profile");
const runId = valueAfter("--run-id");
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

const accessPolicy = resolveAccessPolicy(profile, process.env);
if (!accessPolicy.valid) {
  console.error(
    JSON.stringify({
      status: "blocked",
      code: accessPolicy.code,
      reason: accessPolicy.reason,
    }),
  );
  process.exit(2);
}

const binding = previewBinding(profile, runId);
const sourceRevision = (await run("git", ["rev-parse", "HEAD"])).stdout.trim();
const branch = (await run("git", ["branch", "--show-current"])).stdout.trim();
const gitStatus = await run("git", ["status", "--porcelain"]);
const sourceDirty = gitStatus.stdout.trim().length > 0;
if (sourceDirty) {
  console.error(
    JSON.stringify({
      status: "blocked",
      code: "SOURCE_DIRTY",
      source_revision: sourceRevision,
      branch,
      reason: "preview source proof requires a clean accepted HEAD",
    }),
  );
  process.exit(2);
}
const artifactDigest = await sourceArtifactDigest(sourceRevision);
const buildTimestamp = new Date().toISOString();
const imageName =
  process.env.PREVIEW_IMAGE_NAME ?? `dd-tasks-preview:${binding.slug}`;
const password =
  process.env.PREVIEW_POSTGRES_PASSWORD ?? `preview_${binding.slug}_local`;
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
  PREVIEW_POSTGRES_PASSWORD: password,
  PREVIEW_IMAGE_NAME: imageName,
  PREVIEW_SOURCE_REVISION: sourceRevision,
  PREVIEW_ARTIFACT_DIGEST: artifactDigest,
  PREVIEW_BUILD_TIMESTAMP: buildTimestamp,
  PREVIEW_REGISTRATION_MODE: accessPolicy.resolved_registration_mode,
};

const composeArgs = [
  "compose",
  "-f",
  "compose.preview.yml",
  "--project-name",
  binding.composeProject,
];
const build = await run(
  "docker",
  [...composeArgs, "build", "--pull=false", "app"],
  { env: environment, timeoutMs: 600_000 },
);
if (build.status !== 0) {
  console.error(
    JSON.stringify({
      status: "failed",
      phase: "build",
      exit_code: build.status,
      stderr: build.stderr,
    }),
  );
  process.exit(1);
}

const inspect = await run(
  "docker",
  ["image", "inspect", imageName, "--format", "{{.Id}}"],
  { env: environment },
);
const imageId = inspect.status === 0 ? inspect.stdout.trim() : "unavailable";
const scenarioRoot = resolve(workspaceRoot, ".scenario-runs", runId, profile);
await mkdir(scenarioRoot, { recursive: true });
const observedRevision = (
  await run("git", ["rev-parse", "HEAD"])
).stdout.trim();
const observedStatus = await run("git", ["status", "--porcelain"]);
if (observedRevision !== sourceRevision || observedStatus.stdout.trim()) {
  console.error(
    JSON.stringify({
      status: "blocked",
      code: "SOURCE_CHANGED_DURING_BUILD",
      expected_revision: sourceRevision,
      observed_revision: observedRevision,
      source_dirty: observedStatus.stdout.trim().length > 0,
    }),
  );
  process.exit(2);
}
const manifest = {
  schema_id: "dd-flow/preview-build-manifest@1",
  status: "built",
  run_id: runId,
  profile,
  source_revision: sourceRevision,
  source_dirty: sourceDirty,
  branch,
  expected_start_head: process.env.EXPECTED_START_HEAD ?? null,
  observed_head: observedRevision,
  artifact_digest: artifactDigest,
  image: imageName,
  image_id: imageId,
  build_timestamp: buildTimestamp,
  binding: {
    world_id: binding.worldId,
    compose_project: binding.composeProject,
    database: binding.databaseName,
    volume: binding.volume,
    database_host: "postgres",
    external_port: Number(String(runtimePorts().preview)),
  },
  access_policy: accessPolicy,
  no_secret_values: true,
  proof_limits: ["source-package only", "does not prove Exe.dev or production"],
};
await writeFile(
  join(scenarioRoot, "build-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
console.log(JSON.stringify(manifest, null, 2));

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

function resolveAccessPolicy(profileName, environment) {
  const requestedProxyVisibility =
    environment.PREVIEW_PROXY_VISIBILITY ?? "private";
  const requestedRegistrationMode =
    environment.PREVIEW_REGISTRATION_MODE ?? "closed";
  const validProxyVisibility = ["private", "public"].includes(
    requestedProxyVisibility,
  );
  const validRegistrationMode = ["open", "closed"].includes(
    requestedRegistrationMode,
  );

  if (!validProxyVisibility || !validRegistrationMode) {
    return {
      valid: false,
      code: "INVALID_ACCESS_POLICY",
      reason: "unsupported_policy_value",
    };
  }
  if (
    requestedProxyVisibility === "public" &&
    requestedRegistrationMode === "open"
  ) {
    return {
      valid: false,
      code: "PUBLIC_OPEN_FORBIDDEN",
      reason: "public_proxy_requires_closed_registration",
    };
  }

  return {
    requested_proxy_visibility: requestedProxyVisibility,
    requested_registration_mode: requestedRegistrationMode,
    pair_valid: true,
    resolved_registration_mode: requestedRegistrationMode,
    profile_default:
      profileName === "preview-checkpoint" ||
      profileName === "preview-eval-output"
        ? "private+closed"
        : "unsupported",
    valid: true,
  };
}

async function sourceArtifactDigest(revision) {
  const files = await sourceFiles(workspaceRoot);
  const hash = createHash("sha256");
  hash.update(`${revision}\n`);
  for (const file of files) {
    hash.update(`${relative(workspaceRoot, file)}\n`);
    hash.update(await readFile(file));
  }
  return `sha256:${hash.digest("hex")}`;
}

async function sourceFiles(root) {
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (
        [
          ".git",
          ".memory-bank",
          ".tasks",
          ".scenario-runs",
          "node_modules",
          "dist",
          "coverage",
          "test-results",
        ].includes(entry.name)
      )
        continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) files.push(path);
    }
  }
  await visit(root);
  return files.sort();
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
