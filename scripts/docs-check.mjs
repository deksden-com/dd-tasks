import { readFileSync } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  observeToolErrors,
  sha256,
  toolFailure,
} from "./source-diagnostic.mjs";
import { evidence, progress } from "./test-observation.mjs";

const root = process.cwd();
observeToolErrors({ name: "docs", version: "1" });
const requiredFiles = [
  "README.md",
  ".memory-bank/index.md",
  ".memory-bank/structure.md",
  ".memory-bank/plans/index.md",
  ".memory-bank/plans/verification-matrix.md",
  ".memory-bank/scenarios/index.md",
  ".memory-bank/scenarios/SCN-001-foundation-acceptance.md",
  ".memory-bank/scenarios/SCN-003-private-preview-runtime.md",
  ".memory-bank/protocol/index.md",
  ".memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md",
  ".memory-bank/protocol/PRT-001-checkpoint-01-foundation/summary.md",
  ".memory-bank/spec/system/index.md",
  ".memory-bank/spec/engineering/index.md",
  ".memory-bank/spec/operations/index.md",
  ".memory-bank/spec/operations/check-profiles.md",
  ".memory-bank/spec/operations/deploy-policy.md",
  ".memory-bank/spec/operations/operational-access.md",
  ".memory-bank/spec/operations/preview-stages.md",
  ".memory-bank/spec/operations/secrets-policy.md",
  ".memory-bank/spec/operations/workspace-bootstrap-policy.md",
  ".memory-bank/spec/operations/runbooks/workspace-bootstrap.md",
  ".memory-bank/spec/operations/runbooks/preview-runtime.md",
  ".memory-bank/spec/operations/runbooks/exe-dev-preview.md",
  ".memory-bank/spec/operations/scripts/bootstrap-workspace.sh",
  "Dockerfile",
  "compose.preview.yml",
  "scripts/preview-build.mjs",
  "scripts/scenario-preview.mjs",
  "scripts/scenario-foundation.mjs",
  "scripts/docs-check.mjs",
];
const errors = [];
const warnings = [];
const checked = [];
const diagnostics = [];
let currentFile = "scripts/docs-check.mjs";
const record = (message, file = currentFile, missing = false) => {
  file = resolve(root, file);
  errors.push(message);
  diagnostics.push({
    message,
    file,
    missing:
      missing || diagnostics.some((item) => item.file === file && item.missing),
  });
};

for (const relativePath of requiredFiles) {
  try {
    await access(resolve(root, relativePath));
    checked.push(relativePath);
    progress(`step_completed:docs:${relativePath}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    record(`missing required path: ${relativePath}`, relativePath, true);
  }
}

const markdownFiles = requiredFiles.filter(
  (file) => file.endsWith(".md") && file.startsWith(".memory-bank/"),
);
for (const relativePath of markdownFiles) {
  currentFile = relativePath;
  let content = "";
  try {
    content = await readFile(resolve(root, relativePath), "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    continue;
  }
  const frontmatter = parseFrontmatter(content, relativePath);
  if (!frontmatter) {
    record(`missing frontmatter: ${relativePath}`);
    continue;
  }
  for (const key of [
    "description",
    "purpose",
    "version",
    "date",
    "status",
    "parent",
  ]) {
    if (!new RegExp(`^${key}:\\s*\\S`, "m").test(frontmatter)) {
      record(`frontmatter ${key} missing: ${relativePath}`);
    }
  }
  for (const target of pathReferences(frontmatter)) {
    await checkReference(target, relativePath, "frontmatter");
  }
  for (const target of markdownLinks(content)) {
    if (isForbiddenEvidenceTarget(target)) {
      record(
        `ignored run directory used as durable evidence link: ${relativePath} -> ${target}`,
      );
      continue;
    }
    await checkReference(target, relativePath, "markdown");
  }
}

const matrix = await readText(".memory-bank/plans/verification-matrix.md");
const scenario = await readText(
  ".memory-bank/scenarios/SCN-001-foundation-acceptance.md",
);
const previewScenario = await readText(
  ".memory-bank/scenarios/SCN-003-private-preview-runtime.md",
);
const packageJson = JSON.parse(await readText("package.json"));
currentFile = "package.json";
if (
  !packageJson.scripts?.["scenario:foundation"] ||
  !packageJson.scripts?.["docs:check"] ||
  !packageJson.scripts?.["preview:build"] ||
  !packageJson.scripts?.["scenario:preview"]
) {
  record(
    "root package scripts must expose foundation/docs and preview build/scenario commands",
  );
}
currentFile = ".memory-bank/plans/verification-matrix.md";
if (
  !matrix.includes("SCN-001") ||
  !matrix.includes("verification-passport.md") ||
  !matrix.includes("SCN-003") ||
  !matrix.includes("pending_deploy_flow")
) {
  record(
    "verification matrix must bind SCN-001 and SCN-003 with a pending live-provider row",
  );
}
currentFile = ".memory-bank/scenarios/SCN-001-foundation-acceptance.md";
if (
  !(
    scenario.includes("managed localhost") ||
    scenario.includes("managed-localhost")
  ) ||
  !scenario.includes("file://") ||
  !/(запрещ|forbidden|prohibit)/i.test(scenario)
) {
  record(
    "SCN-001 must document managed localhost browser evidence and file:// prohibition",
  );
}
if (
  !scenario.includes("phase-06-cleanup") ||
  !scenario.includes("cleanup failure")
) {
  record(
    "SCN-001 must document mandatory cleanup and cleanup failure semantics",
  );
}
currentFile = ".memory-bank/scenarios/SCN-003-private-preview-runtime.md";
if (
  !previewScenario.includes("SCN-003") ||
  !previewScenario.includes("preview-checkpoint") ||
  !previewScenario.includes("preview-eval-output") ||
  !previewScenario.toLowerCase().includes("live-provider") ||
  !previewScenario.includes("does_not_prove")
) {
  record(
    "SCN-003 must document both preview profiles, source/live split and proof limits",
  );
}

console.log(
  JSON.stringify(
    {
      schema_id: "dd-flow/docs-check@1",
      status: errors.length === 0 ? "passed" : "failed",
      checked_files: checked.length,
      checks: {
        required_paths: requiredFiles.length,
        frontmatter_documents: markdownFiles.length,
        durable_link_policy: "passed",
        scenario_matrix_binding: errors.every(
          (error) => !error.includes("verification matrix"),
        ),
      },
      warnings,
      errors,
    },
    null,
    2,
  ),
);
process.exitCode = errors.length === 0 ? 0 : 1;
const declaration = {
  file: resolve(root, "scripts/docs-check.mjs"),
  sha256: sha256(readFileSync(resolve(root, "scripts/docs-check.mjs"))),
};
const step = JSON.parse(
  process.env.DD_TASKS_CHECK_STEP ??
    JSON.stringify({
      id: "docs",
      ordinal: 0,
      command_sha256: sha256("docs:check"),
    }),
);
evidence(
  { name: "docs", version: "1" },
  { passed: checked.length, failed: diagnostics.length, skipped: 0 },
  diagnostics.map((diagnostic) =>
    toolFailure({
      tool: { name: "docs", version: "1" },
      step,
      diagnostic_code: diagnostic.missing
        ? "required_path_missing"
        : "docs_contract",
      ...diagnostic,
      ...(diagnostic.missing ? { declaration } : {}),
    }),
  ),
);

async function readText(relativePath) {
  try {
    return await readFile(resolve(root, relativePath), "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return "";
  }
}

function parseFrontmatter(content, relativePath) {
  if (!content.startsWith("---\n")) {
    return null;
  }
  const end = content.indexOf("\n---", 4);
  if (end < 0) {
    record(`unterminated frontmatter: ${relativePath}`, relativePath);
    return null;
  }
  return content.slice(4, end);
}

function pathReferences(frontmatter) {
  return [
    ...frontmatter.matchAll(
      /(?:^|[-\s])((?:\.memory-bank|memory-bank|README\.md|scripts|apps)\/[^\s,'"\]]+\.md)/gm,
    ),
  ].map((match) => match[1]);
}

function markdownLinks(content) {
  return [...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(
    (match) => match[1].split("#")[0],
  );
}

function isForbiddenEvidenceTarget(target) {
  return /(?:^|[/])(?:\.tasks|\.scenario-runs)(?:[/]|$)/.test(target);
}

async function checkReference(target, source, kind) {
  if (
    !target ||
    target.startsWith("#") ||
    /^(?:https?:|mailto:|app:|<|RUN-|~\/)/.test(target)
  )
    return;
  if (target.includes("...") || target.includes("<")) return;
  if (isForbiddenEvidenceTarget(target)) {
    if (kind === "markdown")
      record(
        `ignored run directory used as durable reference: ${source} -> ${target}`,
        source,
      );
    return;
  }
  const candidate =
    target.startsWith(".memory-bank/") || target.startsWith("memory-bank/")
      ? resolve(root, target.replace(/^memory-bank\//, ".memory-bank/"))
      : resolve(dirname(resolve(root, source)), target);
  if (!candidate.startsWith(root)) return;
  try {
    await access(candidate);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    record(`broken ${kind} reference: ${source} -> ${target}`, source);
  }
}
