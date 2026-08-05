---
file: '.memory-bank/plans/verification-matrix.md'
description: 'Canonical verification rows for accepted dd-tasks checkpoint capabilities.'
purpose: 'Binds scenarios, fresh evidence and verification passports to bounded acceptance claims.'
version: '0.7.0'
date: '2026-08-04'
status: 'ACTIVE'
acceptance_status: 'ACCEPTED_LOCAL'
c4_level: 'project'
parent: '.memory-bank/plans/index.md'
tags: [dd-tasks, verification, SCN-001, SCN-002, SCN-003, local, preview]
history:
  - version: '0.7.0'
    date: '2026-08-05'
    changes: 'Promoted PRT-004 source-package row after fresh clean checkpoint/eval runs, quality/docs/DB gates and readiness review closure; live-provider row remains planned.'
  - version: '0.6.0'
    date: '2026-08-04'
    changes: 'Добавлены раздельные source-package и future live-provider rows для PRT-004/SCN-003; source row требует fresh built runtime/browser/cleanup passport.'
  - version: '0.5.0'
    date: '2026-08-03'
    changes: 'SCN-002 acceptance повторно подтверждена на integrated stable main; local annotated checkpoint fixation закрывает capability snapshot.'
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
| `PRT-003-checkpoint-02-core`: account/session, workspace isolation, project lifecycle and task CRUD work as one local slice | `SCN-002-workspace-task-core` | local `main`, implementation content `5027fa1`, annotated `checkpoint-02-core` | `local` | `applicable` | `accepted_local_integrated` | `pass` | `accepted_local_fixed` | `merge orchestrator` | feature readiness plus fresh integrated `pnpm quality`, real PostgreSQL integration `6 passed`, deterministic reset/seed, serialized Chromium `6 passed`, `pnpm db:check`, docs and ref readback | `.memory-bank/protocol/PRT-003-checkpoint-02-core/evidence/verification-passport.md` | Does not prove remote publication, CI, staging, production, external IdP, invitations, deploy or checkpoint-03. |
| `PRT-004 source package`: one built Hono process serves API and Vite SPA on one external port with internal PostgreSQL; guarded lifecycle, readiness and immutable revision/digest work under exact preview binding | `SCN-003-private-preview-runtime` | final clean feature HEAD recorded by RUN-300/03-code | `local-container` | `applicable` | `accepted_source_package` | `pass` | `ready_for_merge_source` | `CODE/readiness` | Fresh checkpoint and eval profiles; API/browser role matrix; wrong-binding rejection; readiness-before-init; retained-volume restart; exact eval cleanup/readback; `pnpm quality`; `pnpm docs:check`; `pnpm db:check`; final manifest/passport | `.memory-bank/protocol/PRT-004-exe-preview-runtime/evidence/verification-passport.md` | Does not prove Exe.dev, provider identity/team/VM/share/transport/capacity, CI/CD, production availability, backup or public sharing. |
| `PRT-004 live preview`: later Exe.dev rollout preserves private access and exact source/artifact/data binding | `SCN-003-private-preview-runtime` | future deploy commit and provider readback | `external-provider` | `planned` | `not_run` | `not_run` | `pending_deploy_flow` | `deploy.md owner` | Fresh identity/team/authority/VM/private-share/transport/capacity preflight, source/artifact/readiness/browser proof and cleanup/readback | future PRT-004 deploy passport | Not executable in CODE; no provider mutation or live claim is allowed before the separate deploy flow. |

Rows are promoted only after fresh readiness evidence. Merge and checkpoint
fixation remain explicit closures; local acceptance must not be interpreted as
CI, staging, production or external-provider evidence.
