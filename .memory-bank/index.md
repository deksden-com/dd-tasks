---
file: '.memory-bank/index.md'
description: 'Рабочий вход в Банк памяти проекта dd-tasks.'
purpose: 'Фиксирует подтверждённое состояние проекта на текущем Git-снимке.'
version: '0.9.0'
date: '2026-08-04'
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
  - .memory-bank/defs/index.md
memory_bank_version: '2.15.0'
initialization_status: 'initialized_published'
tags: [dd-tasks, memory-bank]
history:
  - version: '0.9.0'
    date: '2026-08-04'
    changes: 'Canonical release-fix 8cb14de синхронизирован; compatibility DEF закрыт после schema/status readback, curated flow-pack source обновлён.'
  - version: '0.8.0'
    date: '2026-08-04'
    changes: 'По user-directed follow-up compatibility marker и migration metadata выровнены с фактическим Memory Bank 2.15.0; upstream canonical discrepancy оставлена отдельным DEF.'
  - version: '0.7.0'
    date: '2026-08-04'
    changes: 'После 05-review два существующих upgrade DEF подняты в durable defs shelf и добавлены в активную навигацию; дублей не создано.'
  - version: '0.6.0'
    date: '2026-08-04'
    changes: 'Канонический MBB и curated dd-flow pack обновлены до Memory Bank 2.15.0; project-owned knowledge сохранено.'
  - version: '0.5.0'
    date: '2026-08-03'
    changes: 'Checkpoint-02 core fast-forward интегрирован в local stable main, post-merge SCN-002/quality проверены, annotated local fixation checkpoint-02-core закрывает snapshot.'
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

Канонический релиз Банка памяти: `2.15.0`. Curated project flow pack
происходит из canonical commit `8cb14def1b939d38a4cfcd00a20426337e18ede1`;
canonical-only entrypoints запускаются только из canonical checkout.

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
- [Индекс именованных отложений](defs/index.md)
- [Канон MBB](mbb/index.md)

Foundation history и annotated `checkpoint-01-foundation` не переписываются.
PRT-003/RUN-298 приняли CODE/readiness; implementation content `5027fa1`
fast-forward интегрирован в local stable `main`, post-merge gates green и
annotated local tag `checkpoint-02-core` фиксирует closure commit. Remote
delivery, CI и deploy не заявляются. `.tasks` остаётся игнорируемой рабочей зоной.
