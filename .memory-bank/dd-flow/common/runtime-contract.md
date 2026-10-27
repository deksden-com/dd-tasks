---
file: '.memory-bank/dd-flow/common/runtime-contract.md'
description: 'Canonical SPC-004/005/006 runtime, stage context, session, report and PLAN contract.'
purpose: 'Single source for active dd-flow prompts and schemas after the breaking SPC-004 cutover.'
version: '0.4.4'
date: '2026-10-26'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_specs:
  - .memory-bank/spec/engineering/SPC-004-flow-runtime-observability-workspaces-and-lint-throughput.md
  - .memory-bank/spec/engineering/SPC-005-single-source-plan-and-fast-plan-stage.md
  - .memory-bank/spec/engineering/SPC-006-stage-bootstrap-and-context-packet.md
  - .memory-bank/spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md
  - .memory-bank/spec/engineering/SPC-010-agent-owned-verification-and-safe-hitl.md
  - .memory-bank/spec/engineering/SPC-011-planned-verification-materialization.md
  - .memory-bank/protocol/PRT-341-spc-004-v2-spc-005-canonical-cutover.md
related_protocols:
  - .memory-bank/protocol/PRT-012-spc-004-v2-spc-005-runtime-cutover.md
  - .memory-bank/protocol/PRT-003-spc-005-targeted-files-validation.md
tags: [dd-flow, spc-004, spc-005, runtime-contract, stages, reports, workspaces, plan]
history:
  - version: '0.4.4'
    date: '2026-10-26'
    changes: 'Managed result submission uses retained assignment binding; native retirement remains separate.'
  - version: '0.4.3'
    date: '2026-10-07'
    changes: 'Scoped frozen flow-contract@6 metadata and legacy prompt envelopes away from active vNext runtime authority.'
  - version: '0.4.2'
    date: '2026-10-07'
    changes: 'Grounded schema ownership, SPECIFY-first allocation, returned stage-specific contracts, logical/native binding and selected-file lint; generic memory-flow remains target work.'
  - version: '0.4.0'
    date: '2026-08-27'
    changes: 'PLAN start now reports and materializes both partially filled semantic drafts with exact validation commands.'
---

# Canonical runtime contract

This document is the active Memory Bank contract for SPC-004 v0.2, SPC-005,
SPC-006, SPC-009, SPC-010 and SPC-011.
The source specifications are
`.memory-bank/spec/engineering/SPC-004-flow-runtime-observability-workspaces-and-lint-throughput.md`;
`.memory-bank/spec/engineering/SPC-005-single-source-plan-and-fast-plan-stage.md`.
The canonical follow-up protocol is
`.memory-bank/protocol/PRT-341-spc-004-v2-spc-005-canonical-cutover.md`.

## Ownership

`dd-memorybank` owns semantic contracts, prompts, templates, illustrative
examples and navigation. `dd-flow-cli` owns executable runtime schemas and
validators as well as runtime implementation. Canonical schema mirrors must
not become a second independently edited executable authority: runtime uses
the schemas of its bound engine; copied examples are checked at the CLI owner.
`dd-eval` owns accepted cases, checkpoint identities and Judge qualification.
`mb-lint` owns selected-files scanner/progress implementation under
PRT-003. Canonical files describe companion behavior but do not implement
either companion tool.

## Frozen compatibility metadata

The retained `flow-contract.json` / `dd-flow/flow-contract@6` is read by the
legacy contract loader and validated against fixed @6 constants. It is not the
active vNext stage descriptor. Its `run.current_state`, old stage paths and
eight-section envelope describe the retained compatibility generation; they
must not be interpreted as authority to write runtime state, skip PROTOCOLIZE
or substitute a legacy packet for a returned vNext packet.

Active vNext mechanics belong to CLI: its seven-stage catalog, registered
stage-specific handlers/results, SQLite state and bound engine schemas. The
@6 loader derives its legacy protocol transition adapter in CLI; it does not
derive the vNext graph from these metadata fields. Do not rewrite frozen @6
constants or invent @7 to repair prose: the current loader rejects versions
above 6. SPC-014 E3 introduces the registered generic descriptor separately;
E5 owns scoped legacy-wrapper/pack retirement after installed acceptance.
This is a bounded migration responsibility, not a second permanent authority.

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

For explicitly formalized new SDLC work, the first worker flow command is the
bootstrap form. Ordinary task discussion does not infer this trigger:

```bash
dd-flow stage start --bootstrap --stage specify --project-root <root> \
  --subject <label> --intake-file <path> --json
```

SPECIFY bootstrap allocates RUN/root Work and the initial stage scaffold, not
a PRT/PSET. PROTOCOLIZE owns durable delivery identities after accepted SPECIFY.
Use the exact Controller/adapter command and prepared raw-intake path, preserving
its non-default runtime prefix. Standalone `prime.md` is read-only orientation,
not a prerequisite or runtime registration step for a stage worker.

For the supported legacy generated-envelope route, `stage start` resolves
project, protocol, RUN and workspace, checks containment,
archives an existing stage root into the next numeric `try-NNN` directory,
creates the clean current root, runs exact-target permission probes, records
CLI-owned Git/time facts, binds the harness session and generates one context
packet. `stage-prompt.json` is its structured source; the saved
`stage-prompt.md` and `worker_prompt_markdown` response are the same rendering.
The response facts are authoritative for the attempt and the worker does not
repeat CLI discovery, help, Git, compatibility, permission or runtime checks.

The returned completion contract is authoritative for the selected Stage and
engine. Active vNext handlers use their stage-specific result/outcome schemas;
material questions use `stage pause`/`stage resume` and infrastructure failures
use `stage block`/`stage unblock`. Do not turn those into terminal stage finish.

The legacy generated envelope path, when explicitly selected by its supported
runtime, writes only semantic completion data to the generated
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

PLAN start materializes both current semantic drafts before returning control:
the protocol-owned `plan.json` and the RUN-owned `aspect-map.json`. It reports
them as `materialized` and `partially_filled`, names every CLI-owned field and
provides exact validation commands. Active vNext PLAN uses `protocol-plan@6`
with a single `checks[]` catalog and `check_refs`; runtime schema lookup names
the CLI-owned `vnext-protocol-plan`, not its legacy `protocol-plan@1` file.
The CLI fills identity, accepted source
references and the aspect-catalog identifiers; the agent fills semantic plan,
applicability, rationale and grouping. Missing draft semantics are never
treated as accepted defaults, and the agent edits the materialized files in
place rather than inventing a parallel input contract.

The PLAN prompt chooses `local_compact` for tiny work and prefers
`single_wave_grouped` for compatible independent multi-aspect read-only work.
`orchestrator_local` means only initial ownership. Capacity changes packing,
not semantic dependencies. `aspect-map.json` remains the sole semantic
coverage artifact.

## Legacy generated stage prompt

For the supported legacy envelope, `stage-prompt.md` is generated from the
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

These eight sections are not a mandatory wrapper around active vNext packets.
Read the entire stage-specific returned packet and follow its typed completion
contract. Do not reconstruct an envelope, issue legacy transitions or infer
extra stages from the compatibility metadata.

The legacy renderer uses a closed stage-to-fragment allowlist. It physically excludes
instructions for other stages: a SPECIFY prompt cannot contain CODE/readiness,
merge or full-only PLAN instructions. The CLI fragment contains exact stage
commands; agents do not begin by probing global help. The file-boundary
fragment states that new artifacts belong in `@stage` and that `@stage/try-NNN`
is read-only archive history.

## Generated artifacts and summary

For the generated report contract, a completed stage finish produces:

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

The CLI supports `@project`, `@workspace` and `@run` in declared path options
with a bound root. Other symbolic locations in this document are conceptual,
not accepted CLI path aliases. Resolve them from the packet's physical paths.
Normalization and containment checks reject traversal, symlink escape and
unavailable roots. File-writing tools always receive physical paths.

Permission checks target only known stage files/directories and perform the
required read/stat or create/write/rename/delete probe. Memory Bank validation
runs after writes and only for the changed-file delta. An empty delta returns
`not_applicable_no_changed_docs`; a full `mb-lint` run is an explicit
project/release gate, not a repeated preflight.

## Sessions and usage

Use the selected harness's supported observing hook/adapter in its managed
scope; for Codex the hook home is the active `CODEX_HOME`, not project root.
Native observation records physical Session/tool evidence. Logical RUN/Work
binding is admitted by CLI only after successful registration; the hook does
not validate model payload files, assign logical lifecycle or issue retries.
Provider-specific before/after observations must not be reduced to a generic
one-hook convention. Observation is participation, not successful completion.
The CLI never accepts a model-authored Session id.

The CLI never guesses a model session id. Hooks/controller adapters provide the
authoritative launch binding. Managed finish validates the retained assignment
and current WorkSession, not a new live tool event. Manual/native commands retain
their explicit authority path. Follow the selected engine's issued packet; do
not manufacture a native receipt or bypass a historical engine's guard.
Coverage is one of `complete`, `partial` or `unavailable`, with
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

Stage workers do not prepend standalone lint to bootstrap or repeat checks from
their returned packet. The generated legacy finish handler does run selected-file
mb-lint for changed Memory Bank documents; vNext uses its declared checks and
accepted receipt contracts. Full lint is a distinct project/release gate.
The mb-lint CLI always writes bounded,
throttled progress and heartbeat to `stderr`; `stdout` contains only the final
selected result. This applies to text and JSON modes. The scanner owns bounded
async I/O with internal default `32`, deterministic sorting and batched async
Git subprocesses. This repository specifies that boundary and its fixtures;
PRT-002 implements it.

## Generic memory-flow target boundary

SPC-014 E1 defines CLI-owned descriptors, execution settings, bootstrap receipts
and frozen bundles. Current CLI stage catalog remains the seven-stage SDLC
catalog. Hybrid mb-init/mb-upgrade wrappers and generic handlers activate only
with E3/E4 installed cutover; this document does not make future commands usable.
Frozen engine binding does not bypass operation-specific storage admission.
Semantic result acceptance, physical Session settlement, final obligation coverage
and independent EVAL Judge verdict remain different evidence boundaries.
Technical retirement does not revoke an accepted result; follow the
[accepted-result and resource-conflict rules](lifecycle-guards.md#accepted-results-and-technical-retirement).

## Breaking-contract rule

Do not add a compatibility reader, migration fallback, manual trace format,
report-choice flag, current-try path convention, raw-Git workspace fallback or
model-authored mechanical telemetry. Historical protocol evidence may retain
old paths as history, but active prompts, schemas, templates and examples must
use this contract.
