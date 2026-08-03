---
file: '.memory-bank/protocol/PRT-003-checkpoint-02-core/summary.md'
description: 'Curated source-backed summary checkpoint-02-core после CODE/readiness.'
purpose: 'Фиксирует scope, runtime history, implementation, evidence, proof limits и canonical merge handoff.'
version: '0.4.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/protocol/PRT-003-checkpoint-02-core/index.md'
blocked_by_protocols: []
related_specs:
  - .memory-bank/spec/product/index.md
  - .memory-bank/spec/system/index.md
  - .memory-bank/spec/engineering/index.md
  - .memory-bank/spec/operations/index.md
related_scenarios:
  - .memory-bank/scenarios/SCN-002-workspace-task-core.md
source_user_input:
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/intake/user-input.md
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/intake/code-merge-authorization.md
continuation_prompt: 'none'
implements_scope: 'Accounts/server-side sessions, workspace owner/member isolation, project lifecycle, basic task CRUD, guarded PostgreSQL migrations/fixtures, minimal product UI and local acceptance.'
tags: [protocol, checkpoint-02, core, implemented, readiness, ready-for-merge]
history:
  - version: '0.4.0'
    date: '2026-08-03'
    changes: 'Canonical fast-forward integration, fresh stable-main checks и annotated local checkpoint-02-core fixation закрывают PRT-003; remote publish не выполнен.'
  - version: '0.3.0'
    date: '2026-08-03'
    changes: 'PLAN-003 реализован; fresh local CODE/readiness contour и SCN-002 приняты, blocker count 0, следующий action — canonical merge closure.'
  - version: '0.2.0'
    date: '2026-08-03'
    changes: 'Runtime registration восстановлена; RUN-298 принял SPECIFY+PLAN и ready_for_code handoff.'
  - version: '0.1.0'
    date: '2026-08-02'
    changes: 'PRT-003 выделен; RUN-297 сохранил degraded planning audit.'
---

# PRT-003 — checkpoint-02-core

## Runtime state

- protocol: `PRT-003-checkpoint-02-core`, project `PRJ-018-dd-tasks`;
- historical `RUN-297-prt-003-checkpoint-02-core-specify-plan` остаётся
  immutable `done/degraded`;
- canonical `RUN-298-prt-003-checkpoint-02-core-recovery` содержит принятые
  SPECIFY, PLAN, CODE/readiness artifacts;
- plan: `PLAN-003-prt-003-checkpoint-02-core`, 17 items, no blockers;
- implementation worktree:
  `/Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/checkouts/worktrees/PRT-003-checkpoint-02-core/manual-protocol/dd-tasks`;
- branch: `feature/prt-003-checkpoint-02-core`, base `main@25b7434`;
- readiness verdict: `accepted_local_ready_for_merge`;
- merge: implementation commit `5027fa131346ce47ec144ec1a206bd6afb10fd92`
  fast-forward integrated into local stable `main`; closure docs committed on main;
- post-merge: bootstrap, quality, DB/docs and Chromium `6/6` pass;
- fixation: annotated local tag `checkpoint-02-core` targets the closure commit;
- remote: unchanged by this protocol because delivery route is `local_only`;
- next action: none for PRT-003 after queue/runtime closure.

## Implemented scope

Accounts use normalized unique email and scrypt password hashes. Opaque
server-side sessions store only token hash, expiry and revocation; login rotates
active sessions. Workspace membership is checked on every protected API request.
Owners manage project lifecycle; owners and members work with tasks in active
projects; non-members and cross-workspace requests receive safe `404`.

PostgreSQL/Drizzle migration `0001_checkpoint_02_core.sql` creates product
tables, role enum, indexes and composite task scope constraint. Migration
execution is transactional, checksum-verified and advisory-locked. Guarded
reset/seed creates deterministic owner/member/outsider acceptance data.

The minimal React product surface implements login/register, workspace list/
creation/switching, project list/create/rename/archive/restore and task CRUD with
loading/empty/error/read-only states. API authority is not duplicated in UI.

## Evidence and findings

SCN-002 combines API unit tests, real-PostgreSQL integration and serialized
Chromium acceptance. Readiness found and fixed two infrastructure/UI defects:
non-interactive pnpm bootstrap needed a scoped `CI=true`, and Playwright had to
own isolated ports instead of reusing a historical server. A later browser
finding moved project rename from an incorrect task-row placement to project-row.
All affected contours were rerun after fixes.

Durable proof is in
`.memory-bank/protocol/PRT-003-checkpoint-02-core/evidence/verification-passport.md`;
runtime reports/receipts are under RUN-298 `03-code/`. No runtime DB/JSON was
edited manually.

## Merge closure

Queue item `186` was claimed by
`merge-oneshot-prt-003-checkpoint-02-core-20260803` under the merge-lane lease.
Stable `main` was clean and matched base `25b7434`; integration was an exact
fast-forward. Fresh checks were executed from the stable root, not reused from
feature readiness. Merge stage artifacts and exact final refs live in RUN-298
`04-merge/`.

## Boundaries

Out of scope remain invitations/membership management, external IdP, password
recovery/rate limiting, status boards, filters/search, comments/activity,
realtime/offline, AI, CI, Exe.dev/deploy, production and checkpoint-03.

The earlier planning intake prohibited CODE/merge only for its original session.
The later `code-merge-authorization.md` explicitly supersedes that stop boundary
and authorizes uninterrupted local canonical merge. Force operations, published
history rewrite and destructive cleanup remain prohibited. Remote publish is not
inferred from local-only delivery policy.
