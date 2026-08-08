# Specification stage

Этот общий блок описывает логическую стадию `specify`, которая идёт после создания обычного протокола и перед `plan`.

`specify` работает в problem space: уточняет пользовательскую задачу, критерии готовности и верхнеуровневые решения. `plan` после этого переводит спецификацию в solution space.

## Вход

Прочитай:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/protocol-bootstrap.md`
- `.memory-bank/dd-flow/common/context-discovery.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/dd-flow/common/semantic-grounding.md`
- `.memory-bank/dd-flow/mb-sdlc/specify/design-aspects/index.md`
- `.memory-bank/mbb/scenario-docs-guide.md`
- `.memory-bank/mbb/seed-fixtures-guide.md`, если acceptance зависит от подготовленных данных
- `.memory-bank/mbb/evals-experiments-guide.md`, если результат требует agentic/metric assessment
- активный `protocol/<PRT-ID>/summary.md`
- похожие спецификации, ADR, сценарии, UI/docs и предыдущие протоколы, если они явно помогают сделать задачу "по аналогии".

## Обязательный результат

Сформируй lightweight specification:

- проблема и цель пользователя;
- акторы/пользовательские сценарии, если применимо;
- функциональные требования;
- нефункциональные требования и ограничения;
- границы scope и non-goals;
- затронутые контуры проекта;
- acceptance criteria;
- acceptance story/scenario: кто действует, в каком состоянии системы, какие шаги выполняет и какое наблюдаемое состояние доказывает готовность;
- автоматизируемая проверка;
- ручная проверка, если автоматизация невозможна;
- требования к seed/fixture/world/cleanup, если acceptance зависит от данных;
- need for eval/experiment, если deterministic scenario недостаточен;
- верхнеуровневые вопросы с постоянными идентификаторами;
- зафиксированные ответы пользователя;
- независимый five-axis `task_assessment`, одностороннюю compatibility projection
  в `task_profile` и рекомендуемый route для `plan`;
- выбранные источники semantic grounding: raw user intent, product/feature, system/C4, constraints and evidence level, либо краткое `not_applicable` reason для действительно локальной задачи.

Specification не должна превращаться в technical design. Детали реализации, файлы и порядок code tasks принадлежат `plan`.

До route выбора заполни ровно пять осей из `common/flow-flags.md`:
`scope_breadth`, `solution_novelty`, `solution_uncertainty`, `failure_impact` и
`plan_floor`. Каждая ось имеет `level`, `surfaces` и `reason`; пустой список
поверхностей требует явной non-applicability reason. Не выводи assessment из
flags, legacy `task_profile`, выбранной полноты plan или количества созданных
артефактов. Legacy `size`, `risk` и `planning_route_hint` проецируются только
из breadth, impact и floor; `verification_mode` остаётся независимым.

Выбирай минимально достаточное решение: сначала reuse существующих patterns,
и только затем extension/new mechanism, если этого требует задача. Critical
fact повышает глубину только применимых gates и не делает всю задачу сложнее.

`specify` не создаёт карточки для всех будущих tasks, но обязан оставить `plan` достаточно ясный semantic handoff: какой outcome нужен, какая system responsibility может быть затронута, что нельзя размывать и какие evidence claims потребуют более сильной проверки, чем local unit test.

## Optimized Requirements-Gap Pass

После того как протокол материализован и сохранён raw intake, `specify` сразу
делает короткий requirements-gap pass до `plan`. Это логическая часть текущей
стадии, а не новый runtime stage. Зонтичный роутер и отдельные чеклисты лежат
в:

- `.memory-bank/dd-flow/mb-sdlc/specify/discovery.md` — bounded project research;
- `.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/index.md` — routing,
  consolidation and question gate;
- `.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/` — one concise
  file per requirements-analysis method.

### Route order

Выполняй ровно этот порядок:

1. **Baseline scan — всегда.** Проверь outcome/value, actors, scope,
   non-goals, happy path, material alternate/error paths, business rules,
   acceptance evidence, assumptions and conflicts. Ясная trivial/local task
   может завершиться с `methods: baseline_only`.
2. **Research gate — опционально.** Сначала назови вопросы, которые могут
   изменить problem-space. Выбери `skip`, `memory_bank_first` или
   `focused_project`; ищи Memory Bank и durable sources раньше кода/history.
   У каждой разведки есть source list, findings, analogy strength, conflicts и
   stop reason. Эскалируй в code/history только по material triggers, а не для
   общего повышения уверенности.
3. **Method applicability matrix — до чтения method files.** Для каждого
   метода зафиксируй `not_applicable`, `light` или `full`, signals, reason,
   questions-to-answer и stop condition. Читай только selected files.
4. **Consolidation — один ledger.** Findings всех методов, research facts,
   requirement updates и happy/alternate/error coverage своди в один
   `gap_analysis`. Не создавай отдельный пользовательский отчёт на метод.
5. **Resolution/user gate.** Сначала используй authoritative fact, сильную
   analogy как proposed default, safe agent-owned assumption/non-goal и только
   затем вопрос пользователю. Вопрос допустим только когда решение меняет
   outcome, scope, rule, role/lifecycle semantics, irreversible effect, risk,
   compatibility или acceptance.

### Proportionality rules

- Baseline обязателен; specialized method — только при meaningful signal.
- Обычно достаточно одного-трёх selected methods. Больше — только для
  независимых hard-risk triggers с явным объяснением.
- `light` означает narrow checklist section, а не урезанный полный проект.
- Пустое optional field не является gap. Gap существует только если omission,
  ambiguity, conflict или assumption может материализоваться в accepted
  behavior, scope, safety, obligation or evidence.
- Strong analogy закрывает вопрос только когда source strength это позволяет;
  weak/conflicting analogy показывается как option или user question, не как
  молчаливое требование.
- Исследование останавливается, когда named questions resolved/disproved или
  превращены в explicit unknown/gap. Дальнейший поиск ради confidence не
  разрешён.

### Problem-space question contract

Вопросы должны быть high-level и иметь стабильный `Q-*` id. Каждый вопрос
содержит `why_it_matters`, 2–3 meaningful options, recommendation,
recommendation rationale и эффект вариантов на scope/acceptance. Пользователь
может предложить собственный вариант. За один раунд задавай только наиболее
влиятельные вопросы, обычно не более трёх.

Не спрашивай пользователя о technical architecture, data structures,
endpoints, file/module layout, implementation sequence, worker topology,
routine Git или tooling. Это solution space и ответственность `plan`/агента.

### Shared result contract

Specification/stage report должны сохранять `research_routing`,
`method_applicability`, `gap_analysis`, `scenario_coverage` и явную границу
`problem_solution_boundary`. Минимальный ledger имеет вид:

```yaml
gap_analysis:
  research:
    level: skip | memory_bank_first | focused_project
    questions: []
    sources: []
    findings: []
    analogies: []
    conflicts: []
    stop_reason:
  methods: []
  gaps:
    - id: GAP-001
      source_method:
      category: missing | ambiguous | conflicting | unverified_assumption
      problem_space: true
      impact: blocking | significant | non_blocking
      evidence: []
      affected_requirement:
      resolution: project_fact | proposed_default | user_decision | assumption | non_goal | deferral
      status: open | resolved | deferred
      question_id:
  scenario_coverage:
    happy_paths: []
    alternate_paths: []
    error_paths: []
  requirement_updates: []
```

`specify` завершается только когда нет открытых blocking problem-space
вопросов, а remaining unknowns стали explicit assumption, non-goal, DEF,
blocker или user question. Design aspects остаются отдельным следующим
контуром и не считаются requirements methods.

Discovery findings могут обновить `surfaces`, `reason` и
`solution_uncertainty`, но research route и число прочитанных источников не
являются assessment axes сами по себе.

## Design Aspects

На стадии `specify` используй `.memory-bank/dd-flow/mb-sdlc/specify/design-aspects/index.md` как шпаргалку для известных типов задач. Если задача затрагивает CLI, AI pipeline/model prompts, UI или другой явно описанный design aspect:

- прочитай соответствующий design aspect;
- предложи пользователю canonical defaults только там, где это влияет на problem space or accepted behavior;
- не превращай design aspect в скрытое требование;
- фиксируй только compact decision artifact: applicability, accepted defaults, deviations, user overrides, verification seeds and source link;
- если пользователь меняет canonical default, user override имеет приоритет and must be recorded explicitly;
- передай `verification_seeds` and `linked_plan_aspects` в handoff for `plan`.

Рекомендуемый формат:

```yaml
design_aspects:
  - id:
    source:
    applicability: applicable | not_applicable | unknown
    applicability_reason:
    canonical_defaults: accepted | accepted_with_deviations | rejected | not_applicable
    accepted_defaults: []
    deviations: []
    user_overrides: []
    questions_closed: []
    verification_seeds: []
    linked_plan_aspects: []
```

Если подходящий design aspect упомянут пользователем, но не применён, укажи reason in `design_aspects` or `handoff`.

## Scope Guard

В начале и в конце `specify` проверь, не оказался ли scope слишком большим для одного executable protocol.

Если задача не помещается в один протокол, не проталкивай её в `plan` как mega-protocol. Останови обычный protocol path и предложи protocol set with executable member protocols:

```text
.memory-bank/protocol/_set/PSET-XXX-<slug>.md
.memory-bank/protocol/PRT-XXX-<member-slice>.md
```

Durable specs, epics, features, ADR and scenarios still capture project knowledge where needed. `PSET-*` coordinates delivery scope; each member `PRT-*` remains an executable SDLC document with `protocol_set`, `blocked_by_protocols`, source intake and related durable-document links.

Используй вертикальные слайсы для больших продуктовых или workflow-фич, где пользовательская ценность проходит через несколько слоёв системы. Каждый slice должен иметь одну цель и один основной acceptance-сценарий. Foundation/migration/hardening slices допустимы только при явной необходимости.

Не задавай пользователю вопросы вроде "как нам нарезать работу?", "в каком порядке делать протоколы?", "какой технический слой первым реализовать?". Это solution-space и ответственность агента. Вместо этого после context discovery предложи схему разбиения и попроси поправить только если она не соответствует problem intent.

## Вопросы пользователю

Задавай пользователю только вопросы верхнего уровня, которые агент не может безопасно решить сам и которые влияют на спецификацию:

- что именно должно считаться готовым;
- какой пользовательский сценарий является приемочным;
- какие данные, роли, окружение или внешний канал нужны, чтобы этот сценарий честно проверить;
- какой scope намеренно исключён;
- какой внешний договорённости, бизнес-правило, risk tolerance или manual gate важны;
- какой Git/delivery contour нужен, если это не видно из проекта;
- можно ли автоматизировать приемку или нужна ручная проверка.
- какой policy source или delivery/fixation rule отсутствует, если этот gap влияет на problem-space acceptance, current gate or future delivery gate.

Не задавай пользователю орг- и solution-space вопросы, которые агент должен решить сам: внутренний порядок реализации, file layout, worker/subagent strategy, конкретный Git route для стандартного случая, способ декомпозиции по модулям или формат технических task packets.

### Policy context in specify

Specification records policy sources, not a full implementation plan. Include a compact handoff when task acceptance or delivery depends on project policy:

```yaml
policy_context_spec:
  sources:
    project_policy: read | missing | not_applicable
    operations: []
    verification: []
    scenarios: []
    defs: []
  gaps:
    questions: []
    assumptions: []
    blockers: []
```

Ask the user only when a missing policy fact changes accepted behavior, external obligations, risk tolerance or a delivery gate. Do not ask the user to choose internal file layout, worker strategy or routine Git mechanics when project policy and task size are enough for the agent to decide in `plan`.

Каждый вопрос получает стабильный id:

```text
Q-001, Q-002, ...
```

### Iterative question ledger

`specify` ведётся как итеративный ledger вопросов, а не как одноразовый список.

Правила:

- gaps, неоднозначности, недоговорённости and user-level decisions получают стабильные ids `Q-001`, `Q-002`, ...;
- открытый вопрос остаётся в `open_questions`, пока он влияет на problem-space specification;
- отвеченный вопрос переносится в `fixed_questions` с ответом, датой/source and resulting decision;
- закрытые вопросы можно кратко показывать как "уже снято", но нельзя снова задавать пользователю как открытые;
- очередной user-facing блок вопросов содержит только те вопросы, которые ещё открыты and still affect specification;
- если открытых вопросов нет, явно пиши `open_questions: none` / `initial_gaps: none_detected`, а не оставляй тишину.

Каждый открытый вопрос должен содержать:

- `id`;
- сам вопрос;
- почему это важно and what risk/ambiguity it removes;
- 2-3 варианта ответа or paths, если варианты осмысленны;
- recommended option;
- rationale for recommendation;
- что меняется в specification depending on the answer.

Не задавай вопрос без рекомендации, если агент может обоснованно рекомендовать путь. Не используй варианты как способ переложить solution-space на пользователя: если вопрос про внутреннюю реализацию, декомпозицию, worker strategy or file layout, агент должен сам предложить решение в `plan`, а не спрашивать пользователя в `specify`.

`specify` считается завершённым только когда:

- нет открытых blocking problem-space questions;
- remaining unknowns converted to explicit assumptions, `DEF-*`, blocker or accepted non-goal;
- scope, non-goals, acceptance scenario and verification contour are clear enough for `plan`;
- `fixed_questions` and `open_questions` in protocol summary/stage report reflect the final state.
- applicable `design_aspects` are recorded or explicitly marked not applicable/unknown with next action.

Если доступен инструмент `request_user_input`/`askuserquestion`, используй его для коротких вопросов с 2-3 вариантами и рекомендованным вариантом. Если инструмент недоступен, задай вопрос обычным сообщением, но сохрани те же id и варианты.

## Аналогии

По умолчанию сначала ищи аналоги в Memory Bank: specs, scenarios, ADR, UI docs, previous protocols and guides. В код и Git history углубляйся только если:

- в Memory Bank нет достаточной аналогии;
- задача затрагивает публичный контракт, runtime, данные, безопасность, CLI, UI flow или проверки;
- пользователь явно просит более глубокое сопоставление.

Субагенты допустимы для поиска аналогий и контекстных gaps, но только read-only. Они не планируют реализацию и не принимают решения вместо оркестратора.

## Stage artifacts

Для полного coding run specification stage пишет:

```text
<run-home>/01-specify/
  specification.json
  stage-report.json
  stage-report.html
  report.md
```

Для trivial/compact задач specification всё равно существует, но может быть короткой. `plan` должен иметь свежую specification или явный degraded reason.

`specification.json` и stage report сохраняют `task_assessment` отдельно от
`flow_flags` и `task_profile`; downstream не должен восстанавливать его из
выбранного route.

`stage-report.html` строится из `.memory-bank/dd-flow/mb-sdlc/specify/stage-report-template.html` и embedding JSON внутри `script#specification-data`.

## Raw Intake And Knowledge Candidates

В начале `specify` проверь raw intake текущего протокола:

- если есть новые содержательные ответы пользователя, добавь их в `intake/user-input.md`;
- если вводные командные или пустые, не создавай искусственный `user-input.md`;
- если raw intake отсутствует по причине отсутствия содержательных вводных, запиши `raw_intake.status: not_applicable` и `knowledge_extraction.mode: skipped_no_substantive_input` в `stage-report.json`.

Для нетривиальной задачи с содержательным raw intake запусти отдельную fresh-session read-only worker-сессию по `.memory-bank/dd-flow/workers/knowledge-extraction.md`. Caller создаёт self-contained task packet по `.memory-bank/dd-flow/common/worker-session.md` с `session_mode: fresh_empty_session_required`, `context_authority` из common contract, `common_prompt`, `role_prompt`, exact protocol/intake/specification inputs, `write: <run-home>/01-specify/knowledge-extraction/**`, запретом на active Memory Bank writes, exact `write_report_to` и schema check. Task packet и named files are authoritative; forked orchestrator context is advisory only. Для legacy run используй сохранённый путь из `run-index.json`.

`candidates.json` должен валидироваться схемой `dd-flow/knowledge-candidates@1` до acceptance, например `dd-flow schema validate --schema knowledge-candidates --file <run-home>/01-specify/knowledge-extraction/candidates.json --project-root <project-root> --json`. Validation failure или missing required artifact отклоняет результат: не используй candidates в specification, зафиксируй failure и запусти normal recovery with the original prompt chain, packet, preserved artifacts, failure note and a distinct attempt report path. `specification.json` и `stage-report.json` должны ссылаться на accepted candidate artifacts и показывать:

- raw intake status;
- extraction mode/status;
- candidate count by target layer;
- conflicts and user-level questions.

Knowledge candidates являются provisional. `specify` использует их для вопросов, acceptance и handoff, но не поднимает их в durable Memory Bank layers.

Оркестратор принимает extraction result только после successful schema validation, report with formal status and confirmation that writes stayed within the packet boundary. При `blocked`, degraded result или rejected schema не делай hidden fallback и не создавай кандидаты вручную: record the reason and continue only through the documented recovery/degraded route.

## Выходные статусы

Используй:

- `specified_ready_for_plan` - можно запускать `plan`;
- `specified_ready_for_code_compact` - задача достаточно мала, `plan` может быть compact/short;
- `waiting_for_user` - нужен ответ пользователя;
- `blocked` - нельзя продолжать без внешнего условия;
- `degraded` - specification составлена с явно описанным снижением качества.

`ready_for_code_auto` и `ready_for_code_after_user_review` являются policy/exit decisions после `plan`, а не стадиями протокола.
