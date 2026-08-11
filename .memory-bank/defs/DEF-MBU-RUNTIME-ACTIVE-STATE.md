---
file: '.memory-bank/defs/DEF-MBU-RUNTIME-ACTIVE-STATE.md'
description: 'Отложение по gated runtime/home migration после полученного backup evidence.'
purpose: 'Отделяет безопасный файловый upgrade от миграции runtime/home primary data.'
version: '0.5.0'
date: '2026-08-11'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/defs/index.md'
def_id: 'DEF-MBU-RUNTIME-ACTIVE-STATE'
def_status: 'blocked_by_external_gate'
def_type: 'operations_blocker'
severity: 'high'
owner: 'dd-flow runtime/operations owner'
next_gate: 'plan'
next_gate_detail: 'explicit supported major-version runtime migration units'
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
history:
  - version: '0.5.0'
    date: '2026-08-11'
    changes: 'CLI cleanup штатно перевёл осиротевший RUN-302 в discarded и закрыл stale RUN-309 session; inactive-state gate снят, остаётся отсутствие major-version migration units.'
  - version: '0.4.0'
    date: '2026-08-11'
    changes: 'Описание согласовано с фактом: backup получен, blocker ограничен отсутствующим supported legacy runtime reconciliation.'
---

# DEF-MBU-RUNTIME-ACTIVE-STATE: runtime/home migration boundary

- Owner: dd-flow runtime/operations owner
- Next gate: `plan` — runtime/home migration follow-up после появления явных
  migration units для major-version перехода.

## Summary

Runtime/home migration не выполнялась. `RUN-309` имеет реальный backup receipt
`/Users/deksden/.dd-flow/backups/RUN-309-mb-upgrade-3-0-0-20260811/`.
`RUN-302` физически архивирован, а его осиротевшая control-plane строка штатно
переведена `dd-flow cleanup apply` в `discarded`; stale orchestrator-session
`RUN-309` также закрыта. `RUN-003` остаётся terminal historical blocked record и
не считается активным runtime state. Статический Memory Bank 3.0.0 upgrade не
выдаёт это состояние за применённую runtime/home migration: свежий migration
plan всё ещё блокируется отсутствием явных migration units для major-version
перехода `2.18.0 → 3.0.0`.

## Current Status

- Status: `blocked_by_external_gate`
- Type: `operations_blocker`
- Severity: `high`
- Owner: dd-flow runtime/operations owner
- Opened: 2026-08-04; updated: 2026-08-11
- Review condition: explicit major-version migration units и post-migration
  verification доступны через supported CLI.

## Origin and evidence

- Flow/run: `mb-upgrade / RUN-309-mb-upgrade-3-0-0-dd-tasks / 03-upgrade`
- Evidence: `RUN-309/03-preflight/impact-assessment.json`, backup receipt,
  `RUN-309/03-upgrade/migration-report.json` и текущий CLI readback.
- Read-only facts: backup present; `RUN-302` is `discarded`; `RUN-309` session is
  `stopped`; blocked `RUN-003-prt-001-checkpoint-01-foundation-code` remains
  untouched as terminal history.
- Target static upgrade: Memory Bank `2.18.0 → 3.0.0` completed; runtime
  primary-data migration remains unapplied.

## Context for follow-up

Backup/rollback receipt уже получен, legacy authority и inactive-state
reconciled штатным CLI. Следующий gate — explicit supported migration units для
major-version перехода; затем штатными командами выполнить migration plan,
migration verify, status и dashboard checks. Ни один отчёт текущего run не
доказывает применение runtime migration.

## User blocker and fixability

- Required user decision: `false` for current static upgrade.
- Can attempt now: `false`; backup и inactive state готовы, но migration units
  для major-version перехода отсутствуют.
- Expected effort: `large`.
- Follow-up protocol: `true` if runtime migration later becomes required.

## Blocking Scope

- Does not block: target file upgrade, manifest, path traceability, local lint and review.
- Blocks: runtime/home primary-data migration and any claim that it was applied.
- Next gate: explicit supported major-version runtime migration units.
- Close condition: migration plan is unblocked, migration verify passes, and
  post-upgrade status/dashboard checks pass.

## Future-flow rule

Runtime/home, queue/session/lock and dashboard flows must read this DEF, then
`close`, `update` or `not_touched` it with evidence. The run-local copy remains
as execution provenance; this target copy is the durable lookup.
