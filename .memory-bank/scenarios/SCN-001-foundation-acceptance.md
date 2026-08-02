---
file: '.memory-bank/scenarios/SCN-001-foundation-acceptance.md'
description: 'Исполняемый acceptance contract для локального technical foundation.'
purpose: 'Документирует воспроизводимую проверку bootstrap, persistence, API, managed-localhost browser proof и cleanup.'
version: '0.3.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'documentation'
scenario_id: 'SCN-001'
scenario_kind: 'capability'
execution_status: 'accepted_local'
parent: '.memory-bank/scenarios/index.md'
related_files:
  - package.json
  - scripts/scenario-foundation.mjs
  - apps/web/playwright.config.ts
  - apps/web/tests/browser/foundation.spec.ts
  - .memory-bank/plans/verification-matrix.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md
related_features: []
related_specs:
  - .memory-bank/spec/system/index.md
  - .memory-bank/spec/engineering/index.md
  - .memory-bank/spec/operations/index.md
related_adrs: []
related_protocols:
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md
evidence_files:
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/evidence/verification-passport.md
tags: [scenario, verification, evidence, foundation, local]
history:
  - version: '0.3.0'
    date: '2026-08-02'
    changes: 'Accepted local readiness run RUN-20260802-005__SCN-001 passed all six phases with five collected manifests and owner-matched cleanup.'
  - version: '0.1.0'
    date: '2026-08-02'
    changes: 'Создан canonical scenario doc из принятого PLAN runner contract; фактическое acceptance состояние ожидало readiness run.'
  - version: '0.2.0'
    date: '2026-08-02'
    changes: 'Добавлен source-backed runner, evidence и cleanup contract; execution status обновляется только после свежего run.'
---

# SCN-001: Foundation acceptance

## Goal

Доказать, что локальный technical foundation воспроизводимо поднимается,
создаёт изолированный local/test world, проходит persistence/API/browser
контуры и всегда оставляет проверяемый cleanup result. Сценарий не доказывает
product/task-tracker behavior.

## Preconditions

- concrete feature worktree совпадает с protocol handoff;
- canonical workspace bootstrap receipt для этого checkout свежий и успешный;
- Node, pnpm, Docker Compose и project-owned PostgreSQL contour доступны;
- запуск использует уникальный `RUN-YYYYMMDD-NNN__SCN-001` id;
- browser evidence выполняется через managed localhost contour; `file://` запрещён.

## Fixtures

- local/test PostgreSQL database под guard prefix `dd_tasks_foundation_`;
- derived schema под `foundation_<suffix>`;
- zero-entity foundation: `seed` имеет статус `not_applicable`;
- существующая Playwright foundation spec, без product fixtures.

## Source Provenance

- Source anchor: `RUN-002.../02-plan/scenario-runner-contract.md`.
- Provenance status: `current`.
- Reusable meaning: phases, isolation, failure policy, evidence and cleanup
  boundary из принятого PLAN.
- Не импортируется: hidden eval material, чужая acceptance и evidence другой
  ветки/окружения.

## Phases

1. `phase-01-world`: derive/read back local target and fail closed on collision.
2. `phase-02-migrate-schema`: apply forward migration and verify history/schema.
3. `phase-03-api-contract`: verify health, expected error and generic fault path.
4. `phase-04-browser`: verify success/error, selectors, focus and narrow viewport
   через managed localhost.
5. `phase-05-collect`: write machine-readable API, persistence, browser,
   security and pipeline evidence plus durable run summary.
6. `phase-06-cleanup`: always perform owner-matched cleanup and record readback;
   cleanup failure fails or blocks the scenario.

## Expected Evidence

- scenario run bundle under ignored `.scenario-runs/<RUN_ID>/`;
- durable summary from `RUN-004` for `RUN-20260802-005__SCN-001`, with five
  collected manifests and cleanup readback;
- protocol verification passport at
  `.memory-bank/protocol/PRT-001-checkpoint-01-foundation/evidence/verification-passport.md`;
- linked fresh quality/pipeline checks and reviewer reports.

## Evidence Contours

- local: applicable and accepted by `RUN-20260802-005__SCN-001` after a fresh
  passing run with cleanup;
- ci: not applicable to this checkpoint;
- beta/staging: not applicable to this checkpoint;
- live provider: not applicable to this checkpoint;
- production: not applicable to this checkpoint.

## Pass Criteria

- all six required phases pass;
- API, persistence and managed-localhost browser artifacts are present;
- no secret, request correlation id or internal detail leaks into public error;
- cleanup result is `cleaned` with owner-matched target readback;
- durable summary and verification passport agree on run id, commit, contour and
  proof limits.

## Supported Environments

- local/test only, loopback services and the declared feature worktree.

## Verification Matrix Links

- `PRT-001-checkpoint-01-foundation`: primary local acceptance scenario;
  see `.memory-bank/plans/verification-matrix.md`.

## Evidence Authority

- This evidence proves: local technical foundation acceptance for the exact
  checked-out code and declared local contour.
- This evidence does not prove: CI, beta/staging, production, live provider,
  external delivery, or product/task-tracker workflows.
- Owning acceptance record: protocol summary plus verification passport.

## Follow-up Policy

- On failure: preserve sanitized phase evidence, run cleanup, fix the source
  defect and rerun with a new unique id.
- On partial result: do not mark `accepted_local`; record a blocker or named
  deferral with exact next action.
