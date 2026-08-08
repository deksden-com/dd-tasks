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

Build coverage units and choose each unit's minimum sufficient local route
before grouping or capacity packing:

- `self_check` is an allowlisted low-risk confirmation of a known rule. It
  produces source-backed orchestrator evidence and does not claim an
  independent session.
- `grouped_subagent` covers a compatible subset of two or three units in one
  read-only session.
- `focused_subagent` gives a unit its own session when depth, trust or
  mutation isolation requires it.

`focused_subagent` requires a unit-local `independence_reason`. Task-level
`full_plan`, high risk or another unit's boundary never promotes all units.
The flow-owned compatibility table supplies preferences and separation rules,
not exact bundles; a group stays valid when a preferred member is absent.

The owning flow records `self_check_allowed`, `group_eligible` or
`keep_separate` and reasons. A group is valid only when all members share an immutable or
read-equivalent snapshot, have no write conflict, have no
`requires_output_of` edge between them, use the same trust/report contract,
and retain separate findings and verdicts. The initial group limit is three
units. Grouping is rejected for mutation/write scope, critical or security
boundaries, operational-access chains, different source owners/snapshots,
required predecessor output, missing metadata or any explicit flow trigger.

Keep the terms separate:

- group: compatible units packed into one job/session;
- wave: a DAG layer created only by `requires_output_of`, which must name the
  exact consumed predecessor output;
- batch: a capacity-limited concurrent slice of one existing wave.

`related_to` and `informed_by` are soft links and never create waves. Hidden
session context never satisfies a hard dependency. Capacity/refusal changes
batch size only; it never rebuilds groups, waves or coverage.

At each packing point use a current runtime free-child-slot reading only when
its semantics, session scope and freshness are reliable. A configured maximum
is only a cap, not free capacity. Without reliable free slots, run exactly 15
independent probe spawns with `allSettled`-equivalent per-attempt results; each
accepted `llm_worker` has `role: capacity_probe`, is persisted immediately,
holds its slot for 60 seconds, then is explicitly awaited/closed. Record all
acceptances, refusals, cost, scope, freshness and closure. Probe sessions count
in total time/usage, not reviewer or semantic coverage counts.

Observed free capacity `0` stays `0`. Wait for the runtime child-operation
timeout, or 60 seconds if none exists, then reobserve once. If it remains zero,
use self-check only for units that permit it; otherwise block visibly. Launch
ready jobs in batches up to the fresh free-slot observation (and any configured
cap), retaining excess jobs as pending in the same wave.

### RUN-local aspect job map

The sole execution receipt is
`<run-home>/<stage-dir>/aspect-job-map.json` with
`schema_id: dd-flow/aspect-job-map@1`. It is not a queue or scheduler. Its
compact shape is:

```yaml
schema_id: dd-flow/aspect-job-map@1
run_id:
stage:
snapshot: {revision:, checksum:}
capacity_observations: []
units: [{unit_id:, route:, independence_reason:, group_id:, wave_id:, job_id:}]
jobs: [{job_id:, state:, group_id:, wave_id:, batch_id:, session_id:, attempt:, packet_path:, report_path:}]
attempts: [{coverage_unit_id:, original_job_id:, attempt:, state:, report_path:}]
```

The orchestrator is the only writer and updates it by atomic replace inside the
RUN directory. Immediately after every accepted spawn, persist
`job_id -> session_id` before launching anything else; if that write fails,
stop launching. On resume reconcile by `job_id` against registered sessions:
one unambiguous match repairs the map and is never relaunched, no match stays
pending, and multiple matches block as an idempotency violation.

## Job Status and Acceptance

Lifecycle owners keep their existing state machines; this table only maps
route execution to coverage and gate behavior:

| Situation | Coverage/job result | Next action |
| --- | --- | --- |
| Selected but slot unavailable | `selected` + transient `pending` | Keep the job queued in the current wave; do not drop coverage. |
| Worker launched | `selected` + transient `running` | Wait for the report; hard successors stay locked. |
| Every unit report accepted | `completed` or `verified` | Accept the job and unlock only its hard successors. |
| Group has mixed results | Accepted units stay accepted; affected units are `incomplete` | Keep the job non-green and recover only affected units. |
| Missing, invalid, timeout or lost report | `blocked` or `incomplete` | Preserve the original attempt and launch at most one focused recovery. |
| Recovery accepted | Affected unit becomes `completed`/`verified` with a new attempt path | Reconcile that unit and then unlock its hard successors. |
| Repeated recovery failure or external slot block | `blocked`/`degraded` | Stop with a visible reason and precise DEF/handoff; never silently self-check. |

A grouped job is green only when all of its unit reports are accepted. Valid
unit sections are accepted independently. Recovery identity is
`coverage_unit_id + original_job_id`: initial `attempt: 1`, one recovery
`attempt: 2`, never attempt 3. Recovery receives the original packet, invalid
output and findings; accepted siblings are not rerun. Job/session counts never
substitute for coverage, evidence or stage acceptance.

## Ownership

- `worker-session.md` owns packet vocabulary, grouped wrapper/report shape and
  recovery attempt rules.
- This file owns route choice, compatibility checks, capacity observation,
  bounded packing, the aspect-job-map shape, dependency gating and acceptance.
- `memory-flow-subagents.md` owns semantic coverage units, coverage statuses
  and the selected/skipped/degraded contract.
- Each flow owns its compatibility preferences and separation triggers; it
  does not redefine the common packet vocabulary.
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

Выбор локального route никогда не должен быть молчаливым. Запиши в рабочую сводку:

- исходное значение `execution.mode` и `execution.parallelism`;
- полный aspect map с отдельными `applicability`, `coverage_mode` и
  `independence_reason` для focused units;
- binary decision: `run_subagents` или `no_subagents`;
- aspect-local independence signals и критичные `unknown`;
- почему субагенты не добавят качества или скорости именно в этом запуске, если решение `no_subagents`;
- какие аспекты агент проверил сам;
- какие аспекты сознательно не проверялись и становятся `DEF-*`, `coverage debt` или явным риском;
- почему это не нарушает цель, ограничения и выбранный уровень evidence.

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
