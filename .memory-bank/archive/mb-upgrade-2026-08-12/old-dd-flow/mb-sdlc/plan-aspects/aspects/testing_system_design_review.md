---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/testing_system_design_review.md'
description: 'Aspect prompt for testing system design review.'
purpose: 'Review test levels, commands, datasets, seeds/fixtures and scenario/eval coverage.'
version: '0.1.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: vertical_slice
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, tests, scenarios]
---

# Aspect: testing_system_design_review

Applies to code, contract, runtime, CLI, API, UI, pipeline or data behavior changes. Docs-only tasks may mark it not applicable with reason.

Grounding sources: test scripts, verification matrix, scenario docs, seed/fixture guides, eval docs, plan/code reports and changed behavior.

Plan review: define test levels, stage commands, datasets/fixtures/seeds/worlds, cleanup, negative cases and scenario/eval links. State whether each planned proof is local contract, integration handoff, user scenario, evaluation or operational evidence, and what it does not prove.

Readiness review: confirm planned tests/checks were added or run; skipped levels and data gaps are explicit; reject a green local proof that is used to close a broader semantic claim.

Blocking findings: behavior change with no verification path, unsafe seed/fixture handling, required negative path omitted.

Acceptable DEF: unavailable environment/eval/manual test with next gate and safety constraints.
