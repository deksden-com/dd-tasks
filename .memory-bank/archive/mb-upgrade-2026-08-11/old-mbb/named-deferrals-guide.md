---
file: '.memory-bank/mbb/named-deferrals-guide.md'
description: 'Canonical guide for named deferrals: explicit deferred work with owner, reason, gate, and blocking scope.'
purpose: 'Read when closing protocols, features, scenarios, or releases with known gaps so deferred work stays honest and actionable.'
version: '0.5.0'
date: '2026-07-07'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
related_files:
  - .memory-bank/mbb/delivery-docs-guide.md
  - .memory-bank/mbb/operations-release-guide.md
  - .memory-bank/mbb/code-contracts-guide.md
  - .memory-bank/mbb/templates/protocol.md
tags: [mbb, deferrals, closure, evidence, protocol, delivery]
history:
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Added named deferral taxonomy and closure rules.'
  - version: '0.2.0'
    date: '2026-05-13'
    changes: 'Уточнено различие между именованным отложением и compatibility-only поверхностью.'
  - version: '0.3.0'
    date: '2026-05-13'
    changes: 'Добавлены поля origin, context_for_followup, user_blocker, fixability и правила закрытия DEF в фазе readiness.'
  - version: '0.4.0'
    date: '2026-06-15'
    changes: 'Уточнены BLOCK/DEF/not_applicable правила для SDLC контуров и memory flows.'
  - version: '0.5.0'
    date: '2026-07-07'
    changes: 'Added .memory-bank/defs as canonical durable project-wide DEF registry and clarified promotion/linking rules.'
---

# Именованные отложения

## Зачем это нужно

Именованное отложение превращает "потом доделаем" в проверяемое обязательство.

Без этого закрытие работы становится мутным:

- код вроде готов, но beta не проверена;
- UI есть, но сценарий не запущен;
- старая совместимость осталась, но непонятно почему;
- внешний провайдер недоступен, но это нигде не видно;
- production заблокирован, но фича помечена как завершенная.

Именованное отложение фиксирует разрыв честно: что именно не закрыто, почему допустимо продолжить, что оно блокирует и какой следующий gate.

## Формат

Рекомендуемый идентификатор:

```text
DEF-<AREA>-<SHORT-SLUG>
DEF-PRT012-SCN222-LIVE-PROOF
DEF-UI-PROTECTED-BROWSER-PROOF
DEF-OPS-NORMAL-PACKAGE-SOURCE
```

Минимальные поля:

- id;
- краткое описание;
- тип;
- причина;
- владелец;
- происхождение: протокол, фаза, задача, файлы или отчёт, где возникло отложение;
- контекст для follow-up: что уже сделано, что проверено, какие документы, код, команды и evidence важны;
- пользовательский блокер: требуется ли решение пользователя, какой вопрос, варианты и рекомендация;
- ремонтопригодность: можно ли пытаться закрыть сейчас, ожидаемый размер, нужен ли отдельный follow-up протокол;
- что не блокирует;
- что блокирует;
- следующий gate;
- ссылка на фичу, протокол, сценарий или релиз;
- дата пересмотра или условие пересмотра.

Расширенный шаблон:

```yaml
id: DEF-<AREA>-<SHORT-SLUG>
type: verification_blocker
severity: medium
reason: <why the gap exists>
owner: <role/person/agent>
origin:
  protocol: memory-bank/protocol/PRT-XXX.md
  phase: code/implement | code/readiness | merge/integrate | other
  task: .tasks/<task-folder>/<task-or-report>.md # only while local working artifacts exist
  files:
    - <path>
context_for_followup:
  summary: <short context for a future agent>
  why_deferred: <why it was not closed immediately>
  already_done:
    - <work already completed>
  already_checked:
    - <checks already run>
  required_docs:
    - <doc path>
  required_code_paths:
    - <code path>
  relevant_commands:
    - <command>
  evidence_so_far:
    - <artifact or result>
user_blocker:
  required: false
  question: null
  options: []
  recommendation: null
fixability:
  can_attempt_now: true
  expected_effort: small | medium | large
  requires_followup_protocol: false
does_not_block:
  - <gate/scope>
blocks:
  - <gate/scope>
next_gate: <specific gate>
related_files:
  - <path>
```

## Типы

Рекомендуемая таксономия:

- `code_blocker` - код небезопасен или неполон; закрывать нельзя;
- `documentation_blocker` - активные документы вводят в заблуждение; закрывать нельзя, если это влияет на работу;
- `verification_blocker` - реализация есть, но обязательная проверка еще не выполнена;
- `operations_blocker` - не готов deploy, secret, migration, backup, rollback или окружение;
- `safe_named_deferral` - пункт осознанно вне текущей волны и не блокирует заявленный scope;
- `external_dependency` - ждём внешнее окружение, провайдера, доступ, ревью или пакет.

Тип нужен не для отчетности, а для решения: можно ли закрыть текущую работу и какой gate остается.

## Когда применять

Применяй именованное отложение, если:

- нет доступа к beta/prod окружению;
- нет внешнего аккаунта, секрета, провайдера или данных;
- часть работы сознательно исключена из текущей волны;
- совместимый старый путь остается до отдельной миграции;
- проверка невозможна сейчас, но должна блокировать следующий этап;
- production нельзя делать без отдельного approval.

Для SDLC контуров сначала классифицируй отсутствие или неопределённость:

- `not_applicable`: контур действительно не нужен для проекта или текущей волны, причина записана;
- `question`: пользовательское решение нужно до честного плана;
- `BLOCK-*`: текущий gate нельзя проходить;
- `DEF-*`: текущий gate можно пройти, но future gate должен увидеть и закрыть проблему.

Не создавай `DEF-*` на каждую отсутствующую deploy/release policy в маленьком локальном проекте. Создавай `DEF-*`, когда отсутствие влияет на активные документы, выбранный gate, сценарии, evidence, будущий merge/release/deploy или работу следующих агентов.

Если отложение зависит от пользователя, явно заполни `user_blocker`. Пользователь снимает такие блокеры выбором, доступом, секретом, приоритетом, решением по scope или подтверждением внешнего действия.

Если пользователь не нужен, не формулируй вопрос "на всякий случай". Укажи `user_blocker.required: false` и оставь закрытие агенту или follow-up протоколу.

Не применяй, если:

- это просто баг, который ломает заявленную фичу;
- нет причины не исправить сейчас;
- отложение скрывает отсутствие обязательной документации;
- пункт блокирует основной пользовательский путь текущей поставки;
- никто не понимает следующий gate.

## Отличие от compatibility-only

Именованное отложение и совместимая устаревшая поверхность решают разные задачи.

`DEF-*` отвечает:

> Что мы сознательно не закрыли сейчас, почему это допустимо и какой следующий gate?

`compatibility_only` отвечает:

> Какая старая операция, команда, таблица, DTO или selector временно остается, чем она заменяется и почему новые фичи не должны использовать ее как целевую?

Если старый путь остается и блокирует приемку, нужен `DEF-*`.

Если старый путь остается только для совместимости, но текущая работа может быть принята через новый путь, нужен журнал совместимости (compatibility-only ledger), описанный в [Code Contracts Guide](code-contracts-guide.md).

Иногда нужны оба:

- `compatibility_only` описывает старый selector или operation id;
- `DEF-*` описывает gate, после которого этот старый путь должен быть удален.

## Пример

```yaml
id: DEF-UI-PROTECTED-BROWSER-PROOF
type: verification_blocker
reason: Нет работающего beta authority и scenario auth данных.
owner: qa/ops
does_not_block:
  - local code closure
  - SDK and CLI verification
blocks:
  - beta acceptance
  - production promotion
next_gate: Запустить SCN-222 с scenario auth и browser proof на beta.
related_files:
  - protocol/PRT-012-platform-adoption.md
  - scenarios/SCN-222-hosted-auth.md
```

Такой блок показывает, что локальная работа может быть принята, но beta и production еще нет.

## Связь с closure state

Закрытие должно различать:

- `completed` - все обязательные gates закрыты;
- `accepted_local` - локальный scope принят, внешние gates не заявлялись;
- `implemented_with_named_deferrals` - реализация принята, но есть явно названные отложения;
- `follow_up_needed` - работа полезна, но есть существенные продолжения;
- `blocked` - текущий scope нельзя закрыть.

Фраза "готово, кроме..." должна быть заменена на один из этих статусов и список `DEF-*`.

## Разбор в фазе readiness

Readiness gate должна не только перечислить оставшиеся `DEF-*`, но и попытаться закрыть всё, что можно закрыть сейчас.

Порядок:

1. Найти все открытые `DEF-*` в протоколе, `.tasks/`, матрице проверки, сценариях и operations-документах.
2. Сгруппировать по блокирующему gate: merge, beta, production, scenario, documentation, follow-up.
3. Отделить пользовательские блокеры от инженерных.
4. Для закрываемых `DEF-*` сформировать план закрытия через внутренний prompt `def/plan.md`.
5. Выполнить закрытие через внутренний prompt `def/fix.md`.
6. Обновить статус каждого `DEF-*`.
7. Пользователю докладывать только реальные блокеры, особенно те, где требуется его решение.

Если `DEF-*` требует отдельной работы, создай follow-up протокол `PRT-XXX-DEF-YYY-<slug>.md` или аналогичный проектный документ. Он должен ссылаться на исходный протокол, фазу, задачу, сам `DEF-*`, связанные документы, кодовые пути и уже выполненные проверки.

## Где хранить

Канонический долговечный проектный слой:

- `memory-bank/defs/index.md` or `.memory-bank/defs/index.md`;
- `memory-bank/defs/DEF-<AREA>-<SLUG>.md`.

Используй этот слой для `DEF-*` / `DEF-MBU-*`, которые должны быть видны будущим flow вне текущего протокола.

Для конкретной волны:

- в протоколе;
- в closure report;
- в verification matrix, если отложение влияет на приемку;
- в scenario doc, если отложение относится к запуску сценария;
- в operations/release docs, если отложение влияет на beta/prod.

Долговечные отложения не должны жить только в `.tasks/`. Если `DEF-*` или его контекст должны пережить текущий запуск агента, подними их в `.memory-bank/defs/DEF-*.md` или свяжи из `.memory-bank/defs/index.md`, если тело DEF по ясной причине остается в другом активном долговечном документе: `protocol/<PRT-ID>/`, `plans/`, `scenarios/`, `spec/operations/` или другом профильном разделе. Активные документы не должны требовать `.tasks/...` как обязательный источник, если `.tasks/` игнорируется Git.

`defs/index.md` должен помогать будущему агенту решить, что обсуждать и что блокирует gate. Минимальные группы: requires user decision, blocks current work, blocks merge, blocks release/deploy/production, agent-fixable, external gate/access required, follow-up/non-blocking, stale/duplicate/suspected closed, closed/rejected/superseded.

## Учёт в обычных flow

Обычные task flows обязаны читать активные `DEF-*` уже при анализе пользовательской задачи и сборе проектного контекста, а затем повторно учитывать их перед выбором маршрута, реализацией, readiness или merge. DEF - это не архивная заметка, а известная нерешённая задача, незакрытое решение или входное ограничение проекта.

Минимальное правило:

- `prime` учитывает DEF при выборе flow profile and gates;
- `plan` учитывает DEF как ограничения, blockers, follow-up scope or closure candidates;
- `code` пытается закрыть relevant DEF или честно отражает их в readiness;
- `merge` не проходит gate, если relevant DEF блокирует текущий integration contour;
- `mb-audit` инвентаризирует existing DEF, проверяет их качество и не создаёт дубли.
- `mb-init` и `mb-upgrade` оформляют значимые unknowns как `DEF-MBI-*` / `DEF-MBU-*`, если их нельзя закрыть сейчас и они влияют на активный Memory Bank или будущий flow.
- `mb-distill` не превращает политику одного проекта в канон без указания applicability and evidence.

Если DEF не относится к текущей задаче, его не нужно чинить механически. Но при нетривиальном flow агент должен понимать, почему DEF не влияет на текущий gate.

Если DEF влияет на понимание пользовательской хотелки, scope, delivery route, сценарии или evidence, агент должен вынести это в раннее обсуждение с пользователем. Нельзя откладывать такой выбор до конца работы, если без него план может оказаться нечестным.

## Правило пересмотра

Каждое именованное отложение должно иметь следующий gate.

Плохая формулировка:

- "доделать позже";
- "когда будет время";
- "после релиза".

Хорошая формулировка:

- "перед beta acceptance";
- "перед production promotion";
- "после появления published package";
- "после получения sandbox provider account";
- "в протоколе PRT-XXX".

Если gate наступил, отложение нужно либо закрыть, либо повысить до блокера, либо пересогласовать.
