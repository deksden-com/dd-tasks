# Memory-flow subagent coverage

Этот файл задаёт общий contract для memory-flow, где работа идёт по аспектам или target-пакетам: `mb-init`, `mb-upgrade`, `mb-audit`, `mb-distill` и близкие будущие flows.

Цель contract-а - убрать туманную логику "стоит ли запускать субагентов" и заменить её проверяемым выбором scope и coverage.

## Общий принцип

Memory-flow сначала выбирает semantic coverage units, затем строит из них
execution jobs и гарантирует результат по каждой выбранной unit. Единица
покрытия - это не worker session и не report file:

- canonical aspect для `mb-init`;
- upgrade target для `mb-upgrade`;
- audit aspect для `mb-audit`;
- domain/process aspect для `mb-distill`.

```text
selected applicable unit -> one coverage row + one unit verdict/evidence
self_check -> source-backed orchestrator evidence, no worker claim
grouped_subagent -> one allowlisted group packet, separate unit sections
focused_subagent -> one focused packet/report for the unit
skipped unit -> explicit reason required
technical no-subagents -> degraded mode + trust reduction + coverage row
```

Для `grouped_subagent` один execution job может закрыть несколько units, но
не может заменить их отдельные verdicts, evidence или completeness. Для
`focused_subagent` выбранная unit получает отдельную session согласно
существующему contract-у. Оркестратор не подменяет delegated analysis своей
сводкой; `self_check` допустим только если его разрешил owning flow и оставил
проверяемое source-backed evidence. Технически невозможный запуск оформляется
как `degraded_orchestrator_fallback`, а не как обычная оптимизация.

Явное разрешение пользователя на делегирование не требуется, если текущий memory-flow требует subagents или выбирает selected units по этому contract-у. Требование flow является достаточным разрешением на запуск scouts/workers/reviewers через доступный агентный механизм. Пользовательский запрет или ограничение на subagents имеет приоритет, но его нужно явно записать как downgrade/degraded condition.

## Selection artifact

Каждый memory-flow должен иметь явный selection artifact:

- `mb-init`: `aspect-coverage.md` является и selection, и coverage artifact; обычный режим покрывает все canonical aspects.
- `mb-upgrade`: `target-selection-map.md` и `target-coverage.md`.
- `mb-audit`: `audit-selection.md`.
- `mb-distill`: `distill-selection.md`.

Минимальный selection artifact фиксирует:

- цель запуска;
- режим;
- полный список возможных units;
- selected units;
- skipped units и причину;
- units в статусе `not_applicable`;
- hard triggers, если они есть;
- degraded mode, если субагенты недоступны;
- expected reports;
- canonical route, `job_id`/`group_id` и hard/soft dependency references для
  каждой selected unit.

Не используй `recommended` как итоговое состояние. Рекомендация должна быть сведена к выбранному режиму и списку selected/skipped units.

## Coverage artifact

Каждый memory-flow должен иметь coverage artifact или coverage section:

```markdown
| Unit | Selected | Route | Job/group | Task packet | Subagent/report | Result | Gaps/DEF | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

`pending` и `running` являются transient job states; они не закрывают
coverage row и не являются terminal coverage results.

Статусы:

- `selected` - unit выбран; route определяет обязательный worker packet или
  source-backed orchestrator evidence;
- `skipped` - unit не выбран, причина обязательна;
- `not_applicable` - unit честно неприменим;
- `degraded_orchestrator_fallback` - субагент технически невозможен, оркестратор сделал отдельный отчёт/раздел и снизил доверие;
- `blocked` - unit нужен, но не выполнен;
- `incomplete` - packet/report есть, но unit-level result ещё не принят;
- `completed` - отчёт получен и обработан;
- `verified` - ключевые выводы перепроверены оркестратором или отдельным reviewer-аgent.

Flow нельзя закрывать как completed/ready/published, если выбранный unit остался без task/report или без documented degraded fallback.

Если flow уже создал active documents, но затем обнаружил missing task/report, это не считается успешной интеграцией. Нужно запустить recovery pass: создать task packet для missing unit, дать субагенту сверить existing active docs с источниками, получить report, обновить coverage и только потом продолжать closure gates. Нельзя писать отчёт задним числом от имени несуществовавшего worker-а.

Recovery preserves the original packet and original report. The orchestrator writes a failure note, gives the replacement worker `session_mode: recovery_continuation`, the original prompt chain, prior artifacts and remaining scope, and assigns a distinct attempt report path. Coverage records which report became authoritative after orchestration acceptance; recovery never overwrites an unaccepted partial report.

## Гранулярность

Одна selected unit всегда получает одну coverage row и один unit-level
verdict/evidence. Кардинальность packet/session/report зависит от route:

- `self_check` оставляет source-backed orchestrator evidence без worker packet;
- `focused_subagent` использует один task packet и один focused report;
- `grouped_subagent` использует один group packet, но отдельную section,
  verdict, findings, evidence и completeness для каждой unit.

Не объединяй units вне flow-owned allowlist. Ограниченный пул меняет только
параллельность: запускай доступные jobs batch-ами, держи transient pending
список и после освобождения слота продолжай ту же wave. Не делай остаток сам,
если субагент технически доступен. Если unit слишком большой, раздели её на
sub-scope только внутри той же unit и сохрани один итоговый unit report.

## Degraded mode

Degraded mode допустим только по технической причине: нет возможности запустить субагентов, среда сломана, лимит не освобождается после ожидания, или инструмент делегирования недоступен.

Degraded mode не допустим как обычная оптимизация времени.

В degraded mode:

- selection artifact явно пишет `subagents_used: no`;
- coverage содержит строку по каждому selected unit;
- для каждого unit есть отдельный отчёт или отдельный раздел отчёта;
- итоговый доклад пишет, какие выводы менее надёжны;
- если результат нужен для commit/publish/merge gate, добавь reviewer или `DEF-*` на последующую проверку.

## Оркестратор после reports

После завершения subagents оркестратор обязан:

1. Прочитать все reports.
2. Проверить, что reports соответствуют task packets.
3. Перепроверить важные факты по источникам, diff, code, docs или evidence.
4. Свести дубли и конфликты.
5. Обновить coverage artifact.
6. Зафиксировать принятые и отклонённые рекомендации.
7. Создать `DEF-*`, если gap нельзя закрыть в текущем flow.

Для SDLC-related gaps сначала классифицируй gap: `not_applicable`, `question`, `BLOCK-*`, `DEF-*` или accepted project-specific policy. Отсутствие release/deploy policy само по себе не DEF для маленького проекта; DEF нужен, когда gap влияет на active gate, future flow or discoverability.

Отчёт субагента является входом для решения, а не истиной сам по себе.

## Ownership

- Этот файл владеет semantic coverage rows, applicability, selected/skipped/
  degraded statuses и правилами закрытия coverage.
- `common/subagents.md` владеет route selection, allowlist checks, packing,
  dependency gating и job acceptance.
- `common/worker-session.md` владеет task packet, grouped report и recovery
  vocabulary.
- Каждый конкретный flow владеет своим compatibility catalog и separation
  triggers; flow не меняет общий смысл routes и status mapping.

## Flow-specific interpretation

`mb-init`:

- full init покрывает все canonical aspects;
- `not_applicable` всё равно требует отдельного aspect-worker/report с источниками;
- финальный integration consistency reviewer обязателен.

`mb-upgrade`:

- selected upgrade targets должны иметь отдельные worktrees/branches, task packets, reports и coverage rows;
- skipped targets допустимы только по `not_applicable`, `absent source`, `out_of_scope` или `deferred_with_DEF`;
- target-selection-map должен быть готов до запуска target workers.
- обязательная стадия `05-review` запускает aspect subagents по своим review-aspects; отсутствие отдельной просьбы пользователя "используй субагентов" не является blocker-ом.

`mb-audit`:

- пользователь или явная цель выбирает режим;
- выбранные audit aspects всегда идут через subagents;
- skipped audit aspects фиксируются, чтобы аудит не притворялся полным.

`mb-distill`:

- selected domain/process aspects всегда идут через subagents;
- process distill и strict distill не допускают solo analysis;
- external research decision фиксируется внутри каждого aspect report.
