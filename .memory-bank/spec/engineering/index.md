---
file: '.memory-bank/spec/engineering/index.md'
description: 'Подтверждённый engineering/test contour checkpoint-02-core и private preview runtime.'
purpose: 'Фиксирует canonical commands, test ownership, container smoke и границы локального доказательства.'
version: '0.7.0'
date: '2026-08-12'
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
  - apps/web/playwright.preview.config.ts
  - scripts/preview-build.mjs
  - scripts/scenario-preview.mjs
  - Dockerfile
  - compose.preview.yml
  - .memory-bank/spec/operations/scripts/bootstrap-workspace.sh
test_files:
  - apps/api/tests/password-session.test.ts
  - apps/api/tests/core.integration.test.ts
  - apps/api/tests/readiness.integration.test.ts
  - apps/web/src/product/ProductApp.test.tsx
  - apps/web/tests/browser/core.spec.ts
  - apps/web/tests/browser/preview.spec.ts
tags: [dd-tasks, engineering, checkpoint-02, preview, quality, playwright, container]
history:
  - version: '0.7.0'
    date: '2026-08-12'
    changes: 'Добавлен project-facing summary канонического SPC-006 для Memory Bank 3.1.0; flow/runtime contracts и package-owned quality facts разделены.'
  - version: '0.6.0'
    date: '2026-08-05'
    changes: 'Добавлены access-policy unit/API/UI/browser gates, build-manifest policy handoff и closed-registration SCN-003 readback.'
  - version: '0.5.0'
    date: '2026-08-04'
    changes: 'Добавлены preview build/scenario commands, Docker runtime smoke, guarded negative checks, readiness integration и SCN-003 browser ownership.'
  - version: '0.4.0'
    date: '2026-08-03'
    changes: 'Разделены API unit/integration suites, добавлен SCN-002 Playwright и устранены Biome CSS warnings.'
  - version: '0.3.0'
    date: '2026-08-02'
    changes: 'Принят foundation local quality contour.'
---

# Инженерный слой

## Active flow contract

[SPC-006 stage bootstrap and context packet](SPC-006-stage-bootstrap-and-context-packet.md)
— project-facing summary канонического контракта 3.1.0. Полная механика
принадлежит активному [dd-flow runtime contract](../../dd-flow/common/runtime-contract.md),
`flow-contract@6` и совместимому `dd-flow-cli` 0.6.0; этот engineering layer
сохраняет только применимое к проекту boundary и не заменяет project-owned
quality/test commands ниже.

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

Preview source-package gates дополнительно используют:

- `pnpm preview:build -- --profile <preview-profile> --run-id <run-id>` —
  image build с baked source revision/artifact digest;
- `pnpm scenario:preview -- --profile <preview-profile> --run-id <run-id>` —
  exact compose binding, pre-init `503`, guarded migrate/reset/seed,
  API/browser role matrix, checkpoint restart или eval volume cleanup;
- `pnpm --filter @dd-tasks/web exec playwright test --config
  playwright.preview.config.ts --project chromium` — SCN-003 browser contour.

The preview build manifest carries a value-free access-policy object with
requested proxy visibility, requested registration mode, pair validity and the
resolved application mode. `/api/config` is the only application registration
readback; Exe.dev `share show` is the only provider visibility readback. The
browser/API gates cover direct `/register`, closed-mode rejection before body
parsing, application login/session/workspace authorization and the forbidden
`public+open` pair.

Unit tests не заменяют readiness: SCN-002 требует fresh integration и browser
evidence. Playwright не переиспользует чужой localhost server. CI, release и
deploy tooling не вводились. Эти проверки доказывают только source package и
disposable local container; live Exe.dev, provider access, transport/capacity,
CI/CD и production остаются отдельным deploy gate.
