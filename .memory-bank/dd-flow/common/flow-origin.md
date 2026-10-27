# Flow Origin And Project Flow Pack

`dd-flow` prompts have two different origins. Do not collapse them into one path rule.

## Canonical-only flows

These flows use the selected canonical distribution, never the project pack.
Retained agent-led routes may resolve a `dd-memorybank` checkout; registered
hybrid routes use the verified installed canon and frozen execution bundle:

- `mb-init.md`
- `mb-upgrade.md`
- `mb-distill.md`
- `mb-audit.md`
- `mb-fix.md`
- `review-fix.md`
- `review.md` (registered `project-review`, alias `review`)
- `release.md`
- `deploy.md`
- `publish.md`

Registered hybrid diagnostics execute from the verified installed global canon
and frozen RUN bundle, not a project pack or mutable checkout. They require no
project Memory Bank installation. Retained RUNs keep their pinned engine/packet.

Registered release/deploy/publish likewise resolve their descriptor, instruction
and schema from the verified installed canon into the frozen RUN. Their public
`flow release`, `flow deploy` and `flow publish` ingress selects the project and
retains original user input; starting them grants no publication/deployment
authority. Do not install these entrypoints or their execution subtrees into a
project pack. A missing installed source blocks the affected operation; never
substitute a stale local copy or mutable canonical checkout.

## Retained agent-led canonical discovery

The following checkout-discovery procedure applies only to an explicitly
selected compatible historical agent-led route. Registered hybrid routes use
their installed/frozen source instead; do not rediscover it through DD_MEMORYBANK
or run an extra source preflight before an already issued lifecycle directive.

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
- `fix-def.md`
- `protocol.md`
- `protocol-implement.md`
- `plan.md`
- `code.md`
- `merge.md`
- `merge-start.md`
- `merge-stop.md`
- `mb-lint.md`
- `interactive.md`
- `finish.md`

They may include support folders required by those entrypoints, such as `common/`, `prime/`, `mb-sdlc/`, `aspects/`, `def/`, `workers/`, and `schemas/`. Root compatibility aliases such as `plan/`, `code/`, and `merge/` may exist only when the pack intentionally supports old project-local paths. For merge flows, the curated pack must include `mb-sdlc/merge/job.md`, `mb-sdlc/merge/integrate.md`, and `mb-sdlc/merge/stage-report-template.html` whenever `merge.md`, `merge-start.md`, or `merge-stop.md` is installed.

Stage-report-enabled project flows must be installed with their templates and schemas:

- interactive includes `interactive/flow-descriptor.json`, all `interactive/hybrid/` coordinator/worker instructions and both interactive result schemas. Its six-stage project descriptor and retained local pack are mandatory; a missing/legacy manifest is not permission for degraded manual execution or global-canon fallback;

- generated-matrix consumers include `common/verification-matrix.md` and `schemas/verification-matrix.schema.json`; operative rules come from this pack, not from a potentially older project MBB copy;

- if `plan.md`, `code.md` or any real merge entrypoint is installed, include `common/workspace-bootstrap.md` because those consumers may need to prove or explicitly waive checkout readiness before project tooling;
- if `protocol.md` is installed, include `mb-sdlc/specify/stage-report-template.html` and `schemas/specification-stage-report.schema.json`;
- if `plan.md` is installed, include `mb-sdlc/plan/stage-report-template.html`, `mb-sdlc/plan/reflection.md`, `mb-sdlc/plan/review.md`, `mb-sdlc/plan/implementation.md`, `mb-sdlc/plan/operations.md`, `mb-sdlc/plan/scenarios.md` and `schemas/plan-stage-report.schema.json`;
- if `protocol.md` or `plan.md` is installed for normal coding flow, include `common/worker-session.md`, `workers/knowledge-extraction.md` and `schemas/knowledge-candidates.schema.json`;
- if `go.md` or `prime.md` is installed and can launch scouts, include `common/worker-session.md`, `prime/scouts/index.md` and the installed selected `prime/scouts/*.md` files;
- if `go.md`, `mb-sdlc/code/readiness.md`, or a real merge entrypoint is installed, include `common/worker-session.md`, `workers/docs.md` and `workers/protocol-archive.md` because the archive chain requires all three files;
- if `code.md`, `mb-sdlc/code/implement.md`, or `mb-sdlc/code/readiness.md` is installed, include `mb-sdlc/code/stage-report-template.html` and `schemas/code-stage-report.schema.json`;
- if a project flow pack includes prompt/model/agentic runtime review rules, include `workers/repair.md` so invalid model output repair has a standard narrow prompt;
- if any real merge entrypoint is installed, include `mb-sdlc/merge/stage-report-template.html`, `schemas/merge-stage-report.schema.json`, `workers/knowledge-promotion.md` and `schemas/knowledge-promotion-report.schema.json`;
- shared delivery guidance and historical report schemas/templates may remain as read-only project references; their presence never supplies a local delivery execution route or another flow's authority;
- retained `mb-sdlc/review/` criteria and historical report readers do not authorize manual review lifecycle; new diagnostics use global `review`/`project-review`;
- new review-fix uses the global canonical three-stage workflow; its legacy `mb-sdlc/review-fix.md` pointer is not a project-pack execution route;
- if `protocol-implement.md` or protocol-set support is installed, include `index.md`, `common/lifecycle-guards.md` and schemas required by protocol/runtime status. The same upgrade must also refresh MBB documents that define frontmatter and cross-link rules.

These files are required support files, not optional decoration. If a project flow pack is missing a required stage template or schema, the stage may continue only in degraded mode and must not claim a complete HTML stage report.

Project-local flows must read `.memory-bank/dd-flow/manifest.json` when present. If the manifest is missing, invalid, or old enough to make the pack origin unclear, continue only when the prompt can safely operate with the local files and report `project_flow_pack_degraded`. For coding flow this is a handoff risk that must be reported. Registered canonical-only flows do not fall back to a degraded local lifecycle.

## Active Flow Pack Gate

The active project flow pack is deterministic:

- every active file under `.memory-bank/dd-flow/` must be listed in `manifest.json` `included_files`, except `manifest.json` itself and explicitly allowed generated/runtime scratch files;
- `included_files` must not contain canonical-only entrypoints or their support folders;
- unchanged obsolete canonical copies are archived only against an independent retained baseline;
- local customizations require an explicit lossless preservation/migration decision and `manual_review_required: true` where unresolved; do not overwrite or delete them merely because the new pack excludes that path;
- inventory retention is not completed active-pack acceptance: resolve unexpected active paths through the upgrade review before claiming a complete curated pack.

Allowed generated/runtime patterns are intentionally narrow:

- `.memory-bank/dd-flow/manifest.json`;
- `.memory-bank/dd-flow/.generated/**`, if a future tool creates deterministic generated files;
- no `.tasks/**` files inside `.memory-bank/dd-flow/`.

## Manifest And Archive Contracts

The project flow pack manifest must validate against `dd-flow/project-flow-pack-manifest@2` for new installs/upgrades. New `@2` writes include `canon_root`, `canon_memory_bank_root`, `canon_flow_root`, source commit, canon version and flow contract. Old `@2` sources with a redundant `canon_repo_root` are read only when it equals `canon_root`; new producers do not emit that extra field. `dd-flow/project-flow-pack-manifest@1` and obsolete included delivery paths remain readable for safe upgrade, not permission to execute a new local delivery flow. Current curated producers enforce the canonical-only exclusions in addition to the historical manifest shape.

Archived obsolete flow files must be accompanied by an archive manifest validating against `dd-flow/archived-flow-manifest@1`. Archive manifests explain what moved, why it moved, whether manual review is required, and which canonical or project-local replacement should be used.

## Upgrade Rule

`mb-upgrade` no longer copies canonical `dd-flow/` wholesale into projects. It refreshes the curated project flow pack and preserves/archives obsolete content through the reviewed inventory and path map. It does not silently discard unknown local work.
