---
file: '.memory-bank/spec/operations/index.md'
description: 'Подтверждённый local operational contour dd-tasks через checkpoint-02-core.'
purpose: 'Фиксирует bootstrap, safety boundaries, evidence contour и ещё не открытые delivery policies.'
version: '1.0.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/index.md'
children:
  - .memory-bank/spec/operations/workspace-bootstrap-policy.md
  - .memory-bank/spec/operations/secrets-policy.md
  - .memory-bank/spec/operations/runbooks/workspace-bootstrap.md
tags: [dd-tasks, operations, git, checkpoint-02, local]
history:
  - version: '1.0.0'
    date: '2026-08-03'
    changes: 'Project policy теперь требует удалять clean fully-merged protocol worktree и локальную feature-ветку; retention остаётся только явным исключением.'
  - version: '0.9.0'
    date: '2026-08-03'
    changes: 'PRT-003 fast-forward integrated into local stable main; post-merge checks and annotated local checkpoint-02-core fixation passed, remote remained unchanged.'
  - version: '0.8.0'
    date: '2026-08-03'
    changes: 'Checkpoint-02 добавил guarded migrate/reset/seed product contour, deterministic SCN-002 fixtures и isolated Playwright ports; deploy/CI остаются вне scope.'
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

Checkpoint-02 CODE выполняется только в feature worktree
`feature/prt-003-checkpoint-02-core`; stable `main` изменяется только canonical
merge flow после readiness. Runtime управляется штатным `dd-flow` CLI 0.4.0,
без ручной правки DB/JSON.

Local PostgreSQL остаётся на loopback `55433`. `pnpm db:migrate`, `db:reset`,
`db:seed` и `db:check` требуют exact `local`/`test` target profile; remote,
production-like и неизвестные базы отклоняются до mutation. Migration ledger
проверяет checksum и использует transaction-level advisory lock. Детерминированный
seed создаёт три account, два workspace, три membership, active/archived projects
и tasks для owner/member/non-member acceptance. Это тестовые данные, не
production provisioning.

`pnpm test:browser` владеет портами API `8788` и web `4174`, перед запуском
восстанавливает SCN-002 world и не переиспользует посторонний server. Существующий
исторический localhost process на `8787` не останавливается и не считается
evidence этого checkpoint.

Bootstrap implementation/readiness и merge receipts принадлежат RUN-298.
Implementation content `5027fa1` fast-forward integrated into local `main`;
fresh stable-root checks passed and annotated tag `checkpoint-02-core` fixes the
closure snapshot. Origin was read back but not mutated. CI setup, Exe.dev,
release и production deployment не открыты.

Завершённые protocol feature worktree больше не сохраняются по умолчанию.
После terminal merge merge flow применяет cleanup gate из
`.memory-bank/project-policy.md`: clean worktree с полностью вошедшим в `main`
HEAD удаляется вместе с merged локальной feature-веткой, если для него нет
явного retention-исключения. Dirty, unmerged, active или неоднозначно
принадлежащие checkout остаются fail-safe и получают recorded next action.

При принятии политики проверены и удалены два прежних clean fully-merged
worktree: `PRT-001` (`a031695`) и `PRT-003` (`5027fa1`). Их локальные
feature-ветки удалены обычным `git branch -d`; оба commit остаются достижимы из
`main`, а `git worktree list` содержит только stable checkout.

## История foundation

Foundation CODE выполнялся в feature worktree `/Users/deksden/.dd-flow/projects/PRJ-001-dd-tasks/checkouts/worktrees/PRT-001-checkpoint-01-foundation/manual-protocol/dd-tasks` на ветке `feature/prt-001-checkpoint-01-foundation`, от base `739fd2bc3665257f70e9680bce2abf17144a146f`. После readiness canonical merge fast-forward интегрировал commit `a03169559e60767042c9a39829adae9f9ff8228f` в stable `main`; checkout и feature worktree чистые.

Foundation установил canonical bootstrap и выбрал port `55433`, не останавливая
внешний процесс на исходном default. Его zero-entity seed был корректен только
для checkpoint-01 и заменён product fixtures checkpoint-02; historical tag и
published commit не переписываются.
