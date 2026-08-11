# Аудит Банка памяти

Flow origin policy: `project_local`.

Сначала прочитай `.memory-bank/dd-flow/common/flow-origin.md` и проверь `.memory-bank/dd-flow/manifest.json`, если он есть. `mb-audit` работает из project flow pack целевого проекта. Если pack manifest отсутствует или не валидируется, зафиксируй `project_flow_pack_degraded`; продолжай только если локальные support-файлы `mb-audit` и MBB доступны.

Прочитай общие правила:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/flow-origin.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/sdlc-contours.md`
- `.memory-bank/dd-flow/common/policy-presets.md`
- `.memory-bank/dd-flow/common/memorybank-write-preflight.md`
- `.memory-bank/dd-flow/common/memorybank-git.md`
- `.memory-bank/dd-flow/common/workspace-bootstrap.md`
- `.memory-bank/dd-flow/common/subagents.md`
- `.memory-bank/dd-flow/common/memory-flow-subagents.md`
- `.memory-bank/dd-flow/common/closure.md`

После чтения `common/runtime-cli.md` выполни CLI version preflight, если CLI доступен: `dd-flow status --project-root "$target_project_root" --json`. `mb-audit` read-only, поэтому `outdated` обычно warning-only; `incompatible` должен быть отражён как degraded runtime evidence и может стать `DEF-MBA-FLOW-PACK-*`, если мешает корректно оценить drift/runtime state.

Затем прочитай в MBB:

- `.memory-bank/mbb/index.md`
- `.memory-bank/mbb/aspects/index.md`
- `.memory-bank/mbb/aspects/00-aspect-contract.md`
- `.memory-bank/mbb/memory-bank-structure.md`
- `.memory-bank/mbb/indexing-guide.md`
- `.memory-bank/mbb/frontmatter-standards.md`
- `.memory-bank/mbb/cross-references.md`
- `.memory-bank/mbb/named-deferrals-guide.md`

## Язык пользовательских артефактов

Сразу после чтения `common/style.md` зафиксируй `target_language`: язык текущего пользовательского prompt-а, если пользователь явно не попросил другой язык. Все пользовательские ответы, audit selection для пользователя, итоговый отчёт, summaries, dashboard-и и curated summaries пиши на `target_language`.

Внутренние aspect task packets, aspect reports, raw evidence, JSON keys, code identifiers и HTML/CSS/JS шаблоны могут оставаться английскими. Если внутренний материал показывается пользователю напрямую, синтезируй или переведи пользовательский слой на `target_language`.

Субагентов использовать разрешено и для выбранных audit aspects это нормальный путь. Каждый выбранный аспект аудита должен получить task packet и report; если аудит сознательно узкий или субагенты технически недоступны, зафиксируй selection/degraded mode по `common/memory-flow-subagents.md`.

## Version And Drift Inventory

`mb-audit` read-only. Он не обновляет version markers и не переписывает manifest.

Перед выбором аспектов сними version/drift inventory:

- canonical source, если доступен: resolved canon root, `VERSION`, commit, flow contract;
- project Memory Bank: `.memory-bank/index.md` `memory_bank_version`, fallback `.memory-bank/mbb/index.md` canonical version text, legacy `memory-bank/**`;
- project flow pack: `.memory-bank/dd-flow/manifest.json` `schema_id`, `pack_version`, `source_commit`, `canon_version_at_source_commit`, `flow_contract`;
- active canonical-only files under `.memory-bank/dd-flow/`;
- `dd-flow status --project-root "$target_project_root" --json`, если CLI доступен.

В `audit-selection.md` и итоговом отчёте покажи drift verdict:

- `same`: no action;
- `behind`: recommend canonical `mb-upgrade`;
- `missing`: recommend `mb-init` or `mb-upgrade` depending on project state;
- `invalid`: recommend marker/manifest repair before upgrade;
- `unknown`: show reason and exact next diagnostic step.

Если meaningful drift найден, но audit не должен его чинить, создай `DEF-MBA-VERSION-*` или `DEF-MBA-FLOW-PACK-*` с clear gate scope вместо того, чтобы оставлять проблему только в тексте отчёта.

Если `dd-flow status` или runtime inventory показывает active legacy lifecycle states (`ready_for_merge`, `queued_for_merge`, `integration`, `blocked`, `waiting_for_user`), audit описывает их как finding/input evidence, но не мигрирует. Отчёт должен различать:

- normalized `lifecycle` state, если CLI его отдаёт;
- raw compatibility fields (`stage`, `current_stage`, `raw_stage`, `raw_status`, `job`);
- resource coordination state (`queue_item`, `claim`, lane lock, waiter).

Если эта смесь мешает честно оценить Memory Bank, создай `DEF-MBA-RUNTIME-*` или `DEF-MBA-FLOW-PACK-*` и рекомендуй canonical `mb-upgrade`. Не исправляй runtime rows в `mb-audit`.

Твоя задача - провести управляемый аудит Банка памяти. Аудит не исправляет документы молча. Он находит проблемы, проверяет их по нормативной базе MBB и проектному контексту, затем создаёт ремонтные задачи `DEF-*`, которые позже может обработать `mb-fix`.

`mb-audit` использует каноническую библиотеку аспектов `.memory-bank/mbb/aspects/` в режиме `audit/analyse`. Файлы `.memory-bank/dd-flow/mb-audit/aspects/` являются аудитными адаптерами: они задают набор проверок, но не меняют смысл областей знания.

`DEF-*` в рамках аудита - это ремонтная задача обслуживания Банка памяти. Она живёт в `<run-dir>/02-audit/defs/` как рабочий артефакт аудита. Если проблема оказывается долговечным блокером проекта, её нужно позже поднять в правильный раздел Банка памяти по правилам MBB.

`mb-audit` обязан учитывать уже существующие активные `DEF-*`/`DEF-MBU-*`, а не только создавать новые. Перед выбором аспектов выполни active DEF preflight из `common/memorybank.md` и создай краткую inventory-секцию в `audit-selection.md`:

- какие active DEF найдены;
- какие аспекты должны их проверить;
- какие DEF выглядят stale/malformed/duplicate;
- какие DEF могут блокировать release, merge, scenario, evidence или documentation gates.

Аудит не закрывает DEF молча. Он проверяет качество существующих DEF: owner, reason, blocking scope, next gate, close condition, evidence and visibility from active indexes. Если DEF корректен и не относится к выбранному scope, не создавай дубль. Если DEF некорректен, создай ремонтный `DEF-MBA-DEFERRALS-*` или включи finding в аспект `09-operations-release-deferrals.md` / `04-delivery-docs.md`.

Если доступен `dd-flow` CLI, зарегистрируй memory flow session по `common/runtime-cli.md`: `flow_kind: memory_flow`, `continuation_policy: memory_flow`, `current_stage: mb_audit`, `next_action`: выбранный audit mode или следующий aspect.

Создай или найди `RUN-*` по `common/flow-runs.md`. Для `mb-audit` используй stage layout: `01-preflight-read/`, `02-audit/`, `03-report/`. Аудит read-only по активным документам, но его отчёты/DEF должны быть discoverable через `run-index.json` и итоговый summary.

В `<run-home>/01-preflight-read/workspace-bootstrap-receipt.md` запиши `bootstrap_not_required` с причиной `read_only_audit`, если выбранные аспекты используют только read-only/file/runtime inspection. Если позже выбранный аспект требует project-owned tooling, exemption заканчивается: до команды produce/revalidate receipt по `common/workspace-bootstrap.md` для фактического checkout и отрази status в итоговом summary. Не устанавливай project dependencies только для обычного аудита.

Режим Git: `read_only_audit`. Проверь состояние Git до старта и зафиксируй его в `<run-dir>/03-report/summary.md`. Не меняй активные документы Банка памяти в рамках `mb-audit`.

До чтения и выбора аспектов выполни read-only preflight из `common/memorybank-write-preflight.md`:

```bash
dd-flow memory permissions preflight --root . --memory-bank .memory-bank --tasks .tasks --flow mb-audit --mode read --json
```

Этот gate проверяет, что Банк памяти можно читать, но не требует `.tasks` write access. Перед созданием `<run-dir>`, reports, `DEF-MBA-*`, dashboard или evidence выполни второй gate:

```bash
dd-flow memory permissions preflight --root . --memory-bank .memory-bank --tasks .tasks --flow mb-audit --mode report_only --json
```

Если второй gate заблокирован, можно дать пользователю read-only финальный отчёт в ответе, но нельзя заявлять, что `.tasks`/DEF/dashboard evidence были сохранены.

## Вход в контекст

Сначала найди корень Банка памяти проекта:

- `.memory-bank/`;
- `memory-bank/`;
- другой путь, если проект явно использует его.

Прочитай:

- главный индекс Банка памяти;
- `structure.md`, если есть;
- проектный `mbb/index.md`;
- канонический индекс аспектов `mbb/aspects/index.md`;
- релевантные проектные правила, на которые указывают индекс и структура;
- индекс аспектов `.memory-bank/dd-flow/mb-audit/aspects/index.md`;
- выбранные файлы аспектов из `.memory-bank/dd-flow/mb-audit/aspects/`.

Также найди активные DEF по правилам `common/memorybank.md`: active protocol, `defs/`, verification matrix, scenarios, operations/release docs, closure reports and профильные индексы.

Если аудит включает operations/release/delivery scope, оцени SDLC contours отдельно: Git, environment/stage, release, deploy/publish, verification, check profiles and runbooks. Отсутствующий контур является finding только если он должен быть применим по проектным источникам или влияет на gate; иначе фиксируй `not_applicable`/`out_of_scope`, а не создавай шумный DEF.

Для check profiles аудит должен показать, где в проекте определено "зелёное" состояние ветки или stage-а: команды, CI jobs, manual checks, target environment and evidence. Если утверждения о готовности ветки невозможны без этого профиля, finding становится `DEF-MBA-CHECKS-*` или blocker выбранного gate.

Если проект использует другой путь для `dd-flow`, адаптируй путь, но сохраняй смысл.

## Выбор аспектов

После входа в контекст покажи пользователю список режимов и предложи рекомендацию.

Режимы:

- быстрый аудит: структура, индексы, ссылки, источники истины, открытые `DEF-*`;
- полный аудит: все аспекты;
- аудит перед релизом: доставка, сценарии, доказательства, операции, открытые `DEF-*`;
- аудит после эпика: эпики, фичи, спеки, сценарии, пользовательская документация, долговечные выводы;
- аудит интерфейса: UI-слой, пользовательские инструкции, сценарии, кодовые контракты интерфейса;
- ручной выбор аспектов.

Объясни пользователю, что проверяет каждый режим, какую цену он имеет и когда его разумно запускать. Рекомендуй быстрый аудит, если пользователь не назвал конкретную цель.

Используй рекомендованные наборы из `.memory-bank/dd-flow/mb-audit/aspects/index.md`. Если пользователь выбирает ручной режим, покажи список аспектов с коротким объяснением каждого.

Не запускай субагентов до выбора аспектов пользователем.

После выбора создай `audit-selection.md` по contract `.memory-bank/dd-flow/common/memory-flow-subagents.md`. В нём зафиксируй:

- цель аудита;
- выбранный режим;
- selected audit aspects;
- skipped/not_applicable aspects и причину;
- active DEF inventory and selected aspects responsible for them;
- expected reports;
- почему выбранный scope достаточен и не притворяется полным аудитом.

Если пользователь выбрал быстрый или ручной аудит, skipped aspects должны быть явно отмечены как `skipped`, а не исчезнуть из контекста.

`audit-selection.md` должен быть создан до запуска субагентов. Нельзя сначала написать summary или общий отчёт, а потом объявить его покрытием аспектов. Каждый selected audit aspect должен иметь отдельную coverage row и report section/path: в `focused_subagent` это отдельные task packet и report, в allowlisted `grouped_subagent` — отдельная entry в group packet и отдельная секция в group report.

## Flow-owned route adapter (PRT-336)

Для каждого selected audit aspect зафиксируй route до запуска:

| Decision | Route | Rule |
| --- | --- | --- |
| `self_check_allowed` | `self_check` | Только preflight, selection/skip visibility, coverage, schema и report consistency; self-check не закрывает selected aspect. |
| `group_allowed` | `grouped_subagent` | Совместимый read-only subset из preference table ниже, общий immutable audit snapshot, отсутствие hard edge и отдельные verdict/evidence/DEF candidates. |
| `keep_separate` | `focused_subagent` | Critical/trust boundary, conflicting or privileged evidence, hard predecessor, recovery/recheck или separation trigger. |

Audit preference families (`preferred_with`, до трёх aspects):

| Group | Aspects |
| --- | --- |
| `structure_and_truth` | `01-structure-and-indexes.md`, `02-links-frontmatter-traceability.md`, `03-ssot-duplicates-actuality.md` |
| `delivery_and_system` | `04-delivery-docs.md`, `05-system-adr-contracts.md`, `06-scenarios-evidence-runners.md` |
| `surface_and_operations` | `07-ui-and-guides.md`, `08-engineering-code-contracts.md`, `09-operations-release-deferrals.md` |
| `lifecycle_and_agents` | `10-memory-lifecycle.md`, `11-code-traceability.md`, `12-agent-skills.md` |

Любой присутствующий совместимый subset family допустим; отсутствующий или
skipped aspect не ломает группу. Cross-family комбинации не выводятся без
изменения этой таблицы, а separation trigger всегда сильнее preference.

`requires_output_of` — hard dependency: aspect waits for the accepted
predecessor artifact/report and its hard successors stay locked otherwise.
`related_to`/`informed_by` — soft context and do not serialize a group. A
group report repeats the existing aspect report format for every covered
aspect; one shared summary or shared verdict is not enough. If one section is
incomplete, the group and audit remain non-green and recovery reruns only the
affected aspect with a new attempt/report path.

## Рабочая папка

После выбора используй `<run-home>`, resolved через `dd-flow run status --json` / `run-index.json`, и создай stage workspace:

```text
<run-home>/
├── run-index.json
├── run-summary.md
├── 01-preflight-read/
│   └── preflight.md
├── 02-audit/
│   ├── audit-selection.md
│   ├── tasks/
│   ├── reports/
│   └── defs/
└── 03-report/
    └── summary.md
```

Где:

- `02-audit/tasks/` - задачи субагентов по аспектам;
- `02-audit/reports/` - отчёты субагентов;
- `02-audit/defs/` - ремонтные задачи `DEF-*`;
- `03-report/summary.md` - сводка оркестратора.

## Постановка задач субагентам

В `focused_subagent` создай отдельный файл задачи для каждого выбранного
аспекта в `<run-dir>/02-audit/tasks/<aspect-id>.md`. В `grouped_subagent` создай
один group packet в этой папке с отдельной entry, read scope и report section
для каждого allowlisted аспекта.

Задача должна включать:

- инструкцию прочитать `.memory-bank/dd-flow/common/worker-session.md`;
- инструкцию прочитать `.memory-bank/dd-flow/workers/docs.md` в режиме чтения и анализа;
- `session_mode` и `context_authority` из worker-session primer;
- цель аспекта;
- нормативную базу MBB из файла аспекта;
- какие проектные документы читать;
- какие файлы и папки исследовать;
- какие признаки проблемы искать;
- что не считать проблемой;
- формат отчёта;
- правила создания `DEF-*`;
- путь для отчёта в `<run-dir>/02-audit/reports/`;
- путь для `DEF-*` в `<run-dir>/02-audit/defs/`.

В `focused_subagent` путь отчёта должен быть отдельным для аспекта:
`<run-dir>/02-audit/reports/<aspect-id>.md`. В `grouped_subagent` group report
может быть общим только с отдельной секцией и report reference для каждого
аспекта. Агрегированный файл без таких секций не считается отчётом selected
aspect и не закрывает coverage gate.

Субагенты работают в режиме чтения и анализа. Они не редактируют Банк памяти и код проекта.

Если аспект требует сравнения с кодом, субагент может читать код, конфигурации, тесты и сценарные раннеры, но не меняет их.

Если выбран быстрый аудит и аспект ограничен только частью своей области, явно запиши это в задаче. Например, для операций можно проверить только открытые `DEF-*` и не поднимать весь релизный контур.

## Формат отчёта аспекта

Каждый субагент пишет отчёт:

```markdown
# Отчёт аспекта: <название>

## Контекст

- какие документы прочитаны;
- какая нормативная база применялась;
- какие папки и файлы исследованы.

## Выводы

### Критично

- проблема;
- доказательство;
- почему это важно;
- рекомендованный `DEF-*`.

### Средне

...

### Низко

...

## Не подтверждено

- предположение;
- что нужно проверить дальше.

## Что не является проблемой

- спорные места, которые не требуют фикса.
```

## Формат `DEF-*`

Каждая подтверждённая ремонтная работа оформляется отдельным файлом:

```text
<run-dir>/02-audit/defs/DEF-MBA-<GROUP>-NN-<short-slug>.md
```

Используй группы:

- `STRUCTURE` - структура, индексы, карта Банка памяти;
- `LINKS` - ссылки, frontmatter, трассировка;
- `SSOT` - дубли, конфликтующие источники истины;
- `DELIVERY` - эпики, фичи, протоколы, матрицы проверки;
- `SYSTEM` - C4, подсистемы, контракты, ADR;
- `SCENARIOS` - сценарии, раннеры, доказательства;
- `UI` - интерфейс, экраны, дизайн-система, автоматизация;
- `GUIDES` - пользовательская документация;
- `ENGINEERING` - кодовые стандарты, кодовые контракты, тестовая политика;
- `OPS` - Git, окружения, релизы, откат;
- `DEFERRALS` - открытые отложения и незакрытые петли.

Шаблон `DEF-*`:

```markdown
---
id: DEF-MBA-<GROUP>-NN-<short-slug>
group: <GROUP>
type: documentation_blocker | verification_blocker | operations_blocker | safe_named_deferral
severity: critical | medium | low
source_audit: <run-home>/02-audit/
source_aspect: <aspect-file>
owner: memory-bank-maintainer
next_gate: mb-fix selection
status: open
created: YYYY-MM-DD
related_files:
  - <path>
normative_base:
  - .memory-bank/mbb/<file>.md
---

# DEF-MBA-<GROUP>-NN-<short-slug>

## Проблема

Что именно не так.

## Доказательство

Где это видно: ссылки на документы, строки, противоречия, отсутствующие индексы или фактическое состояние кода.

## Почему это важно

Как проблема мешает людям и агентам: навигация, достоверность, приемка, трассировка, эксплуатация.

## Предлагаемое исправление

Какие документы изменить, создать, объединить, пометить устаревшими или связать.

## Границы фикса

Что исправляем сейчас и что не входит в этот `DEF-*`.

## Проверки после фикса

Как понять, что исправление выполнено.
```

Создавай `DEF-*` только для подтверждённых проблем. Не создавай `DEF-*` для вкусовых замечаний, гипотез без доказательств или крупных реформ без понятного первого шага.

Один `DEF-*` должен описывать одну исправимую проблему. Не создавай огромный `DEF-*` вида "починить всю документацию": такой файл невозможно выбрать, выполнить и проверить.

## Работа оркестратора

После завершения субагентов:

1. Прочитай все отчёты.
2. Перепроверь важные выводы по документам или коду.
3. Удали или объедини дублирующиеся `DEF-*`.
4. Проверь, что у каждого `DEF-*` есть группа, серьёзность, нормативная база, доказательство и проверка после фикса.
5. Отдельно выпиши `lint-candidate`, если аудит обнаружил проблему, которую можно проверять детерминированно через будущий или существующий `mb-lint`.
6. Составь `<run-dir>/03-report/summary.md`.

Перед `<run-dir>/03-report/summary.md` проверь coverage: каждый selected aspect из `<run-dir>/02-audit/audit-selection.md` имеет focused task/report, allowlisted group entry/section либо documented degraded fallback. Если selected aspect не покрыт, аудит не может называться completed.

Если к этому моменту уже есть summary или aggregated report, но нет отдельных aspect sections/entries для selected aspects, запусти recovery pass: создай недостающие task packets, отправь отдельного субагента на каждый missing aspect, попроси сверить aggregated findings с источниками и написать фокусный `<run-dir>/02-audit/reports/<aspect-id>.md`. Нельзя писать отчёты задним числом от имени несуществовавших субагентов.

## Итоговый доклад

Доложи пользователю:

- навигационный блок из `.memory-bank/dd-flow/common/style.md`: `prompt: mb-audit.md`, протокол или `protocol: not_created`, текущая стадия, следующий шаг `mb-fix` или `ask_user`, блокеры и созданные `DEF-*`;
- какие аспекты запускались;
- какие документы и папки были источниками;
- сколько найдено `DEF-*` по группам и серьёзности;
- какие проблемы критичны и почему;
- какие проблемы можно исправлять пакетами;
- какие выводы были отклонены как неподтверждённые;
- какие `lint-candidate` стоит добавить в правила `mb-lint`;
- какой следующий разумный шаг для `mb-fix`.

Не применяй исправления в рамках `mb-audit`.
