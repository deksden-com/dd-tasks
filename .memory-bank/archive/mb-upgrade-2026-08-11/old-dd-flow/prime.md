# Prime: первичная подготовка сессии

Этот prompt выполняет priming новой агентной сессии: читает основные индексы Memory Bank, формирует верхнеуровневую эрудицию о проекте и возвращается к пользователю без создания протокола.

Flow origin policy: `project_local`.

`prime.md` больше не делает task intake, не выбирает `flow_profile`, не создаёт `PRT-*` и не переводит задачу в solution space. Для материализации обсуждения в протокол используй `protocol.md`; для уточнения задачи перед планированием - логическую стадию `specify`.

Если в этой же сессии пользователь уже говорит "оформи протокол" / "пропиши протокол" / "сделай протокол" / "создай протокол", priming не заканчивается сам по себе: после прайминга нужно немедленно прочитать и выполнить `protocol.md`, а не пытаться оформить протокол вручную в `prime.md`.

## Что прочитать сначала

Прочитай:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/flow-origin.md`
- `.memory-bank/dd-flow/index.md`
- `.memory-bank/dd-flow/common/lifecycle-guards.md`
- `.memory-bank/dd-flow/common/post-flow-protocol-reminder.md`
- `.memory-bank/index.md`
- `.memory-bank/structure.md`, если есть
- `.memory-bank/project-policy.md`, если есть
- `.memory-bank/mbb/index.md`
- `.memory-bank/mbb/memory-bank-structure.md`
- `.memory-bank/mbb/indexing-guide.md`
- `.memory-bank/mbb/frontmatter-standards.md`
- `.memory-bank/mbb/cross-references.md`

Если пользователь просит дополнительно прогреть конкретный контур, прочитай только релевантные документы: продукт, систему, инженерные правила, UI, сценарии, эксплуатацию, релизы, deploy или конкретный модуль.

## Язык пользовательских артефактов

Сразу после чтения `common/style.md` зафиксируй `target_language`: язык текущего пользовательского prompt-а, если пользователь явно не попросил другой язык. Все priming summaries и trace reports, которые читаются пользователем, пиши на `target_language`.

Внутренние raw notes, JSON keys, code identifiers и HTML/CSS/JS шаблоны могут оставаться английскими. Если внутренний материал показывается пользователю напрямую, синтезируй пользовательский слой на `target_language`.

## Цель priming

Сформировать у агента контекст:

- где находится главный индекс Memory Bank;
- какие слои знаний есть в проекте;
- где искать продуктовые, системные, инженерные, UI, сценарные и эксплуатационные правила;
- какие top-level project policies влияют на route.git, проверки, evidence, delivery, release/deploy/publish и обслуживание Банка памяти;
- какие `dd-flow` entry prompts доступны, какие predecessor gates у `protocol/specify/plan/code/merge` и какой следующий шаг безопасен;
- какие активные протоколы, DEF или важные документы видны уже на входе;
- какие контуры нужно изучить глубже, если пользователь попросил focused warmup.

Priming не должен:

- создавать новый `PRT-*`;
- задавать specification-вопросы по задаче;
- выбирать `route.planning`;
- запускать `plan`, `code`, `merge`, release, deploy или publish;
- менять проектные файлы, кроме trace/session артефактов.

## Рабочий след

По умолчанию `prime.md` не создаёт runtime session, не регистрирует flow stage и не пишет project state. Priming похож на `fix-def` по механике: агент прогревает контекст и возвращается к пользователю, а runtime появляется только после явного flow/protocol/task.

Если пользователь явно просит диагностический/onboarding trace, или если нужно доказательно исследовать проблему с самим Memory Bank/runtime, можно зарегистрировать read-only session по `common/runtime-cli.md`:

```yaml
flow_kind: research_no_protocol
continuation_policy: none
current_stage: priming
next_action: wait_for_task_or_protocol
```

В обычном priming отчёте укажи:

```text
protocol: not_created
runtime_state: not_created
```

Если явный diagnostic/onboarding trace всё же создан, запиши compact start trace по `common/trace.md`, используй временный trace в `.tasks/dd-flow-trace/` and explain why runtime trace was created.

## Доклад пользователю

Вернись с коротким докладом:

- `prompt: prime.md`;
- `protocol: not_created`, если пользователь не выбрал существующий протокол;
- `runtime_state: not_created`, если не было явного diagnostic/onboarding trace request;
- `current_stage: primed`;
- `completed_stage: priming`;
- следующий безопасный шаг: свободное обсуждение, `protocol.md`, `interactive.md`, focused warmup или исследовательский ответ без протокола;
- где лежат trace start/report;
- главный вход Memory Bank;
- ключевые разделы Memory Bank;
- `project_policy: read | missing`;
- `flow_catalog: read`;
- `protocol_literacy: protocol/specify/plan/code/readiness/merge order understood`;
- где искать правила по продукту, системе, инженерии, UI, сценариям и операциям;
- важные пробелы, если они видны уже на входе.
- `policy_context_seed`: какие policy sources уже видны для будущего SDLC run (`project-policy`, `spec/operations`, verification/scenario/DEF layers), и какие отсутствуют или не применимы.

После priming жди конкретной задачи или обсуждения. Если из обсуждения появляется первичная формулировка задачи, предложи оформить протокол через `protocol.md`. Если пользователь уже прямо просит оформить/прописать/сделать протокол, сразу переходи в `protocol.md`.
