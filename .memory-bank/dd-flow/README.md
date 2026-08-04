# dd-flow

`dd-flow/` - это набор рабочих промптов для разработки с Банком памяти. Файлы не являются частью канона MBB: их задача - направлять агента по фазам работы, а правила, структура и долговечные решения остаются в `.memory-bank/mbb/`.

Совместимость Memory Bank, CLI и runtime-контрактов задаётся [compatibility.json](compatibility.json). Проект объявляет `memory_bank_version`, а compatibility matrix раскрывает его в `dd_flow_cli`, future router/engine expectations, storage contract set, project summary contract and dashboard contracts. Normal CLI commands do not migrate runtime/home data; migrations belong to `mb-upgrade`. After the planned router/engine split, prompts still call stable `dd-flow`, and the router selects an installed engine for the project.

Механический lifecycle для `dd-flow` CLI описан в [flow-contract.json](flow-contract.json). CLI хранит contract snapshot в runtime state для диагностики и совместимости stage transitions, но merge queue completion должен использовать актуальный project contract. Prompt-ы остаются источником смысловых решений.

Каждый практический запуск flow должен иметь `RUN-*` execution envelope по [common/flow-runs.md](common/flow-runs.md). `RUN-*` фиксирует конкретный запуск, stage workspaces и stage report chain, но не заменяет смысловые сущности `PRT-*`, `EXP-*`, `DEF-*`, сценарии или evidence. New run home живёт в `~/.dd-flow/projects/<PRJ-ID-slug>/runs/<RUN-ID-slug>/`; legacy `.tasks/dd-flow-runs/<RUN-ID-slug>/` остаётся read compatibility/projection/manual scratch, not happy path. Обычная цепочка `protocol -> specify -> plan -> code/readiness -> merge` называется `mb-sdlc`; machine value для новых runs - `mb_sdlc`.

Типовой порядок:

```text
/go -> go.md
-> prime.md (session priming, если контекст не загружен)
-> protocol.md или interactive.md
   или protocol-implement.md для уже созданного PRT-*
-> specify (логическая стадия перед plan)
-> при необходимости plan.md
-> code.md
-> mb-sdlc/code/implement.md
   -> встроенный readiness gate
-> merge.md или merge-start.md
   -> mb-sdlc/merge/job.md
      -> mb-sdlc/merge/job.md -> mb-sdlc/merge/integrate.md
```

Отдельный on-demand контур project review:

```text
review.md
-> mb-sdlc/review.md
   -> aspect coverage
   -> critic pass
   -> mb-sdlc-review stage report
   -> review-fix.md, если пользователь принимает ремонтный scope
```

`mb-sdlc-review` проверяет проект как систему: соответствие specs/features/ADRs/scenarios/policies/code and protocol evidence. Это не `mb-audit`: аудит проверяет качество и полноту Банка памяти, review проверяет соответствие проекта зафиксированной истине.

Компактная карта доступных flow лежит в [index.md](index.md). `prime.md` читает её при прогреве сессии, чтобы агент понимал команды пользователя вроде "сделай plan/code/merge flow" и не путал логические стадии, entrypoint prompts и runtime artifacts.

Переходы между стадиями защищает общий guard-блок [common/lifecycle-guards.md](common/lifecycle-guards.md). Он запрещает запускать `plan` до протокола/specification, `code` до готового plan handoff, `merge` до `ready_for_merge`, а release/deploy/publish до их собственных predecessor gates. Если runtime state и файловые stage reports расходятся, prompt должен fail closed и показать текущую стадию, недостающие evidence и следующий безопасный шаг.

Если проект использует очередь слияния, обычная рабочая сессия после `readiness` помечает протокол готовым к merge через `dd-flow protocol ready-for-merge <PRT-ID>` и показывает worker/queue status.

Дальше есть три operator entrypoint-а:

- `merge.md` - current-session one-shot/status. Если долгоживущий worker уже активен, он только показывает status. Если worker-а нет, он может claim-ить ровно один job и передать его в `merge/job.md`.
- `merge-start.md` - долгоживущий project worker. Он работает в isolated Codex home, ждёт очередь через bounded `merge-queue wait-next` и для каждого claimed job вызывает `merge/job.md`.
- `merge-stop.md` - мягкая остановка project worker-а; idle worker останавливается сразу, busy worker получает `stop_after_current`.

Старт долгоживущего worker-а выполняется в изолированном Codex home проекта: отдельный `config.toml`, установленный dd-flow hook, symlink-и на общие `sessions`, `skills`, `plugins`, `auth.json` и другие данные основного `~/.codex`. Запуск делается одной командой: `CODEX_HOME=<isolated-home> codex --yolo "Запусти .memory-bank/dd-flow/merge-start.md"`.

Для глубокой фичи полный плановый путь внутри `plan.md` такой:

```text
prime.md
-> protocol.md
-> specify
-> mb-sdlc/plan/reflection.md
-> mb-sdlc/plan/review.md
-> mb-sdlc/plan/implementation.md
-> mb-sdlc/plan/operations.md
-> mb-sdlc/plan/scenarios.md
-> mb-sdlc/code/implement.md
   -> встроенный readiness gate
-> merge.md или merge-start.md
```

Если нужно одним запуском пройти только плановую часть без реализации, используй:

```text
plan.md
```

Он оркестрирует priming при необходимости и плановые стадии, после чего останавливается на воротах перед реализацией. Полный `plan` нужен не для каждой правки: сначала `specify` формирует task profile и acceptance criteria.

В новом happy path полный `mb-sdlc` run использует layout:

```text
~/.dd-flow/projects/<PRJ-ID-slug>/runs/<RUN-ID-slug>/
  run-index.json
  01-specify/stage-report.json
  01-specify/stage-report.html
  02-plan/stage-report.json
  02-plan/stage-report.html
  03-code/stage-report.json
  03-code/stage-report.html
  04-merge/stage-report.json
  04-merge/stage-report.html
```

В конце полного specification/plan-run агент создаёт handoff stage reports в `01-specify/` и `02-plan/`. Legacy layout сохраняется как совместимость:

```text
.tasks/plan-YYYY-MM-DD-<slug>/plan-stage-report.json
.tasks/plan-YYYY-MM-DD-<slug>/stage-report.html
```

`01-specify/stage-report.json` валидируется схемой [schemas/specification-stage-report.schema.json](schemas/specification-stage-report.schema.json), а `02-plan/stage-report.json` - схемой [schemas/plan-stage-report.schema.json](schemas/plan-stage-report.schema.json). HTML строится из stage templates. Во время перехода агент может также писать legacy alias `plan-stage-report.json`. `code.md` и `mb-sdlc/code/implement.md` читают run-index/stage reports как компактную карту specification, route, aspect coverage, plan graph, work items и handoff files. Для `route.planning: full_plan` отсутствие stage report считается дефектом handoff, если протокол не объясняет downgrade.

Фазы можно запускать отдельно, если контекст уже подготовлен. В этом случае агент всё равно должен прочитать общие блоки, указанные в начале выбранной фазы.

## Общие блоки

- [common/style.md](common/style.md): стиль общения и докладов.
- [common/canonical-sync.md](common/canonical-sync.md): как изменять канон сначала в `dd-memorybank`, затем распространять MBB и curated project flow pack в проекты для обкатки.
- [common/trace.md](common/trace.md): как каждый практический prompt пишет файловый след старта и завершения в `protocol/<PRT-ID>/trace/` или временно в `.tasks/dd-flow-trace/`.
- [common/runtime-cli.md](common/runtime-cli.md): как prompt-ы используют `dd-flow` CLI для project/protocol/session/plan/merge/stage report state, не передавая CLI смысловые решения.
- [common/flow-origin.md](common/flow-origin.md): какие flow запускаются только из канона, какие устанавливаются в project flow pack, как работает `DD_MEMORYBANK`, `canon_repo_root`, `canon_memory_bank_root`, `canon_flow_root`, `canon_mbb_root`, `target_project_root`, manifest и archive gate.
- [common/entity-ids.md](common/entity-ids.md): typed ids `TYPE-<sequence>-slug`, short aliases `TYPE-<sequence>`, allocation и command UX.
- [common/flow-runs.md](common/flow-runs.md): общий контракт `RUN-*`, stage workspace layout `NN-stage-slug/`, `run-index.json` и stage report breadcrumbs.
- [mb-sdlc/](mb-sdlc/README.md): internal prompt layout ordinary protocol SDLC flow: specify, plan, code/readiness and merge.
- [common/lifecycle-guards.md](common/lifecycle-guards.md): ordered-flow guards для `protocol -> specify -> plan -> code/readiness -> ready_for_merge -> merge -> closed` и release/deploy/publish predecessor checks.
- [dashboard/](dashboard/): canonical HTML dashboard templates for global, project and protocol dashboard pages. Generated pages use validated JSON data and local self-contained HTML.
- [common/workspace-layout.md](common/workspace-layout.md): project-scoped `DD_FLOW_HOME`, service checkouts, experiment run roots и cleanup guards.
- [common/workspace-bootstrap.md](common/workspace-bootstrap.md): единый contract bootstrap readiness, path-specific receipts, safe secrets evidence, reuse/invalidation and blocker-versus-DEF handling.
- [common/memorybank.md](common/memorybank.md): как входить в Банк памяти и выбирать источники правды.
- [common/changelog.md](common/changelog.md): когда включать changelog mode, где фиксировать versioning policy и почему версия релиза поднимается только по правилам проекта или решению пользователя.
- [common/memorybank-git.md](common/memorybank-git.md): как проверять Git-состояние перед аудитом, ремонтом или апгрейдом Банка памяти.
- [common/subagents.md](common/subagents.md): orchestration guide для постановки задач субагентам и приёмки их работы.
- [common/worker-session.md](common/worker-session.md): worker-facing primer для fresh/forked context, light project priming, task grounding and source-backed reports.
- [common/git-ops.md](common/git-ops.md): безопасная работа с ветками, коммитами, пушами, окружениями и приемкой.
- [common/closure.md](common/closure.md): как закрывать фазу, фиксировать отложения и переносить долговечное знание.
- [common/goal-traceability.md](common/goal-traceability.md): как проверять, что план, реализация и доказательства ведут к операционной цели (operational goal) и сохраняют исходные ограничения.
- [common/flow-flags.md](common/flow-flags.md): как `specify`/`plan` фиксируют оценку задачи, выбирают маршрут `dd-flow` и сохраняют решения анализа по документации, проверкам, evidence и субагентам.
- [workers/protocol-archive.md](workers/protocol-archive.md): bounded worker prompt для архивирования закрытых протоколов, обновления индексов и оформления `DEF-*`, если обязанное архивное действие заблокировано.
- [common/debugging.md](common/debugging.md): системная отладка через воспроизведение, трассировку, гипотезы, внешний поиск и доказанное исправление.
- [common/browser-verification.md](common/browser-verification.md): выбор браузерного контура проверки через `cmux-browser`, `agent-browser`, project-native e2e или честный downgrade до HTTP/source smoke.
- [def/plan.md](def/plan.md), [def/fix.md](def/fix.md): внутренние промпты для планирования и закрытия `DEF-*`, вызываются оркестратором, а не пользователем напрямую.
- [workers/code.md](workers/code.md), [workers/verify.md](workers/verify.md), [workers/docs.md](workers/docs.md), [workers/repair.md](workers/repair.md): внутренние промпты для кодовых, проверочных, документационных и validation-driven repair субагентов.
- Canonical-only `experiments/`: воспроизводимые live-эксперименты dd-flow
  поверх тестовых проектов; источник —
  `$DD_MEMORYBANK/.memory-bank/dd-flow/experiments/`, в curated target pack не
  устанавливается.
- [schemas/](schemas/index.md): канонические JSON Schema contracts для machine-readable flow artifacts. CLI валидирует эти контракты, но не определяет их вместо канона.

Все пользовательские доклады фаз должны включать навигационный блок из [common/style.md](common/style.md): какой prompt завершён, какой протокол активен, на какой стадии находится пайплайн, какой следующий шаг безопасен, какие блокеры и `DEF-*` остаются, где лежит файловый след start/report по [common/trace.md](common/trace.md).

Все flow фиксируют `target_language` по [common/style.md](common/style.md): пользовательские ответы, final reports, stage report visible text, summaries и curated summaries пишутся на языке пользовательского prompt-а или явно выбранном пользователем языке. Внутренние task packets, raw evidence, JSON keys, code identifiers и HTML/CSS/JS templates могут оставаться английскими, но при показе пользователю должны быть синтезированы или переведены в пользовательский слой.

## Установка Канона

Canonical-only flows запускаются из локального checkout-а `dd-memorybank`. Минимальный bootstrap для машины:

```bash
git clone <dd-memorybank-repo-url> dd-memorybank
cd dd-memorybank
export DD_MEMORYBANK="$PWD"
npm install -g @deksden-com/dd-flow-cli
dd-flow canon register --root "$DD_MEMORYBANK" --json
dd-flow canon status --json
```

Если `dd-flow` CLI ещё не установлен, агент всё равно может объяснить эти шаги и использовать `DD_MEMORYBANK` напрямую как degraded discovery. После установки CLI canonical-only prompts должны предпочитать:

```bash
dd-flow canon resolve --json
dd-flow status --project-root "<target-project-root>" --json
```

В новом layout `mb-init`, `mb-upgrade`, `mb-upgrade-review` и `mb-distill` запускаются из `$DD_MEMORYBANK/.memory-bank/dd-flow/`; legacy checkout-и временно могут иметь `dd-flow/` прямо под repo root, если `dd-flow canon resolve` показывает `layout: legacy_root`. Целевой проект задаётся пользователем, текущим `cwd` или явным `target_project_root` в prompt-е. Project-local prompts в `.memory-bank/dd-flow/` не являются источником canonical-only flows.

## Карта фаз

- [go.md](go.md): универсальный диспетчер `/go`, который определяет следующий безопасный шаг: прайминг, фокусировку контекста, `protocol`, `specify`, планирование, code-flow со встроенным readiness, integration, закрытие или архивный sweep.
- [index.md](index.md): compact flow catalog for session priming and routing; explains available entry prompts, predecessor gates, outputs and safe next actions.
- [prime.md](prime.md): priming новой сессии: чтение индексов Memory Bank и верхнеуровневый вход в проект без создания протокола.
- [protocol.md](protocol.md): материализация обсуждения в `PRT-*`, выбор Git contour и старт specification stage.
- [protocol-implement.md](protocol-implement.md): безопасное продолжение существующего non-terminal `PRT-*`: читает frontmatter, `PSET-*`, blockers, runtime state, active sessions and coding standards sources, затем маршрутизирует в `specify`/`plan`/`code`/`merge`.
- [review.md](review.md): project-level `mb-sdlc-review` entrypoint; проверяет проект по durable specs/features/ADRs/scenarios/policies/code and evidence with aspect map, critics and JSON/HTML report.
- [review-fix.md](review-fix.md): follow-up entrypoint; обсуждает accepted review findings with user and creates ordinary executable protocol(s) or protocol set.
- Canonical-only `interactive.md`: старт обычного протокола в режиме
  `interactive`; читать из `$DD_MEMORYBANK/.memory-bank/dd-flow/interactive.md`,
  в curated target pack не устанавливается.
- [finish.md](finish.md): завершение interactive-протокола через `consolidation -> hardening -> readiness -> ready_for_merge`.
- [common/specification.md](common/specification.md): логическая стадия `specify`, problem-space уточнение задачи перед plan.
- [common/protocol-bootstrap.md](common/protocol-bootstrap.md): общий блок создания нового протокола для `protocol.md` и `interactive.md`.
- [prime/scouts/](prime/scouts/index.md): короткие scout-аспекты для быстрого сбора контекста по Банку памяти, коду, паттернам, проверкам, операциям и рискам.
- [f.md](f.md): compatibility alias для `prime.md`.
- [plan.md](plan.md): сквозная плановая проработка фичи через смысловые плановые стадии без запуска реализации.
- [mb-sdlc/plan/stage-report-template.html](mb-sdlc/plan/stage-report-template.html): canonical HTML template для пользовательского stage report plan-фазы; generated report получает validated `plan-stage-report.json`.
- [mb-sdlc/plan/reflection.md](mb-sdlc/plan/reflection.md): прогрев и поиск разрывов (gaps) до детального плана.
- [mb-sdlc/plan/review.md](mb-sdlc/plan/review.md): системное ревью протокола сверху вниз.
- [mb-sdlc/plan/implementation.md](mb-sdlc/plan/implementation.md): превращение протокола в граф задач и проверок.
- [mb-sdlc/plan/operations.md](mb-sdlc/plan/operations.md): ветки, окружения, выкладка, непрерывная интеграция (CI) и эксплуатационные ворота.
- [mb-sdlc/plan/scenarios.md](mb-sdlc/plan/scenarios.md): сценарии, согласование приемки и будущие доказательства.
- [code.md](code.md): корневой вход в code-flow; запускает реализацию или повторный readiness gate по состоянию протокола.
- [mb-sdlc/code/stage-report-template.html](mb-sdlc/code/stage-report-template.html): canonical HTML template для stage report code-фазы; generated report получает validated `03-code/stage-report.json` или legacy `02-code/stage-report.json`.
- [mb-sdlc/code/implement.md](mb-sdlc/code/implement.md): основной оркестраторский prompt code-flow; выполняет реализацию, затем сразу запускает readiness gate, reviewers, исправления, свежие проверки и итоговый verdict.
- [mb-sdlc/code/readiness.md](mb-sdlc/code/readiness.md): reusable readiness gate для финала `code/implement.md` и для отдельного rerun/continuation без повторной реализации.
- [mb-sdlc/merge/job.md](mb-sdlc/merge/job.md): общий lifecycle claimed merge job для one-shot и long-lived worker.
- [mb-sdlc/merge/integrate.md](mb-sdlc/merge/integrate.md): checklist интеграции, beta и приемки внутри claimed job.
- [mb-sdlc/merge/stage-report-template.html](mb-sdlc/merge/stage-report-template.html): canonical HTML template для stage report merge-фазы; generated report получает validated `04-merge/stage-report.json` или legacy `03-merge/stage-report.json`.
- [review/stage-report-template.html](mb-sdlc/review/stage-report-template.html): canonical HTML template для `mb-sdlc-review`; generated report получает validated `04-review/stage-report.json`.
- [dashboard/global-dashboard-template.html](dashboard/global-dashboard-template.html): canonical marker/template for `~/.dd-flow/dashboard/global-dashboard.html` over `global-dashboard-data@1`.
- [dashboard/project-dashboard-template.html](dashboard/project-dashboard-template.html): canonical marker/template for `<project>/.tasks/dd-flow-dashboard/project-dashboard.html` over `project-dashboard-data@1`.
- [dashboard/protocol-page-template.html](dashboard/protocol-page-template.html): canonical marker/template for `<project>/.tasks/dd-flow-dashboard/protocols/<PRT-ID>.html` over `protocol-dashboard-data@1`.
- Canonical-only `experiments/eval-report-template.html`: static HTML template for
  eval/experiment reports over `eval-report-data@1`; источник —
  `$DD_MEMORYBANK/.memory-bank/dd-flow/experiments/`.
- [merge.md](merge.md): current-session one-shot/status entrypoint; не создаёт долгоживущий worker.
- [merge-start.md](merge-start.md): старт или status долгоживущего project merge worker.
- [merge-stop.md](merge-stop.md): мягкая остановка project merge worker.
- [mb-audit.md](mb-audit.md): мультиагентный аудит Банка памяти по выбранным аспектам с созданием ремонтных `DEF-*`.
- [mb-fix.md](mb-fix.md): применение выбранных пользователем `DEF-*` после аудита.
- Canonical-only `mb-init.md`: flow для создания Банка памяти в целевом
  проекте, где его ещё нет; источник —
  `$DD_MEMORYBANK/.memory-bank/dd-flow/mb-init.md`.
- Canonical-only `mb-upgrade.md`: flow для апгрейда проектного Банка памяти на
  новый канон; источник — `$DD_MEMORYBANK/.memory-bank/dd-flow/mb-upgrade.md`.
- Canonical-only `mb-distill.md`: исследование практик для канона; источник —
  `$DD_MEMORYBANK/.memory-bank/dd-flow/mb-distill.md`.
- [mb-lint.md](mb-lint.md): запуск или планирование детерминированной проверки Банка памяти внешним инструментом `mb-lint`.
- Canonical-only `evals/`: ручные eval-сценарии для проверки поведения
  `dd-flow`; источник — `$DD_MEMORYBANK/.memory-bank/dd-flow/evals/`.
- Canonical-only `experiments/`: живые эксперименты с командами запуска,
  checkpoint-ами, ожидаемым поведением агентов и findings log; источник —
  `$DD_MEMORYBANK/.memory-bank/dd-flow/experiments/`.

## Обслуживание Банка памяти

`mb-audit.md` и `mb-fix.md` работают парой. Первый промпт проверяет состояние
Банка памяти, а canonical-only аспектные правила читает из
`$DD_MEMORYBANK/.memory-bank/dd-flow/mb-audit/aspects/`; curated target pack
не устанавливает этот каталог. Второй промпт читает найденные `DEF-*`,
группирует их, показывает пользователю варианты и применяет только выбранные
исправления.

Canonical-only каталог аспектов аудита
`$DD_MEMORYBANK/.memory-bank/dd-flow/mb-audit/aspects/index.md` объясняет,
какие проверки есть и какие наборы запускать для быстрого аудита, релизной
проверки, закрытия эпика или интерфейсного слоя.

`mb-init.md` используется раньше аудита, если Банка памяти ещё нет. Он создаёт начальную каноническую структуру и извлекает сведения из самого проекта. Вопросы пользователю задаёт только оркестратор после сводки отчётов субагентов, причём с вероятным вариантом и рекомендацией по найденным источникам.

`mb-lint.md` относится к механической проверке. Если во время работы найдено правило, которое можно проверять детерминированно, его нужно оформить как `lint-candidate` в lessons learned, insights или отчёте проверки.

## Priming, Protocol, Specification

`/go` - рекомендуемая точка входа в свежей сессии или при продолжении текущего протокола. Он не заменяет фазы, а читает состояние и вызывает следующий допустимый prompt. Первое решение `/go` - определить протокол: продолжить явно выбранный `PRT-*`, выбрать единственный активный протокол, создать новый через `protocol.md`/`interactive.md`, если появилась задача, или работать в режиме `исследование - без протокола`, если пользователь задал только исследовательский вопрос.

Если сессия свежая, `/go` сначала выполняет прайминг (priming) через `prime.md`; если пользователь уже дал задачу, после прайминга он фокусирует контекст на теме запроса и только потом запускает `protocol.md` или `interactive.md`. Если задачи нет, `/go` останавливается после прайминга или отвечает исследовательски без создания протокола.

`prime.md` означает только подготовку сессии. Он не создаёт протокол, не задаёт specification-вопросы и не выбирает route.

`protocol.md` создаёт или обновляет `PRT-*` и запускает logical stage `specify`. `protocol-implement.md` берёт уже существующий `PRT-*` и не создаёт новый scope: он проверяет `blocked_by_protocols`, terminal state, active session/claim and runtime mismatch, затем продолжает безопасную стадию. `specify` работает в problem space: уточняет задачу, acceptance criteria, верхнеуровневые вопросы пользователя, route hint и task profile. `plan` после этого переводит specification в solution space.

Если большая задача разложена на несколько исполнимых протоколов, coordination record живёт в `.memory-bank/protocol/_set/PSET-*`. Member protocols остаются обычными `PRT-*`; до первого `code` PSET выбирает и записывает feasible `execution_topology`: `shared_serial_bundle`, `isolated_parallel` или `isolated_dependency_waves`. `blocked_by_protocols` остаётся источником обязательных зависимостей. Shared serial route использует один worktree/branch и один final bundle merge после готовности всех members; topology не добавляет scheduler или новый lifecycle. Для списка стартуемых member protocols используй `dd-flow protocol ready --project-root "<project-root>" --json`.

Git-контур выбирается в `protocol.md`/`interactive.md` до публикации нового протокола. Простая безопасная правка может идти в интеграционной ветке и получает лёгкий `protocol/PRT-*/summary.md`. Для длительной или рискованной работы агент создаёт feature-ветку/worktree, выполняет workspace bootstrap по проектным правилам: секреты без раскрытия значений, зависимости и setup-команды, и только потом создаёт `protocol/PRT-*` внутри этого worktree.

Interactive mode - это не отдельная runtime-сущность, а обычный протокол `mode: interactive`. Он стартует через `interactive.md`, фиксирует rationale изменений без дублирования Git log, а завершается через `finish.md`, где выполняются `consolidation`, `hardening`, `readiness` и стандартный `ready_for_merge` handoff.

Профиль не является набором произвольных разрешений. `intent` и `impact` объясняют, как задача понята и почему выбран такой маршрут. `research` снимает неопределённость, но не является отдельным флоу доставки. `route` реально меняет ход процесса: планирование, Git-контур, delivery и CI. `documentation`, `verification`, `evidence` и `execution` сохраняют уже принятые решения анализа, чтобы не делать лишнюю работу, но повышаются, если по ходу работы найден новый факт, риск или gate.

Верификация (verification) и ревью (review) в `dd-flow` разведены. Верификация доказывает, что результат соответствует пользовательской задаче, плану, контракту, сценарию или gate. Ревью проверяет качество изменённой сущности: кода, документации, UI, сценария, evidence или `DEF-*`.

Каждый практический запуск после появления задачи должен оставить протокольный след в `protocol/`, но размер следа соразмерен задаче. Минимум - краткий `summary.md` с запросом пользователя, пониманием задачи, `task_profile`/route, Git-контуром, результатами и ссылками на детали. Последующие стадии дописывают туда же. Закрытые протоколы остаются в активной зоне ограниченное время, а затем переносятся в `protocol/archive/YYYY/MM/DD/` через worker prompt `workers/protocol-archive.md`.

Scout-субагенты из [prime/scouts/](prime/scouts/index.md) запускаются только если это реально ускоряет grounding. Они не меняют файлы и не планируют реализацию, а дают короткие фактические отчёты по аспектам.

## Evals Для Промптов

Canonical-only `$DD_MEMORYBANK/.memory-bank/dd-flow/evals/` хранит ручные
сценарии проверки поведения агента. Eval заводится по замеченной проблеме:
например, агент начал реализацию после `plan`, не разобрал `DEF-*` в
`readiness`, поверил worker-отчёту без diff/evidence или заявил "готово" без
свежей проверки.

Смысл eval не в том, чтобы проверить Markdown как текст. Он проверяет, какое поведение должен вызвать промпт и какое поведение запрещено. Автоматический harness можно добавить позже, когда ручные сценарии устоятся.

## Апгрейд Банка памяти

`mb-upgrade.md` запускает миграцию проекта на новый канон. Подробный
canonical-only процесс лежит в
`$DD_MEMORYBANK/.memory-bank/dd-flow/mb-upgrade/`: смысловой diff старого и
нового MBB, словарь миграции путей, target-пакеты по целевым папкам,
интеграционный merge, проверка старых путей, урегулирование `DEF-MBU-*`,
`mb-lint`-верификация, исправление формальных хвостов, обязательная `05-review`
и `06-merge`.

`05-review` внутри `mb-upgrade` проверяет все 10 агрегирующих аспектов качества, покрывает current `.memory-bank/mbb/aspects/01`..`13`, делает recovery pass перед `DEF-MBU-REVIEW-*`, строит integrated review, `stage-report.html` и явный next action.

`review.md` запускает другой контур: `mb-sdlc-review` по проекту. Он может фокусироваться на протоколе, feature/epic, subsystem/spec area or diff, но объект review остаётся project state. Значимые findings проходят critic pass and then route through `review-fix`; сам review не чинит проект скрыто.

## Дистилляция Практик

`mb-distill.md` исследует целевой проект и ищет практики, которые могут
улучшить канонический MBB или `dd-flow`. Подробный canonical-only процесс и
аспекты лежат в `$DD_MEMORYBANK/.memory-bank/dd-flow/mb-distill/`. Промпт
ничего не меняет в каноне сам: он готовит отчёт для решения пользователя.

Главное правило: промпт управляет работой, а Банк памяти объясняет, почему работа должна быть сделана именно так.
