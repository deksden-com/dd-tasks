---
file: '.memory-bank/mbb/aspects/index.md'
description: 'Canonical index of reusable Memory Bank knowledge aspects.'
purpose: 'Read before mb-init, mb-upgrade, mb-audit, mb-analyse, or mb-distill when selecting what project knowledge to extract, migrate, audit, or distill.'
version: '0.1.0'
date: '2026-05-24'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
children:
  - .memory-bank/mbb/aspects/00-aspect-contract.md
  - .memory-bank/mbb/aspects/01-structure-navigation.md
  - .memory-bank/mbb/aspects/02-product.md
  - .memory-bank/mbb/aspects/03-system.md
  - .memory-bank/mbb/aspects/04-engineering.md
  - .memory-bank/mbb/aspects/05-operations.md
  - .memory-bank/mbb/aspects/06-scenarios-evidence.md
  - .memory-bank/mbb/aspects/07-ui-guides.md
  - .memory-bank/mbb/aspects/08-adr-decisions.md
  - .memory-bank/mbb/aspects/09-plans-delivery.md
  - .memory-bank/mbb/aspects/10-protocols-evidence.md
  - .memory-bank/mbb/aspects/11-memory-lifecycle.md
  - .memory-bank/mbb/aspects/12-code-traceability.md
  - .memory-bank/mbb/aspects/13-agent-skills.md
related_files:
  - .memory-bank/mbb/memory-bank-structure.md
  - .memory-bank/mbb/spec-layer-guide.md
  - .memory-bank/mbb/sdlc-workflow.md
  - .memory-bank/mbb/mb-lint-guide.md
tags: [mbb, aspects, knowledge, init, upgrade, audit, distill]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added canonical reusable knowledge aspects and flow mode rules.'
---

# Canonical Knowledge Aspects

This directory defines the canonical aspect library for project knowledge in a Memory Bank.

Flow prompts must not redefine these aspects. A flow may select aspects, set a mode, add flow-specific acceptance criteria, and define orchestration/output requirements. If the meaning of an aspect changes, update the canonical file here first, then adapt affected flows.

## Flow Modes

- `init`: extract initial project knowledge from docs, code, configs, tests, comments, Git, and user answers.
- `upgrade`: map existing Memory Bank knowledge to the current canon, migrate it, archive legacy material, and preserve traceability.
- `audit` / `analyse`: check completeness, correctness, freshness, duplicates, contradictions, and missing links.
- `distill`: compare a target project with the canon and identify practices worth adopting, adapting, observing, or rejecting.

## Aspect Map

| Aspect | Canonical targets | Common sources | Used by flows |
|---|---|---|---|
| [Structure and Navigation](01-structure-navigation.md) | `index.md`, `structure.md`, local indexes | tree, frontmatter, links | init, upgrade, audit, distill |
| [Product](02-product.md) | `spec/product/`, `plans/`, `guides/` | README, product docs, UI text, tests | init, upgrade, audit, distill |
| [System](03-system.md) | `spec/system/`, `adr/` | code, architecture docs, APIs, schemas | init, upgrade, audit, distill |
| [Engineering](04-engineering.md) | `spec/engineering/`, `skills/` | manifests, configs, tests, code standards | init, upgrade, audit, distill |
| [Operations](05-operations.md) | `spec/operations/`, runbooks, release docs | Git, CI/CD, deploy configs, secrets policy | init, upgrade, audit, distill |
| [Scenarios and Evidence](06-scenarios-evidence.md) | `scenarios/`, `evidence/`, verification matrices | tests, runners, proof artifacts | init, upgrade, audit, distill |
| [UI and Guides](07-ui-guides.md) | `ui/`, `guides/` | UI code, screenshots, design docs, user docs | init, upgrade, audit, distill |
| [ADR and Decisions](08-adr-decisions.md) | `adr/`, linked specs | ADRs, commit history, protocol decisions | init, upgrade, audit, distill |
| [Plans and Delivery](09-plans-delivery.md) | `plans/`, feature maps, verification plans | roadmap, issues, protocols | init, upgrade, audit, distill |
| [Protocols and Evidence](10-protocols-evidence.md) | `protocol/`, evidence summaries | protocol traces, `.tasks/`, checks | init, upgrade, audit, distill |
| [Memory Lifecycle](11-memory-lifecycle.md) | `archive/`, indexes, freshness policy | old docs, duplicate docs, stale protocols | upgrade, audit, distill |
| [Code Traceability](12-code-traceability.md) | code doc-tags, cross references | JSDoc/TSDoc/docstrings, source links | init, upgrade, audit, distill |
| [Agent Skills](13-agent-skills.md) | `skills/`, local agent guides | stack notes, vendor docs, tool guides | init, upgrade, audit, distill |

## Change Rule

1. Change the canonical aspect in `mbb/aspects/`.
2. Update this index if targets, sources, or flow coverage change.
3. Update flow adapters in `dd-flow/` only to reflect mode selection, orchestration, or output changes.
4. Add or update an eval when the change fixes an observed agent behavior problem.
