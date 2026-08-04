---
file: '.memory-bank/defs/DEF-MBU-CANONICAL-COMPATIBILITY-VERSION.md'
description: 'Закрытое отложение по прежнему расхождению canonical compatibility metadata.'
purpose: 'Сохраняет provenance устранённого compatibility gap и доказательство синхронизации target с canonical release-fix.'
version: '0.3.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/defs/index.md'
def_id: 'DEF-MBU-CANONICAL-COMPATIBILITY-VERSION'
def_status: 'closed'
def_type: 'documentation_blocker'
severity: 'medium'
owner: 'canonical Memory Bank maintainer'
next_gate: 'none'
next_gate_detail: 'closed by canonical release-fix 8cb14de and target synchronization'
blocks: []
does_not_block:
  - 'Target Memory Bank file upgrade to 2.15.0.'
  - 'Curated flow-pack manifest validation and local mb-lint.'
related_protocols: []
related_specs:
  - '.memory-bank/dd-flow/compatibility.json'
related_scenarios: []
related_files:
  - '.memory-bank/dd-flow/compatibility.json'
  - '.memory-bank/dd-flow/manifest.json'
tags: [deferral, mb-upgrade, canonical, compatibility, closed]
---

# DEF-MBU-CANONICAL-COMPATIBILITY-VERSION: расхождение canonical version marker

- Owner: canonical Memory Bank maintainer
- Next gate: `none` — deferral закрыт.

## Summary

Canonical commit `8cb14def1b939d38a4cfcd00a20426337e18ede1`
согласовал compatibility marker с Memory Bank `2.15.0` и migration metadata
`2.14.1 → 2.15.0`. Target flow pack обновлён из этого источника; прежнее
расхождение устранено.

## Current Status

- Status: `closed`
- Type: `documentation_blocker`
- Severity: `medium`
- Owner: canonical Memory Bank maintainer
- Opened: 2026-08-04
- Closed: 2026-08-04
- Closure evidence: canonical release-fix `8cb14de`, успешная compatibility
  schema validation и target `dd-flow status` с `compatibility: ok`,
  `drift: same`.

## Origin and evidence

- Flow/run: `mb-upgrade / RUN-299-mb-upgrade-dd-tasks / 03-upgrade`
- Evidence: `02-diff-analysis/mbb-diff.md`,
  `03-upgrade/reports/canonical-layer.md`,
  `03-upgrade/defs/DEF-MBU-CANONICAL-COMPATIBILITY-VERSION.md`
- Canonical correction: `8cb14def1b939d38a4cfcd00a20426337e18ede1`.
- Target readback: project compatibility and release metadata agree on
  `2.15.0`; curated flow source points to the corrected canonical commit.

## Context for follow-up

Compatibility gap закрыт. Run-local и durable DEF сохраняются как historical
provenance; active compatibility, release и manifest files обновлены из
исправленного canonical source.

## User blocker and fixability

- Required user decision: `false`.
- Can attempt now: `not_applicable`; correction complete.
- Expected effort: `complete`.
- Follow-up protocol: `false`.

## Blocking Scope

- Blocks: none.
- Does not block: current или будущие project flows.
- Next gate: none.
- Close condition: satisfied by canonical `8cb14de` and target validation.

## Future-flow rule

Использовать этот DEF только как historical closure evidence. Новое
compatibility-расхождение должно получить отдельный DEF или явное обновление
статуса с новыми evidence.
