---
file: '.memory-bank/dd-flow/common/subagents.md'
description: 'Canonical proportional routing and worker lifecycle contract for SPC-005.'
purpose: 'Choose local, grouped or focused coverage from semantic triggers and keep runtime worker state single-sourced.'
version: '2.0.0'
date: '2026-08-10'
status: 'DRAFT'
c4_level: 'runtime'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - worker-session.md
  - ../mb-sdlc/plan-aspects/index.md
  - ../schemas/protocol-plan.schema.json
tags: [dd-flow, subagents, routing, workers, spc-005]
---

# Subagent routing

This file owns routing and worker lifecycle. `worker-session.md` owns the
packet vocabulary; `mb-sdlc/plan-aspects/index.md` owns aspect applicability
and compatibility preferences. Runtime state belongs to the CLI's SQLite
source and its `run.json`/timeline projections.

## Initial state and routes

Every applicable unit starts with `route_state: initial` and
`orchestrator_local`. This is ownership before routing, not a default
recommendation or a completed self-check.

The semantic plan selects one of these execution routes:

| Route | Meaning | Capacity |
| --- | --- | --- |
| `local_compact` | one tiny/short-scope unit stays with the orchestrator | no probe |
| `single_wave_grouped` | compatible independent read-only units share one wave | one bounded probe only when worthwhile |
| `multi_wave_grouped` | grouped units require the minimum number of waves | bounded packing |
| `focused_subagent` | a mandatory independent boundary gets one worker | focused capacity |

Worker packets use `self_check`, `grouped_subagent` or `focused_subagent` as
their concrete coverage mode. No route is inferred from plan size, number of
aspects or available slots alone.

## Routing algorithm

1. Read bounded intake, specification and aspect catalog; do not perform deep
   review before choosing the route.
2. Mark applicable units and consumers. For a single substantive unit, use
   `local_compact`.
3. Add a hard edge only if the successor names an accepted predecessor output
   and the exact data consumed. Related topics, common inputs and preferred
   order are not edges.
4. Separate a dedicated independent trust/security verdict, a mutation or
   write-conflict boundary, an incompatible snapshot and a real hard
   dependency.
5. Promote remaining independent read-only units only when the parallel-speed
   benefit is positive. Group at most three compatible units and preserve one
   verdict/evidence section per unit.
6. Use reliable current free slots. If they are unknown and the work is
   substantive, run one bounded capacity probe before final packing. Tiny
   local work never probes.
7. Pack the eligible units into one wave when capacity allows; otherwise use
   the minimum batches/waves. Capacity cannot alter applicability, semantics,
   dependencies or separation.
8. Accept each unit independently. Retry only a rejected unit; accepted
   siblings remain accepted.

## Coverage artifact

The RUN-local `02-plan/aspect-map.json` is the only semantic coverage map. It
contains every catalog unit and records applicability, route, promotion reason,
worker/report reference where real, accepted findings, verdict, deferrals and
evidence. A graph view is derived at read time from the plan dependencies,
aspect map and current runtime workers; it is not another authored artifact.

The map is written before delegation, updated after local or delegated review,
and accepted only when every required applicable unit has a verdict. A
not-applicable unit requires a durable reason. Unknown applicability or missing
required output is blocked or a precise DEF, never silently omitted.

## Worker packet and launch

Create a packet, rendered prompt and report only for an actual delegated job.
The packet must include:

```yaml
role:
session_kind: llm_worker
session_mode: fresh_empty_session_required | recovery_continuation
common_prompt: .memory-bank/dd-flow/common/worker-session.md
worker_prompt: .memory-bank/dd-flow/workers/<code|docs|verify|repair>.md
aspect_prompt: <one leaf aspect prompt>
read: []
write: []
write_report_to:
handoff:
  acceptance_owner:
  predecessor_reports: []
routing:
  route: self_check | grouped_subagent | focused_subagent
  coverage_unit_ids: []
  job_id:
  group_id:
  wave_id:
  batch_id:
  requires_output_of: []
constraints: []
checks: []
```

The renderer validates the selected plan item's execution context and emits a
launch prompt plus runtime-owned packet/report paths. It does not launch a
worker or infer scope. A grouped packet uses one wrapper and one explicit leaf
section per unit. A focused packet uses exactly one leaf.

Register the job and trusted session before launch. Runtime updates job status
and timeline; the worker returns semantic findings only. Do not ask the worker
for timestamps, hashes, Git facts, usage or session identity.

## Dependencies and recovery

Before launch, validate selected hard predecessors and cycles. A predecessor
may be the accepted local row in the aspect map or an accepted delegated report;
the successor packet names the path and consumed data. After a grouped result,
accept every unit separately. If one unit is incomplete, preserve accepted
siblings and create one recovery attempt for the affected unit only. A second
recovery is not allowed; unresolved work becomes a blocker/DEF with the exact
next gate.

## Capacity and degraded behavior

Zero capacity returns opportunistic units to local compact work. A required
independent unit that cannot run is blocked or explicitly degraded; do not
pretend a local check is an independent worker verdict. Unknown capacity is
reported as unknown, never fabricated as one slot. Probe cost and availability
are runtime evidence, not model-authored fields.

## Acceptance

The orchestrator verifies route choice, packet completeness, report status,
coverage rows, consumed predecessor outputs and runtime worker/session facts.
The semantic plan and aspect map remain the authoring surfaces; all mechanical
progress and lifecycle receipts are CLI-generated projections.
