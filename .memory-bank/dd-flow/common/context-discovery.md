---
file: '.memory-bank/dd-flow/common/context-discovery.md'
description: 'Pre-protocol context discovery contract for task-specific grounding before protocol creation or specification.'
purpose: 'Read when the user discusses a concrete change but the current session lacks enough project context to create a good protocol/specification.'
version: '0.1.0'
date: '2026-06-20'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - ../protocol.md
  - specification.md
  - flow-runs.md
  - ../../mbb/spec-layer-guide.md
source_only_references:
  - '$DD_MEMORYBANK/.memory-bank/dd-flow/mb-init/targets/05-operations.md'
  - '$DD_MEMORYBANK/.memory-bank/dd-flow/mb-upgrade/targets/06-spec-operations.md'
  - '$DD_MEMORYBANK/.memory-bank/dd-flow/mb-audit/aspects/09-operations-release-deferrals.md'
tags: [dd-flow, context-discovery, protocol, specification, scope]
history:
  - version: '0.1.0'
    date: '2026-06-20'
    changes: 'Introduced context discovery as a pre-protocol/pre-specify grounding contour and explicitly separated it from executable SDLC protocols.'
---

# Context Discovery

`context_discovery` is a short, task-specific grounding contour before protocol creation or before deep `specify`.

It exists for the gap between general session priming and a concrete SDLC task:

```text
session priming -> user discusses a change -> context_discovery if needed -> protocol/specification
```

It is not a protocol, not a spike protocol, not a merge-queued task and not an SDLC implementation unit. It does not receive a `PRT-*` id and it does not create a ready-for-merge artifact by itself.

## When To Run

Run context discovery when the user has named a concrete change area, but the agent cannot yet responsibly create a protocol or ask focused problem-space questions.

Common triggers:

- the request references a subsystem, workflow, prompt, CLI command, dashboard, schema or policy the current session has not recently read;
- the user asks for a new protocol/specification, but the agent only has high-level priming context;
- the likely scope may be larger than one executable protocol and the agent needs facts before proposing slicing;
- the task mentions prior similar work, existing behavior, historical decisions or cross-project contracts;
- the change touches runtime state, queues, locks, stage transitions, dashboards, Memory Bank layout, release/deploy policy, AI prompt/runtime behavior or verification gates;
- the agent would otherwise ask broad "what exists?" questions that can be answered from Memory Bank, code, protocols, ADR, docs or prior specs.

Do not run it only for ceremony. If the task is local and the necessary context is already fresh, go directly to `protocol.md`/`specify`.

## Sources

Prefer sources in this order:

1. Memory Bank indexes and relevant layer docs.
2. Existing specs, scenarios, ADR, protocols and stage reports.
3. Project code, tests, scripts, schemas and generated examples.
4. Git history when chronology or previous implementation decisions matter.
5. External documentation or internet search only when external facts are part of the task and may have changed.

Subagents may help with read-only discovery. Their task is to collect facts, analogies and gaps. They do not design the solution, allocate protocol slices or decide the route for the user.

## Artifacts

Context discovery may write transient artifacts under `<run-home>` when a run already exists or the implementation has an appropriate scratch run:

```text
<run-home>/00-context-discovery/
  context-brief.md
  sources.md
  gaps.md
```

For large scopes that require several executable protocols, keep durable discovery summaries near an owner-approved durable spec or link them from the future protocol set. A feature research shelf is conditional and is not activated in the current dd-tasks Memory Bank; do not create it from this example alone:

```text
.memory-bank/spec/system/<topic-id>/research/context-brief.md
.memory-bank/protocol/_set/PSET-XXX-<slug>-context-brief.md
```

The durable `context-brief.md` is a curated summary, not raw scratch evidence. It should link to sources and explain why the discovered facts matter for the upcoming protocols.

## Context Brief

`context-brief.md` should include:

- user request anchor or source intake path;
- sources read and why they were relevant;
- existing behavior and relevant prior decisions;
- related features/protocols/specs/scenarios/ADR;
- constraints and invariants that must survive the change;
- suspected scope shape and whether one protocol is likely enough;
- unresolved unknowns that cannot be discovered locally;
- user-level questions, only when they affect problem space.

Avoid solution-space questions such as asking the user to choose internal slicing, implementation order, worker topology or file layout. The agent should propose those after discovery and let the user correct the proposal if it conflicts with intent.

## Exit

After context discovery, choose one of:

- create/update one executable `PRT-*` and enter `specify`;
- create/update a `PSET-*` with executable member protocols; update durable specs/features/ADR/scenarios only where discovery found project knowledge that must persist;
- ask numbered problem-space questions because local discovery cannot answer them;
- stop with a blocker if a required source, permission or external condition is unavailable.

Do not create a fake "research protocol" only because context was needed. Research is part of preparing the task, not an SDLC delivery unit.
