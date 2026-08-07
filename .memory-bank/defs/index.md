---
file: '.memory-bank/defs/index.md'
description: 'Индекс долговечных именованных отложений проекта dd-tasks.'
purpose: 'Даёт будущим flow discoverable lookup для известных внешних и follow-up gates.'
version: '0.3.0'
date: '2026-08-07'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/index.md'
children:
  - .memory-bank/defs/DEF-MBU-CANONICAL-COMPATIBILITY-VERSION.md
  - .memory-bank/defs/DEF-MBU-RUNTIME-ACTIVE-STATE.md
tags: [dd-tasks, deferrals, memory-lifecycle]
---

# Индекс DEF

Эта полка создана в рамках `RUN-299-mb-upgrade-dd-tasks` после review finding
`FIND-MBU-REVIEW-001`. DEF подняты из run-local settlement без дублей, чтобы
обычные `prime`, `plan`, `readiness`, `merge` и последующие runtime flows могли
найти их после завершения RUN.

## История

- `0.3.0` — runtime active-state DEF обновлён для `RUN-303` и перехода
  `2.15.0 → 2.16.0`; файловый canonical upgrade не блокируется, runtime
  migration остаётся отдельным gate.
- `0.2.0` — canonical compatibility DEF закрыт после release-fix `8cb14de` и
  синхронизации target flow pack.
- `0.1.0` — создан durable lookup для двух RUN-299 deferrals.

## Активный внешний gate

- [Runtime active state](DEF-MBU-RUNTIME-ACTIVE-STATE.md) — не начинать
  runtime/home migration до backup, inactive-state и supported verification gates;
  для `RUN-303` migration report остаётся blocked.

## Закрытые

- [Canonical compatibility version](DEF-MBU-CANONICAL-COMPATIBILITY-VERSION.md)
  — закрыт: canonical и target compatibility metadata согласованы на `2.15.0`.

## Правило для будущих flow

При затронутой runtime/home области прочитать active runtime DEF и зафиксировать
одно из: `close`, `update` или `not_touched`. Compatibility DEF остаётся
historical closure evidence и не блокирует последующие flow.
