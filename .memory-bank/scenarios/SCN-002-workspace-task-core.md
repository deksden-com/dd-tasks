---
file: '.memory-bank/scenarios/SCN-002-workspace-task-core.md'
description: 'Исполняемый acceptance contract checkpoint-02-core.'
purpose: 'Доказывает локальный account/workspace/project/task путь и отрицательные authorization границы.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
scenario_id: 'SCN-002'
scenario_kind: 'capability'
execution_status: 'accepted_local'
parent: '.memory-bank/scenarios/index.md'
related_files:
  - package.json
  - apps/api/tests/core.integration.test.ts
  - apps/web/tests/browser/core.spec.ts
  - .memory-bank/plans/verification-matrix.md
related_protocols:
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/index.md
evidence_files:
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/evidence/verification-passport.md
tags: [scenario, SCN-002, checkpoint-02, local, authorization]
---

# SCN-002: Workspace task core

## Goal

На exact checkout доказать сквозной local flow: login/register и server-side
session, переключение доступных workspace, owner project lifecycle, owner/member
task work и безопасную изоляцию non-member/cross-workspace.

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
   archived filtering/read-only gate и task CRUD.
4. API authorization: member project denial, member task path, outsider and
   cross-workspace safe `404`, direct database cross-scope rejection.
5. Browser owner path: workspace switch, project rename/lifecycle, task
   create/read/update/delete.
6. Browser negative/UX path: member denial/isolation, register route, keyboard
   focus, public error and 390px no-overflow; foundation regressions preserved.

## Pass criteria и authority

Все unit/integration/build gates и все шесть serialized Chromium specs проходят
после fresh reset/seed; public errors не раскрывают internals; database guard и
workspace isolation отрицательно доказаны. Источник acceptance — RUN-298 CODE/
readiness report и verification passport.

Доказательство относится только к local/test exact checkout. Оно не доказывает
CI, beta/staging, production, external IdP, invitations, deploy или checkpoint-03.
При падении дефект исправляется, world пересоздаётся, и весь affected contour
запускается заново; частичный green не повышает execution status.
