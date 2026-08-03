---
file: '.memory-bank/protocol/PRT-003-checkpoint-02-core/trace/20260802T1719-runtime-cli-degraded.md'
description: 'Trace canonical allocator, исторической runtime registration refusal, source repair и recovery readback.'
purpose: 'Различает исторический blocker RUN-297 и штатно подтверждённое устранение через исправленный engine.'
version: '0.1.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/protocol/PRT-003-checkpoint-02-core/index.md'
tags: [trace, runtime-cli-degraded, runtime-recovery, evidence]
---

# Runtime CLI degraded trace and recovery amendment

## Read-only preflight

- Selected engine: `@deksden-com/dd-flow-cli@0.4.0`; compatibility is sufficient for diagnostics.
- `memory permissions preflight --mode write`: `ok=true`, `errors=0`, `warnings=0`, `can_continue=true`.
- Registered project: `PRJ-018-dd-tasks`.
- Canonical allocator response: `PRT-003-checkpoint-02-core`, `sequence=3`, `reserved=false`.
- `canon resolve` remains blocked because registered canonical root `/Users/deksden/Documents/_Projects/dd-memorybank` is missing required files; no new canonical root was invented.

## Registration attempts

Both canonical commands were executed through the selected engine:

```text
dd-flow protocol register PRT-003-checkpoint-02-core \
  --project-root /Users/deksden/Documents/_Projects/dd-tasks \
  --json

dd-flow protocol register PRT-003-checkpoint-02-core \
  --project-root /Users/deksden/Documents/_Projects/dd-tasks \
  --workspace-path /Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/checkouts/worktrees/PRT-003-checkpoint-02-core/manual-protocol/dd-tasks \
  --json
```

Both returned:

```json
{
  "ok": false,
  "error": {
    "code": "unexpected",
    "message": "Error: ON CONFLICT clause does not match any PRIMARY KEY or UNIQUE constraint"
  }
}
```

Source-backed cause: installed engine `dist/services/protocols.js` uses `ON CONFLICT(id)`, while the actual `protocols` table in `/Users/deksden/.dd-flow/db.sqlite` has `PRIMARY KEY(project_id, id)` and no unique index on `id`. The engine's ordinary `CREATE TABLE IF NOT EXISTS` path does not migrate an existing table. Available package versions stop at `0.4.0`; no compatible newer engine is installed.

## Safe response

- The CLI-created partial `metadata.json`/`state.json` files were not edited or deleted.
- `protocol status PRT-003-checkpoint-02-core` was read back as `not_found`; no registered protocol DB row is claimed.
- `cleanup scan` returned no findings/actions; no cleanup mutation was run.
- No SQLite, runtime JSON, dashboard, queue, lock or old checkpoint tag was manually changed.
- A project-scoped manual fallback worktree was created from `main@25b7434`; its physical owner is recorded as `manual` in the protocol summary.
- `run start` succeeded through CLI and created `RUN-297-prt-003-checkpoint-02-core-specify-plan`, subject `PRT-003-checkpoint-02-core`, workspace-bound to that worktree. This is a real RUN record, not proof that the protocol DB registration succeeded.

The resulting SPECIFY/PLAN is explicitly runtime-degraded until a compatible engine/schema repair is performed through an authorized dd-flow upgrade or CLI fix.

## Stage/run closure readback

- `run complete-stage` closed `specify` with `dd-flow/specification-stage-report@1` and linked JSON/HTML/Markdown artifacts.
- `run attach-stage` then `run complete-stage` closed `plan` with `dd-flow/plan-stage-report@1` and linked JSON/HTML/Markdown artifacts.
- `run complete RUN-297... --status done --verdict degraded` returned `ok=true`, `status=done`, `verdict=degraded`; no CODE/readiness/merge/delivery stage was started.
- The terminal RUN result does not repair or imply the missing protocol DB row; `protocol status` must remain the authoritative next readback after a future compatible engine repair.

## Continuation audit

Повторная проверка текущего состояния после завершения RUN дала тот же результат:

- `pnpm view @deksden-com/dd-flow-cli versions --json`: доступны только `0.1.0`–`0.4.0`; selected `0.4.0` остаётся рекомендованным compatible engine.
- `engine doctor`: selected `@deksden-com/dd-flow-cli@0.4.0`, healthy, required range `>=0.4.0 <0.5.0`; installed snapshots `0.3.0`, `0.3.1` и `0.4.0` используют тот же invalid `ON CONFLICT(id)` registration path.
- `migration plan`: `status=blocked`, `chain=[]`; runtime/home migration требует backup evidence и видит исторический blocked `RUN-003-prt-001-checkpoint-01-foundation-code`. Migration apply не запускался.
- `cleanup scan`: `findings=[]`, `actions=[]`.
- `protocol status PRT-003-checkpoint-02-core`: `not_found`; `run status RUN-297...`: `done/degraded`; no CODE/readiness/delivery action was initiated.

Этот исторический audit не меняет runtime state и не является основанием объявлять protocol registration успешной.

## Recovery amendment — 2026-08-03

Историческая запись выше сохранена без переписывания: `RUN-297` остаётся terminal `done/degraded`, а его registration failure — частью audit trail. Blocker устранён в canonical source repo и подтверждён штатным local engine:

- Source: `/Users/deksden/Documents/_Projects/dd-flow-cli`, HEAD `34667b0f856ea375a689a410f3c38c69ba2fcc0e`; fix commit `7ac7340` меняет conflict target на `(project_id,id)`, использует project-scoped lookup и composite-key migration.
- Regression: `pnpm exec vitest run test/project-scoped-identity.test.ts --maxWorkers=1` — `1 file passed, 2 tests passed`; `pnpm typecheck` и `pnpm build` passed (lint выполнен в source-repair verification).
- Engine install/readback: `node dist/cli.js engine install --force --json`; snapshot `/Users/deksden/.dd-flow/engines/@deksden-com_dd-flow-cli/0.4.0`, package `@deksden-com/dd-flow-cli@0.4.0`, `install_source=local_development`, `installed_at=2026-08-02T23:45:22.336Z`, `healthy=true`.
- Fresh `engine doctor --project-root /Users/deksden/Documents/_Projects/dd-tasks --json` selected exactly that snapshot for `>=0.4.0 <0.5.0`, diagnostics empty.
- `protocol register PRT-003-checkpoint-02-core --project-root /Users/deksden/Documents/_Projects/dd-tasks --workspace-path /Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/checkouts/worktrees/PRT-003-checkpoint-02-core/manual-protocol/dd-tasks --json` returned `ok=true`; runtime record is project `PRJ-018-dd-tasks` + protocol `PRT-003-checkpoint-02-core`.
- `plan set PRT-003-checkpoint-02-core --file .../RUN-298.../02-plan/plan.json --json` returned `ok=true`, `PLAN-003-prt-003-checkpoint-02-core`, `17` items, `2` done, `0` blocked.
- Recovery `RUN-298-prt-003-checkpoint-02-core-recovery` was created and completed only through CLI: `specify:done`, `plan:done`, run `done/ready_for_code`; `protocol sync-from-run ... --run RUN-298... --target plan --json` moved the runtime lifecycle from `registered` to `plan` with empty diagnostics.
- No SQLite, runtime JSON, old RUN-297, published tag, main branch or product source was manually edited. Current stop is pre-CODE; no readiness/merge/tag/push/deploy was run.
