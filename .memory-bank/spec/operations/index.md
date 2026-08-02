---
file: '.memory-bank/spec/operations/index.md'
description: 'Подтверждённый local foundation operational contour dd-tasks.'
purpose: 'Фиксирует bootstrap, safety boundaries, evidence contour и ещё не открытые delivery policies.'
version: '0.7.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/index.md'
children:
  - .memory-bank/spec/operations/workspace-bootstrap-policy.md
  - .memory-bank/spec/operations/secrets-policy.md
  - .memory-bank/spec/operations/runbooks/workspace-bootstrap.md
tags: [dd-tasks, operations, git, zero-checkpoint]
history:
  - version: '0.7.0'
    date: '2026-08-02'
    changes: 'Для PRT-001 разрешён scoped degraded direct fixation после принятия readiness и local main integration; exact tag/push/readback evidence ведётся в RUN-005, CI/release/deploy не заявляются.'
  - version: '0.6.0'
    date: '2026-08-02'
    changes: 'Stable main fast-forward integration and fresh integrated-checkout checks passed; annotated later tag name and remote push target remain undefined.'
  - version: '0.5.0'
    date: '2026-08-02'
    changes: 'Fresh local readiness evidence, docs promotion and passport accepted; canonical merge remains the next gate, external delivery remains unopened.'
  - version: '0.4.0'
    date: '2026-08-02'
    changes: 'Readiness bootstrap revalidated in exact feature worktree; SCN-001/docs/passport и final delivery gates оставались в работе.'
  - version: '0.3.0'
    date: '2026-08-02'
    changes: 'Подтверждены canonical workspace bootstrap receipt, local PostgreSQL compose, fail-closed reset/seed boundary и local-only quality/browser checks; delivery policy не открыта.'
  - version: '0.2.0'
    date: '2026-08-01'
    changes: 'В plan для PRT-001 определены project-owned bootstrap policy, local-only secrets boundary и runbook; foundation tooling ещё не запускался.'
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Создана компактная карта подтверждённого нулевого операционного состояния.'
---

# Операции

Foundation CODE выполнялся в feature worktree `/Users/deksden/.dd-flow/projects/PRJ-001-dd-tasks/checkouts/worktrees/PRT-001-checkpoint-01-foundation/manual-protocol/dd-tasks` на ветке `feature/prt-001-checkpoint-01-foundation`, от base `739fd2bc3665257f70e9680bce2abf17144a146f`. После readiness canonical merge fast-forward интегрировал commit `a03169559e60767042c9a39829adae9f9ff8228f` в stable `main`; checkout и feature worktree чистые.

Canonical bootstrap script устанавливает workspace dependencies и поднимает isolated local PostgreSQL через `docker compose`; фактический receipt и pipeline projection находятся в `RUN-003.../03-code/`. Default port — `55433`, потому что внешний локальный процесс занимал исходный plan default `55432`; внешний процесс не останавливался.

Reset принимает только loopback и `dd_tasks_foundation_local/test` targets, отвергает remote/production-like/unrecognized targets до mutation; seed технически `not_applicable`, так как product entities в checkpoint нет. Public errors/value-absence scan не раскрывают credentials, paths или internals.

README запрещает коммитить секреты и машинно-зависимые значения; `.env.example`
содержит только public local defaults. Bootstrap implementation и readiness
revalidation receipts прошли в exact local contour; свежие scenario/docs/passport
checks приняты для этого контура. Для текущего protocol user-authorized degraded
direct fixation задаёт tag `checkpoint-01-foundation`, `main` → `origin/main` и
tag → `origin` без force; remote verification появится только после фактического
push в RUN-005. CI, release, deploy и production не заявляются.
