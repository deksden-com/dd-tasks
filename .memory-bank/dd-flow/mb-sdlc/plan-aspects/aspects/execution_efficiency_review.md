---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/execution_efficiency_review.md'
description: 'Aspect prompt for coverage-preserving execution-efficiency review.'
purpose: 'Review a full plan for avoidable delivery work only after its testing and evidence design are accepted.'
version: '0.1.0'
date: '2026-07-27'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: vertical_slice
depends_on: [testing_system_design_review, verification_evidence_review]
informs: [scenario_seed_eval_review, performance_capacity_review]
tags: [dd-flow, mb-sdlc, aspect, verification, execution-efficiency]
---

# Aspect: execution_efficiency_review

Apply this final review only when a full plan has meaningful implementation or
verification topology. A compact local change with one proportionate check is
`not_applicable`; do not create review overhead merely because the catalog has
an entry.

This is a delivery-process aspect. It does not replace product runtime
`performance_capacity_review`, and it does not take correctness ownership away
from `testing_system_design_review` or `verification_evidence_review`.

## Grounding

Read the accepted reports for both hard predecessors, then the current
protocol/specification, plan draft and `plan.json` when present, task or
verification matrix, `aspect-map.json`, `aspect-graph.json`, project check
policy/command sources and any selected scenario, seed or eval artifacts whose
evidence contributes to acceptance. These are explicit task-manifest reads,
not remembered orchestrator context.

## Plan Review

Build a bounded **Verification Execution Topology** that identifies:

- every proof boundary and the risk it proves;
- the earliest sufficient check level for each feedback loop;
- a targeted inner-loop profile distinct from required final integration/CI
  checks;
- safe shared setup or fixture reuse and cases that require isolation;
- independent checks that can batch or run in parallel, plus intentional
  serialization points and their reason;
- duplicate checks, repeated manual evidence or avoidable setup that can be
  removed without reducing proof; and
- qualitative relative savings only. Do not invent duration estimates.

Return exactly one verdict:

- `plan_changes_required` when a bounded coverage-preserving improvement is
  needed;
- `accepted` when the topology is already proportionate;
- `not_applicable` for the compact route above; or
- `blocked` when a required proof source, command policy or predecessor result
  is unavailable.

When changes are required, state the affected plan items, preserved proof
boundaries, changed execution order and evidence that must be rechecked. The
orchestrator applies accepted changes through the normal plan-fix loop, then
reruns this aspect against the changed topology before accepting the plan.

## Readiness Review

Confirm that the implemented verification route follows the accepted topology:
required final gates remain present, targeted checks do not overclaim, and any
parallelism or shared setup still preserves isolation and reproducibility.

## Blocking Findings

- optimization removes or substitutes a required proof boundary;
- an apparent duplicate check actually proves a distinct risk or consumer
  contract;
- unsafe shared fixture, seed or environment state is proposed as an
  optimization;
- a final worker lacks accepted predecessor reports or a declared required
  source.

## Acceptable DEF

An unavailable external/manual timing comparison may be deferred only when it
does not block the current correctness gate, has a next owner/gate and does
not justify removing required evidence.
