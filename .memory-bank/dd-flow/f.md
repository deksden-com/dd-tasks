# Фаза f: compatibility alias для priming

`f.md` сохранён как короткий совместимый вход для старых команд и ссылок. Новое каноническое имя priming prompt-а - `.memory-bank/dd-flow/prime.md`.

Выполни `.memory-bank/dd-flow/prime.md` и в докладе явно укажи:

- `prompt: f.md -> prime.md`;
- `current_stage: primed`;
- `protocol: not_created`, если пользователь не выбрал существующий протокол.

Не запускай task intake, `protocol.md`, `specify`, `plan` или `code` только потому, что был вызван `f.md`.

## Минимальные правила совместимости

Перед делегированием в `prime.md` прочитай общие правила:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/memorybank.md`

Затем прочитай в Банке памяти:

- `.memory-bank/index.md`
- `.memory-bank/structure.md`, если есть
- `.memory-bank/mbb/index.md`
- `.memory-bank/mbb/memory-bank-structure.md`
- `.memory-bank/mbb/indexing-guide.md`
- `.memory-bank/mbb/frontmatter-standards.md`
- `.memory-bank/mbb/cross-references.md`

## Язык пользовательских артефактов

Сразу после чтения `common/style.md` зафиксируй `target_language`: язык текущего пользовательского prompt-а, если пользователь явно не попросил другой язык. Все пользовательские ответы, priming summaries и trace reports, которые читаются пользователем, пиши на `target_language`.

Внутренние raw notes, JSON keys, code identifiers и HTML/CSS/JS шаблоны могут оставаться английскими. Если внутренний материал показывается пользователю напрямую, синтезируй или переведи пользовательский слой на `target_language`.

Твоя задача - подготовить контекст, а не начинать реализацию.

Если доступен `dd-flow` CLI и это заметный read-only вход в проект без активной задачи, зарегистрируй session по `common/runtime-cli.md` как `flow_kind: research_no_protocol`, `continuation_policy: none`, `current_stage: priming`. Если CLI недоступен, укажи `runtime_cli_degraded` в итоговом докладе; ручной trace не создавай.

Разберись:

- где в проекте находятся основные источники правды;
- какие разделы Банка памяти существуют и за что отвечают;
- где описаны активные планы, спецификации, сценарии, интерфейс, эксплуатация и правила MBB;
- какие документы нужно читать для будущих вопросов пользователя.

Вернись с коротким докладом:

- навигационный блок из `.memory-bank/dd-flow/common/style.md`: `prompt: f.md`, `protocol: not_created`, `current_stage: primed`, `completed_stage: priming`, следующий шаг и блокеры;
- какие CLI/runtime artifacts доступны и почему ручной trace не создавался;
- что является главным входом в проект;
- какие ключевые разделы Банка памяти ты увидел;
- где искать продуктовые, системные, инженерные и эксплуатационные правила;
- каких важных документов не хватает, если это видно уже на входе.

После этого жди конкретной задачи.
