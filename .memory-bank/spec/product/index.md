---
file: '.memory-bank/spec/product/index.md'
description: 'Подтверждённая продуктовая модель checkpoint-02-core с обязательным приоритетом задачи Low/Medium/High.'
purpose: 'Фиксирует акторов, доменные сущности, разрешения и намеренные non-goals реализованного core slice.'
version: '0.3.0'
date: '2026-08-29'
status: 'ACTIVE'
content_state: 'implemented_core'
canonical_template: '.memory-bank/mbb/spec-layer-guide.md'
c4_level: 'product'
parent: '.memory-bank/spec/index.md'
related_files:
  - README.md
  - apps/api/src/core/service.ts
  - apps/web/src/product/ProductApp.tsx
  - .memory-bank/scenarios/SCN-002-workspace-task-core.md
  - .memory-bank/epics/EP-001-task-management/features/FT-001-task-priority/index.md
  - .memory-bank/protocol/PRT-007-task-priority/summary.md
tags: [dd-tasks, product, checkpoint-02, core, priority]
history:
  - version: '0.3.0'
    date: '2026-08-29'
    changes: 'PRT-007 зафиксировал обязательный приоритет задачи из закрытого набора Low/Medium/High, default Medium и неизменные archive/isolation правила.'
  - version: '0.2.0'
    date: '2026-08-03'
    changes: 'PRT-003 реализовал минимальный account/workspace/project/task slice с owner/member authorization и server-side isolation.'
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Зафиксировано минимальное продуктовое направление исходного checkpoint.'
---

# Продукт

dd-tasks — небольшой командный трекер задач. `checkpoint-02-core` добавляет
минимальный сквозной продуктовый путь: локальная учётная запись и server-side
session, выбор доступного workspace, lifecycle проекта и CRUD задач.

## Акторы и разрешения

- `owner` видит только свои memberships, создаёт workspace, создаёт,
  переименовывает, архивирует и восстанавливает проекты, а также работает с
  задачами;
- `member` видит только свои memberships, читает проекты и создаёт/читает/
  обновляет/удаляет задачи активного проекта;
- non-member не получает подтверждения существования чужого workspace:
  защищённые workspace routes возвращают безопасный `404`.

UI остаётся тонким клиентом; фактическое разрешение всегда повторно проверяет
API по явному `workspaceId`. Архивный проект доступен для чтения и восстановления
owner, но task mutations в нём отвергаются, включая смену приоритета. Авторизованный
актор по-прежнему читает список и видит человекочитаемый текст Low, Medium или High
у каждой задачи.

## Доменные сущности

- account: нормализованный уникальный email и password hash;
- session: opaque token, в БД хранится только hash, есть expiry/revocation;
- workspace и membership с ролью `owner | member`;
- project: имя и `archived_at`;
- task: title, необязательное description и ровно один обязательный приоритет из
  закрытого набора, чьи человекочитаемые метки — Low, Medium и High, внутри
  project/workspace. Список задач проекта показывает этот текст у каждой строки;
  актор не выводит приоритет из машинного токена или только из цвета. Если при
  создании приоритет не выбран, задача сохраняется как Medium; уже существовавшие
  задачи без приоритета получают Medium. Значение вне закрытого набора
  отвергается, сохранённая задача не меняется.

## Не входит в checkpoint

Invitations/membership management, external IdP, recovery/rate limiting,
board/drag-and-drop, status workflow, filters/search, comments/activity,
realtime/offline, AI, CI, deploy и production operations остаются отдельными
будущими решениями.
