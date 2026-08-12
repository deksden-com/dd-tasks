---
file: '.memory-bank/project-policy.md'
description: 'Компактная карта политик, влияющих на маршрутизацию работ, Git cleanup и local delivery.'
purpose: 'Собирает подтверждённые правила Git, checkpoint fixation, deploy handoff и безопасного удаления завершённых worktree.'
version: '0.6.0'
date: '2026-08-12'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/index.md'
tags: [dd-tasks, policy, git]
history:
  - version: '0.6.0'
    date: '2026-08-12'
    changes: 'Добавлен компактный routing для Memory Bank 3.1.0, flow-contract@6 и требуемого CLI/router/engine 0.6.0; package.json и продуктовый release contour не изменены.'
  - version: '0.5.0'
    date: '2026-08-05'
    changes: 'Deploy разрешён только после commit/push exact main и immutable checkpoint tag с remote readback; superseded preview volumes удаляются после принятия нового runtime.'
  - version: '0.4.0'
    date: '2026-08-04'
    changes: 'PRT-004 adds a bounded local/private preview contour and a separate Exe.dev deploy overlay; source readiness still stops before merge/provider mutation.'
  - version: '0.3.0'
    date: '2026-08-03'
    changes: 'Формализована branch strategy: stable main, protocol-scoped feature worktree, direct route для малых безопасных правок, fast-forward integration, checkpoint push/tag и cleanup.'
  - version: '0.2.1'
    date: '2026-08-03'
    changes: 'Cleanup дополнен удалением exact remote feature branch после доказанного попадания её tip в remote integration branch.'
  - version: '0.2.0'
    date: '2026-08-03'
    changes: 'Установлен default-delete для чистых полностью merged protocol worktree; retention разрешён только как явное исключение с причиной.'
  - version: '0.1.4'
    date: '2026-08-02'
    changes: 'Для PRT-001 авторизован scoped degraded direct fixation из-за requeue/merge-queue defect в dd-flow CLI 0.4.0; exact Git targets и queue-evidence раскрыты, permanent release policy не создана.'
  - version: '0.1.3'
    date: '2026-08-02'
    changes: 'Bootstrap policy/runbook/script и implementation receipt promoted в source-backed foundation contour; readiness revalidation остаётся отдельным gate.'
  - version: '0.1.2'
    date: '2026-08-01'
    changes: 'Добавлены ссылки на plan-owned workspace bootstrap policy/runbook для foundation code gate без объявления tooling текущим поведением.'
  - version: '0.1.1'
    date: '2026-08-01'
    changes: 'Зафиксирована публикация начального Банка памяти в main.'
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Создана из README и Git preflight.'
---

# Политика проекта

Подтверждено: main отслеживает origin/main; checkpoint-00-initial — неизменяемый аннотированный тег; каждый будущий checkpoint должен содержать согласованные код, тесты, фикстуры, миграции и Банк памяти; секреты не коммитятся; .tasks не публикуется. Провайдерный deploy никогда не выполняется из local-only состояния: задеплоен может быть только exact commit, уже опубликованный в `origin/main` и закреплённый immutable checkpoint tag.

Для mb-init пользователь выбрал публикацию активного Банка памяти напрямую в main; .tasks остаётся локальной рабочей зоной. Это решение относится к инициализации и не устанавливает постоянную стратегию для будущих изменений.

Подтверждено для `PRT-001-checkpoint-01-foundation`: project-owned bootstrap policy/runbook/script материализованы, implementation receipt записан в `RUN-003`, а readiness обязан создать свежую revalidation receipt для текущего checkout перед project tooling. Это не создаёт постоянную CI/release policy.

Не подтверждены: CI, окружения, release/deploy и check profiles. Для `PRT-001-checkpoint-01-foundation` пользователь отдельно авторизовал `direct_commit_push`: annotated tag `checkpoint-01-foundation`, `main` → `origin/main`, tag → `origin`, remote `https://github.com/deksden-com/dd-tasks.git`, без force. Это scoped degraded bypass только для сломанного requeue/merge-queue completion contour CLI `0.4.0`, не постоянная release policy; remote readback фиксируется только после фактического push в RUN-005.

CLI `0.4.0` не завершает requeue/merge-queue contour для этого protocol: исторический queue item `185` сохранён как `cancelled` с audit trail, а новый item не создаётся, пока cancelled binding остаётся. Разрешён только этот protocol-scoped queue bypass; runtime state вручную не редактируется.

README подтверждает маршрут protocol → specify → plan → code → readiness → merge, сохранение verification evidence и обновление Memory Bank в том же accepted commit. Hidden eval materials не входят в проектную истину. Реализация остаётся простой и conventional; shared package появляется только при реальном sharing; platform/database constraints предпочтительнее custom infrastructure. До явной потребности не добавляются background jobs, cron, polling, billing, analytics или deployment machinery. Будущие root-команды должны детерминированно покрывать format, lint, typecheck, test, build, reset и e2e; это planned contract, не текущие установленные команды.

## Memory Bank и flow compatibility

- Активный Memory Bank marker: `3.1.0`; migration window: `3.0.0 → 3.1.0`; canonical source commit: `6cfaeaa4d4c9c4a5d2b932cb92370dbfd1464bf6`.
- Активный curated flow pack использует `flow-contract@6` и требует совместимые `dd-flow` CLI/router/engine `0.6.0`. Для обычной задачи текущий bootstrap route — `dd-flow stage start --bootstrap --stage specify`, а stage finish принимает CLI-owned `--outcome`.
- Product version source — `package.json` (`0.1.0`). Memory Bank upgrade не меняет product version и не создаёт product changelog/release entry.
- Static file sync не доказывает runtime/home migration. `DEF-MBU-RUNTIME-ACTIVE-STATE` остаётся владельцем gated follow-up; SQLite, runtime JSON и control-plane state не редактируются вручную.

## Git branch strategy

`main` — единственная постоянная integration, continuation и default branch.
`origin/main` — каноническое опубликованное состояние. Долгоживущие `develop`,
`release/*` и `hotfix/*` не используются; вводить их можно только отдельным
решением с обновлением этой политики.

Полноценная продуктовая, контрактная, многозонная или иная существенная работа
по протоколу использует `feature_worktree`. Для неё создаётся одноразовая ветка
`feature/<protocol-slug>`, где protocol slug начинается с lowercase PRT ID,
например `feature/prt-003-checkpoint-02-core`. В одном worktree этой ветки
последовательно живут protocol, SPECIFY, PLAN, CODE, readiness, продуктовые
изменения и evidence. Отдельные ветки на стадии одного протокола не создаются.

`integration_branch_direct` допустим только для малой, безопасной и связной
правки документации, политики или tooling, когда отдельный merge-контур не даёт
пользы. Выбор direct route фиксируется Git preflight или protocol summary. Direct
route не отменяет проверки, commit evidence и необходимый remote readback.

Предпочтительная интеграция feature-ветки — fast-forward в актуальный `main`
после успешного readiness. Если `main` разошёлся с feature branch, интеграция
останавливается для явного безопасного обновления/rebase и повторной проверки;
скрытый merge commit или force-update не создаётся. Pull request не является
маршрутом по умолчанию и применяется только по явному решению пользователя или
для отдельного eval-сценария.

Полный checkpoint delivery идёт в порядке: merge в `main`, post-merge checks,
push exact `main` в `origin/main` с readback, создание immutable annotated tag
`checkpoint-NN-<slug>` на принятом commit, push exact tag с readback, затем
cleanup одноразовых worktree и feature-веток. Если пользователь явно выбрал
local-only fixation, protocol не заявляет remote delivery, а незавершённые push
и tag фиксируются как точные следующие действия; такой local-only результат
никогда не передаётся в deploy. Force push и изменение уже
опубликованного checkpoint tag запрещены.

## Deploy source gate

Любой deploy на Exe.dev или другой preview provider начинается только после
полного checkpoint delivery. Минимальный порядок такой:

1. принять чистый `main` после merge и post-merge checks;
2. выполнить `git push origin main` и прочитать обратно exact SHA
   `origin/main`;
3. создать immutable annotated tag `checkpoint-NN-<slug>` на том же SHA,
   выполнить `git push origin <tag>` и прочитать обратно exact tag target;
4. передать в deploy handoff remote URL, branch, tag, commit SHA и artifact
   digest; `/api/ready` обязан вернуть тот же source SHA и digest;
5. при любом mismatch, failed push/readback или отсутствии tag deploy
   останавливается до исправления Git delivery.

Provider deploy не делает Git push сам: он потребляет уже опубликованный
checkpoint, а источник для transfer всё равно сверяется с зафиксированным SHA.

## Cleanup feature worktree

После успешного merge одноразовый protocol feature worktree по умолчанию
удаляется. Сохранять его можно только как явное retention-исключение с причиной,
владельцем и датой пересмотра. Текущих retention-исключений нет.

Merge cleanup удаляет worktree только когда одновременно доказано:

- protocol terminal-успешен, а его merge queue завершена как `merged` либо
  durable closure фиксирует явно авторизованный degraded merge без queue;
- feature HEAD является предком integration branch `main`;
- worktree чистый и не является stable/current/protected checkout;
- нет активной flow session, lane lock или waiter для protocol/worktree;
- путь точно известен и принадлежит этому protocol;
- durable code, Memory Bank и merge evidence уже находятся в `main` или RUN home.

Порядок cleanup: удалить exact worktree штатным `git worktree remove`, выполнить
`git worktree prune`, затем удалить полностью merged локальную feature-ветку через
обычный `git branch -d`. Если delivery включает push, после `git fetch --prune`
также удаляется exact remote feature branch через `git push origin --delete`
только когда её tip доказанно является предком `origin/main`, а ref не является
default/protected branch. Удаление подтверждается remote readback.

`--force`, удаление dirty/unmerged worktree и remote branch до попадания её tip в
remote integration branch не разрешены. Если push не входит в текущий scope либо
target unsafe или неясен, ветка сохраняется, а merge report фиксирует причину и
точное следующее действие. Для deploy отсутствие push/tag/readback является
блокером, а не основанием для direct/local-only обхода.
