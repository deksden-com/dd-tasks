---
file: '.memory-bank/mbb/spec-layer-guide.md'
description: 'Canonical guide for the normative spec layer: product, system, engineering, and operations.'
purpose: 'Read when structuring project specifications so product value, system architecture, engineering discipline, and rollout operations have clear homes.'
version: '0.2.0'
date: '2026-06-30'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
related_files:
  - .memory-bank/mbb/glossary.md
  - .memory-bank/mbb/memory-bank-structure.md
  - .memory-bank/mbb/c4-model.md
  - .memory-bank/mbb/coding-standards-guide.md
  - .memory-bank/mbb/operations-release-guide.md
  - .memory-bank/mbb/code-contracts-guide.md
tags: [mbb, spec, product, system, engineering, operations, architecture]
history:
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Added the four-part normative spec model for product, system, engineering, and operations.'
  - version: '0.2.0'
    date: '2026-06-30'
    changes: 'Replaced spec/features slicing guidance with plans/epics feature records plus durable spec/sub-spec companions and protocol sets.'
---

# Слой спецификаций

## Зачем нужен этот слой

Банк памяти должен отвечать не только на вопрос "какую фичу делаем", но и на более устойчивые вопросы:

- что это за продукт и для кого он существует;
- как устроена система;
- по каким инженерным правилам мы пишем код;
- как мы выкатываем, проверяем и откатываем изменения.

Эпики и фичи описывают доставку ценности. Они не должны становиться главным местом архитектуры, стандартов кода или правил релиза. Для этого нужен нормативный слой `spec/`.

Слово "нормативный" здесь означает: документ описывает то, что должно оставаться истинным после закрытия конкретной волны работ. Если протокол нашел новое долговечное правило, оно должно быть поднято в `spec/`, `adr/`, `scenarios/`, `ui/` или `guides/`, а не остаться только в рабочем следе.

## Четыре верхних контура

Рекомендуемая структура:

```text
memory-bank/spec/
├── product/
├── system/
├── engineering/
└── operations/
```

Эти четыре контура не являются единственно возможной архитектурой документации. Они выбраны потому, что хорошо разделяют четыре разных типа знания, которые часто смешиваются:

- продуктовую истину;
- устройство системы;
- правила разработки;
- правила эксплуатации и релиза.

Если проект уже использует `docs/product`, `docs/architecture`, `docs/engineering`, это допустимо. Но смысловые границы должны быть такими же ясными.

## `spec/product/`

`spec/product/` отвечает на вопрос: "что это за продукт, кто им пользуется и какие продуктовые смыслы нельзя потерять?"

Здесь живут:

- акторы и роли;
- продуктовые термины;
- доменные сущности в пользовательском смысле;
- области ценности;
- продуктовые инварианты;
- правила, которые объясняют, почему система ведет себя именно так для пользователя или бизнеса.

Чем не является:

- не является дорожной картой;
- не является журналом фич;
- не является технической архитектурой;
- не является пользовательской инструкцией.

Пример: "Рабочее пространство" как понятие клиента и команды может жить в `spec/product/`, а его таблицы, события и API-контракты - в `spec/system/`.

## `spec/system/`

`spec/system/` отвечает на вопрос: "как система устроена и почему код организован именно так?"

Здесь живут:

- C4 L1/L2/L3;
- подсистемы и контейнеры;
- компоненты;
- контракты между подсистемами;
- доменная модель в техническом смысле;
- состояния и переходы;
- протоколы взаимодействия;
- связи с ADR;
- implementation links на код и тесты.

Чем не является:

- не является списком задач;
- не является протоколом реализации;
- не является пересказом кода;
- не является местом для точных деталей, которые уже надежно выражены в коде и тестах.

Практическое правило: `spec/system/` объясняет границы, инварианты и связи. Код остается источником точного поведения.

## `spec/engineering/`

`spec/engineering/` отвечает на вопрос: "как мы пишем и меняем код в этом проекте?"

Здесь живут:

- стандарты кодирования;
- правила размера файлов и декомпозиции;
- правила модулей, импортов, ошибок и логирования;
- JSDoc/docstring policy;
- тестовая стратегия;
- правила агентной разработки;
- локальные команды качества;
- политика кодовых контрактов.

Чем не является:

- не является документацией продукта;
- не является списком текущих задач;
- не является заменой линтера или форматтера;
- не является местом для вкусовых споров без влияния на поддержку системы.

Инженерные правила нужны не ради бюрократии. Они уменьшают вероятность того, что человек или агент внесет изменение в неправильный слой, раздует файл-монолит или обойдет контракт.

## `spec/operations/`

`spec/operations/` отвечает на вопрос: "как изменение проходит путь от ветки до работающей системы?"

Здесь живут:

- git flow;
- ветки и pull request;
- окружения;
- beta/prod политика;
- деплой;
- release policy;
- rollout runbook;
- rollback runbook;
- evidence policy для релизов;
- правила работы с секретами, миграциями и внешними провайдерами.

Верхнеуровневая карта этих правил и их связи с engineering, scenarios, seed/evals, UI/client surfaces and dd-flow automation живёт не здесь, а в корневом `project-policy.md`. `spec/operations/` остаётся владельцем подробных operational policy/runbook документов.

Чем не является:

- не является обычным README по запуску проекта;
- не является историей одного релиза;
- не является заменой протокола конкретной волны;
- не является списком ручных команд без критериев успешности.

Операционный слой нужен потому, что "код собрался" не равно "система принята". Интеграционная ветка, beta-окружение, сценарии приемки и rollback-возможность являются частью результата.

## Связь с планами доставки

`plans/` и `spec/` отвечают на разные вопросы.

```text
plans/epics + features
  -> что доставляем и кому это нужно

spec/product + system + engineering + operations
  -> какие правила и устройство должны оставаться истинными
```

Фича может ссылаться на несколько спецификаций. Например:

- `spec/product/actors.md` - кто пользуется результатом;
- `spec/system/workspaces/contract.md` - какую подсистему меняем;
- `spec/engineering/coding-standards.md` - какие правила разработки применяются;
- `spec/operations/release-policy.md` - нужен ли beta gate.

Фича не должна копировать эти документы. Она должна показать, какие источники правды прочитаны и как результат будет проверен.

## Связь с ADR

ADR отвечает на вопрос: "почему мы выбрали этот путь?"

Spec отвечает: "какой путь теперь является нормой?"

Пример:

```text
adr/ADR-012-client-sdk-boundary.md
  -> почему CLI/TUI/GUI/MCP идут через клиентский SDK

spec/system/client-boundary.md
  -> как этот SDK устроен и какие подсистемы его используют

spec/engineering/coding-standards.md
  -> какие правила не дают UI обойти SDK
```

Если в спецификации появляется большая секция "альтернативы и почему отвергли", это кандидат на ADR.

## Связь с протоколами

Протокол на этапе реализации может временно держать много знания: план, решения, отчеты, проверки, отложения.

Но после закрытия долговечное знание должно быть поднято:

- продуктовая модель -> `spec/product/`;
- устройство системы -> `spec/system/`;
- инженерные правила -> `spec/engineering/`;
- релизные правила -> `spec/operations/`;
- причины выбора -> `adr/`;
- проверяемые пути -> `scenarios/`;
- пользовательские инструкции -> `guides/`;
- интерфейсные контракты -> `ui/`.

Если это не сделать, следующий агент будет читать протокол как единственный источник правды, хотя протокол был только интегратором конкретной волны.

## Спецификации для объёма из нескольких протоколов

Иногда пользователь описывает работу, которая важна как единый замысел, но слишком велика для одного исполняемого протокола. В этом случае не создавай зонтичный `PRT-*`: протокол должен оставаться SDLC-документом, который реально пройдёт `specify -> plan -> code -> merge`.

Для общего объёма используй сочетание feature records, durable specs/sub-specs and protocol set.

Capability/value layer:

```text
plans/epics/EP-XXX-<slug>/
  index.md
  features/
    FT-XXX-YY-<slug>.md
```

Durable design companions:

```text
spec/product/<topic>.md
spec/system/<topic>.md
spec/engineering/<topic>.md
spec/operations/<topic>.md
```

Protocol coordination:

```text
protocol/_set/PSET-XXX-<slug>.md
protocol/PRT-XXX-<slice>.md
```

Feature records описывают what value/capability is delivered and accepted. Specs describe the stable system/product/engineering/operations norms. Protocol set describes how executable protocols relate, which protocols are blocked, and which can run in parallel.

Исходный пользовательский ввод дословно сохраняется рядом с source protocol or protocol set, обычно:

```text
protocol/PRT-XXX-<slug>/intake/user-input.md
```

Curated context discovery, если он нужен до протокола, должен быть поднят в профильный spec/protocol artifact and linked from the protocol. Не складывай сырые scratch-логи в active Memory Bank.

Каждый executable protocol, созданный из такого объёма, должен ссылаться через frontmatter на применимые:

```text
protocol_set
blocked_by_protocols
related_epics
related_features
related_specs
related_adrs
related_scenarios
source_user_input
```

Если slice относится к пользовательской ценности, предпочитай вертикальный срез: одна цель, один основной сценарий приемки, собственные проверки и минимальный достаточный diff. Foundation, migration и hardening slices допустимы, если они прямо нужны для последующих вертикальных срезов и это обосновано в protocol set or companion spec.

## Минимальный набор для зрелого проекта

Для зрелого проекта рекомендуется иметь:

```text
spec/product/index.md
spec/product/actors.md
spec/product/glossary.md
spec/system/index.md
spec/system/system-c4.md
spec/system/subsystems.md
spec/engineering/index.md
spec/engineering/coding-standards.md
spec/engineering/jsdoc-docstrings.md
spec/engineering/testing-strategy.md
spec/operations/index.md
spec/operations/git-flow.md
spec/operations/release-policy.md
spec/operations/rollout-runbook.md
```

Проект может начинать с меньшего набора. Важно не количество файлов, а то, чтобы будущий разработчик или агент понимал: где продуктовая истина, где системная архитектура, где инженерные правила, где релизный порядок.
