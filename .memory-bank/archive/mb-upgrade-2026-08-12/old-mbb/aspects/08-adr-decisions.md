---
file: '.memory-bank/mbb/aspects/08-adr-decisions.md'
description: 'Canonical aspect for ADRs, durable decisions, alternatives, and rationale.'
purpose: 'Use to extract, migrate, audit, or distill decision knowledge in a Memory Bank.'
version: '0.1.0'
date: '2026-05-24'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/templates/adr.md
  - .memory-bank/mbb/sdlc-workflow.md
tags: [mbb, aspects, adr, decisions]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added ADR and decisions aspect.'
---

# ADR And Decisions

## Scope

Durable architectural, process, operational, product, and tooling decisions with alternatives, consequences, and status.

## Canonical Targets

- `adr/`
- related `spec/` sections
- protocol summaries that promoted the decision

## Sources

Existing ADRs, protocol decisions, issue discussions, README rationale, commit messages when needed, architecture docs, and user answers.

## Questions

- Which decisions are durable enough to deserve ADRs?
- Which choices are just implementation details?
- Are alternatives and consequences recorded?
- Is decision status current?
- Does an ADR duplicate a spec instead of explaining rationale?

## Modes

- `init`: create ADRs only for clear existing decisions or user-confirmed setup choices.
- `upgrade`: normalize legacy decisions into ADR format and link them to specs.
- `audit/analyse`: find missing rationale, stale statuses, and unlinked decisions.
- `distill`: look for decision-record practices that improve future agent choices.
