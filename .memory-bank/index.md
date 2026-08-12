---
file: '.memory-bank/index.md'
description: 'Рабочий вход в Банк памяти проекта dd-tasks.'
purpose: 'Фиксирует подтверждённое состояние проекта на текущем Git-снимке.'
version: '1.6.0'
date: '2026-08-12'
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
memory_bank_version: '3.1.0'
initialization_status: 'initialized_published'
tags: [dd-tasks, memory-bank]
history:
  - version: '1.6.0'
    date: '2026-08-12'
    changes: 'Canonical Memory Bank 3.1.0 и curated flow pack provenance обновлены до source commit 6cfaeaa; SPC-006/flow-contract@6 добавлены в активную навигацию, runtime/home migration остаётся отдельным gated follow-up.'
  - version: '1.5.0'
    date: '2026-08-11'
    changes: 'Актуализированы PRT-005/PRT-006, checkpoint-03 и публичный Exe.dev preview; удалено устаревшее утверждение об отсутствии remote delivery/deploy.'
  - version: '1.4.0'
    date: '2026-08-11'
    changes: 'Canonical Memory Bank 3.0.0 синхронизирован; breaking runtime/stage lifecycle и single-source PLAN contracts, path-migration archive и curated flow-pack обновлены, RUN-302 архивирован; runtime/home migration остаётся отдельным gated follow-up.'
  - version: '1.3.0'
    date: '2026-08-10'
    changes: 'Canonical Memory Bank 2.18.0 синхронизирован; local-first specify/plan routing и compact execution/report contracts обновлены, project-owned knowledge сохранено.'
  - version: '1.2.0'
    date: '2026-08-09'
    changes: 'Canonical Memory Bank 2.17.1 синхронизирован; linked-CLI registry/artifact reconciliation добавлен в release gate, project-owned knowledge сохранено.'
  - version: '1.1.0'
    date: '2026-08-08'
    changes: 'Canonical Memory Bank 2.17.0 синхронизирован; compatibility marker, adjacent migration window и flow-pack provenance выровнены с каноном.'
  - version: '1.0.0'
    date: '2026-08-07'
    changes: 'Canonical Memory Bank 2.16.0 синхронизирован; compatibility marker, adjacent migration window и flow-pack provenance обновлены единым upgrade-пакетом.'
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

Канонический релиз Банка памяти: `3.1.0`. Curated project flow pack
происходит из canonical commit
`6cfaeaa4d4c9c4a5d2b932cb92370dbfd1464bf6`;
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
- [Активный dd-flow pack](dd-flow/README.md): `flow-contract@6`, CLI/engine
  `0.6.0` и CLI-owned stage bootstrap/context-packet semantics.
- [SPC-006 stage bootstrap/context packet](spec/engineering/SPC-006-stage-bootstrap-and-context-packet.md)
  — project-facing engineering contract for the 3.1 flow release.

Foundation history и annotated `checkpoint-01-foundation` не переписываются.
PRT-003/RUN-298 приняли CODE/readiness; implementation content `5027fa1`
fast-forward интегрирован в stable `main`, post-merge gates green и annotated
tag `checkpoint-02-core` фиксирует closure commit. PRT-005 и PRT-006 также
интегрированы; annotated tag `checkpoint-03-preview-access-policy` указывает на
deployed commit `15021169f90245c6d9254488b8a3ba0621b5bc07`. Публичный preview
`https://ddtasks-cp02.exe.xyz/` отдаёт этот source revision и работает с
`registration_mode=closed`. CI/CD и production не заявляются. `.tasks` остаётся
игнорируемой рабочей зоной.
