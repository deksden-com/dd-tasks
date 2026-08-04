---
file: '.memory-bank/structure.md'
description: 'Карта разделов и текущей плотности знаний.'
purpose: 'Объясняет, где живёт подтверждённая проектная истина.'
version: '0.3.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/index.md'
tags: [dd-tasks, structure]
history:
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
plans, scenarios и protocol. Foundation facts живут в source-backed spec и
protocol documents; product shelf остаётся намеренно пустым от product behavior.

adr, evidence, ui, guides, skills, defs и archive существуют как канонические
полки и получают документы только при самостоятельном подтверждении. Для
foundation создан один canonical scenario; raw run artifacts не подменяют
Memory Bank truth.

mbb — копия MBB 2.15.0. dd-flow — curated project-local pack из canonical
commit `852d9ea533eac5e0737ea9bdb3331882ba3597e3`; canonical-only mb-init,
mb-upgrade и mb-distill не установлены.
