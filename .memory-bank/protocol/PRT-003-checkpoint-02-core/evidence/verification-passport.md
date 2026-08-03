---
file: '.memory-bank/protocol/PRT-003-checkpoint-02-core/evidence/verification-passport.md'
description: 'Durable local readiness passport PRT-003 / SCN-002.'
purpose: 'Связывает exact source contour, fresh checks, review findings, proof limits и local merge closure.'
version: '0.2.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/protocol/PRT-003-checkpoint-02-core/index.md'
protocol_id: 'PRT-003-checkpoint-02-core'
run_id: 'RUN-298-prt-003-checkpoint-02-core-recovery'
scenario_id: 'SCN-002'
verification_state: 'accepted_local_integrated_fixed'
tags: [verification, passport, checkpoint-02, local, readiness]
history:
  - version: '0.2.0'
    date: '2026-08-03'
    changes: 'Добавлены stable-main post-merge proof и annotated local checkpoint fixation boundary.'
---

# Verification passport — checkpoint-02-core

## Identity

- source: `feature/prt-003-checkpoint-02-core@5027fa131346ce47ec144ec1a206bd6afb10fd92`;
- worktree: exact PRT-003 manual-protocol feature worktree;
- runtime: `RUN-298-prt-003-checkpoint-02-core-recovery`, PLAN-003;
- contour: local/test only, PostgreSQL loopback `55433`, serialized Chromium on
  API `8788` and web `4174`;
- verdict: `accepted_local_integrated_fixed`, blockers `0`;
- closure: local stable `main`, annotated tag `checkpoint-02-core`; exact closure
  commit and ref readback are recorded in RUN-298 `04-merge/`.

## Fresh checks

| Check | Accepted result |
| --- | --- |
| canonical bootstrap revalidation | dependencies and project-owned PostgreSQL healthy; readiness receipt in RUN-298 `03-code/` |
| format / lint / typecheck | pass, no Biome warnings |
| unit | API 13/13; web 7/7 |
| integration | 6/6 on real PostgreSQL, including concurrent migration, auth/session and authorization/data constraints |
| build / aggregate quality | pass |
| deterministic data | reset + migrations `0000`,`0001`; seed 3 accounts, 2 workspaces, 3 memberships, 3 projects, 2 tasks |
| browser | 6/6 serialized Chromium specs after fresh reset/seed |
| docs / database readback | pass; migration ledger complete and core tables present |

Final command transcripts and structured CODE stage artifacts live under
`/Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/runs/RUN-298-prt-003-checkpoint-02-core-recovery/03-code/`.

## Review

Self-review covered source diff, public HTTP contracts/errors, session storage
and lifecycle, membership/owner gates, cross-workspace negative paths, migration
atomicity/checksums, deterministic fixtures, UI states/selectors, responsive/
keyboard browser behavior and non-goals. No >800-line source file or new shared
abstraction was introduced; the largest product component is intentionally a
single 561-line route shell for this small slice and was explicitly reviewed as
cohesive; no source file exceeds the hard 800-line gate.

Findings fixed before acceptance:

1. non-interactive pnpm bootstrap aborted while replacing modules; bootstrap
   now scopes `CI=true` only when stdin is not a TTY;
2. initial browser run reused a historical service on `8787`; Playwright now
   owns isolated ports with reuse disabled;
3. project rename control was placed in a task row during acceptance expansion;
   it was moved to the project row and the complete browser suite rerun green.
4. member task mutation had integration but not browser-depth; SCN-002 now
   creates, reads and deletes a member task through the product UI.

## Acceptance authority and limits

This passport proves the SCN-002 account/session → workspace switch → project
lifecycle → task CRUD story and API/database isolation for this exact local
source state. It also preserves foundation regressions.

It does not prove CI, beta/staging, production, external providers, invitations,
password recovery/rate limiting, deployment or checkpoint-03. Local main merge,
post-merge recheck and checkpoint fixation passed as separate closure steps.
Remote publish is not implied by this passport and was not performed.
