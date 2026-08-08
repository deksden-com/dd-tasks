---
file: '.memory-bank/dd-flow/schemas/index.md'
description: 'Canonical JSON Schema contracts used by dd-flow prompts and dd-flow CLI.'
purpose: 'Read before adding or validating machine-readable flow artifacts.'
version: '1.11.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'documentation'
parent: 'README.md'
children:
  - flow-contract.schema.json
  - mb-upgrade-review-data.schema.json
  - mb-sdlc-review-report.schema.json
  - plan-stage-report.schema.json
  - flow-run-index.schema.json
  - flow-run-index-v3.schema.json
  - flow-run.schema.json
  - code-stage-report.schema.json
  - merge-stage-report.schema.json
  - release-stage-report.schema.json
  - deploy-stage-report.schema.json
  - publish-stage-report.schema.json
  - operational-access-preflight.schema.json
  - memorybank-permissions-preflight.schema.json
  - status-report.schema.json
  - compatibility.schema.json
  - engine-manifest.schema.json
  - version-report.schema.json
  - flow-guidance.schema.json
  - project-flow-pack-manifest.schema.json
  - archived-flow-manifest.schema.json
  - specification-stage-report.schema.json
  - project-check-profiles.schema.json
  - global-dashboard-data.schema.json
  - project-dashboard-data.schema.json
  - protocol-dashboard-data.schema.json
  - knowledge-candidates.schema.json
  - knowledge-promotion-report.schema.json
  - eval-report-data.schema.json
tags: [dd-flow, schemas, json-schema, validation]
history:
  - version: '1.11.0'
    date: '2026-08-08'
    changes: 'Added flow-contract@3 catalog validation and versioned PRT-338 assessment/routing/eval report writers while retaining legacy report readers.'
  - version: '1.10.0'
    date: '2026-07-10'
    changes: 'Added operational-access preflight contract and required authorized/not-required evidence for completed release, deploy, publish and merge reports.'
  - version: '1.10.2'
    date: '2026-08-07'
    changes: 'Added the separate flow-run@1 runtime snapshot contract linked to flow-run-index@3.'
  - version: '0.1.0'
    date: '2026-06-04'
    changes: 'Created canonical schema registry for flow data contracts.'
  - version: '0.2.0'
    date: '2026-06-04'
    changes: 'Added plan-stage-report schema for main mb-sdlc flow plan->code handoff.'
  - version: '0.3.0'
    date: '2026-06-09'
    changes: 'Added memorybank-permissions-preflight schema for OS-aware Memory Bank write gates.'
  - version: '0.4.0'
    date: '2026-06-11'
    changes: 'Added Flow Run index and code/merge stage report data schemas.'
  - version: '0.5.0'
    date: '2026-06-12'
    changes: 'Added project flow pack and archived flow manifest schemas for canonical/project-local origin separation.'
  - version: '0.6.0'
    date: '2026-06-14'
    changes: 'Documented canonical checkout schema lookup and merge stage report examples for one-shot and long-lived worker modes.'
  - version: '0.7.0'
    date: '2026-06-15'
    changes: 'Added optional SDLC contour data to plan/code/merge stage report contracts so reports can show Git/stage/release/deploy/publish/verification decisions.'
  - version: '0.8.0'
    date: '2026-06-15'
    changes: 'Added status-report schema and manifest v2 fields for canonical/project Memory Bank version visibility.'
  - version: '0.9.0'
    date: '2026-06-17'
    changes: 'Added specification stage report and project check profile contracts.'
  - version: '1.0.0'
    date: '2026-06-18'
    changes: 'Added dd-flow dashboard data schemas for global, project and protocol HTML pages.'
  - version: '1.1.0'
    date: '2026-06-18'
    changes: 'Added knowledge-candidates and knowledge-promotion-report contracts for specify-time extraction and merge-time Memory Bank promotion.'
  - version: '1.2.0'
    date: '2026-06-18'
    changes: 'Added optional review_gates to plan/code stage report contracts for architecture, contract, AI runtime and concurrency review visibility.'
  - version: '1.3.0'
    date: '2026-06-23'
    changes: 'Added eval-report-data contract for static HTML+JSON eval and experiment reports.'
  - version: '1.4.0'
    date: '2026-06-23'
    changes: 'Added flow-guidance contract for dd-flow CLI next-stage/prompt/guard/evidence hints.'
  - version: '1.5.0'
    date: '2026-06-26'
    changes: 'Added compatibility and version-report contracts for dd-flow CLI version preflight and Memory Bank release compatibility.'
  - version: '1.6.0'
    date: '2026-06-28'
    changes: 'Updated flow-run-index to @2 home-run layout and moved project/protocol dashboard examples to project-scoped dd-flow home.'
  - version: '1.10.1'
    date: '2026-08-07'
    changes: 'Added flow-run-index@3 with RUN-local flag snapshot links and typed session coverage projection.'
  - version: '1.10.3'
    date: '2026-08-07'
    changes: 'Added stage-report @2 projections for the current flow-flag snapshot while keeping @1 readable.'
  - version: '1.7.0'
    date: '2026-06-30'
    changes: 'Added mb-sdlc-review-report contract for project-level review JSON/HTML reports.'
  - version: '1.8.0'
    date: '2026-07-02'
    changes: 'Added engine-manifest contract for home-installed dd-flow engine snapshots used by the planned router/engine runtime.'
  - version: '1.9.0'
    date: '2026-07-07'
    changes: 'Added release/deploy/publish stage report contracts, examples and validation guidance.'
---

# dd-flow Schemas

This folder stores canonical machine-readable contracts used by `dd-flow` prompts and the `dd-flow` CLI.

Schemas live in the canon first. Project copies under `.memory-bank/dd-flow/schemas/` are deployment artifacts, and CLI bundled schemas are validation assets. Do not define semantic flow contracts only inside the CLI.

## Contracts

| Schema name | File | Schema id | Purpose |
| --- | --- | --- | --- |
| `flow-contract` | `flow-contract.schema.json` | `dd-flow/flow-contract@3` | Validates the complete canonical catalog structurally; the CLI then applies the same semantic normalizer used by runtime loading. |
| `mb-upgrade-review-data` | `mb-upgrade-review-data.schema.json` | `dd-flow/mb-upgrade-review-data@1` | Validates `review-data.json` produced by `mb-upgrade` stage `05-review`. |
| `mb-sdlc-review-report` | `mb-sdlc-review-report.schema.json` | `dd-flow/mb-sdlc-review-report@1` | Validates `stage-report.json` produced by project-level `mb-sdlc-review`. |
| `plan-stage-report` | `plan-stage-report.schema.json` | `dd-flow/plan-stage-report@3` / readable legacy `@1`, `@2` | Validates plan stage data; @3 adds assessment, routing and capacity summaries to the @2 RUN-local flow-flag projection. |
| `flow-run-index` | `flow-run-index.schema.json`, `flow-run-index-v3.schema.json` | `dd-flow/flow-run-index@3` / readable legacy `@1` and `@2` | Validates `<run-home>/run-index.json`; @3 adds revision/checksum, expanded flag projection and typed session coverage. |
| `flow-run` | `flow-run.schema.json` | `dd-flow/flow-run@1` | Validates authoritative `run.json` continuation state and its revision/checksum link to the index. |
| `code-stage-report` | `code-stage-report.schema.json` | `dd-flow/code-stage-report@2` / readable legacy `@1` | Validates `03-code/stage-report.json` or legacy `02-code/stage-report.json`; @2 carries the RUN-local flow-flag snapshot projection. |
| `merge-stage-report` | `merge-stage-report.schema.json` | `dd-flow/merge-stage-report@2` / readable legacy `@1` | Validates `04-merge/stage-report.json` or legacy `03-merge/stage-report.json`; @2 carries the RUN-local flow-flag snapshot projection. |
| `release-stage-report` | `release-stage-report.schema.json` | `dd-flow/release-stage-report@1` | Validates release flow reports that fix release set, version decision, artifacts and release readback evidence. |
| `deploy-stage-report` | `deploy-stage-report.schema.json` | `dd-flow/deploy-stage-report@1` | Validates deploy flow reports that prove runtime stage/provider/target, source artifact, deployment execution and post-deploy checks. |
| `publish-stage-report` | `publish-stage-report.schema.json` | `dd-flow/publish-stage-report@1` | Validates publish flow reports that combine release fixation, publication target, artifact execution, readback and consumer smoke. |
| `memorybank-permissions-preflight` | `memorybank-permissions-preflight.schema.json` | `dd-flow/memorybank-permissions-preflight@1` | Validates OS-aware Memory Bank permission preflight reports produced by `dd-flow memory permissions preflight`. |
| `status-report` | `status-report.schema.json` | `dd-flow/status-report@1` | Validates enriched `dd-flow status --json` output with CLI, canon, project Memory Bank, flow pack, flow-contract and drift diagnostics. |
| `compatibility` | `compatibility.schema.json` | `dd-flow/compatibility@1` | Validates `.memory-bank/dd-flow/compatibility.json`, the Memory Bank release to tool package, router/engine, storage, project summary, dashboard and migration policy compatibility map. |
| `mb-upgrade-migration-report` | `mb-upgrade-migration-report.schema.json` | `dd-flow/mb-upgrade-migration-report@1` | Validates `mb-upgrade` runtime/home migration planning and verification evidence: adjacent chain, backup, active-state handling and derived artifact regeneration plan. |
| `project-summary` | `project-summary.schema.json` | `dd-flow/project-summary@1` | Validates compact per-project summary data prepared by the project-compatible CLI for global dashboard consumption. |
| `engine-manifest` | `engine-manifest.schema.json` | `dd-flow/engine-manifest@1` | Validates `engine.json` for immutable dd-flow engine snapshots installed under `~/.dd-flow/engines/`. |
| `version-report` | `version-report.schema.json` | `dd-flow/version-report@1` | Validates `dd-flow version --json`, the small CLI package version report. |
| `flow-guidance` | `flow-guidance.schema.json` | `dd-flow/flow-guidance@1` | Validates reusable `flow_guidance` blocks emitted by status-like CLI commands to show current stage, normalized lifecycle, allowed transitions, recommended prompt/action, guards and missing evidence. |
| `project-flow-pack-manifest` | `project-flow-pack-manifest.schema.json` | `dd-flow/project-flow-pack-manifest@1` / `@2` | Validates `.memory-bank/dd-flow/manifest.json`, the curated project-local flow pack allowlist. New writes use `@2`; `@1` remains legacy-compatible. |
| `archived-flow-manifest` | `archived-flow-manifest.schema.json` | `dd-flow/archived-flow-manifest@1` | Validates archive manifests for obsolete/custom flow files moved out of active `.memory-bank/dd-flow/`. |
| `specification-stage-report` | `specification-stage-report.schema.json` | `dd-flow/specification-stage-report@2` / readable legacy `@1` | Validates `01-specify/stage-report.json`; @2 adds the factual task assessment and source-labelled legacy projection. |
| `project-check-profiles` | `project-check-profiles.schema.json` | `dd-flow/project-check-profiles@1` | Validates project check profiles that define what "green" means on local/dev/beta/prod or project-specific stages. |
| `global-dashboard-data` | `global-dashboard-data.schema.json` | `dd-flow/global-dashboard-data@1` | Validates `~/.dd-flow/dashboard/global-dashboard.json`, the local-machine project overview with lifecycle/resource summaries, project-summary version groups and unsupported project visibility. |
| `project-dashboard-data` | `project-dashboard-data.schema.json` | `dd-flow/project-dashboard-data@1` | Validates `~/.dd-flow/projects/<PRJ-ID>/dashboard/project-dashboard.json`, the project-level protocol/runtime overview with lifecycle/resource/queued-protocol fields. |
| `protocol-dashboard-data` | `protocol-dashboard-data.schema.json` | `dd-flow/protocol-dashboard-data@1` | Validates `~/.dd-flow/projects/<PRJ-ID>/dashboard/protocols/<PRT-ID>.json`, the protocol-as-task page with lifecycle, queue item, claim and multi-run history. |
| `knowledge-candidates` | `knowledge-candidates.schema.json` | `dd-flow/knowledge-candidates@1` | Validates specify-time knowledge candidate registers extracted from substantive raw user input. |
| `knowledge-promotion-report` | `knowledge-promotion-report.schema.json` | `dd-flow/knowledge-promotion-report@1` | Validates merge-time reports that resolve candidates and code-derived knowledge into durable Memory Bank outcomes. |
| `eval-report-data` | `eval-report-data.schema.json` | `dd-flow/eval-report-data@2` / readable legacy `@1` | Validates eval report data; @2 adds assessment, routing, capacity and clarification provenance. |

## Validation

Use:

```bash
dd-flow schema validate --schema mb-upgrade-review-data --file review-data.json --project-root /path/to/project --json
dd-flow schema validate --schema flow-contract --file .memory-bank/dd-flow/flow-contract.json --project-root /path/to/project --json
dd-flow schema validate --schema mb-sdlc-review-report --file ~/.dd-flow/projects/PRJ-001-demo/runs/RUN-020-review/04-review/stage-report.json --project-root /path/to/project --json
dd-flow schema validate --schema plan-stage-report --file plan-stage-report.json --project-root /path/to/project --json
dd-flow schema validate --schema flow-run-index --file ~/.dd-flow/projects/PRJ-001-demo/runs/RUN-001-demo/run-index.json --project-root /path/to/project --json
dd-flow schema validate --schema code-stage-report --file ~/.dd-flow/projects/PRJ-001-demo/runs/RUN-001-demo/03-code/stage-report.json --project-root /path/to/project --json
dd-flow schema validate --schema merge-stage-report --file ~/.dd-flow/projects/PRJ-001-demo/runs/RUN-001-demo/04-merge/stage-report.json --project-root /path/to/project --json
dd-flow schema validate --schema release-stage-report --file ~/.dd-flow/projects/PRJ-001-demo/runs/RUN-030-release/04-report/stage-report.json --project-root /path/to/project --json
dd-flow schema validate --schema deploy-stage-report --file ~/.dd-flow/projects/PRJ-001-demo/runs/RUN-031-deploy/04-report/stage-report.json --project-root /path/to/project --json
dd-flow schema validate --schema publish-stage-report --file ~/.dd-flow/projects/PRJ-001-demo/runs/RUN-032-publish/05-report/stage-report.json --project-root /path/to/project --json
dd-flow schema validate --schema memorybank-permissions-preflight --file memorybank-permissions-preflight.json --project-root /path/to/project --json
dd-flow schema validate --schema status-report --file status-report.json --project-root /path/to/project --json
dd-flow schema validate --schema compatibility --file .memory-bank/dd-flow/compatibility.json --project-root /path/to/project --json
dd-flow schema validate --schema mb-upgrade-migration-report --file ~/.dd-flow/projects/PRJ-001-demo/runs/RUN-001-demo/03-upgrade/migration-report.json --project-root /path/to/project --json
dd-flow schema validate --schema project-summary --file ~/.dd-flow/projects/PRJ-001-demo/summary/project-summary.json --project-root /path/to/project --json
dd-flow schema validate --schema engine-manifest --file ~/.dd-flow/engines/@deksden-com/dd-flow-cli/0.4.0/engine.json --project-root /path/to/project --json
dd-flow schema validate --schema version-report --file .memory-bank/dd-flow/schemas/examples/version-report.valid.json --project-root /path/to/project --json
dd-flow schema validate --schema flow-guidance --file .memory-bank/dd-flow/schemas/examples/flow-guidance.valid.json --project-root /path/to/project --json
dd-flow schema validate --schema project-flow-pack-manifest --file .memory-bank/dd-flow/manifest.json --project-root /path/to/project --json
dd-flow schema validate --schema archived-flow-manifest --file .memory-bank/archive/mb-upgrade-YYYY-MM-DD/old-dd-flow/archived-flow-manifest.json --project-root /path/to/project --json
dd-flow schema validate --schema specification-stage-report --file ~/.dd-flow/projects/PRJ-001-demo/runs/RUN-001-demo/01-specify/stage-report.json --project-root /path/to/project --json
dd-flow schema validate --schema project-check-profiles --file .memory-bank/operations/check-profiles.json --project-root /path/to/project --json
dd-flow schema validate --schema project-dashboard-data --file ~/.dd-flow/projects/PRJ-001-demo/dashboard/project-dashboard.json --project-root /path/to/project --json
dd-flow schema validate --schema protocol-dashboard-data --file ~/.dd-flow/projects/PRJ-001-demo/dashboard/protocols/PRT-001-demo.json --project-root /path/to/project --json
dd-flow schema validate --schema global-dashboard-data --file ~/.dd-flow/dashboard/global-dashboard.json --project-root /path/to/project --json
dd-flow schema validate --schema knowledge-candidates --file ~/.dd-flow/projects/PRJ-001-demo/runs/RUN-001-demo/01-specify/knowledge-extraction/candidates.json --project-root /path/to/project --json
dd-flow schema validate --schema knowledge-promotion-report --file ~/.dd-flow/projects/PRJ-001-demo/runs/RUN-001-demo/04-merge/knowledge-promotion/promotion-report.json --project-root /path/to/project --json
dd-flow schema validate --schema eval-report-data --file .memory-bank/dd-flow/schemas/examples/eval-report-data.valid.json --project-root /path/to/project --json
```

Lookup order:

1. `--schema-dir <path>`;
2. `<project-root>/.memory-bank/dd-flow/schemas/`;
3. `<project-root>/dd-flow/schemas/` when the command is run from a canonical checkout;
4. bundled canonical schemas included with `dd-flow-cli`.

## Examples

Validated examples live in `examples/` and should be kept current with schema changes:

- `plan-stage-report.valid.json`
- `flow-contract.valid.json` plus focused `invalid/flow-contract.*.json` fixtures
- `code-stage-report.valid.json`
- `merge-stage-report.one-shot.valid.json`
- `merge-stage-report.long-lived-worker.valid.json`
- `release-stage-report.valid.json`
- `deploy-stage-report.valid.json`
- `publish-stage-report.valid.json`
- `operational-access-preflight.valid.json`
- `mb-upgrade-review-data.valid.json`
- `mb-sdlc-review-report.valid.json`
- `status-report.valid.json`
- `engine-manifest.valid.json`
- `flow-guidance.valid.json`
- `project-flow-pack-manifest.valid.json`
- `specification-stage-report.valid.json`
- `project-check-profiles.valid.json`
- `compatibility.valid.json`
- `mb-upgrade-migration-report.valid.json`
- `project-summary.valid.json`
- `version-report.valid.json`
- `knowledge-candidates.valid.json`
- `knowledge-promotion-report.valid.json`
- `eval-report-data.valid.json`

The CLI may add semantic validation that JSON Schema cannot express cleanly, such as cross-reference checks between aspect ids and finding ids.

Invalid examples live under `examples/invalid/` and should fail validation. Release/deploy/publish invalid fixtures cover common overclaims: release completion without a version decision, deploy completion without target evidence, publish completion without target readback, and operational-access authorization despite an identity mismatch.

Plan, code and merge stage report schemas may include `sdlc_contours`. This block records applicability, verification state, closure state, gate status, stage/target, evidence and next action for Git, environment/stage, release, deploy/publish, verification and runbook decisions.

Specification stage report precedes plan for normal coding flows. Plan stage report may include `task_profile` and `route_decision` so code/readiness can see whether adaptive complexity was preserved.

Knowledge candidate registers are provisional: they preserve source quotes and target hints, but they are not durable Memory Bank truth until merge-time promotion resolves them. Knowledge promotion reports combine user-input candidates and code-derived knowledge, deduplicate already documented facts and record `DEF-*` for unresolved durable knowledge.

Plan and code stage reports may include `review_gates`. This block records gate-level visibility for architecture design/implementation quality, contract propagation, AI prompt/runtime quality and concurrency safety. It is report evidence, not a separate CLI state machine.

Eval report data is not a protocol lifecycle state. It is an assessment artifact used by scenarios, prompt/runtime reviews or experiments when deterministic pass/fail evidence is not enough.

Release/deploy/publish stage report contracts are delivery evidence contracts, not an external execution layer. They validate what the flow recorded under `RUN-*`; they do not imply that `dd-flow` knows how to execute every provider-specific release, deploy or publish command.

`dd-flow/operational-access-preflight@1` is a value-free safety result. It records exact binding resolution, safe readback, identity/authority/target/approval verdicts, freshness and forbidden-action evidence. It never stores credentials and never performs the protected mutation.

`mb-sdlc-review-report` is the source of truth for project-level review dashboards and final reports. It records focus, source map, aspect coverage, critic pass, accepted/rejected findings, conformance summary, review-fix recommendation, deferrals and dashboard links.

Flow guidance is a CLI support contract, not a semantic planner. Prompts use it as runtime evidence for the next safe flow step, but still inspect protocol files, stage reports and user intent before proceeding.
