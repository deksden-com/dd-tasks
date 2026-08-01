---
file: '.memory-bank/mbb/aspects/10-protocols-evidence.md'
description: 'Canonical aspect for work protocols, factual traces, final reports, closure, and promoted evidence.'
purpose: 'Use to extract, migrate, audit, or distill protocol knowledge in a Memory Bank.'
version: '0.1.0'
date: '2026-05-24'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/templates/protocol.md
  - .memory-bank/mbb/named-deferrals-guide.md
  - .memory-bank/mbb/sdlc-workflow.md
tags: [mbb, aspects, protocol, evidence, closure]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added protocols and evidence aspect.'
---

# Protocols And Evidence

## Scope

Protocol summaries, factual traces of work, navigation blocks, final reports, closure state, acceptance notes, promoted lessons, and links to evidence.

## Canonical Targets

- `protocol/`
- `evidence/` when artifacts are durable
- updated `spec/`, `adr/`, `plans/`, `scenarios/`, `ui/`, or `guides/` when a protocol discovers durable knowledge

## Sources

Existing protocols, final reports, `.tasks/` reports, test logs, CI evidence, merge reports, review notes, and user acceptance messages.

## Questions

- What happened, and what was accepted?
- Which artifacts are durable enough to link?
- Which `.tasks/` findings must be promoted before archival?
- Are open DEFs visible?
- Does closure prove the original operational goal?

## Modes

- `init`: create a curated initialization protocol only when the setup trace should be durable.
- `upgrade`: migrate useful old protocol traces and archive obsolete runtime detail.
- `audit/analyse`: find protocols with missing closure, stale task links, or unpromoted knowledge.
- `distill`: look for closure/reporting practices that improve continuation context.
