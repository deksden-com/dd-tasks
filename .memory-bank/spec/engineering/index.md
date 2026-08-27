---
file: '.memory-bank/spec/engineering/index.md'
description: 'Подтверждённый engineering/test contour checkpoint-02-core и private preview runtime.'
purpose: 'Фиксирует canonical commands, test ownership, container smoke и границы локального доказательства.'
version: '1.0.0'
date: '2026-08-27'
status: 'ACTIVE'
c4_level: 'documentation'
index_type: 'shallow'
coverage_depth: 1
parent: '.memory-bank/spec/index.md'
content_state: 'implemented_core'
canonical_template: '.memory-bank/mbb/coding-standards-guide.md'
children:
  - .memory-bank/spec/engineering/coding-standards.md
  - .memory-bank/spec/engineering/code-check-profile.json
  - .memory-bank/spec/engineering/SPC-006-stage-bootstrap-and-context-packet.md
  - .memory-bank/spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md
  - .memory-bank/spec/engineering/SPC-010-agent-owned-verification-and-safe-hitl.md
  - .memory-bank/spec/engineering/SPC-011-planned-verification-materialization.md
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
  - version: '1.0.0'
    date: '2026-08-27'
    changes: 'Added SPC-011: PLAN owns evidence selection and future checks are explicit provider-owned aliases materialized before consumption.'
  - version: '0.9.0'
    date: '2026-08-27'
    changes: 'Added SPC-009 as the coordinated beta target for Flow/RUN/Work identity, runtime-state ownership, portable references, canonical materialization, lifecycle, reports, snapshots and cleanup.'
  - version: '0.8.0'
    date: '2026-08-23'
    changes: 'Added one project-specific coding/testing/documentation standard hub for PLAN-selected fresh CODE worker context.'
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

[Project coding standards](coding-standards.md) are the compact default
orientation for PLAN and fresh CODE workers. PLAN still selects exact owning
source, representative tests and task-applicable feature/spec/ADR/scenario
documents; this index is not permission for a broad project scan.

[`code-check-profile.json`](code-check-profile.json) defines reusable aliases,
aggregate gates and the small set of guarded commands. PLAN owns its focused
check selection: an item refers to the top-level `checks[]` catalogue through
`check_refs`, and ordinary local commands need no allowlist entry.

## Active flow contract

[SPC-006 stage bootstrap and context packet](SPC-006-stage-bootstrap-and-context-packet.md)
— project-facing summary канонического контракта 3.1.0. Полная механика
принадлежит активному [dd-flow runtime contract](../../dd-flow/common/runtime-contract.md),
`flow-contract@6` и совместимому `dd-flow-cli` 0.6.0; этот engineering layer
сохраняет только применимое к проекту boundary и не заменяет project-owned
quality/test commands ниже.

## vNext beta target

[SPC-009 identity, materialization and runtime state](SPC-009-vnext-identity-materialization-and-runtime-state.md)
is the breaking coordinated target for the current beta contour. It corrects
the proven vNext runtime without partially mutating the active machine
contract: Work belongs to RUN rather than one stage; SQLite has one portable
`run.json` projection; legacy `JOB`, `work.json`, `try-*` and single
`RUN.current_stage` models are removed; identifiers, findings, checks, paths,
reports, snapshots and cleanup share one ownership model.

The existing `flow-contract.json` remains the executable pair contract until
the flow pack and `dd-flow-cli` implement SPC-009 together. Do not publish a
schema/prompt-only partial cutover.

[SPC-010 agent-owned verification and safe HITL](SPC-010-agent-owned-verification-and-safe-hitl.md)
adds the next beta contract: PLAN selects checks, planned checks are supplied
by explicit Work, and a HITL-backed PROTOCOLIZE amendment changes only the
effective downstream obligation while preserving SPECIFY as history.

[SPC-011 planned verification materialization](SPC-011-planned-verification-materialization.md)
narrows that contract into one executable rule: a future check is always an
explicit `@check/...` alias with a provider Work and exact definition; the
planner chooses evidence, while the CLI only validates, runs and receipts it.

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
