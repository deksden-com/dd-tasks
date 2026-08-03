---
file: '.memory-bank/protocol/index.md'
description: 'Curated протоколы работ проекта.'
purpose: 'Сохраняет долговечные следы инициализации и дальнейших работ, включая pre-CODE handoff.'
version: '0.8.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/index.md'
children:
  - .memory-bank/protocol/PRT-2026-08-01-mb-init/index.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/index.md
tags: [protocol]
history:
  - version: '0.8.0'
    date: '2026-08-03'
    changes: 'PRT-003 CODE реализован по PLAN-003; SCN-002/readiness evidence готовы к canonical merge closure в том же поручении.'
  - version: '0.7.0'
    date: '2026-08-03'
    changes: 'PRT-003 runtime registration восстановлена штатным исправленным engine 0.4.0; RUN-298 завершён как ready_for_code, RUN-297 degraded сохранён как исторический audit trail.'
  - version: '0.6.0'
    date: '2026-08-02'
    changes: 'Для checkpoint-01 создан RUN-005 fallback merge recovery: scoped direct tag/push fixation разрешена пользователем из-за CLI 0.4.0 queue defect; queue cancelled evidence сохраняется.'
  - version: '0.5.0'
    date: '2026-08-02'
    changes: 'Checkpoint-01 foundation fast-forward integrated into main; tag/push remain an exact user gate because source policy does not define later names/targets.'
  - version: '0.4.0'
    date: '2026-08-02'
    changes: 'Checkpoint-01 foundation readiness accepted locally; canonical merge remains the next flow gate.'
  - version: '0.3.0'
    date: '2026-08-01'
    changes: 'Обновлена навигация после завершённой specify стадии; следующий gate — plan.'
  - version: '0.2.0'
    date: '2026-08-01'
    changes: 'Добавлен протокол checkpoint-01-foundation до стадии specify.'
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Добавлен протокол инициализации.'
---

# Протоколы

- [Инициализация Банка памяти](PRT-2026-08-01-mb-init/index.md)
- [Checkpoint-01 Foundation](PRT-001-checkpoint-01-foundation/index.md): foundation implementation, readiness и local main integration приняты; RUN-005 ведёт user-authorized direct fixation с tag `checkpoint-01-foundation` и targets `origin/main`/`origin`.
- [Checkpoint-02 Core](PRT-003-checkpoint-02-core/index.md): RUN-298 реализовал
  PLAN-003 и принял local SCN-002 readiness; следующий контур — canonical merge
  closure, исторический RUN-297 degraded сохранён без изменений.
