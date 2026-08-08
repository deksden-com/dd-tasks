# Code implement: реализация и readiness gate

Прочитай общие правила:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/lifecycle-guards.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/sdlc-contours.md`
- `.memory-bank/dd-flow/common/policy-presets.md`
- `.memory-bank/dd-flow/common/subagents.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/workspace-bootstrap.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/common/goal-traceability.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/dd-flow/common/debugging.md`, если во время реализации возникает баг, падающая проверка или неожиданное поведение
- `.memory-bank/dd-flow/mb-sdlc/code/readiness.md`, когда реализация доведена до финального gate

Затем прочитай в MBB:

- `.memory-bank/mbb/sdlc-workflow.md`
- `.memory-bank/mbb/delivery-docs-guide.md`
- `.memory-bank/mbb/coding-standards-guide.md`
- `.memory-bank/mbb/code-contracts-guide.md`
- `.memory-bank/mbb/client-surfaces.md`
- `.memory-bank/mbb/operations-release-guide.md`
- `.memory-bank/mbb/named-deferrals-guide.md`
- `.memory-bank/mbb/cross-references.md`
- `.memory-bank/mbb/seed-fixtures-guide.md`, если реализация или проверки используют seed/fixtures
- `.memory-bank/mbb/evals-experiments-guide.md`, если план требует eval/experiment или agentic assessment report

## Язык пользовательских артефактов

Зафиксируй `target_language` по `common/style.md`. Все пользовательские ответы, readiness summaries, stage reports, final reports и visible user-facing content пиши на `target_language`; внутренние worker/verifier packets, raw evidence, JSON keys, code identifiers и HTML/CSS/JS templates могут оставаться английскими.

Пользователь принял протокол или явно запустил реализацию. Приступай к реализации только после проверки профиля процесса (flow profile).

Примени `Code Guard` из `common/lifecycle-guards.md` до любых правок файлов. Если protocol state, run-index, specification, plan stage report, plan verdict, handoff files или workspace не доказывают, что code-flow сейчас допустим, остановись с `blocked: code_flow_requires_plan_ready` и следующим безопасным действием. Не создавай code stage report как будто реализация началась.

`code/implement.md` является основным оркестраторским prompt-ом code-flow. Нормальный путь не останавливается после кодовых изменений и не ждёт Stop hook для перехода к readiness. Оркестратор в этом же запуске доводит работу до readiness verdict:

До выбора worker route и optional artifacts примени RUN snapshot consumer gate
из `common/flow-flags.md`. Effective `subagents.route`, `report.*`,
`knowledge.*`, `workspace.bootstrap.mode` и `observability.detail` читаются из
`run.json`; legacy `task_profile` используется только как явно отмеченная
projection. Для пропущенного HTML/knowledge/bootstrap запиши
`not_applicable` или `reduced_artifact` с причиной и не создавай placeholder
report.

```text
implementation work -> local checks -> readiness reviewers -> fixes -> fresh checks -> ready_for_merge | close_protocol | ask_user | blocked
```

`code/readiness.md` остаётся отдельным gate-модулем: его читают в финале `code/implement.md`, а отдельно запускают только для rerun/continuation, если code-flow был прерван после реализации или нужно повторить readiness без повторной реализации.

Если доступен `dd-flow` CLI, зарегистрируй implementation session по `common/runtime-cli.md`:

- `flow_kind: implementation`;
- `continuation_policy: implementation_plan`;
- `current_stage: implementation`;
- `next_action`: текущий пункт реализации, `run_readiness_gate`, `ready_for_merge`, `close_protocol`, `ask_user` или явный blocker.

Также определи текущий `RUN-*` по `common/flow-runs.md`. Если `plan` уже создал run, используй его `run-index.json`. Если code-flow запущен без run при legacy/short маршруте, создай lightweight run через CLI или зафиксируй `runtime_cli_degraded`.

Для code stage используй stage directory из `dd-flow run status --json` / `run-index.json`. Для нового `mb-sdlc` layout это:

```text
<run-home>/03-code/
  workspace-bootstrap-implementation-receipt.md
  workspace-bootstrap-readiness-receipt.md
  stage-report.json
  stage-report.html
  report.md
  evidence/
  logs/
  screenshots/
```

В начале code stage:

```bash
dd-flow run attach-stage "<RUN-ID>" --project-root "<project-root>" --stage code --dir 03-code --status running --data-schema-id dd-flow/code-stage-report@2 --json
```

Если run был создан до внедрения specification stage и уже содержит legacy layout, используй существующую папку `02-code/` и запиши `legacy_stage_layout: true` в report.

Перед кодом проверь, что принятые документы протокола, спецификации и правила зафиксированы так, как требует проект. Если проектная политика предполагает стартовый документационный коммит, сделай его отдельным смысловым коммитом до реализации, чтобы дальше было видно, от какого утверждённого состояния началась работа.

Перед любыми изменениями в feature-worktree проверь файловый handoff:

```bash
test -s ".memory-bank/protocol/<protocol-id>/summary.md"
```

Если summary отсутствует или пустой, не начинай реализацию и не восстанавливай handoff молча внутри code stage. Остановись с blocker `missing_feature_worktree_protocol_summary`: plan/stable-root handoff был неполным, а runtime state в `~/.dd-flow` не заменяет канонический MemoryBank-протокол.

Перед кодом также проверь матрицу цели и ограничений. Если в протоколе нет операционной цели, исходных ограничений или связи задач с итоговым результатом, остановись и доработай план вместо начала реализации.

Перед кодом выполни active DEF preflight из `common/memorybank.md`. Relevant `DEF-*` являются входными ограничениями реализации: если DEF закрываем сейчас, включи его в plan graph или task packet; если он блокирует текущий gate, остановись или переведи работу в DEF-closure; если он не блокирует, укажи это в readiness evidence and final report.

До первой правки project code или запуска project-owned tooling выполни gate из `common/workspace-bootstrap.md` и запиши implementation receipt в `<run-home>/03-code/workspace-bootstrap-implementation-receipt.md` (или в существующий legacy code-stage directory). Revalidate planned/existing receipt for the concrete checkout; `bootstrap_blocked` и `bootstrap_failed` останавливают code-flow до правок и project tooling. Не повторяй здесь status, reuse или invalidation algorithm из canonical contract.

Если plan/specification содержит knowledge candidates, включи их в implementation context. Не переписывай candidate claims как факты системы до проверки. Для каждого relevant `KND-*` в code report укажи one of:

- implemented;
- documented_during_code;
- already_documented;
- task_local_only;
- deferred_as_DEF;
- needs_user_confirmation;
- not_applicable.

## Specification and plan stage report handoff

Перед началом реализации найди specification handoff, если run использует specification stage. Получи `<run-home>` и stage paths из `run-index.json`:

```text
<run-home>/01-specify/stage-report.json
<run-home>/01-specify/stage-report.html
```

Specification является problem-space входом. Code-flow не должен начинать нетривиальную реализацию, если specification отсутствует и нет явного degraded reason/legacy route.

Перед началом реализации найди и проверь stage report plan-фазы через `run-index.json`:

```text
<run-home>/02-plan/stage-report.json
<run-home>/02-plan/stage-report.html
```

Legacy fallback для уже начатых run-ов:

```text
<legacy-run-dir>/01-plan/stage-report.json
<legacy-run-dir>/01-plan/stage-report.html
```

Legacy fallback:

```text
.tasks/plan-YYYY-MM-DD-<slug>/plan-stage-report.json
.tasks/plan-YYYY-MM-DD-<slug>/stage-report.html
```

Ищи пути в `protocol/<PRT-ID>/summary.md`, `.tasks/plan-.../phase-summary.md`, пользовательском сообщении и рабочей папке `.tasks/`.

Если найден `02-plan/stage-report.json`, legacy `01-plan/stage-report.json` или legacy `plan-stage-report.json`:

1. Проверь, что новый RUN использует `schema_id: dd-flow/plan-stage-report@3`; legacy `@1` и `@2` остаются read-only inputs. `flow_flags.snapshot_revision` и `snapshot_checksum` должны совпадать с authoritative `run.json`.
2. Если доступен CLI, выполни:

   ```bash
   dd-flow schema validate --schema plan-stage-report --file "<stage-data-or-plan-stage-report.json>" --project-root "<project-root>" --json
   ```

3. Проверь, что `overall.verdict` допускает старт code-flow: `plan_ready` или `ready_for_code`.
4. Сверь `route.git`, `route.ci`, `route.delivery` и `handoff.next_gate` с фактическим `task_profile`/`flow_profile`.
5. Используй `plan_items` как исходный work graph: каждый значимый code task, проверка, evidence/passport и readiness reviewer должны соответствовать plan item или иметь зафиксированное обоснование изменения плана.
6. Используй `aspects` как предупреждения для реализации: `watch`, `blocked` и `degraded` аспекты должны попасть в task packets, checks, readiness reviewers или `DEF-*`.
7. Прочитай все доступные файлы из `handoff.must_read`; если обязательного файла нет, зафиксируй blocker или degraded reason.
8. Найди `policy_context` top-level или inside `sdlc_contours` and carry it into code/readiness report. Before editing, compare actual branch/workspace/check context with `policy_context.git.workspace_route`, `policy_context.git.delivery_strategy`, `policy_context.checks` and `policy_context.delivery`. If actual execution must differ, update the plan/protocol summary or record a readiness finding; do not silently change route or fixation strategy.

Если найден `stage-report.html`, докажи, что embedded JSON из `<script id="plan-data" type="application/json">` семантически равен standalone `02-plan/stage-report.json`, legacy `01-plan/stage-report.json` или legacy `plan-stage-report.json`. Если equality proof невозможен, не блокируй микроправку автоматически, но запиши degraded handoff и учти риск в readiness.

Если `route.planning: full_plan`, но stage report artifacts отсутствуют и в протоколе нет явного объяснения, остановись с blocker `missing_plan_stage_report_handoff`: plan stage не передал code-flow компактную карту задач и аспектов.

Если план изменяется во время реализации, обнови plan stage report или зафиксируй, почему stage report является historical plan snapshot и какие изменения отражены в `protocol/<PRT-ID>/summary.md`. Если используешь legacy alias, обнови его вместе с canonical stage data или явно пометь alias historical. Не оставляй code-flow в состоянии, где stage report показывает один next action, а фактический readiness идёт по другому маршруту без объяснения.

Если plan stage report содержит aspects или plan items по architecture/contract/AI runtime/concurrency/pipeline gates, code-flow обязан сохранить их как readiness inputs. Не превращай эти пункты в общий `quality_review`: для каждого relevant gate запиши одно из решений:

- `reviewed`;
- `not_applicable` with reason;
- `deferred_as_DEF`;
- `blocked`;
- `covered_by_compact_review` with downgrade reason.

## Code stage report handoff

После реализации, readiness reviewers, исправлений и свежих проверок создай code-stage report:

```text
<run-home>/03-code/stage-report.json
<run-home>/03-code/stage-report.html
<run-home>/03-code/report.md
```

Для legacy layout используй существующие `02-code/*` пути.

`stage-report.json` должен соответствовать `.memory-bank/dd-flow/schemas/code-stage-report.schema.json` (`schema_id: dd-flow/code-stage-report@2`) и показывать пользователю текущий `flow_flags` snapshot projection; legacy `@1` остаётся читаемым:

- реализованные пользовательские цели;
- сценарии приемки: шаги, ожидаемое поведение, verdict;
- seed/fixture/environment safety verdict for acceptance scenarios when applicable;
- eval/experiment verdicts or deferrals when the plan required agentic/metric assessment;
- доказательства сценариев: ссылки на screenshots, logs, proof bundles, verification passports or files;
- изменённые файлы;
- свежие проверки;
- пути и statuses implementation/readiness bootstrap receipts, включая source link and blocker/DEF handoff без secret values;
- reviewer findings and resolution;
- architecture and AI runtime review gates when relevant: `architecture_implementation_review`, `contract_propagation_review`, `agentic_runtime_implementation_review`, `concurrency_safety_review`;
- `DEF-*`/follow-up;
- SDLC contour decisions: applicable/not_applicable/unknown contours, stage-aware verification, release/deploy/publish next action if relevant;
- `policy_context` applied during implementation, including actual route comparison and Git fixation evidence still required at merge;
- readiness verdict and next action.
- related protocol set status when current protocol has `protocol_set`: ready, blocked, running/claimed and done member protocols. Prefer `dd-flow protocol ready --project-root "<project-root>" --json` when CLI is available; otherwise derive from member frontmatter and known runtime evidence.

`stage-report.html` генерируй на основе `.memory-bank/dd-flow/mb-sdlc/code/stage-report-template.html`: замени JSON внутри `<script id="code-data" type="application/json">` на validated `stage-report.json`; не создавай отчёт с нуля и не показывай raw JSON/debug blocks.

Применяй общий контракт `.memory-bank/dd-flow/common/flow-runs.md` / `Stage Report Chain`: HTML-отчёт является инстансом установленного template, а не новой страницей. Сохраняй визуальную структуру, CSS/JS, DOM anchors и render functions template; меняй только embedded JSON и stage-visible текст, который берётся из data. Если template отсутствует, не читается, не содержит `script#code-data`, generated HTML не похож на template, browser/DOM smoke падает или embedded JSON не равен standalone data, это `blocked`/`degraded_stage_report_template`; не называй code stage report готовым и не передавай merge как будто HTML report валиден.

Проверки stage report:

- `dd-flow schema validate --schema code-stage-report --file <stage-report.json> --project-root <project-root> --json`;
- embedded JSON equals standalone `stage-report.json`;
- HTML создан из `.memory-bank/dd-flow/mb-sdlc/code/stage-report-template.html`, содержит `script#code-data` и обязательные template anchors/render functions;
- browser/DOM smoke или честный degraded reason по `common/browser-verification.md`;
- file links открываются как ссылки, не как кнопки "open".

В конце code stage:

```bash
dd-flow run complete-stage "<RUN-ID>" --project-root "<project-root>" --stage code --status done --data 03-code/stage-report.json --stage-report 03-code/stage-report.html --report 03-code/report.md --json
```

## Применение flow profile

Найди последний актуальный `task_profile`/`flow_profile`:

- в пользовательском сообщении;
- в `<run-home>/01-specify/stage-report.json`;
- в `.tasks/prime-.../flow-profile.md` как legacy fallback;
- в `.tasks/plan-.../phase-summary.md`;
- в текущем протоколе;
- в итоговом отчёте плановой фазы.

Если профиля нет, выполни или запроси `specify` перед реализацией, кроме очевидной микроправки, где ты можешь сформировать короткий профиль сам и показать его пользователю.

Применяй профиль так:

- `impact`: проверь, что план не занижает влияние на поведение, контракт, эксплуатацию и риск; если влияние выше, обнови профиль и план.
- `route.planning`: если нужен `full_plan`, но его нет, остановись и доработай план; если `research.unresolved` содержит блокирующую неопределённость, не начинай реализацию до её снятия или решения пользователя.
- `route.git`: `integration_branch_direct` означает работу прямо в интеграционной ветке после Git-preflight; `feature_worktree` означает создание или использование feature-ветки в рабочем дереве по `common/git-ops.md`.
- `workspace`: проверь, где находится активный протокол, какая ветка и worktree указаны, выполнен ли bootstrap секретов/зависимостей/setup; если профиль требует `feature_worktree`, а ты не находишься в нём, не начинай реализацию.
- `route.delivery` и `route.ci`: определи, до какого контура доводится работа сейчас: локально, preview, beta или production, и нужен ли CI как gate.
- `documentation`: если `impact: update_required`, обнови указанные долговечные слои; если `check_needed`, проверь конкретные документы; если во время работы найден новый долговечный факт, повысь `documentation.impact`.
- `verification.plan`: запускай проверки по конкретным контурам; `required` означает gate, который нельзя пропустить без `DEF-*` или решения пользователя.
- `verification.plan.scenarios`: `review` требует проверить актуальность сценариев, `update` требует обновить сценарии, `acceptance_gate` требует сценарный вердикт или честный `DEF-*`.
- `evidence`: выбери формат доказательств: итоговый отчёт, protocol record, proof bundle, verification passport или rollout evidence.
- `execution`: реши, работаешь ли solo или запускаешь workers/verifiers; если `execution.parallelism` включает worker/verifier parallel, раздай только независимые task packets с непересекающимися границами записи и проверки.

В конце реализации укажи, какие блоки профиля повлияли на действия и какие были повышены.

## External blockers and dependency gaps

Если во время реализации, setup, запуска проверки, сценария, seed/fixture подготовки, browser proof, CI-smoke, provider/API call или tool use обнаружена отсутствующая внешняя зависимость, недоступное окружение, секрет, сервис, модельный provider, браузерный инструмент, база, очередь, SDK, binary или network/API endpoint, не продолжай как будто gate закрыт.

Сначала классифицируй gap:

- `resolvable_now` - можно закрыть в текущей рабочей области по project docs, lockfile, package scripts, runbook, `.env.example`, существующему bootstrap/setup или официальной документации;
- `current_gate_blocker` - без зависимости нельзя честно реализовать задачу, запустить required check или доказать mandatory acceptance gate;
- `future_gate_deferral` - текущий gate можно честно пройти, но beta/prod/manual/eval/deploy или другой named gate должен увидеть долг;
- `not_applicable` - зависимость не требуется для текущего scope, с явной причиной.

Для `resolvable_now` сначала попытайся закрыть проблему сам в пределах разрешённого Git/workspace контура: прочитай локальные runbook/docs, проверь lockfile and package manager, bootstrap commands, env naming, service scripts, official docs for the exact version and existing project patterns. Не спрашивай пользователя о технической гипотезе, которую можно проверить самому.

Если после разумной диагностики gap не закрывается:

- для `current_gate_blocker` останови code-flow с явным blocker или merge-blocking `DEF-*`; не создавай readiness verdict `ready_for_merge`;
- для `future_gate_deferral` создай precise non-blocking `DEF-*` с `next_gate`, затем продолжай только если route/check profile допускает перенос;
- если нужен пользовательский доступ, секрет, учётка, подтверждение окружения или ручное действие, сформулируй вопрос с вариантами, последствиями и рекомендацией, но не перекладывай на пользователя выбор технической декомпозиции.

Минимальный payload для `DEF-*` dependency gap:

```yaml
dependency_gap:
  missing_dependency:
  detected_during:
  command_or_action:
  error_or_symptom:
  environment:
  branch_or_commit:
  already_checked:
  attempted_resolution:
  blocks:
  does_not_block:
  next_gate:
  required_owner_or_input:
  verification_to_close:
```

Если gap связан с падающей проверкой, runtime bug, flaky behavior or integration failure, также примени `.memory-bank/dd-flow/common/debugging.md` и добавь debugging context: reproduction, hypotheses checked, external search status, relevant sources and why the issue cannot be closed now.

## Роль исполнителя

Ты отвечаешь за полное выполнение протокола:

- подготовить рабочую ветку или рабочее дерево по правилам проекта;
- убедиться, что протокол создан в правильном Git-контуре и рабочая область инициализирована;
- организовать `.tasks/`;
- поставить задачи субагентам, если это полезно;
- контролировать выполнение;
- проверять результаты;
- исправлять выявленные недостатки;
- вести протокол;
- соблюдать поток Git (git flow);
- собрать доказательства.

Сам выполняй работу, если это быстрее, безопаснее или задача находится на критическом пути. Субагентов используй по `execution.mode` и `execution.parallelism`: для независимых задач, реализации с ясными границами и проверки.

Когда ставишь задачу субагенту, укажи один из внутренних промптов исполнителя (worker prompts):

- `.memory-bank/dd-flow/workers/code.md` для реализации кода, тестов, контрактов, SDK/CLI/TUI/GUI или раннеров;
- `.memory-bank/dd-flow/workers/verify.md` для проверки чужой реализации, diff, evidence, сценариев и `DEF-*`;
- `.memory-bank/dd-flow/workers/docs.md` для документации Банка памяти, индексов, frontmatter, ADR, specs, scenarios, UI или guides.

Не копируй все общие правила в каждую задачу. Передай операционные сведения: цель, входные документы, границы записи, проверки, отчёт.

Для meaningful delegated item с `execution_context` сначала materialize packet через `dd-flow prompt render` по `common/worker-session.md`, затем запускай worker по созданному `launch-prompt.md`. Передай worker-у путь к render report и запрети заменять его ручной, более широким prompt-ом. Если renderer unavailable или plan item сознательно не имеет этой структуры, зафиксируй explicit compatibility reason в stage report; не имитируй renderer копированием всего Memory Bank.

Пакет задачи (task packet) для субагента должен быть самодостаточным:

- полный текст задачи;
- вклад в операционную цель;
- сохраняемые ограничения;
- точка интеграции;
- файлы для чтения;
- границы записи;
- ожидаемые проверки;
- source/current path и status workspace bootstrap receipt, а если worker сам первым запускает project tooling - обязанность revalidate/produce receipt по `common/workspace-bootstrap.md` до команды;
- ожидаемый формат отчёта и статус исполнителя (worker).

Не заставляй исполнителя (worker) самостоятельно читать длинный план и угадывать свою часть. Он читает общие правила сам, но операционная задача должна быть передана явно.

## Во время реализации

Следуй плану задач из протокола:

- не расширяй область работы без причины;
- проверяй, что каждый значимый срез продвигает операционную цель или разблокирует её достижение;
- не оставляй сиротский код, документ или проверку без связи с итоговым результатом;
- не вводи абстракции "на будущее";
- соблюдай стандарты кодирования;
- обновляй кодовые контракты вместе с потребителями;
- не позволяй графическому интерфейсу (GUI), текстовому интерфейсу (TUI), командной строке (CLI) или инструментам MCP (Model Context Protocol) обходить клиентский набор методов;
- добавляй документацию кода (JSDoc/docstrings) со ссылками на документы там, где код является важной публичной границей;
- фиксируй неожиданные знания в `.tasks/`;
- сразу обновляй релевантные документы Банка памяти, если меняется долговечная истина.

Если протокол связан с `dd-flow` CLI plan graph, отмечай progress:

- перед началом крупного пункта: `dd-flow plan item start`;
- после выполнения и проверки пункта: `dd-flow plan item done`;
- если пункт заблокирован: `dd-flow plan item block`;
- если пункт стал неприменимым по обновлённому профилю: `dd-flow plan item skip`.

Не отмечай пункт `done` только по отчёту worker-а. Сначала выполни result verification и, где применимо, quality review.

Если plan stage report включён для протокола, поддерживай его согласованность с progress:

- при изменении статуса крупного plan item обновляй runtime plan graph через CLI, если он доступен;
- если HTML stage report является static artifact, обновляй его перед readiness gate, а не после финального отчёта;
- если project/global markdown dashboards включены в `dd-flow` CLI, после state-changing команд полагайся на CLI auto-refresh или выполни `dd-flow dashboard refresh --project-root "<project-root>" --json`;
- в пользовательских отчётах указывай полные пути к `run-index.json`, specification/plan/code `stage-report.json`, stage reports и project/global markdown dashboard files, если они включены.

Двигайся по графу задач из протокола. После каждого значимого среза, где это практически разумно, запускай проверки именно того уровня, который мог быть сломан: типы, тесты, контракт, сценарий, сборка или интерфейс. Это дешевле, чем находить одну большую смешанную поломку в конце.

Если во время реализации выяснилось, что задача не ведёт к цели или нарушает исходное ограничение, не продолжай её механически. Обнови протокол, матрицу цели и ограничений, ADR или `DEF-*`, а при пользовательском выборе остановись на вопросе с вариантами и рекомендацией.

## Приёмка исполнителей (worker): верификация и ревью

После отчёта исполнителя (worker) сначала обработай его статус:

- `done` - запускай верификацию результата и затем ревью качества, если оно применимо;
- `done_with_concerns` - разбери сомнения до проверки или передай их verifier-у как обязательный фокус;
- `needs_context` - дай недостающий контекст и перезапусти задачу;
- `blocked` - проверь, можно ли снять блокер сейчас;
- `needs_def` - проверь, не является ли это незакрытой обязательной работой текущей задачи;
- `scope_risk` - остановись и проверь границы задачи, протокола и пользовательские вводные.

Не принимай отчёт исполнителя (worker) как факт. Отчёт - это вход для проверки.

Для значимого пакета задачи (task packet) используй двухступенчатую проверку:

1. Запусти `workers/verify.md` в режиме `result_verification`: соответствие задаче, операционной цели, ограничениям, границам работы (scope), точке интеграции, контракту и ожидаемому результату. Старое имя `goal_spec_review` трактуй как alias этого режима.
2. Если первый режим прошёл, запусти `workers/verify.md` в режиме `quality_review`: ревью качества изменённой сущности - кода, документации, UI, сценария, evidence или `DEF-*`.

Если `result_verification` нашёл проблему, не переходи к `quality_review`. Сначала верни задачу на исправление или обнови протокол, если план оказался неверным.

Для маленькой безопасной правки можно сделать один самостоятельный проход, но в отчёте всё равно раздели два вывода:

- верификация: сделано ли именно то, что требовалось;
- ревью: соответствует ли изменённая сущность стандартам проекта и хорошим практикам.

## Readiness gate внутри implement

После завершения реализации не заканчивай code-flow отчётом "реализация готова" и не перекладывай следующий шаг на Stop hook. Перейди к readiness gate в этом же orchestration run.

Перед readiness gate обнови runtime state, если доступен CLI:

```text
current_stage: readiness
next_action: run_readiness_reviewers
```

Stop hook является страховкой для прерванной сессии, а не штатным механизмом перехода между implementation и readiness. Если сессия останавливается до завершения gate, state должен позволить продолжить с `run_readiness_gate`.

На readiness gate оркестратор читает `.memory-bank/dd-flow/mb-sdlc/code/readiness.md`, затем запускает независимый пучок проверочных субагентов, если изменение не является микроправкой без риска.

Стандартные readiness reviewers:

- `result_verifier` через `workers/verify.md` в режиме `result_verification`: цель, пользовательская задача, матрица цели и ограничений, scope, contract.
- `quality_reviewer` через `workers/verify.md` в режиме `quality_review`: diff, качество кода/документов/UI/сценариев, дублирование, поддерживаемость.
- `evidence_reviewer` через `workers/verify.md` в режиме `evidence_review`: проверки, proof bundle, verification passports, CI/preview/beta links, корректность gate verdict.
- `def_reviewer` через `workers/verify.md` в режиме `def_review`: открытые `DEF-*`, корректность блокеров, что можно закрыть сейчас, что блокирует merge.
- `git_ops_reviewer` через `workers/verify.md` в режиме `git_ops_review`: ветка, worktree, чужие изменения, base commit, readiness к handoff или direct integration.

Для high-risk/runtime/queue/session/hooks/dashboard/data/public-contract/pipeline
изменений обеспечь полную coverage-карту readiness, но выбирай execution route
для каждой роли локально. `result_verifier` и `quality_reviewer` обычно требуют
независимого запуска; `evidence_reviewer`, `def_reviewer` и
`git_ops_reviewer` запускаются focused только когда соответствующая evidence,
DEF или Git boundary применима, иначе получают явный self-check/not-applicable
reason. Task-level risk не blanket-promotes все роли. Для pipeline-changing
tasks добавь focused `pipeline_review` verifier или явный compact self-review с
причиной downgrade.

Для маленькой безопасной правки можно пропустить readiness reviewers, но только с явной записью в отчёте:

- почему правка микроскопическая и обратимая;
- какие аспекты проверены самим оркестратором;
- какие reviewers пропущены;
- почему пропуск не снижает качество текущего gate.

После отчётов reviewers:

1. Проверь их факты по diff, файлам, Git state, protocol summary и evidence.
2. Отдели blocking findings от рекомендаций и вкусовых замечаний.
3. Исправь найденные blocking и high-signal non-blocking проблемы в текущем scope.
4. Повтори свежие проверки, которые доказывают исправления.
5. Обнови protocol summary, evidence, `DEF-*`, plan graph и stage report state.
6. Прими итоговый verdict сам: `ready_for_merge`, `run_merge`, `merge_start`, `close_protocol`, `ask_user` или `blocked`.

Если проект использует merge queue, обычная implementation session после успешного readiness gate вызывает `dd-flow protocol ready-for-merge <protocol-id> --json`, проверяет `dd-flow merge status --project-root "<project-root>" --json`, останавливает себя штатно и не запускает `merge/integrate.md`.

Перед `ready-for-merge` обязательно обнови и проверь файловый протокол: `.memory-bank/protocol/<PRT-ID>/summary.md` должен быть непустым и содержать итог implementation/readiness, checks/evidence, active `DEF-*`, queue status, worker status and next valid commands. Не считай успешный runtime transition заменой этой записи.

Финальный code report должен явно сказать:

- protocol queue status;
- active merge worker state, если он есть;
- если worker активен: что protocol добавлен в очередь и дальше работу ведёт worker;
- если worker не активен: можно запустить `.memory-bank/dd-flow/merge.md` для one-shot merge/status или `.memory-bank/dd-flow/merge-start.md` для project worker;
- implementation session не выполняла merge, не брала merge lane lock и не вызывала `merge-queue next/wait-next/complete/fail`.

## Проверки

Выполни проверки, которые требуются `task_profile`/`flow_profile`, протоколом и проектом:

- форматирование, линтер, проверка типов, сборка;
- модульные (unit), интеграционные (integration), сквозные (e2e) тесты;
- контрактные проверки;
- сценарии;
- проверки на бета-стенде (beta) или другом стенде, если они входят в текущие ворота (gate).

Для каждого технического контура из `verification.plan`:

- `skip` - не запускай, но объясни почему это безопасно;
- `run` - запусти, если контур доступен и стоимость разумна; если не запускал, объясни границы уверенности;
- `required` - запусти обязательно; если невозможно, не называй работу закрытой без `DEF-*`, где указано, что блокируется и какой следующий gate.

Если проверка невозможна, не называй её пройденной. Оформи `DEF-*` с причиной, владельцем, тем, что блокируется, и следующими воротами (gate).

Перед любым утверждением "готово", "исправлено", "проходит" или "ветка готова" выполни свежую проверку, которая доказывает именно это утверждение, и прочитай её результат. Старый запуск, ожидание, отчёт исполнителя (worker) или "должно работать" не являются доказательством.

Не закрывай реализацию как принятую, если сценарии, доказательства (evidence) или эксплуатационные ворота (operational gates), указанные в протоколе, не выполнены. Исключение возможно только через явное `DEF-*`, где понятно, почему это не блокирует текущие ворота и на каких следующих воротах будет закрыто.

`DEF-*` является исключением. Сначала попытайся закрыть работу полностью. Не используй `DEF-*` вместо исправления бага, запуска доступной проверки или обновления обязательной документации.

Если реализация меняла SDLC policy, убедись, что code stage report показывает применимые контуры, неприменимые контуры с причиной, stage-aware verification, release/deploy/publish actions outside current gate и следующий корректный flow/prompt после merge, если он нужен.

## Коммиты и пуш

Делай коммиты по смысловым блокам. Перед каждым коммитом проверяй, что в него не попали чужие или не относящиеся к работе изменения.

Пуш (push) делай по проектной политике: для удалённой фиксации, запроса на слияние (pull request), непрерывной интеграции (CI), предварительного окружения (preview), бета-стенда (beta) или других нужных ворот (gate).

## Закрытие реализации

Перед финальным докладом:

- обнови протокол;
- обнови `protocol/<PRT-ID>/summary.md`: что было реализовано, как прошёл readiness gate, какие readiness reviewers запускались или почему были пропущены, какие проверки и evidence есть, какие `DEF-*` остались;
- дай вердикт по операционной цели: `goal_achieved`, `goal_partially_achieved`, `goal_blocked` или `goal_changed`;
- проверь, что каждая строка матрицы цели и ограничений закрыта изменением, проверкой, паспортом проверки или честным `DEF-*`;
- проверь, что результат верифицирован относительно задачи пользователя и плана;
- проверь, что для изменённых сущностей выполнено нужное ревью качества или явно объяснено, почему оно неприменимо;
- перенеси долговечное знание из `.tasks/` и протокола в правильные разделы Банка памяти;
- создай паспорта проверки (verification passports) на основании сценарных proof bundle или runtime artifacts из `.tasks/`, `.scenario-runs/` и других рабочих каталогов, если они используются для приемки;
- обнови индексы и ссылки;
- зафиксируй доказательства (evidence);
- проверь, что уровень доказательств соответствует `evidence.level`;
- укажи closure state и все `DEF-*`;
- убедись, что ветка готова к следующим воротам (gate), либо честно зафиксируй blocker/user decision.

Выполни протокол полностью.

## Итоговый доклад

Финальный доклад реализации начни с навигационного блока из `.memory-bank/dd-flow/common/style.md`.

Доклад должен показать:

- какой prompt завершён: `code/implement.md`;
- какой протокол реализовывался;
- какая стадия завершена и какой следующий шаг безопасен: `ready_for_merge`, `run_merge`, `merge_start`, `close_protocol`, `ask_user` или `blocked`;
- достигнута ли операционная цель на уровне реализации;
- как выполнена верификация результата относительно задачи, плана и ограничений;
- какое ревью качества выполнено для изменённых сущностей;
- какие readiness reviewers запускались, какие findings приняты, что исправлено после них и какие reviewers были пропущены;
- какие проверки и evidence есть;
- какие документы Банка памяти обновлены;
- какие `DEF-*` остались, что они блокируют и зависит ли что-то от пользователя;
- какие блоки `task_profile`/`flow_profile` применены, повышены или оказались неприменимы;
- `post_flow_protocol_reminder: .memory-bank/dd-flow/common/post-flow-protocol-reminder.md`.
