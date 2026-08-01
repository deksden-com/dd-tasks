---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/verification_evidence_review.md'
description: 'Aspect prompt for verification and evidence review.'
purpose: 'Check that evidence proves the claimed gate and names skipped work honestly.'
version: '0.1.0'
date: '2026-07-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: vertical_slice
depends_on: [testing_system_design_review]
informs: [scenario_seed_eval_review]
tags: [dd-flow, mb-sdlc, aspect, verification, evidence]
---

# Aspect: verification_evidence_review

Applies to every deliverable result.

Grounding sources: plan stage report, verification matrix, scenarios, check output, stage reports, evidence/passports and final user claims.

Plan review: identify required checks, acceptance scenario, evidence level, manual gates and skipped checks.

Readiness review: verify checks are fresh, outputs are read, evidence matches claims and skipped work is DEF/not-applicable rather than silence.

Blocking findings: green claim with no check, stale evidence, manual gate skipped without DEF, evidence proves narrower scope than claimed.

Acceptable DEF: unavailable external/beta/prod/manual gate with next gate, owner and consequence.
