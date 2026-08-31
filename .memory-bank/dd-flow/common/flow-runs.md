---
file: '.memory-bank/dd-flow/common/flow-runs.md'
description: 'vNext RUN, Work, Session and filesystem materialization contract.'
purpose: 'Read before implementing or operating a vNext flow stage.'
version: '2.0.0'
date: '2026-08-27'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'README.md'
related_files:
  - ../../spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md
  - runtime-contract.md
  - runtime-cli.md
  - ../schemas/flow-run.schema.json
tags: [dd-flow, run, work, session, materialization, vnext]
---

# Flow runs

`RUN-*` is one materialized invocation of a flow. SQLite owns current mechanical
state. `run.json` is its compact portable projection and `timeline.jsonl` is
append-only history. A RUN has exactly one root `Work`; completion requires that
root and every descendant Work to be terminal at a legal flow exit.

`Stage` is a static instruction node, not a running object. The flow graph lists
legal forward transitions. A runtime stage visit is internal engine state;
`run.json` exposes derived `active_stages` and `next_actions`, never one global
`current_stage`. A question, blocker or correction pauses and resumes the same
stage. It does not create a backward transition or a second attempt.

## Filesystem

```text
<DD_FLOW_HOME>/projects/<PRJ>/runs/<RUN>/
  run.json
  engine-binding.json
  timeline.jsonl
  intake/
    discussion.md
    questions.jsonl
    answers.jsonl
  01-specify/
  02-protocolize/
  03-plan/
  04-plan-review/
  05-code/
  06-code-review/
  07-merge/
  works/<WRK>/
    context.json
    prompt.md
    result.json
    checks/RCP-001/{receipt.json,stdout.log,stderr.log,artifacts/}
```

Stage-owned semantic artifacts stay in the stage root. Work belongs to the RUN,
not to a stage, and gets `works/<WRK>/` only when it owns a prompt/result packet.
The root coordinator does not receive an empty duplicate directory.

The first execution writes directly to the current stage/Work root. Only an
explicit retry archives the failed material under adjacent
`attempts/ATT-NNN/`. Agents always write to the current root; an attempt archive
is read-only history. Pause/resume is not a retry.

## Work and Session

`Work` is an engine-managed unit with one parent, zero or more hard
`depends_on` edges, state, task, optional result schema and optional Session
links. A parent cannot finish while a child is active. Dependencies stay inside
one RUN and cycles fail closed. `informs` remains semantic context and does not
block scheduling.

`Session` is provider context. It has its own parent Session and may execute
several Works sequentially. Work and Session hierarchies are separate tables;
their link is explicit. Provider session and agent ids are opaque. There is no
public Agent-Turn entity or user-supplied session id.

`planned_write_areas` are optional, soft coordination hints. They let the
scheduler serialize two *currently running* Works likely to touch the same
area; they never make PLAN invalid and never restrict a worker's necessary
project-local edit. A hard `depends_on` remains the only execution dependency.
The engine reports both dependency blockers and temporary coordination
collisions with the currently ready Work commands.

## Lifecycle commands

`stage start` is the first standalone command of a stage. Its response is the
complete trusted stage packet: paths, project facts, exact schemas, exact finish
or pause commands, and the next legal directive. Agents do not rediscover CLI
help or deterministic facts.

Every delegated Work starts in its assigned Session with standalone
`work start`; the hook binds the observed Session and agent. It finishes through
`work finish`, which validates the result and runs declared Work checks. A
failed check leaves the Work running and returns the retained `RCP-*` evidence.

Stage and Work finish may return `action_required` with one bounded repair
instruction. The same finish command is retried after that repair; already
accepted work is not repeated. HITL pause returns the exact resume command,
including a non-default `DD_FLOW_HOME`, and the same stage consumes the answer.

## Identifiers and references

- `WRK-*` allocation is global in one `DD_FLOW_HOME`, matching its database key.
- Requirements and acceptance criteria are local `R-*` and `AC-*` ids.
- Plan item ids remain the existing `P1`, `P2`, … contract.
- Check declarations are local `CHK-*` ids.
- Review findings are local `FIND-NNN` inside one reviewer Work; the canonical
  reference is `<WRK>/FIND-NNN`.
- Check receipts are local `RCP-NNN`; the canonical reference is
  `<WRK>/RCP-NNN` or `<RUN>/RCP-NNN` for an aggregate gate.

Persist RUN artifacts as `run://<RUN>/<relative-path>`. Persist project files as
repository-relative POSIX paths. Absolute paths are immediate prompt data only.
Resolution uses filesystem identity and containment. Case-insensitive global
search is forbidden; an unresolved spelling returns the canonical suggestion.

## Reports, checks and usage

Stage JSON is the report source. One generic renderer always writes
`stage-report.md` and standalone `stage-report.html`; the report contains its
own concise `summary`. There is no RUN-local `summary.md`, trace Markdown,
run-index, work.json, worker/JOB projection or variables sidecar.

PLAN declares checks as `CHK-*`; the engine executes them and retains `RCP-*`
receipts with logs and requested artifacts. Reports cite actual receipts rather
than model claims.

Usage is reconciled from all linked Sessions after they settle. It records
provider/model/source/timestamps, input, cache-read, cache-write, uncached,
reasoning, output and tool calls. Intermediate totals are explicitly
provisional; final totals are computed on demand from trusted checkpoints.

## Snapshots and cleanup

Eval restore rewrites known database columns and structured JSON/JSONL fields;
it never performs a repository-wide text replacement. Future prompts are
generated from restored state. Checkout cleanup acts only on engine-owned
records, verifies real paths and repository membership, rejects project roots
and outside paths, and preserves dirty trees unless explicit force policy
allows removal.

The full rationale and cutover acceptance matrix live in
[SPC-009](../../spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md).
