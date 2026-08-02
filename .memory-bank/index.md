---
file: '.memory-bank/index.md'
description: 'Рабочий вход в Банк памяти проекта dd-tasks.'
purpose: 'Фиксирует подтверждённое состояние проекта на текущем Git-снимке.'
version: '0.2.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'project'
parent: null
children:
  - .memory-bank/structure.md
  - .memory-bank/project-policy.md
  - .memory-bank/spec/index.md
  - .memory-bank/plans/index.md
  - .memory-bank/scenarios/index.md
  - .memory-bank/protocol/index.md
memory_bank_version: '2.14.1'
initialization_status: 'initialized_published'
tags: [dd-tasks, memory-bank]
history:
  - version: '0.2.0'
    date: '2026-08-02'
    changes: 'Добавлена source-backed карта foundation branch, canonical SCN-001 и readiness evidence navigation; product behavior остаётся out of scope.'
  - version: '0.1.1'
    date: '2026-08-01'
    changes: 'Инициализация принята и опубликована в main.'
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Создана начальная карта checkpoint-00-initial.'
---

# Банк памяти dd-tasks

dd-tasks — будущий небольшой командный трекер задач. Базовый `checkpoint-00-initial`
был нулевым; текущая feature branch материализует только technical foundation:
workspace, API/data/web boundaries, tooling и local verification contour. Product
entities и task-tracker behavior по-прежнему не реализованы.

- [Карта структуры](structure.md)
- [Политика проекта](project-policy.md)
- [Полка спецификаций](spec/)
- [Плановое направление](plans/index.md)
- [Сценарии](scenarios/index.md)
- [Полка протоколов](protocol/)
- [Канон MBB](mbb/index.md)

Инициализация принята и опубликована в main; foundation protocol ведётся в
feature worktree до canonical merge/fixation. `.tasks` остаётся игнорируемой
рабочей зоной.
