---
file: '.memory-bank/dd-flow/common/flow-runs.md'
description: 'Common Flow Run contract for concrete dd-flow launches, stage workspaces and stage report chains.'
purpose: 'Read before starting any practical dd-flow, Memory Bank flow or experiment run.'
version: '0.4.0'
date: '2026-06-28'
status: 'DRAFT'
c4_level: 'documentation'
parent: 'README.md'
related_files:
  - entity-ids.md
  - runtime-cli.md
  - style.md
  - workspace-layout.md
  - ../schemas/flow-run-index.schema.json
tags: [dd-flow, run, runtime, stage-report, workspace]
history:
  - version: '0.1.0'
    date: '2026-06-11'
    changes: 'Introduced RUN-* as the common execution envelope for flow launches.'
  - version: '0.2.0'
    date: '2026-06-17'
    changes: 'Added strict stage report template discipline so agents reuse canonical HTML templates and schema data instead of inventing reports.'
  - version: '0.3.0'
    date: '2026-06-28'
    changes: 'Moved primary RUN artifact home to project-scoped dd-flow home; project .tasks is legacy/projection/manual scratch only.'
  - version: '0.4.0'
    date: '2026-08-07'
    changes: 'Separated runtime snapshot from compact index projection and linked flow-flag revisions, checksums and typed session coverage.'
---

# Flow Runs

`RUN-*` is the execution envelope for one concrete `dd-flow` launch.

It answers:

```text
What was run, for which subject, through which stages, and where are the artifacts?
```

It does not replace semantic entities:

| Entity | Meaning |
| --- | --- |
| `RUN-*` | Concrete execution of a flow. |
| `PRT-*` | Semantic protocol/task subject. |
| `EXP-*` | Experiment definition or subject. |
| `DEF-*` | Durable deferred issue or decision. |
| `session_id` | Technical agent/CLI session. |
| stage run | One stage execution inside a run. |

Durable meaning stays in `protocol/`, `spec/`, `adr/`, `scenarios/`, `evidence/`, `DEF-*` and other Memory Bank truth layers. A run index may summarize what happened, but it must link back to the semantic owner instead of becoming a second protocol.

## Runtime And Report State

New runs keep mechanical runtime and human-facing run artifacts together under project-scoped dd-flow home:

```text
~/.dd-flow/projects/<PRJ-ID-slug>/runs/<RUN-ID-slug>/
  run.json
  run-index.json
  timeline.jsonl
```

`workspace_root` / `workspace_path` remains the concrete checkout where the agent edits files and runs commands. It is not the primary artifact root.

Legacy runs may still have human-facing artifacts under:

```text
<workspace>/.tasks/dd-flow-runs/<RUN-ID-slug>/
```

The CLI must keep old `.tasks/dd-flow-runs/...` records readable through their stored `run_index_path`, but new runs should write `run.json`, `run-index.json`, stage reports, task packets, logs, payloads and raw evidence under `<run-home>`.

Neither `.tasks` nor `<run-home>` is itself durable project truth. Durable meaning stays in Memory Bank documents and curated evidence/passport artifacts.

## Common Layout

Every run has:

```text
~/.dd-flow/projects/<PRJ-ID-slug>/runs/<RUN-ID-slug>/
  run.json
  run-index.json
  run-summary.md

  NN-stage-slug/
    stage-report.json
    report.md
    stage-report.html
    evidence/
    logs/
    screenshots/
```

Rules:

- stage directories use `NN-stage-slug/`, where `NN` is local to the run;
- `run-index.json` is the compact navigation/index contract; it carries current state and timing summaries, not an ever-growing event history;
- `timeline.jsonl` is an append-only local mechanical event stream for run/stage/session lifecycle timing;
- `run.json` is the authoritative machine/runtime snapshot for continuation, hooks, flag resolution and diagnostics. It is not a byte-for-byte copy of the index;
- `stage-report.json` is the canonical data payload for a stage;
- old names such as `plan-stage-report.json` or flow-specific names such as `review-data.json` may exist only as compatibility aliases;
- important acceptance evidence must be promoted to verification passports or curated protocol evidence.

## CLI Happy Path

When `dd-flow` CLI supports run commands, prompts should let the CLI allocate and update runs:

```bash
dd-flow run start \
  --project-root "<project-root>" \
  --workspace-root "<workspace-root>" \
  --flow-kind mb_sdlc \
  --subject-type protocol \
  --subject-id "<PRT-ID>" \
  --slug "<slug>" \
  --json

dd-flow run attach-stage "<RUN-ID-or-RUN-short-id>" \
  --project-root "<project-root>" \
  --stage plan \
  --dir 02-plan \
  --status running \
  --json

dd-flow run complete-stage "<RUN-ID-or-RUN-short-id>" \
  --project-root "<project-root>" \
  --stage plan \
  --status done \
  --data 02-plan/stage-report.json \
  --stage-report 02-plan/stage-report.html \
  --report 02-plan/report.md \
  --json
```

For legacy runs created before specification stage support, keep `01-plan/02-code/03-merge` and record `legacy_stage_layout: true`.

Use short aliases such as `RUN-001` only for commands. Persist full ids such as `RUN-001-flow-run-contract` in files, reports and JSON.

If CLI support is unavailable, prompts may create `run-index.json` manually as a degraded transition path. They must record `runtime_cli_degraded` in the stage report and final navigation block.

Use `<run-home>` in prompt instructions for current runs. Use `.tasks/dd-flow-runs` only when reading legacy runs, optional project projections or explicit migration examples.

`RUN-*` records concrete execution evidence. It does not automatically move the lifecycle of the linked `PRT-*`. After a stage is completed, prompts must verify protocol state explicitly and run `dd-flow protocol transition ...` when the lifecycle should advance. If a completed run and protocol state disagree, use `dd-flow protocol sync-from-run ... --target auto` only as an explicit repair path with evidence.

## Timing And Session Usage

Lifecycle mutations create timestamps automatically. New runs use `started_at` and `timing_status: measured`; legacy records without these facts remain readable as `legacy_incomplete`. A stage attempt records its own `started_at`, terminal `completed_at` and `try-###` identifier.

When a registered Codex session supplies a local `transcript_path`, the CLI may create versioned `codex_transcript_v1` usage snapshots at run/stage/session checkpoints. The source is cumulative, so reports calculate deltas from the run-session baseline. `run usage` refreshes idempotently and must expose unavailable states instead of a false zero. Counter resets are stale-source diagnostics, not zero-cost work.

Transcript counters can be emitted after the lifecycle command that changes a stage. A delta crossing such a boundary is displayed as `cross_stage_turn` with `indeterminate` confidence, not silently assigned to either stage. Run/session totals can remain measured while stage attribution is incomplete. No prompt, response, raw transcript event, secret or tool output is promoted into run artifacts or dashboard data.

Flow flags are resolved once at RUN start and kept in the runtime snapshot:

```yaml
flow_flags:
  snapshot_revision: 1
  snapshot_checksum: <sha256>
  values:
    report.html:
      value: false
      source: { kind: preset, ref: normal }
      rationale: optional HTML is not required for the selected route
```

`run-index.json` projects only the current revision/checksum and the values
needed for navigation. A later escalation updates `run.json`, appends a
`flow_flags_revised` timeline event and refreshes the index through a guarded
revision; stages never silently fall back to `task_profile`.

## Flow-Specific Stage Layouts

MB-SDLC flow:

```text
01-specify/
02-plan/
03-code/
04-merge/
```

New ordinary protocol runs use `flow_kind: mb_sdlc`. Legacy runs with `flow_kind: coding` remain valid and must be treated as old MB-SDLC runs.

`specify`, `plan`, `code` and real `merge` jobs are stage-report-enabled. `plan` links to `01-specify/stage-report.html`; `code` links to `02-plan/stage-report.html`; real `merge` jobs link to previous stage reports.

When a stage is rerun, keep the same canonical stage folder and archive previous contents under `try-###`:

```text
02-plan/
  try-001/
  stage-report.json
  stage-report.html
  report.md
```

The current attempt always writes to the stage root; old attempts are for evidence and debugging.

When substantive raw user input exists, `specify` may create:

```text
01-specify/knowledge-extraction/
  candidates.json
  candidates.md
  conflicts.md
  questions.md
  target-map.md
  extraction-report.md
```

When a real merge job closes a protocol, it should create:

```text
04-merge/knowledge-promotion/
  promotion-report.json
  promotion-report.md
  applied-writes.md
  rejected-candidates.md
  deferred-defs.md
```

If no substantive raw user input exists, `user-input.md` and `knowledge-extraction/` are not created only for ceremony. Reports record `raw_intake: not_applicable`.

Legacy coding run layout remains valid for runs created before specification-stage support:

```text
01-plan/
02-code/
03-merge/
```

When a legacy run is continued, prompts must not renumber existing folders. They should record `legacy_stage_layout: true` in reports and keep breadcrumbs consistent with `run-index.json`.

Status-only merge entrypoints do not create merge stage reports (`04-merge/stage-report.*` in new layout, `03-merge/stage-report.*` in legacy layout):

- `merge.md` when an active worker/lock/claim is found or no job is ready;
- `merge-start.md` when it only reports an existing worker;
- `merge-stop.md` when it only stops/reports worker lifecycle.

In those cases user-facing reports must say `stage_report: N/A - status-only; no merge job ran`.

Delivery flows:

| Flow | Typical stage folders |
| --- | --- |
| `release.md` | `01-preflight/`, `02-release-set/`, `03-fixation/`, `04-report/` |
| `deploy.md` | `01-preflight/`, `02-deploy/`, `03-verify/`, `04-report/` |
| `publish.md` | `01-preflight/`, `02-release-and-package/`, `03-publish/`, `04-readback/`, `05-report/` |

These layouts are prompt guidance. A delivery flow must create or continue a `RUN-*`, keep evidence under run-home, and link durable decisions back to Memory Bank policy, runbooks, protocols or DEFs.

Delivery flow final report stages are stage-report-enabled when the project has the matching contracts:

- `release.md`: `dd-flow/release-stage-report@1`, template `.memory-bank/dd-flow/stage-reports/release-stage-report-template.html`, embedded script id `release-data`;
- `deploy.md`: `dd-flow/deploy-stage-report@1`, template `.memory-bank/dd-flow/stage-reports/deploy-stage-report-template.html`, embedded script id `deploy-data`;
- `publish.md`: `dd-flow/publish-stage-report@1`, template `.memory-bank/dd-flow/stage-reports/publish-stage-report-template.html`, embedded script id `publish-data`.

Delivery reports record evidence from operations that actually ran. They do not convert source merge into release/deploy/publish completion and they do not make `dd-flow` a universal external deploy executor.

Memory Bank flows:

| Flow | Stage folders |
| --- | --- |
| `mb-init` | `01-preflight/`, `02-discovery/`, `03-synthesis/`, `04-write/`, `05-lint/` |
| `mb-upgrade` | `01-preflight/`, `02-diff-analysis/`, `03-upgrade/`, `04-lint/`, `05-review/`, `06-merge/` |
| `mb-audit` | `01-preflight-read/`, `02-audit/`, `03-report/` |
| `mb-fix` | `01-intake/`, `02-fix/`, `03-verification/`, `04-report/` |
| `mb-distill` | `01-intake/`, `02-aspect-research/`, `03-synthesis/`, `04-report/` |

Experiment launches:

```text
01-prepare/
02-plan/
03-code/
04-merge/
05-review/
06-cleanup/
```

`EXP-*` remains the experiment subject. `RUN-*` records one concrete launch.

## Stage Report Chain

Stage-report-enabled stages must embed the same JSON that is stored in `stage-report.json`, prove equality, and avoid raw JSON/debug dumps in the visible UI.

Stage report HTML is generated output, not a design surface. The visual shell must come from the installed canonical template for the stage:

| Stage | Data schema | Template | Embedded JSON script id |
| --- | --- | --- | --- |
| `specify` | `.memory-bank/dd-flow/schemas/specification-stage-report.schema.json` / `dd-flow/specification-stage-report@1` | `.memory-bank/dd-flow/mb-sdlc/specify/stage-report-template.html` | `specification-data` |
| `plan` | `.memory-bank/dd-flow/schemas/plan-stage-report.schema.json` / `dd-flow/plan-stage-report@2` (legacy `@1` readable) | `.memory-bank/dd-flow/mb-sdlc/plan/stage-report-template.html` | `plan-data` |
| `code` | `.memory-bank/dd-flow/schemas/code-stage-report.schema.json` / `dd-flow/code-stage-report@2` (legacy `@1` readable) | `.memory-bank/dd-flow/mb-sdlc/code/stage-report-template.html` | `code-data` |
| `merge` | `.memory-bank/dd-flow/schemas/merge-stage-report.schema.json` / `dd-flow/merge-stage-report@2` (legacy `@1` readable) | `.memory-bank/dd-flow/mb-sdlc/merge/stage-report-template.html` | `merge-data` |
| `release` | `.memory-bank/dd-flow/schemas/release-stage-report.schema.json` / `dd-flow/release-stage-report@1` | `.memory-bank/dd-flow/stage-reports/release-stage-report-template.html` | `release-data` |
| `deploy` | `.memory-bank/dd-flow/schemas/deploy-stage-report.schema.json` / `dd-flow/deploy-stage-report@1` | `.memory-bank/dd-flow/stage-reports/deploy-stage-report-template.html` | `deploy-data` |
| `publish` | `.memory-bank/dd-flow/schemas/publish-stage-report.schema.json` / `dd-flow/publish-stage-report@1` | `.memory-bank/dd-flow/stage-reports/publish-stage-report-template.html` | `publish-data` |

Knowledge support artifacts:

| Artifact | Schema |
| --- | --- |
| `01-specify/knowledge-extraction/candidates.json` | `.memory-bank/dd-flow/schemas/knowledge-candidates.schema.json` / `dd-flow/knowledge-candidates@1` |
| `04-merge/knowledge-promotion/promotion-report.json` | `.memory-bank/dd-flow/schemas/knowledge-promotion-report.schema.json` / `dd-flow/knowledge-promotion-report@1` |

Generation order:

1. Create `stage-report.json` from stage facts.
2. Validate it against the stage schema when `dd-flow schema validate` is available.
3. Read the stage template from the project flow pack.
4. Replace only the JSON payload inside the expected `<script id="...">` block, preserving the template structure, CSS, JavaScript, DOM ids and render functions.
5. Prove that embedded JSON is semantically equal to standalone `stage-report.json`.
6. Run browser/DOM smoke for visible text and JavaScript errors, or record an explicit degraded reason.

Do not create a fresh HTML document when a template exists. Do not summarize the report into a small custom page. Do not change the template's visual structure during a run. If the template is missing, unreadable, lacks the expected script id, fails to render, or cannot embed the validated JSON, the stage report is `blocked` or `degraded_stage_report_template`, not ready. The final user report must say that the data report exists but the HTML stage report was not valid.

Minimum structural smoke for generated HTML:

- the expected script id exists and contains parseable JSON with the expected `schema_id`;
- the generated HTML contains the stage title in `target_language`, such as `Фаза Plan`, `Фаза Code`, or `Фаза Merge` for Russian runs;
- required template anchors/render functions for the stage still exist;
- no visible raw JSON dump or debug-only block is used as the main UI.

Common stage report metadata:

- `run_id`;
- `flow_kind`;
- `subject`;
- `project`;
- `stage`;
- `stage_dir`;
- `breadcrumbs`;
- `verdict`;
- `next_action`;
- links to `run-index.json` and `run-summary.md`;
- optional `links.global_dashboard`, `links.project_dashboard`, `links.protocol_page`, `links.previous_stage_report`, `links.next_stage_report` when the dashboard section is available.

## Pre-Protocol Discovery Artifacts

`00-context-discovery/` is reserved for optional pre-protocol or pre-specify grounding artifacts:

```text
<run-home>/00-context-discovery/
  context-brief.md
  sources.md
  gaps.md
```

This folder is not a normal coding stage and does not replace `01-specify/`. It is used only when the agent needs task-specific context before creating a protocol or before asking focused specification questions.

Do not create a `PRT-*` only to run discovery. If discovered knowledge must persist before protocols exist, promote a curated brief to an owner-approved destination. A feature research shelf is conditional and is not activated in the current dd-tasks Memory Bank; do not create it from this example alone:

```text
.memory-bank/spec/system/<topic-id>/research/context-brief.md
.memory-bank/protocol/_set/PSET-XXX-<slug>-context-brief.md
```

Breadcrumbs come from `run-index.json`. They should link to previous stage reports when those reports exist. Dashboard/backlink targets must be data fields, not ad hoc JS path guesses; missing targets render as degraded/disabled links with a reason.

Stage report visible text follows `common/style.md`: use the user's target language for content, while JSON keys and template internals may remain English.

## Lightweight Runs

Short/direct work still gets a run, but does not need ceremony:

- one `RUN-*`;
- one stage folder;
- no HTML stage report unless the flow or user needs one;
- concise `run-summary.md`;
- important findings still become durable `DEF-*`, scenario updates or evidence passports when needed.
