---
file: 'memory-bank/spec/engineering/coding-standards.md'
description: '<Project coding standards for maintainable, agent-friendly implementation.>'
purpose: '<Read before coding or reviewing changes so file structure, contracts, tests, and documentation links follow project rules.>'
version: '0.2.0'
date: '2026-06-30'
status: 'DRAFT'
c4_level: 'standard'
parent: 'memory-bank/spec/engineering/index.md'
related_files:
  - memory-bank/spec/engineering/jsdoc-docstrings.md
  - memory-bank/spec/engineering/testing-strategy.md
tags: [engineering, coding-standards]
history:
  - version: '0.2.0'
    date: '2026-06-30'
    changes: 'Aligned public API doc-link examples with epics feature paths and protocol traceability.'
---

# Coding Standards

## Purpose

Какие проблемы решает этот стандарт в проекте.

Например:

- не плодить файлы-монолиты;
- не смешивать доменную логику, транспорт, данные и UI;
- сделать код удобным для людей и ИИ-агентов;
- связать публичные границы кода с Memory Bank.

## Project Baseline

- Language/runtime:
- Package manager:
- Module format:
- Type checking:
- Formatter/linter:
- Test runner:

## File Size And Decomposition

Рекомендуемые ворота внимания:

```text
до 250 строк:
250-500 строк:
500-800 строк:
800+ строк:
```

Исключения:

- generated files;
- fixtures;
- snapshots;
- large declarative tables with one responsibility.

## Module Boundaries

Правила:

- где живет доменная логика;
- где живут адаптеры;
- где живут DTO/contract mappings;
- где живет UI/view model;
- что нельзя импортировать напрямую.

## Public API And Documentation Links

Какие файлы или функции обязаны иметь JSDoc/docstrings:

- package entrypoints;
- SDK methods;
- operation handlers;
- domain policies;
- event contracts;
- scenario runners.

Формат ссылок:

```ts
/**
 * <Responsibility.>
 *
 * @docs memory-bank/spec/system/<area>/contract.md
 * @adr memory-bank/adr/ADR-XXX-<slug>.md
 * @spec memory-bank/spec/system/<area>/contract.md
 * @feature memory-bank/epics/EP-XXX-<slug>/features/FT-XXX-YY-<slug>/index.md
 * @protocol memory-bank/protocol/PRT-XXX-<slug>.md
 * @scenario memory-bank/scenarios/SCN-XXX-<slug>.md
 */
```

## Error Handling

- Категории ошибок:
- Что нельзя маскировать:
- Как передаются request/correlation ids:
- Что нельзя логировать:

## Tests And Verification

- Unit:
- Integration:
- E2E:
- Scenario:
- Required local commands:

## Agent Coding Rules

- Что агент должен читать перед изменениями:
- Какие write scopes типичны:
- Какие forbidden scopes важны:
- Когда агент должен остановиться и открыть вопрос:
- Какие проверки запускать перед отчетом:

## Anti-patterns

- Монолитные файлы без ясной ответственности.
- `utils` как свалка продуктовой логики.
- GUI/TUI/CLI обходят клиентский SDK.
- Ошибки превращаются в пустой успех.
- Публичный контракт меняется без Memory Bank и тестов.
