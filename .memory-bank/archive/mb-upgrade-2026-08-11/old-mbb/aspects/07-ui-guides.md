---
file: '.memory-bank/mbb/aspects/07-ui-guides.md'
description: 'Canonical aspect for UI contracts, design system notes, user documentation, and guides.'
purpose: 'Use to extract, migrate, audit, or distill UI and guide knowledge in a Memory Bank.'
version: '0.1.0'
date: '2026-05-24'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/ui-layer-guide.md
  - .memory-bank/mbb/user-guides-layer.md
tags: [mbb, aspects, ui, guides, documentation]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added UI and guides aspect.'
---

# UI And Guides

## Scope

Screens, interaction contracts, design system rules, visual references, automation IDs, user documentation, tutorials, how-to guides, references, and explanations.

## Canonical Targets

- `ui/`
- `guides/`
- scenario links for user journeys
- product specs for user-facing meaning

## Sources

UI code, route structure, component names, CSS/design tokens, screenshots, storybooks, README usage sections, user docs, tests, and user-visible copy.

## Questions

- Which surfaces does the project expose?
- What does each screen or command let users do?
- Are interaction contracts documented enough for tests and agents?
- Which docs are user-facing rather than internal engineering notes?
- Are screenshots or visual assets required?

## Modes

- `init`: record existing surfaces and create user-guide/UI docs only when supported by sources.
- `upgrade`: split UI contracts and user docs into their canonical shelves.
- `audit/analyse`: find stale UI docs, missing screen contracts, and guide/spec duplication.
- `distill`: look for UI/doc practices that improve agent and user comprehension.
