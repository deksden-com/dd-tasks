---
file: '.memory-bank/spec/engineering/index.md'
description: 'Подтверждённый engineering/test contour checkpoint-02-core.'
purpose: 'Фиксирует canonical commands, test ownership и границы локального доказательства.'
version: '0.4.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
index_type: 'shallow'
coverage_depth: 1
parent: '.memory-bank/spec/index.md'
content_state: 'implemented_core'
canonical_template: '.memory-bank/mbb/coding-standards-guide.md'
implementation_files:
  - package.json
  - apps/api/vitest.unit.config.ts
  - apps/api/vitest.integration.config.ts
  - apps/web/playwright.config.ts
  - .memory-bank/spec/operations/scripts/bootstrap-workspace.sh
test_files:
  - apps/api/tests/password-session.test.ts
  - apps/api/tests/core.integration.test.ts
  - apps/web/src/product/ProductApp.test.tsx
  - apps/web/tests/browser/core.spec.ts
tags: [dd-tasks, engineering, checkpoint-02, quality, playwright]
history:
  - version: '0.4.0'
    date: '2026-08-03'
    changes: 'Разделены API unit/integration suites, добавлен SCN-002 Playwright и устранены Biome CSS warnings.'
  - version: '0.3.0'
    date: '2026-08-02'
    changes: 'Принят foundation local quality contour.'
---

# Инженерный слой

Canonical bootstrap — `pnpm bootstrap`; в non-interactive окружении script сам
задаёт `CI=true`, не меняя интерактивный режим. Root gates:

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`;
- `pnpm test:unit` — API primitives/contracts и web component behavior;
- `pnpm test:integration` — реальный PostgreSQL, migrations, auth, authorization,
  lifecycle и database constraints;
- `pnpm build` и агрегированный `pnpm quality`;
- `pnpm test:browser` — reset/seed и serialized Chromium suite на выделенных
  API/web ports `8788`/`4174`;
- `pnpm docs:check` и `pnpm db:check`.

Unit tests не заменяют readiness: SCN-002 требует fresh integration и browser
evidence. Playwright не переиспользует чужой localhost server. CI, release и
deploy tooling не вводились.
