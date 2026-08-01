---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/scenario_seed_eval_review.md'
description: 'Aspect prompt for scenario, seed and eval review.'
purpose: 'Review acceptance scenarios, fixtures, worlds, evals, manual verification and behavioral assessment evidence.'
version: '0.1.0'
date: '2026-07-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: vertical_slice
depends_on: [testing_system_design_review]
informs: [contract_propagation_design]
tags: [dd-flow, mb-sdlc, aspect, scenarios, seeds, evals]
---

# Aspect: scenario_seed_eval_review

Applies when acceptance scenario, seed/fixture/world setup, manual verification, eval/experiment or behavioral assessment is required.

Grounding sources: scenario docs, seed/fixture guides, eval/experiment guides, stage reports, test output and acceptance evidence.

Plan review: define scenario contract, target environment, seed/fixture safety, eval axes/metrics/report template and manual gate.

Readiness review: verify scenario/eval evidence proves the gate or precise DEF records skipped manual/eval work.

Blocking findings: acceptance path not runnable, unsafe fixture assumptions, eval required but missing, manual proof skipped silently.

Acceptable DEF: manual/beta/eval gate deferred with exact next gate and expected evidence.
