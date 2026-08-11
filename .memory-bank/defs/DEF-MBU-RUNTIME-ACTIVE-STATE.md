---
file: '.memory-bank/defs/DEF-MBU-RUNTIME-ACTIVE-STATE.md'
description: 'Отложение по gated runtime/home migration и отсутствующему backup evidence.'
purpose: 'Отделяет безопасный файловый upgrade от миграции runtime/home primary data.'
version: '0.3.0'
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
next_gate_detail: 'supported runtime reconciliation after backup and inactive-state gates'
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

Runtime/home migration не выполнялась. `RUN-309` имеет реальный backup receipt
`/Users/deksden/.dd-flow/backups/RUN-309-mb-upgrade-3-0-0-20260811/`.
`RUN-302` физически архивирован в
`/Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/runs-archive/2026-08-11/RUN-302-linear-workflow-ui-discarded/`;
его старый `dd-flow/flow-run-index@2` не может быть закрыт CLI 0.5.0 через
authority-check и не должен редактироваться вручную в SQLite. `RUN-003`
остаётся historical blocked record. Статический Memory Bank 3.0.0 upgrade не
выдаёт это состояние за применённую runtime/home migration.

## Current Status

- Status: `blocked_by_external_gate`
- Type: `operations_blocker`
- Severity: `high`
- Owner: dd-flow runtime/operations owner
- Opened: 2026-08-04; updated: 2026-08-11
- Review condition: backup/rollback evidence, compatible inactive-state plan и
  post-migration verification доступны через supported CLI.

## Origin and evidence

- Flow/run: `mb-upgrade / RUN-309-mb-upgrade-3-0-0-dd-tasks / 03-upgrade`
- Evidence: `RUN-309/03-preflight/impact-assessment.json`, backup receipt,
  `RUN-309/03-upgrade/migration-report.json` и текущий CLI readback.
- Read-only facts: backup present; archived `RUN-302` retains a stale active
  control-plane row because its legacy authority is unavailable; blocked
  `RUN-003-prt-001-checkpoint-01-foundation-code` remains untouched.
- Target static upgrade: Memory Bank `2.18.0 → 3.0.0` completed; runtime
  primary-data migration remains unapplied.

## Context for follow-up

Backup/rollback receipt уже получен. Следующий gate — поддержанный runtime
reconciliation path для legacy authority и inactive-state; затем штатными
командами выполнить migration plan, migration verify, status и dashboard
checks. Ни один отчёт текущего run не доказывает применение runtime migration.

## User blocker and fixability

- Required user decision: `false` for current static upgrade.
- Can attempt now: `false`; backup есть, но runtime state нельзя фабриковать,
  обходить или редактировать вручную.
- Expected effort: `large`.
- Follow-up protocol: `true` if runtime migration later becomes required.

## Blocking Scope

- Does not block: target file upgrade, manifest, path traceability, local lint and review.
- Blocks: runtime/home primary-data migration and any claim that it was applied.
- Next gate: supported runtime reconciliation after backup/inactive-state gates.
- Close condition: legacy active records are reconciled by supported CLI, plan is
  unblocked, migration verify passes, and post-upgrade status/dashboard checks pass.

## Future-flow rule

Runtime/home, queue/session/lock and dashboard flows must read this DEF, then
`close`, `update` or `not_touched` it with evidence. The run-local copy remains
as execution provenance; this target copy is the durable lookup.
