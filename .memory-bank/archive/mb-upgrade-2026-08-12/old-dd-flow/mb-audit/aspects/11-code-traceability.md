# Аспект: трассировка кода

## Цель

Проверить, что публичные кодовые границы и значимые модули связаны с реализуемыми specs/features/epics/protocols/scenarios/ADR через project coding standards.

## Нормативная база

- `.memory-bank/mbb/aspects/12-code-traceability.md`
- `.memory-bank/mbb/coding-standards-guide.md`
- `.memory-bank/mbb/code-contracts-guide.md`
- `.memory-bank/mbb/cross-references.md`

## Что читать в проекте

- project coding standards;
- публичные entrypoints, CLI commands, API clients, schemas, UI screens and pipeline modules;
- JSDoc/TSDoc/docstrings and nearby docs links;
- related specs/features/epics/protocols/scenarios/ADR.

## Что проверять

- code docs do not invent links, but important public boundaries are traceable;
- references point to durable docs, not only `.tasks` or temporary run artifacts;
- implementation files changed by recent protocols have expected doc tags or explicit not-applicable rationale;
- tests/scenarios/evidence are linked from the relevant durable docs.

## Какие `DEF-*` создавать

Группа: `CODE`.

Создавай `DEF-*`, если отсутствие code traceability мешает future agent work, verification, ownership or safe refactor.
