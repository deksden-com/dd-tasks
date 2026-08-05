---
file: '.memory-bank/scenarios/index.md'
description: 'Канонический индекс исполняемых сценариев проекта.'
purpose: 'Связывает acceptance scenarios с протоколами, матрицей проверки и durable evidence.'
version: '0.3.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/index.md'
children:
  - .memory-bank/scenarios/SCN-001-foundation-acceptance.md
  - .memory-bank/scenarios/SCN-002-workspace-task-core.md
  - .memory-bank/scenarios/SCN-003-private-preview-runtime.md
  - .memory-bank/scenarios/SCN-003-exe-private-preview.md
tags: [dd-tasks, scenarios, verification, foundation, checkpoint-02, preview]
history:
  - version: '0.3.0'
    date: '2026-08-04'
    changes: 'Добавлен SCN-003 для private disposable preview runtime с отдельными source/live evidence rows.'
  - version: '0.2.0'
    date: '2026-08-03'
    changes: 'Добавлен canonical SCN-002 для account/workspace/project/task core.'
---

# Сценарии

- [SCN-001 Foundation acceptance](SCN-001-foundation-acceptance.md) — локальный
  six-phase acceptance contour технического foundation, без product/task-tracker
  поведения.
- [SCN-002 Workspace task core](SCN-002-workspace-task-core.md) — локальный
  account/session, workspace isolation, project lifecycle и task CRUD contour.
- [SCN-003 Private preview runtime](SCN-003-private-preview-runtime.md) —
  built one-port Hono/Vite + internal PostgreSQL, guarded data lifecycle,
  readiness, API/browser isolation and exact cleanup; live Exe.dev proof remains
  pending.
- [SCN-003 accepted-plan compatibility route](SCN-003-exe-private-preview.md) —
  preserves the evidence path named by PLAN-004 and points to the canonical
  scenario above.
