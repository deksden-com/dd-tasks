---
file: '.memory-bank/mbb/indexing-guide.md'
description: 'Canonical indexing rules for Memory Bank navigation: shallow, deep, hybrid indexes and annotated links.'
purpose: 'Use when creating or updating index.md files so project knowledge stays reachable and easy to scan.'
version: '0.2.0'
date: '2026-05-12'
status: 'ACTIVE'
c4_level: 'standard'
tags: [indexing, navigation, shallow-index, deep-index, annotations]
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
related_files:
  - .memory-bank/mbb/duo-files-guide.md
  - .memory-bank/mbb/frontmatter-standards.md
  - .memory-bank/mbb/memory-bank-structure.md
history:
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Canonicalized indexing rules for reusable Memory Banks.'
  - version: '0.2.0'
    date: '2026-05-12'
    changes: 'Clarified root index role versus structure.md folder map.'
---

# Indexing Guide

Indexes are navigation files named `index.md`. They make Memory Bank readable without global search and keep agents from guessing where knowledge lives.

## Required Behavior

Every index should:
- describe the folder's purpose;
- list reachable child files/folders;
- use annotated links;
- keep parent/child relations aligned with frontmatter;
- avoid listing stale or archived content as active.

If you add, move, or remove a file, update the nearest index and any root hub that routes to it.

## Index Types

### Shallow Index

Use for simple folders with files at one level.

```yaml
index_type: shallow
coverage_depth: 1
```

Example:

```markdown
## Components

- [State Store](state-store.md): Runtime state contract and invariants. Read before changing persistence or recovery behavior.
- [Event Bus](event-bus.md): Event publication and subscription contract. Read before adding new event types.
```

### Deep Index

Use for complex folders with subfolders or a C4 subtree.

```yaml
index_type: deep
coverage_depth: 2
```

Example:

```markdown
## Runtime Subsystem

- [Runtime Contract](contract.md): External boundary, inputs, outputs, and failure modes. Read before changing integration behavior.
- [State Store](state-store/index.md): Component docs for persistence and transitions. Read for state-related work.
- [Event Bus](event-bus/index.md): Component docs for event flow and handlers. Read for event-driven changes.
```

### Hybrid Index

Use when a root combines quick entry points with selected deeper navigation.

```yaml
index_type: hybrid
coverage_depth: 2
```

Typical root hubs (`memory-bank/index.md`, `docs/index.md`) are hybrid.

## Annotated Link Format

Use:

```markdown
- [Display Name](relative/path.md): What the file contains. Why or when to read it.
```

Good:

```markdown
- [Quality Gates](quality/gates.md): Canonical lint, typecheck, test, and review gates. Read before changing CI or release checks.
```

Weak:

```markdown
- [Quality](quality/gates.md): Quality docs.
```

## Recommended Root Index

`memory-bank/index.md` should include:
- a quick start for agents and maintainers;
- links to `structure.md`, MBB, active plans, critical specs, scenarios, UI, guides, and evidence;
- short "where to write" router;
- role-based quick starts when useful;
- links to active docs only;
- archive link separated from active material.

The root index is not a full folder catalog. It should answer: "what should I read first to work safely?"

Use `structure.md` for the broader folder map: what sections exist, what each owns, and where new files belong. The root index should link to it, but should not duplicate it.

## Recommended Section Index

A section `index.md` should include:
- overview;
- child document list;
- related decisions/specs/scenarios;
- implementation/test links if the section owns a code boundary;
- maintenance notes if the section has special rules.

## Orphan Rule

No active Markdown file should be unreachable. A file is reachable when it can be found by following links from the root Memory Bank index or a documented root hub.

Exceptions:
- generated artifacts under a clearly marked runtime/evidence folder;
- archived content under an indexed archive path;
- draft scratch files explicitly marked as temporary.

## Maintenance Checklist

When editing an index:

1. Check that every listed path exists.
2. Check that every child file is listed or intentionally excluded.
3. Check that annotations explain both contents and reading purpose.
4. Check `parent`, `children`, `index_type`, and `coverage_depth`.
5. Search for old paths after moves.

Useful commands:

```bash
find memory-bank -name index.md -print
rg "old/path|old-name" memory-bank
rg "\\]\\([^)]*\\.md" memory-bank
```
