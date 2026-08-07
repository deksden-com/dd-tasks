# Фаза 2: план реализации

Прочитай общие правила:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/sdlc-contours.md`
- `.memory-bank/dd-flow/common/subagents.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/common/goal-traceability.md`
- `.memory-bank/dd-flow/common/semantic-grounding.md`
- `.memory-bank/dd-flow/common/flow-flags.md`

Затем прочитай в MBB:

- `.memory-bank/mbb/delivery-docs-guide.md`
- `.memory-bank/mbb/spec-layer-guide.md`
- `.memory-bank/mbb/templates/protocol.md`
- `.memory-bank/mbb/templates/spec.md`
- `.memory-bank/mbb/templates/feature.md`
- `.memory-bank/mbb/coding-standards-guide.md`
- `.memory-bank/mbb/code-contracts-guide.md`
- `.memory-bank/mbb/client-surfaces.md`
- `.memory-bank/mbb/scenario-docs-guide.md`
- `.memory-bank/mbb/scenario-runner-guide.md`
- `.memory-bank/mbb/verification-matrix-guide.md`
- `.memory-bank/mbb/operations-release-guide.md`

## Язык пользовательских артефактов

Зафиксируй `target_language` по `common/style.md`. Все пользовательские summaries, плановые документы, dashboard-и, final reports и visible user-facing content пиши на `target_language`; внутренние task packets, raw evidence, JSON keys, code identifiers и HTML/CSS/JS templates могут оставаться английскими.

Твоя задача - превратить протокол в исполнимый план реализации. План должен быть понятен основному исполнителю, субагентам и проверяющим.

Сначала прочитай RUN snapshot consumer gate из `common/flow-flags.md` и
используй effective `planning.mode`, `plan.review.mode`, `knowledge.*`,
`workspace.bootstrap.mode` и `evidence.level`. Планируй только включённые
контуры; выключенные optional работы помечай `not_applicable` с причиной, а
не превращай их в пустые задачи. При mismatch snapshot revision/checksum
остановись до дальнейшего разрешения маршрута.

Запиши start trace по `common/trace.md` в активный протокол. Если доступен `dd-flow` CLI, зарегистрируй planning session по `common/runtime-cli.md`: `flow_kind: planning`, `continuation_policy: go_router`, `current_stage: f2_implementation_plan`, `next_action: build task graph`.

План должен доказывать свою пригодность: из него должно быть видно, что выбранные задачи действительно ведут к операционной цели (operational goal), учитывают исходные ограничения и дают проверяемый результат.

Если план включает SDLC policy или runbook changes, выдели отдельные tasks на durable policy docs, runbook updates, stage-aware verification/evidence, schema/report contract updates и evals that prove no operational noise for not-applicable contours.

## Применение task profile

Используй актуальный `task_profile` из specification как вход в план. Legacy `flow_profile` допустим как fallback для старых run-ов:

- `impact` определяет, какие продуктовые, системные, инженерные и эксплуатационные контуры нельзя пропустить;
- `route.git` определяет, готовим ли работу для прямой правки в интеграционной ветке или для feature-ветки в рабочем дереве;
- `route.delivery` и `route.ci` определяют, какие gate должны появиться в плане;
- `documentation` определяет, нужны ли документационные задачи и какие targets проверяются;
- `verification.plan` превращается в конкретные проверки внутри матрицы цели и ограничений;
- `evidence.level` определяет, какие proof bundles, verification passports или rollout evidence нужно запланировать;
- `execution` определяет, какие task packets можно отдавать workers/verifiers и можно ли раздавать независимые пакеты параллельно.

Если план требует изменить профиль, обнови его и объясни причину в `route_decision`. Не теряй adaptive complexity: выбранный route должен явно объяснять, почему задача идёт как `no_plan`, `compact_plan` или `full_plan`.

## Матрица цели и ограничений

Перед графом задач создай или обнови матрицу:

```text
цель или ограничение -> задача/пакет плана -> область реализации -> точка интеграции -> проверка/доказательство (evidence) -> статус
```

В матрице должны быть:

- все части операционной цели;
- исходные вводные и ограничения пользователя;
- явные не-цели (non-goals), если они важны для удержания границ работы (scope);
- приемочные ворота (acceptance gates), которые доказывают результат;
- `DEF-*`, если какую-то строку нельзя закрыть в текущей фазе.

Если строка цели или ограничения не покрыта задачей, проверкой или `DEF-*`, план ещё не готов.

Для каждого meaningful plan item добавь compact semantic spine по `common/semantic-grounding.md`: selected sources, user outcome, applicable C4/module responsibility, must-preserve, non-goals and evidence level. Не дублируй full specs; передавай worker-у только нужный выбранный контекст. Для tiny local fix допустим `not_applicable` с причиной.

Если исходные данные уже живут в адресуемом artifact/source, планируй
reference-based handoff: task packet и model output используют стабильные
source ids/aliases/paths вместо повторного пересказа данных, а deterministic
harness доказывает resolvability, фиксирует version/hash/snapshot, подаёт модели
нужный bounded fragment и восстанавливает authoritative values после
validation. Bare link, недоступный worker-у или consumer-у, не считается
контекстом. Явно отметь исключение, если преобразование исходного текста само
является задачей.

## Слои плана

Разложи работу по четырём контурам:

- продукт: какая ценность и для каких акторов доставляется;
- система: какие подсистемы, компоненты и контракты меняются;
- инженерия: какие стандарты кода, тестов, документации кода и агентной работы применяются;
- эксплуатация: какие ветки, проверки, окружения, выкладки и отказы нужно учесть.

Если какой-то контур не применим, явно укажи `N/A` и причину.

## Граф задач

Разбей работу на задачи удобного размера:

- у задачи должна быть ясная цель;
- границы задач не должны пересекаться по файлам и ответственности без необходимости;
- зависимости между задачами должны быть указаны;
- независимые задачи можно выполнять параллельно;
- задачи проверки должны опираться на исходную задачу, отчёт исполнителя и фактические изменения.

Для каждой задачи укажи:

- какой внутренний промпт исполнителя (worker prompt) должен прочитать субагент: `workers/code.md`, `workers/verify.md`, `workers/docs.md`, `def/plan.md` или `def/fix.md`;
- входной контекст;
- вклад в цель (goal contribution): какую строку матрицы задача закрывает;
- сохраняемые ограничения (constraints preserved): какие вводные нельзя нарушить;
- точку интеграции: где результат задачи станет частью итогового поведения, документации, контракта или процесса;
- файлы и документы для чтения;
- границы записи;
- применимые стандарты;
- ожидаемый результат;
- проверки;
- ожидаемый статус исполнителя (worker): `done`, `done_with_concerns`, `needs_context`, `blocked`, `needs_def` или `scope_risk`;
- топологию верификации и ревью: кто выполняет, кто проверяет соответствие результата ожиданию, кто проверяет качество сущности, какие режимы `workers/verify.md` применяются;
- формат отчёта в `.tasks/`.

Если meaningful item будет передан fresh worker-у и проект использует поддерживающий CLI, добавь в его `plan.json` compact `execution_context`:

```json
{
  "prompt_profile": "code_implementation",
  "required_read": ["src/target.ts"],
  "discovery_boundary": ["src"],
  "write_scope": ["src"],
  "checks": ["pnpm test"]
}
```

Это не второй plan и не список всех транзитивных источников. `required_read` задаёт стартовый минимум, `discovery_boundary` - допустимое расширение исследования, а canonical worker profile остаётся владельцем общих правил. Для delegated meaningful item также нужен selected `semantic_spine`; tiny/local item может иметь explicit `not_applicable` reason и не обязан получать renderer. Планер не копирует в JSON общие Git, priming, recovery или MBB instructions.

Для final `execution_efficiency_review` task manifest использует profile
`verification` и дополняет этот минимум accepted predecessor reports,
плановыми и verification artifacts, aspect map/graph, project check policy и
только теми scenario/seed/eval sources, которые действительно участвуют в
acceptance. Эти inputs нужны потому, что worker проверяет уже спроектированную
топологию; не расширяй packet всем Memory Bank или скрытым контекстом
оркестратора. Если такой artifact живёт в selected RUN home, укажи его как
checked `run://<relative-path>`, а не абсолютным или traversal path.

Кодовые задачи должны использовать `workers/code.md`, задачи проверки - `workers/verify.md`, документационные и миграционные задачи - `workers/docs.md`. Для закрытия `DEF-*` используй пару `def/plan.md` и `def/fix.md`.

Если доступен `dd-flow` CLI, оформи граф задач как `plan.json` и зарегистрируй его через `dd-flow plan set` по `common/runtime-cli.md`. В graph включай не только реализацию, но и gate-пункты: проверки, result verification, quality review, сценарии, evidence/passports, документацию и merge readiness, если они обязательны для приемки. Для микроправки не раздувай graph: один компактный пункт реализации и один пункт проверки достаточно, если они честно покрывают цель.

Для будущего handoff в `code` flow подготовь данные stage report plan-фазы:

- `task_profile` и `route_decision` должны быть сохранены в `plan-stage-report.json` или, для legacy schema/report, в `report.md` и `handoff`;
- `plan_items` в `plan-stage-report.json` должны соответствовать смысловым пунктам `plan.json`/task graph;
- `graph.nodes` и `graph.edges` должны показывать порядок и зависимости на уровне решений и work items, а не сырой Mermaid source;
- `aspects` должны отражать результат `plan/review.md`: какие аспекты были reviewed, watch, blocked, not_applicable или degraded;
- `route` должен показывать выбранный путь: planning, git/worktree, merge/delivery and CI;
- `handoff.must_read` должен включать `phase-summary.md`, `plan.json` если он есть, `subagent-decision.md` если он есть, и все документы, без которых `code/implement.md` не сможет начать реализацию честно.

Если плановая стадия не готова к code, dashboard всё равно можно создать, но `overall.verdict` должен быть `needs_user_decision`, `plan_blocked` или `degraded`, а `handoff.next_gate` не должен обещать старт реализации.

## Топология верификации и ревью

Для значимых пакетов задач (task packet) запланируй две разные проверки:

1. `result_verification` - верификация результата: проверяет, что задача выполнена ровно по пользовательскому запросу, цели, матрице ограничений, границам работы (scope), контракту, сценарию или ожидаемому gate.
2. `quality_review` - ревью качества: проверяет качество изменённой сущности, тесты, сопровождение, безопасность, обработку ошибок и соответствие локальным стандартам.

`goal_spec_review` является устаревшим названием `result_verification`; если старый протокол использует это имя, трактуй его как верификацию результата.

`quality_review` запускается только после прохождения `result_verification`. Если работа не соответствует цели или спецификации, сначала исправляется соответствие, а не качество.

Для маленьких безопасных правок можно объединить проверки в один проход `workers/verify.md`, но отчёт всё равно должен отдельно ответить на оба вопроса:

- сделано ли то, что требовалось;
- достаточно ли хорошо это сделано.

Примеры:

- изменение подписи кнопки: `result_verification` проверяет, что изменена нужная кнопка и поведение не затронуто; `quality_review` проверяет язык, стиль подписи, интернационализацию (i18n), раскладку (layout), доступность и test id;
- изменение прикладного интерфейса (API): `result_verification` проверяет соответствие контракту и сценарию; `quality_review` проверяет дизайн endpoint, обработку ошибок, типы и тесты;
- изменение документа Банка памяти: `result_verification` проверяет, что документ закрывает нужный факт; `quality_review` проверяет frontmatter, индексы, ссылки и отсутствие дубля источника истины.

Отдельно проверь, нужны ли в графе задач:

- журнал совместимости (compatibility ledger), если новый путь должен временно сосуществовать со старым;
- именованные отложения `DEF-*`, если известный разрыв нельзя закрыть в текущих воротах;
- кодовые контракты (code contracts), чтобы важная договорённость не осталась только в Markdown;
- задачи на перенос уроков (lessons learned) из `.tasks/` в долговечные разделы Банка памяти.

## Проверки и сценарии

Запланируй:

- локальные команды качества: форматирование, линтер, проверка типов, сборка, тесты;
- контрактные проверки, если меняются прикладной интерфейс (API), клиентский набор методов (SDK), события, доменная модель или интерфейс (UI);
- сценарии приемки;
- среды запуска: локально, непрерывная интеграция (CI), бета-стенд (beta), внешний ручной контур;
- какие доказательства сохраняются и где.

Если применимо, явно включи проверки равенства поведения прикладного интерфейса (API), клиентского набора методов (SDK), командной строки (CLI), текстового интерфейса (TUI) и графического интерфейса (GUI). Для защищённого интерфейса запланируй сценарный вход (scenario auth). Для данных запланируй доказательство существования схемы (schema-existence proof), миграции и откат (rollback).

Проверки должны быть привязаны к строкам матрицы цели и ограничений. Если проверка не доказывает цель, ограничение, контракт или интеграционную точку, объясни, зачем она нужна, либо убери её из обязательных ворот.

## Результат

В протоколе зафиксируй:

```text
стадия проработки протокола: фаза 2 выполнена
```

После планирования обнови протокол и связанные документы. Итоговый доклад должен начинаться с навигационного блока из `.memory-bank/dd-flow/common/style.md` и объяснять матрицу цели и ограничений, граф задач, порядок параллельной работы, проверки, сценарии, риски и открытые `DEF-*`.

В докладе укажи `trace_start`, `trace_report` и, если применимо, путь к `plan.json`/CLI plan graph.
