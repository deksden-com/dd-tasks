---
file: '.memory-bank/mbb/code-contracts-guide.md'
description: 'Canonical guide for executable code contracts such as api-contract, client-sdk, ui-contract, event contracts, and scenario contracts.'
purpose: 'Read when deciding whether a contract should live only in documentation or also be represented in code, schemas, packages, or generated artifacts.'
version: '0.4.0'
date: '2026-06-30'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
related_files:
  - .memory-bank/mbb/glossary.md
  - .memory-bank/mbb/client-surfaces.md
  - .memory-bank/mbb/ui-layer-guide.md
  - .memory-bank/mbb/coding-standards-guide.md
  - .memory-bank/mbb/ai-runtime-prompt-architecture.md
  - .memory-bank/mbb/cross-references.md
tags: [mbb, code-contracts, api-contract, client-sdk, ui-contract, schemas, automation]
history:
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Added executable contract policy for code, docs, tests, and automation.'
  - version: '0.2.0'
    date: '2026-05-13'
    changes: 'Уточнены тонкий SDK-фасад, кодовый UI-контракт и compatibility-only ledger.'
  - version: '0.3.0'
    date: '2026-06-18'
    changes: 'Added contract propagation review expectations across code, schemas, tests, docs, Memory Bank and interacting systems.'
  - version: '0.4.0'
    date: '2026-06-30'
    changes: 'Added selective code-to-Memory-Bank traceability expectations for public/significant contract boundaries.'
---

# Кодовые контракты

## Зачем нужны кодовые контракты

Документ объясняет смысл. Кодовый контракт делает границу исполнимой.

Если границу используют несколько подсистем, клиентов, тестов или сценариев, одного markdown часто недостаточно. Нужна схема, тип, пакет или другой исполнимый артефакт, который можно импортировать, проверить и использовать в автоматизации.

Кодовый контракт нужен не потому, что "так архитектурнее". Он нужен, когда ошибка в договоренности дорого стоит: GUI вызывает не ту операцию, CLI иначе нормализует ошибку, сценарий ищет не тот экран, подсистема публикует событие не той формы.

## Что является кодовым контрактом

Типовые примеры:

- `api-contract` - операции, схемы входа/выхода, ошибки;
- `client-sdk` - клиентская программная граница;
- `ui-contract` - экраны, секции, стабильные идентификаторы, automation mapping;
- `event-contract` - события между подсистемами;
- `domain-contract` - статусы, состояния, переходы;
- `scenario-contract` - формат сценариев, фаз, артефактов, verdict;
- `fixture-contract` - формат seed-данных и фикстур.

Контракт может быть пакетом, модулем, схемой, набором типов или генерируемым артефактом. Важно, чтобы он был потребляемым и проверяемым.

## Чем кодовый контракт НЕ является

Кодовый контракт:

- не является полной реализацией бизнес-логики;
- не является документацией вместо Memory Bank;
- не является местом для временных удобных helper-ов;
- не является дублированием DTO без владельца;
- не должен становиться вторым приложением.

Например, `client-sdk` может нормализовать транспорт и ошибки, но не должен сам решать продуктовые правила, если эти правила принадлежат серверу или доменному слою.

## Когда нужен кодовый контракт

Создавай или выделяй кодовый контракт, если:

- границу потребляют два или более клиента;
- контракт нужен тестам или сценариям;
- контракт должен быть стабилен между пакетами или репозиториями;
- по контракту строится автоматизация;
- есть риск расхождения UI, CLI, API и сценариев;
- нужно типизировать ошибки, статусы, события или screen ids;
- контракт является платформенным или продуктово-общим слоем.

Не создавай отдельный контракт, если:

- это локальная функция внутри одного модуля;
- нет второго потребителя;
- контракт пока гипотетический;
- документ и тесты уже достаточно защищают маленькую границу.

## Связь с Memory Bank

Memory Bank должен отвечать:

- кто владеет контрактом;
- где он живет в коде;
- какие подсистемы потребляют;
- какие сценарии проверяют;
- какие ADR объясняют выбор;
- какие совместимые старые поверхности остаются;
- когда контракт можно менять.

Кодовый контракт должен ссылаться обратно на документы через JSDoc/docstrings там, где это полезно.

Для публичных или значимых контрактных границ doc links считаются частью traceability, если они помогают понять владельца и правило:

- `@docs` or `@spec` for normative contract owner;
- `@adr` for decision rationale;
- `@feature` for delivered capability/value;
- `@protocol` for execution/remediation trace;
- `@scenario` for reproducible acceptance;
- `@evidence` for proof passport.

Не ставь все tags автоматически. Контрактная граница должна ссылаться на минимальный набор документов, который реально нужен следующему разработчику или агенту.

Если контракт меняется, review обязан проверить propagation:

- кодовый владелец и все code consumers;
- схемы, типы, generated artifacts and examples;
- unit/integration/e2e/scenario checks;
- CLI/TUI/GUI/MCP/SDK surfaces;
- Memory Bank specs, ADR, guides, protocol summaries and cross-references;
- interacting systems or downstream projects.

Неполный propagation нельзя прятать в общем тексте. Если его нельзя завершить сейчас, оформи `DEF-*` с точным `next_gate`, owner, affected surfaces and context for follow-up.

Пример:

```ts
/**
 * Stable screen ids and automation-facing selectors for the governed admin UI.
 *
 * @docs memory-bank/ui/screen-registry.md
 * @docs memory-bank/ui/automation/test-id-registry.md
 * @feature memory-bank/plans/epics/EP-XXX-<slug>/features/FT-XXX-YY-<slug>.md
 * @protocol memory-bank/protocol/PRT-XXX-<slug>.md
 * @scenario memory-bank/scenarios/XE-004-admin-workflow.md
 */
export const screenRegistry = [...]
```

## Контракт интерфейса

`ui-contract` - частный случай кодового контракта.

Он нужен, если GUI/TUI должен быть управляемым программно:

- сценарии должны открывать экраны;
- автоматизация должна находить секции и действия;
- тесты должны проверять устойчивые идентификаторы;
- документация должна совпадать с реальными surface id.

Минимум:

- screen ids;
- section ids;
- action ids;
- stable test ids или TUI node ids;
- mapping на page/screen objects;
- связь с экранными спецификациями.

Без такого контракта UI-автоматизация обычно начинает зависеть от случайного текста, порядка элементов и верстки.

Зрелый `ui-contract` должен связывать не только селекторы, но и смысл:

- экранный идентификатор;
- маршрут или способ открытия;
- корневой selector;
- секции;
- высокоуровневые действия;
- допустимые состояния;
- связь с объектной моделью страницы или экрана;
- статус совместимости для legacy-селекторов.

Если `ui-contract` существует в коде, Memory Bank не должен дублировать его полный массив. Документация объясняет правила, владельцев и смысл, а кодовый контракт хранит исполнимые значения.

## Контракт клиентского слоя

Целевая модель:

```text
серверные операции / прикладной контракт
-> client SDK
-> CLI / TUI / GUI / MCP / scenario runner
```

Правила:

- CLI, TUI, GUI, MCP и сценарные раннеры используют SDK;
- SDK скрывает транспорт и нормализует ошибки;
- UI не обходит SDK ради прямого вызова серверной операции;
- CLI является опорной поверхностью для быстрой проверки SDK;
- сценарии могут проверять логику через SDK/CLI, а интерфейс - отдельным тонким слоем.

Это снижает риск, что разные клиенты начнут реализовывать одну и ту же клиентскую логику по-разному.

Если есть платформенный SDK и продуктовый SDK, продуктовый SDK должен быть тонким фасадом:

- может добавлять продуктовый контекст, авторизацию, поверхность источника (source surface), идентификаторы запроса и корреляции (request/correlation id) и нормализацию ошибок;
- не должен копировать платформенные объекты передачи данных (DTO), схемы и валидацию;
- не должен становиться вторым платформенным SDK;
- не должен позволять GUI/CLI обходить фасад прямыми транспортными вызовами, если фасадный метод уже есть.

## Совместимость и устаревшие контракты

Если старый контракт остается временно, он должен быть классифицирован:

- `compatibility_only` - оставлен только для старых потребителей;
- `read_only_compatibility` - можно читать, но нельзя развивать;
- `write_compatibility` - запись еще нужна, но имеет явный срок или gate;
- `retired` - не используется и должен быть удален;
- `blocked_retirement` - удаление заблокировано внешней причиной.

Для каждого совместимого остатка нужно указать:

- владелец;
- причина сохранения;
- целевая замена;
- trigger удаления;
- сценарий или evidence, который подтвердит безопасное удаление.

### Compatibility-only ledger

Если старые операции, селекторы, команды или DTO остаются временно, проекту полезен журнал совместимости (compatibility-only ledger).

Это не то же самое, что именованное отложение. Именованное отложение (`DEF-*`) фиксирует незакрытую работу или gate. Журнал совместимости фиксирует разрешенную временную поверхность, которой нельзя пользоваться как целевой в новых фичах.

Минимальные поля:

- legacy id/name;
- тип: operation, selector, command, DTO, route, table;
- владелец;
- целевая замена;
- причина сохранения;
- ограничение: read-only, write-compatible, diagnostic-only;
- retirement milestone;
- доказательство, что новые фичи используют целевой путь.

Журнал совместимости нужен, когда старое нельзя удалить сразу, но важно не дать ему снова стать активной архитектурой.

## Проверки

Проект может проверять кодовые контракты автоматически:

- схемы операций совпадают с SDK;
- UI screen ids есть и в документации, и в коде;
- `data-testid` зарегистрированы;
- GUI не делает прямые вызовы API при наличии SDK;
- event payload соответствует схеме;
- сценарные артефакты соответствуют scenario contract;
- deprecated operation не используется в новых фичах.

Такие проверки лучше вводить постепенно: сначала предупреждения, затем обязательный gate для новых изменений.
