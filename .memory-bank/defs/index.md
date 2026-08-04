---
file: '.memory-bank/defs/index.md'
description: 'Индекс долговечных именованных отложений проекта dd-tasks.'
purpose: 'Даёт будущим flow discoverable lookup для известных внешних и follow-up gates.'
version: '0.1.0'
date: '2026-08-04'
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
`FIND-MBU-REVIEW-001`. Оба DEF уже существовали в run-local settlement; здесь
они подняты без дублей, чтобы обычные `prime`, `plan`, `readiness`, `merge` и
последующие runtime/compatibility flows могли найти их после завершения RUN.

## Внешний gate / follow-up

- [Canonical compatibility version](DEF-MBU-CANONICAL-COMPATIBILITY-VERSION.md)
  — согласовать authoritative canonical compatibility marker.
- [Runtime active state](DEF-MBU-RUNTIME-ACTIVE-STATE.md) — не начинать
  runtime/home migration до backup, inactive-state и supported verification gates.

## Правило для будущих flow

При затронутой compatibility или runtime/home области прочитать оба DEF и
зафиксировать одно из: `close`, `update` или `not_touched`. Текущий
documentation-only Memory Bank upgrade и local lint не блокируются этими DEF;
они блокируют только указанные follow-up contours.
