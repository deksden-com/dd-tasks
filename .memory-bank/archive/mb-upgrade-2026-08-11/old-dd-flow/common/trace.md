# Файловый след prompt-а

Каждый prompt, который запускает практическую работу, меняет состояние пайплайна, создаёт или обновляет протокол, ставит задачи субагентам, выполняет проверки, интеграцию, merge, аудит, init, upgrade, fix или distill, должен оставить файловый след.

След нужен не для бюрократии. Его задача - дать следующему агенту короткую проверяемую трассу: что было начато, в каком контексте, чем завершилось, какие файлы и проверки реально затронуты.

## Где писать

Если есть активный протокол, пиши след внутри него:

```text
protocol/<PRT-ID>/trace/
├── <timestamp>-<prompt>-start.md
└── <timestamp>-<prompt>-report.md
```

Если канон уже скопирован в проектный Memory Bank, путь будет проектным:

```text
.memory-bank/protocol/<PRT-ID>/trace/
├── <timestamp>-<prompt>-start.md
└── <timestamp>-<prompt>-report.md
```

Если protocol ещё не создан, но практическая задача уже появилась, временный стартовый след можно положить в рабочую папку текущего flow:

```text
.tasks/dd-flow-trace/<timestamp>-<prompt>-start.md
```

После создания протокола перенеси или кратко перескажи этот стартовый след в `protocol/<PRT-ID>/trace/` либо в `summary.md`. Не оставляй единственный важный след задачи только в `.tasks/`.

Если пользователь задал исследовательский вопрос без практической задачи и протокол намеренно не создаётся, пиши след только когда исследование заметное или полезно для продолжения:

```text
.tasks/dd-flow-trace/<timestamp>-<prompt>-research-report.md
```

В навигационном блоке укажи `protocol: исследование - без протокола`.

## Когда писать

В начале prompt-а, после первичного чтения состояния и до значимых изменений, создай start record.

Перед итоговым докладом создай report record.

Для микроправки след может быть очень коротким: несколько полей в start и report. Не запускай полный план только ради trace. Но если prompt уже меняет файлы или состояние, запись начала и завершения обязательна.

Если prompt завершился блокером, report всё равно нужен: он объясняет, где остановились, что уже проверено, какое решение пользователя или `DEF-*` требуется.

## Start Record

Минимальный шаблон:

```markdown
# Prompt start: <prompt>

- timestamp:
- prompt:
- protocol:
- cwd:
- branch_or_worktree:
- trigger:
- understood_objective:
- current_stage:
- expected_next_action:
- route:
- scope_boundaries:
- assumptions:
- blockers:
```

Для `prime` дополнительно зафиксируй исходную пользовательскую хотелку и темы фокусировки контекста. Для merge-сессии зафиксируй `project_root`, `worker_id`, lane lock и состояние очереди. Для worker-а зафиксируй task packet, границы записи и путь отчёта.

## Report Record

Минимальный шаблон:

```markdown
# Prompt report: <prompt>

- timestamp:
- prompt:
- protocol:
- completed_stage:
- next_action:
- status:
- files_changed:
- state_changed:
- checks:
- evidence:
- verification:
- review:
- blockers:
- active_def:
- user_decision_required:

## Summary

...
```

`verification` отвечает, соответствует ли результат задаче, плану, сценарию или gate. `review` отвечает, соответствует ли изменённая сущность требованиям качества. Если одно из них неприменимо, так и напиши.

## Связь с summary и evidence

Trace - это хронологический рабочий след. Он не заменяет:

- `protocol/<PRT-ID>/summary.md` как главный быстрый вход;
- паспорта проверки (verification passports);
- матрицу проверки;
- ADR, specs, сценарии и другие долговечные источники истины.

Если в trace найден долговечный факт, подними его в правильный раздел Банка памяти и обнови `summary.md` ссылкой. Если trace содержит только операционный ход работы, он остаётся в `protocol/<PRT-ID>/trace/`.

Если факт пришёл из raw user intake или knowledge candidate, trace/report должен сохранять provenance:

- `INPUT-*` или redacted input marker;
- `KND-*`, если candidate был создан;
- plan/code task, где candidate учитывался;
- merge promotion status.

Не превращай raw trace или candidate quote в durable Memory Bank truth без merge-time promotion.

Не делай активные документы зависимыми от `.tasks/dd-flow-trace/...`. В активных документах ссылайся на `protocol/<PRT-ID>/trace/...` или на curated summary/evidence.

## Навигационный блок

В итоговом докладе prompt-а добавь ссылки на след:

```markdown
- trace_start:
- trace_report:
```

Если след не создавался, укажи причину: `N/A - read-only quick answer without practical task`, `N/A - no protocol research, no durable trace needed` или другую конкретную формулировку.
