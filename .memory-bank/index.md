---
file: '.memory-bank/index.md'
description: 'Рабочий вход в Банк памяти проекта dd-tasks.'
purpose: 'Фиксирует подтверждённое состояние проекта на текущем Git-снимке.'
version: '0.4.0'
date: '2026-08-03'
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
  - version: '0.4.0'
    date: '2026-08-03'
    changes: 'Checkpoint-02 materialized account/workspace/project/task core, SCN-002 и local readiness evidence; canonical merge closure следует в том же поручении.'
  - version: '0.3.0'
    date: '2026-08-02'
    changes: 'Зафиксирован user-authorized degraded direct fixation contour для checkpoint-01: tag/push targets заданы явно, а exact post-push readback ведётся в RUN-005; queue defect и отсутствие remote verification до push раскрыты.'
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

dd-tasks — небольшой командный трекер задач. После нулевого checkpoint и
technical foundation текущий `checkpoint-02-core` реализует account/session,
workspace owner/member isolation, project lifecycle и basic task CRUD вместе с
deterministic local acceptance.

- [Карта структуры](structure.md)
- [Политика проекта](project-policy.md)
- [Полка спецификаций](spec/)
- [Плановое направление](plans/index.md)
- [Сценарии](scenarios/index.md)
- [Полка протоколов](protocol/)
- [Канон MBB](mbb/index.md)

Foundation history и annotated `checkpoint-01-foundation` не переписываются.
PRT-003/RUN-298 приняли local CODE/readiness и переходят в canonical local main
merge; remote delivery, CI и deploy не заявляются. `.tasks` остаётся игнорируемой
рабочей зоной.
