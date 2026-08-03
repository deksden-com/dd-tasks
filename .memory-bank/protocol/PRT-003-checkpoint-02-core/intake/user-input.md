---
file: '.memory-bank/protocol/PRT-003-checkpoint-02-core/intake/user-input.md'
description: 'Нормализованный вход пользователя для checkpoint-02-core.'
purpose: 'Сохраняет scope, non-goals, lifecycle boundary и запрет на переход в CODE.'
version: '0.1.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/protocol/PRT-003-checkpoint-02-core/index.md'
tags: [protocol, intake, checkpoint-02, source-user-input]
---

# User input — checkpoint-02-core

Источник: delegated user prompt текущей harness-сессии, `source_thread_id=019fb9e5-2ecd-79e0-b5a3-2f9d9aac1624`.

## Обязательные действия

- Работать с устойчивым проектным корнем `/Users/deksden/Documents/_Projects/dd-tasks`.
- Выполнить полное priming по `.memory-bank/dd-flow/prime.md` и его маршрутам.
- Исследовать Git, checkpoint refs, runtime dd-flow, PRT-001/RUN-001..005, Memory Bank и все текущие code/API/web/DB/tests/operations contours.
- Канонически выделить и зарегистрировать следующий protocol/worktree, затем выполнить SPECIFY и PLAN в этом порядке.
- Использовать штатные dd-flow RUN/stage/report/schema/runtime операции; runtime state вручную не редактировать.

## Scope checkpoint-02-core

- accounts и server-side sessions;
- workspaces и переключение;
- owner/member membership authorization;
- projects: create, rename, archive, restore, list;
- basic task CRUD внутри проекта;
- PostgreSQL/Drizzle migrations и deterministic demo/test data;
- минимальные product routes/screens;
- API-enforced workspace isolation;
- applicable unit/integration/Playwright acceptance.

## Non-goals

Board/drag-and-drop, advanced filters/search, comments/activity, full conflict UX, AI, CI/deploy/production и любые readiness/merge/tag/push/deploy действия в этой сессии.

## Stop boundary

После source-backed SPECIFY, принятого PLAN и готового CODE handoff остановиться на pre-CODE стадии. Не начинать реализацию продуктовых исходников. Не двигать и не переписывать tag `checkpoint-01-foundation`; presentation gap PRT-001 фиксировать честно и не подменять runtime.
