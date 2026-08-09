# Plan: проработка до готового плана

Этот root entrypoint запускает плановую часть `mb-sdlc` flow: от входа в контекст до согласованных сценариев и эксплуатационного плана.

Flow origin policy: `project_local`.

Сначала прочитай `.memory-bank/dd-flow/common/flow-origin.md` и проверь `.memory-bank/dd-flow/manifest.json`, если он есть. `plan-flow` работает из project flow pack целевого проекта. Если pack manifest отсутствует или не валидируется, зафиксируй `project_flow_pack_degraded` в stage report и продолжай только если все нужные support-файлы plan-flow есть локально.

Он объединяет плановые стадии из `.memory-bank/dd-flow/mb-sdlc/plan/`: reflection, review, implementation, operations и scenarios, но не заменяет их. На каждой стадии прочитай соответствующий фазовый файл и выполни его инструкции. Старый путь `.memory-bank/dd-flow/plan/` является compatibility alias.

Перед запуском полного `plan` должна быть выполнена стадия `specify`, если пользователь не предоставил уже готовую спецификацию задачи. `specify` уточняет problem space, фиксирует acceptance criteria, верхнеуровневые вопросы, независимый `task_assessment` и compatibility `task_profile`. `plan` переводит это в solution space: архитектуру, work graph, проверки, evidence и handoff в code.

Не запускай реализацию, кодирование, слияние (merge), выкладку или закрытие `code/merge gates` без отдельного прямого указания пользователя.

## Что прочитать сначала

Прочитай общие правила:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/flow-origin.md`
- `.memory-bank/dd-flow/common/lifecycle-guards.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/sdlc-contours.md`
- `.memory-bank/dd-flow/common/policy-presets.md`
- `.memory-bank/dd-flow/common/subagents.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/workspace-bootstrap.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/common/goal-traceability.md`
- `.memory-bank/dd-flow/common/semantic-grounding.md`
- `.memory-bank/dd-flow/common/flow-flags.md`

После чтения `common/runtime-cli.md` выполни CLI version/operation preflight через `dd-flow status --project-root "<project-root>" --json`, если CLI доступен. Если `cli.compatibility.verdict` равен `incompatible` или `engine.compatibility.verdict` показывает, что normal writes небезопасны, не начинай mutating runtime/stage operations, пока не обновлён CLI/engine или не оформлен явный degraded/file-only маршрут. `outdated` является warning-only, если минимум совместимости соблюдён. Если CLI отказывает в `plan set`, `run attach-stage`, `run complete-stage` или `protocol transition`, не редактируй runtime вручную для обхода gate.

Затем прочитай карту проекта:

- `.memory-bank/index.md`
- `.memory-bank/structure.md`, если есть
- `.memory-bank/mbb/index.md`
- `.memory-bank/mbb/sdlc-workflow.md`
- `.memory-bank/mbb/delivery-docs-guide.md`
- `.memory-bank/mbb/spec-layer-guide.md`
- `.memory-bank/mbb/scenario-docs-guide.md`
- `.memory-bank/mbb/verification-matrix-guide.md`
- `.memory-bank/mbb/seed-fixtures-guide.md`
- `.memory-bank/mbb/evals-experiments-guide.md`, если сценарий требует агентной/метрической оценки, а не только deterministic pass/fail
- `.memory-bank/mbb/operations-release-guide.md`
- `.memory-bank/mbb/named-deferrals-guide.md`
- `.memory-bank/mbb/ai-runtime-prompt-architecture.md`, если задача затрагивает prompt-ы, model calls, agent pipeline, provider profiles, retry/repair или AI-generated artifacts

На стадии review используй правила `plan/review.md` и канонический алгоритм
`common/subagents.md`: сначала полная aspect coverage map, затем базовый
`orchestrator_local` route для каждого применимого аспекта. Повышай только
конкретные аспекты, прошедшие positive promotion gate. `full_plan` и
task-level risk сами по себе не требуют delegation.

Перед планированием выполни active DEF preflight из `common/memorybank.md`. План должен учитывать relevant `DEF-*` как входные ограничения: закрыть их в текущем scope, поднять в blockers, включить в проверки/evidence или явно оставить как non-blocking follow-up с причиной. Не планируй работу так, будто уже зафиксированных DEF не существует.

Если затронут интерфейс, дополнительно прочитай:

- `.memory-bank/mbb/ui-layer-guide.md`
- `.memory-bank/mbb/client-surfaces.md`
- `.memory-bank/mbb/code-contracts-guide.md`

Если меняется пользовательский путь, дополнительно прочитай:

- `.memory-bank/mbb/user-guides-layer.md`

## Язык пользовательских артефактов

Сразу после чтения `common/style.md` зафиксируй `target_language`: язык текущего пользовательского prompt-а, если пользователь явно не попросил другой язык. Все пользовательские ответы, плановые summaries, handoff-документы, stage reports, final reports и curated summaries пиши на `target_language`.

Внутренние task packets, raw evidence, JSON keys, code identifiers и HTML/CSS/JS шаблоны могут оставаться английскими. Если внутренний материал показывается пользователю напрямую, синтезируй или переведи пользовательский слой на `target_language`.

## Назначение

Твоя задача - довести идею, задачу или черновой протокол до состояния, когда реализацию можно начинать осознанно.

`plan` не является обязательным для каждой мелкой правки. Выполни минимум,
разрешённый `task_assessment.plan_floor` и effective `route.planning`; не
усиливай его из-за артефактов самого flow. Сначала переиспользуй существующие
patterns и не добавляй dependency/service/layer/process/abstraction/framework
без подтверждённого требования.

Если найден новый source fact, обнови только соответствующую assessment axis,
а затем пересчитай зависимый floor/flag. Critical fact повышает только
применимые evidence и aspect gates.

Если задача затрагивает Git policy, environment/stage policy, release, deploy, publish, verification gates, CI, package publishing, rollout, rollback или runbooks, включи SDLC contour coverage из `common/sdlc-contours.md`. Не добавляй operational noise в локальные задачи, где контуры действительно `not_applicable`, но причину неприменимости запиши.

Для non-trivial SDLC work также сформируй applied `policy_context` handoff. Минимум: sources, Git workspace route, Git delivery/fixation strategy, required evidence, check profile, release/deploy/publish next gates and gaps. Если текущая schema ещё не имеет отдельного поля, продублируй `policy_context` inside `sdlc_contours` and `report.md`, but do not omit it.

Если code/merge/delivery route будет изменять concrete checkout или запускать project tooling, сформируй compact `task_profile.workspace.bootstrap` handoff по `common/workspace-bootstrap.md`: requirement, policy source, canonical entrypoint, owning runbook, producer/gate, planned stage receipt path and candidate receipt, если он существует. Не дублируй receipt schema или invalidation algorithm в plan artifacts. Не объявляй handoff `ready_for_code`, если требование текущего code gate не определено или canonical entrypoint нельзя безопасно разрешить; blocker и durable `DEF-*` разделяй по каноническому contract.

Если план меняет существующую project policy, добавь `Policy Migration Block`: какая политика меняется, какой источник действует сейчас, какой источник предлагается, какие runbooks/checks/docs/stage reports нужно обновить, какие gates становятся `BLOCK-*`/`DEF-*`/`not_applicable`, и как будущие агенты увидят изменение в Memory Bank.

Если `specify` создал `<run-home>/01-specify/knowledge-extraction/candidates.json`, прочитай его перед work graph. Получай `<run-home>` через `dd-flow run status --json` / `run-index.json`; для legacy runs допустим сохранённый путь `.tasks/dd-flow-runs/<RUN-ID>/01-specify/...`. План должен связать relevant `KND-*` с plan items, documentation updates, verification gates, `DEF-*` или explicit non-goals. Не поднимай candidates в Memory Bank на стадии plan.

Если `specify` явно записал `knowledge_extraction.mode: skipped_no_substantive_input`, не создавай post-factum raw intake и не считай это ошибкой. Укажи skip в stage report только если он влияет на handoff.

План считается готовым не тогда, когда есть список файлов для правки, а когда понятны:

- какая ценность доставляется и кому;
- какая операционная цель (operational goal) должна быть достигнута и чем она будет доказана;
- какие границы фичи, эпика или системного изменения приняты;
- какие исходные вводные и ограничения должны сохраняться на всех стадиях;
- какая semantic spine связывает каждый meaningful plan item с user outcome, C4/module responsibility, non-goals and proof boundary;
- какие спецификации, ADR, сценарии, документы интерфейса и эксплуатационные правила нужно обновить;
- какие задачи можно выполнять параллельно, а какие зависят друг от друга;
- какие проверки доказывают результат;
- какие доказательства должны стать паспортами проверки (verification passports);
- какие вопросы закрыты, а какие честно оформлены как `DEF-*`.

## Рабочая зона

Создай или найди текущий `RUN-*` по `common/flow-runs.md`. Для нового полного coding plan happy path рабочая папка стадии находится в `<run-home>`, который возвращает CLI/run-index:

```text
<run-home>/02-plan/
```

Если доступен CLI, зарегистрируй run/stage:

```bash
dd-flow run start --project-root "<project-root>" --workspace-root "<workspace-root>" --flow-kind mb_sdlc --subject-type protocol --subject-id "<PRT-ID>" --slug "<slug>" --json
dd-flow run attach-stage "<RUN-ID>" --project-root "<project-root>" --stage plan --dir 02-plan --status running --data-schema-id dd-flow/plan-stage-report@4 --json
```

Если run был создан до внедрения specification stage и уже содержит `01-plan/`, не перенумеровывай его. Продолжай legacy layout и запиши `legacy_stage_layout: true` в report.

Legacy рабочая папка сохраняется как compatibility alias:

```text
.tasks/plan-YYYY-MM-DD-<slug>/
```

В ней можно хранить:

- задачи и отчёты субагентов;
- черновые заметки анализа;
- сводные отчёты по фазам;
- уроки (lessons learned), инсайты (insights) и кандидаты для `mb-lint`.

`.tasks/` не является долговечным источником истины. Всё, что должно пережить запуск агента, перенеси в Банк памяти: `protocol/`, `adr/`, `spec/`, `scenarios/`, `ui/`, `guides/`, `evidence/` или другой профильный раздел.

Активные документы Банка памяти не должны ссылаться на `.tasks/...` как на источник истины, план или доказательство.

## Specification и профиль работы

До плановых стадий проверь наличие свежей specification:

- в пользовательском сообщении;
- в текущем протоколе;
- в `<run-home>/01-specify/stage-report.json`, resolved через `run-index.json`;
- в явном решении пользователя или degraded reason.

Если specification нет, сначала выполни `protocol.md`/`common/specification.md` или остановись с `missing_specification`, если текущий запуск должен был стартовать уже после specification.

Примени `Plan Guard` из `common/lifecycle-guards.md`. `plan` нельзя запускать как обход `protocol/specify`: должен существовать `PRT-*`, содержательные вводные или summary, свежая specification либо явный degraded reason. Если вход не готов, остановись:

```text
blocked: plan_requires_protocol_and_specification
current protocol state: <state>
missing: protocol/specification/scope sizing
next safe action: run protocol/specify or create protocol set/member protocols
```

Не превращай неспецифицированный пользовательский объём в solution-space plan. Если недостаточно understanding-а, сначала выполни `context_discovery` и вернись к `specify`.

Перед work graph проверь `scope_sizing_verdict` и фактический объём. `plan` не должен героически планировать oversized scope как один mega-protocol. Если найдено `specification_with_slices_required` или факты показывают, что один протокол не сможет иметь одну цель, один главный acceptance-сценарий и reviewable verification set, остановись с `scope_too_large_for_single_protocol`.

В этом случае верни задачу в specification/slicing contour:

- создать или обновить `.memory-bank/protocol/_set/PSET-XXX-<slug>.md`;
- сохранить общий raw intake рядом с исходным/первым протоколом или PSET-linked intake, если он ещё не сохранён;
- предложить member protocol map with roles and `blocked_by_protocols`;
- создать/уточнить только executable member protocols with clear scope, related specs/features/ADR/scenarios and acceptance.

Не превращай этот blocker в технический план всего объёма. Допустимо дать краткую recommended slicing proposal, но не code-ready work graph для mega-scope.

Сначала проверь, что specification содержит четыре независимые assessment axes
и производный `plan_floor` с `level`, `surfaces` и `reason`. Пустой `surfaces` допустим
только с явной non-applicability reason. Не выводи axes из `task_profile`,
effective flags, route, reviewer count или generated artifacts. Legacy
`size`, `risk` и `planning_route_hint` должны быть source-labelled one-way
projection из breadth, impact и floor; verification остаётся independent.
Если `plan_floor: full_plan`, reason должен называть конкретный разрешённый
триггер из `common/flow-flags.md`; иначе верни specification на исправление, а не
создавай RUN override.

После `specify` действуй по effective `route.planning`, который не может быть
ниже `task_assessment.plan_floor`:

- `no_plan` или legacy `none` - полный `plan` не нужен; верни короткий grounding и переходи к следующему шагу, если пользователь просил реализацию.
- `compact_plan` или legacy `short` - составь короткий план без полного планового прохода.
- `full_plan` - выполняй полный плановый проход.

`plan` обязан сохранить `task_assessment` отдельно от `task_profile` и добавить
`route_decision`: почему выбран именно этот уровень планирования, execution
mode, Git route, verification depth и evidence level. Не затирай specification
техническим планом и не изменяй assessment из-за route artifacts; link back.

Короткий план должен содержать:

- понимание задачи и границы;
- затронутые зоны проекта;
- `impact`: какое поведение, контракты, эксплуатация и риски затронуты;
- `route`: планирование, Git/worktree, delivery и CI-ворота;
- `documentation`: есть ли долговечные факты для Банка памяти, какие документы нужно проверить или обновить;
- `verification`: какие проверки включены, пропущены или обязательны;
- `evidence`: какой уровень доказательств нужен;
- `execution`: нужны ли scouts/workers/verifiers и параллельная раздача независимых задач;
- блокирующие вопросы и допущения.

Даже если полный плановый проход не нужен, сохраняй принцип трассировки цели: должно быть понятно, чем выбранные действия докажут результат и какие ограничения сохраняются.

Если до выбора маршрута или во время короткого плана появилась существенная неопределённость, запусти вспомогательный `research`: по кодовой базе, Банку памяти, проектной документации или интернету. Research не является отдельным маршрутом. Он должен снять неопределённость, после чего профиль возвращается к `route.planning: no_plan`, `compact_plan` или `full_plan` (legacy aliases: `none`, `short`, `full_plan`).

## Runtime state

Если доступен `dd-flow` CLI, зарегистрируй planning session по `common/runtime-cli.md`:

- `flow_kind: planning`;
- `continuation_policy: go_router`;
- `current_stage: full_plan`;
- `next_action`: текущая плановая стадия или `plan_ready`.

Когда план готов, сохрани task graph в протоколе и, если CLI доступен, зарегистрируй его:

```bash
dd-flow plan set "<protocol-id>" --file "<plan.json>" --json
```

Пункты плана должны быть достаточно крупными, чтобы stage report показывал реальный progress, но не настолько мелкими, чтобы каждая правка Markdown становилась отдельным item. Обязательные проверки, result verification, quality review, scenarios и evidence/passport creation должны быть отдельными plan items, если являются gate.

## Plan stage report handoff

В конце плановой стадии создай пользовательский stage completion report plan-фазы, если есть run workspace и план не остановлен раньше на blocker/user decision:

```text
<run-home>/02-plan/stage-report.json
<run-home>/02-plan/stage-report.html
<run-home>/02-plan/report.md
```

Для legacy run layout допустимо продолжить запись в `01-plan/`; report должен явно указать, что specification stage отсутствует как отдельная папка из-за старого layout.

`stage-report.json` является source of truth для stage report и входом для `code` flow. Новый RUN пишет `.memory-bank/dd-flow/schemas/plan-stage-report.schema.json` с `schema_id: dd-flow/plan-stage-report@4` и текущим `flow_flags` snapshot projection (`snapshot_revision`, `snapshot_checksum`, effective values и provenance). Legacy `@1`, `@2` и `@3` остаются читаемыми.

- `protocol`: id, project, branch, stage and compact title;
- `overall`: verdict, score, next action and short summary;
- top-level `task_assessment`, source-labelled legacy projection и `route_decision`; если текущая schema ещё legacy, продублируй их в `handoff`/`report.md` без обратного вывода assessment;
- `execution_summary.wall_clock_ms`: обязательная разница между самым ранним `stage_attached.at` этого logical plan stage в RUN и `generated_at`; retries, ожидания и probe входят в интервал, `null` запрещён;
- `execution_summary.available_subagent_slots`: добавляй только если delegated
  jobs дошли до capacity step; это current slot count из runtime/probe, не
  число probe attempts или sessions;
- `route`: planning/git/merge/ci/delivery values with hover notes;
- `graph`: structural nodes/edges of the plan, not raw Mermaid source;
- `aspects`: aspect coverage, status, notes and findings;
- `review_gates`: optional focused gate visibility for architecture design quality, contract propagation, AI runtime design and concurrency/pipeline design;
- `sdlc_contours`: applicable/not_applicable/unknown contours, stage/target decisions and policy migration summary when relevant;
- `policy_context` or equivalent structured handoff for project policy sources, Git delivery/fixation strategy, checks, delivery next gates and unresolved gaps;
- `plan_items`: code-ready work items with dependencies, verification gates and details;
- `handoff`: files and next gate that `code` must read.

Не добавляй в `@4` `routing_summary`, `capacity_summary`, probe counters, token
estimates или вручную пересчитанные totals. Coverage уже хранится в `aspects` и
aspect map/graph, а фактические semantic launches — в `aspect-job-map@2`.

`aspects` в stage report - это полная coverage-карта plan review, а не список запущенных субагентов. Она должна содержать все применимые planning aspects, а неприменимые аспекты показывать как `not_applicable` с причиной. Для каждого аспекта укажи, как он покрыт: `orchestrator`, `subagent`, `grouped_subagent` или `degraded`. Если несколько аспектов покрыты одним grouped subagent, каждая строка аспекта остаётся отдельной и ссылается на общий `group_id`/`report_path`.

Проекция из `aspect-map.json` в stage report однозначна:

- `self_check` и принятое `external_evidence` -> `orchestrator`;
- `focused_subagent` -> `subagent`;
- `grouped_subagent` -> `grouped_subagent`;
- `deferred_as_DEF`/`blocked` -> `degraded` с соответствующим status;
- `applicability: not_applicable` -> `status: not_applicable` и reason.

Promoted aspects не должны закрываться анализом оркестратора после запуска их
jobs. Отсутствующий required aspect report нельзя заменить summary. Stage
report не может показывать `plan_ready`/`ready_for_code`, если required
delegated aspect остался без accepted report. `blocked` или documented
`degraded` объясняют non-green verdict, но не заменяют required acceptance и не
разрешают handoff в `code`.

`stage-report.html` генерируй на основе `.memory-bank/dd-flow/mb-sdlc/plan/stage-report-template.html`: замени JSON внутри `<script id="plan-data" type="application/json">` на validated `stage-report.json`, не создавай визуальную структуру с нуля и не добавляй пользовательский шум вроде исходника Mermaid, JSON dump или внутренних debug blocks.

Применяй общий контракт `.memory-bank/dd-flow/common/flow-runs.md` / `Stage Report Chain`: HTML-отчёт является инстансом установленного template, а не новой страницей. Если template отсутствует, не читается, не содержит `script#plan-data`, ломает render smoke или generated HTML не сохраняет ожидаемые anchors/functions, это `blocked`/`degraded_stage_report_template`; не называй `stage-report.html` готовым.

Во время transition можешь дополнительно записать legacy alias:

```text
.tasks/plan-YYYY-MM-DD-<slug>/plan-stage-report.json
.tasks/plan-YYYY-MM-DD-<slug>/stage-report.html
```

Если пишешь alias, укажи его в `run-index.json`/`artifact_aliases` и не считай самостоятельным источником истины.

Перед финальным плановым докладом выполни проверки stage report:

- если доступен `dd-flow` CLI: `dd-flow schema validate --schema plan-stage-report --file <stage-report.json> --project-root <project-root> --json`;
- докажи, что embedded JSON в `stage-report.html` семантически равен standalone `stage-report.json`;
- проверь, что HTML создан из `.memory-bank/dd-flow/mb-sdlc/plan/stage-report-template.html`, содержит `script#plan-data` и сохранил основные template anchors/render functions;
- выполни stage report render smoke доступным browser tool (`cmux-browser`, `agent-browser` или иной доступный browser surface): visible text содержит `Фаза Plan`/target-language title, project name, verdict, aspect block, plan graph, plan items and route;
- проверь DOM overflow по `body`, `.page`, `.hero`, `.coverageGrid`, `.planGrid`, `#graphSvg`, `#aspectRows`, `#planRows`, `.routeGrid`;
- если browser tool недоступен, выполни deterministic DOM/JS smoke другим способом и запиши degraded reason. Не называй stage report готовым, если JS runtime падает или visible text пустой.

Stage-report-visible текст пиши на `target_language` по `common/style.md`. HTML/CSS/JS identifiers and template internals may stay English.

В конце stage обнови run state:

```bash
dd-flow run complete-stage "<RUN-ID>" --project-root "<project-root>" --stage plan --status done --data 02-plan/stage-report.json --stage-report 02-plan/stage-report.html --report 02-plan/report.md --json
```

Добавь пути к `run-index.json`, `01-specify/stage-report.json`, `01-specify/stage-report.html`, `02-plan/stage-report.json`, `02-plan/stage-report.html` и legacy alias, если он есть, в `phase-summary.md`, `protocol/<PRT-ID>/summary.md` и итоговый navigation block, чтобы пользователь или следующий агент могли открыть их кликом.

## Предварительный контроль

До правки документов проверь состояние Git по `common/git-ops.md`:

- текущая ветка;
- связь с удалённой веткой;
- `git status`;
- подготовленные и неподготовленные изменения (staged/unstaged);
- какие изменения относятся к текущей работе, а какие появились раньше.

Если в рабочем дереве есть чужие или несвязанные изменения, не откатывай их. Если они мешают плановой работе, зафиксируй риск и предложи безопасный порядок: отдельный коммит документации, новая ветка фичи, рабочее дерево (worktree) или ожидание решения пользователя.

Если `task_profile.route.git` или legacy `flow_profile.route.git` равен `feature_worktree`, полный или короткий план должен выполняться в feature-worktree протокола. Проверь workspace: `protocol_location`, `feature_branch`, `worktree_path`, `base_commit` и compact bootstrap handoff по `common/workspace-bootstrap.md`. Если протокол случайно находится в интеграционной ветке, а профиль требует feature-worktree, остановись и сначала выполни перенос рабочей сессии в правильный Git-контур по `common/git-ops.md`.

На плановых фазах допустимо менять документы Банка памяти. Код меняй только если это явно нужно для уточнения контракта и не является началом реализации. Если сомневаешься, остановись и спроси пользователя.

## Порядок фаз

### 0. Вход в контекст

Если контекст проекта ещё не загружен, прочитай `.memory-bank/dd-flow/f.md` и выполни его как входную фазу.

Если пользователь уже указал конкретный протокол, фичу, эпик или задачу, начни с них, но всё равно проверь индексы Банка памяти и структуру проекта.

Если `specify` уже дал `task_assessment`, не перезапускай scouts без причины.
Используй assessment как immutable source facts, а profile/flags как policy
input; обновляй их только при новом source fact.

На каждой фазе применяй профиль так:

- `impact` - проверяй, не занижены ли последствия изменения;
- `route.planning` - определяет, выполняется ли полный плановый проход;
- `route.git` - передай в фазу эксплуатационного плана и будущий `implementation`;
- `route.delivery` и `route.ci` - определяют, какие операционные ворота должны быть описаны;
- `documentation` - фиксирует, есть ли основания для проверки или обновления Банка памяти;
- `research` - фиксирует, была ли неопределённость и как она снята до выбора маршрута;
- `verification` - определяет матрицу проверок и сценариев;
- `evidence` - определяет будущие proof bundles, verification passports или rollout evidence;
- `execution` - определяет, нужны ли субагенты, какие роли им поручаются и можно ли раздавать независимые task packets параллельно.

Если assessment/profile меняется, обнови его в рабочей папке или протоколе и объясни, какой новый source fact вызвал изменение.

### 1. Переосмысление протокола

Прочитай `.memory-bank/dd-flow/mb-sdlc/plan/reflection.md` и выполни фазу 0.

Цель этой стадии - проверить, правильно ли устроена логика будущей работы: не потеряны ли последствия, документы, решения, интерфейсы, сценарии, эксплуатационные ограничения и долговечные правила.

После стадии обнови протокол и связанные документы. Если без решения пользователя нельзя понять цель, границы или ценность, остановись на воротах вопросов.

Отдельно сформулируй операционную цель, исходные вводные, ограничения и явные не-цели (non-goals). Если они уже есть в протоколе, проверь, что они понятны и не противоречат друг другу.

### 2. Системное ревью

Прочитай `.memory-bank/dd-flow/mb-sdlc/plan/review.md` и выполни фазу 1.

Цель этой стадии - посмотреть на будущую работу сверху вниз: продукт, система, инженерия, контракты, сценарии, данные, интерфейс, пользовательская документация и эксплуатация.

Проверь, что каждый найденный риск или контур связан с операционной целью или исходным ограничением. Если ревью предлагает работу, которая не ведёт к цели и не снимает ограничение, пометь её как необязательную или вынеси за границы работы (scope).

На стадии review сначала составь aspect coverage map по правилам
`plan/review.md`. Каждый применимый аспект начинает с `self_check`; затем
примени positive promotion gate к каждому аспекту. Если promoted aspects нет,
оркестратор сразу выполняет local review без отдельного decision artifact.

Используй субагента только для aspect с выбранным delegated route. Каждый
`focused_subagent` требует aspect-local `independence_reason`; `full_plan`,
task-level `high` и число аспектов сами по себе не являются причиной. Остальные
аспекты сохраняют минимально достаточный self/grouped/focused route. В packet
указывай `.memory-bank/dd-flow/workers/verify.md`, bounded read scope и report
path.

После отчётов не принимай выводы механически. Сопоставь их с проектом и явно зафиксируй, что принято, что отклонено и почему.

### 3. План реализации

Прочитай `.memory-bank/dd-flow/mb-sdlc/plan/implementation.md` и выполни фазу 2.

Цель этой стадии - превратить протокол в исполнимый граф задач.

План должен объяснять:

- матрицу цели и ограничений: какая часть цели или ограничения закрывается какой задачей, где интегрируется и чем проверяется;
- контуры продукта, системы, инженерии и эксплуатации;
- границы задач и зависимости;
- какие задачи можно поручать параллельно;
- какие внутренние промпты должен читать каждый будущий исполнитель: `workers/code.md`, `workers/verify.md`, `workers/docs.md`, `def/plan.md`, `def/fix.md`;
- какие проверки, сценарии и паспорта проверки потребуются;
- какие знания из `.tasks/` должны быть подняты в Банк памяти.

Если используется `dd-flow` CLI, после утверждения графа задач обнови `plan.json` и вызови `dd-flow plan set`. Не считай prose-план единственным источником progress, если CLI runtime включён для проекта.

Не превращай план реализации в старт реализации. На этой стадии кодовые задачи описываются, но не выполняются.

### 4. Эксплуатационный план

Прочитай `.memory-bank/dd-flow/mb-sdlc/plan/operations.md` и выполни фазу 3.

Цель этой стадии - заранее описать путь от рабочей ветки до приемки на нужном контуре.

Протокол должен различать:

- локальные проверки;
- готовность ветки фичи;
- черновой запрос на слияние (draft pull request);
- непрерывную интеграцию (CI);
- предварительное окружение (preview);
- бета-стенд (beta);
- продуктовое окружение (production);
- откат (rollback) и эксплуатационные доказательства.

Если проектных правил нет, предложи разумную политику и запланируй её фиксацию в `spec/operations/`.

### 5. Сценарии и доказательная приемка

Прочитай `.memory-bank/dd-flow/mb-sdlc/plan/scenarios.md` и выполни фазу 4.

Цель этой стадии - согласовать сценарии как контракт будущей приемки.

Разделяй:

- мысленный прогон до реализации: он ищет пробелы;
- исполнимый сценарий после реализации: он доказывает результат;
- артефакт запуска (runtime artifact): сырой лог, скриншот, JSON, запуск непрерывной интеграции (CI run);
- пакет проверки (proof bundle): набор артефактов одного запуска;
- паспорт проверки (verification passport): выверенный документ (curated document) в Банке памяти;
- приемочный вердикт (acceptance verdict): решение, что ворота закрыты.

На плановой стадии не создавай фиктивные доказательства. Нужно описать, какие proof bundles и verification passports должны появиться после реализации, где они будут лежать и какой вердикт смогут обосновать.

Сценарии должны закрывать не абстрактное "что-то проверили", а конкретные строки матрицы цели и ограничений: цель, ограничение, точка интеграции, ожидаемое доказательство.

## Ворота вопросов

Не задавай пользователю вопросы раньше времени, если вопрос можно снять чтением проекта, кода или Банка памяти.

Если после исследования остаётся блокер, который зависит от пользователя, задай вопрос с контекстом:

- в чём вопрос;
- почему он блокирует план;
- какие варианты есть;
- последствия каждого варианта;
- какая рекомендация и почему.

Если вопрос не зависит от пользователя, не перекладывай его на пользователя. Оформи `DEF-*` только если есть реальная причина не закрывать вопрос сейчас.

`DEF-*` должен содержать происхождение, контекст продолжения, что проверено, что блокируется, что не блокируется, владельца, следующие ворота (gate) и явное указание, зависит ли блокер от пользователя.

## Ворота перед реализацией

После всех плановых стадий остановись.

Не запускай:

- `code/implement.md`;
- кодовых субагентов на реализацию;
- массовые изменения кода;
- слияние (merge);
- выкладку;
- закрытие протокола как выполненного.

Сформируй доклад и попроси отдельное подтверждение пользователя на переход к реализации.

Обнови summary текущего протокола в `protocol/<PRT-ID>/summary.md`: добавь ссылку на specification, краткий итог планирования, выбранный `route.planning`, главные задачи, сценарии, проверки, evidence, открытые вопросы и статус `plan_ready`, `plan_blocked` или `needs_user_decision`.

## Что показать пользователю

Итог плановой стадии нужен пользователю не как архив, а как основание для решения: запускать реализацию, уточнять план или возвращаться к проработке.

Поэтому в конце обязательно подготовь две формы результата:

- рабочий файл `.tasks/plan-.../phase-summary.md` с кратким следом по стадиям;
- пользовательский доклад в финальном сообщении или `.tasks/plan-.../final-report.md`, если flow ведётся с рабочими артефактами.

`phase-summary.md` должен кратко отвечать по каждой фазе:

- `reflection`: что было переосмыслено, какой главный пробел найден, что было вынесено в долговечные документы;
- `review`: какие контуры проверены, какие риски приняты в работу, что признано
  неактуальным, какие аспекты закрыты локально и какие promoted aspects были
  делегированы;
- `implementation plan`: какой граф задач получился, какие пакеты независимы, какие зависят друг от друга, как задачи покрывают цель и ограничения;
- `operations`: как работа пойдёт через `route.git`, проверки, запрос на слияние (pull request), CI и окружения из `route.delivery`;
- `scenarios`: какие сценарии предложены или согласованы, какие будущие доказательства и паспорта проверки нужны по `verification` и `evidence`.
- `plan stage report`: где лежат `run-index.json`, specification report, plan report и legacy aliases, если они созданы; прошли ли schema/equality/render smoke checks, и какой next action stage report показывает для `code` flow.

Пользовательский доклад должен быть ещё короче и понятнее. Он должен показать:

- краткое резюме цели: что вообще делаем и какой результат хотим получить;
- краткую матрицу цели и ограничений: что должно быть достигнуто, какими задачами, где интегрируется и чем будет доказано;
- краткий итог по `task_profile`/`flow_profile`: какие контуры включены и почему;
- краткое резюме плана работы: основные пакеты задач и порядок;
- что было доработано по стадиям `plan/*`;
- какие документы созданы или изменены;
- какие вопросы, решения и ограничения появились;
- где открыть stage report plan-фазы и что он показывает;
- есть ли `DEF-*`, почему они появились или почему не появились;
- что требуется от пользователя сейчас: подтвердить реализацию, выбрать вариант, снять блокер или отправить план на доработку.

Не называй сценарии согласованными, если пользователь их явно не подтвердил. Если сценарии только предложены агентом как разумный набор приемки, пиши "предложены к согласованию" и ставь статус `needs_user_decision`, если без согласования нельзя честно начинать реализацию.

## Итоговый доклад

В конце верни короткий, но содержательный отчёт:

- **Навигация:** блок из `.memory-bank/dd-flow/common/style.md`: `prompt: plan.md`, активный протокол, `current_stage`, `completed_stage`, `next_action`, маршрут, блокеры, активные `DEF-*` и необходимость решения пользователя.
- **Цель и результат:** какой протокол, фича, эпик или задача прорабатывались, что план должен дать пользователю.
- **Трассировка цели:** как план покрывает операционную цель, исходные вводные и ограничения; что не входит в границы работы (scope).
- **Что доработано по стадиям:** по одному-два предложения на `reflection`, `review`, `implementation`, `operations`, `scenarios`.
- **План работы:** главный граф задач, порядок выполнения, что можно распараллелить, где нужны субагенты.
- **Изменённые документы:** какие документы Банка памяти изменены и зачем.
- **Проверки и доказательства:** какие сценарии будут доказывать результат, где будут храниться паспорта проверки.
- **Решения и ограничения:** какие решения приняты, какие границы работы (scope) зафиксированы, что явно не входит в текущую волну.
- **DEF и вопросы:** какие `DEF-*` остались, почему они появились или почему не нужны; какие вопросы к пользователю реально блокируют движение.
- **Статус:** `plan_ready`, `plan_blocked` или `needs_user_decision`.

Если статус `plan_ready`, укажи следующий шаг:

```text
После подтверждения пользователя можно запускать `.memory-bank/dd-flow/mb-sdlc/code/implement.md`.
```

Если статус `plan_blocked` или `needs_user_decision`, не предлагай реализацию до снятия блокеров.
