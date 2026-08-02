import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "README.md",
  ".memory-bank/index.md",
  ".memory-bank/structure.md",
  ".memory-bank/plans/index.md",
  ".memory-bank/plans/verification-matrix.md",
  ".memory-bank/scenarios/index.md",
  ".memory-bank/scenarios/SCN-001-foundation-acceptance.md",
  ".memory-bank/protocol/index.md",
  ".memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md",
  ".memory-bank/protocol/PRT-001-checkpoint-01-foundation/summary.md",
  ".memory-bank/spec/system/index.md",
  ".memory-bank/spec/engineering/index.md",
  ".memory-bank/spec/operations/index.md",
  ".memory-bank/spec/operations/workspace-bootstrap-policy.md",
  ".memory-bank/spec/operations/runbooks/workspace-bootstrap.md",
  ".memory-bank/spec/operations/scripts/bootstrap-workspace.sh",
  "scripts/scenario-foundation.mjs",
  "scripts/docs-check.mjs",
];
const errors = [];
const warnings = [];
const checked = [];

for (const relativePath of requiredFiles) {
  try {
    await access(resolve(root, relativePath));
    checked.push(relativePath);
  } catch {
    errors.push(`missing required path: ${relativePath}`);
  }
}

const markdownFiles = requiredFiles.filter(
  (file) => file.endsWith(".md") && file.startsWith(".memory-bank/"),
);
for (const relativePath of markdownFiles) {
  let content = "";
  try {
    content = await readFile(resolve(root, relativePath), "utf8");
  } catch {
    continue;
  }
  const frontmatter = parseFrontmatter(content, relativePath);
  if (!frontmatter) {
    errors.push(`missing frontmatter: ${relativePath}`);
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
      errors.push(`frontmatter ${key} missing: ${relativePath}`);
    }
  }
  for (const target of pathReferences(frontmatter)) {
    await checkReference(target, relativePath, "frontmatter");
  }
  for (const target of markdownLinks(content)) {
    if (isForbiddenEvidenceTarget(target)) {
      errors.push(
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
const packageJson = JSON.parse(await readText("package.json"));
if (
  !packageJson.scripts?.["scenario:foundation"] ||
  !packageJson.scripts?.["docs:check"]
) {
  errors.push(
    "root package scripts must expose scenario:foundation and docs:check",
  );
}
if (
  !matrix.includes("SCN-001") ||
  !matrix.includes("verification-passport.md")
) {
  errors.push(
    "verification matrix must bind SCN-001 to the verification passport",
  );
}
if (
  !(
    scenario.includes("managed localhost") ||
    scenario.includes("managed-localhost")
  ) ||
  !scenario.includes("file://") ||
  !/(запрещ|forbidden|prohibit)/i.test(scenario)
) {
  errors.push(
    "SCN-001 must document managed localhost browser evidence and file:// prohibition",
  );
}
if (
  !scenario.includes("phase-06-cleanup") ||
  !scenario.includes("cleanup failure")
) {
  errors.push(
    "SCN-001 must document mandatory cleanup and cleanup failure semantics",
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

async function readText(relativePath) {
  try {
    return await readFile(resolve(root, relativePath), "utf8");
  } catch {
    return "";
  }
}

function parseFrontmatter(content, relativePath) {
  if (!content.startsWith("---\n")) {
    return null;
  }
  const end = content.indexOf("\n---", 4);
  if (end < 0) {
    errors.push(`unterminated frontmatter: ${relativePath}`);
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
      errors.push(
        `ignored run directory used as durable reference: ${source} -> ${target}`,
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
  } catch {
    errors.push(`broken ${kind} reference: ${source} -> ${target}`);
  }
}
