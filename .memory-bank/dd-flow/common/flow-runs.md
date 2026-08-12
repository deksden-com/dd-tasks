---
file: '.memory-bank/dd-flow/common/flow-runs.md'
description: 'SPC-004 RUN state, timeline, generated stages and archive contract.'
purpose: 'Read before any practical dd-flow stage.'
version: '1.1.0'
date: '2026-08-12'
status: 'DRAFT'
c4_level: 'documentation'
parent: 'README.md'
related_files:
  - runtime-contract.md
  - runtime-cli.md
  - ../schemas/flow-run.schema.json
  - ../schemas/stage-prompt.schema.json
tags: [dd-flow, run, stage, timeline, spc-004]
---

# Flow runs

`RUN-*` is the mechanical execution envelope for one concrete flow. It links
runtime facts to a semantic `PRT-*`, `EXP-*` or other subject; it never replaces
that durable owner.

## Canonical home

New runs use the project-scoped dd-flow home:

```text
~/.dd-flow/projects/<PRJ-ID-slug>/runs/<RUN-ID-slug>/
  run.json
  timeline.jsonl
  01-specify/
  02-plan/
  03-code/
  04-merge/
```

SQLite is authoritative for mechanical runtime state. `run.json` is the sole
current portable JSON projection: it stores protocol/project identity, stage
status, lifecycle timestamps, attempt links, plan progress, workers,
session/usage coverage, workspace aliases and generated artifact links. It does
not duplicate semantic plan documents, full prompts, reports or event history.

`timeline.jsonl` is an always-on append-only stream written by the CLI. Each
event contains a timestamp, event name, run id and only safe structured fields
such as stage, attempt, session, job and status. Secrets, transcripts, full
tool output and token payloads are forbidden.

There is no second current locator payload. A locator database, if used by the CLI,
is rebuildable and cannot become a second payload authority.

## Stage layout

Each active stage has one current root and optional archived attempts:

```text
<run-home>/02-plan/
  stage-prompt.md
  stage-input.json
  stage-report.json
  stage-report.md
  stage-report.html
  aspect-map.json             # PLAN semantic coverage only
  workers/<JOB-ID>/*           # only for an actual delegated job
  try-001/
  evidence/
```

The exact numeric directory is resolved from the RUN. `@stage` means the
current stage root. `@stage/try-NNN` is archive-only, read-only and never a
write target.

## Stage lifecycle

The public worker lifecycle has exactly two stage actions:

```bash
dd-flow stage start <RUN> --stage <stage> --json
dd-flow stage finish <RUN> --stage <stage> --outcome <outcome> --json
```

For a new ordinary task, its first flow command is bootstrap start:

```bash
dd-flow stage start --bootstrap --stage specify --project-root <root> \
  --subject <label> --intake-file <path> --json
```

Start resolves all context in one response, atomically archives existing stage
contents into the next `try-NNN`, creates the current root, performs exact
target probes, binds the harness session and generates the eight-section
prompt. The response returns `worker_prompt_markdown`; the saved
`stage-prompt.md` is its identical audit projection from `stage-prompt.json`.
The receipt also contains the authoritative Git/compatibility/permission/session
facts, aliases and bounded sources to read. The worker does not redo them.

Finish receives bounded semantic input. The CLI derives timestamps, duration,
Git facts, session/usage coverage, changed-file delta, artifact paths and
protocol transition from the validated outcome. It validates the semantic
contract, renders the JSON, Markdown, HTML and summary outputs and seals the
accepted attempt. A finish cannot accept an archive path, model-authored
mechanical facts or a hand-authored transition payload.

## PLAN state and artifacts

The only semantic plan is the protocol-owned file
`.memory-bank/protocol/<PRT-ID>/plan.json`, validated by
`../schemas/protocol-plan.schema.json`. Runtime progress and workers are
mechanical SQLite state projected into `run.json.plan_progress` and
`run.json.workers`; `timeline.jsonl` records lifecycle events. PLAN start
returns `@plan` and `@aspect-map`, and PLAN finish validates all errors before
accepting revision/SHA and generating receipts.

`aspect-map.json` is the only semantic coverage artifact. Do not create runtime
plan copies, `plan set`, `aspect-job-map.json`, `aspect-graph.json`,
`subagent-decision.md`, `phase-summary.md`, manual trace files or a parallel
PLAN report. The route is `local_compact` for tiny work and
`single_wave_grouped` for compatible independent multi-aspect work; capacity
changes only packing.

## Stage prompt sections

Every generated stage prompt contains, in order:

1. `<stage_identity>`;
2. `<authoritative_runtime_facts>`;
3. `<preflight>`;
4. `<task_intake>`;
5. `<applicable_instructions>`;
6. `<required_context>`;
7. `<work_contract>`;
8. `<completion_contract>`.

The prompt is assembled from the installed project flow pack and runtime facts.
Canonical prose remains project-owned; the CLI does not hardcode it.

## Generated reports

Successful finish always produces schema-valid `stage-report.json`, a
deterministic `stage-report.md`, a deterministic standalone `stage-report.html`
and a generated protocol `summary.md`. The renderer owns escaping, including
safe embedding of JSON in HTML. There are no format or observability switches.

The summary is curated durable meaning: goal, scope, decisions, acceptance,
gates, blockers/DEF, links, current RUN and next action. It excludes raw
intake, commands, hashes, session payloads, timing/token telemetry, errors and
timeline contents.

## Retry and validation rules

Start archives a non-empty current root before creating a clean root. Finish
rejects writes under `try-NNN`. Aliases are normalized, typed and contained
within their declared roots; traversal and symlink escape fail closed.

Permission checks touch only known stage/Memory Bank targets. Memory Bank link
or lint validation runs after writes and only for the changed delta. A full
repository lint is an explicit final gate, not a repeated permission preflight.

For session/usage semantics and Worktrunk ownership, use
[runtime-contract.md](runtime-contract.md). For command response details, use
[runtime-cli.md](runtime-cli.md).
