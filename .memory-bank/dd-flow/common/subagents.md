---
file: '.memory-bank/dd-flow/common/subagents.md'
description: 'Canonical proportional routing and worker lifecycle contract for SPC-005.'
purpose: 'Choose local, grouped or focused coverage from semantic triggers and keep runtime worker state single-sourced.'
version: '2.1.0'
date: '2026-09-04'
status: 'DRAFT'
c4_level: 'runtime'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - worker-session.md
  - ../mb-sdlc/plan-aspects/index.md
  - ../schemas/protocol-plan.schema.json
tags: [dd-flow, subagents, routing, workers, spc-005]
history:
  - version: '2.1.0'
    date: '2026-09-04'
    changes: 'Moved capacity qualification outside flow and required productive jobs to use harness-native depth-one children with all-settled sibling handling.'
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
| `local_compact` | one tiny/short-scope unit stays with the orchestrator | no capacity required |
| `single_wave_grouped` | compatible independent read-only units share one wave | qualified profile capacity |
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
6. Use the qualified capacity supplied by controller/harness tooling for the
   selected profile. Qualification happens outside RUN and never creates Work.
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

## Capacity qualification and degraded behavior

Zero capacity returns opportunistic units to local compact work. A required
independent unit that cannot run is blocked or explicitly degraded; do not
pretend a local check is an independent worker verdict. Unknown capacity is
reported as unknown, never fabricated as one slot.

Capacity is qualified outside dd-flow by creating one technical harness root
and counting unique direct native child Session IDs that it successfully
starts. Later failure or cancellation does not subtract a started child; an
attempt without a child ID does not count. Qualification creates no Work,
invokes no `dd-flow`, reads no project files and uses the same native child
primitive, profile and workspace strategy as productive delegation. Its
detailed receipt stays in harness/eval evidence; flow receives only the
qualified integer used to bound batches.

Every productive delegated job is one native depth-one child of the current
Stage coordinator, never an independent root Session created by an external
runner. The child first executes its exact `work start` command, and the
lifecycle hook binds native child and parent identities. The child does not
create grandchildren. A launch refused before child identity leaves the Work
ready for a later batch; one failed child does not cancel or duplicate healthy
siblings.

Every delegated session is disposable unless its packet explicitly says it is
long-lived. After its report is accepted or it is terminally rejected, the
orchestrator closes/deletes that worker session when the harness permits before
starting a later wave. A finished worker must not silently consume a slot and
invalidate the capacity observation used to schedule the remaining work.

## Acceptance

The orchestrator verifies route choice, packet completeness, report status,
coverage rows, consumed predecessor outputs and runtime worker/session facts.
The semantic plan and aspect map remain the authoring surfaces; all mechanical
progress and lifecycle receipts are CLI-generated projections.

Before a harness profile is accepted for productive delegation, run two focused
live checks outside the canonical chain: a bounded qualification attempt that
counts direct native child IDs, and a productive PLAN-REVIEW/CODE/CODE-REVIEW
smoke using the same native primitive. The latter proves trusted Work binding,
depth one, shared workspace, all-settled siblings, usage reconciliation and a
clean terminal child tree. A successful native launch and the later quality or
terminal result of that child remain separate observations.
