---
file: '.memory-bank/mbb/aspects/02-product.md'
description: 'Canonical aspect for product meaning, users, roles, domain terms, and value boundaries.'
purpose: 'Use to extract, migrate, audit, or distill product knowledge in a Memory Bank.'
version: '0.1.0'
date: '2026-05-24'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/spec-layer-guide.md
  - .memory-bank/mbb/user-guides-layer.md
tags: [mbb, aspects, product, domain]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added product knowledge aspect.'
---

# Product

## Scope

Product purpose, actors, roles, user value, domain vocabulary, product boundaries, and user-visible invariants.

## Canonical Targets

- `spec/product/`
- product-facing parts of `plans/`
- user-facing `guides/`
- UI meaning when it expresses product semantics

## Sources

README, product docs, roadmap, user guides, UI copy, tests that encode user behavior, issue descriptions, and user answers.

## Questions

- Who uses the product and why?
- Which domain terms must agents preserve?
- What is in scope and out of scope?
- Which behaviors are product invariants rather than implementation details?
- What is confirmed by docs versus inferred from code?

## Modes

- `init`: extract minimal product truth and ask only blocking product questions.
- `upgrade`: migrate scattered product meaning into `spec/product/` without duplicating delivery plans.
- `audit/analyse`: find missing actors, conflicting terminology, stale product claims, and undocumented boundaries.
- `distill`: look for product-knowledge patterns that make future planning clearer.
