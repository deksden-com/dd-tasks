---
file: '.memory-bank/dd-flow/common/flow-flags.md'
description: 'SPC-004 v0.2 and SPC-005 flow policy without report/observability switches.'
purpose: 'Resolve route and verification policy once at RUN start.'
version: '1.1.0'
date: '2026-08-10'
status: 'DRAFT'
c4_level: 'policy'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - flow-contract.json
  - runtime-contract.md
tags: [dd-flow, flags, policy, spc-004, spc-005]
---

# Flow policy

Flow policy is resolved once at RUN start and stored in `run.json`. It controls
planning depth, review route, bootstrap mode, verification depth, evidence
level and merge ceremony. It does not control whether reports, HTML, timeline
events or progress exist: those are unconditional contract behavior.

## Supported values

```yaml
planning.mode: no_plan | compact_plan | full_plan
plan.review.mode: self | grouped | mixed
subagents.route: self_check | grouped_subagent | focused_subagent
workspace.bootstrap.mode: not_required | revalidate | required
verification.depth: minimum | normal | full
evidence.level: basic | verification_passport
```

Mandatory floors may raise, never lower, the selected route. High-risk breaking
runtime/storage work requires `full_plan`, independent or focused review,
`full` verification and a `verification_passport`.

For PLAN routing, `orchestrator_local` is the initial ownership state, not the
default execution recommendation. Tiny work selects `local_compact` without a
capacity probe. Substantive multi-aspect read-only work selects
`single_wave_grouped` when compatible units can benefit from one wave. Capacity
may change packing only; it cannot create dependencies or change applicability.

## Snapshot

The CLI records a revision and checksum in `run.json`:

```yaml
flow_policy:
  revision: 1
  checksum: <sha256>
  values:
    planning.mode: full_plan
    verification.depth: full
    evidence.level: verification_passport
```

An explicit policy revision is required before a stage can change effective
values. Prompts consume the snapshot; they do not silently infer a new route.

## Removed choices

The active policy has no `report.html`, `report.markdown`,
`observability.detail`, timeline-hide, quiet-progress or per-stage rendering
switch. Generated JSON/Markdown/HTML, safe timeline and bounded lint progress
are mandatory.

PLAN has no user-selectable report/graph/job projection. It consumes one
protocol-owned `.memory-bank/protocol/<PRT-ID>/plan.json` and one RUN-local
`aspect-map.json`; progress and workers are runtime projections.
