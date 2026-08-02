---
file: '.memory-bank/spec/system/index.md'
description: 'Подтверждённая карта системного слоя dd-tasks после foundation CODE; продуктовый слой намеренно не реализован.'
purpose: 'Читать перед дальнейшей разработкой, чтобы различать принятый local technical foundation и ещё не открытый product scope.'
version: '0.3.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'L1'
index_type: 'shallow'
coverage_depth: 1
parent: '.memory-bank/spec/index.md'
content_state: 'compact_stub'
canonical_template: '.memory-bank/mbb/c4-model.md'
activation_triggers:
  - 'появление реализованного контейнера или пакета'
  - 'появление публичного контракта, схемы данных или внешней интеграции'
  - 'появление кода и проверок, подтверждающих системную границу'
implementation_files:
  - apps/api/src/server.ts
  - apps/api/src/app.ts
  - apps/api/src/contracts/http.ts
  - apps/api/src/db/schema.ts
  - apps/api/src/db/migrations.ts
  - apps/web/src/main.tsx
  - apps/web/src/App.tsx
  - apps/web/src/foundation/foundation-contract.ts
test_files:
  - apps/api/tests/api-json-contract.test.ts
  - apps/api/tests/target-guard.test.ts
  - apps/web/src/App.test.tsx
  - apps/web/tests/browser/foundation.spec.ts
tags: [dd-tasks, system, foundation, checkpoint-01]
history:
  - version: '0.3.0'
    date: '2026-08-02'
    changes: 'SCN-001 и verification passport приняты для local contour после fresh readiness evidence; product behavior не заявлен.'
  - version: '0.2.1'
    date: '2026-08-02'
    changes: 'Добавлена canonical SCN-001 navigation; implementation boundaries остаются отделены от ещё не принятого readiness verdict.'
  - version: '0.2.0'
    date: '2026-08-02'
    changes: 'Зафиксированы реализованные API/data/web foundation boundaries и их tests; product behavior и readiness не заявлены.'
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Создан компактный системный индекс для исходного checkpoint.'
---

# Системный слой

Foundation CODE добавил два app-контейнера: `apps/api` с Hono HTTP boundary и техническим Drizzle/PostgreSQL persistence path и `apps/web` с React/Vite browser surface. Нормативный API contract ограничен read-only `GET /api/health`, expected not-found fallback и local/test-only unexpected-error seam; техническая таблица `foundation_metadata` не является product entity.

Изолированный local PostgreSQL запускается через project-owned compose service,
migrations forward-only, reset fail-closed для loopback `dd_tasks_foundation_*`,
а zero-entity seed фиксируется как `not_applicable`. Web surface имеет единственный
`/foundation` route, machine-readable selectors и loading/success/error states.
Source-backed tests, browser proof и root quality commands реализованы; SCN-001
и verification passport приняты для local contour после fresh acceptance run.

Плановые контракты и evidence: `RUN-002.../02-plan/api-contract.md`, `ui-foundation-contract.md`, `contract-propagation-matrix.md`; фактическая CODE-проверка — `RUN-003.../03-code/evidence/`. Это local foundation contour, не CI/beta/staging/production и не task-tracker architecture.

## Раскрытие слоя

После readiness добавляйте сюда только source-backed карту новых системных границ, контрактов и implementation/test links. Решения с альтернативами оформляйте отдельными ADR, когда появятся фактические основания; не переносите runtime evidence в нормативный contract.
