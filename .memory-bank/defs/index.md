---
file: '.memory-bank/defs/index.md'
description: 'Индекс долговечных именованных отложений проекта dd-tasks.'
purpose: 'Даёт будущим flow discoverable lookup для известных внешних и follow-up gates.'
version: '0.6.0'
date: '2026-08-12'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/index.md'
children:
  - .memory-bank/defs/DEF-MBU-CANONICAL-COMPATIBILITY-VERSION.md
  - .memory-bank/defs/DEF-MBU-PROTOCOL-EVIDENCE-SHELF.md
  - .memory-bank/defs/DEF-MBU-RUNTIME-ACTIVE-STATE.md
tags: [dd-tasks, deferrals, memory-lifecycle]
---

# Индекс DEF

Эта полка создана в рамках `RUN-299-mb-upgrade-dd-tasks` после review finding
`FIND-MBU-REVIEW-001`. DEF подняты из run-local settlement без дублей, чтобы
обычные `prime`, `plan`, `readiness`, `merge` и последующие runtime flows могли
найти их после завершения RUN.

## История

- `0.6.0` — RUN-310 обновил provenance runtime DEF для static-only перехода
  `3.0.0 → 3.1.0` и подтвердил, что отдельный recovery evidence DEF RUN-304
  остаётся открытым; curated passports PRT-001/003/004 сохранены.

- `0.5.0` — осиротевший `RUN-302` и stale session `RUN-309` штатно
  reconciled CLI; runtime DEF теперь блокируется только отсутствующими явными
  migration units для major-version перехода.
- `0.4.0` — runtime DEF обновлён для `RUN-309` и перехода `2.18.0 → 3.0.0`;
  backup получен, но supported legacy runtime reconciliation пока отсутствует.
- `0.3.0` — runtime active-state DEF обновлён для `RUN-303` и перехода
  `2.15.0 → 2.16.0`; файловый canonical upgrade не блокируется, runtime
  migration остаётся отдельным gate.
- `0.2.0` — canonical compatibility DEF закрыт после release-fix `8cb14de` и
  синхронизации target flow pack.
- `0.1.0` — создан durable lookup для двух RUN-299 deferrals.

## Активный внешний gate

- [Protocol evidence shelf](DEF-MBU-PROTOCOL-EVIDENCE-SHELF.md) — не делать
  durable acceptance claim из raw run-local evidence до публикации паспорта.
- [Runtime active state](DEF-MBU-RUNTIME-ACTIVE-STATE.md) — не начинать
  runtime/home migration до появления supported major-version migration units;
  backup и inactive-state gates уже подтверждены.

## Закрытые

- [Canonical compatibility version](DEF-MBU-CANONICAL-COMPATIBILITY-VERSION.md)
  — закрыт: canonical и target compatibility metadata согласованы на `2.15.0`.

## Правило для будущих flow

При затронутой runtime/home области прочитать active runtime DEF и зафиксировать
одно из: `close`, `update` или `not_touched`. Compatibility DEF остаётся
historical closure evidence и не блокирует последующие flow.
