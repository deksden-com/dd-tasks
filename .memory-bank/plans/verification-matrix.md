---
file: '.memory-bank/plans/verification-matrix.md'
description: 'Canonical verification rows for accepted dd-tasks checkpoint capabilities.'
purpose: 'Binds scenarios, fresh evidence and verification passports to bounded acceptance claims.'
version: '0.4.0'
date: '2026-08-03'
status: 'ACTIVE'
acceptance_status: 'ACCEPTED_LOCAL'
c4_level: 'project'
parent: '.memory-bank/plans/index.md'
tags: [dd-tasks, verification, SCN-001, SCN-002, local]
history:
  - version: '0.4.0'
    date: '2026-08-03'
    changes: 'Добавлена local acceptance row PRT-003/SCN-002 с API, PostgreSQL и serialized browser evidence; integration в main остаётся отдельным merge closure.'
  - version: '0.3.0'
    date: '2026-08-02'
    changes: 'Fresh integrated-main SCN-001 run, quality, docs and DB checks passed after fast-forward merge; local acceptance remains separate from checkpoint fixation.'
  - version: '0.2.0'
    date: '2026-08-02'
    changes: 'Fresh SCN-001 run, local quality/browser/DB checks, docs promotion and verification passport accepted for the local contour.'
---

# Verification matrix

This is the canonical project-owned verification row for the technical
foundation. It is a plan record, not runtime evidence. A stronger state may be
recorded only after the named fresh evidence and verification passport exist.

| Capability / claim | Primary scenario | Runtime stage | Verification contour | applicability_status | verification_state | gate_status | closure_state | Owner | Planned evidence | Later passport | Proof limits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `PRT-001-checkpoint-01-foundation`: operator can run the local technical foundation with safe API, persistence and browser proof | `SCN-001-foundation-acceptance` | `main@a031695` | `local` | `applicable` | `accepted_local_integrated` | `pass` | `accepted_local_pending_fixation` | `merge orchestrator` | `04-merge/foundation-scenario-run.json` (`RUN-20260802-006__SCN-001`, 6/6); five collected manifests; fresh `pnpm quality`; `pnpm docs:check`; `pnpm db:check`; managed-localhost browser `3 passed` | `.memory-bank/protocol/PRT-001-checkpoint-01-foundation/evidence/verification-passport.md` | Does not prove CI, beta, staging, production, external providers, product entities or task-tracker workflows; annotated tag/push are separate user-gated fixation. |
| `PRT-003-checkpoint-02-core`: account/session, workspace isolation, project lifecycle and task CRUD work as one local slice | `SCN-002-workspace-task-core` | `feature/prt-003-checkpoint-02-core` / RUN-298 readiness | `local` | `applicable` | `accepted_local_ready_for_merge` | `pass` | `pending_canonical_merge` | `implementation/readiness owner` | fresh `pnpm quality`, real PostgreSQL integration `6 passed`, deterministic reset/seed, serialized Chromium `6 passed`, `pnpm db:check`, docs and source/security/data review | `.memory-bank/protocol/PRT-003-checkpoint-02-core/evidence/verification-passport.md` | Does not prove CI, staging, production, external IdP, invitations, deploy or checkpoint-03; exact main commit is recorded only after merge. |

Rows are promoted only after fresh readiness evidence. Merge and checkpoint
fixation remain explicit closures; local acceptance must not be interpreted as
CI, staging, production or external-provider evidence.
