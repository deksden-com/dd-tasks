---
file: '.memory-bank/spec/engineering/index.md'
description: 'Подтверждённое инженерное состояние dd-tasks на исходном checkpoint-00-initial.'
purpose: 'Не даёт принять планируемый стек и проверки за уже действующие инженерные правила.'
version: '0.1.0'
date: '2026-08-01'
status: 'ACTIVE'
c4_level: 'documentation'
index_type: 'shallow'
coverage_depth: 1
parent: '.memory-bank/spec/index.md'
content_state: 'compact_stub'
canonical_template: '.memory-bank/mbb/coding-standards-guide.md'
activation_triggers:
  - 'появление package/workspace manifest или lockfile'
  - 'появление исходного кода, конфигурации проверок либо CI'
  - 'принятый протокол, устанавливающий проверяемое инженерное правило'
implementation_files: []
test_files: []
tags: [dd-tasks, engineering, initial-state, checkpoint-00]
history:
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Создан компактный инженерный индекс исходного checkpoint.'
---

# Инженерный слой

На `checkpoint-00-initial` в репозитории нет кода приложения, package workspace, lockfile, конфигураций сборки, форматирования, линтинга, typecheck, тестов, CI или исполняемых команд разработки. Поэтому действующий стек, package manager, стандарты кода, тестовая стратегия и обязательные проверки пока не подтверждены.

README задаёт направление первой стадии реализации, включая TypeScript-монорепозиторий и предполагаемые инструменты. Это будущая работа, а не текущий инженерный контракт; данный индекс не фиксирует эти инструменты как установленные или обязательные.

## Раскрытие слоя

После появления подтверждённых manifest/config/code/test/CI-источников добавляйте сюда только проверяемые команды, правила и traceability-связи. Документационные теги (`@doc`, `@feature`, `@scenario`, `@adr`, `@spec`) и lint-правила не вводятся до появления исходников и детерминированной основы для них.
