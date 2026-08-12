# Prime Scouts

Эта папка хранит аспекты быстрой разведки для `prime`.

Scout-субагент не принимает решений, не планирует реализацию и не меняет файлы. Его задача - быстро собрать факты по одному аспекту, чтобы оркестратор `prime` мог сформировать профиль процесса (flow profile).

## Invocation Contract

Каждый independently launched scout получает fresh-session packet: `common_prompt: .memory-bank/dd-flow/common/worker-session.md`, ровно один выбранный scout файл как `role_prompt`, bounded `read`, `write: read_only`, отдельный `write_report_to` и named orchestration acceptance owner. Packet маршрутизирует к этому index и выбранному аспекту; он не заменяет scout prompt inline-инструкцией.

## Общий формат отчёта

```markdown
# Prime scout report: <aspect>

## Источники

- ...

## Найдено

- ...

## Затронутые зоны

- ...

## Риски и неясности

- ...

## Вопросы к пользователю

- только блокирующие

## Рекомендация для flow profile

- включить:
- не включать:
- повысить, если:
```

## Аспекты

- [Memory Bank](memory-bank.md): фичи, эпики, спецификации, сценарии, UI, guides и правила MBB.
- [Code Surface](code-surface.md): зона кода, пакеты, публичные контракты, code-to-doc ссылки.
- [Patterns](patterns.md): аналогичные места и локальные паттерны проекта.
- [Verification](verification.md): тесты, сценарии, команды проверки, evidence.
- [Operations](operations.md): Git, ветки, PR, CI, preview, beta, deploy, rollback.
- [Risk](risk.md): данные, безопасность, приватность, публикации, деньги, внешние провайдеры.
