---
file: '.memory-bank/mbb/aspects/09-plans-delivery.md'
description: 'Canonical aspect for plans, epics, features, delivery decomposition, and verification planning.'
purpose: 'Use to extract, migrate, audit, or distill delivery planning knowledge in a Memory Bank.'
version: '0.2.0'
date: '2026-06-15'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/delivery-docs-guide.md
  - .memory-bank/mbb/verification-matrix-guide.md
  - .memory-bank/mbb/sdlc-workflow.md
tags: [mbb, aspects, plans, delivery]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added plans and delivery aspect.'
  - version: '0.2.0'
    date: '2026-06-15'
    changes: 'Added SDLC contour coverage, policy migration block and stage-aware verification planning.'
---

# Plans And Delivery

## Scope

Roadmaps, epics, features, implementation plans, delivery decomposition, SDLC contour coverage, policy migration blocks, verification planning, dependencies, scope boundaries, release/deploy next actions, and acceptance intent.

## Canonical Targets

- `plans/`
- feature and epic documents
- verification matrices
- protocol links for execution traces

## Sources

README future-work sections, TODO docs, issues, protocol summaries, feature specs, tests, roadmap docs, and user requests that became durable plans.

## Questions

- What work is active, planned, or deferred?
- Which plan items map to user value?
- Are verification and acceptance criteria explicit?
- Does the plan trace to product/system/engineering/operations constraints?
- If Git, release, deploy, stage or verification policy changes, does the plan include a policy migration block?
- Does every acceptance scenario name target stage, verification contour, evidence and gate status?
- Are release/deploy/publish boundaries explicit enough for the next flow?
- Are completed plans archived or summarized?

## Modes

- `init`: record only visible future directions and current verification needs.
- `upgrade`: migrate old epics/features/specs into current delivery docs.
- `audit/analyse`: find plans without acceptance, stale plans, and missing traceability.
- `distill`: look for planning practices that help agents choose the right depth of work.
