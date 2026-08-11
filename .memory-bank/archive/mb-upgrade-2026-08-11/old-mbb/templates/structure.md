---
file: 'memory-bank/structure.md'
description: '<Folder map and placement rules for this project Memory Bank.>'
purpose: '<Read to understand what sections exist, what each section owns, and where new documents should be placed.>'
version: '0.1.0'
date: 'YYYY-MM-DD'
status: 'DRAFT'
c4_level: 'documentation'
parent: 'memory-bank/index.md'
related_files:
  - memory-bank/mbb/index.md
tags: [structure, memory-bank, navigation]
---

# Memory Bank Structure

## Purpose

<Explain why this project needs a separate structure map and how it differs from the root index.>

## Folder Map

```text
memory-bank/
├── index.md
├── structure.md
├── spec/
├── adr/
├── plans/
│   └── epics/
├── scenarios/
├── protocol/
├── ui/
├── guides/
├── evidence/
├── skills/
├── mbb/
└── archive/
```

## Sections

### `index.md`

<Fast entrypoint: what to read first.>

### `structure.md`

<Folder map and placement rules.>

### `spec/`

<Normative requirements and invariants.>

### `adr/`

<Architectural decisions and rationale.>

### `plans/`

<Epics, features, roadmaps, verification matrices.>

Canonical new-project layout for epics/features:

```text
memory-bank/plans/epics/EP-XXX-<slug>/index.md
memory-bank/plans/epics/EP-XXX-<slug>/features/FT-XXX-YY-<slug>.md
```

### `scenarios/`

<Executable verification scenarios.>

### `protocol/`

<Curated execution traces and evidence narratives.>

### `ui/`

<Design system, screen contracts, automation contracts, visual references.>

### `guides/`

<User-facing documentation in Diátaxis form.>

### `evidence/`

<Verification artifacts, screenshots, reports, run snapshots.>

### `skills/`

<Agent-facing stack, vendor, and tool knowledge.>

### `mbb/`

<Memory Bank rules and templates.>

### `archive/`

<Deprecated or historical material.>

## Where To Write

- New normative behavior:
- New decision:
- New feature:
- New implementation plan:
- New scenario:
- New execution trace:
- New UI screen or design rule:
- New user guide:
- New evidence artifact:

## Local Exceptions

<List project-specific deviations from the canonical layout and why they exist.>

## Maintenance

Update this file when root folders, ownership rules, or document placement rules change.
