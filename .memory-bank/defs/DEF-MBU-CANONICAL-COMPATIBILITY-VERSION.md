---
file: '.memory-bank/defs/DEF-MBU-CANONICAL-COMPATIBILITY-VERSION.md'
description: 'Отложение по несогласованному version marker в canonical compatibility metadata.'
purpose: 'Не допустить механического переписывания canonical compatibility.json без решения владельца канона.'
version: '0.1.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/defs/index.md'
def_id: 'DEF-MBU-CANONICAL-COMPATIBILITY-VERSION'
def_status: 'blocked_by_external_gate'
def_type: 'documentation_blocker'
severity: 'medium'
owner: 'canonical Memory Bank maintainer'
next_gate: 'plan'
next_gate_detail: 'canonical compatibility maintenance follow-up'
blocks:
  - 'Authoritative canonical compatibility/version consistency.'
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
tags: [deferral, mb-upgrade, canonical, compatibility]
---

# DEF-MBU-CANONICAL-COMPATIBILITY-VERSION: расхождение canonical version marker

- Owner: canonical Memory Bank maintainer
- Next gate: `plan` — canonical compatibility maintenance follow-up.

## Summary

В canonical checkout `VERSION`, resolver и root/MBB release markers указывают
на `2.15.0`, а `.memory-bank/dd-flow/compatibility.json` содержит
`memory_bank_version: 2.11.1` и migration metadata `2.11.0 → 2.11.1`.
Target получил canonical compatibility file без blind rewrite; authoritative
source должен быть согласован владельцем канона.

## Current Status

- Status: `blocked_by_external_gate`
- Type: `documentation_blocker`
- Severity: `medium`
- Owner: canonical Memory Bank maintainer
- Opened: 2026-08-04
- Review condition: canonical compatibility contract reconciled and released,
  либо legacy-marker semantics явно документированы.

## Origin and evidence

- Flow/run: `mb-upgrade / RUN-299-mb-upgrade-dd-tasks / 03-upgrade`
- Evidence: `02-diff-analysis/mbb-diff.md`,
  `03-upgrade/reports/canonical-layer.md`,
  `03-upgrade/defs/DEF-MBU-CANONICAL-COMPATIBILITY-VERSION.md`
- Read-only check: `dd-flow status --project-root <project> --json` returned
  CLI/engine compatibility `ok`, while canonical release and compatibility
  markers disagree.

## Context for follow-up

Механическая замена в target не разрешена: файл принадлежит canonical source
ownership. После canonical maintenance повторить resolver, compatibility schema,
`dd-flow status` и target flow-pack/lint readback.

## User blocker and fixability

- Required user decision: `false` for current target-only upgrade.
- Can attempt now: `false` in this project; requires canonical owner follow-up.
- Expected effort: `medium`.
- Follow-up protocol: `true` in canonical repository.

## Blocking Scope

- Does not block: current target file upgrade, local lint, review and local merge.
- Blocks: compatibility closure and any future runtime flow relying on this
  marker as authoritative.
- Next gate: canonical maintenance plan/review.
- Close condition: one documented canonical authoritative version (or explicit
  legacy meaning) and consistent status/schema readback.

## Future-flow rule

Compatibility/engine flows must read this DEF, then `close`, `update` or
`not_touched` it with evidence. The run-local copy is retained as provenance;
this target copy is the durable lookup.
