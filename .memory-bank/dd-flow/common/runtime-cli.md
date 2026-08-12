---
file: '.memory-bank/dd-flow/common/runtime-cli.md'
description: 'SPC-004/005/006 mechanical CLI contract for project, RUN, PLAN and merge.'
purpose: 'Keep prompts semantic and let the CLI own runtime facts and transitions.'
version: '1.2.0'
date: '2026-08-12'
status: 'DRAFT'
c4_level: 'runtime'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - runtime-contract.md
  - flow-runs.md
  - entity-ids.md
  - lifecycle-guards.md
  - ../../spec/engineering/SPC-006-stage-bootstrap-and-context-packet.md
  - ../schemas/protocol-plan.schema.json
tags: [dd-flow, cli, runtime, stages, spc-004, spc-005, plan]
---

# Runtime CLI

The CLI is the mechanical control layer. Prompts decide user intent, scope,
acceptance and quality; the CLI owns identities, paths, timestamps, duration,
Git facts, session binding, usage, validation, rendering and runtime state.
For a practical task, `stage start` is the first worker flow command; standalone
priming is only for a session without a selected task.

## Preflight

The controller/CLI performs version, compatibility, containment and exact
target checks inside `stage start`/`stage finish`. The normal agent path does
not call global help, status, a separate permission command or a full lint
before semantic work. `project_root` remains the stable repository identity;
`workspace_path` is the concrete feature checkout. Incompatible versions or a
missing flow-pack manifest fail closed or are returned as an explicit degraded
state.

## RUN allocation and lookup

`stage start --bootstrap` allocates a RUN for the normal worker path. The
standalone command below is controller/operator plumbing and is not an agent
preflight step:

```bash
dd-flow run start \
  --project-root <stable-project-root> \
  --workspace-root <feature-worktree> \
  --flow-kind mb_sdlc \
  --subject-type protocol \
  --subject-id <PRT-ID> \
  --slug <slug> \
  --json
```

Use `run status` for operator inspection or repair. A stage worker receives
run home, aliases and artifact paths in its start receipt; it never guesses
paths from a slug or reconstructs them from a disposable task folder.

The current state is `run.json`; the event history is `timeline.jsonl`. The
CLI must not create or read a second current state file.

## Stage commands

The only public worker lifecycle is:

```bash
dd-flow stage start <RUN> --stage <stage> --json
dd-flow stage finish <RUN> --stage <stage> --outcome <outcome> --json
```

For a new ordinary task, use the bootstrap form instead of separately calling
protocol registration, RUN allocation, status, version or permissions commands:

```bash
dd-flow stage start --bootstrap --stage specify --project-root <root> \
  --subject <label> --intake-file <path> --json
```

The start response contains resolved context, typed aliases, current stage
root, archive path (when applicable), attempt number, generated prompt path,
schema/template identity, authoritative Git/compatibility/permission/session
results, a bounded required-context list, exact next command and the rendered
`worker_prompt_markdown`. The saved `stage-prompt.md` is the identical audit
projection. It also performs bounded permission probes and creates the
CLI-owned lifecycle event. A worker trusts this receipt and does not call help,
status, version, a separate permissions command or prompt render.

The agent writes `@stage/stage-input.json`; it contains only semantic fields
such as result, acceptance,
changed files, checks, evidence, findings, DEF outcomes and next action. The
CLI reads and validates that file, derives mechanical fields and then
atomically validates, renders, transitions and seals the attempt. Timestamps,
duration, paths, hashes, Git status, session ids, usage totals, attempt paths,
report selectors and transition payloads are invalid model input. A semantic
correction after finish creates a new attempt; the worker never edits accepted
stage artifacts.

## Protocol and plan state

Protocol files remain the durable semantic owner. Inspection/repair tools may
expose explicit transition commands to operators, but a normal stage worker
does not call them: `stage finish --outcome` validates and performs its allowed
transition atomically.

Operator commands include:

```bash
dd-flow protocol status <PRT-ID> --project-root <stable-project-root> --json
dd-flow protocol transition <PRT-ID> --to <stage> --payload-file <payload> --json
dd-flow plan item start <PRT-ID> <ITEM-ID> --project-root <stable-project-root> --json
dd-flow plan item done <PRT-ID> <ITEM-ID> --project-root <stable-project-root> \
  --summary <text> --evidence <path> --json
```

The semantic source for plan commands is always
`.memory-bank/protocol/<PRT-ID>/plan.json`; they update only runtime progress
in SQLite and the `run.json`/timeline projections. `dd-flow plan set`, runtime
plan copies and SQLite `plan_json` are removed. Completing a stage does not
silently advance protocol state. The orchestrator must verify predecessor
evidence and issue an explicit transition. A mismatch between protocol, RUN,
plan revision/SHA and stage evidence fails closed.

For PLAN start/finish, the CLI additionally returns and validates:

```text
@plan       .memory-bank/protocol/<PRT-ID>/plan.json
@aspect-map <RUN-home>/02-plan/aspect-map.json
```

`stage finish --stage plan` returns all structural and semantic plan errors in
one response, writes no accepted state on failure, computes plan/aspect hashes,
records progress/workers, runs `mb-lint --files ... --format json` only for a
non-empty Memory Bank delta, and generates JSON/Markdown/HTML/summary receipts.

## Sessions and usage

Install/register one idempotent observing `PreToolUse` binding in each active
`CODEX_HOME`; never install it in a project root. The hook/controller adapter
supplies the actual session id, and a model-provided id is not authoritative.
Repeated hook events are idempotent, unrelated commands are ignored, and
`PostToolUse` pairing is not part of the contract. A session switching between
RUNs uses timestamped non-overlapping segments rather than overwriting one
binding. At finish, compare expected and observed workers and write
`complete`, `partial` or `unavailable` coverage with missing ids/jobs.

Usage values are nullable. Cache-read and cache-write input tokens are separate;
subsets are not added twice; missing values are `null`, not zero. The CLI uses
fresh validated provider JSONL session records, assigns usage by timestamp
segment and distinguishes cache read/write. Timing is derived from CLI
timestamps and has an explicit measured/unavailable status.

## Validation and aliases

Known aliases are `@project`, `@workspace`, `@run`, `@stage`, `@protocol` and
`@intake`. Each alias is typed, normalized and checked for containment before
use. Traversal, symlink escape, wrong-root use and archive writes fail closed.

Permission probes are exact-target probes. Memory Bank validation occurs after
writes and receives the changed-file/link delta. A full `mb-lint` invocation is
an explicit verification gate and must keep progress on `stderr` and result
`stdout` parseable.

## Worktrunk

Workspace creation uses the official pinned Worktrunk artifact and its semantic
JSON command:

```bash
wt switch --create <branch> --base <base> --format json
```

The CLI verifies artifact identity/checksum and atomically activates it. It
does not present raw Git, random PATH, package-manager or unverified-latest
fallbacks. Worktrunk chooses paths and invokes hooks; the project owns
`.worktreeinclude`, `.config/wt.toml` and allowlisted bootstrap.

## Merge handoff

After readiness, the implementation session only hands off:

```bash
dd-flow protocol ready-for-merge <PRT-ID> --project-root <stable-project-root> --json
```

It does not claim the merge lane, complete a merge job or clean a feature
worktree. Those actions belong to a registered merge session/worker after the
protocol is ready. The merge session must produce its own generated stage
artifacts and explicit post-merge evidence.
