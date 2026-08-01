---
file: '.memory-bank/spec/operations/index.md'
description: 'Подтверждённое нулевое состояние Git и контуров поставки dd-tasks.'
purpose: 'Фиксирует только текущие операционные факты до появления реализации и delivery-конфигурации.'
version: '0.1.0'
date: '2026-08-01'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/index.md'
tags: [dd-tasks, operations, git, zero-checkpoint]
history:
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Создана компактная карта подтверждённого нулевого операционного состояния.'
---

# Операции

Репозиторий находится на ветке `main` и имеет remote `origin`. Аннотированный тег `checkpoint-00-initial` обозначает неизменяемый начальный checkpoint; согласно README, каждый будущий checkpoint должен быть создан на чистом commit и содержать согласованные артефакты.

В текущем checkpoint нет application-кода, package workspace, CI/CD- и deploy-конфигураций, runtime-окружений, release/publish-потоков, миграций, секретных конфигураций или project-owned команд. Поэтому отдельные runbook-и, policy для deploy/release/publish, rollback и operational-access не создаются: для них нет подтверждённых project sources.

README запрещает коммитить секреты и машинно-зависимые значения. Конкретные правила feature-веток, PR, CI-проверок, окружений, выпуска и поставки должны быть подтверждены до их появления в активных операционных документах.
