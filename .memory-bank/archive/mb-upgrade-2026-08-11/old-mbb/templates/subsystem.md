---
file: 'memory-bank/spec/system/<subsystem>/index.md'
description: '<Subsystem/container overview, boundaries, and navigation.>'
purpose: '<Read to understand subsystem ownership, contracts, components, and integration points.>'
version: '0.2.0'
date: 'YYYY-MM-DD'
status: 'DRAFT'
c4_level: 'L2'
index_type: 'deep'
coverage_depth: 2
parent: 'memory-bank/spec/system/index.md'
children: []
related_files: []
tags: [subsystem, architecture]
---

# <Subsystem Name>

> Подсистема - это устойчивая системная граница, а не папка с кодом и не фича. Она может обслуживать много фич и должна иметь контракт, владельца, зависимости и проверяемые инварианты.

## Boundary

- Owns:
- Does not own:
- Depends on:
- Used by:

## Contract

- External interfaces:
- Events/commands:
- Data/state:
- Failure modes:

## Invariants

- <Invariant that must remain true>

## Code Contracts

- API/schema:
- SDK/client:
- Events:
- UI/scenario contracts:

## Components

- [<Component>](component.md): <what it contains and why to read>

## Decisions And Evidence

- [<ADR/SPEC>](../../specs/<file>.md): <decision or plan>
- `<test/report/path>`: <what it proves>

## Implementation Links

- `path/to/source`: <what it owns>
- `path/to/test`: <what it proves>
