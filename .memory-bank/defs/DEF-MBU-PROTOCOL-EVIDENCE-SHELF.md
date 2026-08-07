---
file: '.memory-bank/defs/DEF-MBU-PROTOCOL-EVIDENCE-SHELF.md'
description: 'Отложение по публикации durable protocol verification passport/evidence shelf.'
purpose: 'Не допускает превращать raw run-local evidence в durable acceptance claim без независимого паспорта.'
version: '0.1.0'
date: '2026-08-07'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/defs/index.md'
def_id: 'DEF-MBU-PROTOCOL-EVIDENCE-SHELF'
def_status: 'open_follow_up'
def_type: 'evidence_gap'
severity: 'medium'
owner: 'dd-flow protocol/evidence owner'
next_gate: 'review'
next_gate_detail: 'publish a durable verification passport or link an equivalent evidence shelf'
blocks:
  - 'Durable acceptance claims based only on ignored/run-local raw evidence.'
does_not_block:
  - 'Static Memory Bank 2.16.0 upgrade.'
  - 'Local lint and documentation review.'
related_protocols:
  - '.memory-bank/protocol/PRT-006-preview-access-policy/index.md'
related_specs:
  - '.memory-bank/spec/operations/check-profiles.md'
related_scenarios:
  - '.memory-bank/scenarios/SCN-003-private-preview-runtime.md'
tags: [deferral, mb-upgrade, protocol, evidence]
---

# DEF-MBU-PROTOCOL-EVIDENCE-SHELF: durable passport gap

- Owner: dd-flow protocol/evidence owner
- Next gate: `review` — publish a durable verification passport or equivalent
  evidence-shelf entry.

The recovery review found a useful readiness handoff, but the exact raw
artifacts are referenced through an ignored/run-local path and no reusable
verification passport or `.memory-bank/evidence/` shelf entry is discoverable
in the project snapshot. The static Memory Bank upgrade therefore makes no
durable acceptance claim from that raw evidence.

## Close condition

Publish one curated passport under the applicable protocol evidence directory,
or create an equivalent durable evidence-shelf entry. It must name the exact
commit/branch/environment, scenario or smoke, raw-artifact location, caveats,
verdict and `does_not_prove` boundary, and use the fully qualified run slug
`RUN-304-mb-upgrade-2-16-recovery-dd-tasks`.

## Current disposition

`RUN-304` records this DEF as an open follow-up. Runtime/home migration remains
separately governed by `DEF-MBU-RUNTIME-ACTIVE-STATE`.
