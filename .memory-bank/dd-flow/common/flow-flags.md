# Флаги процесса

Этот файл не запускается пользователем напрямую. Его читают `protocol.md`, `common/specification.md`, `plan`, `code/implement`, `code/readiness`, `merge/integrate` и другие промпты, когда нужно выбрать достаточный контур работы.

## Идея

Флоу-флаг (flow flag) не должен отменять правила проекта и Банка памяти. Он нужен, чтобы сохранить результат анализа и не делать ненужную работу повторно на каждой фазе.

Если задача породила факт, который должен жить в Банке памяти, его нужно отразить независимо от флага. Если анализ показал, что такого факта нет, профиль должен это зафиксировать, чтобы агент не создавал документы, сценарии, evidence или deployment-ворота "на всякий случай".

Главный вопрос профиля:

```text
какой контур работы действительно нужен для этой задачи, а какой будет лишней работой
```

Перед выбором профиля прочитай `.memory-bank/project-policy.md`, если он есть. Project policy не заменяет анализ задачи, но задаёт default route, check profiles, delivery/release expectations, automation preferences and known policy gaps. Если policy hub отсутствует, используй профильные документы (`spec/operations`, `spec/engineering`, scenarios, evals, UI) и зафиксируй `project_policy: missing` только если это влияет на route or gate.

## Три типа полей

Профиль задачи/процесса (`task_profile`; legacy имя `flow_profile`) делится на три типа полей.

### Оценка

Оценочные поля объясняют, что агент понял о задаче. Они не командуют действием напрямую, но обосновывают маршрут:

- `intent` - как понята пользовательская хотелка;
- `impact` - какое влияние изменение оказывает на поведение, контракт, эксплуатацию и риск.

### Маршрут

Маршрутные поля реально меняют поведение агента:

- `route.planning` - запускать ли полный `plan`;
- `route.git` - работать прямо в интеграционной ветке или создать feature-worktree;
- `route.delivery` - доводить ли работу только локально или до preview/beta/production;
- `route.ci` - является ли CI воротами.

### Сохранённые решения анализа

Эти поля не отменяют правила. Они фиксируют, что уже проверено и какие контуры нужны или не нужны:

- `documentation` - есть ли долговечный факт, который нужно проверить или отразить в Банке памяти;
- `research` - нужна ли вспомогательная исследовательская разведка, чтобы снять неопределённость перед выбором маршрута;
- `verification` - какие проверки нужны;
- `evidence` - какой уровень доказательств нужен;
- `execution` - нужны ли субагенты и параллельная раздача задач.

Если позже появляется новый факт, профиль повышается.

## Task Profile

`specify` должен записать или доложить профиль задачи. Для маленькой правки профиль может быть коротким, но структура должна сохраняться, чтобы следующие фазы одинаково понимали решение. Старое имя `flow_profile` допустимо только как compatibility alias.

## RUN-local resolution

Для нового RUN профиль не является изменяемым источником поведения. В начале
RUN оркестратор оценивает факты задачи, выбирает поддерживаемый preset и
расширяет его в полный `flow_flags` snapshot. Приоритет источников:

```text
flow_default < preset < task_profile < protocol_override < run_override
```

Каждое effective value хранит `source.kind`, ссылку на источник, revision,
rationale и время разрешения. После каждого кандидата применяются mandatory
floors. Если новый факт требует более строгого режима, создаётся новая
append-only revision; предыдущий snapshot не переписывается. Явный downgrade
ниже floor отклоняется.

`run.json` — authoritative continuation snapshot. `run-index.json` — compact
навигационная проекция; они связаны `snapshot_revision` и
`snapshot_checksum`. Stage report может показать выбранные значения, но не
разрешает флаги заново.

Оценка режима автоматическая, но объяснимая:

| Сигнал задачи | Режим | Правило |
| --- | --- | --- |
| локальная обратимая правка без изменения контракта/данных | `compact` | короткий маршрут, self-check, без HTML/knowledge ceremony |
| обычная фича с ограниченным риском | `normal` | compact plan, grouped review, условные knowledge/bootstrap |
| контракт, runtime, данные, безопасность, CI/release или высокий риск | `full` | полный plan/review/evidence и все применимые receipts |

Название preset — только удобный вход. Реальное решение определяется
фактами, flow-owned defaults и floors, поэтому `compact` не может отключить
обязательный gate.

## Reduction and consumer matrix

Сокращение считается только если работа действительно не запускается или
помечается `not_applicable`/`reduced_artifact`; запись полного snapshot сама
по себе экономией не считается.

| Участок | Compact | Normal | Full | Обязательное сохранение |
| --- | --- | --- | --- | --- |
| specify/plan | no-plan или короткий план | compact plan | full plan + review | оценка задачи, ограничения, критерии выхода |
| subagents/review | self-check | allowlisted grouped | focused/mixed independent | критическое разделение ролей и semantic coverage |
| reports | Markdown по разрешению | Markdown, HTML явно выключен по умолчанию | Markdown + template HTML | required report выбранного gate |
| knowledge | skip с причиной | conditional | required | substantive fact и явная promotion applicability |
| bootstrap | not-required только для docs-only | revalidate | required receipt | identity/freshness/status fail-closed |
| merge | compact ceremony | normal ceremony | full ceremony | queue/lock, fixation, acceptance, final verification |
| observability | lifecycle checkpoints | checkpoints + stage/session joins | полный bounded detail | timing/usage status и privacy-safe projection |

Consumer matrix хранится рядом с canonical `flow-contract.json`: каждый
consumer должен либо прочитать RUN snapshot, либо явно назвать loss-aware
legacy projection. Неиспользуемый флаг считается ошибкой контракта, а не
поводом запускать лишнюю работу.

## RUN snapshot consumer gate

Перед выбором маршрута stage прочитай `run.json` как authority и проверь, что
`run-index.json` содержит тот же `snapshot_revision` и
`snapshot_checksum`. При несовпадении остановись с
`reconciliation_required`; не разрешай флаги заново из `task_profile`.
Старый RUN без snapshot можно продолжить только через явно отмеченный
`legacy_incomplete`/loss-aware путь и без новых flag-driven claims.

Применение effective values должно быть механическим:

- `skip`/`not_required` не запускает optional работу и создаёт короткую запись
  `not_applicable` с причиной;
- `conditional` запускает optional работу только при найденном применимом
  факте и сохраняет этот факт рядом с результатом;
- `required` создаёт обычный artifact и проходит соответствующий gate;
- `report.html` включается только явным effective value и только для flow,
  где HTML-контракт объявлен поддержанным;
- `observability.detail` уменьшает плотность bounded checkpoints, но не
  отключает timing/usage status, privacy redaction или обязательные events.

`workspace.bootstrap.mode` не отменяет identity/freshness/fail-closed gate:
`not_required` допустим только для docs-only contour. `merge.ceremony` и
`merge.report_detail` сокращают повторный checklist, формат и optional
summary, но один project-scoped merge worker остаётся владельцем claim/lock;
обязательные queue/lock, Git fixation, acceptance и final verification не
являются optional flags.

```yaml
task_profile:
  intent:
    understood_as:
    boundaries:
    non_goals:
    contradictions:
    blocking_questions:
    assumptions:

  impact:
    behavior:
    contract:
    operations:
    risk:

  route:
    planning: no_plan | compact_plan | full_plan
    git:
    delivery:
    ci:

  workspace:
    protocol_location:
    integration_branch:
    base_commit:
    feature_branch:
    worktree_path:
    bootstrap:
      contract: .memory-bank/dd-flow/common/workspace-bootstrap.md
      requirement:
      producer:
      gate:
      action:
      policy_source:
      canonical_entrypoint:
      owning_runbook:
      receipt_path:
      candidate_receipt:
      status:
      blockers:
      next_action:
      def_ids:

  documentation:
    impact:
    targets:
    reasons:

  research:
    needed:
    topics:
    sources:
    findings:
    unresolved:
    effect_on_route:

  verification:
    plan:
      lint:
      typecheck:
      unit:
      integration:
      build:
      scenarios:
      manual:
    reasons:

  evidence:
    level:
    reasons:

  execution:
    mode:
    parallelism:
```

Для каждого выбранного значения дай короткую причину. Причина важна: она показывает, почему мы включили или не включили дорогой контур.

## Intent: понимание задачи

`intent` фиксирует, что агент понял до выбора маршрута:

- `understood_as` - что именно пользователь хочет получить;
- `boundaries` - что входит в работу;
- `non_goals` - что явно не входит;
- `contradictions` - противоречия между запросом, проектом и ожиданиями;
- `blocking_questions` - вопросы, без которых нельзя продолжать;
- `assumptions` - допущения, которые можно принять без остановки.

## Impact: влияние изменения

`impact` не является маршрутом сам по себе. Это основание, из которого выводятся планирование, документация, проверки, evidence и delivery.

### `impact.behavior`

Показывает, меняется ли поведение системы.

Значения:

- `none` - поведение не меняется: текст, форматирование, внутренняя уборка без эффекта для пользователя и контрактов.
- `internal` - меняется внутренняя реализация, но внешний результат должен остаться тем же.
- `user_visible` - меняется видимое пользователю поведение.
- `feature_contract` - меняется поведение фичи как обещание продукта: сценарий, правило, ограничение, ожидание актора.

Зачем нужно: поведение определяет, нужны ли сценарии, проверка матрицы цели и ограничений, пользовательская документация и доказательная приемка.

### `impact.contract`

Показывает, меняется ли публичная или межслойная граница.

Значения:

- `none` - контракт не меняется.
- `client_sdk` - меняется клиентский набор методов (Client SDK), через который работают CLI/TUI/GUI/API/MCP.
- `api` - меняется API, схема запроса/ответа, endpoint, handler или внешний протокол.
- `data_schema` - меняются данные, миграции, seed/backfill, формат хранения.
- `ui_contract` - меняется экранный контракт: `screen_id`, секции, test ids, управление интерфейсом программно.
- `external_integration` - меняется взаимодействие с внешним провайдером, моделью, платежами, рассылками, Telegram, Vercel и подобным контуром.

Зачем нужно: контрактные изменения почти всегда требуют `route.planning: full_plan`, обновления `spec/system`, ADR или сценариев, а также более строгих проверок.

### `impact.operations`

Показывает, меняется ли эксплуатационный контур.

Значения:

- `none` - эксплуатация не меняется.
- `ci` - меняются или задействуются проверки непрерывной интеграции (CI).
- `deploy` - меняется или нужен deploy/preview/beta.
- `release` - затрагивается release-процесс, versioning, changelog или публикация.
- `rollback` - нужен явный откат (rollback), миграционный план или эксплуатационная готовность.

Зачем нужно: эксплуатационные изменения влияют на `route.delivery`, `route.ci`, `evidence` и возможные цели `documentation.targets`.

### `impact.risk`

Показывает риск последствий, а не размер diff.

Значения:

- `low` - локальная обратимая правка.
- `medium` - затронуты несколько зон, общий пакет, пользовательский путь или важная проверка.
- `high` - данные, безопасность, деньги, внешние действия, публикации, права, irreversible side effects.
- `research_required` - реализацию начинать нельзя: нужны варианты, внешняя документация, проверка гипотез или решение пользователя.

Зачем нужно: риск повышает глубину планирования, verification и evidence, даже если кодовая правка небольшая.

## Route: маршрут работы

`route` содержит поля, которые напрямую меняют ход процесса.

### `route.planning`

```yaml
route:
  planning: no_plan | compact_plan | full_plan
```

Управляет тем, запускаем ли полный `plan`.

- `no_plan` - плановая стадия не нужна; после specification можно делать правку и проверки.
- `compact_plan` - нужен короткий план: цель, зона изменений, Git, документация, проверки, evidence.
- `full_plan` - нужен полный `plan` с фазами `plan/*`.

Legacy aliases: `none -> no_plan`, `short -> compact_plan`, `full_plan -> full_plan`.

Исследование (research) не является значением `route.planning`. Если перед выбором маршрута есть значительная неопределённость, `specify` или `plan` сначала запускает вспомогательный контур `research`, снимает неопределённость и только затем выбирает `no_plan`, `compact_plan` или `full_plan`.

### `route.git`

```yaml
route:
  git: integration_branch_direct | feature_worktree
```

Управляет тем, где живёт протокол и где выполняется работа после `protocol.md`/`interactive.md`.

- `integration_branch_direct` - работаем прямо в основной интеграционной ветке проекта. Если в маленьком проекте нет выделенной интеграционной ветки, это означает работу в текущей основной ветке проекта.
- `feature_worktree` - на старте протокола создаём feature-ветку в отдельном рабочем дереве (worktree), всю реализацию и readiness gate ведём там, затем выполняем integration/merge в интеграционную ветку по правилам проекта.

Worktree здесь не означает параллельность. Это базовый контур изоляции работы.

Выбор должен быть соразмерен задаче:

- простая, обратимая, локальная правка без изменения поведения, контрактов, данных, сценарных ворот, deploy и проектного запрета на прямую работу -> обычно `integration_branch_direct`;
- значимая фича, рискованный фикс, изменение публичного контракта, несколько зон, сценарные/delivery-gates, долгий план, параллельные worker-ы или политика feature-веток -> обычно `feature_worktree`.

Если выбран `feature_worktree`, протокол должен создаваться уже внутри feature-ветки/worktree, а не в интеграционной ветке с последующим переносом. Это сохраняет причинную связь: протокол, план, код, проверки и evidence принадлежат одной рабочей ветке.

Если выбран `integration_branch_direct`, протокол создаётся в интеграционной ветке и должен быть настолько лёгким, насколько позволяет риск задачи. Протокол не равен бюрократическому пакету: для переименования кнопки достаточно короткого `summary.md` с маршрутом, изменением, проверкой и результатом.

Если до выбора маршрута нужен короткий черновик, держи его в `.tasks/`, но не публикуй долговечный `protocol/PRT-*` в интеграционную ветку до создания правильного Git-контура.

Git-preflight не является флагом и выполняется всегда:

- проверить текущую ветку;
- проверить связь с удалённой веткой;
- проверить `git status`, staged/unstaged;
- отделить изменения текущей работы от чужих;
- не откатывать чужие изменения;
- проверить, можно ли push/PR/merge/deploy по правилам проекта.

## Workspace: рабочая область протокола

`workspace` не является отдельным флоу-флагом, который отменяет правила. Это операционная фиксация того, как выбранный `route.git` материализован в репозитории.

```yaml
workspace:
  protocol_location: integration_branch | feature_worktree | not_created
  integration_branch:
  base_commit:
  feature_branch:
  worktree_path:
  bootstrap:
    contract: .memory-bank/dd-flow/common/workspace-bootstrap.md
    requirement: required | not_required | unresolved
    producer:
    gate:
    action: produce | revalidate | record_not_required
    policy_source:
    canonical_entrypoint:
    owning_runbook:
    receipt_path:
    candidate_receipt:
    status: <status from workspace-bootstrap.md>
    blockers:
    next_action:
    def_ids:
```

Зачем это нужно:

- будущие фазы понимают, где искать актуальный протокол;
- `code/implement`, отдельный `code/readiness` rerun и `merge/integrate` не начинают работу в неправильной ветке;
- bootstrap рабочей области становится проверяемым gate, а не скрытой ручной подготовкой;
- при сбое можно восстановить контекст по policy/runbook, receipt, blocker и next action без раскрытия секретов.

Правила:

- при `route.git: integration_branch_direct` поле `protocol_location` обычно `integration_branch`, а `feature_branch` и `worktree_path` пустые;
- при `route.git: feature_worktree` поле `protocol_location` должно быть `feature_worktree`, а `feature_branch`, `worktree_path` и `base_commit` должны быть заполнены до реализации;
- `workspace.bootstrap` является compact handoff. Полный receipt, допустимые statuses, reuse/invalidation и blocker/DEF rules определены только в `.memory-bank/dd-flow/common/workspace-bootstrap.md`;
- если следующий flow будет изменять checkout или запускать project tooling, `requirement`, `producer`, `gate`, `action` и `receipt_path` должны быть определены до handoff;
- blocked/failed result из канонического contract не позволяет начинать реализацию или project checks.

### `route.delivery`

```yaml
route:
  delivery: local | preview | beta | production
```

Управляет тем, где должен быть доказан результат.

- `local` - достаточно локальных проверок.
- `preview` - нужен preview или аналогичный ephemeral-стенд.
- `beta` - нужна проверка на бета-стенде (beta) или интеграционном окружении.
- `production` - нужен production/release/rollback-контур и отдельный допуск.

### `route.ci`

```yaml
route:
  ci: none | if_push | required | unavailable
```

- `none` - CI не нужен для текущих ворот.
- `if_push` - проверить CI, если был push, PR или merge.
- `required` - CI является воротами; без свежего результата нельзя честно закрыть работу.
- `unavailable` - CI нужен, но недоступен; нужен `DEF-*`, если это блокирует следующие ворота.

CI редко является самостоятельной целью. Он обслуживает push, PR, merge, preview, beta или production, поэтому живёт в `route`.

## Documentation: документирование Банка памяти

```yaml
documentation:
  impact: none | check_needed | update_required
  targets:
    - spec/product
    - spec/system
    - spec/engineering
    - spec/operations
    - adr
    - scenarios
    - ui
    - guides
    - protocol
    - evidence
  reasons:
```

`documentation` не разрешает игнорировать обязательное документирование и не отменяет правила MBB. Оно фиксирует результат анализа: есть ли в задаче факт, который должен жить в Банке памяти.

Это не "можно ли документировать". Это ответ на вопрос:

```text
нашли ли мы долговечную истину, которую активный Банк памяти обязан знать
```

- `none` - scout или основной агент проверил задачу и не нашёл факта, который нужно отражать в Банке памяти.
- `check_needed` - есть вероятность влияния; на планировании или реализации нужно проверить конкретные документы.
- `update_required` - найден факт, который обязан быть отражён в Банке памяти.

Когда повышать до `update_required`:

- меняется продуктовый смысл -> `spec/product`;
- меняется устройство системы или публичный контракт -> `spec/system`, возможно `adr`;
- меняется инженерное правило -> `spec/engineering`;
- меняется Git, CI, deploy, beta, release или rollback -> `spec/operations`;
- меняется UI-контракт, экран или пользовательский путь -> `ui`, возможно `guides`;
- меняется приемка -> `scenarios`, verification matrix, `evidence`;
- работа является фактическим следом протокола -> `protocol`.

Если во время реализации найден новый долговечный факт, `documentation.impact` повышается независимо от исходного значения.

## Research: снятие неопределённости

```yaml
research:
  needed: none | codebase | web | mixed
  topics:
  sources:
  findings:
  unresolved:
  effect_on_route:
```

`research` нужен, когда агент не может честно выбрать маршрут, проверки или границы работы без дополнительного исследования. Это вспомогательный этап, а не отдельный флоу доставки.

- `none` - существенной неопределённости нет.
- `codebase` - нужно исследовать кодовую базу, Банк памяти, тесты, конфиги или похожие реализации.
- `web` - нужен внешний поиск по документации, issue tracker, changelog, версиям библиотек, известным ошибкам или современным практикам.
- `mixed` - нужны оба контура.

Исследование можно поручать scout-субагентам. Для интернет-исследования субагент сам формирует несколько поисковых запросов, сравнивает источники, отделяет актуальные факты от догадок и возвращает выводы с ссылками. После исследования оркестратор обновляет `research.findings`, фиксирует нерешённые вопросы и выбирает маршрут в `route`.

## Verification: план проверок

`verification` фиксирует, какие проверки признаны нужными для доказательства соответствия результата ожиданию. Это помогает не запускать лишнее, но не отменяет проверку, если новый риск появляется позже.

Верификация (verification) отвечает на вопрос:

```text
соответствует ли результат задаче, плану, цели, ограничению, контракту, сценарию или gate
```

Ревью (review) отвечает на другой вопрос:

```text
соответствует ли сама сущность требованиям качества, стандартам проекта и хорошим практикам
```

Эти проверки нельзя смешивать. Сначала верифицируй результат, затем ревьюй качество сущности. Нет смысла делать глубокое ревью качества кода, документа или интерфейса, если результат не соответствует задаче.

```yaml
verification:
  plan:
    lint: skip | run | required
    typecheck: skip | run | required
    unit: skip | run | required
    integration: skip | run | required
    build: skip | run | required
    scenarios: none | review | update | acceptance_gate
    manual: none | needed
  reasons:
```

Значения для технических проверок:

- `skip` - контур не нужен; объясни почему.
- `run` - контур желательно запустить, если доступен.
- `required` - контур является воротами; если недоступен, нужен `DEF-*` или решение пользователя.

Сценарии:

- `none` - поведение не затронуто.
- `review` - выполнить сценарный просмотр применимости: проверить, не устарели ли существующие сценарии. Это не ревью качества (quality review) и не обязательный запуск сценариев.
- `update` - обновить или создать сценарные документы.
- `acceptance_gate` - сценарии являются воротами приемки; без сценарного вердикта или честного `DEF-*` работу нельзя закрыть.

Проверки должны доказывать выбранную цель и ограничения, а не просто демонстрировать активность.

## Review: качество сущности

Ревью (review) выводится из типа изменённой сущности и не требует отдельного большого блока в `flow_profile`.

- менялся код -> нужно ревью кода по стандартам кодирования проекта;
- менялась документация -> нужно ревью структуры, frontmatter, связей и источников истины;
- менялся интерфейс -> нужно ревью UI-контракта, языка, дизайн-системы, доступности и устойчивых идентификаторов;
- менялись сценарии или evidence -> нужно ревью доказательств, матрицы проверки и границ verdict;
- менялся `DEF-*` -> нужно ревью корректности причины, контекста, блокеров и следующего gate.

Для маленьких безопасных правок верификацию и ревью можно выполнить одним проходом, но отчёт должен отдельно ответить на оба вопроса:

- результат соответствует ожиданию;
- изменённая сущность соответствует требованиям качества.

## Evidence: доказательства

```yaml
evidence:
  level: final_report | protocol_record | proof_bundle | verification_passport | rollout_evidence
  reasons:
```

`evidence` фиксирует, какой уровень доказательств нужен для текущих ворот. Он не должен создавать тяжёлые паспорта проверки на каждую мелочь, но если gate требует доказательства, уровень повышается.

- `final_report` - достаточно итогового отчёта пользователю.
- `protocol_record` - нужен след в `protocol/`.
- `proof_bundle` - нужны артефакты запуска: лог, скриншот, JSON, CI run, run id.
- `verification_passport` - нужен паспорт проверки (verification passport) в `protocol/<PRT-ID>/evidence/` или `evidence/`.
- `rollout_evidence` - нужны доказательства выкладки: CI, preview, beta, production, rollback readiness.

Правило повышения:

- локальная микроправка без приемочного gate -> обычно `final_report`;
- протокол, ветка фичи или документационное решение -> минимум `protocol_record`;
- сценарный запуск или CI как gate -> минимум `proof_bundle`;
- закрытие фичи, beta gate или матрицы проверки -> `verification_passport`;
- preview/beta/production/rollback -> `rollout_evidence`.

## Execution: тактика исполнения

```yaml
execution:
  mode: solo | scouts | workers | verifiers | mixed
  parallelism: none | scout_parallel | worker_parallel | verifier_parallel | mixed_parallel
```

Управляет организацией ролей и параллельностью субагентов, а не Git/worktree-контуром. Worktree выбирается в `route.git`, а не в `execution`.

### `execution.mode`

- `solo` - основной агент делает сам.
- `scouts` - быстрые субагенты собирают контекст, не меняя файлы.
- `workers` - субагенты реализуют независимые части.
- `verifiers` - независимые проверяющие проверяют diff, evidence, сценарии или качество `DEF-*`.
- `mixed` - нужны разные роли.

Если `impact.risk: high` или меняется runtime/data/queue/session/hook/dashboard контракт, `plan` обязан использовать аспектных субагентов на стадии review либо записать явный downgrade. `execution.mode: mixed`, `workers` или `verifiers` без task packets и без downgrade-записи считается неполным планированием.

### `execution.parallelism`

- `none` - работа идёт последовательно; основной агент сам выполняет критический путь.
- `scout_parallel` - параллельно работают только разведчики контекста.
- `worker_parallel` - несколько кодовых или документационных worker-ов получают независимые пакеты задач.
- `verifier_parallel` - несколько verifier-ов параллельно проверяют разные области, evidence, сценарии или `DEF-*`.
- `mixed_parallel` - параллельно работают разные роли: scouts, workers и verifiers.

`execution.parallelism` не создаёт рабочие деревья сам по себе. Он означает, что оркестратор раздаёт независимые пакеты работ субагентам внутри выбранного Git-контура. Если `route.git: feature_worktree`, worker-ы работают в feature-worktree протокола или в явно выделенных оркестратором непересекающихся областях. Если `route.git: integration_branch_direct`, параллельных кодовых worker-ов нужно использовать особенно осторожно, чтобы не смешать изменения в интеграционной ветке.

## Производные стадии

Некоторые вещи не являются отдельными флагами, потому что выводятся из профиля:

- отдельное подтверждение реализации не нужно как флаг: если пользователь запускает `implementation`, реализация уже разрешена; `plan` сам останавливается перед реализацией;
- встроенный readiness gate и последующий integration выводятся из `route.git`, `route.delivery`, `route.ci`, `verification.plan.scenarios` и `evidence.level`;
- cleanup веток выводится из того, создавал ли процесс feature-ветку/worktree и разрешает ли проектная политика удаление;
- worktree как изоляция feature-ветки выводится из `route.git`.

## Повышение и понижение профиля

Профиль можно повышать после grounding или во время работы, если появились новые факты:

- `route.planning: compact_plan` -> `full_plan`, если найдено изменение контракта;
- `route.git: integration_branch_direct` -> `feature_worktree`, если политика запрещает прямую правку или риск выше ожидаемого;
- `route.delivery: local` -> `beta`, если merge в интеграционную ветку автоматически запускает beta gate;
- `documentation.impact: none` -> `update_required`, если найден долговечный факт Банка памяти;
- `verification.plan.scenarios: review` -> `acceptance_gate`, если сценарий является единственным честным доказательством результата;
- `evidence.level: final_report` -> `verification_passport`, если доказательство должно жить после сессии агента.
- `research.needed: none` -> `codebase`, `web` или `mixed`, если без дополнительного исследования нельзя честно выбрать маршрут, границы, проверку или исправление.

Понижение допустимо только с объяснением, почему риск снят.

## Контракт применения

Каждый downstream-промпт, который получает `task_profile` или legacy `flow_profile`, обязан:

1. прочитать `.memory-bank/dd-flow/common/flow-flags.md`;
2. найти последний актуальный `task_profile` в specification stage report, протоколе или отчёте предыдущей фазы; legacy fallback: `.tasks/prime-.../flow-profile.md`;
3. применить релевантные блоки профиля к своей фазе;
4. сверить route-affecting decisions with `.memory-bank/project-policy.md`, если он есть;
5. если фаза будет изменять checkout или запускать project tooling, применить `workspace.bootstrap` по `.memory-bank/dd-flow/common/workspace-bootstrap.md`;
6. повысить профиль, если обнаружен новый риск, и объяснить причину;
7. не понижать профиль молча;
8. в итоговом докладе указать, какие блоки профиля реально повлияли на действия.

## Карта применения по промптам

`protocol.md`/`common/specification.md`:

- формирует `task_profile`;
- запускает `research`, если значительная неопределённость мешает выбрать маршрут;
- объясняет причины по каждому блоку;
- задаёт блокирующие вопросы только там, где проект не снимает неопределённость.

`prime.md` выполняет только priming сессии и не формирует профиль задачи.

`plan.md`:

- применяет `route.planning`;
- запускает вспомогательный `research`, если новая неопределённость вскрылась уже при планировании;
- превращает `impact`, `documentation`, `verification`, `route`, `evidence`, `execution` в плановые задачи `plan/*`;
- формирует compact `workspace.bootstrap` handoff: policy source, canonical entrypoint, owning runbook, producer/gate and planned receipt path;
- для high-risk или contract/runtime работ запускает аспектных субагентов на стадии review либо фиксирует обоснованный downgrade;
- повышает профиль, если плановая проработка нашла новый риск.

`plan/reflection.md`:

- проверяет, не занижен ли профиль относительно цели, ограничений и рисков.

`plan/review.md`:

- ревьюит профиль сверху вниз: продукт, система, инженерия, интерфейс, сценарии, данные, эксплуатация.

`plan/implementation.md`:

- превращает профиль в граф задач, task packets, матрицу цели и ограничений, проверки и evidence-план.

`plan/operations.md`:

- применяет `route.git`, `route.delivery`, `route.ci`, `impact.operations` и `evidence.level`;
- описывает ветки, рабочие деревья, CI, preview, beta, production и cleanup.
- применяет `workspace-bootstrap.md` к выбранному concrete checkout и будущим project-tooling gates.

`plan/scenarios.md`:

- применяет `verification.plan.scenarios` и `evidence.level`;
- решает, нужны ли сценарии как review, update или acceptance gate.

`code/implement.md`:

- выполняет работу в выбранном `route.git`;
- соблюдает `documentation`;
- запускает проверки из `verification.plan`;
- создаёт evidence нужного уровня;
- использует `execution.mode` и `execution.parallelism` для workers/verifiers;
- после реализации в том же orchestration run переходит к readiness gate, запускает нужных reviewers, исправляет findings, повторяет свежие проверки и принимает итоговый verdict.

`code/readiness.md`:

- используется как reusable gate-модуль внутри `code/implement.md` и как отдельный rerun/continuation prompt, если code-flow был прерван после реализации;
- доказывает готовность интеграционной ветки или feature-worktree к следующему gate;
- закрывает доступные `DEF-*`;
- проверяет обязательные `verification` и `evidence` перед merge.

`merge/integrate.md`:

- выполняет merge, deploy, beta или production gates только если они следуют из `route.git` и `route.delivery`;
- собирает rollout evidence, если его требует профиль.

`common/git-ops.md`, `common/subagents.md`, `common/closure.md`:

- переводят профиль в конкретные правила Git, постановки задач субагентам и закрытия фаз.

`specify` не должен создавать бюрократию ради бюрократии. Он должен выбрать минимально достаточные контуры процесса, чтобы работа была понятна, проверяема и не противоречила проектным правилам.
