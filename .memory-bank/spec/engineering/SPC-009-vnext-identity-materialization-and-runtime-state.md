---
file: '.memory-bank/spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md'
description: 'Canonical breaking contract for coherent Flow/RUN/Work identity, mechanical state ownership, portable references, filesystem materialization, lifecycle, reports, snapshots and cleanup.'
purpose: 'Use before changing the flow pack, dd-flow-cli runtime or dd-eval fixtures so every implementation decision follows one top-down execution and storage model.'
version: '1.0.0'
date: '2026-08-31'
status: 'ACTIVE'
c4_level: 'documentation'
spec_id: 'SPC-009'
parent: '.memory-bank/spec/engineering/index.md'
related_files:
  - '.memory-bank/dd-flow/README.md'
  - '.memory-bank/dd-flow/common/entity-ids.md'
  - '.memory-bank/dd-flow/common/flow-runs.md'
  - '.memory-bank/dd-flow/common/runtime-contract.md'
  - '.memory-bank/dd-flow/common/workspace-layout.md'
  - '.memory-bank/dd-flow/flow-contract.json'
implementation_repositories:
  - repository: 'dd-memorybank'
    owns: 'Target specification, Flow/stage catalog, prompts, schemas and deterministic report templates.'
  - repository: 'dd-flow-cli'
    owns: 'SQLite authority, lifecycle enforcement, ID allocation, path/reference resolution, materialization, projections, snapshots, cleanup and deterministic renderers.'
  - repository: 'dd-eval'
    owns: 'Portable stage entries, artifact collection, judge inputs and regression assertions.'
tags: [spec, vnext, identity, materialization, run, work, stage, paths, state, sqlite, reports, snapshots, cleanup]
history:
  - version: '1.0.0'
    date: '2026-08-31'
    changes: 'Promoted the accepted coordinated beta implementation to the stable Memory Bank 4.0.0 and dd-flow CLI 0.8.0 contract.'
  - version: '0.1.0'
    date: '2026-08-27'
    changes: 'Defined one top-down beta contract that removes legacy JOB/work projections, places Work under RUN, scopes IDs and references, centralizes stage/path materialization, separates semantic and mechanical authority, and specifies a breaking coordinated rollout.'
---

# SPC-009: идентичность, материализация и состояние vNext runtime

## 1. Решение

vNext исправляется одним согласованным breaking-пакетом. Нельзя отдельно
переименовать идентификаторы, каталоги или поля отчёта: они являются проекциями
одной модели исполнения и при частичном изменении снова расходятся.

Целевая иерархия решений:

```text
Flow Definition                 статический граф разрешённого процесса
  -> RUN                        один материализованный запуск Flow
     -> root Work               главный исполняемый процесс RUN
        -> child Work graph     динамически созданные обязательства
           -> Session links     факты исполнения Work агентными сессиями

RUN
  -> SQLite mechanical state    единственный runtime SSOT
  -> run.json                   одна переносимая текущая проекция
  -> timeline.jsonl             append-only история событий
  -> stage roots                смысловые результаты стадий
  -> works/                     пакеты и результаты Work
  -> project workspace          единственное место изменения продукта/Memory Bank
```

Идентификаторы, ссылки и пути следуют из этой иерархии. Файловая структура не
определяет сущности задним числом, а материализует уже существующие сущности и
отношения.

SPC-009 уточняет ранние vNext SPC-007/008 по результатам beta-прогонов. Он не
отменяет SPECIFY-first SDLC, root/child Work, deterministic-first stage entry,
cold-start handoff или structured concurrency. Он удаляет оказавшиеся лишними
runtime-сущности и параллельные проекции.

## 2. Наблюдаемые проблемы

Beta-реализация и оставшиеся канонические документы одновременно используют:

- `Work` и legacy `JOB/worker` как две модели исполняемой работы;
- `run.json.workers` и отдельный `work.json` как две текущие проекции;
- один `RUN.current_stage`, хотя дочерние Work могут выполняться на разных
  стадиях;
- `work/<WRK>/try-NNN`, хотя Work принадлежит RUN, а обычное исправление не
  является новой попыткой стадии;
- project-scoped аллокацию `WRK-*` при глобальном primary key в SQLite;
- `CHK-*` одновременно для декларации проверки и записи checkout;
- глобально уникальные reviewer finding IDs, хотя находка локальна результату
  одного reviewer Work;
- несколько несовместимых path normalizer и `run://` resolver;
- четыре почти одинаковых поля пути RUN;
- свободные модельные пути для Memory Bank shelves;
- широкую текстовую замену абсолютных путей при восстановлении eval snapshot;
- stage-specific ручные Markdown/HTML renderers;
- несовпадающие копии JSON Schema в flow pack и runtime;
- raw intake одновременно в RUN и внутри PRT;
- устаревшие каталоги стадий `01-specify/02-plan/03-code/04-merge`.

Проблема системная: разные слои отвечают на один и тот же вопрос по-разному.

## 3. Цели

1. Зафиксировать одну модель Flow, RUN, Work, Session и Stage.
2. Определить области уникальности и форму ссылок для всех публичных сущностей.
3. Связать идентичность сущности с единственным каноническим местом её
   материализации.
4. Оставить SQLite единственным mechanical SSOT и одну переносимую проекцию
   `run.json`.
5. Сделать пути переносимыми между checkout, worktree, snapshot и машиной.
6. Удалить legacy/fallback модели вместо их синхронизации.
7. Сохранить полную функциональность параллельных Work, зависимостей,
   reviewers, repair, checks, pause/resume, snapshots, cleanup и eval.
8. Сделать lifecycle проверяемым инвариантами, а не соглашениями промптов.
9. Обновить flow pack, runtime и eval согласованно одной beta-парой.

## 4. Не-цели

- Не строить универсальный workflow engine или новый общий DSL.
- Не создавать runtime-таблицу `Action`: действия остаются статической частью
  Flow definition и событиями timeline.
- Не хранить Agent Turn как отдельную публичную сущность. Provider/harness сам
  владеет turn; runtime учитывает Work, Session и факт их связи.
- Не создавать универсальный entity registry для локальных `R/AC/P/CHK/FIND`.
- Не переносить semantic `plan.json` в SQLite.
- Не добавлять `variables.json`, `work.json`, run-index или другой параллельный
  текущий state.
- Не делать нечувствительный к регистру поиск по всему диску.
- Не создавать отдельный Work для каждого handler, check, мысли или файла.
- Не сохранять абсолютную воспроизводимость eval ценой копии всего мира.
- Не поддерживать чтение нового beta runtime старым контрактом.

## 5. Нормативная модель исполнения

### 5.1 Flow Definition

Flow Definition — статический версионированный граф стадий, входов, действий,
guards, переходов и terminal outcomes. Он не содержит фактические Work,
сессии, пул агентов или runtime paths.

Каждая стадия регистрируется один раз в каталоге Flow:

```json
{
  "key": "plan-review",
  "order": 4,
  "directory": "04-plan-review",
  "semantic_result": "decision.json",
  "report": "stage-report.json"
}
```

Каталог стадий является единственным источником порядка, имени каталога,
результата, применимых схем и разрешённых переходов. Отдельные hardcoded maps
в runtime запрещены.

### 5.2 Stage

Stage — статическая инструкция Flow, не runtime-процесс. У самой Stage нет
статуса `running`.

RUN хранит запись о прохождении стадии: начало, завершение, outcome, связанный
координатор Work и ссылки на артефакты. Эта запись является mechanical stage
visit, а не новой публичной сущностью с отдельным typed ID.

В базовом MB-SDLC одна координаторская запись на Stage в RUN. Параллельная
работа внутри стадии выражается дочерними Work, а не дублированием stage root.
Pause/resume продолжает ту же запись и не создаёт новую попытку.

### 5.3 RUN

RUN — один материализованный запуск Flow и process group для всех созданных в
нём Work. RUN не является верхнеуровневым Work и не владеет агентной сессией.

RUN хранит:

- flow id/version и immutable execution configuration;
- root Work ID;
- mechanical aggregate status;
- stage visits;
- RUN variables и flow-control flags;
- workspace route;
- компактные Work/session/usage summaries;
- ссылки на артефакты и timeline.

RUN не имеет authoritative `current_stage`. `active_stages` и `next_actions`
являются вычисляемыми проекциями.

### 5.4 Work

Work — долговечное исполняемое обязательство внутри RUN. Work может:

- пройти несколько стадий;
- выполнить deterministic handlers;
- быть исполнен одной или несколькими Session;
- приостановиться для HITL/external wait;
- создать дочерние Work;
- завершиться только после обязательных дочерних Work.

При запуске Flow создаётся ровно один root Work. `parent_work_id` child Work
задаётся один раз и не меняется. Reparenting запрещён.

Work создаётся только для independently schedulable обязательства с отдельным
результатом. Встроенная deterministic операция не становится Work.

### 5.5 Session и связь с Work

Session — provider/harness context. Она хранится отдельно от Work. Одна Session
может последовательно исполнять несколько Work; один Work может продолжаться
в нескольких Session согласно handoff policy.

Отдельный `AgentTurn`/`Turn` table и публичный `turn_id` не вводятся. Runtime
хранит обычную association record между Work и Session с временем начала,
завершения, ролью и hook evidence. Association ID, если нужен SQLite, является
внутренней технической деталью и не возвращается агенту как `id`.

Публичные ответы используют явные поля `work_id`, `session_id` и
`agent_id`. Голого поля `id` нет.

Hook остаётся trusted adapter для Session binding. Lifecycle-команда стадии
или Work запускается отдельным shell invocation, чтобы hook получил точный
argv. Hook вычисляет fingerprint тем же canonical parser, что и CLI, и
идемпотентно связывает наблюдаемую Session с уже известными RUN/Work. Он не
вставляет скрытые флаги в shell-команду, не принимает model-authored
`--session-id` и не требует `PostToolUse`.

Одна Session не участвует одновременно в двух RUN. Последовательное участие в
разных RUN допустимо через неперекрывающиеся time-bounded links. `agent_id`,
model/provider и transcript source сохраняются, когда harness их сообщает.

Иерархия Work и иерархия Session хранятся раздельно. `parent_work_id` является
обязательной структурой исполнения dd-flow. `parent_session_id` записывается
только когда trusted adapter/provider действительно наблюдает fork/spawn; он
не выводится автоматически из parent Work. Завершение Work закрывает его
активную association link, но не обязано закрывать provider Session: та может
остаться idle и получить следующий Work.

### 5.6 Structured concurrency

- parent Work не может стать terminal, пока есть обязательный child Work в
  `created`, `running` или `paused`;
- завершившийся parent не принимает нового child;
- зависимость `depends_on` блокирует start до `completed` predecessor;
- `informs` не является execution edge и не блокирует start;
- child failure не переписывает parent автоматически: Flow policy выбирает
  repair, fail, cancel или pause;
- RUN terminal только после terminal root Work и отсутствия dangling Work.

`stalled`/`hung` является вычисляемым health condition по отсутствию
наблюдаемого прогресса, а не normal Work status. Автоматическое завершение или
повтор по одному таймауту запрещены: controller получает диагностику и
принимает предусмотренное policy-решение.

### 5.7 Переходы, HITL и stop target

Агент возвращает semantic outcome; deterministic handler валидирует его, а
Flow выбирает только разрешённое ребро. Агент не задаёт `next_stage`.

В обычном MB-SDLC нет автоматических обратных переходов в уже завершённую
стадию. Если PROTOCOLIZE, PLAN или REVIEW нужен ответ пользователя, текущий
Work/Stage pause, принимает ответ и продолжает ту же стадию. Accepted repair
выполняется внутри текущей review stage через child Work. Возврат вроде
`PROTOCOLIZE -> SPECIFY` или `REVIEW -> CODE -> REVIEW` запрещён: он повторяет
работу и создаёт неоднозначные side effects.

Если пользователь существенно меняет уже принятую постановку, это explicit
revision/restart decision, а не скрытое ребро Flow.

RUN configuration может задавать предусмотренный Flow stop target, например:

- `merge_queue`: Flow успешно заканчивается после валидной постановки в
  очередь;
- `manual_merge`: после подтверждённого ручного merge;
- `agent_merge`: после завершённой merge stage.

Пользователь выбирает предметный stop target, а не raw Stage ID.

### 5.8 PLAN tasks и runtime Work graph

`P1`, `P2`, ... в `plan.json` — существующие semantic implementation task
keys, не Work. Их формат не меняется без функциональной причины. PLAN обязан
описать required context, write scope, verification и реальные зависимости.

CLI детерминированно строит `code-work-batch.json` из schema-valid plans без
пересказа длинного prose. При открытии CODE batch регистрируется как runtime
Work graph и получает `WRK-*`. Отображение не обязано быть один-к-одному:

- один Work может объединить совместимые ready plan items;
- shared preliminary/fan-in Work может обслуживать несколько PRT;
- PSET не создаёт отдельный RUN;
- `depends_on` берётся только из фактической необходимости результата;
- `informs` остаётся контекстной ссылкой без scheduler edge.

Ready Works с пересекающимся write scope не запускаются одновременно, даже
если semantic dependency отсутствует. Это runtime scheduling constraint, а не
повод подделывать `depends_on`. Read-only Works конфликтов записи не создают.
Capacity и write-scope packing определяют waves, не меняя смысловой граф.

Repair Work создаётся runtime и ссылается на origin Work/check/finding; он не
переписывает исходный semantic plan задним числом.

## 6. Состояния

### 6.1 Work state

Минимальный набор:

```text
created -> running -> completed
                   -> failed
                   -> cancelled
                   -> paused -> running
```

`pause_reason` уточняет `waiting_for_user`, `waiting_for_external` или
`blocked`. Пользовательский вопрос не завершает Stage или Work.

Routine correction выполняется в том же running Work. Ошибка проверки не
переводит Work в `failed`: CLI возвращает receipt, Work остаётся running,
агент исправляет проблему и повторяет finish. Repair после независимого review
оформляется новым child Work.

Публичный `work retry` для terminal Work не входит в vNext target. Если позднее
потребуется реальный повтор неизменного обязательства, он проектируется
отдельно с историей, а не сбрасывает terminal row обратно в `created`.

### 6.2 RUN state

RUN status — вычисляемый агрегат:

- `created`: root Work создан, исполнение не началось;
- `running`: есть выполняемый или готовый Work;
- `paused`: всё обязательное исполнение ожидает пользователя, внешнее событие
  или снятие блокера;
- `completed`: root Work достиг terminal success и дерево закрыто;
- `failed`: root Work завершён ошибкой;
- `cancelled`: оператор/пользователь отменил Flow.

`waiting_for_user` не является отдельным RUN terminal status; это
`paused + pause_reason=waiting_for_user`. `next_action` в RUN — производная
подсказка, не authority перехода.

### 6.3 Stage visit state

Stage visit использует `pending | active | paused | completed | skipped |
failed | cancelled`. Эти значения описывают факт прохождения, а не меняют
определение Stage.

Опциональный review, выключенный RUN policy, фиксируется `skipped` с причиной.

## 7. Идентификаторы и области видимости

### 7.1 Публичные durable IDs

| Семейство | Область уникальности | Назначение |
|---|---|---|
| `PRJ-*` | `DD_FLOW_HOME` | проект |
| `WRK-*` | `DD_FLOW_HOME` | Work; глобальная область совпадает с SQLite PK и context-free CLI lookup |
| `RUN-*` | проект | запуск Flow |
| `PRT-*`, `PSET-*` | проект | протокол и набор протоколов |
| `SPC-*`, `ADR-*`, `SCN-*`, `DEF-*` | проект | durable Memory Bank сущности |
| `EP-*`, `FT-*` | проект | epic и feature в project delivery catalog |

Typed full ID используется в имени durable каталога/файла один раз. Короткий
алиас разрешается только внутри известной области и при однозначности.

`WRK-*` становится глобальным в `DD_FLOW_HOME`; это проще и согласуется с
текущим `works.work_id PRIMARY KEY`. Composite migration в каждой команде не
вводится.

Checkout/worktree ownership record пока не получает публичный `WTR-*`: ни одна
штатная пользовательская команда не адресует такую запись напрямую. SQLite
может использовать внутренний ключ и отношения project/RUN/protocol/purpose.
Отдельный typed ID вводится только при появлении реального внешнего consumer.
`CHK-*` больше никогда не используется для checkout.

### 7.2 Локальные ключи

| Ключ | Владелец |
|---|---|
| `R-*`, `AC-*` | `specify.json` одного RUN |
| `P1`, `P2`, ... | `plan.json` одного PRT/revision |
| `CHK-*` | декларация проверки в плане/Work packet |
| `FIND-*` | результат одного reviewer Work |
| `RCP-*` | квитанция исполнения проверки одного Work |

Локальный ключ не получает глобальную запись в registry.

Каноническая ссылка формируется через владельца:

```text
RUN-021-.../R-003
PRT-014-.../P2
WRK-031-review-ui/FIND-001
WRK-044-code-api/RCP-002
```

Reviewer всегда может вернуть `FIND-001`; runtime строит `finding_ref` из
source Work. Одинаковый локальный ID у разных Work допустим, внутри одного
результата — ошибка. Decisions, `duplicate_of` и repair inputs используют
`finding_ref`, не голый `finding_id`.

### 7.3 Provider IDs

Codex/другой provider `session_id`, `agent_id`, transcript path и hook event ID
остаются opaque. Они не получают новые dd-flow prefixes и не участвуют в
именах файлов.

## 8. Каноническая материализация RUN

```text
<DD_FLOW_HOME>/projects/<PRJ-ID>/runs/<RUN-ID>/
  run.json
  engine-binding.json
  timeline.jsonl
  intake/
    discussion.md
    questions.jsonl
    answers.jsonl

  01-specify/
    context.json
    prompt.md
    specify.json
    specify.md
    stage-report.json
    stage-report.md
    stage-report.html

  02-protocolize/
    context.json
    prompt.md
    protocolize-result.json
    stage-report.json
    stage-report.md
    stage-report.html

  03-plan/
    context.json
    prompt.md
    <PRT-ID>/aspect-map.json
    code-work-batch.json
    stage-report.json
    stage-report.md
    stage-report.html

  04-plan-review/
    context.json
    prompt.md
    decision.json
    stage-report.json
    stage-report.md
    stage-report.html

  05-code/
    context.json
    prompt.md
    code-verification.json
    stage-report.json
    stage-report.md
    stage-report.html

  06-code-review/
    context.json
    prompt.md
    decision.json
    stage-report.json
    stage-report.md
    stage-report.html

  07-merge/
    context.json
    prompt.md
    merge-result.json
    stage-report.json
    stage-report.md
    stage-report.html

  works/                         # только Work с собственным artifact packet
    <WRK-ID>/
      context.json
      prompt.md
      result.json
      checks/
        RCP-001.json
        RCP-001.stdout.log
        RCP-001.stderr.log
```

Stage-specific semantic filenames сохраняются: единый `result.json` для всех
стадий не даёт пользы и ухудшает читаемость. Child Work всегда использует
`context.json`, `prompt.md`, `result.json`.

Корневой координатор Work не получает пустой дублирующий каталог: его
stage-specific context/prompt/result уже принадлежат stage roots, а identity и
state находятся в SQLite/run.json. Полностью deterministic Work без artifact
packet также может не иметь папки. `Session` и association rows файловых
каталогов не получают.

### 8.1 Attempts

Обычный первый проход пишет прямо в stage root. Pause/resume не создаёт
attempt. При явном полном повторе стадии CLI до записи переносит прежний
текущий набор в:

```text
04-plan-review/attempts/ATT-001/
```

Каталог `attempts/` отсутствует, если повтора не было. Архив read-only для
агента. Внутри Work автоматический `try-001` не создаётся.

### 8.2 Владение файлами

- CLI создаёт каталоги, context, prompt, reports, receipts и projections.
- Агент пишет только названный semantic result либо project files в явно
  разрешённом write scope.
- CLI принимает semantic candidate атомарно, валидирует и материализует
  canonical result.
- Project/Memory Bank edits живут в `workspace_root`, а не в RUN.
- Durable PRT/SPC/ADR/SCN/DEF shelves определяются project catalog/config; агент
  выбирает semantic action, но не изобретает `epic_path` или каталог.

## 9. Источники истины и проекции

### 9.1 Mechanical SSOT

SQLite — единственный authoritative current mechanical state:

- RUN/Work/stage visit/status;
- parent/dependency graph;
- Session links;
- variables/policy;
- timestamps;
- workspace ownership;
- usage checkpoints.

Для runtime Work SQLite также владеет assignment/payload и принятым
schema-valid result. `works/<WRK>/context.json`, `prompt.md` и `result.json`
являются переносимыми/audit projections. Большие stdout/stderr, browser
artifacts и transcripts остаются файлами; SQLite хранит их typed refs и
checksums, а не blobs.

### 9.2 `run.json`

`run.json` — одна переносимая текущая проекция. Она содержит:

- RUN identity/configuration/status;
- root Work ID;
- stage visits;
- compact Work rows: ID, parent, dependencies, status и artifact ref;
- compact Session references/aggregate usage status;
- RUN variables;
- workspace route;
- artifact links.

Она не содержит полные Work tasks, payloads, results, prompts, logs или
transcripts.

Удаляются:

- `work.json`;
- `run-index.json` и locator fallback;
- `run.json.workers/JOB-*`;
- runtime semantic plan copy;
- `variables.json`.

CLI `work ls/show`, `stat run sessions ls` и `stat usage` читают SQLite.

### 9.3 RUN paths в БД

В свежем beta storage остаётся `run_root`. Путь `run.json` вычисляется как
`<run_root>/run.json`. Поля `runtime_path`, `run_dir`, `run_index_path` и
`run_home_path` удаляются из нового контракта.

`engine-binding.json` остаётся immutable router sidecar и не является второй
проекцией состояния.

### 9.4 Semantic SSOT

- `specify.json` — требования и acceptance contract;
- `protocolize-result.json` — распределение обязательств по PRT/PSET и durable
  document actions;
- `.memory-bank/protocol/<PRT>/plan.json` — semantic implementation plan;
- review `decision.json` — решение координатора;
- stage-specific semantic JSON — file SSOT стадии.

SQLite не копирует эти stage/Memory Bank документы целиком. Mechanical
references и checksums допустимы. Work task/result являются исключением,
потому что Work — runtime-сущность, а его файлы являются проекциями SQLite.

### 9.5 Work Context

Work Context переносит минимально достаточное состояние между deterministic
handlers, стадиями и новыми Session. Он не является transcript и не содержит
секреты.

Минимальные namespaces:

```text
system      RUN/Work/parent/Flow/stage/revision
workspace   project_root/workspace_root/run_root/write scope
input       immutable assignment parameters
runtime     Git/compatibility/permissions/variables
artifacts   typed references, не копии больших документов
results     принятые predecessor/handler results
children    безопасная aggregate картина child Work
execution   текущая Session/model/agent, если есть
```

Engine владеет `system`, `workspace`, revision и execution binding. Агент не
редактирует их. Монотонная `revision` защищает от stale writes; checksum каждого
поля не нужен.

Перед Agent Work движок сначала выполняет доступный deterministic prelude,
затем материализует выбранную проекцию контекста и рендерит prompt. Prompt
получает только именованные применимые блоки. Полный Work Context, transcript и
нерелевантные документы автоматически не вставляются.

Stage `context.json` — immutable snapshot входа координаторского Work в данную
стадию. `works/<WRK>/context.json` — packet дочернего Work. Текущее mechanical
состояние обоих остаётся в SQLite; файлы являются audit/handoff projections.

## 10. RUN configuration, variables и flow flags

Immutable execution configuration фиксируется при старте RUN:

- flow/engine/pack versions;
- stage session mode;
- plan-review/code-review modes;
- workspace route;
- stop target;
- materialization/layout version;
- requested agent/model profile reference, если его задаёт controller.

Model launch принадлежит harness/controller. dd-flow хранит requested profile
и observed Session model как разные факты и не заявляет enforcement, если
harness не позволяет выбрать модель данного типа Session.

RUN variables — именованные mutable facts, полезные нескольким стадиям.
Flow-control flags являются системной группой этих переменных, а не отдельным
хранилищем. Например, capacity probe записывает один фактический
`runtime.subagents.available_slots` на RUN.

Хранение: SQLite + projection in `run.json`. При `stage start` runtime отдаёт
применимые системные variables и пользовательские custom variables. При
`work start` выбранная проекция попадает в `works/<WRK>/context.json`.

Отдельный `variables.json` не создаётся.

## 11. Пути и переносимые ссылки

### 11.1 Три корня

- `project_root`: стабильная зарегистрированная идентичность repository;
- `workspace_root`: checkout/worktree, где разрешены изменения;
- `run_root`: runtime artifacts конкретного RUN.

Сравнение использует canonical real path существующих корней. Hook, CLI,
snapshot и cleanup вызывают один общий path module.

### 11.2 Сохраняемые ссылки

RUN artifacts используют:

```text
run://<RUN-ID>/<relative-posix-path>
```

Project source/test paths в semantic документах остаются обычными
repository-relative POSIX paths:

```text
apps/api/src/tasks.ts
```

Новый persisted `workspace://` не вводится: worktree временный, а source path
должен остаться валиден после merge и удаления worktree. Runtime разрешает
repository-relative path относительно текущего `workspace_root`; prompt может
показать абсолютный путь для непосредственной работы агента.

### 11.3 Нормализация

Один shared module предоставляет:

- canonical existing root;
- safe output path under an owner root;
- containment/symlink-escape check;
- same-path comparison;
- parse/resolve `run://`;
- conversion repository-relative path to current workspace path.

Не выполняется глобальный поиск похожего пути с другим регистром. Если
переданный existing path операционная система разрешает в тот же объект, он
нормализуется. Иначе CLI возвращает ошибку с ожидаемым canonical path и
возможной подсказкой.

### 11.4 Алиасы

Prompt aliases — только удобство текущего вызова:

```text
@project @workspace @run @stage @work @protocol @plan @intake
```

Они разрешаются stage/materialization catalog, не сохраняются как durable
references и не принимают traversal.

## 12. Intake и durable Memory Bank

Raw discussion, вопросы и ответы HITL живут только в `RUN/intake`. Они не
копируются побайтово в каждый PRT.

PRT/PSET хранит:

- принятый смысл и распределённые `R/AC`;
- решения, constraints и acceptance;
- ссылку `source_run_id`/`run://...` для аудита;
- curated summary, если raw RUN позднее будет удалён по retention policy.

Flow не создаёт durable feature/epic/spec/ADR/scenario по ритуалу. Agent
выбирает положительный semantic action, runtime выделяет ID и путь по project
catalog. Index files являются навигацией, не отдельными сущностями.

## 13. Проверки и receipts

`CHK-*` объявляется в plan/Work packet один раз. CLI знает gate (`work`,
`code`, `readiness`, `merge`, `release`, `external`), команду/alias и ожидаемые
артефакты.

Каждый запуск создаёт Work-local `RCP-*` receipt с:

- `check_ref`;
- owner Work/RUN;
- command/alias after deterministic resolution;
- timestamps/duration/exit status;
- stdout/stderr artifact refs;
- declared required artifact verdict.

Receipt доказывает только наблюдаемый запуск. Он не заменяет semantic
acceptance. Work finish запускает только work-gate checks. Stage fan-in
запускает только aggregate checks своего gate.

Repair Work по failed check получает origin Work context, exact receipt и
logs. Repair Work по review получает origin Work refs, canonical finding refs
и evidence refs.

## 14. Review findings

PLAN-REVIEW и CODE-REVIEW используют одинаковую identity model:

1. Reviewer Work получает назначенные аспекты.
2. Reviewer возвращает локальные `FIND-001...`.
3. CLI валидирует уникальность внутри результата и строит canonical
   `finding_ref=<WRK-ID>/FIND-001`.
4. Coordinator decision перечисляет каждый material `finding_ref` ровно один
   раз.
5. Duplicate указывает другой canonical `finding_ref`; цепочки ацикличны.
6. Repair/DEF сохраняют canonical refs и immutable reviewer evidence.

Review result не кодирует group key в ID и не требует межсессионного
согласования счётчиков.

## 15. Stage и Work lifecycle commands

Первое действие агента после stage trigger — одна standalone команда
`stage start`. Она атомарно:

- разрешает RUN/flow/engine pair и stage catalog;
- выполняет path/permission/Git/compatibility preflight;
- связывает Session через trusted hook event;
- материализует stage context/prompt/result target;
- возвращает все применимые schema, paths, aliases и точные pause/resume/finish
  команды.

Агент не открывает global help и не повторяет эти проверки.

`work start` аналогично вызывается standalone в свежей worker Session и
возвращает task/context/result/finish contract. Dependency guard до claim
возвращает понятный blocked-by список и не меняет Work state.

Claim выполняется compare-and-set внутри SQLite transaction. У Work может быть
не более одной active Session link. Parent и every `depends_on` обязаны
принадлежать тому же RUN; cross-RUN edge отклоняется. Dependency list остаётся
простым validated массивом в Work row: отдельная relation table без реального
query/scale требования не вводится.

`stage finish` и `work finish` могут быть двухфазными. Если deterministic
validation/check/review decision создаёт обязательный repair Work, finish
возвращает `action_required`, сохраняет immutable evidence и оставляет текущую
стадию active. После завершения названных Works повтор той же команды завершает
стадию. Повторный review не запускается.

После первого принятого review decision semantic decision/result sealed;
repair Work добавляет отдельные evidence и result. Вторая фаза не разрешает
молча переписать исходные reviewer findings или disposition.

HITL pause возвращает готовый `user_message` и точную standalone resume-команду
с актуальным `DD_FLOW_HOME`, RUN, Work и stage. Ответ сохраняется в
`RUN/intake/answers.jsonl`; resume переводит тот же Work/Stage из paused в
running и рендерит продолжение. Stage finish до получения ответа запрещён.

Обычный агент не использует `run complete`. Audited operator override
`cancelled|failed` остаётся только recovery surface с обязательной причиной.

Start/finish/pause/resume идемпотентны по canonical operation fingerprint и
accepted payload checksum. Повтор не создаёт вторую Session link, stage visit,
receipt или transition. Другой payload после sealed acceptance отклоняется.

## 16. Отчёты

Stage module формирует schema-valid `stage-report.json`. Один общий renderer
детерминированно создаёт Markdown и HTML.

`stage-report.json` содержит:

- краткий semantic summary;
- outcome/verdict;
- acceptance/evidence refs;
- changed project paths;
- checks/receipts;
- next directive;
- mechanical timing/Git/work/session aggregates.

Stage-specific renderer не создаётся. HTML использует один протестированный
template; после schema validation отдельный DOM smoke на каждый отчёт не
требуется.

`stage-report.md` является человекочитаемым отчётом стадии. Отдельный
RUN-local `summary.md` не создаётся. Durable
`.memory-bank/protocol/<PRT>/summary.md` — другая сущность: она обновляется
только когда меняется durable protocol meaning, а не автоматически на каждом
stage finish.

Все CLI-owned JSON/text writes используют один atomic write helper. Append-only
timeline/log writes являются явным исключением.

## 17. Сессии, usage и timeline

Агент не считает usage и tool calls. Runtime/controller связывает provider
JSONL с зарегистрированными Session и сохраняет источник каждого наблюдения:

- `session_id`, provider/model;
- source path/type;
- observed/checkpoint timestamp;
- input tokens;
- cache-read input tokens;
- cache-write input tokens, если provider сообщает;
- reasoning tokens;
- output tokens;
- tool-call count и optional breakdown, если он детерминированно доступен.

Если одна Session проходит несколько стадий/Work, stage/Work usage считается
дельтой между trusted checkpoints. Сумма дельт не может превышать финальный
validated session total. После завершения всех активных turns controller может
пересчитать точные RUN totals по всем связанным Session. До этого Work/stage
finish возвращает честный provisional/unavailable verdict, не ноль.

Если provider считает cache-read частью input, runtime хранит raw input и
вычисляет `uncached_input = max(input - cache_read, 0)`. Reasoning хранится
отдельно для анализа, но не прибавляется второй раз к output/total, если
provider уже включает его в output. Формулы и provider semantics записываются
в usage adapter; разные представления не смешиваются молча.

Wall-clock стадии и Work вычисляется только по lifecycle timestamps. Сумма
длительностей параллельных child Work не подменяет фактический wall-clock RUN.

`timeline.jsonl` всегда включён и получает короткие безопасные structured
events с timestamp, RUN, optional Work/Stage/Session refs и status. Full prompt,
transcript, tool output, token payload и secrets в timeline не записываются.
Длинная deterministic операция пишет bounded progress в `stderr`/event stream,
чтобы controller не принимал её за зависание и не запускал дубликат.

## 18. Snapshots и eval

Snapshot manifest фиксирует:

- RUN/project/root Work identity;
- flow/engine/pack pair;
- source commit/workspace route;
- stage checkpoint;
- checksums переносимых artifacts;
- canonical/start-session IDs, которыми управляет dd-eval.

Restore:

- копирует RUN/project fixture в новый eval workspace;
- создаёт новый RUN identity, если это требуется сценарием;
- переписывает только typed structured DB/path fields;
- сохраняет `run://` и repository-relative refs без изменений;
- заново рендерит будущие prompts/context;
- не выполняет global text replacement в historical reports/evidence.

Judge/golden data получают logical refs и checksums, а не machine absolute
paths. Dashboard/artifact collector разрешает ссылки через общий resolver и
stage catalog.

Абсолютная копия provider runtime, OS и registry не требуется. Eval сохраняет
версию flow/engine pair и достаточные checkpoint artifacts для практической
воспроизводимости.

## 19. Worktree ownership и cleanup

Управляемый workspace удаляется только по зарегистрированной ownership record
и после realpath/containment/Git guards. Имя папки или prefix не является
доказательством владения.

- удаление RUN artifacts не подразумевает удаление project worktree;
- удаление worktree не удаляет RUN evidence;
- cleanup знает `run_root`, `workspace_root` и internal checkout ownership, а не четыре
  исторических RUN path fields;
- completed/archived RUN retention задаётся eval/project policy;
- attempts, Work results и receipts принадлежат RUN и удаляются вместе с ним;
- secrets никогда не копируются вне project-owned Worktrunk bootstrap policy.

## 20. Schema ownership и engine pair

Flow pack является SSOT JSON Schema, prompts, stage catalog и report template.
Runtime содержит точный bundled snapshot выбранного pack или читает immutable
snapshot из engine binding.

Beta build:

1. собирает schema/prompt/catalog manifest;
2. копирует exact snapshot в engine artifact;
3. записывает hashes в pair manifest;
4. запускает parity test;
5. запрещает arbitrary project/home fallback при отсутствии схемы.

CODE-REVIEW schemas и все другие stage-visible contracts обязаны находиться в
flow pack. Одноимённые несовпадающие схемы блокируют beta release.

## 21. Нормативные инварианты

Реализация обязана проверять:

1. Ровно один root Work на RUN.
2. `WRK-*` уникален в `DD_FLOW_HOME`.
3. Все Work принадлежат RUN; Work с собственным artifact packet
   материализуется под `RUN/works`.
4. Parent terminal только без незавершённых child Work.
5. `depends_on` допускает start только после completed predecessors.
6. Parent/dependency refs не пересекают RUN; у Work не больше одной active
   Session link.
7. Overlapping write scopes не исполняются конкурентно без явной безопасной
   policy.
8. RUN terminal только при terminal root и закрытом Work graph.
9. У RUN нет authoritative single `current_stage`.
10. Stage directory/result разрешаются одним catalog.
11. Один `run.json`; нет `work.json`, `run-index`, `JOB` projection или
   `variables.json`.
12. Stage/Memory Bank semantic artifact не копируется целиком в SQLite; Work
   task/result принадлежат runtime SQLite и имеют файловую проекцию.
13. Все persisted project paths repository-relative; RUN refs используют
    `run://`.
14. Reviewer local finding ID scoped source Work.
15. `CHK` и `RCP` не пересекаются по смыслу; checkout не использует `CHK`.
16. Raw intake не копируется в PRT.
17. Snapshot не переписывает произвольный текст.
18. Cleanup удаляет workspace только по ownership record.
19. Flow pack и engine schema hashes совпадают.
20. Pause/resume не завершает Stage и не создаёт attempt.
21. Reports рендерятся детерминированно из schema-valid JSON.
22. Agent не передаёт mechanical IDs, timestamps, usage или transitions.

## 22. Пакет реализации

### Phase A — contract cut

Flow pack:

- добавить SPC-009 и связать его из engineering/dd-flow indexes;
- определить единый stage catalog и vNext Flow graph;
- обновить `entity-ids`, `flow-runs`, `runtime-contract`, `workspace-layout`,
  `worker-session` и `flow-flags`;
- обновить schemas/examples для RUN, Work, findings, receipts, reports и
  snapshots;
- перенести CODE-REVIEW schemas из engine в flow pack;
- обновить prompts без старых `JOB`, `try-*`, глобальных finding IDs и
  свободных filesystem paths.

До runtime cutover machine `flow-contract.json` не помечается совместимым с
новым engine. Частичный contract release запрещён.

### Phase B — runtime foundations

dd-flow-cli:

- ввести shared stage catalog reader;
- сделать `WRK` allocator global-home scoped;
- заменить generic `id` явными именами;
- добавить shared atomic writer и path/reference module;
- свести RUN storage к `run_root`;
- обновить SQLite schema для stage visits, run variables и time-bounded
  session links; удалить публичную Turn/work-session identity;
- удалить legacy JOB/flow_jobs vNext path и `work.json` projection;
- материализовать `works/<WRK>` без `try-001`;
- удалить reset-style `work retry` из vNext;
- реализовать aggregate RUN state и root Work terminalization.

### Phase C — stage integration

- SPECIFY: raw intake только RUN, `R/AC` owner refs;
- PROTOCOLIZE: runtime-owned shelves/paths, без raw intake copy;
- PLAN: PRT plan остаётся file SSOT; batch детерминированная проекция;
- PLAN-REVIEW/CODE-REVIEW: local finding IDs + canonical refs;
- CODE: `CHK -> RCP`, Work-local evidence, repair context;
- MERGE: terminal root Work, workspace ownership/cleanup и final RUN result;
- все stages: общий report renderer, context/commands из stage start.

### Phase D — snapshots, cleanup and views

- structured snapshot restore без global text rewrite;
- dashboard resolver по stage catalog и logical refs;
- cleanup по internal checkout ownership;
- stats/usage по RUN/Work/Session без model-authored counters;
- удалить старые reader/fallback/aliases и неприменимые tests.

### Phase E — coordinated beta release

- обновить flow-contract/compatibility/pair manifest одной согласованной парой;
- создать свежий beta `DD_FLOW_HOME`; старый beta runtime не мигрировать;
- пересоздать canonical/start eval checkpoints;
- пройти focused lifecycle/materialization tests;
- провести полный E2E с defect logging и judge;
- переносить в dd-memorybank canon только после принятого beta eval.

### Change matrix

| Surface | Current owner/files | Required change |
|---|---|---|
| Vocabulary and IDs | flow pack `common/entity-ids.md`; runtime `services/ids.ts` | scopes, global WRK, local owner refs, CHK/RCP split, explicit response field names |
| Flow/stage catalog | flow definitions; `stage-lifecycle.ts`; every `vnext-*` module | one ordered catalog for directories, schemas, results and legal transitions |
| RUN persistence | `storage/database.ts`, `runs.ts`, `run-projection.ts` | `run_root`, aggregate status, stage visits, variables, compact works; remove duplicate path/state fields |
| Work registry | `work-registry.ts` | atomic claim, same-RUN edges, active-link invariant, RUN-root artifact packets, no reset retry/work.json |
| Session/hook | `hooks.ts`, `sessions.ts`, Work binding | canonical argv fingerprint, time-bounded links, separate parent session, explicit agent/model facts, idempotency |
| Paths | `storage/paths.ts`, projects/branch/schema/permission/cleanup/snapshot helpers | one canonical resolver and portable `run://` contract |
| Intake/doc shelves | SPECIFY/PROTOCOLIZE prompts and services | RUN-only raw intake; engine-owned EP/FT/SPC/ADR/SCN/DEF/PRT paths |
| Plan/CODE graph | PLAN schemas/service, generated batch, Work scheduler | retain plan file SSOT, deterministic batch, situational Work projection, dependency/write-scope guards |
| Checks/evidence | `code-checks.ts`, CODE/CODE-REVIEW schemas/services | CHK declarations, Work-local RCP receipts/logs, origin-linked repair packets |
| Reviews | PLAN-REVIEW/CODE-REVIEW schemas/prompts/services | local FIND keys, canonical refs, immutable evidence and two-phase decision/repair finish |
| Reports | duplicated stage `writeReport`/HTML code | one JSON contract plus deterministic Markdown/HTML renderer |
| Snapshots/eval | `eval-snapshots.ts`, dd-eval checkpoint/artifact/judge code | structured relocation, logical refs, fresh checkpoints and new assertions |
| Cleanup/dashboard/stats | cleanup, dashboard, usage/stat services | ownership-based deletion and catalog/ref-driven views from SQLite |
| Contract distribution | flow pack schemas, engine bundled schemas, pair manifest | exact snapshot/hash parity and no fallback lookup |

### Cutover order and rollback

1. Commit the DRAFT contract/navigation without changing executable
   compatibility.
2. Implement flow-pack schemas/catalog/prompts and engine foundations on the
   existing beta branches.
3. Run unit/contract tests against a fresh temporary `DD_FLOW_HOME`.
4. Build one immutable engine/flow pair and only then bump beta compatibility.
5. Create a new beta home/checkpoints; retain old eval reports only for
   comparison, not as runtime input.
6. Run focused diagnostics, then full E2E/judge.
7. If material defects remain, publish no canonical release; fix the same beta
   pair and regenerate affected checkpoints.

Rollback is pair-level: select the previous tagged engine/flow pair together
with its previous beta home/checkpoints. Mixing a previous engine with the new
layout or adding a compatibility reader is forbidden.

## 23. Проверки

Минимальный обязательный набор:

- schema parity/hash test flow pack ↔ engine;
- one-root/global-WRK/all-children-terminal DB invariant tests;
- Work dependency/paused/resume/root completion tests;
- atomic single-claim, same-RUN edge and write-scope scheduling tests;
- stage catalog coverage test для всех команд и каталогов;
- canonical path, symlink escape и case behavior tests;
- exact materialization tree snapshot test;
- no-JOB/no-work.json/no-run-index projection test;
- local finding scoping/duplicate/repair tests;
- CHK declaration/RCP receipt tests;
- deterministic JSON → Markdown/HTML renderer golden test;
- structured eval snapshot restore test с текстом, содержащим старый путь;
- cleanup ownership and containment tests;
- intake retention test, запрещающий raw PRT copy;
- pause/resume test, подтверждающий отсутствие stage finish/attempt;
- idempotent standalone start/finish hook fingerprint test;
- session checkpoint delta/final usage reconciliation test;
- two-phase finish `action_required -> completed` test;
- E2E `SPECIFY → PROTOCOLIZE → PLAN → PLAN-REVIEW → CODE → CODE-REVIEW →
  MERGE` с проверкой terminal root Work и RUN.

## 24. Что сознательно оставляем без изменения

- Flow остаётся небольшим графом стадий и actions; новый универсальный DSL не
  проектируется.
- SQLite остаётся mechanical SSOT; semantic plan и stage results остаются
  файлами.
- Existing Work dependency graph и one-wave-first routing сохраняются.
- Hook остаётся механизмом trusted Session binding; публичный `--session-id`
  агенту не возвращается.
- Worktrunk остаётся единственным владельцем создания feature worktree.
- Capacity probe остаётся harness operation без регистрации probe Work/Session.
- JSON, Markdown и HTML отчёты всегда генерируются; switches не возвращаются.
- Eval checkpoints сохраняют практическую, а не абсолютную воспроизводимость.

## 25. Условия принятия

Пакет принят, когда:

1. active beta docs, schemas, prompts и engine реализуют одну модель без
   legacy/fallback путей;
2. свежий RUN имеет только каноническую структуру;
3. CLI status/work/stat/dashboard дают согласованную картину из SQLite;
4. stage и Work lifecycle проходит полный E2E без ручного исправления state;
5. snapshots/checkpoints восстанавливаются без переписывания смыслового текста;
6. reviewers могут независимо использовать `FIND-001`, а coordinator/repair
   однозначно адресуют находки;
7. final merge закрывает root Work и RUN, не оставляя активных children;
8. beta judge не выявляет material identity, path, lifecycle, projection или
   evidence defects;
9. только после этого пакет готовится к переносу в канон и release.
