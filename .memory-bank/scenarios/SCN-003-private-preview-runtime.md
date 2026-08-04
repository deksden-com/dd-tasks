---
file: '.memory-bank/scenarios/SCN-003-private-preview-runtime.md'
description: 'Acceptance scenario for the private, disposable built preview runtime package.'
purpose: 'Binds source-package evidence to one-port Hono/Vite, guarded data operations, readiness, authorization and cleanup claims without claiming Exe.dev live acceptance.'
version: '0.1.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/scenarios/index.md'
scenario_id: 'SCN-003'
protocol: '.memory-bank/protocol/PRT-004-exe-preview-runtime/index.md'
matrix: '.memory-bank/plans/verification-matrix.md'
tags: [dd-tasks, scenario, preview, private, runtime, browser, source-package]
history:
  - version: '0.1.0'
    date: '2026-08-04'
    changes: 'Добавлен source/live split для private preview runtime; live provider row остаётся pending отдельного deploy.md.'
---

# SCN-003 — Private preview runtime

## Claim boundary

SCN-003 проверяет built source package в exact disposable preview profile. Он не
доказывает Exe.dev identity/team/VM/share/transport/capacity, production
availability, backup, CI/CD или public sharing. Live-provider acceptance
остаётся отдельной строкой после fresh `deploy.md` preflight.

## Preconditions and actors

- clean accepted feature HEAD, `pnpm bootstrap` receipt и local PostgreSQL;
- profile is `preview-checkpoint` or `preview-eval-output`;
- run id, world id, compose project, database and volume form one exact binding;
- owner, member and outsider passwords are operation-scoped and never recorded;
- all destructive one-shots validate profile/host/database/run/world/compose/volume
  before creating a SQL client.

## Source-package phases

1. Build one image from the accepted source package and bake source revision and
   artifact digest into image metadata.
2. Start one Hono process and one internal PostgreSQL service. The app exposes
   `/api/health`, `/api/ready`, API JSON 404s and the Vite SPA through one external
   port; `/api/ready` is `503` before initialization.
3. Prove a wrong world binding is rejected, then run guarded migrate/reset/seed
   with the exact binding. Readiness becomes `200` only after migrations,
   checksums, schema tables and the exact seed marker pass.
4. Prove API role behavior: owner can read/create within scope, member cannot
   mutate owner-only resources, and outsider cannot cross the workspace boundary.
5. Run the browser path from `/login` through owner project/task creation and
   member/outsider isolation; deep SPA paths and API JSON behavior are included
   in the browser/runtime smoke.
6. For `preview-checkpoint`, remove and restart the composition while retaining
   the exact volume and prove migrate-only readiness. For `preview-eval-output`,
   remove the exact volume and read back that it is absent.

## Source proof command

```text
pnpm scenario:preview -- --profile preview-checkpoint --run-id <run-id> --claim built-integration+SCN-003-source
pnpm scenario:preview -- --profile preview-eval-output --run-id <run-id> --claim SCN-003-source+eval-cleanup
```

The scenario emits a value-free `dd-flow/preview-scenario-run@1` manifest with
phase status, safe binding, revision/digest, negative guard result, browser
result, restart/cleanup result, skipped live rows and explicit `does_not_prove`
limits. Raw run evidence remains in the project-scoped `dd-flow` run home; this
document is the durable acceptance contract, not a replacement for the fresh
passport.

## Live-provider row

Pending until a separate deploy flow proves fresh Exe.dev identity/team and
authority, exact target VM, private access, source/artifact readback,
capacity/transport and cleanup. CODE must not login, share, mutate provider
state or convert source evidence into a live claim.
