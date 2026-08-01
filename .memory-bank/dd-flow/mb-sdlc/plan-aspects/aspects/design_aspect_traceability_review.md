---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/design_aspect_traceability_review.md'
description: 'Aspect prompt for specify design-aspect traceability.'
purpose: 'Ensure selected design aspects are reflected in requirements, plan, tests and evidence.'
version: '0.1.0'
date: '2026-07-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: product
depends_on: [goal_traceability]
informs: []
tags: [dd-flow, mb-sdlc, aspect, design-aspects]
---

# Aspect: design_aspect_traceability_review

Applies when specify selected design aspects or the task changes CLI, AI pipeline/model prompts, UI, API, realtime, package, worker, pipeline, data migration or eval behavior.

Grounding sources: specify design aspect files, specification/stage report, protocol, plan items, test/evidence plan and user overrides.

Plan review: verify applicable aspect defaults, user deviations and verification seeds appear in requirements, tasks and evidence.

Readiness review: check actual implementation/docs/tests honor selected aspects and do not treat unselected aspect text as hidden requirements.

Blocking findings: selected design aspect lost, user override contradicted, verification seed omitted without DEF.

Acceptable DEF: future-gate design evidence with explicit user-approved deviation or external dependency.
