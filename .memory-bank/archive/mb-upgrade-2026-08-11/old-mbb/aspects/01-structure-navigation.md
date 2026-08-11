---
file: '.memory-bank/mbb/aspects/01-structure-navigation.md'
description: 'Canonical aspect for Memory Bank structure, indexes, navigation, and reachability.'
purpose: 'Use to extract, migrate, audit, or distill how a project organizes Memory Bank knowledge.'
version: '0.1.0'
date: '2026-05-24'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/memory-bank-structure.md
  - .memory-bank/mbb/indexing-guide.md
  - .memory-bank/mbb/frontmatter-standards.md
tags: [mbb, aspects, structure, indexes]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added structure and navigation aspect.'
---

# Structure And Navigation

## Scope

Memory Bank root, folder map, indexes, reachability, frontmatter coverage, and navigation rules.

## Canonical Targets

- `index.md`
- `structure.md`
- local `index.md` files
- `mbb/` references
- archive indexes when material is deprecated

## Sources

Directory tree, existing Memory Bank roots, README, documentation layout, frontmatter, Markdown links, `.mb-lint.json`, and Git history when needed.

## Questions

- What is the root Memory Bank path?
- Which documents are active entry points?
- Are active documents reachable from indexes?
- Is `structure.md` a shelf map rather than another working index?
- Are local indexes annotated enough for agents?

## Modes

- `init`: create the smallest honest root index and structure map.
- `upgrade`: map old folders to canonical shelves and keep legacy paths traceable.
- `audit/analyse`: find orphan files, duplicate indexes, stale links, and unclear ownership.
- `distill`: look for navigation practices that improve agent orientation.
