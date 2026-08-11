---
file: '.memory-bank/mbb/aspects/03-system.md'
description: 'Canonical aspect for system architecture, components, contracts, data, and integrations.'
purpose: 'Use to extract, migrate, audit, or distill system knowledge in a Memory Bank.'
version: '0.1.0'
date: '2026-05-24'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/spec-layer-guide.md
  - .memory-bank/mbb/c4-model.md
  - .memory-bank/mbb/code-contracts-guide.md
tags: [mbb, aspects, system, architecture, c4]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added system knowledge aspect.'
---

# System

## Scope

Architecture, C4 levels, modules, components, APIs, schemas, data flow, state, integrations, boundaries, and invariants.

## Canonical Targets

- `spec/system/`
- system-related ADRs
- implementation links from specs to code and tests

## Sources

Architecture docs, source tree, entry points, route/API definitions, schemas, database migrations, integration configs, tests, and code comments that explain contracts.

## Questions

- What are the main containers, subsystems, and components?
- Which contracts cross boundaries?
- Which data or state transitions matter?
- Which details belong in code only?
- Where does the system contradict existing docs?

## Modes

- `init`: create a shallow system map with confirmed entry points and major boundaries.
- `upgrade`: migrate old architecture notes into canonical C4/system shelves.
- `audit/analyse`: find missing contracts, stale architecture docs, and code/doc drift.
- `distill`: look for architecture documentation practices worth canonizing.
