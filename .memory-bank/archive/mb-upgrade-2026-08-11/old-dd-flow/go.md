# Go: диспетчер следующего шага пайплайна

Этот prompt можно запускать как `/go`. Он не является отдельной фазой разработки. Его задача - определить текущее состояние работы и выполнить следующий корректный шаг пайплайна.

`/go` отвечает на вопрос:

```text
где мы сейчас, что является следующим безопасным шагом и можно ли его выполнять прямо сейчас
```

## Что прочитать сначала

Всегда прочитай:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/entity-ids.md`
- `.memory-bank/dd-flow/common/workspace-layout.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/dd-flow/common/goal-traceability.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/common/subagents.md`

Если следующий шаг может менять файлы, ветки, протоколы или запускать интеграционные действия, дополнительно прочитай:

- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/workers/protocol-archive.md`, если нужно архивировать закрытый протокол

Затем прочитай проектные входы:

- `.memory-bank/index.md`
- `.memory-bank/structure.md`, если есть
- `.memory-bank/protocol/index.md`, если есть
- `.memory-bank/mbb/index.md`

## Язык пользовательских артефактов

Сразу после чтения `common/style.md` зафиксируй `target_language`: язык текущего пользовательского prompt-а, если пользователь явно не попросил другой язык. Все пользовательские ответы, routing summaries, dashboard-и, handoff-документы и curated summaries пиши на `target_language`.

Внутренние task packets, raw evidence, JSON keys, code identifiers и HTML/CSS/JS шаблоны могут оставаться английскими. Если внутренний материал показывается пользователю напрямую, синтезируй или переведи пользовательский слой на `target_language`.

Субагентов использовать разрешено при необходимости. `/go` может запускать scouts, workers или verifiers только когда это соответствует следующему безопасному шагу выбранного flow; если он лишь маршрутизирует работу, достаточно зафиксировать, какие субагенты будут нужны следующей фазе.

Перед выбором следующего шага выполни active DEF preflight из `common/memorybank.md`. `/go` не должен маршрутизировать работу мимо relevant `DEF-*`: если DEF представляет нерешённую задачу или решение, которое меняет понимание пользовательского запроса, сначала подними это как context/user decision; если DEF блокирует следующий gate, следующий шаг - closure/blocker/user decision, а не механический переход дальше; если DEF не блокирует текущий gate, зафиксируй это в навигационном блоке.

## Разрешение протокола

Перед выбором следующего шага всегда определи, с каким протоколом работает `/go`.

Протокол - это долговечная рабочая сессия задачи. Его `summary.md` хранит состояние этой сессии: запрос пользователя, понимание задачи, `flow_profile`, текущую стадию, следующий шаг, блокеры, `DEF-*`, проверки, evidence, Git-контур и итоговый статус.

Действуй так:

1. Если пользователь явно указал `PRT-*`, файл протокола или папку протокола, работай с ним.
2. Если в текущем контексте уже выбран один активный протокол, продолжай его.
3. Если в `protocol/index.md` или активной папке `protocol/` видно несколько активных протоколов и нельзя уверенно выбрать текущий, остановись и попроси пользователя выбрать протокол. Не продолжай по случайно последнему файлу.
4. Если протокола нет, но пользователь дал задачу, `/go` должен выполнить priming/focus при необходимости и запустить `protocol.md`; `protocol.md` создаёт новый протокол или обновляет явно выбранный существующий протокол.
5. Если протокола нет и задачи нет, протокол не создаётся: `/go` выполняет только прайминг или исследовательский ответ.

Если пользователь прямо просит "оформи протокол" / "создай протокол", `/go` не должен считать это уже оформленной работой. Он обязан маршрутизировать в `protocol.md`, чтобы `protocol.md` создал `PRT-*`, зафиксировал scope и перевёл работу в `specify`.

Если новый протокол должен работать в `route.git: feature_worktree`, `/go` не должен создавать `protocol/PRT-*` в интеграционной ветке заранее. Он запускает `protocol.md`, а тот сначала выбирает Git-контур, создаёт/инициализирует worktree по `common/git-ops.md`, и только затем публикует протокол внутри feature-worktree.

Если `protocol.md` создал или выбрал feature-worktree, а текущая Codex session всё ещё запущена из интеграционного checkout, `/go` обязан до остановки выполнить handoff в feature-worktree. Handoff состоит из двух частей:

1. Механически зарегистрировать runtime-протокол через `dd-flow protocol register "<protocol-id>" --project-root "<stable-project-root>" --workspace-path "<feature-worktree>" --json`.
2. Создать минимальный файловый workspace протокола в feature-worktree: `.memory-bank/protocol/<protocol-id>/summary.md` и, если нужны trace-файлы, `.memory-bank/protocol/<protocol-id>/trace/`.

Runtime state в `~/.dd-flow` не заменяет файловый MemoryBank-протокол. `summary.md` должен существовать до остановки stable-root session и содержать минимум: исходный запрос, понимание задачи, `task_profile`/route draft, stable project root, feature branch/worktree, base commit, bootstrap status, ссылки на `.tasks` trace/grounding из stable root, текущую стадию `specify` или `interactive`, следующий шаг, блокеры и дату обновления. Для experiment flow следующий шаг должен быть командой `dd-flow-exp start <EXP-ALIAS> --phase code`; для обычного проекта - конкретной командой запуска Codex из `worktree_path`. Если в feature-worktree уже есть `.memory-bank/protocol/index.md`, добавь туда ссылку на новый протокол; если индекса нет, создай компактный индекс.

Эти файловые записи допустимы из stable-root session, потому что они являются handoff-документами в целевом worktree, а не реализацией продукта. После записи обязательно проверь `test -s "<feature-worktree>/.memory-bank/protocol/<protocol-id>/summary.md"`, затем переведи runtime protocol из `registered` в `specify` или `interactive` через `dd-flow protocol transition "<protocol-id>" --to <stage> --payload-file <payload> --json`. Payload должен содержать `next_action`, route, workspace с `worktree_path`, `feature_branch`, `integration_branch`, `base_commit`, `protocol_location`, а также `blockers: []` и `active_def: []`. Legacy alias `dd-flow transition ... --json-file <payload>` допустим только для старых CLI/scripts; новые prompt-ы используют `protocol transition`.

После transition проверь `dd-flow protocol status "<protocol-id>" --json`, обнови dashboard и штатно останови обе planning session записи, если они регистрировались: реальный Codex `session_id` и logical `session_id = <protocol-id>`. Используй `dd-flow session stop --project-root "<stable-project-root>" --session-id "<session-id>" --reason "stable-root planning handoff complete; next command is <command>" --json`. Только после этого заверши ответ с навигационным отчётом. Следующий шаг не выполняется в этой session: пользователь должен запустить Codex заново с `-C <worktree_path>` или через `dd-flow-exp start <EXP-ALIAS> --phase code` для experiment flow. Это защищает `apply_patch` и другие file-edit tools от записи в неправильный checkout и не даёт Stop hook повторять уже завершённый planning handoff.

Если пользователь задал исследовательский вопрос без задачи, изменения, аудита, апгрейда, фикса или намерения вести практическую работу, работай без протокола. В навигационном блоке укажи:

```text
protocol: исследование - без протокола
```

Такой режим допустим для вопросов вроде "где у нас описаны сценарии?", "как устроен этот раздел Банка памяти?", "что означает этот термин?", "какие документы почитать перед задачей?". Если в ходе ответа исследовательский вопрос превращается в практическую задачу, остановись, назови это изменение режима и создай протокол через `protocol.md` или `interactive.md`.

## Старт новой сессии

Если сессия свежая и проектный контекст ещё не загружен, сначала выполни прайминг (priming):

1. Прочитай `.memory-bank/dd-flow/f.md`.
2. Загрузи главный индекс Банка памяти, структуру, MBB и карту ключевых разделов.
3. Доложи коротко, что является главным входом и где искать продуктовые, системные, инженерные, UI, сценарные и эксплуатационные правила.

Если пользователь пока не дал конкретной задачи, на этом остановись. Не запускай `protocol.md` без задачи и не создавай протокол.

Если пользователь дал задачу в этой же сессии или сразу вместе с `/go`, после прайминга выполни фокусировку контекста.

Если прайминг уже был выполнен раньше, а пользователь только теперь дал задачу, не повторяй полный вход в проект без причины. Сразу сделай фокусировку контекста по новой задаче, затем запускай `protocol.md` или `interactive.md`.

## Фокусировка контекста

Фокусировка контекста нужна перед `protocol.md`, если задача пользователя уже известна.

Её цель - не планировать реализацию, а подготовить достаточно проектного контекста, чтобы `protocol.md`/`specify` не работали вслепую.

Действуй так:

- выдели темы из запроса пользователя: UI, API, клиентский набор методов (SDK), сценарии, данные, операции, Банк памяти, тесты, конкретная фича или документ;
- прочитай релевантные разделы Банка памяти;
- посмотри похожие места в коде или документах, если это нужно для понимания зоны;
- если запрос про UI, найди связанные UI-документы, экранные контракты, компоненты, сценарии и клиентскую логику;
- если запрос про API/SDK/CLI/TUI/GUI/MCP, проверь, не действует ли правило SDK-first;
- если запрос про баг или внешнюю библиотеку, отметь, может ли понадобиться research.

Если фокусировка требует заметного исследования или параллельной разведки, можно запустить scout-субагентов по правилам `.memory-bank/dd-flow/common/subagents.md`. Для каждого scout-а выбери существующий специализирующий файл из `.memory-bank/dd-flow/prime/scouts/`, создай bounded read-only packet с `common_prompt: common/worker-session.md`, выбранным `role_prompt`, `read`, `write: read_only`, `write_report_to` и acceptance owner. Не запускай generic scout по одной inline-фразе. Scout-ы не меняют файлы и не планируют реализацию.

После фокусировки запускай `protocol.md`, если пользователь хочет обычный поток, или `interactive.md`, если пользователь явно хочет быстрый интерактивный режим.

## Источники состояния

Чтобы понять следующий шаг, найди состояние пайплайна:

- выбранный протокол или режим `исследование - без протокола`;
- факт прайминга текущей сессии: был ли прочитан главный индекс Банка памяти, структура и MBB;
- фокусировку текущего запроса: изучены ли релевантные документы, кодовые зоны, сценарии, операции и проверки;
- текущая сессия и последнее намерение пользователя;
- активный `protocol/<PRT-ID>/summary.md`;
- `protocol/index.md`;
- `<run-home>/01-specify/stage-report.json`, resolved через `dd-flow run status --json` / `run-index.json`;
- `.tasks/prime-.../flow-profile.md` как legacy fallback;
- `.tasks/plan-.../phase-summary.md`;
- последние отчёты `plan`, `implementation`, `readiness`, `integration`;
- открытые `DEF-*`;
- `task_profile`/`flow_profile`;
- Git-состояние, если следующий шаг может менять файлы или ветки.

## Runtime state

Если доступен `dd-flow` CLI, `/go` использует его как механический слой состояния по `common/runtime-cli.md`:

- проверяет `dd-flow project status`;
- после выбора протокола регистрирует planning session через `dd-flow session register`;
- при наличии plan graph читает или обновляет CLI plan status;
- после state-changing действий ожидает, что CLI обновит dashboard автоматически, если это включено конфигом.

Если CLI недоступен, `/go` продолжает файловый pipeline через Memory Bank и protocol summary. Недоступность CLI не должна превращаться в блокер для read-only исследования или микроправки, если проект не сделал CLI обязательным gate.

## Pipeline State

В summary протокола желательно поддерживать управляющий блок:

```yaml
pipeline:
  current_stage: unprimed | primed | focused | specify | plan | interactive | consolidation | hardening | implementation | readiness | integration | closed
  next_action: run_protocol | run_specify | run_plan | run_interactive | run_finish | run_implementation | run_readiness_gate | run_merge | merge_start | archive_sweep | close | ask_user
  approval_required: false
  blockers: []
  active_def: []
```

Если такого блока нет, восстанови состояние из фактов и обнови summary при ближайшей записи в протокол.

## Диспетчеризация

Выбери следующий шаг по состоянию.

### Нет прайминга

Если проектный контекст не загружен:

- выполни прайминг через `f.md`;
- если задачи нет, остановись;
- если задача есть, выполни фокусировку и затем `protocol.md` или `interactive.md`.

### Есть прайминг, но нет задачи

Если пользователь просит исследовательский ответ, ответь в режиме `исследование - без протокола`: читай Банк памяти и проектные источники, но не запускай `protocol.md` и не создавай протокол.

Если пользователь хочет продолжать пайплайн, но задачи нет, остановись и попроси задачу. Не создавай протокол без задачи.

### Есть задача, но нет протокола

Выполни фокусировку контекста, затем запусти `protocol.md` для обычного пути или `interactive.md` для интерактивного режима.

Фокусировка должна быть видима в докладе или рабочем следе: какие темы запроса выделены, какие разделы Банка памяти и кода прочитаны, какие аналогии проекта найдены, какая неопределённость осталась для `specify`.

`protocol.md` должен:

- создать или обновить протокол;
- если выбран `route.git: feature_worktree`, сначала создать или выбрать feature-worktree, выполнить workspace bootstrap и только затем создать протокол в этом worktree;
- если feature-worktree создан, но текущий session cwd не равен `worktree_path`, остановиться и выдать команду перезапуска, не выполняя `short_plan`, `plan` или `implementation`;
- записать запрос пользователя;
- записать начальный `task_profile` и Git contour;
- начать `specify` и зафиксировать вопросы верхнего уровня или compact specification.

После `protocol.md` остановись, если есть блокирующие вопросы или `next_action: ask_user`.

### Есть протокол, но нет specification

Выполни логическую стадию `specify` по `common/specification.md`. Если specification выявляет вопросы пользователя верхнего уровня, переведи runtime в `waiting_for_user` с typed payload и не запускай `plan`.

### `route.planning: no_plan` / legacy `none`

Полный `plan` не нужен.

Если пользователь уже просил выполнить работу или `/go` явно означает продолжить следующий безопасный шаг, запускай `code/implement.md`, если нет блокеров.

Если есть блокер по границам, данным, безопасности, внешним действиям, push, merge, deploy, production или публичному контракту, остановись и задай вопрос.

### `route.planning: compact_plan` / legacy `short`

Составь короткий план без полного планового прохода.

Короткий план должен зафиксировать:

- понимание задачи;
- границы и не-цели;
- затронутые зоны;
- Git-контур;
- документацию Банка памяти;
- проверки;
- сценарии;
- evidence;
- следующий шаг.

Если короткий план готов и пользователь запустил `/go`, это считается подтверждением следующего безопасного шага реализации, кроме опасных gates. Если есть `needs_user_decision`, остановись.

### `route.planning: full_plan`

Запусти `plan.md`.

Полный `plan` проходит `plan/*` и останавливается перед реализацией. Следующий `/go` после статуса `plan_ready` может запустить `code/implement.md`, если нет блокеров и не требуется отдельное пользовательское решение.

### Code-flow и readiness

Если реализация ещё не начата или не завершена, запусти `code/implement.md`.

`code/implement.md` является основным code-flow prompt-ом и в нормальном пути не останавливается после кодовых изменений. Он должен сам перейти к readiness gate: запустить нужных reviewers, исправить найденное, повторить свежие проверки, обновить evidence/summary/dashboard и принять verdict.

Отдельно запускай `code/readiness.md` только если:

- реализация уже сделана, но readiness gate был прерван;
- runtime state говорит `current_stage: readiness` и `next_action: run_readiness_gate`;
- нужно вручную повторить readiness без повторной реализации;
- Stop hook восстанавливает прерванную session.

Не используй Stop hook как штатный переход между implementation и readiness. Stop hook - только страховка после прерывания.

Readiness проверяет верификацию результата, ревью качества, evidence, открытые `DEF-*`, перенос долговечного знания и готовность текущей ветки или feature-worktree к следующему gate.

### `readiness` завершён

Если требуется merge, push, CI, preview, beta, deploy или production-gate, запусти `merge.md` для one-shot/status в текущей сессии или `merge-start.md` для долгоживущего project worker-а. Не запускай `merge/integrate.md` напрямую: это checklist внутри claimed `merge/job.md`.

Если проект использует выделенную очередь merge через `dd-flow` CLI, обычная рабочая сессия не должна сама выполнять merge после `readiness` и не должна запускать `merge/integrate.md`. Она должна убедиться, что ветка готова к интеграции, вызвать `dd-flow protocol ready-for-merge <protocol-id> --json`, обновить protocol summary и передать работу `merge.md` или `merge-start.md`.

Если `route.git: integration_branch_direct`, `route.delivery: local`, `route.ci: none`, и других интеграционных действий нет, `integration` не нужен. Закрой протокол, обнови summary и запусти архивный sweep, если это применимо.

### `integration` завершён

Закрой протокол:

- обнови summary;
- зафиксируй итоговый статус;
- проверь открытые `DEF-*`;
- если работа закрыта, запусти архивный sweep только через fresh-session packet: `common_prompt: .memory-bank/dd-flow/common/worker-session.md`, `worker_prompt: .memory-bank/dd-flow/workers/docs.md`, `role_prompt: .memory-bank/dd-flow/workers/protocol-archive.md`, `read` с current protocol/index/DEF sources, точные допустимые `write` paths, отдельный `write_report_to`, trigger/current date/current protocol и checks. `/go` остаётся acceptance owner: проверяет diff и report; recovery сохраняет original packet/failure note/partial artifacts и использует отдельный attempt report path. Не выполняй generic inline archive delegation.

## Что `/go` считает подтверждением

`/go` является подтверждением на следующий безопасный шаг пайплайна:

- прайминг;
- фокусировку контекста;
- `protocol.md` или `interactive.md`, если пользователь уже дал задачу;
- `specify`;
- короткий план;
- полный `plan`;
- code-flow после `plan_ready`: реализацию и встроенный readiness gate через `code/implement.md`, если нет блокеров;
- отдельный readiness rerun через `code/readiness.md`, если реализация уже сделана, но gate был прерван или требует повторной проверки;
- `integration`, если это обычный merge/CI/beta по проектной политике и нет опасного действия.

`/go` не является автоматическим подтверждением для опасных действий:

- production deploy;
- удаление данных;
- миграция с необратимыми последствиями;
- платные или массовые внешние вызовы;
- публикация сообщений пользователям;
- изменение прав доступа или секретов;
- действие, которое проектная политика требует подтвердить явно.

В таких случаях остановись, объясни вопрос, предложи варианты с последствиями и рекомендацией.

## Блокеры

Не двигай пайплайн дальше, если есть:

- блокирующий вопрос пользователя;
- открытый `DEF-*`, который блокирует следующий gate;
- `research.unresolved`, влияющий на маршрут или безопасность;
- несогласованные сценарии, если они являются `acceptance_gate`;
- отсутствие обязательного evidence;
- грязное Git-состояние, которое нельзя безопасно отделить;
- конфликт между запросом пользователя и правилами проекта.

Доклад должен объяснить, что именно блокирует `/go`, что можно сделать дальше и какая рекомендация.

## Итоговый доклад

Каждый запуск `/go` завершается докладом с навигационным блоком:

```markdown
## Навигация

- prompt: go.md
- protocol:
- current_stage:
- completed_stage:
- next_action:
- route:
- blockers:
- active_def:
- user_decision_required:
- dashboard_project:
- dashboard_global:

## Что сделал /go

- ...

## Почему выбран следующий шаг

- ...

## Что дальше

- ...
```

Если `/go` запустил другой prompt, итоговый доклад должен назвать и `go.md`, и фактически завершённый prompt.
