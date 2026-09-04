---
file: '.memory-bank/dd-flow/mb-sdlc/plan/review.md'
description: 'Canonical PLAN review and aspect-routing prompt for SPC-005.'
purpose: 'Select proportional coverage, preserve semantic dependencies and produce one accepted aspect map.'
version: '2.2.0'
date: '2026-09-04'
status: 'DRAFT'
c4_level: 'prompt'
parent: '../README.md'
related_files:
  - ../../plan.md
  - ../../common/worker-session.md
  - ../../common/subagents.md
  - ../../schemas/protocol-plan.schema.json
  - ../plan-aspects/index.md
tags: [dd-flow, plan, review, routing, spc-005]
history:
  - version: '2.2.0'
    date: '2026-09-04'
    changes: 'Replaced the flow-owned timed probe with externally qualified native-child capacity shared by productive delegation.'
  - version: '2.1.0'
    date: '2026-08-12'
    changes: 'Added semantic acceptance checks for actionable plan-item implementation guidance.'
---

# PLAN review and routing

Read the generated PLAN prompt, accepted specification, protocol-owned
`plan.json` and the aspect catalog. This review is semantic design work; do not
write lifecycle receipts or mechanical runtime facts.

## Required result

The plan must contain one `plan.json` at
`.memory-bank/protocol/<PRT-ID>/plan.json` and one RUN-local
`<RUN-home>/02-plan/aspect-map.json`. The plan is the only semantic task graph;
the aspect map is the only semantic coverage map. A plan item must expose
structured `semantic_spine`, `execution_context`, `details` and
`verification_contract`.

For every newly authored executable item, `details` must be a
self-contained handoff for a developer who knows the project stack but did not
join the planning discussion. It must state the approach, ordered steps,
control points, pitfalls, stop conditions and completion criterion. Reject an
item when the worker would need hidden discussion context, private model
reasoning or vague instructions such as "implement" / "run tests" to proceed.
Keep the detail proportional to the task; short work may use short lists.

The map contains every catalog aspect:

```yaml
aspect_id:
applicability: applicable | not_applicable | unknown
applicability_reason:
coverage_mode: none | self_check | focused_subagent | grouped_subagent | external_evidence | deferred_as_DEF | blocked
coverage_reason:
independence_reason:
planned_artifacts:
actual_artifacts:
verdict: pending | accepted | accepted_with_findings | accepted_with_DEF | needs_changes | blocked | not_applicable
findings: []
deferrals: []
```

`unknown` must become a question, blocker or precise DEF before the plan gate.
`not_applicable` always has a reason. Coverage is not inferred from the number
of workers.

## Routing algorithm

Start with `route_state: initial` and `orchestrator_local`. This means only that
the orchestrator currently owns routing; it is not the default execution route
or proof of a completed local review.

1. Read bounded intake and identify substantive semantic units and consumers.
2. Choose `local_compact` when there is one unit or one short source scope. It
   does not require subagent capacity.
3. For multiple units, record only hard dependencies where a successor names
   the exact accepted predecessor output it consumes.
4. Keep trust/security boundaries, incompatible snapshots, mutation conflicts
   and hard dependencies focused when independent evidence is required.
5. Treat remaining read-only units as grouped candidates. Prefer
   `single_wave_grouped` when a real parallel-speed benefit exists.
6. Use capacity qualified for the selected harness profile by controller
   tooling outside this RUN. Capacity changes packing/batches only.
7. Pack compatible units in groups of at most three and preserve separation
   rules. Prefer one wave; use the minimum number of waves when capacity limits
   it.
8. Accept every unit separately. Recover only a rejected unit; accepted
   siblings remain accepted.

If a substantive delegated route has unknown capacity, report the missing
harness qualification to the controller. Do not test the harness from PLAN,
create probe Work or fabricate one slot. Productive reviewer jobs use the same
native depth-one child mechanism that produced the qualified value.

Compatibility families in `plan-aspects/index.md` are preferences, not an
allowlist. A group must be read-only, use one immutable or read-equivalent
snapshot, have no hard edge between members and preserve one verdict/evidence
section per unit.

## Worker boundary

Create a worker packet, rendered prompt and report only for a real delegated
job. The packet uses `common/worker-session.md`, one leaf aspect prompt and the
selected plan item's execution context. Runtime owns job/session lifecycle and
timeline history; the aspect map keeps the accepted semantic row and report
reference.

If a hard predecessor is consumed, put its accepted report or local aspect-map
row in `handoff.predecessor_reports` with the exact consumed data. Common
subject matter or preferred order is not a dependency. Validate cycles and
missing predecessors before launch.

## Review boundaries

Do not create a second semantic plan, a second coverage graph, aggregate job
receipt, manual decision memo or phase/report projection. The CLI derives graph
and progress views from the canonical plan, aspect map and current runtime
workers. The agent does not author timestamps, session ids, hashes, usage,
durations or HTML.

PLAN may update only the protocol plan, aspect map, DRAFT/PLANNED target
contracts and verification design. An active document claiming implemented or
current behavior is not updated with a future plan outcome.

## Acceptance

Before handing CODE the plan, verify:

- the plan validates with `schemas/protocol-plan.schema.json` and preserves all
  structured semantic fields;
- every required item has a non-empty summary, execution context and
  implementation guidance and verification contract;
- every new `details` guidance block names an actionable approach,
  ordered steps, controls, pitfalls, stop conditions and completion criterion;
- guidance transfers facts and decisions but does not capture chain-of-thought,
  private transcripts or a second plan;
- dependencies are acyclic and name consumed outputs;
- tiny work requires no capacity and suitable multi-aspect work has a grouped
  one-wave route;
- every catalog aspect has applicability, coverage and a verdict;
- no active instruction asks for duplicate plans, manual reports or mechanical
  telemetry;
- companion runtime and selected-files lint work is recorded as external
  handoff, not claimed as canonical completion.
