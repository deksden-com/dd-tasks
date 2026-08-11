# Фаза 1: системное ревью протокола

Прочитай общие правила:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/sdlc-contours.md`
- `.memory-bank/dd-flow/common/policy-presets.md`
- `.memory-bank/dd-flow/common/subagents.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/common/goal-traceability.md`
- `.memory-bank/dd-flow/common/semantic-grounding.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/dd-flow/mb-sdlc/plan-aspects/index.md`

Затем прочитай в MBB:

- `.memory-bank/mbb/sdlc-workflow.md`
- `.memory-bank/mbb/delivery-docs-guide.md`
- `.memory-bank/mbb/spec-layer-guide.md`
- `.memory-bank/mbb/c4-model.md`
- `.memory-bank/mbb/code-contracts-guide.md`
- `.memory-bank/mbb/coding-standards-guide.md`
- `.memory-bank/mbb/client-surfaces.md`
- `.memory-bank/mbb/scenario-docs-guide.md`
- `.memory-bank/mbb/scenario-runner-guide.md`
- `.memory-bank/mbb/verification-matrix-guide.md`
- `.memory-bank/mbb/seed-fixtures-guide.md`
- `.memory-bank/mbb/evals-experiments-guide.md`, если сценарий, prompt/model behavior или качество результата требуют agentic/metric assessment
- `.memory-bank/mbb/operations-release-guide.md`
- `.memory-bank/mbb/named-deferrals-guide.md`
- `.memory-bank/mbb/ui-layer-guide.md`, если затронут интерфейс
- `.memory-bank/mbb/user-guides-layer.md`, если меняется пользовательский путь

## Язык пользовательских артефактов

Зафиксируй `target_language` по `common/style.md`. Все пользовательские summaries, плановые документы, dashboard-и, final reports и visible user-facing content пиши на `target_language`; внутренние task packets, aspect reports, raw evidence, JSON keys, code identifiers и HTML/CSS/JS templates могут оставаться английскими.

Твоя задача - провести ревью протокола и связанных документов сверху вниз: от смысла и границ до кода, проверок, интерфейса и эксплуатации.

Перед выбором количества аспектов и reviewer sessions примени RUN snapshot
consumer gate из `common/flow-flags.md`: читай effective flags из `run.json`,
проверяй revision/checksum против `run-index.json` и сохраняй причину для
каждого `skip`/`not_applicable`. `plan.review.mode` и `subagents.route`
регулируют proportional coverage, но не отменяют applicable security,
contract, data-integrity или acceptance gates.

Запиши start trace по `common/trace.md` в активный протокол. Если доступен `dd-flow` CLI, зарегистрируй planning session по `common/runtime-cli.md`: `flow_kind: planning`, `continuation_policy: go_router`, `current_stage: f1_review`, `next_action: protocol/system review`.

Ревью должно ответить не только "что ещё можно улучшить", но и "ведёт ли предложенный набор работ к операционной цели с сохранением исходных ограничений".

Сначала проверь отдельный `task_assessment`: все пять axes имеют допустимый
level, `surfaces` и `reason`, не получены из route/flags/artifact count, а
legacy projection односторонняя и source-labelled. Затем проверь adequacy
`task_profile` или legacy `flow_profile` как compatibility/policy view:

- `impact`/risk не занижает поведение, контракт, эксплуатацию и риск;
- `route.planning` соответствует найденной сложности и сохраняет adaptive complexity из specification;
- `route.git` соответствует политике проекта и риску;
- `route.delivery` и `route.ci` отражают реальные CI/deploy/beta/production ворота;
- `documentation` корректно фиксирует, есть ли основания обновлять Банк памяти;
- `verification` включает проверки, которые действительно доказывают цель;
- `evidence.level` достаточен для выбранных ворот;
- `execution` не перегружает маленькую работу, но и не оставляет большую работу без нужных workers/verifiers.

Если specification отсутствует для нетривиальной задачи, не закрывай review как готовый: вернись к `common/specification.md` или зафиксируй degraded/legacy reason.

Если specification или протокол несут oversized scope, не принимай план как готовый. Вердикт review должен быть `scope_too_large_for_single_protocol`, когда работа требует нескольких независимых целей, acceptance-сценариев, subsystem gates или неревьюируемого diff. Правильный выход - durable spec plus slice map, а не расширенный mega-plan.

## Как организовать ревью

Создай рабочую папку в `.tasks/` для этой фазы. Сначала прочитай
`.memory-bank/dd-flow/mb-sdlc/plan-aspects/index.md`, составь полный
`aspect coverage map` и выполни канонический алгоритм из
`common/subagents.md`. Отдельного решения об «отказе от субагентов» нет:
каждый применимый aspect начинает с local route.

Не смешивай два разных вопроса:

- `applicability` - относится ли аспект к задаче;
- `coverage_mode` - как именно этот RUN закрывает аспект.

Canonical fields for every catalog aspect:

```yaml
aspect_id:
applicability: applicable | not_applicable | unknown
applicability_reason:
coverage_mode: none | self_check | focused_subagent | grouped_subagent | external_evidence | deferred_as_DEF | blocked
coverage_reason:
promotion: none | required | opportunistic
promotion_trigger:
independence_reason: <required only for focused_subagent>
planned_artifacts:
actual_artifacts:
verdict:
findings:
deferrals:
```

`light/deep` не являются каноническим состоянием аспекта. Если старый report template пока показывает `light/deep`, используй это только как derived UI wording из `coverage_mode`, но в RUN artifact сохраняй `applicability` and `coverage_mode` separately.

`aspect coverage map` является coverage-картой, а не списком фактически запущенных субагентов. Он должен содержать все catalog aspects; неприменимые аспекты не исчезают, а получают `applicability: not_applicable` и проверяемую причину.

Запиши preliminary map до делегирования:

```text
<run-home>/02-plan/aspect-map.json
```

После self-check/subagent reports/verification обнови тот же map фактическим coverage:

- reviewer/subagent;
- task packet;
- report path;
- accepted/rejected findings;
- verdict;
- DEF links;
- evidence/check links.

Фильтруй delegation, а не финальную coverage-карту. Все applicable aspects
сначала получают `coverage_mode: self_check`. `focused_subagent` или
`grouped_subagent` назначается только после semantic promotion конкретного
аспекта.

Aspect-local boundary candidates:

- runtime state, data schema, persistence;
- public API, CLI command contract, protocol format, hooks, config, dashboard/status;
- queue, lock, session lifecycle, concurrency, idempotency;
- merge, cleanup, cancel, delete, migrate или другая разрушительная/ремонтная операция;
- canonical flow/Memory Bank правила, которыми будут пользоваться агенты;
- release/merge/evidence gate или `verification_passport`.

Boundary сама по себе не является trigger. Повышай только затронутый aspect,
если его report реально входит в stage acceptance, а local evidence не даёт
эквивалентной независимости. Для `focused_subagent` запиши конкретный
`independence_reason`; task-level `full_plan`/`high` и количество aspects не
являются blanket promotion. Parallel speedup trigger создаёт `opportunistic`
promotion, остальные triggers — `required`, как определено в
`common/subagents.md`.

Создавай `.tasks/.../subagent-decision.md` только если есть хотя бы один
promoted aspect. Запиши ссылку на `aspect-map.json`, trigger и promotion type,
promoted aspects, packet readiness, delegated jobs и остаточные риски. Для
полностью local review этот файл не нужен.

После запуска delegated job оркестратор не выполняет deep-анализ его aspects.
Он делает intake, tasking, acceptance, fact-check и synthesis по
`common/subagents.md`. Если оркестратор уже глубоко исследовал promoted aspect,
зафиксируй `contamination_risk` и способ компенсации в
`subagent-decision.md` и phase report.

Разделяй:

- `aspect applicability` - применим ли аспект и почему;
- `aspect coverage` - каким способом аспект закрыт в этом RUN;
- `subagent execution` - какие task packets/reports закрыли какие аспекты.

Если несколько аспектов покрыты одним субагентом, это не сокращает coverage-карту: каждая строка аспекта остаётся отдельной и ссылается на общий `group_id`, `subagent_id` и `report_path`.

Route выбирается локально до packing. Critical separation rule оставляет
promoted unit отдельной; остальные units не становятся delegated из-за общего
plan floor или соседнего риска. Capacity меняет только batch size, не semantic
promotion, grouping или waves.

### Flow-owned route adapter (PRT-336)

До создания packet для каждого applicable/unknown aspect зафиксируй route в
`aspect-map.json`:

| Decision | Route | Когда |
| --- | --- | --- |
| `orchestrator_local` | `self_check` | Базовый route любого applicable aspect; оркестратор оставляет source-backed evidence. |
| `delegate_group` | `grouped_subagent` | Aspect прошёл promotion gate и совместим ещё с одной-двумя promoted units. |
| `delegate_focused` | `focused_subagent` | Aspect прошёл promotion и требует dedicated session на unit или separation rule. |

Используй единственную compatibility table из `plan-aspects/index.md` с
`preferred_with`, `must_separate_when`, `max_group_size`. Именованные семьи —
примеры, не exact allowlist: совместимое подмножество из двух или трёх valid.
Separation wins. Grouping применяется только к уже promoted units; focused
anchor не переносит promotion на local secondary unit.

`depends_on` из aspect prompt становится ребром `requires_output_of` только
когда successor packet называет путь принятого predecessor output и точные
данные, которые реально использует. Output может быть local row в
`aspect-map.json` или delegated report; edge не повышает predecessor.
Тематическая близость, общий frozen draft,
предпочтительный порядок или потенциальная польза отчёта не создают ребро.
Если consumed output нельзя назвать, aspects независимы и остаются в одной
wave. Batch — только capacity-limited launch slice внутри существующей wave.
Grouped report допустим только с отдельной секцией на unit: scope, findings,
verdict, evidence, limitations и completeness. Coverage row сохраняется для
каждой unit; общий verdict не заменяет unit verdict. При partial failure
recovery повторяет только affected unit с attempt `2`, original packet, invalid
output и findings. Attempt `3` запрещён; accepted siblings не перезапускаются.

Каждая задача субагента должна объяснять:

- что субагент стартует как fresh/empty session and must not rely on hidden orchestrator context;
- что нужно прочитать `.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspect-worker.md`;
- что нужно прочитать `.memory-bank/dd-flow/workers/verify.md`;
- что нужно прочитать `.memory-bank/dd-flow/mb-sdlc/plan-aspects/index.md`;
- какой dedicated aspect prompt нужно прочитать: `.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/<aspect_id>.md`;
- какой аспект он проверяет;
- какой `aspect_id`, `applicability` and `coverage_mode` назначены оркестратором;
- какие документы и файлы читать;
- какие правила MBB применяются;
- какие риски искать;
- куда записать отчёт.

Task packet является маршрутизатором, а не заменой aspect prompt. Он должен содержать `common_prompt`, `worker_prompt`, `aspect_prompt`, `read`, `write_report_to`, `protocol_id`, `run_id`, `stage` and constraints. Aspect-specific project grounding берётся из dedicated aspect prompt. Если для required delegated aspect нет aspect prompt или task packet не указывает prompt path, не закрывай аспект как `focused_subagent`; используй `blocked` или `degraded` с точной причиной. Opportunistic aspect возвращается в local route.

### Dependency graph and rendered packets

Before building waves, identify the applicable `product`, `system`, `program`
and `vertical_slice` design decisions. Do not demand four workers for a local
fix: record a justified `not_applicable` predecessor when its level does not
affect the task. For meaningful work, each later selected level reads the
accepted earlier artifact and carries user outcome, component responsibility,
program boundary and slice contribution into the semantic spine.

Для selected applicable aspects прочитай `depends_on` из frontmatter dedicated
aspect prompts и создай `<run-home>/02-plan/aspect-graph.json`. Graph содержит
local и delegated nodes; runtime waves запускают только delegated jobs с уже
принятыми predecessors. Зафиксируй только hard edges, topological waves, exact consumed data и
predecessor output path каждого edge, packet/launch/report paths, acceptance
owner and recovery attempt paths. До первого запуска проверь отсутствие циклов и
отсутствующих selected hard prerequisites. Эти ошибки блокируют plan; не
обходи их порядком запуска, придуманным в памяти сессии.

Независимые eligible aspects одной wave можно запускать параллельно batches по
`available_subagent_slots` из `common/subagents.md`. Capacity refusal уменьшает
только launch window и не перестраивает groups/waves. Dependent
aspect получает новый RUN-local `dd-flow/worker-task@1` manifest после того,
как каждый hard predecessor принят. `not_applicable` удовлетворяет edge только
если successor contract явно допускает отсутствие данных. В compatibility
field `handoff.predecessor_reports` укажи accepted local/delegated output paths,
`handoff.acceptance_owner` and recovery attempt paths; не
передавай plan dependencies как скрытый контекст.

Материализуй prompt для каждого delegated worker через:

```bash
dd-flow prompt render --project-root "$PWD" --run "<RUN-ID>" --stage plan \
  --task-file "<RUN-home>/02-plan/worker-tasks/<aspect-id>.json" \
  --profile verification --json
```

`prompt render` не запускает worker-а, не ждёт его и не принимает отчёт.
Оркестратор хранит initial packet, failure note и один reserved recovery report
path на unit. Normal topology: одна initial wave, synthesis/fix, не более одной
targeted recovery wave, затем final gate. После завершения всех hard aspects выполни один
final integration review: перепроверь принятые findings, cross-aspect gaps и
обнови aspect map/plan graph before declaring the review complete.

Если выбран `execution_efficiency_review`, запускай его только финальной wave
после принятых local/delegated outputs `testing_system_design_review` и
`verification_evidence_review`. В его manifest передай их через compatibility
field `handoff.predecessor_reports` и `required_read` для текущего protocol/spec,
plan draft/`plan.json` when present, task/verification matrix,
`aspect-map.json`, `aspect-graph.json`, project check-policy/command sources
and selected scenario/seed/eval artifacts. RUN-local inputs are declared as
checked `run://<relative-path>` references. Если report возвращает
`plan_changes_required`, оркестратор применяет принятые изменения через
обычный plan-fix loop, обновляет graph/map и повторно запускает этот final
aspect before plan acceptance. Он не может ослабить обязательный proof
boundary, заменить final gate локальной проверкой или создать новую очередь,
scheduler либо lifecycle state.

После получения отчётов собери сводный отчёт. Не принимай выводы механически: проверь их по проектному контексту и явно укажи, что принято, что отклонено и почему.

Фазовый отчёт review должен содержать раздел `Aspect coverage`:

- полный aspect coverage map with `applicability` and `coverage_mode`;
- default local route и promotion records для фактически promoted aspects;
- какие аспектные task packets были созданы;
- какие отчёты получены;
- какие аспекты покрыты каждым report/group и какие остались `not_applicable`, `unknown`, `blocked`, `deferred_as_DEF` или `degraded`;
- какие рекомендации приняты или отклонены;
- local evidence по аспектам, которые оркестратор закрыл сам.

Если review разбит на пункты CLI plan graph, отмечай start/done/block по фактическому завершению аспектов. Не отмечай review `done`, пока не собран итоговый вердикт оркестратора.

## Аспекты ревью

Проверь трассировку цели и ограничений:

- операционная цель сформулирована как проверяемое состояние, а не как тема работы;
- протокол имеет одну доставляемую цель и один главный acceptance-сценарий либо явно является compact local fix;
- большой scope вынесен в `PSET-*` with executable member protocols, а текущий протокол имеет ясный `protocol_set`, `blocked_by_protocols`, source intake and related specs/features/ADR/scenarios links;
- исходные вводные, ограничения и не-цели (non-goals) явно перенесены в протокол;
- каждая предложенная задача, проверка или документ имеет связь с целью, ограничением или необходимой подготовкой;
- нет частей цели без задачи, сценария или `DEF-*`;
- нет ограничений без проверки или явного решения, почему они не применимы;
- нет действий, которые выглядят полезно, но не интегрируются в итоговый результат.
- у каждого meaningful plan item есть semantic spine или justified `not_applicable`: user outcome, applicable C4/module responsibility, must-preserve, non-goals and evidence boundary.

Проверь продуктовый слой:

- кому доставляется ценность;
- какие акторы и роли участвуют;
- какие фичи, эпики или области возможностей затронуты;
- связана ли работа с пользовательскими сценариями и документацией.

Проверь системный слой:

- какие C4-элементы, подсистемы и компоненты меняются;
- понятны ли границы и владельцы;
- описаны ли контракты и взаимодействия;
- нужны ли ADR для решений с альтернативами;
- нет ли дублирования существующих возможностей.

Проверь инженерный слой:

- не возникает ли лишняя абстракция;
- не смешиваются ли ответственности в больших файлах;
- соблюдены ли стандарты кодирования;
- изолированы ли побочные эффекты;
- понятна ли обработка ошибок и не проглатываются ли ошибки молча;
- соответствует ли обработка ошибок единой политике проекта: доменные ошибки, ошибки внешних зависимостей, пользовательские сообщения, повторные попытки и отказоустойчивость;
- достаточно ли логирования и наблюдаемости (observability) для расследования проблем: логгер, идентификатор запроса или корреляции, ключевые ветки логики, внешние вызовы, ошибки и метрики.

Проверь `coding_standards_design_review` как отдельный gate для всех нетривиальных code changes, multi-module changes, новых модулей/пакетов/подсистем, public API/CLI/SDK/UI contract changes, runtime/data/persistence changes, AI/prompt/runtime implementation code, already-large files или задач, где найдены project-specific coding standards.

Этот gate не заменяет `architecture_design_quality`: он проверяет practical engineering design, а не только концептуальную архитектуру. Для compact/micro правки gate может быть `light` или `not_applicable`, но отчёт должен коротко сказать почему.

Перед принятием плана выясни:

- какие coding standards документы проекта найдены: `.memory-bank/spec/engineering/coding-standards.md`, testing strategy, agent-coding guide, CONTRIBUTING/README equivalents;
- если project standards отсутствуют, что применяется MBB fallback `.memory-bank/mbb/coding-standards-guide.md`;
- какие файлы/модули планируется менять и есть ли среди них already-large source files;
- не попадёт ли новая ответственность в `utils`, `helpers`, `misc`, view/controller, CLI/TUI/UI слой или другой неподходящий слой;
- где должны жить domain/application/adapter/transport/persistence/UI/view-model logic;
- какие import/layer boundaries нельзя нарушать;
- где должны жить side effects, external calls, DTO mapping and error handling;
- какие public entrypoints and documentation links нужно сохранить или обновить;
- как будут тестироваться новые boundaries and error paths;
- нужна ли explicit decomposition task перед implementation.

Line-count thresholds являются сигналом для ревью, а не механическим запретом:

- 250-500 строк: проверь, не смешиваются ли ответственности;
- 500-800 строк: рассмотри decomposition candidate;
- 800+ строк: нужен decomposition rationale, отдельная task или `DEF-*`;
- 1000+ строк: почти всегда architectural debt, кроме generated files, fixtures, snapshots or cohesive declarative tables/state machines.

Не требуй split автоматически. Большой файл может быть допустим, если он generated/fixture/snapshot, содержит одну связную декларативную таблицу or state machine, а extraction создала бы скрытую связность без ясной boundary. Хороший split допустим только когда появилась отдельная ответственность, есть owner/current consumer, снижается связность, tests can target the boundary and public/private contract remains clear.

Проверь `architecture_design_quality` как отдельный gate для всех нетривиальных, high-risk, canonical-flow, runtime, data, contract, UI, AI/prompt или multi-module изменений.

Смотри сверху вниз: задача должна вписываться в систему целостно и концептуально, без случайных "торчащих" частей. Изменения должны быть логичны, согласованы с C4-границами, ownership и текущими архитектурными подходами проекта.

Базовая позиция gate:

```text
новая сущность допустима только если у неё есть текущий потребитель, понятная ответственность, место в lifecycle, проверка и причина, почему без неё задача хуже решается сейчас
```

Задай и зафиксируй ответы:

- почему изменение нужно именно сейчас;
- почему нельзя решить задачу проще;
- кто текущий потребитель новой сущности, поля, статуса, UI-элемента, prompt-блока или schema-поля;
- где lifecycle новой сущности: создание, чтение, обновление, удаление, архивирование или retired-состояние;
- какая проверка доказывает, что сущность нужна и работает;
- какая ответственность у изменённого модуля, не разъезжается ли она;
- не раздувается ли модуль за счёт чужой ответственности;
- как изменение выглядит на C4-уровне: system, container/subsystem, component, code;
- какая ответственность остаётся за изменённым module/component и какие соседние ответственности явно не входят в scope;
- какие альтернативы отброшены и почему.

Запрещённые паттерны для принятого плана:

- "заодно добавим поле";
- "пусть будет на будущее";
- "раз уж трогаем шаблон, добавим похожий блок";
- "статус может пригодиться";
- "UI-элемент пока пустой, потом подключим";
- "schema поле optional, значит можно добавить без потребителя";
- "абстракция выглядит чище", но у неё нет владельца, контракта и текущего использования.

Если план всё же оставляет такую часть, она должна быть удалена, явно обоснована или оформлена как вопрос/`DEF-*`; нельзя принимать её молча.

Проверь `contract_propagation_design`, если меняется любая публичная или межмодульная граница:

- какие code/schema/type contracts меняются;
- какие тесты, сценарии, fixtures, examples and generated artifacts должны обновиться;
- какие пользовательские docs, Memory Bank specs, ADR, guides or protocol summaries должны ссылаться на новый контракт;
- какие CLI/TUI/GUI/MCP/SDK consumers затронуты;
- есть ли interacting systems или downstream проекты, которым нужно отразить изменение;
- как будет проверено, что все потребители согласованы.

Если contract propagation нельзя завершить в текущем gate, оформи `DEF-*` с точным `next_gate` и `context_for_followup`. Не оставляй важный контракт только в Markdown, если проект требует исполнимый contract.

Проверь `api_contract_design_review`, если меняется HTTP/RPC/SDK/CLI/API взаимодействие, request/response schema, error contract, auth requirement, pagination/filtering/sorting, idempotency key, rate limit, webhook or external API call:

- какие операции/API surfaces меняются;
- какие request/response schemas, headers, status codes, error payloads and auth rules действуют;
- есть ли versioning/compatibility story для существующих consumers;
- нужны ли pagination/filtering/sorting/partial response conventions;
- какие операции должны быть idempotent and how idempotency keys are generated/stored;
- как обрабатываются rate limits, retries, timeout, provider unavailable and malformed responses;
- какие SDK/CLI/UI/docs/examples/tests/scenarios должны измениться;
- как downstream/interacting systems узнают о contract change;
- какие evidence докажут compatibility and error behavior.

Проверь `network_realtime_design_review`, если меняется WebSocket, SSE, realtime subscription, streaming output, push/event delivery, long-running network session, offline/online sync or live connection lifecycle:

- connection lifecycle: connect, disconnect, reconnect, heartbeat, keepalive and cleanup;
- subscription lifecycle: subscribe, unsubscribe, resubscribe, channel/tenant authorization;
- auth/session refresh during live connection;
- delivery semantics: at-most-once, at-least-once, dedupe, ordering, gaps, replay/backfill;
- stale event handling and reconciliation with REST/state snapshots;
- offline/online transitions and missed-message recovery;
- backpressure, throttling, message size and rate limits;
- cancellation and resource cleanup for dead connections;
- observability: connection id, session id, message id, correlation id and close/error reason;
- security/privacy boundaries, especially tenant/channel data leakage;
- tests/evidence for reconnect/backfill/dedupe/security behavior.

Проверь `agentic_runtime_design_quality`, если задача затрагивает prompt-ы, model calls, agent pipeline, tool use, provider profiles, retry, repair, context injection, worker orchestration or AI-generated artifacts.

Правила review:

- prompt имеет явную структуру; XML-like теги допустимы для блоков, но prompt не превращается в тяжёлый XML-документ;
- обязательные инструкции отделены от справочного контекста;
- блоки объясняют, что делать, как делать, откуда брать данные, какой логикой руководствоваться и в каком формате вернуть результат;
- tool/skill policy говорит, какие инструменты доступны, когда их использовать и что нельзя делать;
- source authority понятен: пользовательские вводные, Memory Bank, код, runtime artifacts, tool results и inference не смешаны;
- observability фиксирует prompt input, выбранный контекст, tool calls, tool results, добавленный контекст, model output, validation and retry decisions;
- deterministic harness/code делает всё, что можно проверить или преобразовать без модели;
- model output валидируется схемой, parser-ом или другой проверкой, если от него зависит дальнейшая автоматизация;
- prompt не просит модель переписывать большие куски контекста в ответ без необходимости.
- существующие source data передаются между стадиями через стабильные
  resolvable references/aliases и model-owned delta or judgment, а не через
  повторный пересказ; harness фиксирует locator, version/hash/snapshot,
  materializes недоступный selected context и восстанавливает authoritative
  values после validation;
- исключения для summarization, translation, redaction, user-facing synthesis
  или внешнего consumer без доступа к source названы явно и сохраняют
  provenance;
- model calls идут через именованные model profiles where practical: provider, model, endpoint/profile name, temperature/effort/parameters, timeout, fallback profiles, retry/backoff and refusal/safety policy are visible;
- token/cost/latency/provider usage accounting спроектирован для repeated, high-volume, user-billable, provider-limited or operationally important calls, либо есть явное `not_applicable` reason;
- model-vs-harness split назван явно: модель принимает model-worthy decisions, deterministic harness делает input preflight, context packing, parsing, validation, normalization, id restoration, sorting/grouping, enrichment, persistence and trace/evidence writes;
- если используются длинные, fragile or generated ids/paths, план рассматривает compact alias table и deterministic full-id restoration после model output validation;
- если AI pipeline используется production logic, tests, evals, experiments, dashboards, CLI/debug tools or external API users, план определяет one core pipeline contract plus consumer adapters вместо дублирования pipeline logic.

Если есть model/runtime call, проверь error/retry/provider design:

- какие ошибки бывают: network, rate limit, provider unavailable, timeout, auth/config, invalid model schema, unsafe/tool-denied result, malformed JSON, semantic mismatch;
- какие ошибки ретраятся, какие требуют backoff, какие требуют fallback profile, какие требуют остановки или `DEF-*`;
- есть ли retry/repair prompt для случаев, когда модель вернула неправильную схему или неполный результат;
- retry/repair prompt получает прошлый результат, ошибку валидации и исходную задачу, а не размытый "попробуй ещё раз";
- для addressable output fields/items/sections repair по умолчанию progressive:
  модель возвращает minimal patch/keyed replacement/scoped section, harness
  применяет его детерминированно и повторно валидирует весь reconstructed
  artifact; full regeneration имеет явную причину;
- все repair attempts сохраняются как immutable lineage с parent attempt,
  prompt/model profile, context snapshot/refs, exact error, repair scope,
  patch/replacement, artifact hashes and verdict; следующая попытка получает
  только релевантную lineage, а не безграничную историю;
- если нужен общий repair worker, используй `.memory-bank/dd-flow/workers/repair.md` как стандартный narrow prompt;
- определён provider profile: provider, model, endpoint/profile, temperature/effort where relevant, timeout, fallback profiles and refusal policy;
- fallback не должен молча менять качество, стоимость, безопасность или contract output.

Для applicable AI/model pipeline добавь в план компактный `AI Pipeline Design Matrix`:

```text
model profile -> prompt/context source -> model responsibility -> harness responsibility -> output contract -> validation -> repair/retry -> token/cost/trace -> parallelism/queue/reducer -> consumers/adapters -> evidence
```

Добавь `AI Pipeline Failure Model`, если model output feeds downstream automation or persisted artifacts:

- invalid input;
- missing or oversized context;
- provider/network error;
- rate limit;
- timeout;
- auth/config error;
- malformed output;
- schema validation failure;
- semantic mismatch;
- hallucinated source;
- unsafe/tool-denied result;
- fallback quality/cost/security change;
- partial batch failure;
- duplicate or stale input.

Для каждой категории укажи handling: stop, retry, backoff, repair model call, fallback profile, manual decision, degraded continuation, rollback or `DEF-*`. Не принимай план, если repeated/high-volume model calls не имеют видимого accounting/limit story или если model repair не получает exact validation/semantic error.

Проверь `concurrency_pipeline_design`, если план вводит или меняет параллельную работу моделей, workers, queues, aggregation or stage handoff:

- какие стадии можно параллелить, а какие должны идти последовательно;
- какой паттерн параллельности применяется: fan-out/fan-in, map-reduce, parallel pipeline, worker pool, queue consumers, actor/mailbox or single-writer;
- где reducer/aggregator/serialization point and whether result ordering matters;
- кто владеет lock/claim/queue item;
- какие shared resources exist and what access rule protects each one;
- как агрегируются результаты и как решаются конфликты;
- как обеспечивается idempotency, ordering and partial failure handling;
- где возможны race conditions, stale writers, deadlocks, livelocks, starvation and priority inversion;
- какие timeouts/leases/heartbeats/fencing tokens нужны;
- как работают retry/backoff/max attempts/poison work handling;
- где backpressure, concurrency limits, rate limits and queue depth are enforced;
- где хранится intermediate result и как он валидируется перед следующим этапом;
- как пользователь или merge/readiness stage увидит незавершённый, skipped or failed sub-result.
- для AI pipelines отдельно проверь, что candidate generation/extraction can be parallel where safe, but mutation application goes through deterministic, validated and serialized or conflict-aware apply step unless the plan proves safe parallel apply.

Проверь `pipeline_design_review`, если задача вводит или меняет pipeline, staged workflow, многошаговый алгоритм, worker orchestration, queue/claim/lock flow, import/export/ETL, release/deploy/publish procedure, preview/beta/prod promotion, scenario runner, model/tool pipeline, async/event processing или operator handoff между стадиями.

Этот gate не заменяет `architecture_design_quality`, `concurrency_pipeline_design`, `agentic_runtime_design_quality` или `coding_standards_design_review`. Он отвечает на более узкий вопрос:

```text
понятно ли, как единица работы проходит через стадии pipeline, какие контракты действуют на каждой стадии и как система ведёт себя на happy path, failure, retry, skip and resume
```

Если pipeline aspect применим, зафиксируй compact stage contract matrix:

```text
stage -> owner -> orchestration source -> input contract -> output contract -> persisted artifact/state -> handoff trigger -> errors/retry/resume -> user/operator visibility -> verification
```

Проверь:

- где находится единый owner/source of truth для управляющей логики pipeline: порядок стадий, transition rules, status vocabulary, terminal verdicts, retry/resume/skip policy and handoff contract;
- какие части pipeline являются global orchestration, а какие stage-local implementation detail;
- не расползаются ли routing/status/retry rules по stage modules, prompts, CLI/UI/dashboard/report code or tests как независимые источники истины;
- если есть derived copies of pipeline metadata, чем доказано, что они generated, validated against or explicitly synchronized with the authoritative source;
- какие стадии pipeline существуют сейчас и какие меняются;
- где начинается и заканчивается ответственность каждой стадии;
- какие входы обязательны, какие опциональны, какие derived;
- какой output считается полным, частичным, skipped, failed, degraded or blocked;
- как output одной стадии становится input следующей: файл, runtime state, queue item, DB row, event, report, manual confirmation or API response;
- нет ли memory-only handoff, который потеряется между session, worker, retry или merge;
- какие статусы и ошибки видит пользователь, оператор, readiness, merge, dashboard или следующая стадия;
- где обрабатываются duplicate events, repeated runs, stale state, partial results and idempotency;
- какие уведомления, logs, metrics or reports нужны для расследования pipeline failure;
- какие gates должны остановить pipeline, а какие допускают `DEF-*`, degraded continuation or manual skip;
- как меняется rollback/retry/resume story, если pipeline связан с deploy, release, publish or external side effects.

Проведи минимум один мысленный эксперимент с representative data. Для high-risk pipeline добавь failure/retry walkthrough или явно объясни, почему happy path достаточно.

Формат walkthrough:

```text
input sample:
stage 1: input -> action -> output -> persisted handoff -> checks
stage 2: input -> action -> output -> persisted handoff -> checks
failure/retry/skip/resume branch:
findings:
changes to plan:
```

Walkthrough не должен быть театральным пересказом. Он нужен, чтобы найти неясные контракты, пропущенные статусы, хрупкий handoff, невидимые ошибки и необоснованные стадии. Все найденные поправки внеси в план или оформи как finding/`DEF-*` с точным `next_gate`.

Проверь кодовые контракты:

- есть ли прикладной или серверный контракт операций;
- есть ли клиентский набор методов (Client SDK);
- идут ли командная строка (CLI), текстовый интерфейс (TUI), графический интерфейс (GUI), инструменты MCP (Model Context Protocol) и сценарии через клиентский слой (Client SDK);
- нужен ли `ui-contract`, `event-contract`, `domain-contract`, `scenario-contract` или `fixture-contract`;
- не остаётся ли важный контракт только в Markdown.

Проверь сценарии и проверки:

- `acceptance_scenario_design_review`: есть ли один главный acceptance-сценарий для цели протокола или явная причина `not_applicable`;
- `seed_fixture_design_review`: описаны ли seed profile, fixtures, actor/account/role requirements, bindings, cleanup and rerun behavior;
- `scenario_environment_safety_review`: назван ли target stage/environment и не используется ли более слабый контур для доказательства более сильного gate;
- `scenario_evidence_design_review`: понятно ли, какие evidence доказывают setup, execution, cleanup and acceptance verdict;
- `manual_verification_design_review`: если автоматизация невозможна, есть ли понятный ручной сценарий, подтверждение пользователя или future `DEF-*`;
- `eval_experiment_design_review`: если deterministic pass/fail недостаточен, нужен ли eval/experiment с aspect axes, metrics, report JSON/template and threshold/baseline decision;
- какие модульные (unit), интеграционные (integration), сквозные (e2e) и сценарные (scenario) проверки нужны;
- какие проверки локальные, какие стендовые;
- какие seed-данные, фикстуры и артефакты нужны;
- чем фича или возможность будет доказана в матрице проверки.

Блокирующие verdict-ы для сценарного контура:

- `scenario_underdesigned_for_acceptance_gate` - acceptance gate заявлен, но сценарий не доказывает пользовательскую цель;
- `seed_fixture_policy_missing` - сценарий зависит от данных, но seed/fixture/world/cleanup policy не описана;
- `scenario_environment_safety_unknown` - непонятно, в каком окружении запускается проверка или как защищены данные;
- `scenario_evidence_does_not_prove_gate` - evidence слабее заявленного gate;
- `manual_verification_plan_missing` - автоматизация невозможна, но ручной план приемки не создан;
- `eval_experiment_needed_but_unspecified` - требуется agentic/metric assessment, но eval/experiment не спроектирован.

Проверь данные и хранилища, если они затронуты:

- нужны ли миграции, обратное заполнение данных (backfill) или совместимость старой и новой схемы;
- есть ли доказательство существования схемы (schema-existence proof), если код зависит от таблиц, полей, индексов, политик доступа или очередей;
- нужны ли резервная копия (backup), план отката (rollback), безопасный порядок выкладки или ручная операция;
- не появляются ли гонки (race conditions), потеря идемпотентности, повторная обработка события или некорректная конкуренция.

Проверь интерфейс, если он есть:

- какие экраны и `screen_id` затронуты;
- есть ли спецификации экранов;
- есть ли стабильные идентификаторы для автоматизации;
- не обходит ли интерфейс клиентский набор методов (Client SDK);
- есть ли кодовый контракт интерфейса (UI code contract), реестр экранов (screen registry), реестр тестовых идентификаторов (test id registry), объектная модель страницы (Page Object Model) или карта действий, если они требуются проектом;
- не создаёт ли интерфейс (UI) лишний шум, дублирование или неясные состояния ожидания и ошибки;
- какое минимальное браузерное доказательство (browser proof floor) нужно для приемки интерфейса.

Проверь пользовательскую документацию, если меняется пользовательский путь:

- нужен ли учебник, практическая инструкция, справочник или объяснение (в разделе меморибанка с документацией для пользователей guides/);
- какие скриншоты или шаги устареют;
- есть ли связь с проверяемыми сценариями.

Проверь эксплуатационный слой:

- какие ветки, запросы на слияние (pull request), непрерывная интеграция (CI) и окружения применяются;
- какие SDLC contours применимы: Git, environment/stage, release, deploy/publish, verification, runbooks;
- где project policy, а где operator runbook;
- нужен ли Policy Migration Block, если задача меняет правила проекта;
- не смешан ли release verdict с deploy/publish evidence;
- нужны ли бета-ворота (beta gate);
- есть ли миграции, секреты, внешние провайдеры, резервные копии (backup) или откат (rollback);
- какие эксплуатационные доказательства (operational evidence) нужны для закрытия.

## Результат

В протоколе зафиксируй:

```text
стадия проработки протокола: фаза 1 выполнена
```

После ревью внеси нужные изменения в протокол и связанные документы. Итоговый доклад должен начинаться с навигационного блока из `.memory-bank/dd-flow/common/style.md` и раскрывать найденные проблемы, принятые исправления, оставшиеся `DEF-*` и логику следующих шагов.

В докладе укажи `trace_start` и `trace_report`.
