---
file: '.memory-bank/mbb/aspects/06-scenarios-evidence.md'
description: 'Canonical aspect for executable scenarios, verification matrices, runners, and evidence.'
purpose: 'Use to extract, migrate, audit, or distill scenario and evidence knowledge in a Memory Bank.'
version: '0.1.0'
date: '2026-05-24'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/scenario-docs-guide.md
  - .memory-bank/mbb/scenario-runner-guide.md
  - .memory-bank/mbb/verification-matrix-guide.md
tags: [mbb, aspects, scenarios, evidence, verification]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added scenarios and evidence aspect.'
---

# Scenarios And Evidence

## Scope

User and technical scenarios, acceptance paths, scenario runners, fixtures, seeds, verification matrices, proof artifacts, and evidence contours.

## Canonical Targets

- `scenarios/`
- `evidence/`
- verification matrices in `plans/`
- protocol evidence summaries

## Sources

Tests, E2E specs, scenario docs, runner configs, screenshots, logs, CI artifacts, protocol reports, `.tasks/` reports that need promotion, and user acceptance notes.

## Questions

- Which behaviors are already checked by tests?
- Which scenarios are canonical acceptance contracts?
- What evidence proves which claim?
- Are artifacts durable or only local runtime output?
- Do active docs link to `.tasks/` incorrectly?

## Modes

- `init`: create minimal smoke scenarios and record current verification gates.
- `upgrade`: migrate legacy scenarios and evidence into canonical locations.
- `audit/analyse`: find missing scenarios, stale evidence, and proof claims without artifacts.
- `distill`: look for scenario/evidence practices worth adding to canon.
