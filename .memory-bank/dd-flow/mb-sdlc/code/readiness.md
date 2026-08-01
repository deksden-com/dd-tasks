# Readiness gate: проверка готовности ветки

Прочитай общие правила:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/lifecycle-guards.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/sdlc-contours.md`
- `.memory-bank/dd-flow/common/policy-presets.md`
- `.memory-bank/dd-flow/common/changelog.md`
- `.memory-bank/dd-flow/common/memorybank-git.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/workspace-bootstrap.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/common/goal-traceability.md`
- `.memory-bank/dd-flow/common/semantic-grounding.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/dd-flow/workers/protocol-archive.md`
- `.memory-bank/dd-flow/common/browser-verification.md`
- `.memory-bank/dd-flow/mb-sdlc/plan-aspects/index.md`
- `.memory-bank/dd-flow/def/plan.md`
- `.memory-bank/dd-flow/def/fix.md`

Затем прочитай в MBB:

- `.memory-bank/mbb/coding-standards-guide.md`
- `.memory-bank/mbb/operations-release-guide.md`
- `.memory-bank/mbb/verification-matrix-guide.md`
- `.memory-bank/mbb/scenario-docs-guide.md`
- `.memory-bank/mbb/seed-fixtures-guide.md`
- `.memory-bank/mbb/evals-experiments-guide.md`
- `.memory-bank/mbb/named-deferrals-guide.md`
- `.memory-bank/mbb/delivery-docs-guide.md`

## Язык пользовательских артефактов

Зафиксируй `target_language` по `common/style.md`. Все пользовательские ответы, readiness summaries, stage reports, final reports и visible user-facing content пиши на `target_language`; внутренние verifier reports, raw evidence, JSON keys, code identifiers и HTML/CSS/JS templates могут оставаться английскими.

Этот prompt описывает reusable readiness gate. В нормальном code-flow его читает и выполняет оркестратор внутри `code/implement.md` сразу после реализации. Отдельный запуск `code/readiness.md` нужен только если code-flow был прерван, требуется повторный readiness rerun или нужно вручную перепроверить ветку без повторной реализации.

Сформируй доклад по завершившемуся протоколу на уровне ветки фичи или текущей рабочей ветки.

Если доступен `dd-flow` CLI, обнови или зарегистрируй session текущей проверки:

- `flow_kind: implementation`;
- `continuation_policy: implementation_plan`;
- `current_stage: readiness`;
- `next_action`: `ready_for_merge`, `run_merge`, `merge_start`, `close_protocol`, `ask_user` или явный blocker.

Если readiness запускается отдельно после прерванного code-flow, найди текущий `RUN-*` и code stage через `run-index.json` (`03-code` в новом layout, `02-code` в legacy layout). Финальный readiness verdict должен обновить code stage report или явно объяснить, почему code stage report не обновлялся в этом rerun.

Примени `Code Guard` из `common/lifecycle-guards.md`. Readiness можно запускать отдельно только если implementation/code stage действительно существует или было явно прервано после реализации. Если пользователь пытается запустить readiness вместо plan/code, остановись с `blocked: code_flow_requires_plan_ready` или более точным predecessor blocker.

Readiness gate - это не только отчёт перед слиянием (merge). Это ворота доведения протокола до максимально полного состояния. Если после реализации остались `DEF-*`, сначала попытайся закрыть всё, что можно закрыть сейчас, и только потом докладывай готовность ветки.

Readiness gate также проверяет, достигла ли ветка операционной цели на уровне feature-ветки: код, документы, контракты, проверки и доказательства должны сходиться в один результат, а не просто быть набором выполненных задач.

Режим Git определяется `task_profile.route.git` или legacy `flow_profile.route.git`: интеграционная ветка напрямую или feature-ветка в рабочем дереве (worktree). Перед закрытием `DEF-*` проверь состояние Git и отдели изменения текущей работы от чужих или пользовательских.

Если plan/code handoff содержит `policy_context`, readiness обязана проверить:

- actual Git branch/workspace against `policy_context.git.workspace_route`;
- actual delivery/fixation expectation against `policy_context.git.delivery_strategy`;
- required evidence still missing for merge, including commit/push/PR/queue evidence;
- release/deploy/publish next gates remain separate from source integration;
- deviations are fixed, recorded as findings or converted to `DEF-*`.

`ready_for_merge` is allowed only when merge can obtain the required evidence or when the selected strategy honestly leads to a non-merged status such as `local_only`/`external_handoff`.

Перед утверждением, что ветка готова к слиянию (merge), выполни свежие проверки, которые доказывают именно готовность к текущим воротам, и прочитай их результат. Нельзя опираться только на старый запуск, отчёт worker-а или предположение.

Перед первым readiness command, который запускает project tests, build, generation или другое project-owned tooling, проверь freshness implementation receipt по `common/workspace-bootstrap.md` для текущего concrete checkout. Запиши отдельный `<run-home>/03-code/workspace-bootstrap-readiness-receipt.md` (или legacy code-stage path); при reuse он ссылается на `workspace-bootstrap-implementation-receipt.md`, не перезаписывая source. Не допускай `ready_for_merge` при `bootstrap_blocked`, `bootstrap_failed` или stale/unvalidated receipt. Используй canonical status/invalidation algorithm только по ссылке, не дублируй его в readiness.

Основной агент остаётся оркестратором readiness gate. Он держит цель, scope, Git-контур, protocol state и принимает итоговый verdict. Проверочную работу по умолчанию распределяй между независимыми субагентами, потому что review полезнее из другого контекста.

Стандартный пучок readiness reviewers:

- `result_verifier`: `workers/verify.md`, режим `result_verification`;
- `quality_reviewer`: `workers/verify.md`, режим `quality_review`;
- `evidence_reviewer`: `workers/verify.md`, режим `evidence_review`;
- `def_reviewer`: `workers/verify.md`, режим `def_review`;
- `git_ops_reviewer`: `workers/verify.md`, режим `git_ops_review`.

Для задач с архитектурным, contract, AI/prompt/runtime, concurrency, canonical-flow или high-risk влиянием добавь специализированные readiness gates. Их можно поручить отдельным verifier-ам или выполнить как явные разделы self-review, если compact route честно обоснован:

- `coding_standards_implementation_review`: actual diff соответствует project/MBB coding standards, не создаёт монолит, сохраняет ответственность модулей, import/layer boundaries, error handling, tests and public entrypoint discipline;
- `architecture_implementation_review`: фактический diff соответствует плану, не добавил лишних сущностей, не раздул модули, не разнёс ответственность и не оставил "торчащие" части системы;
- `contract_propagation_review`: все изменённые контракты отражены в коде, схемах, типах, тестах, сценариях, docs, Memory Bank and interacting systems или оформлены как `DEF-*`;
- `api_contract_implementation_review`: API/HTTP/RPC/SDK/CLI request/response/error/auth/idempotency/rate-limit behavior реализован and documented consistently;
- `network_realtime_implementation_review`: WebSocket/SSE/realtime/streaming connection lifecycle, reconnect, ordering, replay/backfill, auth refresh, cleanup and observability реализованы and verified;
- `agentic_runtime_implementation_review`: prompt/model/tool/provider/retry/repair/observability behavior реализован так, как планировалось, и не хранится только в устном описании;
- `concurrency_safety_review`: parallel workers, queues, locks, aggregation, idempotency and handoff проверены относительно фактической реализации;
- `pipeline_implementation_review`: staged workflow, многошаговый алгоритм или pipeline реализован по stage contract matrix, с проверяемым handoff, failure/retry/resume behavior and walkthrough evidence.
- `scenario_seed_evidence_review`: acceptance scenarios, seed/fixture/world/cleanup, target environment and evidence действительно доказывают заявленный gate.
- `eval_experiment_result_review`: eval/experiment, если он требовался планом, выполнен по template+JSON contract, содержит aspect verdicts/metrics and не подменяет deterministic acceptance.

Эти gates не заменяют `result_verifier` и `quality_reviewer`. Они добавляют взгляд сверху вниз и проверяют, что actual implementation сохранила концептуальную цель, ограничения и архитектурную дисциплину.

Не обязательно запускать весь пучок для каждой мелочи. Глубина readiness масштабируется риском. Для high-risk/runtime/data/queue/session/hooks/dashboard/public-contract/merge-queue работ полный пучок обязателен, если среда позволяет. Для микроправки допустим compact readiness без субагентов, но с явным обоснованием пропуска.

Разделяй верификацию и ревью:

- верификация в readiness доказывает, что ветка достигла пользовательской задачи, плана, матрицы цели и ограничений, сценариев и gate;
- ревью в readiness доказывает или подтверждает, что изменённые сущности прошли нужную проверку качества: код, документы, UI, сценарии, evidence и `DEF-*`.

Если ревью качества уже выполнено на этапе реализации, не повторяй его механически, но проверь, что оно было достаточным для риска и типа изменения. Если ревью не было, а сущность менялась, выполни self-review или запусти verifier-а.

## Architecture and AI implementation review

Перед verdict `ready_for_merge` проверь фактический diff, а не только отчёт реализации.

В `coding_standards_implementation_review` проверь actual diff against project-specific standards and MBB fallback:

- найден ли project coding standards source: `.memory-bank/spec/engineering/coding-standards.md`, testing strategy, agent-coding guide, CONTRIBUTING/README equivalents, or `.memory-bank/mbb/coding-standards-guide.md`;
- какие source files изменены, насколько они выросли, есть ли files near 500-800, 800+ or 1000+ lines;
- не добавлена ли новая ответственность в already-large module без decomposition rationale;
- не превратились ли `utils`, `helpers`, `misc`, CLI/TUI/UI/view layer or prompt files в место для чужой domain/application/persistence/runtime ответственности;
- сохраняются ли import/layer boundaries and public/private entrypoints;
- side effects, external calls, DTO mapping and error handling лежат в ожидаемых слоях;
- ошибки не стали неявным contract-ом и не проглатываются без trace;
- tests/checks cover changed boundaries, error paths and public entrypoints where applicable;
- doc links or Memory Bank references обновлены, если coding standard or public entrypoint changed.

Зафиксируй `decomposition_verdict`:

- `accepted` - diff остаётся в разумных границах и не нарушает стандарты;
- `accepted_with_explanation` - рост или крупный файл оправдан связной ответственностью, generated/fixture/snapshot/declarative nature or explicit rationale;
- `needs_refactor_before_merge` - смешение ответственностей или монолитный рост надо исправить до merge;
- `deferred_as_DEF` - decomposition debt честно отложен с `next_gate` and `context_for_followup`;
- `not_applicable` - нет code diff или изменение не относится к source/module structure.

Не принимай 800+ source-file growth без объяснения, decomposition task or `DEF-*`. Одновременно не требуй механический split, если extraction создаст больше связности, чем снимет, или у выделения нет стабильной boundary/current consumer.

В `architecture_implementation_review` проверь:

- не появились ли сущности, поля, статусы, UI-элементы, schema-поля, prompt-блоки или документы "на всякий случай";
- каждая новая сущность имеет текущего потребителя, owner, lifecycle, проверку и понятную причину существования;
- файлы и модули не превысили разумный размер за счёт смешения ответственности; если размер вырос, причина архитектурно оправдана;
- C4-границы и ownership не сместились случайно;
- нет orphan code/docs/tests/evidence, которые не подключены к результату;
- изменения выглядят концептуально целостно и не создают разрозненный набор частных патчей;
- отклонения от plan stage либо обоснованы, либо оформлены как finding/`DEF-*`.

Выполни semantic-grounding review для каждого meaningful changed behaviour: сверху вниз сверь user outcome, feature/capability, C4/module responsibility, must-preserve and non-goals с actual diff; снизу вверх сверь тесты, scenarios and evidence с тем, что они заявляют. `ready_for_merge` запрещён, когда доказательство сильнее своего реального уровня или когда responsibility drift можно исправить в текущем diff.

Если план использовал dependency-aware аспекты, readiness дополнительно проверяет
`design_stage` chain: accepted Product, System, Program и Vertical Slice
решения должны сохраниться в semantic spine, plan items, tests/scenarios and
evidence. Пропущенный применимый predecessor или later-stage решение без
explicit accepted artifact является finding; `not_applicable` допустим только
с сохранённой причиной.

В `contract_propagation_review` проверь:

- все изменённые public API, CLI/TUI/GUI/MCP commands, SDK methods, schemas, event/domain/scenario/fixture/UI contracts listed;
- code, tests, examples, docs and Memory Bank references согласованы;
- downstream/interacting systems явно classified: updated, not_applicable, needs_user_confirmation, deferred_as_DEF;
- если contract propagation неполный, readiness не называет gate полностью закрытым без `DEF-*`.

В `api_contract_implementation_review` проверь actual diff, если задача меняла API/HTTP/RPC/SDK/CLI contract, request/response schemas, error contract, auth, pagination/filtering/sorting, idempotency, rate limits, webhook or external API calls:

- changed operations and surfaces listed;
- request/response schemas, headers, status codes and error payloads match plan/docs/examples/tests;
- compatibility/versioning impact is documented or deferred;
- auth/permission requirements are enforced;
- idempotency keys, retries, timeouts and rate limits behave as planned;
- consumers such as SDK/CLI/UI/scenarios/docs are updated or classified not_applicable;
- evidence covers happy path and at least one relevant error/compatibility path unless explicitly not applicable.

В `network_realtime_implementation_review` проверь actual diff, если задача меняла WebSocket, SSE, realtime subscription, streaming output, push/event delivery, long-running network session or offline/online sync:

- connect/disconnect/reconnect/heartbeat/keepalive/cleanup paths exist where required;
- subscribe/unsubscribe/resubscribe lifecycle is clear and tenant/channel authorization is enforced;
- auth/session refresh during live connection is handled or explicitly blocked/deferred;
- message ordering, dedupe, gaps, replay/backfill and stale event handling match plan;
- offline/online or missed-message recovery is covered when relevant;
- cancellation/dead connection cleanup prevents leaked resources;
- backpressure/throttling/message-size/rate-limit behavior is defined and implemented;
- observability includes connection/session/message/correlation ids and close/error reasons;
- tests, scenario evidence or precise `DEF-*` cover reconnect/backfill/dedupe/security behavior.

В `agentic_runtime_implementation_review` проверь, если затронут AI/prompt/runtime:

- prompt input, selected context, tool calls, tool results, context injection, validation errors, retries and final model output оставляют trace по принятому в проекте подходу;
- prompt structure использует ясные блоки, а обязательные инструкции отделены от справочного контекста;
- tool and skill instructions не противоречат authority hierarchy and safety policy;
- deterministic validation/parsing/code используется вместо model reasoning там, где это надёжнее;
- model output schema or semantic validation реально запускается или описан gate, который это проверит;
- retry/repair prompt получает исходную задачу, прошлый ответ и конкретную ошибку;
- если используется общий repair worker, он следует `.memory-bank/dd-flow/workers/repair.md`;
- provider profile and fallback behavior documented and tested or deferred honestly.
- фактические model calls используют named model profile where practical, and profile evidence exposes provider, model, endpoint/profile name, parameters, timeout, fallback profiles, retry/backoff and refusal/safety policy;
- token/cost/latency/provider usage accounting реализован, записан в trace/evidence/metrics/provider reference or explicitly not applicable for repeated, high-volume, user-billable, provider-limited or operationally important calls;
- actual implementation preserves model-vs-harness responsibility split: deterministic code handles preflight, context packing, parsing, validation, normalization, id restoration, sorting/grouping, enrichment, persistence and trace/evidence writes where applicable;
- compact-id aliasing/restoration is deterministic when used, and unknown/duplicate/ambiguous aliases are rejected before downstream automation;
- production/tests/evals/dashboards/CLI-debug consumers use one core pipeline contract through adapters rather than duplicated AI pipeline logic;
- privacy/redaction boundaries are respected for prompt/model traces, token accounting and provider payload evidence.

В `concurrency_safety_review` проверь, если затронуты параллельные workers/model stages:

- lock/claim/queue ownership ясен;
- partial failures не теряются;
- aggregation deterministic enough for the gate;
- idempotency and ordering risks рассмотрены;
- handoff между stage-ами содержит ссылки на intermediate artifacts and verdicts;
- race conditions или stale state не маскируются успешным readiness.
- для AI pipelines candidate generation/extraction and model calls are parallelized only where safe; mutation application is deterministic, validated and serialized or conflict-aware unless evidence proves safe parallel apply.

В `pipeline_implementation_review` проверь actual diff, если задача вводила или меняла pipeline, staged workflow, многошаговый алгоритм, worker orchestration, queue/claim/lock flow, import/export/ETL, release/deploy/publish procedure, preview/beta/prod promotion, scenario runner, model/tool pipeline, async/event processing или operator handoff:

- plan handoff содержит stage contract matrix или явное объяснение, почему pipeline gate неприменим;
- фактический diff соответствует стадиям, владельцам, input/output contracts and handoff triggers из плана;
- фактический diff сохраняет единый owner/source of truth для pipeline orchestration: stage order, transition rules, status vocabulary, terminal verdicts, retry/resume/skip policy and handoff contract;
- stage modules реализуют локальную работу, но не переопределяют global routing, lifecycle transitions, terminal status semantics or retry policy;
- CLI/UI/dashboard/prompt/report/tests не содержат самостоятельных копий state machine или status map, если они не generated, validated against or explicitly synchronized with the authoritative source;
- output каждой стадии не остаётся только в памяти модели/session: есть файл, runtime state, queue item, DB row, event, report, manual confirmation or another durable handoff;
- статусы `partial`, `skipped`, `failed`, `degraded`, `blocked` and `done` отражаются там, где их увидит следующая стадия, пользователь, operator, readiness, merge or dashboard;
- ошибки имеют понятную taxonomy and handling: stop, retry, backoff, repair, rollback, manual intervention, `DEF-*` or degraded continuation;
- repeated run, duplicate input, stale state, partial result and resume behavior не ломают pipeline silently;
- walkthrough из plan/code evidence реально прогоняет representative data через pipeline и показывает хотя бы happy path; для high-risk pipeline есть failure/retry branch или объяснение non-applicability;
- findings from walkthrough either fixed in current diff or recorded as `DEF-*` with `next_gate` and `context_for_followup`;
- release/deploy/publish pipelines do not confuse release fixation with artifact delivery unless the project policy says they are inseparable.
- for AI/model pipelines, walkthrough covers raw input -> prompt/context package -> model output -> validation -> repair/fallback if applicable -> normalized object -> deterministic apply/handoff -> consumer evidence.

Вердикты для `pipeline_implementation_review`:

- `accepted` - pipeline stages, contracts, handoff and walkthrough evidence are consistent with implementation;
- `accepted_with_DEF` - non-blocking pipeline gap is recorded as precise `DEF-*`;
- `needs_fixes_before_merge` - missing handoff, fragmented pipeline logic, unhandled state/error, invalid contract or absent required walkthrough must be fixed now;
- `not_applicable` - actual diff does not touch pipeline/staged workflow behavior.

## Применение flow profile

Найди последний актуальный `task_profile`/`flow_profile` в протоколе, specification stage report, `.tasks/plan-.../phase-summary.md`, legacy `.tasks/prime-.../flow-profile.md` или отчёте реализации.

Также найди `run-index.json`, specification stage report, `02-plan/stage-report.json`/`stage-report.html` или legacy `01-plan/stage-report.json`/`stage-report.html`, если плановая стадия их создавала. Legacy `plan-stage-report.json` допустим только как fallback/alias. Readiness gate должен использовать их как проверяемый handoff:

- `plan_items` закрыты изменениями, проверками, evidence или честными `DEF-*`;
- `aspects` со статусами `watch`, `blocked` или `degraded` рассмотрены readiness reviewers;
- `route` совпадает с фактическим Git/delivery/CI маршрутом;
- `overall.next_action` и фактический next action после readiness не противоречат друг другу без объяснения;
- embedded JSON в `stage-report.html` равен standalone plan stage data или legacy `plan-stage-report.json`, если stage report обновлялся в code-flow.

Если плановая стадия создала `02-plan/aspect-map.json`, прочитай его после stage report and before final review. Readiness must verify:

- every `applicability: applicable` aspect has an implementation/readiness coverage outcome;
- `coverage_mode` was respected or the change is explained;
- accepted findings were fixed, rejected with rationale or deferred as `DEF-*`;
- new implementation risks did not require additional applicable aspects;
- `not_applicable` aspects still have valid reasons after actual diff.

Если specification/plan содержит `design_aspects`, readiness must verify `design_aspect_traceability_review`: accepted defaults, deviations, user overrides and verification seeds are reflected in actual docs/code/tests/evidence or explicit DEF. Do not apply unselected canonical design-aspect text as a hidden requirement.

If `testing_system_design_review` applies, readiness must verify test levels, stage commands, datasets/fixtures/seeds/worlds, scenario links and negative/edge checks against the actual diff and executed evidence.

If `aspect-map.json` is missing for a protocol that adopted the aspect catalog contract, record `missing_aspect_map_handoff` as readiness finding and decide whether it blocks merge.

Если handoff содержит knowledge candidates, readiness должен проверить candidate trace:

- relevant candidates не потеряны между plan и code;
- code не заявил final promotion до merge;
- documentation updates, сделанные during code, перечислены как candidates/code-derived knowledge for merge promotion;
- unresolved durable knowledge превращено в `DEF-*` или `needs_user_confirmation`.

Если stage report отсутствует при `route.planning: full_plan`, проверь, есть ли в протоколе явный degraded reason. Без такого объяснения это readiness finding `missing_plan_stage_report_handoff`.

Применяй профиль так:

- `route.git: integration_branch_direct` - доказывай готовность интеграционной ветки к следующему действию; полноценный merge не нужен, если не было feature-ветки.
- `route.git: feature_worktree` - доказывай готовность feature-ветки в worktree к merge в интеграционную ветку.
- `workspace` - проверь, что протокол, текущая ветка, worktree path и base commit согласованы; если bootstrap был заблокирован или пропущен без причины, не объявляй ветку готовой.
- `route.ci: required` - без свежего CI-результата нельзя заявлять готовность к gate; если CI недоступен, оформи `DEF-*`.
- `route.delivery` выше `local` - проверь, что ветка готова к нужному стенду, но не смешивай readiness с beta-приемкой, если она выполняется в integration gate.
- `verification.plan.*: required` - каждая обязательная проверка должна быть выполнена или честно оформлена как `DEF-*`.
- `verification.plan.scenarios: acceptance_gate` - должен быть сценарный вердикт или `DEF-*`, который явно говорит, почему gate переносится.
- seed/fixture requirements from scenarios must be executed, marked `not_applicable`, or deferred as precise `DEF-*`; beta/staging/prod data safety cannot be assumed.
- eval/experiment requirements from the plan must produce report evidence or a `DEF-*` with `next_gate`; do not claim the behavioral assessment gate from ordinary test output.
- `evidence.level` - определи, достаточно ли protocol record, нужен ли proof bundle или verification passport до merge.
- `execution.mode` - при необходимости запускай verifier-а для независимой проверки diff, evidence и `DEF-*`.

Для SDLC contour changes readiness должен проверить, что policy/runbook split, status taxonomy, stage-aware verification and next release/deploy/publish action отражены в документах и code stage report. Если контур не применим, причина должна быть видима; если неизвестен и влияет на gate, это blocker или DEF.

Если профиль отсутствует, восстанови его кратко из протокола и фактического Git/delivery состояния, чтобы доклад был сопоставим со specification.

## Разбор DEF

Найди все открытые `DEF-*`:

- в протоколе;
- в `.tasks/`;
- в closure reports;
- в verification matrix;
- в scenario docs;
- в operations/release docs.

Для каждого `DEF-*` определи:

- что именно не закрыто;
- где возникло отложение: протокол, фаза, задача, файл;
- какой контекст уже указан в `context_for_followup`;
- что блокирует: merge, beta, production, сценарий, документацию или только будущий follow-up;
- зависит ли закрытие от пользователя;
- можно ли попытаться закрыть сейчас;
- нужен ли follow-up протокол.

Не задавай пользователю вопросы по техническим мелочам, которые агент может решить сам по правилам проекта. Если блокер зависит от пользователя, сформулируй вопрос с вариантами, последствиями и рекомендацией.

## Закрытие DEF через субагентов

Для каждого `DEF-*`, который можно закрыть сейчас, действуй так:

1. Создай задачу субагенту на планирование. В задаче скажи субагенту прочитать `.memory-bank/dd-flow/def/plan.md`. Не копируй туда все правила вручную; передай только операционные сведения: какой `DEF-*`, какой протокол, какие файлы читать, куда записать план.
2. Получи DEF-plan и проверь его.
3. Если план требует пользователя, задай пользователю только необходимый вопрос.
4. Если план закрываемый, создай задачу субагенту на исправление. В задаче скажи субагенту прочитать `.memory-bank/dd-flow/def/fix.md`. Передай DEF, план, границы записи и проверки.
5. Прими отчёт `def/fix.md`, перепроверь важные выводы и доказательства.
6. Убедись, что `DEF-*` обновлён честно: closed, open, blocked_by_user, followup_required или superseded.

Оркестратор отвечает за итоговое решение. Отчёты субагентов являются входом, а не истиной.

Если `DEF-*` требует большой отдельной работы, создай или предложи follow-up протокол вида `PRT-XXX-DEF-YYY-<slug>.md`. Такой протокол должен ссылаться на исходный протокол, фазу, задачу, `DEF-*`, связанные документы, кодовые пути и уже выполненные проверки.

## Верификация закрытия DEF

После каждого `def/fix.md` проверь:

- изменённые файлы действительно закрывают проблему из `DEF-*`;
- проверки из DEF-plan выполнены или честно помечены невозможными;
- evidence доказывает именно тот gate, который заявлен;
- статус `DEF-*` соответствует факту: `closed`, `open`, `blocked_by_user`, `followup_required` или `superseded`;
- если `DEF-*` больше не блокирует merge, но блокирует beta или production, это явно отражено;
- если `DEF-*` закрыт, в нём есть `Closure Attempt` с датой, изменёнными файлами, проверками и остаточными рисками.

Если доказательств недостаточно, не закрывай `DEF-*`. Верни его в работу, оформи настоящий блокер или создай follow-up протокол.

Если `DEF-*` связан с багом, падающей проверкой или неожиданным поведением, проверь, что в нём есть debugging-контекст:

- как проблема воспроизводится;
- какие локальные гипотезы проверены;
- какие результаты получены;
- выполнялся ли внешний поиск гипотез по документации, issue tracker, changelog или известным ошибкам версии;
- почему вопрос нельзя закрыть сейчас;
- какие следующие ворота (gate) должны закрыть остаток.

## Readiness reviewers

Каждому reviewer передай task packet:

- protocol id и summary path;
- пользовательскую задачу и operational goal;
- flow profile;
- список изменённых файлов или diff focus;
- plan graph/gates;
- проверки и evidence;
- implementation/readiness workspace bootstrap receipt paths/statuses и результат freshness revalidation;
- границы записи: reviewer не меняет файлы, а пишет отчёт;
- путь отчёта в `.tasks/.../readiness-reviewers/<role>.md` или `protocol/<PRT-ID>/trace/`;
- ожидаемый verdict.

Если reviewer закрывает конкретный `aspect_id` из `.memory-bank/dd-flow/mb-sdlc/plan-aspects/index.md`, packet должен использовать fresh-session aspect worker contract:

```yaml
role: sdlc_aspect_reviewer
session_mode: fresh_empty_session_required
common_prompt: .memory-bank/dd-flow/mb-sdlc/plan-aspects/aspect-worker.md
worker_prompt: .memory-bank/dd-flow/workers/verify.md
aspect_prompt: .memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/<aspect_id>.md
aspect_id:
protocol_id:
run_id:
stage: readiness
read:
  - <plan stage report>
  - <aspect-map.json>
  - <diff/evidence/docs/check output>
write_report_to:
```

Readiness must verify actual compliance with this contract when plan/code claimed focused or grouped aspect coverage: the report lists prompts and project sources read, the aspect prompt path exists, findings are accepted/rejected by the orchestrator, and `aspect-map.json` is updated or summarized with final coverage. A missing aspect prompt/task packet/report is a readiness finding and blocks `ready_for_merge` for delegated applicable aspects unless an explicit downgrade/degraded reason is recorded.

Reviewer не должен чинить найденное. Он проверяет и докладывает. Оркестратор принимает findings, чинит сам или ставит отдельного worker-а, затем повторяет проверки.

Обязательные ожидания по ролям:

- `result_verifier`: проверить соответствие цели, задаче, scope, ограничениям, публичным контрактам и expected behavior.
- `quality_reviewer`: проверить качество diff, локальные паттерны, отсутствие лишних абстракций, дублирования, сиротских изменений и несогласованных контрактов.
- `evidence_reviewer`: проверить, что fresh checks и proof artifacts доказывают именно текущий gate, а не просто факт запуска команд.
- `def_reviewer`: найти все открытые `DEF-*`, оценить корректность, merge-blocking статус, закрываемость сейчас и зависимость от пользователя.
- `git_ops_reviewer`: проверить `git status`, ветку, worktree, base commit, чужие изменения, readiness к PR/merge queue/direct integration.

Итоговый readiness verdict принимает только оркестратор. Отчёты reviewers являются входом, а не source of truth.

## Перенос знаний перед merge

Перед докладом о готовности ветки просмотри:

- протокол;
- `.tasks/`;
- отчёты субагентов;
- заметки `*-lessons-learned.md` и `*-insights.md`;
- результаты проверок;
- изменения в коде и документации.

Выдели знания, которые должны жить дольше текущей ветки:

- операционные выводы: CI, deploy, окружения, beta, rollback, seed/backfill, внешние провайдеры;
- инженерные выводы: стандарты кода, тесты, SDK, CLI, агентная работа, трассировка из кода в документы;
- системные выводы: подсистемы, контракты, границы, взаимодействия;
- продуктовые выводы: акторы, сценарии, пользовательские ограничения;
- кандидаты для будущего `mb-lint`, если проблема проверяется детерминированно.

Отдельно проверь сценарные доказательства:

- verifier-отчёты в `.tasks/`;
- proof summary и `proof.json`;
- ссылки на `.scenario-runs/`;
- скриншоты, JSON-ответы, run ids, CI links;
- результаты локальных, CI, preview, beta или live-provider сценариев.

Если задача меняла UI, запускала dev server или gate требует browser/visual proof, сначала выполни environment analysis из `.memory-bank/dd-flow/common/browser-verification.md`. Используй доступный `cmux-browser` или `agent-browser` маршрут; если оба недоступны, зафиксируй downgrade и не называй HTTP/source smoke браузерной проверкой.

Если материал доказывает готовность ветки к merge, перенеси curated-след в `protocol/<PRT-ID>/evidence/` или `evidence/`, обнови сценарий и матрицу проверки. Не оставляй доказательство только в `.tasks/`.

Формулируй это как паспорт проверки (verification passport), а не как перенос сырого артефакта. Протокол и матрица должны ссылаться на паспорт проверки и его verdict, а паспорт уже ссылается на proof bundle/runtime artifacts.

Перенеси подтверждённое долговечное знание в правильный раздел Банка памяти до merge:

- `spec/operations/`;
- `spec/engineering/`;
- `spec/system/`;
- `spec/product/`;
- `adr/`;
- `scenarios/`;
- `ui/`;
- `guides/`.

Если знание спорное, не превращай его в правило молча: оформи вопрос, `DEF-*` или follow-up протокол. Если перенос выполняет субагент, дай ему задачу прочитать `.memory-bank/dd-flow/workers/docs.md` и передай только операционные сведения.

## Changelog impact перед merge

Перед handoff в merge определи `changelog_impact` по `.memory-bank/dd-flow/common/changelog.md`.

Readiness не должен финально писать release version. Он должен:

- построить changelog target matrix по `.memory-bank/dd-flow/common/changelog.md` для каждого затронутого repository/package/artifact/release surface;
- найти `CHANGELOG.md`/release notes/changelog policy/Version Map для каждого применимого target, если они есть;
- определить, нужна ли запись changelog для текущего результата по каждому target;
- подготовить draft entry/source input для `Нераспределено`/`Unreleased`, `.changeset/*`, release note fragment, conventional commit/PR metadata or local equivalent, если изменение заметное для target;
- предложить предварительную рекомендацию version bump: `patch`, `minor`, `major` или `none`;
- записать это в protocol summary, code stage report или readiness report для merge stage.

Если changelog mode включён для target, но draft entry отсутствует при заметном изменении, это readiness finding. Если version bump требуется пользователем до merge, остановись и уточни, должен ли bump входить в текущий протокол или стать отдельным release step.

## Вердикт по цели и ограничениям

Перед докладом проверь матрицу цели и ограничений:

- каждая часть операционной цели закрыта изменениями, проверками, сценариями или корректным `DEF-*`;
- исходные ограничения пользователя и проекта не нарушены;
- нет реализованных фрагментов, которые не интегрируются в итоговый результат;
- evidence доказывает именно достижение цели на текущем вороте, а не только факт запуска команд;
- свежие проверки выполнены и прочитаны перед утверждением готовности;
- результат верифицирован относительно пользовательской задачи, протокола и матрицы цели;
- изменённые сущности прошли нужное ревью качества или есть объяснение, почему ревью неприменимо;
- если цель достигнута частично, остаток оформлен как `DEF-*` с понятным `next_gate`.

Укажи один вердикт:

- `goal_achieved`;
- `goal_partially_achieved`;
- `goal_blocked`;
- `goal_changed`.

Если вердикт не `goal_achieved`, объясни, что именно мешает полному достижению цели и почему ветка всё равно готова или не готова к merge.

## Передача в очередь merge

Если проект использует очередь слияния через `dd-flow` CLI и ветка готова к интеграции, не выполняй merge из обычной рабочей сессии. Вместо этого явно поставь протокол в очередь:

```bash
dd-flow protocol ready-for-merge "<protocol-id>" --json
```

Перед вызовом проверь, что:

- текущий протокол зарегистрирован в `dd-flow` CLI;
- `.memory-bank/protocol/<PRT-ID>/summary.md` существует, не пустой и обновлён текущей readiness-сессией;
- workspace profile содержит feature branch и worktree path, если `route.git: feature_worktree`;
- protocol summary говорит, что `readiness` завершён или завершается этим докладом;
- merge-blocking `DEF-*` отсутствуют;
- project policy не требует сначала создать или обновить pull request;
- все обязательные проверки и evidence для готовности ветки выполнены или честно оформлены как не блокирующие текущий gate.

Если CLI отказал в `ready-for-merge`, не обходи проверку. Исправь явный хвост, обнови протокол или оформи `DEF-*`, если блокер нельзя закрыть сейчас.

Если отказ содержит `protocol_run_stage_mismatch`, сначала проверь latest linked run, stage reports and protocol summary. Для legacy/degraded run допускается `dd-flow protocol sync-from-run "<protocol-id>" --run "<RUN-ID>" --target auto --json`. Если evidence недостаточно, не выполняй merge и оформи blocker/DEF.

Если `summary.md` отсутствует или пустой, не вызывай `ready-for-merge`: это blocker `missing_feature_worktree_protocol_summary`, потому что merge worker не должен принимать job без файлового протокола.

Если `ready-for-merge` уже был успешно выполнен и protocol теперь `ready_for_merge`, `claimed`, `merged` или `closed`, не повторяй handoff механически. Повторный Stop hook с просьбой "verify branch readiness and call ready-for-merge" в таком состоянии означает stale implementation session. Проверь `dd-flow protocol status`, `dd-flow merge-queue status` и `dd-flow merge status`, затем останови implementation session через:

```bash
dd-flow session stop --project-root "<project-root>" --session-id "<current-session-id>" --reason "readiness handoff complete; merge worker owns next action" --json
```

Если текущий Codex session id неизвестен, останови логическую protocol-bound implementation session, если она была зарегистрирована как `session_id = <protocol-id>`. Не останавливай merge worker и не трогай merge queue commands из readiness.

После успешного handoff в merge queue обычная implementation session должна завершиться. В финальном докладе укажи, что дальнейший шаг принадлежит `merge.md` one-shot/status или `merge-start.md` project worker, и что текущая session не будет запускать `integration`.

В докладе укажи:

- поставлен ли protocol в merge queue;
- какой `protocol_id` и queue status вернул CLI;
- что вернул `dd-flow merge status`: active worker, claimed job, lock или clear state;
- если worker активен, что protocol ждёт worker-а;
- если worker не активен, что пользователь или оператор может запустить: `.memory-bank/dd-flow/merge.md` для one-shot/status или `.memory-bank/dd-flow/merge-start.md` для долгоживущего worker-а.

## Архивный sweep

После закрытия readiness обнови summary текущего протокола: статус, lifecycle, `closed_at`, `archive_after`, результат верификации, ревью, evidence и открытые `DEF-*`.

Если протокол закрыт или создан новый протокольный след, запусти архивный sweep через субагента на `gpt-5.4-mini` с каноническим worker-session packet: `common_prompt: .memory-bank/dd-flow/common/worker-session.md`, `worker_prompt: .memory-bank/dd-flow/workers/docs.md`, `role_prompt: .memory-bank/dd-flow/workers/protocol-archive.md`, fresh session, `memory_bank_root`, `trigger`, `current_date`, `current_protocol`, лимит, bounded `read`/`write`, `write_report_to`, constraints и checks. Оркестратор остаётся acceptance owner: он проверяет diff и отчёт, не принимает неполный результат и при сбое передаёт replacement worker-у failure note, partial artifacts и отдельный recovery report path. Архиватор переносит только безопасные закрытые протоколы, обновляет индексы и создаёт обычный `DEF-*`, если обязательное архивирование заблокировано.

Оркестратор проверяет diff архиватора перед принятием результата. Если архиватор создал `DEF-*`, включи его в доклад readiness.

Доклад должен показать:

- навигационный блок из `.memory-bank/dd-flow/common/style.md`: `prompt: code/readiness.md`, протокол, текущая стадия, завершённая стадия, следующий шаг, маршрут, блокеры, активные `DEF-*`, необходимость решения пользователя;
- какая ветка содержит доработку;
- достигнута ли операционная цель на уровне ветки и какими доказательствами это подтверждено;
- какие фичи или области ценности изменены;
- какие сценарии проверяют каждую фичу и что именно они доказывают;
- какие локальные проверки выполнены и с каким результатом;
- какие свежие проверки доказывают утверждение о готовности ветки;
- какой workspace bootstrap receipt проверен, свеж ли он для текущего checkout и какой status прошёл gate;
- какие тесты запускались;
- как выполнена верификация результата относительно задачи и плана;
- какое ревью качества выполнено для изменённых сущностей;
- какие readiness reviewers запускались, какие findings приняты, что исправлено, какие findings отклонены и почему;
- какие документы Банка памяти обновлены;
- `changelog_impact`: target matrix, нужна ли changelog entry, draft entry, предварительная рекомендация `patch/minor/major/none`, где находится Version Map for each target;
- какие `DEF-*` были найдены;
- какие `DEF-*` закрыты в readiness;
- какие `DEF-*` остались и почему;
- какие `DEF-*` зависят от пользователя и какой ответ нужен;
- какие `DEF-*` требуют follow-up протокола;
- какие уроки и инсайты перенесены в долговечные разделы Банка памяти;
- какие паспорта проверки созданы на основании `.tasks/`, `.scenario-runs/` или других runtime artifacts;
- какие `lint-candidate` найдены;
- как обновлён протокол и запускался ли архивный sweep;
- не осталось ли в активных документах обязательных ссылок на некоммитнутые `.tasks/...`;
- какие блоки `task_profile`/`flow_profile` применены, повышены или оказались неприменимы;
- как закрыта aspect coverage map: applicable aspects, coverage modes, findings and DEFs;
- готова ли ветка к слиянию (merge) в интеграционную ветку проекта.

Не смешивай готовность ветки с бета-приемкой (beta acceptance). Readiness gate доказывает готовность к интеграции, если проектный процесс не говорит иначе.

В финальном докладе укажи:

```text
readiness gate завершён
post_flow_protocol_reminder: .memory-bank/dd-flow/common/post-flow-protocol-reminder.md
```
