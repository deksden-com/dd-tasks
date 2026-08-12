---
file: '.memory-bank/defs/DEF-MBU-PROTOCOL-EVIDENCE-SHELF.md'
description: 'Отложение по публикации durable protocol verification passport/evidence shelf.'
purpose: 'Не допускает превращать raw run-local evidence в durable acceptance claim без независимого паспорта.'
version: '0.2.0'
date: '2026-08-12'
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
history:
  - version: '0.2.0'
    date: '2026-08-12'
    changes: 'RUN-310 подтвердил наличие отдельных curated passports для PRT-001/003/004, но они не закрывают recovery evidence gap RUN-304; DEF остаётся открытым.'
---

# DEF-MBU-PROTOCOL-EVIDENCE-SHELF: durable passport gap

- Owner: dd-flow protocol/evidence owner
- Next gate: `review` — publish a durable verification passport or equivalent
  evidence-shelf entry.

The recovery review found a useful readiness handoff, but the exact raw
artifacts are referenced through an ignored/run-local path and no reusable
verification passport for the specific recovery run `RUN-304` is discoverable
in the project snapshot. The project does have separate curated passports for
PRT-001, PRT-003 and PRT-004; they do not provide evidence for RUN-304. The
static Memory Bank upgrade therefore makes no durable acceptance claim from
that recovery raw evidence.

## Close condition

Publish one curated passport under the applicable protocol evidence directory,
or create an equivalent durable evidence-shelf entry. It must name the exact
commit/branch/environment, scenario or smoke, raw-artifact location, caveats,
verdict and `does_not_prove` boundary, and use the fully qualified run slug
`RUN-304-mb-upgrade-2-16-recovery-dd-tasks`.

## Current disposition

`RUN-304` records this DEF as an open follow-up. RUN-310 reviewed the existing
passport shelf and left this DEF open because its close condition is scoped to
the separate RUN-304 recovery evidence. Runtime/home migration remains
separately governed by `DEF-MBU-RUNTIME-ACTIVE-STATE`.
