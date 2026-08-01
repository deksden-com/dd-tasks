---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/goal_traceability.md'
description: 'Aspect prompt for goal traceability.'
purpose: 'Verify that SDLC work traces from user goal to scope, plan items, checks and evidence.'
version: '0.1.0'
date: '2026-07-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: product
depends_on: []
informs: []
tags: [dd-flow, mb-sdlc, aspect, goal-traceability]
---

# Aspect: goal_traceability

Applies to every non-trivial protocol, feature, fix or Memory Bank change.

Grounding sources: user request/intake, protocol, summary, plan stage report, plan items, related specs/features/ADRs/scenarios, `.memory-bank/dd-flow/common/semantic-grounding.md` and code/readiness reports when present.

Plan review: check operational goal, constraints, in/out of scope, acceptance scenario, absence of orphan work and a compact semantic spine for meaningful plan items.

Readiness review: check actual diff and evidence against the goal and constraints; flag scope expansion, responsibility drift, proof-level mismatch or unproven claims.

Blocking findings: missing operational goal, plan items unrelated to goal, acceptance with no evidence, untracked user constraint.

Acceptable DEF: only future or external confirmation gaps that do not block the current gate and name the next gate.
