# Линт Банка памяти

Прочитай общие правила:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/memorybank-git.md`
- `.memory-bank/dd-flow/common/closure.md`

Затем прочитай в MBB:

- `.memory-bank/mbb/index.md`
- `.memory-bank/mbb/memory-bank-structure.md`
- `.memory-bank/mbb/frontmatter-standards.md`
- `.memory-bank/mbb/cross-references.md`
- `.memory-bank/mbb/named-deferrals-guide.md`
- `.memory-bank/mbb/code-contracts-guide.md`
- `.memory-bank/mbb/mb-lint-guide.md`

## Язык пользовательских артефактов

Сразу после чтения `common/style.md` зафиксируй `target_language`: язык текущего пользовательского prompt-а, если пользователь явно не попросил другой язык. Все пользовательские ответы, lint summaries, итоговый отчёт, dashboard-и и curated summaries пиши на `target_language`.

Raw JSON output, rule ids, code identifiers и HTML/CSS/JS шаблоны могут оставаться английскими. Если raw output показывается пользователю напрямую, добавь пользовательский пересказ на `target_language`.

Твоя задача - запустить или спланировать детерминированную проверку Банка памяти через `mb-lint`.

Запиши compact start trace по `common/trace.md`. Если lint запускается внутри активного протокола и доступен `dd-flow` CLI, зарегистрируй `flow_kind: memory_flow`, `continuation_policy: memory_flow`, `current_stage: mb_lint`, `next_action: run deterministic memory bank lint`. Если lint является отдельным read-only исследованием без протокола, можно использовать `research_no_protocol` или только файловый trace в `.tasks/dd-flow-trace/`.

`mb-lint` не является аудитом. Он не решает, хороша ли архитектура и верна ли продуктовая логика. Он проверяет только то, что можно проверить формально: структура, ссылки, frontmatter, идентификаторы, достижимость, открытые `DEF-*`, кодовые ссылки из JSDoc/TSDoc/docstrings.

## Запуск

Если пакет доступен, используй:

```bash
npx @deksden-com/mb-lint@latest --root . --format json
```

Если проект использует локальную версию, команду из проектной документации или `package.json`, предпочти локальную команду.

Если рядом с проектом есть локальная разработческая версия, можно использовать:

```bash
node ../mb-lint/dist/cli.js --root . --format json
```

Не используй старое имя пакета `@deksden.com/mb-lint`: опубликованный npm-пакет называется `@deksden-com/mb-lint`.

Если `mb-lint` ещё не установлен и пакет недоступен, не считай это провалом проекта. Доложи, что инструмент пока отсутствует, и предложи зафиксировать проверку как будущий шаг. В протоколах вроде `mb-upgrade` недоступность `mb-lint` должна оформляться как `DEF-*` с понятным следующим gate, а не как успешная проверка.

## Что проверять

Ожидаемые классы правил:

- наличие корневого `index.md` и `structure.md`;
- соответствие структуры канонической карте;
- достижимость активных документов из индексов;
- битые Markdown-ссылки;
- обязательные поля frontmatter;
- уникальность `id`;
- согласованность статуса документа с его местом;
- открытые `DEF-*` без владельца, причины, следующего gate или контекста продолжения;
- активные документы не ссылаются на `.tasks/...`, если `.tasks/` игнорируется Git;
- сценарии, протоколы и матрицы проверки не используют `.tasks/...` как evidence после закрытия работы и ссылаются на паспорт проверки, когда закрывают gate;
- ссылки из `@doc`, `@feature`, `@scenario`, `@adr`, `@spec` на существующие документы;
- Markdown-гигиена, включая trailing spaces.

## Что не проверять через lint

Не пытайся решать через `mb-lint`:

- правильность архитектурного решения;
- полноту эпика или фичи;
- качество текста;
- актуальность документа по смыслу;
- необходимость включить практику в канон.

Эти вопросы относятся к `mb-audit`, `mb-distill` или обычному ревью.

## Кандидаты в будущие правила

Если во время любой работы найдено правило, которое можно проверять без рассуждений модели, оформи `lint-candidate` в lessons learned, insights или отчёте проверки:

```text
lint-candidate:
  rule_id:
  observation:
  why_deterministic:
  positive_example:
  negative_example:
  source:
```

Кандидат полезен только если ясно, почему проверка детерминированная. Например, "ссылка из `@feature` должна вести в существующий файл" - хороший кандидат. "Фича плохо описана" - не lint-кандидат, а тема для аудита.

## Отчёт

Доложи:

- навигационный блок из `.memory-bank/dd-flow/common/style.md`: `prompt: mb-lint.md`, протокол или `protocol: not_created`, текущая стадия, следующий шаг, блокеры и активные `DEF-*`;
- где записаны `trace_start` и `trace_report`;
- какая команда запускалась;
- на какой ветке и commit;
- какие классы ошибок найдены;
- что можно исправить автоматически;
- что требует `mb-fix`;
- что требует смыслового `mb-audit`;
- какие новые `lint-candidate` появились.
