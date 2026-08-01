---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/def_blocker_review.md'
description: 'Aspect prompt for DEF and blocker review.'
purpose: 'Classify gaps as blockers, DEFs or not-applicable without hiding current-gate work.'
version: '0.1.0'
date: '2026-07-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: vertical_slice
depends_on: [goal_traceability]
informs: []
tags: [dd-flow, mb-sdlc, aspect, def, blockers]
---

# Aspect: def_blocker_review

Applies when any unresolved gap, external dependency, unknown or manual check affects a gate.

Grounding sources: `.memory-bank/defs/`, protocol DEFs, stage reports, runbooks, failed checks, user questions and handoff notes.

Plan review: decide blocker vs DEF vs not applicable; define next gate, owner, context for follow-up and user dependency.

Readiness review: ensure DEFs are precise, deduplicated, still relevant and not hiding required current work.

Blocking findings: current-gate gap marked non-blocking, vague DEF, missing next gate, user dependency omitted.

Acceptable DEF: future-gate gap with precise trigger and enough context for another session.
