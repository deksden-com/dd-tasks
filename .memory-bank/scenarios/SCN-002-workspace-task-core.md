---
file: '.memory-bank/scenarios/SCN-002-workspace-task-core.md'
description: 'Исполняемый acceptance contract checkpoint-02-core, включая обязательный приоритет задачи Low/Medium/High.'
purpose: 'Доказывает локальный account/workspace/project/task путь, приоритет Low/Medium/High и отрицательные authorization границы.'
version: '0.2.1'
date: '2026-08-29'
status: 'ACTIVE'
c4_level: 'documentation'
scenario_id: 'SCN-002'
scenario_kind: 'capability'
execution_status: 'accepted_local'
parent: '.memory-bank/scenarios/index.md'
related_files:
  - package.json
  - apps/api/tests/core.integration.test.ts
  - apps/api/tests/api-json-contract.test.ts
  - apps/web/tests/browser/core.spec.ts
  - .memory-bank/plans/verification-matrix.md
related_features:
  - .memory-bank/epics/EP-001-task-management/features/FT-001-task-priority/index.md
related_specs:
  - .memory-bank/spec/product/index.md
related_protocols:
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/index.md
  - .memory-bank/protocol/PRT-007-task-priority/index.md
evidence_files:
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/evidence/verification-passport.md
tags: [scenario, SCN-002, checkpoint-02, local, authorization, priority]
history:
  - version: '0.2.1'
    date: '2026-08-29'
    changes: 'CHK-API-CONTRACT доказывает wire tokens low|medium|high на фактических HTTP ответах list/create/update, а не на in-memory объектах.'
  - version: '0.2.0'
    date: '2026-08-29'
    changes: 'PRT-007 расширил тот же SCN-002 контуром обязательного приоритета Low/Medium/High, Medium defaults, invalid rejection и archived-project read-only; новый scenario id не создавался.'
  - version: '0.1.0'
    date: '2026-08-03'
    changes: 'Канонический local account/workspace/project/task contour checkpoint-02-core.'
---

# SCN-002: Workspace task core

## Goal

На exact checkout доказать сквозной local flow: login/register и server-side
session, переключение доступных workspace, owner project lifecycle, owner/member
task work, обязательный приоритет задачи Low/Medium/High на списке и в
create/edit, и безопасную изоляцию non-member/cross-workspace. Идентичность
сценария остаётся `SCN-002`; PRT-007 расширяет этот contour, а не заводит
новый scenario id.

## Preconditions и fixtures

- canonical bootstrap receipt свежий для текущего checkout;
- PostgreSQL доступен только через declared loopback local/test profile;
- `pnpm test:browser` выполняет reset, migrations и deterministic seed;
- owner имеет `ws-alpha:owner` и `ws-beta:member`, member —
  `ws-alpha:member`, outsider не имеет membership;
- Playwright владеет API `8788` и web `4174`, `reuseExistingServer=false`.

## Verification phases

1. Migration ledger/checksums, concurrent apply и composite task scope constraint.
2. Password/session primitives, register uniqueness, rotation, expiry, logout и
   tampered-cookie rejection.
3. API owner lifecycle: workspace list, create/rename/archive/restore project,
   archived filtering/read-only gate и task CRUD, включая обязательный
   приоритет из закрытого набора Low/Medium/High.
4. API authorization: member project denial, member task path, outsider and
   cross-workspace safe `404` без раскрытия приоритета, direct database
   cross-scope rejection.
5. Browser owner path: workspace switch, project rename/lifecycle, task
   create/read/update/delete.
6. Browser negative/UX path: member denial/isolation, register route, keyboard
   focus, public error and 390px no-overflow; foundation regressions preserved.
7. Priority contour (PRT-007, тот же `SCN-002`): см. раздел ниже.

## Priority acceptance contour

PRT-007 расширяет существующий local task CRUD contour. Это не новый scenario.

- Список активного проекта показывает у каждой задачи человекочитаемый текст
  Low, Medium или High; актор не выводит приоритет из машинного токена или
  только из цвета.
- Member создаёт задачу с High и видит High в строке списка.
- Member создаёт задачу, не выбирая приоритет, и видит Medium.
- Member меняет созданную задачу с Medium на Low и после сохранения видит Low.
  Seeded `task-alpha-one` остаётся Medium для присутствия в списке, а не
  доказательством upgrade.
- Значение вне закрытого набора Low/Medium/High отвергается публичной ошибкой
  без записи; список сохраняет прежнюю метку. Этот invalid-token путь —
  API-only (`apps/api/tests/core.integration.test.ts`).
- Ранее сохранённая задача без колонки priority становится Medium после
  миграции `0002` (upgrade 0001-then-0002, не seed Medium).
- В archived project список остаётся читаемым, включая текст приоритета;
  попытка сменить приоритет отвергается. Owner/member isolation и safe
  non-member `404` не меняются и не раскрывают чужой приоритет.

Browser evidence: `apps/web/tests/browser/core.spec.ts` (list labels, labelled
control, keyboard focus, 390px no-overflow, High create, omitted Medium, Low
edit, archived read-only, isolation). JSON wire tokens `low|medium|high` на
фактических HTTP ответах list/create/update доказывает
`apps/api/tests/api-json-contract.test.ts`; in-memory объекты этим доказательством
не являются.

## Pass criteria и authority

Все unit/integration/build gates и serialized Chromium suite проходят после
fresh reset/seed; public errors не раскрывают internals; database guard и
workspace isolation отрицательно доказаны. Источник acceptance исходного
checkpoint-02 contour — RUN-298 CODE/readiness report и verification passport.
Приоритет Low/Medium/High принят как расширение того же `SCN-002` local API и
browser evidence PRT-007; это не заменяет frozen PRT-003 task-CRUD claim и не
является отдельным scenario.

Доказательство относится только к local/test exact checkout. Оно не доказывает
sort/filter/board, CI, beta/staging, production, external IdP, invitations,
deploy или checkpoint-03. При падении дефект исправляется, world пересоздаётся,
и весь affected contour запускается заново; частичный green не повышает
execution status.
