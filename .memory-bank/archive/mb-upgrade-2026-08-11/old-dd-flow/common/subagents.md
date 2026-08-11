# Работа с субагентами

Этот файл адресован оркестратору: он выбирает local execution или повышает
отдельные единицы работы до delegation. Сами worker/scout/verifier/aspect-review
subagents читают `.memory-bank/dd-flow/common/worker-session.md`, затем свой
специализированный prompt и task packet.

Базовый маршрут каждой единицы работы — `orchestrator_local`: оркестратор сам
читает источники, выполняет анализ и оставляет source-backed evidence. Это
нормальный маршрут, а не fallback. Для него не нужен отдельный decision
artifact или объяснение отсутствия субагентов.

Delegation — положительное повышение конкретной единицы работы. Решение о
повышении принимается по смыслу задачи до проверки runtime capacity.
Группировка, число свободных slots, общий risk и `full_plan` сами по себе не
являются причинами для повышения.

## Связь с flow profile

По умолчанию `flow_profile.execution` использует `mode: solo` и
`parallelism: none`. Другое значение является результатом прошедшего promotion
gate, а не предположением по размеру или риску задачи.

`execution.mode`:

- `solo` - базовый `orchestrator_local` route.
- `scouts` - запускай только разведчиков для сбора контекста; они не меняют файлы и не планируют реализацию.
- `workers` - можно поручать независимые пакеты реализации с ясными границами записи.
- `verifiers` - используй независимых проверяющих для diff, evidence, сценариев, merge, качества `DEF-*` или соответствия цели.
- `mixed` - комбинируй роли, но каждый субагент получает отдельный самодостаточный пакет задачи.

`execution.parallelism`:

- `none` - базовое последовательное исполнение оркестратором.
- `scout_parallel` - параллельно работают только разведчики контекста.
- `worker_parallel` - нескольким worker-ам параллельно выдаются независимые task packets с непересекающимися границами записи.
- `verifier_parallel` - нескольким verifier-ам параллельно выдаются разные области проверки.
- `mixed_parallel` - параллельно работают разные роли, но оркестратор обязан явно развести владение задачами.

Повышай `execution.mode` только после semantic promotion, packing и положительной
capacity, непосредственно перед render/launch первого batch по алгоритму ниже.
Если сохранённый non-solo profile не содержит promotion evidence, текущая
стадия остаётся `orchestrator_local` и исправляет projection без downgrade
ceremony.

## Канонический алгоритм маршрутизации

Алгоритм выполняется один раз перед deep work каждой стадии. На следующей
стадии он начинается заново: route и capacity из `specify` не назначают route
для `plan`.

Термины:

- `unit` — одна проверяемая единица исследования, ревью или реализации;
- `group` — две или три совместимые promoted units в одном job;
- `job` — один bounded task packet и одна worker session;
- `wave` — слой jobs, готовых по hard dependencies;
- `batch` — одновременно запускаемая часть одной wave, ограниченная capacity.

### Шаг 1. Зафиксировать мелкий вход

Прочитай только сведения, нужные для маршрутизации: цель, ограничения,
authoritative sources, применимые правила и уже известные boundaries. На этом
шаге не выполняй deep-анализ будущих delegated units.

### Шаг 2. Построить units

Раздели работу на units с одним вопросом или результатом на unit. Для каждой
зафиксируй scope, source scope и consumer результата. Не создавай unit только
для того, чтобы загрузить свободного worker-а.

### Шаг 3. Назначить базовый local route

Каждая unit начинает с `orchestrator_local`. В aspect coverage map это
`coverage_mode: self_check`. Такой route даёт source-backed evidence, но не
заявляет независимую сессию.

### Шаг 4. Применить semantic promotion gate

Повышай только конкретную unit, для которой выполняется хотя бы один positive
trigger:

- применимое правило требует independent verdict/session;
- unit пересекает отдельную trust, security, data, runtime или operational
  boundary, её report используется в stage acceptance и local evidence не
  даёт эквивалентной независимости;
- есть минимум две содержательные независимые units с разными bounded source
  scopes; каждая требует отдельного чтения/анализа, а параллельный проход
  устраняет хотя бы один последовательный research pass;
- пользователь прямо запросил delegation.

Запиши trigger и факты, которые его подтверждают. Классифицируй promotion:

- `required` — независимая сессия является частью правила, acceptance или
  явного запроса пользователя;
- `opportunistic` — delegation нужна только для экономии wall time.

Task-level risk, `full_plan`, широта задачи, количество аспектов, готовая
compatibility group и свободные slots не повышают units автоматически.

### Шаг 5. Проверить готовность promoted unit

До создания job у promoted unit должны быть:

- bounded scope;
- точный output и его consumer;
- acceptance criteria;
- frozen или read-equivalent inputs;
- безопасные write boundaries или явный `read_only`;
- prompt/report contract.

Готовая unit проходит к packing. Неготовая `opportunistic` unit остаётся
`orchestrator_local`; неготовая `required` unit получает явный blocker. Runtime
capacity на этом шаге не проверяется.

### Шаг 6. Собрать groups и jobs

Сначала promotion, затем grouping. Совместимые promoted units можно объединить
по две или три в один read-only job. Flow-owned compatibility table подсказывает
предпочтительные сочетания и separation rules, но не является exact allowlist.

Group допустима, когда все units используют один immutable/read-equivalent
snapshot, один trust/report contract, не имеют write conflict или
`requires_output_of` между собой и сохраняют отдельные findings/verdicts.
Отдельный focused job выбирается, когда правило требует dedicated session на
unit, либо действует separation rule: mutation/write scope, critical/security
boundary, operational-access chain, разные snapshots или hard dependency.
Required units можно группировать, только если требование означает
independence от оркестратора, а не отдельную сессию на unit. Grouping никогда
не меняет promotion type и не повышает local unit.

После packing повторно проверь только `opportunistic` promotions. Выгода
сохраняется, когда delegated job может идти одновременно хотя бы с одним другим
delegated job или содержательной local unit. Если grouping оставил единственный
job и параллельной local работы нет, сначала разъедини group. Если двух
execution lanes всё равно нет, верни opportunistic units в
`orchestrator_local` до capacity probe.

### Шаг 7. Построить waves

Создай hard edge `requires_output_of` только когда successor packet называет
конкретный accepted predecessor output и точные данные, которые использует.
Output может быть принятой local-строкой в `aspect-map.json` или delegated
report. Hard edge не повышает predecessor до delegation. Local predecessor
закрывается оркестратором до готовности successor job; если successor требует
именно independent report, это отдельный `required` trigger шага 4.

Общая тема, общий draft, удобный порядок или потенциально полезный output не
создают зависимость. `not_applicable` удовлетворяет edge только когда successor
contract явно допускает отсутствие этих данных; иначе successor блокируется.
Dependency graph содержит local и delegated units; runtime waves содержат
только delegated jobs, чьи local/delegated predecessors уже приняты.
Независимые ready jobs входят в одну wave.

### Шаг 8. Определить текущую capacity

Выполняй этот шаг, только если после packing есть delegated jobs. Сначала
используй надёжное текущее значение free child slots из harness. Configured
maximum не является текущим значением.

Если такого значения нет, запусти один bounded concurrent probe: попытайся
создать 15 пустых workers, каждый принятый worker держит slot 60 секунд и
возвращает один короткий token. Дождись и закрой всех принятых workers.

Единственный результат для flow — `available_subagent_slots`: число принятых
workers. Width, refusals, ids, tokens и строки попыток остаются runtime noise и
не копируются в flow artifacts. Probe workers не читают проект, не проходят
priming, не рендерят packets и не пишут файлы.

### Шаг 9. Запускать batches

Внутри готовой wave сначала запускай `required` jobs, затем `opportunistic`.
Один batch содержит не больше `available_subagent_slots` jobs; остальные ready
jobs остаются в следующем batch той же wave. Пока jobs работают, оркестратор
закрывает local units и готовит synthesis; он не дублирует deep work delegated
units.

При положительной capacity до render первого packet создай append-only
`flow_flags` revision с фактическими `execution.mode` и
`execution.parallelism`. Заморозь её revision/checksum во всех packets,
`aspect-job-map.json` и stage report этой topology. Если delegated launch не
был принят, job map не создаётся, а guarded revision через `run flags revise` с
`--allow-downgrade --reason <why>` возвращает фактическую projection в
`solo`/`none`, если это не пересекает mandatory floor. Opportunistic units
выполняются локально, а required route завершает stage non-green с promotion
blocker.

Runtime refusal уменьшает размер последующих batches, но не меняет units,
groups, jobs или waves. При нулевой capacity:

- `opportunistic` jobs возвращаются в `orchestrator_local` и выполняются
  оркестратором как обычный маршрут;
- для `required` jobs подожди 60 секунд, один раз повторно определи capacity и
  при повторном нуле зафиксируй `blocked`/`degraded` non-green result. Такой
  result не разрешает переход к следующей стадии.

### Шаг 10. Принять результат по каждой unit

В grouped report принимай каждую unit отдельно. Принятые sibling units остаются
принятыми. Для missing/invalid/failed unit допустим один focused recovery с
исходным packet, failure note и отдельным report path. После второго отказа
`required` unit становится non-green `blocked`/`degraded`; `opportunistic` unit
явно возвращается в `orchestrator_local` с сохранённым failure trace.

### Шаг 11. Синтезировать результат стадии

Объедини local evidence и принятые reports, зафиксируй принятые и отклонённые
выводы, обнови coverage и выполни stage acceptance. Повтори routing до
следующей стадии только если новый существенный факт изменил boundaries до
начала deep work; после запуска jobs не перепланируй topology ради заполнения
slots.

### RUN-local aspect job map

The sole execution receipt is
`<run-home>/<stage-dir>/aspect-job-map.json` with
`schema_id: dd-flow/aspect-job-map@2`. It is not a queue, scheduler, coverage
map or capacity report. It contains one row per accepted semantic launch:

```yaml
schema_id: dd-flow/aspect-job-map@2
run_id:
stage:
snapshot: {revision:, checksum:}
launches:
  - attempt_id:
    job_id:
    unit_ids: []
    retry_of: null
    state: running | accepted | failed
    session_id:
    packet_path:
    report_path: null
```

The orchestrator is the only writer and updates it by atomic replace inside the
RUN directory. `attempt_id` is unique; `job_id` is the semantic job from the
aspect graph; `retry_of` is present only for the single allowed recovery.
Immediately after every accepted spawn, persist the launch with its non-empty
`session_id` before launching anything else; if that write fails, stop.
Update its state/report when the session ends. Before a green stage verdict no
row may remain `running`. On resume reconcile by `job_id` against registered
sessions: one unambiguous match repairs the row and is never relaunched, no
match remains pending in the aspect graph, and multiple matches block.

Do not copy unit totals, groups, waves, batches, probe attempts, refusals or
launch totals into this file or the stage report. They are derived views of the
aspect map/graph and launch rows and previously drifted from their sources.
If no semantic launch was accepted, do not create an empty job map.

## Job Status and Acceptance

Lifecycle owners keep their existing state machines; this table only maps
route execution to coverage and gate behavior:

| Situation | Coverage/job result | Next action |
| --- | --- | --- |
| Positive capacity, current batch is full | `selected` + transient `pending` | Keep the job for the next batch of the same wave. |
| Zero capacity for an opportunistic job | Return the unit to `self_check` | Execute it locally; this is the normal route. |
| Zero capacity for a required job after one re-observation | `blocked`/`degraded` | Stop with a visible reason and precise handoff. |
| Worker launched | `selected` + transient `running` | Wait for the report; hard successors stay locked. |
| Every unit report accepted | `completed` or `verified` | Accept the job and unlock only its hard successors. |
| Group has mixed results | Accepted units stay accepted; affected units are `incomplete` | Keep the job non-green and recover only affected units. |
| Missing, invalid, timeout or lost report | `blocked` or `incomplete` | Preserve the original attempt and launch at most one focused recovery. |
| Recovery accepted | Affected unit becomes `completed`/`verified` with a new attempt path | Reconcile that unit and then unlock its hard successors. |
| Repeated recovery failure for a required unit | `blocked`/`degraded`, stage non-green | Stop with a visible reason and precise DEF/handoff. |
| Repeated recovery failure for an opportunistic unit | Return the unit to `self_check` and retain the failure trace | Execute it locally; do not claim a worker report. |

A grouped job is green only when all of its unit reports are accepted. Valid
unit sections are accepted independently. Recovery identity is
`coverage_unit_id + original_job_id`: initial `attempt: 1`, one recovery
`attempt: 2`, never attempt 3. Recovery receives the original packet, invalid
output and findings; accepted siblings are not rerun. Job/session counts never
substitute for coverage, evidence or stage acceptance.

## Ownership

- `worker-session.md` owns packet vocabulary, grouped wrapper/report shape and
  recovery attempt rules.
- This file owns route choice, compatibility checks, the current slot count,
  bounded packing, the aspect-job-map shape, dependency gating and acceptance.
- `memory-flow-subagents.md` owns semantic coverage units, coverage statuses
  and the selected/skipped/degraded contract.
- Each flow owns its compatibility preferences and separation triggers; it
  does not redefine the common packet vocabulary.
- Lifecycle/flow-run owners own stage and attempt transitions; run artifacts
  own concrete session and timing facts.

## Граница роли оркестратора

После promotion оркестратор не выполняет deep-анализ делегированных units. Его
роль для них:

- собрать минимальный intake и карту аспектов;
- сформулировать task packets;
- запустить субагентов;
- принять отчёты;
- проверить ключевые факты по источникам, diff, коду, документам или evidence;
- принять или отклонить рекомендации;
- синтезировать итоговое решение, план, readiness verdict или merge verdict.

Deep-анализ делает назначенный субагент. Оркестратор не пишет за него aspect report, не подменяет отсутствующий report общей сводкой и не закрывает delegated unit как выполненный по своему предварительному мнению. Это правило защищает независимость проверки и снижает риск contamination: если оркестратор заранее глубоко исследует delegated aspect, он может принять отчёт субагента через призму уже сформированной версии.

Оркестратор самостоятельно закрывает все local units. Если он успел глубоко
исследовать unit до её promotion, зафиксируй `contamination_risk` в
`subagent-decision.md`, coverage artifact или фазовом отчёте и объясни, как
независимость восстановлена.

Рабочая сводка всегда содержит полный aspect/coverage map и local evidence.
`subagent-decision.md` создаётся только при promotion и содержит:

- выбранный positive trigger и подтверждающие факты;
- promoted units и их coverage modes;
- output consumer, acceptance criteria, inputs и write boundaries;
- task/report paths и остаточные риски.

Default `orchestrator_local` не считается downgrade и не требует отдельного
обоснования. Непроверенные применимые units по-прежнему становятся `DEF-*`,
coverage debt или blocker; local route не разрешает молча пропускать coverage.

Task-level high risk/full plan не создаёт blanket delegation gate. Если
aspect-local independence требует worker, отсутствие доступной capacity даёт
bounded wait/re-observation, затем blocker/degraded route; оно не превращает
этот aspect в self-check и не повышает остальные aspects.

Не используй `execution` для выбора worktree. Worktree выбирается через `flow_profile.route.git: feature_worktree`: тогда весь протокол выполняется в feature-ветке рабочего дерева. `execution.parallelism` означает параллельную раздачу задач субагентам внутри выбранного Git-контура, а не создание дополнительных worktree. Субагенты не должны самовольно создавать отдельные worktree без задачи оркестратора и правил проекта.

## Рабочая папка

Для протокола создай рабочую папку в `.tasks/` в корне репозитория. Название должно связывать папку с протоколом или фичей.

В этой папке храни:

- файлы задач для субагентов;
- отчёты субагентов;
- свои сводные отчёты;
- заметки с уроками (lessons learned) и инсайтами (insights), если они появились;
- временные артефакты исследования, которые не являются долговечным знанием.

## Жизненный цикл `.tasks`

`.tasks/` - рабочая зона текущего запуска агента. По умолчанию она не коммитится и должна быть добавлена в `.gitignore` проекта.

Используй `.tasks/` для:

- задач субагентов;
- промежуточных отчётов;
- preflight и рабочих manifest-файлов;
- черновых `DEF-*`, если конкретный flow так устроен;
- заметок, которые ещё не стали долговечным знанием.

Не делай активные документы Банка памяти зависимыми от `.tasks/`: ссылки из `index.md`, `structure.md`, `spec/`, `adr/`, `plans/`, `scenarios/`, `ui/`, `guides/` или `operations/` на некоммитнутые `.tasks/...` считаются ошибкой. Если материал должен сохраниться, подними его в постоянный слой:

- фактический след запуска -> `protocol/<PRT-ID>/`;
- доказательства -> `evidence/`;
- решение -> `adr/`;
- устойчивое правило -> `spec/`;
- проверяемый путь -> `scenarios/`.

Если нужно сохранить артефакты конкретного запуска, не коммить `.tasks/` как есть. Создай curated-папку протокола, например `protocol/PRT-2026-05-13-mb-init/`, и перенеси туда очищенную сводку, важные отчёты, ссылки на evidence и итоговые решения.

## Постановка задачи

Задача субагента должна быть самодостаточной. В ней укажи:

- какой внутренний worker prompt прочитать;
- цель работы и ожидаемый результат;
- какие файлы Банка памяти и кода прочитать;
- границы чтения и, если есть реализация, границы записи;
- какие правила MBB и проектные стандарты применяются;
- что считается выполнением задачи;
- что нельзя делать;
- куда и в каком формате записать отчёт.

Task packets и внутренние отчёты субагентов можно писать на английском, если это ускоряет работу и не противоречит запросу пользователя. Если отчёт субагента будет напрямую показан пользователю или включён в пользовательский dashboard/final report без пересказа, переведи или синтезируй пользовательскую часть на целевом языке из `common/style.md`.

## Worker prompts

Оркестратор не должен каждый раз пересказывать все общие стандарты вручную. Он указывает субагенту, какой внутренний prompt прочитать, а в задаче передаёт только операционные сведения по конкретной работе.

Каждый task packet для worker-а должен соответствовать полному нормативному contract в `.memory-bank/dd-flow/common/worker-session.md`. Здесь оркестратор фиксирует только сведения, необходимые для запуска и приёмки:

```yaml
packet_path:
execution_mode: delegated_llm | orchestrator_local | deterministic_runtime
selected_leaf_prompt:
write_report_to:
acceptance_owner:
handoff:
  predecessor_reports:
  recovery_attempt_paths:
```

Не отправляй worker-а читать этот orchestration guide как worker-session primer. Если task packet требует `common/subagents.md` для обычной worker-работы, это дефект постановки задачи.

Для MB-SDLC aspect reviewers packet направляет субагента к `.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspect-worker.md` как consumed `role_prompt` и к одному dedicated `.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/<aspect_id>.md` как leaf `aspect_prompt`. Такой packet является маршрутизатором, а не заменой aspect prompt; subagent report перечисляет prompt files and project sources read.

Если aspect worker зависит от уже завершённого аспекта, compatibility field
`handoff.predecessor_reports` перечисляет только принятые output paths и их
verdict. Для local predecessor это путь к `aspect-map.json` и конкретный
`aspect_id`, для delegated — путь отчёта. Оркестратор не запускает dependent
worker до приёмки этих фактов и не заменяет их скрытым контекстом.

Выбор:

- `.memory-bank/dd-flow/workers/code.md` - код, тесты, схемы, SDK, CLI/TUI/GUI, раннеры и связанные проектные файлы;
- `.memory-bank/dd-flow/workers/verify.md` - проверка реализации, diff, evidence, сценариев, merge и качества `DEF-*`;
- `.memory-bank/dd-flow/workers/docs.md` - документы Банка памяти, индексы, frontmatter, миграции, архив, guides, UI/spec/scenario docs;
- `.memory-bank/dd-flow/def/plan.md` - план закрытия конкретного `DEF-*`;
- `.memory-bank/dd-flow/def/fix.md` - исправление конкретного `DEF-*` по принятому плану.

В задаче пиши, например:

```text
Прочитай `.memory-bank/dd-flow/common/worker-session.md`.
Прочитай `.memory-bank/dd-flow/workers/code.md`.

Операционные сведения:
- session_mode:
- цель:
- читать:
- можно менять:
- нельзя менять:
- проверки:
- отчёт:
```

Отдельно пропиши этап входа в контекст. Субагент сначала читает файл задачи, указанные документы Банка памяти, релевантный код и проектные правила, а уже потом делает выводы или меняет файлы. В отчёте он должен коротко указать, какой контекст был собран и какие источники стали основанием для решения.

Для реализации обязательно укажи, что субагент не один в кодовой базе: нельзя откатывать чужие изменения, нужно работать в своём участке и учитывать уже существующие правки.

Для новой независимой задачи обычно лучше запускать нового субагента, а не переиспользовать старый контекст. Переиспользуй субагента только если следующая задача действительно продолжает предыдущую и старый контекст помогает, а не мешает.

## Сбой и возобновление субагента

Если субагент завершился ошибкой, завис, потерял контекст (context), вернул неполный отчёт или не смог записать результат, это не означает, что оркестратор должен молча доделать задачу сам. Если задача всё ещё нужна, оркестратор готовит нового субагента восстановления (recovery subagent), который продолжает работу с полным контекстом сбоя и уже выполненного объёма.

Перед запуском субагента восстановления оркестратор должен:

- сохранить исходный пакет задачи (task packet), который получал первый субагент;
- описать ситуацию сбоя: что запускалось, где остановилось, что успело быть сделано, что осталось неполным;
- собрать ссылки на уже созданные артефакты: отчёты, черновики, заметки, diff, task files, evidence или protocol assets;
- отделить подтверждённые результаты от неподтверждённых предположений;
- явно указать новому субагенту, что он продолжает работу после сбоя, а не начинает обычный новый запуск.
- сохранить исходный report, записать failure note и выделить replacement worker-у отдельный attempt report path; не перезаписывать непринятый partial report.

Пакет восстановления должен включать:

- исходный task packet без потери требований, ограничений и границ записи;
- описание сбоя и причину перезапуска, если она понятна;
- список артефактов, которые нужно прочитать перед продолжением;
- инструкцию сначала оценить уже выполненный объём работы;
- инструкцию не начинать с нуля, если существующие артефакты пригодны;
- инструкцию завершить задачу в исходном формате отчёта;
- инструкцию явно отметить в отчёте, что работа была возобновлена после сбоя.
- имя report, который orchestration owner признал авторитетным после recovery.

Если сбой связан с ограниченным пулом субагентов, используй bounded wait и одну
re-observation из этого файла. На invalid unit разрешена только одна recovery
попытка; повторный сбой завершается честным blocker/degraded/`DEF-*`, без
attempt 3 и без повторного запуска принятых siblings.

## Приёмка работы субагента

После отчёта субагента:

- проверь, что он действительно читал нужный контекст;
- отдели факты от предположений;
- перепроверь важные выводы по коду или документам;
- принимай только те рекомендации, с которыми согласен после проверки;
- зафиксируй, что принято, что отклонено и почему.

Отчёт субагента является входом для решения, а не истиной сам по себе. Если вывод влияет на архитектуру, контракт, сценарий, безопасность, данные или выкладку, основной исполнитель перепроверяет его по коду, документам или фактическому запуску.

Субагент помогает расширить взгляд, но ответственность за итоговое решение остаётся у основного исполнителя.
