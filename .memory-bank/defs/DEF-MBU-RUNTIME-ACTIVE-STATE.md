---
file: '.memory-bank/defs/DEF-MBU-RUNTIME-ACTIVE-STATE.md'
description: 'Отложение по gated runtime/home migration и отсутствующему backup evidence.'
purpose: 'Отделяет безопасный файловый upgrade от миграции runtime/home primary data.'
version: '0.1.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/defs/index.md'
def_id: 'DEF-MBU-RUNTIME-ACTIVE-STATE'
def_status: 'blocked_by_external_gate'
def_type: 'operations_blocker'
severity: 'high'
owner: 'dd-flow runtime/operations owner'
next_gate: 'plan'
next_gate_detail: 'runtime/home migration follow-up after backup and inactive-state gates'
blocks:
  - 'Любую runtime/home primary-data migration между контрактами.'
  - 'Migration verification, зависящую от backup и неактивного runtime state.'
does_not_block:
  - 'Документационный canonical-layer upgrade.'
  - 'Manifest, path traceability, local mb-lint и review.'
related_protocols: []
related_specs:
  - '.memory-bank/dd-flow/common/runtime-cli.md'
related_scenarios: []
related_files:
  - '.memory-bank/dd-flow/common/runtime-cli.md'
tags: [deferral, mb-upgrade, runtime, backup, operations]
---

# DEF-MBU-RUNTIME-ACTIVE-STATE: runtime/home migration boundary

- Owner: dd-flow runtime/operations owner
- Next gate: `plan` — runtime/home migration follow-up after backup and
  inactive-state gates.

## Summary

Runtime/home migration не выполнялась. `03-upgrade/migration-report.json`
содержит `migration.status: blocked`, поскольку backup evidence отсутствует,
текущий `RUN-299` активен, а исторический `RUN-003` остаётся blocked. Это
отдельный operations contour; runtime JSON/SQLite вручную не менялись.

## Current Status

- Status: `blocked_by_external_gate`
- Type: `operations_blocker`
- Severity: `high`
- Owner: dd-flow runtime/operations owner
- Opened: 2026-08-04
- Review condition: backup/rollback evidence, compatible inactive-state plan и
  post-migration verification доступны через supported CLI.

## Origin and evidence

- Flow/run: `mb-upgrade / RUN-299-mb-upgrade-dd-tasks / 03-upgrade`
- Evidence: `01-preflight/report.md`, `03-upgrade/migration-report.json`,
  `03-upgrade/defs/DEF-MBU-RUNTIME-ACTIVE-STATE.md`
- Read-only facts: `backup.status: missing`; active state includes `RUN-299`
  and blocked `RUN-003-prt-001-checkpoint-01-foundation-code`.

## Context for follow-up

Сначала получить backup/rollback receipt и разрешить active/blocked runtime
state; затем штатными командами заново выполнить migration plan, migration
verify, status и dashboard checks. Ни один отчёт текущего run не доказывает
применение runtime migration.

## User blocker and fixability

- Required user decision: `false` for current documentation-only upgrade.
- Can attempt now: `false`; backup и runtime state нельзя фабриковать или обходить.
- Expected effort: `large`.
- Follow-up protocol: `true` if runtime migration later becomes required.

## Blocking Scope

- Does not block: target file upgrade, manifest, path sweep, local lint and review.
- Blocks: runtime/home primary-data migration and any claim that it was applied.
- Next gate: runtime migration plan after backup/inactive-state gates.
- Close condition: supported plan unblocked, backup/rollback evidence recorded,
  migration verify passes, and post-upgrade status/dashboard checks pass.

## Future-flow rule

Runtime/home, queue/session/lock and dashboard flows must read this DEF, then
`close`, `update` or `not_touched` it with evidence. The run-local copy remains
as execution provenance; this target copy is the durable lookup.
