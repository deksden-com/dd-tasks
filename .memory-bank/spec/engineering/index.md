---
file: '.memory-bank/spec/engineering/index.md'
description: 'Подтверждённое инженерное состояние dd-tasks после foundation CODE и local quality gate.'
purpose: 'Фиксирует фактические workspace/tooling/test commands и не расширяет их до CI или delivery policy.'
version: '0.3.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'documentation'
index_type: 'shallow'
coverage_depth: 1
parent: '.memory-bank/spec/index.md'
content_state: 'compact_stub'
canonical_template: '.memory-bank/mbb/coding-standards-guide.md'
activation_triggers:
  - 'появление package/workspace manifest или lockfile'
  - 'появление исходного кода, конфигурации проверок либо CI'
  - 'принятый протокол, устанавливающий проверяемое инженерное правило'
implementation_files:
  - package.json
  - pnpm-workspace.yaml
  - tsconfig.base.json
  - biome.json
  - vitest.config.ts
  - apps/api/package.json
  - apps/web/package.json
  - apps/web/playwright.config.ts
  - .memory-bank/spec/operations/scripts/bootstrap-workspace.sh
test_files:
  - apps/api/tests/api-json-contract.test.ts
  - apps/api/tests/target-guard.test.ts
  - apps/web/src/App.test.tsx
  - apps/web/tests/browser/foundation.spec.ts
tags: [dd-tasks, engineering, foundation, checkpoint-01]
history:
  - version: '0.3.0'
    date: '2026-08-02'
    changes: 'Fresh readiness quality/browser/docs checks приняты для local contour; пять non-blocking CSS warnings раскрыты.'
  - version: '0.2.1'
    date: '2026-08-02'
    changes: 'Добавлены source-backed scenario/docs readiness ownership и revalidated bootstrap receipt.'
  - version: '0.2.0'
    date: '2026-08-02'
    changes: 'Зафиксированы root manifests, canonical bootstrap, Biome, TypeScript, Vitest projects, Playwright entrypoint и фактически прошедший local quality matrix.'
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Создан компактный инженерный индекс исходного checkpoint.'
---

# Инженерный слой

В CODE materialized pnpm workspace с Node `>=22`/pnpm `>=10`, root Biome 2.5-compatible config, TypeScript app configs, root Vitest projects (`api` и `web`) и Playwright Chromium entrypoint. Canonical bootstrap выполняется через `.memory-bank/spec/operations/scripts/bootstrap-workspace.sh` до project tooling.

Фактически прошедший local quality path: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm test:integration`, `pnpm build`, `pnpm quality`; root unit path дал 14/14 тестов, integration — 10/10. Biome оставляет пять non-blocking CSS warnings; lint exit code равен 0.

Эти команды подтверждены только для local foundation implementation. Они не
означают CI, release, deploy, beta/production readiness или remote delivery;
SCN-001, docs promotion и verification passport приняты только для local
readiness contour.

## Раскрытие слоя

После readiness добавляйте сюда только проверяемые команды, правила и traceability-связи. Root command scripts остаются владельцами orchestration, app-local tests — владельцами поведения; не создавайте shared package или CI policy без отдельного доказанного потребителя.
