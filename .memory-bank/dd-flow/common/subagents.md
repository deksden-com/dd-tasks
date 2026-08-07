# Работа с субагентами

Этот файл адресован оркестратору: он решает, когда запускать субагентов, как ставить им задачи и как принимать отчёты. Сами worker/scout/verifier/aspect-review subagents должны читать `.memory-bank/dd-flow/common/worker-session.md`, затем свой специализированный prompt и task packet.

Субагентов использовать разрешено, когда это нужно для качества, скорости или независимой проверки. Отдельного разрешения пользователя не требуется, если текущий flow, `flow_profile`, риск задачи или этот файл предполагают scouts/workers/verifiers. Пользовательское ограничение "не запускать субагентов" имеет приоритет и должно быть зафиксировано в отчёте.

Используй субагентов только там, где это реально помогает: сбор контекста, параллельное исследование независимых аспектов, проверка выполненной задачи, отдельная реализация с ясной областью владения. Не запускай субагента ради процесса.

## Связь с flow profile

Тактика задаётся в `flow_profile.execution`.

`execution.mode`:

- `solo` - основной агент работает сам; субагентов не запускай без нового риска.
- `scouts` - запускай только разведчиков для сбора контекста; они не меняют файлы и не планируют реализацию.
- `workers` - можно поручать независимые пакеты реализации с ясными границами записи.
- `verifiers` - используй независимых проверяющих для diff, evidence, сценариев, merge, качества `DEF-*` или соответствия цели.
- `mixed` - комбинируй роли, но каждый субагент получает отдельный самодостаточный пакет задачи.

`execution.parallelism`:

- `none` - субагенты запускаются последовательно или не запускаются.
- `scout_parallel` - параллельно работают только разведчики контекста.
- `worker_parallel` - нескольким worker-ам параллельно выдаются независимые task packets с непересекающимися границами записи.
- `verifier_parallel` - нескольким verifier-ам параллельно выдаются разные области проверки.
- `mixed_parallel` - параллельно работают разные роли, но оркестратор обязан явно развести владение задачами.

Если профиль указывает `solo`, но во время работы появляется значимый риск, можно повысить `execution.mode`, объяснив причину. Если профиль указывает workers/verifiers/mixed, но работа стала тривиальной, понижение допустимо только с объяснением в отчёте.

## Route Selection and Bounded Packing

The canonical route is recorded in the selection/job map and carried into the
task packet where a worker is launched:

- `self_check` is an allowlisted low-risk confirmation of a known rule. It
  produces source-backed orchestrator evidence and does not claim an
  independent session.
- `grouped_subagent` covers two or more units in one read-only session only
  when the owning flow allowlist permits the exact group.
- `focused_subagent` gives a unit its own session when depth, trust or
  mutation isolation requires it.

Route selection is deterministic and ordered by safety: a separation trigger
forces `focused_subagent` or the flow's existing `keep_separate` worker;
otherwise an explicit `self_check_allowed` may use `self_check`, an exact
`group_allowed` entry may use `grouped_subagent`, and the default is one
focused job per unit. A technically possible group is optional, not a reason
to merge units.

The common contract does not invent flow bundles. The owning flow records
`self_check_allowed`, `group_allowed` or `keep_separate` and its separation
reasons. A group is valid only when all members share an immutable or
read-equivalent snapshot, have no write conflict, have no
`requires_output_of` edge between them, use the same trust/report contract,
and retain separate findings and verdicts. The initial group limit is three
units. Grouping is rejected for mutation/write scope, critical or security
boundaries, operational-access chains, different source owners/snapshots,
required predecessor output, missing metadata or any explicit flow trigger.

`requires_output_of` is a hard dependency: the successor waits for the
accepted predecessor report/artifact. `related_to` and `informed_by` are soft
context links and do not create a wave or block launch. Hidden context from a
previous session never satisfies a hard dependency.

Resolve pool capacity once for the run-local execution map:

```text
effective_pool =
  min(explicit max_subagents, runtime capacity), if both are known;
  explicit max_subagents, if only it is known;
  runtime capacity, if only it is known;
  1, if capacity is unknown.
```

Record `effective_pool.value` and `effective_pool.source` as
`explicit`, `runtime` or `fallback`. A value below one is invalid; do not
probe capacity with speculative spawns. Launch ready jobs in batches up to
the effective pool, retain excess jobs in a transient pending list and
continue after a slot is released. This is bounded packing, not a persistent
queue or scheduler.

## Job Status and Acceptance

Lifecycle owners keep their existing state machines; this table only maps
route execution to coverage and gate behavior:

| Situation | Coverage/job result | Next action |
| --- | --- | --- |
| Selected but slot unavailable | `selected` + transient `pending` | Keep the job queued in the current wave; do not drop coverage. |
| Worker launched | `selected` + transient `running` | Wait for the report; hard successors stay locked. |
| Every unit report accepted | `completed` or `verified` | Accept the job and unlock only its hard successors. |
| Group has mixed results | Accepted units stay accepted; affected units are `incomplete` | Keep the job non-green and recover only affected units. |
| Missing, invalid, timeout or lost report | `blocked` or `incomplete` | Preserve the original attempt and launch focused recovery. |
| Recovery accepted | Affected unit becomes `completed`/`verified` with a new attempt path | Reconcile that unit and then unlock its hard successors. |
| Repeated recovery failure or external slot block | `blocked`/`degraded` | Stop with a visible reason and precise DEF/handoff; never silently self-check. |

A grouped job is green only when all of its unit reports are accepted. Job
count or session count never substitutes for coverage, evidence or a stage
acceptance decision.

## Ownership

- `worker-session.md` owns packet vocabulary, grouped wrapper/report shape and
  recovery attempt rules.
- This file owns route choice, allowlist checks, bounded packing, dependency
  gating and job acceptance.
- `memory-flow-subagents.md` owns semantic coverage units, coverage statuses
  and the selected/skipped/degraded contract.
- Each flow owns its compatibility allowlist and separation triggers; it does
  not redefine the common packet vocabulary.
- Lifecycle/flow-run owners own stage and attempt transitions; run artifacts
  own concrete session and timing facts.

## Граница роли оркестратора

Если принято решение `run_subagents`, оркестратор не должен сам выполнять deep-анализ делегированных аспектов, пакетов реализации или reviewer-зон. Его роль в таком режиме:

- собрать минимальный intake и карту аспектов;
- сформулировать task packets;
- запустить субагентов;
- принять отчёты;
- проверить ключевые факты по источникам, diff, коду, документам или evidence;
- принять или отклонить рекомендации;
- синтезировать итоговое решение, план, readiness verdict или merge verdict.

Deep-анализ делает назначенный субагент. Оркестратор не пишет за него aspect report, не подменяет отсутствующий report общей сводкой и не закрывает delegated unit как выполненный по своему предварительному мнению. Это правило защищает независимость проверки и снижает риск contamination: если оркестратор заранее глубоко исследует delegated aspect, он может принять отчёт субагента через призму уже сформированной версии.

Оркестратор может выполнять самостоятельный анализ только когда принято `no_subagents`, задача простая/локальная, нет hard trigger и выбранный flow допускает solo mode. Если в режиме `run_subagents` оркестратор уже успел глубоко исследовать делегированный аспект до запуска субагента, зафиксируй `contamination_risk` в `subagent-decision.md`, coverage artifact или фазовом отчёте и объясни, как независимость проверки была восстановлена: fresh subagent, ограничение входов, второй verifier или явный degraded status.

Понижение `execution` никогда не должно быть молчаливым. Если агент не запускает субагентов там, где профиль или риск их предполагает, он обязан записать в рабочую сводку:

- исходное значение `execution.mode` и `execution.parallelism`;
- aspect relevance map со статусами `not_applicable`, `light`, `deep`, `unknown`;
- binary decision: `run_subagents` или `no_subagents`;
- hard triggers и количество `deep`/критичных `unknown` аспектов;
- почему субагенты не добавят качества или скорости именно в этом запуске, если решение `no_subagents`;
- какие аспекты агент проверил сам;
- какие аспекты сознательно не проверялись и становятся `DEF-*`, `coverage debt` или явным риском;
- почему это не нарушает цель, ограничения и выбранный уровень evidence.

Для high-risk работы downgrade допустим только если независимых `deep` аспектов реально меньше двух, нет hard trigger, или внешнее ограничение среды не позволяет запуск. В этом случае агент всё равно создаёт короткую запись `subagent-decision.md` в рабочей папке фазы.

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

Если aspect worker зависит от уже завершённого аспекта, `handoff.predecessor_reports`
перечисляет только принятые пути отчётов и их verdict. Оркестратор не запускает
dependent worker до приёмки этих фактов и не заменяет их скрытым контекстом.

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

Если сбой связан с ограниченным пулом субагентов (bounded subagent pool), дождись свободного слота и запусти восстановление после освобождения ресурса. Если сбои повторяются, сузь пакет задачи, раздели работу на меньшие части или зафиксируй честный блокер в отчёте/`DEF-*` по правилам текущего flow.

## Приёмка работы субагента

После отчёта субагента:

- проверь, что он действительно читал нужный контекст;
- отдели факты от предположений;
- перепроверь важные выводы по коду или документам;
- принимай только те рекомендации, с которыми согласен после проверки;
- зафиксируй, что принято, что отклонено и почему.

Отчёт субагента является входом для решения, а не истиной сам по себе. Если вывод влияет на архитектуру, контракт, сценарий, безопасность, данные или выкладку, основной исполнитель перепроверяет его по коду, документам или фактическому запуску.

Субагент помогает расширить взгляд, но ответственность за итоговое решение остаётся у основного исполнителя.
