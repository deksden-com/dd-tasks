---
file: '.memory-bank/project-policy.md'
description: 'Компактная карта политик, влияющих на маршрутизацию работ.'
purpose: 'Собирает подтверждённые правила Git и известные gaps.'
version: '0.1.1'
date: '2026-08-01'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/index.md'
tags: [dd-tasks, policy, git]
history:
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

Не подтверждены: модель feature-веток и pull request, cleanup веток, CI, окружения, release/deploy и check profiles. Политику публикации Git нужно определить, когда будущая работа потребует публикации изменений.

README подтверждает маршрут protocol → specify → plan → code → readiness → merge, сохранение verification evidence и обновление Memory Bank в том же accepted commit. Hidden eval materials не входят в проектную истину. Реализация остаётся простой и conventional; shared package появляется только при реальном sharing; platform/database constraints предпочтительнее custom infrastructure. До явной потребности не добавляются background jobs, cron, polling, billing, analytics или deployment machinery. Будущие root-команды должны детерминированно покрывать format, lint, typecheck, test, build, reset и e2e; это planned contract, не текущие установленные команды.
