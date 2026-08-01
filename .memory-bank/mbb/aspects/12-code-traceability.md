---
file: '.memory-bank/mbb/aspects/12-code-traceability.md'
description: 'Canonical aspect for links between code, docs, scenarios, ADRs, and implementation contracts.'
purpose: 'Use to extract, migrate, audit, or distill code-to-memory traceability.'
version: '0.2.0'
date: '2026-06-30'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/glossary.md
  - .memory-bank/mbb/code-contracts-guide.md
  - .memory-bank/mbb/cross-references.md
  - .memory-bank/mbb/coding-standards-guide.md
tags: [mbb, aspects, code, traceability, docs]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added code traceability aspect.'
  - version: '0.2.0'
    date: '2026-06-30'
    changes: 'Aligned doc-tag scope with accepted traceability tags and public/significant boundary rule.'
---

# Code Traceability

## Scope

JSDoc/TSDoc/docstrings, `@docs`, `@spec`, `@adr`, `@feature`, `@protocol`, `@scenario`, `@evidence` tags, implementation links, test links, scenario references, generated docs, and code contracts.

## Canonical Targets

- code comments and doc-tags when project policy allows
- `spec/system/`
- `spec/engineering/`
- `scenarios/`
- `plans/epics/`
- `adr/`
- `protocol/`
- `evidence/`

## Sources

Source code, public interfaces, exported APIs, components, tests, doc comments, schemas, generated types, and Memory Bank cross references.

## Questions

- Which public or significant boundaries need links to specs, ADRs, features, protocols, scenarios, or evidence?
- Do existing doc-tags point to real files?
- Are code comments explaining durable contracts or stale implementation notes?
- Should a code reference be added, updated, ignored, or removed?
- Can a deterministic `mb-lint` rule check the relation?

## Modes

- `init`: observe code contracts and document policy; change code only if explicitly allowed.
- `upgrade`: update old doc links and tags according to migration maps.
- `audit/analyse`: find broken doc-tags, missing critical traceability, and code/doc drift.
- `distill`: look for traceability practices that make code safer for agents to change.
