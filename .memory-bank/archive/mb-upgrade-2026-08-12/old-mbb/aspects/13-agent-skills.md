---
file: '.memory-bank/mbb/aspects/13-agent-skills.md'
description: 'Canonical aspect for project-specific agent skills, stack notes, tool usage, and vendor knowledge.'
purpose: 'Use to extract, migrate, audit, or distill local agent knowledge that helps future work.'
version: '0.1.0'
date: '2026-05-24'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/coding-standards-guide.md
  - .memory-bank/mbb/operations-release-guide.md
tags: [mbb, aspects, skills, agents, tools]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added agent skills aspect.'
---

# Agent Skills

## Scope

Project-specific quick starts, stack notes, vendor/tool caveats, local commands, debugging recipes, and agent working knowledge that is useful but not normative enough for specs.

## Canonical Targets

- `skills/`
- links from `spec/engineering/` and `spec/operations/`
- user guides only when the knowledge is user-facing

## Sources

README, scripts, package docs, local troubleshooting notes, vendor docs referenced by project docs, previous protocol lessons, and repeated agent failures.

## Questions

- What should a future agent know before touching this stack?
- Which commands or caveats are project-local?
- Which knowledge belongs in `skills/` rather than `spec/`?
- Which notes are temporary and should stay in protocol?
- Which lessons can become deterministic checks or evals?

## Modes

- `init`: create skills only for confirmed setup/tool knowledge.
- `upgrade`: migrate local wiki notes into concise, indexed agent skills.
- `audit/analyse`: find stale vendor notes, duplicated setup instructions, and missing critical caveats.
- `distill`: look for skill patterns that help agents start faster without bloating the canon.
