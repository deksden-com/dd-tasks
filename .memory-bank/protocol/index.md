---
file: '.memory-bank/protocol/index.md'
description: 'Curated протоколы работ проекта.'
purpose: 'Сохраняет долговечные следы инициализации и дальнейших работ, включая pre-CODE handoff.'
version: '1.5.0'
date: '2026-08-12'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/index.md'
children:
  - .memory-bank/protocol/PRT-2026-08-01-mb-init/index.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/index.md
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/index.md
  - .memory-bank/protocol/PRT-005-linear-workflow-ui/index.md
  - .memory-bank/protocol/PRT-006-preview-access-policy/index.md
tags: [protocol]
history:
  - version: '1.5.0'
    date: '2026-08-12'
    changes: 'RUN-310 проверил curated verification passports и сохранил отдельные границы protocol-evidence и runtime/home migration; активные DEF остаются discoverable.'
  - version: '1.4.0'
    date: '2026-08-11'
    changes: 'PRT-005/PRT-006 закрыты после интеграции; checkpoint-03 опубликован и его public+closed Exe.dev preview подтверждён readback.'
  - version: '1.3.0'
    date: '2026-08-05'
    changes: 'PRT-006 прошёл CODE/readiness и передан в canonical merge с clean source-package evidence; merge, immutable checkpoint и Exe.dev live deploy остаются отдельными воротами.'
  - version: '1.2.0'
    date: '2026-08-05'
    changes: 'Добавлен plan-ready PRT-006 для независимых preview visibility и registration mode с безопасной decision matrix.'
  - version: '1.1.0'
    date: '2026-08-05'
    changes: 'Добавлен PRT-005 для исправления project/task interaction model и компактного Linear-подобного UI.'
  - version: '1.0.0'
    date: '2026-08-04'
    changes: 'Добавлен PRT-004 для Exe.dev preview runtime, operational policies/runbook и отдельного deploy handoff.'
  - version: '0.9.0'
    date: '2026-08-03'
    changes: 'PRT-003 canonical local merge, post-merge verification и annotated checkpoint-02-core fixation приняты; remote publish не выполнялся по local-only route.'
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
  PLAN-003, принял SCN-002 readiness и canonical local main merge; annotated tag
  `checkpoint-02-core` фиксирует local snapshot. RUN-297 degraded сохранён.
- [Exe preview runtime](PRT-004-exe-preview-runtime/index.md): source protocol
  для environment/deploy/access policies, runtime packaging, operator runbook и
  SCN-003; фактическая Exe.dev mutation остаётся отдельным `deploy.md` flow.
- [Linear workflow UI](PRT-005-linear-workflow-ui/index.md): нормализует
  создание и редактирование проектов, добавляет task detail route и доступные
  rename/delete interactions без новых backend-контрактов; интегрирован в
  `main` коммитом `a394286` и входит в checkpoint-03.
- [Preview access policy](PRT-006-preview-access-policy/index.md): задаёт
  независимые deploy-параметры private/public visibility и open/closed
  registration, безопасные defaults, readback и границу `public + open`;
  интегрирован и публично развёрнут как checkpoint-03 в режиме `public+closed`.

## Evidence и активные отложения

Curated verification passports находятся внутри соответствующих protocol trees:
[PRT-001](PRT-001-checkpoint-01-foundation/evidence/verification-passport.md),
[PRT-003](PRT-003-checkpoint-02-core/evidence/verification-passport.md) и
[PRT-004](PRT-004-exe-preview-runtime/evidence/verification-passport.md).
Они доказывают только заявленные local/source-package контуры и не заменяют
provider, runtime/home или чужой RUN evidence.

- [DEF-MBU-PROTOCOL-EVIDENCE-SHELF](../defs/DEF-MBU-PROTOCOL-EVIDENCE-SHELF.md)
  остаётся открытым для отдельного recovery passport RUN-304.
- [DEF-MBU-RUNTIME-ACTIVE-STATE](../defs/DEF-MBU-RUNTIME-ACTIVE-STATE.md)
  запрещает объявлять runtime/home primary-data migration применённой без
  supported migration units и post-migration verification.
