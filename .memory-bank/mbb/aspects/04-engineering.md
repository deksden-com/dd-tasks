---
file: '.memory-bank/mbb/aspects/04-engineering.md'
description: 'Canonical aspect for engineering standards, local commands, tests, and code quality practices.'
purpose: 'Use to extract, migrate, audit, or distill engineering knowledge in a Memory Bank.'
version: '0.1.0'
date: '2026-05-24'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/coding-standards-guide.md
  - .memory-bank/mbb/code-contracts-guide.md
  - .memory-bank/mbb/verification-matrix-guide.md
tags: [mbb, aspects, engineering, tests, coding]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added engineering knowledge aspect.'
---

# Engineering

## Scope

Stack, package manager, local commands, coding standards, testing strategy, lint/typecheck/build gates, file organization, error/logging policy, and agent coding rules.

## Canonical Targets

- `spec/engineering/`
- `skills/` for stack/tool notes
- code contract references

## Sources

Package/workspace manifests, lockfiles, configs, scripts, tests, lint rules, TypeScript or build config, README setup instructions, and code style visible in existing modules.

## Questions

- Which commands are authoritative?
- What is the test pyramid or current test coverage?
- Which coding rules are enforced versus conventional?
- Which engineering facts are project-specific enough to document?
- Which details should stay in config/code only?

## Modes

- `init`: record verified commands, stack, and test gates.
- `upgrade`: migrate old engineering notes and remove duplicated setup instructions.
- `audit/analyse`: check whether docs match executable project commands.
- `distill`: look for engineering practices that improve agent reliability.
