---
file: '.memory-bank/dd-flow/common/runtime-contract.md'
description: 'Canonical SPC-004/005/006 runtime, stage context, session, report and PLAN contract.'
purpose: 'Single source for active dd-flow prompts and schemas after the breaking SPC-004 cutover.'
version: '0.3.0'
date: '2026-08-12'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_specs:
  - .memory-bank/spec/engineering/SPC-004-flow-runtime-observability-workspaces-and-lint-throughput.md
  - .memory-bank/spec/engineering/SPC-005-single-source-plan-and-fast-plan-stage.md
  - .memory-bank/spec/engineering/SPC-006-stage-bootstrap-and-context-packet.md
  - .memory-bank/protocol/PRT-341-spc-004-v2-spc-005-canonical-cutover.md
related_protocols:
  - .memory-bank/protocol/PRT-012-spc-004-v2-spc-005-runtime-cutover.md
  - .memory-bank/protocol/PRT-003-spc-005-targeted-files-validation.md
tags: [dd-flow, spc-004, spc-005, runtime-contract, stages, reports, workspaces, plan]
---

# Canonical SPC-004/005/006 runtime contract

This document is the active Memory Bank contract for SPC-004 v0.2, SPC-005 and
SPC-006.
The source specifications are
`.memory-bank/spec/engineering/SPC-004-flow-runtime-observability-workspaces-and-lint-throughput.md`;
`.memory-bank/spec/engineering/SPC-005-single-source-plan-and-fast-plan-stage.md`.
The canonical follow-up protocol is
`.memory-bank/protocol/PRT-341-spc-004-v2-spc-005-canonical-cutover.md`.

## Ownership

`dd-memorybank` owns this contract, prompts, schemas, templates, examples, eval
fixtures and navigation. `dd-flow-cli` owns runtime implementation under
PRT-012. `mb-lint` owns selected-files scanner/progress implementation under
PRT-003. Canonical files describe companion behavior but do not implement
either companion tool.

## One current state

- SQLite is authoritative for mechanical runtime state. `run.json` is the only
  current portable JSON projection.
- `timeline.jsonl` is always enabled, append-only and CLI-owned.
- Timeline entries contain safe structured lifecycle facts only: timestamp,
  event, run, optional stage/attempt/session/job/status and redacted payload.
- Full prompts, transcripts, raw tool output, secrets and token payloads never
  enter timeline or dashboards.
- The router owns immutable `engine-binding.json` beside each RUN. It is not a
  second state projection: it records the checksum-verified executor snapshot
  and takes priority over project/upgrade compatibility for commands bound to
  that RUN. Legacy recovery requires a successful old-engine `run status`
  probe before the sidecar is written.
- The active contract has no second current locator, index alias or reader
  fallback; SQLite never owns semantic documents.

The RUN artifact home is resolved by the CLI from RUN context. Prompts must not
reconstruct it from a guessed project-local path.

## Two-command stage lifecycle

The normal worker path is exactly:

```bash
dd-flow stage start <RUN> --stage <stage> --json
# semantic work in @stage
dd-flow stage finish <RUN> --stage <stage> --json
```

For a new practical task, the first worker flow command is the bootstrap form:

```bash
dd-flow stage start --bootstrap --stage specify --project-root <root> \
  --subject <label> --intake-file <path> --json
```

The CLI allocates protocol/RUN and materializes their minimum scaffold. A UI
Goal, when the harness requires one, is the only allowed action before this
command. Standalone `prime.md` remains a no-task orientation flow, not a
prerequisite for a stage worker.

`stage start` resolves project, protocol, RUN and workspace, checks containment,
archives an existing stage root into the next numeric `try-NNN` directory,
creates the clean current root, runs exact-target permission probes, records
CLI-owned Git/time facts, binds the harness session and generates one context
packet. `stage-prompt.json` is its structured source; the saved
`stage-prompt.md` and `worker_prompt_markdown` response are the same rendering.
The response facts are authoritative for the attempt and the worker does not
repeat CLI discovery, help, Git, compatibility, permission or runtime checks.

The agent writes only semantic completion data to the generated
`@stage/stage-input.json`; the file is validated against
`dd-flow/stage-finish-input@1`. `stage finish` reads that file and accepts
semantic agent output only; its `status` is `done`, `waiting_for_user`,
`blocked` or `failed`. The CLI adds finish time,
duration, Git state, session/usage coverage and artifact paths; validates the
completion contract; rejects writes under `@stage/try-NNN`; validates changed
Memory Bank delta; renders all required artifacts; updates `run.json`,
`timeline.jsonl` and the protocol summary; performs the allowed validated
protocol transition; seals accepted artifacts; and returns one structured
receipt. The agent does not provide timestamps, hashes, duration, Git facts,
session ids, usage totals, report-choice flags or transition payloads.

The current attempt always writes directly to `@stage`. `try-NNN` is archive
history only and is never a current output target or a model-selected attempt.

`dd-flow run override <RUN> --status cancelled|failed --reason <text> --json`
is an audited operator recovery only. Normal workers never use `run complete`
or an override command.

## Canonical PLAN and runtime progress

The only semantic plan is the protocol-owned file:

```text
.memory-bank/protocol/<PRT-ID>/plan.json
```

It is validated by `schemas/protocol-plan.schema.json` and accepted by
revision/SHA. It owns semantic task definitions, route, execution context and
verification contracts. It never owns mutable status, worker/session rows,
timestamps or actual evidence.

Runtime progress is stored in SQLite and projected to `run.json.plan_progress`;
worker state is stored in SQLite and projected to `run.json.workers`. Timeline
events record item lifecycle. There is no runtime `protocols/<PRT>/plan.json`,
SQLite semantic `plan_json`, `aspect-job-map.json`, `aspect-graph.json` or
`dd-flow plan set` lifecycle step.

The PLAN prompt chooses `local_compact` for tiny work and prefers
`single_wave_grouped` for compatible independent multi-aspect read-only work.
`orchestrator_local` means only initial ownership. Capacity changes packing,
not semantic dependencies. `aspect-map.json` remains the sole semantic
coverage artifact.

## Generated stage prompt

`stage-prompt.md` is the only required stage prompt. It is generated from the
same `stage-prompt.json` returned by start and contains exactly these sections,
in this order:

```text
<stage_identity>...</stage_identity>
<authoritative_runtime_facts>...</authoritative_runtime_facts>
<preflight>...</preflight>
<task_intake>...</task_intake>
<applicable_instructions>...</applicable_instructions>
<required_context>...</required_context>
<work_contract>...</work_contract>
<completion_contract>...</completion_contract>
```

The renderer uses a closed stage-to-fragment allowlist. It physically excludes
instructions for other stages: a SPECIFY prompt cannot contain CODE/readiness,
merge or full-only PLAN instructions. The CLI fragment contains exact stage
commands; agents do not begin by probing global help. The file-boundary
fragment states that new artifacts belong in `@stage` and that `@stage/try-NNN`
is read-only archive history.

## Generated artifacts and summary

Every successful stage finish always produces:

- `stage-report.json` — schema-valid structured data;
- `stage-report.md` — deterministic human-readable render;
- `stage-report.html` — deterministic standalone render from the canonical
  template with safely escaped embedded JSON;
- generated `summary.md`, containing semantic scope, decisions,
  acceptance, blockers/DEF, plan/gates, links and next action.

There is no report-format selector, observability detail selector or timeline
hide switch in the active contract. The agent does not hand-author a report,
HTML, summary or replacement trace as a parallel lifecycle record.

The protocol summary excludes raw intake, hashes, session payloads, commands,
timing/token telemetry, runtime errors and timeline contents. Runtime artifacts
remain in the RUN home; durable meaning remains in Memory Bank truth layers.

## Intake, aliases and validation

Raw request/questions/answers live under the RUN intake area. Memory Bank
receives only durable requirements, decisions, constraints, acceptance,
risks/DEF and links.

The CLI may expose typed aliases `@project`, `@workspace`, `@run`, `@stage`,
`@protocol`, `@plan`, `@aspect-map` and `@intake`. It must normalize and
containment-check every alias,
reject traversal/symlink escape and reject an alias used for the wrong kind of
path.

Permission checks target only known stage files/directories and perform the
required read/stat or create/write/rename/delete probe. Memory Bank validation
runs after writes and only for the changed-file delta. An empty delta returns
`not_applicable_no_changed_docs`; a full `mb-lint` run is an explicit
project/release gate, not a repeated preflight.

## Sessions and usage

Install one idempotent observing `PreToolUse` hook in each active `CODEX_HOME`.
The project root is not the hook installation scope. The hook binds the
trusted orchestrator/worker session to a RUN or job and supports non-overlapping
time-scoped segments when one session moves between RUNs. It does not pair
with `PostToolUse`; an observed command is participation, not a successful
outcome. The CLI owns lifecycle completion and never accepts a model-authored
session id.

The CLI never guesses a model session id. Hooks/controller adapters provide the
authoritative binding. Expected orchestrator and worker sessions are compared
at finish and coverage is one of `complete`, `partial` or `unavailable`, with
missing ids/jobs listed honestly. An unrelated Bash command is a no-op and a
repeated hook event is idempotent.

Usage fields remain nullable. `cache_read_input_tokens` and
`cache_write_input_tokens` are distinct; cache-read is part of input, reasoning
output is part of output, and unknown values are `null`, never a fabricated
zero. Validated provider JSONL records are located by the CLI, selected by
timestamp segment and never summed twice. Cache reads and writes remain
distinct; unavailable usage is not zero.

## Workspaces

The semantic workspace command delegates worktree creation to the official
pinned Worktrunk executable:

```bash
wt switch --create <branch> --base <base> --format json
```

The CLI consumes its JSON result and returns the absolute workspace path,
branch/base, tool version, bootstrap status and next action. It does not
implement a second worktree manager, raw-Git fallback, random PATH lookup,
package-manager install, latest resolution or an unverified tool fallback.

Project hooks own allowlisted ignored-file copy and bootstrap. The canonical
project contract is `.worktreeinclude` plus `.config/wt.toml`; secrets without
an allowlist are never copied. `dd-memorybank` may declare ordinary
documentation worktrees `bootstrap_not_required` with a concrete reason.

## mb-lint boundary

`mb-lint` is not part of stage start or finish. Its CLI always writes bounded,
throttled progress and heartbeat to `stderr`; `stdout` contains only the final
selected result. This applies to text and JSON modes. The scanner owns bounded
async I/O with internal default `32`, deterministic sorting and batched async
Git subprocesses. This repository specifies that boundary and its fixtures;
PRT-002 implements it.

## Breaking-contract rule

Do not add a compatibility reader, migration fallback, manual trace format,
report-choice flag, current-try path convention, raw-Git workspace fallback or
model-authored mechanical telemetry. Historical protocol evidence may retain
old paths as history, but active prompts, schemas, templates and examples must
use this contract.
