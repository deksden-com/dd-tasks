---
file: '.memory-bank/mbb/aspects/11-memory-lifecycle.md'
description: 'Canonical aspect for Memory Bank freshness, archival, deprecation, duplicates, and size control.'
purpose: 'Use to extract, migrate, audit, or distill lifecycle practices for project memory.'
version: '0.1.0'
date: '2026-05-24'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/indexing-guide.md
  - .memory-bank/mbb/duo-files-guide.md
  - .memory-bank/mbb/mb-lint-guide.md
tags: [mbb, aspects, memory-lifecycle, archive, freshness]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added Memory Bank lifecycle aspect.'
---

# Memory Lifecycle

## Scope

Freshness, duplicate control, archival, deprecation, compaction, protocol aging, current-vs-historical truth, and index maintenance.

## Canonical Targets

- `archive/`
- archive indexes
- root and local indexes
- protocol archive summaries
- `mbb/` maintenance rules

## Sources

Old docs, duplicate files, stale protocols, `.tasks/` artifacts, archive folders, git history, indexes, and mb-lint findings.

## Questions

- Which active docs are stale, duplicate, or superseded?
- Has durable knowledge been promoted before archival?
- Are archived files clearly historical?
- Is the Memory Bank bloated for its project size?
- Which lifecycle checks can become `mb-lint` rules?

## Modes

- `init`: usually record only initial freshness and `.tasks` policy.
- `upgrade`: archive legacy material after extraction and preserve old-path traceability.
- `audit/analyse`: check actuality, duplicates, bloat, archive indexes, and stale references.
- `distill`: look for lifecycle practices that keep project memory useful over time.
