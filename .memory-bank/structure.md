---
file: '.memory-bank/structure.md'
description: 'Карта разделов и текущей плотности знаний.'
purpose: 'Объясняет, где живёт подтверждённая проектная истина.'
version: '1.0.0'
date: '2026-08-12'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/index.md'
tags: [dd-tasks, structure]
history:
  - version: '1.1.0'
    date: '2026-08-13'
    changes: 'Отражены canonical MBB/curated flow pack 3.2.0, source commit 2a1aaec, target-driven engine routing, explicit storage migration safety, immutable RUN bindings и schema registry; project-owned shelves и архивная история сохранены.'
  - version: '1.0.0'
    date: '2026-08-12'
    changes: 'Отражены canonical MBB/curated flow pack 3.1.0, source commit 6cfaeaa, flow-contract@6 и SPC-006; project-owned shelves и архивная история сохранены.'
  - version: '0.9.0'
    date: '2026-08-11'
    changes: 'Отражены canonical MBB и curated flow-pack 3.0.0, breaking runtime/stage lifecycle и single-source PLAN contracts; прежние слои сохранены в upgrade archive.'
  - version: '0.8.0'
    date: '2026-08-10'
    changes: 'Отражены canonical MBB 2.18.0, flow-pack provenance и local-first specify/plan routing; project-owned shelves сохранены.'
  - version: '0.7.0'
    date: '2026-08-09'
    changes: 'Отражены canonical MBB 2.17.1, flow-pack provenance и linked-CLI release reconciliation; project-owned shelves сохранены.'
  - version: '0.6.0'
    date: '2026-08-08'
    changes: 'Отражены canonical MBB 2.17.0, flow-pack provenance и новые schema/eval contracts; project-owned shelves сохранены.'
  - version: '0.5.0'
    date: '2026-08-07'
    changes: 'Отражены canonical MBB 2.16.0, flow-pack provenance и новые flow flags/observability/subagent-routing support files.'
  - version: '0.4.1'
    date: '2026-08-04'
    changes: 'Curated flow-pack source reference выровнен с canonical release-fix 8cb14de.'
  - version: '0.4.0'
    date: '2026-08-04'
    changes: 'После 05-review materialized durable defs shelf для двух внешних upgrade gates; navigation и ownership обновлены.'
  - version: '0.3.0'
    date: '2026-08-04'
    changes: 'Отражены canonical MBB 2.15.0 и curated project flow pack; optional пустые shelves по-прежнему не создаются.'
  - version: '0.2.0'
    date: '2026-08-02'
    changes: 'Отражены materialized foundation shelves, SCN-001 и readiness evidence contour.'
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Создана карта исходного checkpoint.'
---

# Структура Банка памяти

Активные полки: spec/product, spec/system, spec/engineering, spec/operations,
plans, scenarios, protocol и defs. Foundation facts живут в source-backed spec и
protocol documents; product shelf остаётся намеренно пустым от product behavior.

adr, evidence, ui, guides, skills и archive существуют как канонические
полки и получают документы только при самостоятельном подтверждении. `defs`
материализована для двух source-backed external gates из `RUN-299`; для
foundation создан один canonical scenario; raw run artifacts не подменяют
Memory Bank truth.

mbb — копия MBB 3.2.0. dd-flow — curated project-local pack из canonical
commit `2a1aaec84ee7d62b9f5a6549de5d1f0cb88082c0`; active pack использует
`flow-contract@6`, CLI/engine `0.7.0`, target-driven engine routing, explicit
storage migration safety, immutable RUN bindings и schema registry contracts,
а также исключает canonical-only mb-init, mb-upgrade и mb-distill и
eval/experiment shelves. Предыдущие `mbb` и `dd-flow` сохранены в
`.memory-bank/archive/mb-upgrade-2026-08-11/` и
`.memory-bank/archive/mb-upgrade-2026-08-12/`.

SPC-006 deterministic stage bootstrap/context packet и outcome-based sealed
stage finish принадлежат engineering/flow contract contour. Runtime/home
migration для перехода 3.1.0 → 3.2.0 применена отдельным explicit
`dd-flow migration apply` с backup/evidence в RUN-310; статический sync и
runtime apply теперь согласованы.
