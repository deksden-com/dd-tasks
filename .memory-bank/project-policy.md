---
file: '.memory-bank/project-policy.md'
description: 'Компактная карта политик, влияющих на маршрутизацию работ, Git cleanup и local delivery.'
purpose: 'Собирает подтверждённые правила Git, checkpoint fixation и безопасного удаления завершённых worktree.'
version: '0.2.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/index.md'
tags: [dd-tasks, policy, git]
history:
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

Подтверждено: main отслеживает origin/main; checkpoint-00-initial — неизменяемый аннотированный тег; каждый будущий checkpoint должен содержать согласованные код, тесты, фикстуры, миграции и Банк памяти; секреты не коммитятся; .tasks не публикуется.

Для mb-init пользователь выбрал публикацию активного Банка памяти напрямую в main; .tasks остаётся локальной рабочей зоной. Это решение относится к инициализации и не устанавливает постоянную стратегию для будущих изменений.

Подтверждено для `PRT-001-checkpoint-01-foundation`: project-owned bootstrap policy/runbook/script материализованы, implementation receipt записан в `RUN-003`, а readiness обязан создать свежую revalidation receipt для текущего checkout перед project tooling. Это не создаёт постоянную CI/release policy.

Не подтверждены: постоянная модель pull request, CI, окружения, release/deploy и check profiles. Для `PRT-001-checkpoint-01-foundation` пользователь отдельно авторизовал `direct_commit_push`: annotated tag `checkpoint-01-foundation`, `main` → `origin/main`, tag → `origin`, remote `https://github.com/deksden-com/dd-tasks.git`, без force. Это scoped degraded bypass только для сломанного requeue/merge-queue completion contour CLI `0.4.0`, не постоянная Git/release policy; remote readback фиксируется только после фактического push в RUN-005.

CLI `0.4.0` не завершает requeue/merge-queue contour для этого protocol: исторический queue item `185` сохранён как `cancelled` с audit trail, а новый item не создаётся, пока cancelled binding остаётся. Разрешён только этот protocol-scoped queue bypass; runtime state вручную не редактируется.

README подтверждает маршрут protocol → specify → plan → code → readiness → merge, сохранение verification evidence и обновление Memory Bank в том же accepted commit. Hidden eval materials не входят в проектную истину. Реализация остаётся простой и conventional; shared package появляется только при реальном sharing; platform/database constraints предпочтительнее custom infrastructure. До явной потребности не добавляются background jobs, cron, polling, billing, analytics или deployment machinery. Будущие root-команды должны детерминированно покрывать format, lint, typecheck, test, build, reset и e2e; это planned contract, не текущие установленные команды.

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
обычный `git branch -d`. `--force`, удаление dirty/unmerged worktree и удаление
remote branch этой политикой не разрешены. Unsafe или неясный target сохраняется,
но merge report обязан указать причину и точное следующее действие.
