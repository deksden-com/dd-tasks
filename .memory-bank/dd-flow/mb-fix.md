# Исправление Банка памяти по результатам аудита

Flow origin policy: `project_local`.

Сначала прочитай `.memory-bank/dd-flow/common/flow-origin.md` и проверь `.memory-bank/dd-flow/manifest.json`, если он есть. `mb-fix` работает из project flow pack целевого проекта. Если pack manifest отсутствует или не валидируется, зафиксируй `project_flow_pack_degraded`; продолжай только если локальные support-файлы `mb-fix` и MBB доступны.

Прочитай общие правила:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/flow-origin.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/memorybank-git.md`
- `.memory-bank/dd-flow/common/workspace-bootstrap.md`
- `.memory-bank/dd-flow/common/subagents.md`
- `.memory-bank/dd-flow/common/closure.md`

Затем прочитай в MBB:

- `.memory-bank/mbb/index.md`
- `.memory-bank/mbb/memory-bank-structure.md`
- `.memory-bank/mbb/indexing-guide.md`
- `.memory-bank/mbb/frontmatter-standards.md`
- `.memory-bank/mbb/cross-references.md`
- `.memory-bank/mbb/named-deferrals-guide.md`

## Язык пользовательских артефактов

Сразу после чтения `common/style.md` зафиксируй `target_language`: язык текущего пользовательского prompt-а, если пользователь явно не попросил другой язык. Все пользовательские ответы, fix selection для пользователя, итоговый отчёт, summaries, dashboard-и и curated summaries пиши на `target_language`.

Внутренние worker packets, raw evidence, JSON keys, code identifiers и HTML/CSS/JS шаблоны могут оставаться английскими. Если внутренний материал показывается пользователю напрямую, синтезируй или переведи пользовательский слой на `target_language`.

Субагентов использовать разрешено при необходимости: для независимых групп `DEF-*`, документационных workers, code-workers или verifier-а после исправлений. Если выбран solo-режим, объясни, почему выбранные `DEF-*` достаточно локальны и не требуют отдельных task packets.

Твоя задача - применить только выбранные пользователем исправления из `DEF-*`, созданных аудитом Банка памяти.

`mb-fix` не обязан чинить все проблемы последнего аудита. Он читает найденные `DEF-*`, группирует их, объясняет варианты пользователю и выполняет только выбранный набор.

## Flow-owned route adapter (PRT-336)

Для fix-run зафиксируй route до создания worker packet:

| Decision | Route | Rule |
| --- | --- | --- |
| `self_check_allowed` | `self_check` | Fix selection, planned-area overlap check, status/closure reconciliation и post-fix verification planning. |
| `group_allowed` | scheduling batch only | Независимые DEF workers с непересекающимися worktrees можно запускать одной pool wave; это не grouped mutation packet/report. |
| `keep_separate` | `focused_subagent` | Writers, mutation/apply, overlapping files, shared indexes, critical/operational access и hard fix/verify chains. |

Существующее grouping DEF по planned coordination areas остаётся execution-planning
механикой; оно не объединяет writer responsibilities, reports или verdicts.
`requires_output_of` — hard edge, поэтому fix/verification ждёт принятого
predecessor report или changed-files handoff. `related_to`/`informed_by` — soft
context и не сериализуют независимые workers. Каждый worker сохраняет свой
task/report, а verification остаётся отдельной unit с собственным evidence;
partial failure запускает recovery только для affected DEF/worker.

Если доступен `dd-flow` CLI, зарегистрируй memory flow session по `common/runtime-cli.md`: `flow_kind: memory_flow`, `continuation_policy: memory_flow`, `current_stage: mb_fix`, `next_action`: выбранная группа `DEF-*` или verification gate.

`mb-fix` исправляет выбранные Memory Bank findings, но не является runtime migration flow. Если выбранный `DEF-*` касается active legacy lifecycle/runtime (`current_stage`, `raw_stage`, `job`, merge queue, lane locks, flow-contract drift), сначала классифицируй:

- документальная правка Memory Bank - можно выполнять в `mb-fix`;
- runtime/data contract migration - передай в canonical `mb-upgrade` или оформи blocker;
- stale runtime cleanup - используй только штатные `dd-flow cleanup/cancel/session/lane/merge-queue` commands, не ручное редактирование JSON/SQLite.

В отчёте `mb-fix` показывай normalized `lifecycle` и resource/claim evidence отдельно от legacy aliases.

Создай или найди `RUN-*` по `common/flow-runs.md`. Для текущего `mb-fix` используй `<run-home>`, resolved через `dd-flow run status --json` / `run.json`, и stage layout: `01-intake/`, `02-fix/`, `03-verification/`, `04-report/`. Input audit-run не является текущим run: фикс ссылается на него через `source_audit_run_id` и `source_audit_dir`.

Минимальный layout текущего fix-run:

```text
<run-home>/
├── run.json
├── run-summary.md
├── 01-intake/
│   ├── audit-input.md
│   └── fix-selection.md
├── 02-fix/
│   ├── workspace-bootstrap-receipt.md
│   ├── tasks/
│   ├── reports/
│   └── changed-files.md
├── 03-verification/
│   └── verification-report.md
└── 04-report/
    └── final-report.md
```

Режим Git: `memorybank_fix`. Перед правками проверь ветку, base commit, upstream и существующие изменения. Если `.memory-bank/` уже изменён, сначала разберись, это продолжение текущей работы или чужой контекст.

До первой правки project code или запуска project-owned tooling запиши `<run-home>/02-fix/workspace-bootstrap-receipt.md` по `common/workspace-bootstrap.md`. Для Memory Bank-only fix без project tooling используй `bootstrap_not_required` с конкретной причиной; если выбранные исправления требуют project tooling, produce/revalidate receipt для фактического checkout до команды. `bootstrap_blocked`/`bootstrap_failed` останавливают текущий fix gate.

Помни, что audit `DEF-*` - это рабочая ремонтная задача в `.tasks/`. Если по ходу исправления видно, что проблема является долговечным блокером приемки, релиза, сценария или архитектурного решения, подними её в соответствующий постоянный документ Банка памяти и оставь ссылку в `DEF-*`.

## Найди аудит и `DEF-*`

Если пользователь указал папку аудита, используй её.

Если не указал, найди последние `mb-audit` run workspaces:

```text
.tasks/dd-flow-runs/*/02-audit/
```

Старые `.tasks/mb-audit-*` можно читать только как legacy fallback для прежних запусков, если новый run workspace отсутствует.

Прочитай:

- `<run-dir>/03-report/summary.md`, если есть;
- все файлы `<run-dir>/02-audit/defs/DEF-*.md`;
- отчёты аспектов, на которые ссылаются выбранные `DEF-*`;
- нормативную базу MBB из `normative_base` каждого `DEF-*`;
- проектные документы, которые нужно менять.

Если `DEF-*` нет, не придумывай фиксы. Доложи, что нечего применять.

## Сгруппируй исправления

Собери таблицу по группам:

- группа;
- количество `DEF-*`;
- критичность;
- какие документы затронуты;
- краткий смысл пакета;
- риск правки;
- рекомендуемый порядок.

Группируй так, чтобы пользователь мог выбрать осмысленный пакет:

- структура и индексы;
- ссылки и frontmatter;
- дубли и источники истины;
- доставка: эпики, фичи, протоколы;
- система, C4, ADR и контракты;
- сценарии и доказательства;
- UI и пользовательские инструкции;
- инженерные стандарты и кодовые контракты;
- операции и релизы;
- открытые отложения.

## Спроси пользователя, что исправлять

Перед изменениями покажи варианты:

- исправить только критичные;
- исправить одну группу;
- исправить несколько групп;
- исправить конкретные `DEF-*`;
- подготовить план без правок;
- закрыть `DEF-*` как отклонённые, если пользователь считает их неверными.

Дай рекомендацию. Объясни, почему предлагаешь именно такой пакет: например, сначала структура и ссылки, потому что они уменьшают риск неверных правок в остальных слоях.

Не начинай правки до выбора пользователя.

## План фикса

После выбора составь короткий план:

- какие `DEF-*` закрываются;
- какие файлы будут изменены;
- какие нормативные правила применяются;
- какие проверки будут выполнены;
- что останется открытым.
- какой режим выполнения выбран: последовательный или параллельный через рабочие деревья (worktree);
- почему этот режим выгоднее для выбранного набора.

Если выбранные `DEF-*` пересекаются по файлам или смыслу, объедини их в один аккуратный порядок правок. Не создавай конкурирующие изменения в одном документе.

## Выбор режима выполнения

Перед правками оцени, есть ли выигрыш от распараллеливания:

- группы исправлений пишут в разные целевые папки;
- мало общих индексов и shared-файлов;
- объём правок достаточно большой;
- merge нескольких веток дешевле, чем долгая последовательная работа;
- можно дать субагентам ясные границы записи.

Выбери последовательный режим, если:

- выбранных `DEF-*` мало;
- правки в основном касаются одних и тех же файлов;
- нужно много решений оркестратора;
- высок риск конфликтов в корневых индексах;
- merge будет сложнее самих правок.

Оркестратор не должен превращаться в основного исполнителя больших правок. Он выбирает режим, создаёт задачи, следит за субагентами, принимает отчёты, проверяет результат и мержит изменения.

## Параллельный режим

Если выбран параллельный режим, создай рабочие деревья:

```text
../_worktrees/<project>-mbf-<group>
branch: mb-fix/<group>
```

Сгруппируй задачи так, чтобы одна ветка владела понятным набором:

- `structure-links`;
- `system-adr`;
- `scenarios-evidence`;
- `ui-guides`;
- `engineering`;
- `operations-deferrals`.

Для каждого worker-а создай файл задачи в `<run-dir>/02-fix/tasks/`. В задаче укажи:

- прочитать `.memory-bank/dd-flow/common/worker-session.md`;
- прочитать `.memory-bank/dd-flow/workers/docs.md`;
- `session_mode`, `context_authority`, boundaries and report path;
- выбранные `DEF-*`;
- целевые файлы и папки;
- что нельзя менять;
- какие индексы можно обновлять;
- какие проверки выполнить;
- workspace bootstrap receipt source/current path и обязанность revalidate его до project tooling;
- куда записать отчёт;
- что worker не один в кодовой базе и не должен откатывать чужие изменения.

После завершения веток оркестратор:

1. читает отчёты;
2. проверяет изменённые документы;
3. последовательно мержит ветки;
4. решает конфликты без отката чужих изменений;
5. обновляет общие индексы и `structure.md`, если это не было безопасно делать внутри target-веток;
6. запускает проверки;
7. закрывает выбранные `DEF-*`.

Если параллельная ветка обнаружила новую проблему, она оформляет `DEF-*`, но не расширяет scope без решения оркестратора.

## Выполнение

Выполняй правки аккуратно:

- обновляй существующие документы перед созданием новых;
- сохраняй единый источник истины;
- обновляй индексы и `structure.md`, если меняется карта;
- обновляй frontmatter, если меняются связи, статус, версия или дата;
- помечай устаревшее как `DEPRECATED`, если документ нужен для истории;
- не удаляй исторические материалы без явного решения пользователя;
- не меняй код проекта, если `DEF-*` относится только к Банку памяти.

Если нужно менять много независимых областей, можно создать задачи субагентам. Каждому субагенту дай один пакет с ясными границами записи и укажи, что он не один в кодовой базе.

Документационным субагентам укажи прочитать `.memory-bank/dd-flow/common/worker-session.md` и `.memory-bank/dd-flow/workers/docs.md`. Если нужен независимый контроль результата, проверяющему субагенту укажи прочитать `.memory-bank/dd-flow/common/worker-session.md` и `.memory-bank/dd-flow/workers/verify.md`. Оркестратор передаёт только выбранные `DEF-*`, целевые файлы, границы записи, проверки и путь отчёта.

После последней проверки и до удаления disposable worktree выполни cleanup только для allowlisted worktree-local secret/config material, который project policy и receipt пометили `cleanup_required`. Запиши классы/destination names и результат cleanup в verification/final report, никогда не записывай значения и не удаляй неотмеченные файлы.

## Закрытие `DEF-*`

После исправления каждого выбранного `DEF-*`:

- проверь, что проблема реально закрыта;
- обнови сам файл `DEF-*`: `status: closed`;
- добавь раздел `## Closure` с датой, изменёнными файлами, проверками и остаточными рисками;
- если проблема поднята в долговечный документ Банка памяти, добавь ссылку на этот документ;
- если проблема закрыта не полностью, оставь `status: open` и уточни следующий gate;
- если пользователь отклонил `DEF-*`, поставь `status: rejected` и объясни причину.

Не закрывай `DEF-*`, если исправление не выполнено или не проверено.

## Проверки

Минимум после правок:

- проверить, что изменённые ссылки ведут в существующие файлы;
- проверить, что индексы покрывают добавленные или перемещённые документы;
- проверить, что frontmatter не противоречит телу документа;
- проверить, что не появился новый дубль источника истины;
- выполнить `git diff --check` по изменённым Markdown-файлам.

Если проект имеет свои проверки документации, выполни их.

## Итоговый доклад

Доложи пользователю:

- навигационный блок из `.memory-bank/dd-flow/common/style.md`: `prompt: mb-fix.md`, протокол или `protocol: not_created`, текущая стадия, следующий шаг, блокеры и активные `DEF-*`;
- какие `DEF-*` были выбраны;
- какие закрыты, какие остались открыты, какие отклонены;
- какие документы изменены;
- почему изменения сделаны именно так;
- какой режим выполнения был выбран и почему;
- какие проверки выполнены;
- какой workspace bootstrap receipt записан и как выполнен policy-marked cleanup secret/config material;
- какие следующие группы стоит чинить.
