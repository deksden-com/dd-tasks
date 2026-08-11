# Аспекты аудита Банка памяти

Этот каталог содержит модульные аспекты для `mb-audit.md`. Главный промпт выбирает нужные аспекты, создаёт по ним задачи в `.tasks/`, запускает субагентов и собирает ремонтные `DEF-*`.

Эти файлы являются аудитными адаптерами поверх канонической библиотеки `.memory-bank/mbb/aspects/`. Если меняется смысл области знания, сначала обновляй `mbb/aspects/`, а здесь меняй только аудитные проверки, recommended sets и output.

Итоговый выбор аспектов всегда фиксируется в `audit-selection.md`: selected aspects получают task/report, skipped aspects получают явную причину. Рекомендуемые наборы ниже являются входом для выбора, а не неявным результатом.

Active `DEF-*`/`DEF-MBU-*` всегда входят в контекст аудита. Даже если аудит выбран узким, `audit-selection.md` должен показать, какие DEF найдены и какие selected/skipped аспекты отвечают за их проверку. Быстрый аудит минимум проверяет DEF через `09-operations-release-deferrals.md`; delivery/evidence DEF дополнительно требуют `04-delivery-docs.md` или `06-scenarios-evidence-runners.md`, если это важно для вопроса пользователя.

## Flow-owned route adapter (PRT-336)

Решение фиксируется как `self_check_allowed`, `group_allowed` или
`keep_separate`: `self_check` применяется только к selection/preflight/coverage
и report consistency. `grouped_subagent` разрешён исключительно для четырёх наборов
ниже и только на одном immutable read-only snapshot; во всех остальных случаях
выбирай `focused_subagent`/`keep_separate`.

| Group | Allowlisted aspects |
| --- | --- |
| `structure_and_truth` | `01`, `02`, `03` |
| `delivery_and_system` | `04`, `05`, `06` |
| `surface_and_operations` | `07`, `08`, `09` |
| `lifecycle_and_agents` | `10`, `11`, `12` |

Не группируй aspects с write/mutation/recheck, critical or privileged evidence,
hard predecessor или отдельным trust boundary. `requires_output_of` открывает
следующую wave только после принятого output; `related_to`/`informed_by` —
информационные связи без сериализации. Group report обязан сохранять отдельные
coverage row, findings, verdict, evidence, limitations и candidate DEF list на
каждый aspect.

## Карта аспектов

- [Шаблон аспекта](00-aspect-template.md): формат для новых аспектов аудита.
- [Структура и индексы](01-structure-and-indexes.md): вход в Банк памяти, `structure.md`, локальные индексы, достижимость активных документов.
- [Ссылки, frontmatter и трассировка](02-links-frontmatter-traceability.md): связи между документами, metadata, кодом, сценариями и доказательствами.
- [Источники истины, дубли и актуальность](03-ssot-duplicates-actuality.md): единый источник истины, конфликты, устаревшие активные документы, расхождение с кодом.
- [Эпики, фичи, протоколы и матрицы проверки](04-delivery-docs.md): доставка ценности, вертикальные фичи, протокол как временный интегратор, проверяемое закрытие.
- [Система, C4, ADR и контракты](05-system-adr-contracts.md): C4-уровни, подсистемы, контракты, архитектурные решения (ADR), границы слоёв.
- [Сценарии, доказательства и раннеры](06-scenarios-evidence-runners.md): исполнимые сценарии, seed-данные, фикстуры, evidence и scenario runner.
- [Интерфейс и пользовательская документация](07-ui-and-guides.md): слой интерфейса (UI), экранные контракты, дизайн-система, Diátaxis-документация.
- [Инженерные стандарты и кодовые контракты](08-engineering-code-contracts.md): стандарты кодирования, client SDK, code contracts, JSDoc/TSDoc/docstrings.
- [Операции, релизы и открытые отложения](09-operations-release-deferrals.md): поток Git (git flow), окружения, beta/production, rollout, rollback, `DEF-*`.
- [Жизненный цикл памяти](10-memory-lifecycle.md): archive, stale knowledge, durable promotion, freshness and DEF discoverability.
- [Трассировка кода](11-code-traceability.md): code doc-tags, public boundaries, durable doc links and verification trace.
- [Навыки и инструкции агентов](12-agent-skills.md): project skills, prompt/tool guidance, model profiles and flow-policy alignment.

## Рекомендуемые наборы

### Быстрый аудит

Запускай, когда нужно понять, не расползся ли Банк памяти:

- `01-structure-and-indexes.md`
- `02-links-frontmatter-traceability.md`
- `03-ssot-duplicates-actuality.md`
- `09-operations-release-deferrals.md`, только блок открытых `DEF-*`
- `10-memory-lifecycle.md`, только discoverability active/stale/DEF

### Полный аудит

Запускай после крупного изменения канона, миграции проекта или перед большой чисткой:

- все аспекты `01`-`12`

### Аудит перед релизом

Запускай, когда важно доказать готовность к интеграции, beta или production:

- `02-links-frontmatter-traceability.md`
- `04-delivery-docs.md`
- `06-scenarios-evidence-runners.md`
- `09-operations-release-deferrals.md`
- `11-code-traceability.md`, если релиз включает публичные code/API/CLI boundaries

### Аудит после эпика

Запускай, когда нужно разнести долговечные выводы после большой поставки:

- `03-ssot-duplicates-actuality.md`
- `04-delivery-docs.md`
- `05-system-adr-contracts.md`
- `06-scenarios-evidence-runners.md`
- `07-ui-and-guides.md`, если был пользовательский путь или интерфейс
- `08-engineering-code-contracts.md`, если менялись кодовые границы
- `10-memory-lifecycle.md`
- `11-code-traceability.md`, если менялся код

### Аудит интерфейса

Запускай для GUI/TUI/CLI-поверхностей и пользовательских путей:

- `02-links-frontmatter-traceability.md`
- `06-scenarios-evidence-runners.md`
- `07-ui-and-guides.md`
- `08-engineering-code-contracts.md`
- `11-code-traceability.md`

## Правило выбора

Не запускай полный аудит по инерции. Полный аудит полезен, когда цена пропуска выше цены проверки. В остальных случаях выбирай минимальный набор аспектов, который отвечает на вопрос пользователя.
