# Flow Origin And Project Flow Pack

`dd-flow` prompts have two different origins. Do not collapse them into one path rule.

## Canonical-only flows

These flows run from the canonical `dd-memorybank` checkout:

- `mb-init.md`
- `mb-upgrade.md`
- `mb-distill.md`

Before reading support files, mutating a target project, or running permission preflight, a canonical-only flow must determine:

- `prompt_source_path` - the prompt file actually being executed;
- `cwd` - the current shell directory;
- `canon_repo_root` - the canonical `dd-memorybank` Git/release root; this is the value `DD_MEMORYBANK` should point to;
- `canon_memory_bank_root` - the canonical Memory Bank content root; new layout uses `<canon_repo_root>/.memory-bank`, legacy layout uses `<canon_repo_root>`;
- `canon_root` - compatibility alias for `canon_repo_root`; prefer the explicit name in new text;
- `canon_flow_root` - `<canon_memory_bank_root>/dd-flow`;
- `canon_mbb_root` - `<canon_memory_bank_root>/mbb`;
- `target_project_root` - the repository being initialized, upgraded, reviewed or distilled;
- `target_memory_bank` - usually `<target_project_root>/.memory-bank`.

Resolution order:

1. explicit user path or command option;
2. `dd-flow canon resolve --root <path> --json`, when an explicit path is available;
3. `dd-flow canon resolve --json`, which checks `DD_MEMORYBANK`, then registered runtime config;
4. `DD_MEMORYBANK` directly, if the CLI is absent;
5. nearby `dd-memorybank/` checkout only when unambiguous.

Use `DD_MEMORYBANK`, not `DD_MEMORYBANK_CANON`. `DD_MEMORYBANK` points to `canon_repo_root`, not directly to `.memory-bank/`.

`dd-flow canon resolve --json` should be the preferred source of truth when available. It returns repo root, Memory Bank root, flow root, MBB root and layout. If CLI is absent, detect the new layout first (`<canon_repo_root>/.memory-bank/dd-flow` and `<canon_repo_root>/.memory-bank/mbb`) and legacy layout second (`<canon_repo_root>/dd-flow` and `<canon_repo_root>/mbb`). If both layouts exist and disagree, fail closed and ask the user to resolve the canonical checkout.

If a canonical-only flow is launched from `target_project_root/.memory-bank/dd-flow/<flow>.md`, refuse before preflight and before writes. Tell the user to run the canonical prompt from `canon_flow_root` and pass or infer `target_project_root`. A stale project-local copy of a canonical-only flow must not perform upgrade/init/review/distill work.

Support-file paths in canonical-only flows are resolved from `canon_flow_root`, not from target `.memory-bank/dd-flow`. MBB/aspect/template paths are resolved from `canon_mbb_root`. Release metadata such as `VERSION`, `README.md`, `CHANGELOG.md`, Git commit and tags live at `canon_repo_root`.

## Project-local flows

These flows are installed as a curated project flow pack under `target_project_root/.memory-bank/dd-flow/`:

- `go.md`
- `f.md`
- `prime.md`
- `protocol.md`
- `protocol-implement.md`
- `plan.md`
- `code.md`
- `merge.md`
- `merge-start.md`
- `merge-stop.md`
- `release.md`
- `deploy.md`
- `publish.md`
- `review.md`
- `review-fix.md`
- `mb-audit.md`
- `mb-fix.md`
- `mb-lint.md`

They may include support folders required by those entrypoints, such as `common/`, `prime/`, `mb-sdlc/`, `aspects/`, `def/`, `workers/`, `mb-audit/`, and `schemas/`. Root compatibility aliases such as `plan/`, `code/`, and `merge/` may exist only when the pack intentionally supports old project-local paths. For merge flows, the curated pack must include `mb-sdlc/merge/job.md`, `mb-sdlc/merge/integrate.md`, and `mb-sdlc/merge/stage-report-template.html` whenever `merge.md`, `merge-start.md`, or `merge-stop.md` is installed.

Stage-report-enabled project flows must be installed with their templates and schemas:

- if `plan.md`, `code.md`, any real merge entrypoint, `mb-audit.md`, `mb-fix.md`, `release.md`, `deploy.md` or `publish.md` is installed, include `common/workspace-bootstrap.md` because those consumers may need to prove or explicitly waive checkout readiness before project tooling;
- if `protocol.md` is installed, include `mb-sdlc/specify/stage-report-template.html` and `schemas/specification-stage-report.schema.json`;
- if `plan.md` is installed, include `mb-sdlc/plan/stage-report-template.html`, `mb-sdlc/plan/reflection.md`, `mb-sdlc/plan/review.md`, `mb-sdlc/plan/implementation.md`, `mb-sdlc/plan/operations.md`, `mb-sdlc/plan/scenarios.md` and `schemas/plan-stage-report.schema.json`;
- if `protocol.md` or `plan.md` is installed for normal coding flow, include `common/worker-session.md`, `workers/knowledge-extraction.md` and `schemas/knowledge-candidates.schema.json`;
- if `go.md` or `prime.md` is installed and can launch scouts, include `common/worker-session.md`, `prime/scouts/index.md` and the installed selected `prime/scouts/*.md` files;
- if `go.md`, `mb-sdlc/code/readiness.md`, or a real merge entrypoint is installed, include `common/worker-session.md`, `workers/docs.md` and `workers/protocol-archive.md` because the archive chain requires all three files;
- if `code.md`, `mb-sdlc/code/implement.md`, or `mb-sdlc/code/readiness.md` is installed, include `mb-sdlc/code/stage-report-template.html` and `schemas/code-stage-report.schema.json`;
- if a project flow pack includes prompt/model/agentic runtime review rules, include `workers/repair.md` so invalid model output repair has a standard narrow prompt;
- if any real merge entrypoint is installed, include `mb-sdlc/merge/stage-report-template.html`, `schemas/merge-stage-report.schema.json`, `workers/knowledge-promotion.md` and `schemas/knowledge-promotion-report.schema.json`;
- if `release.md`, `deploy.md` or `publish.md` is installed, include `common/delivery-flows.md`, `common/sdlc-contours.md`, `common/changelog.md`, `common/git-ops.md` and `common/flow-runs.md`;
- if `review.md` is installed, include `mb-sdlc/review.md`, `mb-sdlc/review/index.md`, `mb-sdlc/review/aspects.md`, `mb-sdlc/review/critics/`, `mb-sdlc/review/stage-report-template.html` and `schemas/mb-sdlc-review-report.schema.json`;
- if `review-fix.md` is installed, include `mb-sdlc/review-fix.md`, `mb-sdlc/review.md`, `protocol.md` and `protocol-implement.md`;
- if `protocol-implement.md` or protocol-set support is installed, include `index.md`, `common/lifecycle-guards.md` and schemas required by protocol/runtime status. The same upgrade must also refresh MBB documents that define frontmatter and cross-link rules.

These files are required support files, not optional decoration. If a project flow pack is missing a required stage template or schema, the stage may continue only in degraded mode and must not claim a complete HTML stage report.

Project-local flows must read `.memory-bank/dd-flow/manifest.json` when present. If the manifest is missing, invalid, or old enough to make the pack origin unclear, continue only when the prompt can safely operate with the local files and report `project_flow_pack_degraded`. For `mb-audit` and `mb-fix`, missing manifest is warning-level if the required support files are present; for coding flow it is a handoff risk that must be reported.

## Active Flow Pack Gate

The active project flow pack is deterministic:

- every active file under `.memory-bank/dd-flow/` must be listed in `manifest.json` `included_files`, except `manifest.json` itself and explicitly allowed generated/runtime scratch files;
- `included_files` must not contain canonical-only entrypoints or their support folders;
- unknown local flow customizations are archived with `manual_review_required: true`, not silently kept active;
- old full copies of canonical `dd-flow/` are archived during `mb-upgrade`.

Allowed generated/runtime patterns are intentionally narrow:

- `.memory-bank/dd-flow/manifest.json`;
- `.memory-bank/dd-flow/.generated/**`, if a future tool creates deterministic generated files;
- no `.tasks/**` files inside `.memory-bank/dd-flow/`.

## Manifest And Archive Contracts

The project flow pack manifest must validate against `dd-flow/project-flow-pack-manifest@2` for new installs/upgrades. New `@2` writes include `canon_root`/`canon_repo_root`, `canon_memory_bank_root`, `canon_flow_root`, source commit, canon version and flow contract. `dd-flow/project-flow-pack-manifest@1` remains a legacy-readable/degraded-compatible input so old projects can be audited and upgraded without being treated as broken by default.

Archived obsolete flow files must be accompanied by an archive manifest validating against `dd-flow/archived-flow-manifest@1`. Archive manifests explain what moved, why it moved, whether manual review is required, and which canonical or project-local replacement should be used.

## Upgrade Rule

`mb-upgrade` no longer copies canonical `dd-flow/` wholesale into projects. It installs or refreshes only the curated project flow pack and archives everything else that used to be active under `.memory-bank/dd-flow/`.
