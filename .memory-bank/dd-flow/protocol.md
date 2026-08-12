# Protocol: материализация обсуждения в рабочий протокол

Этот prompt запускается, когда свободное обсуждение с пользователем стало практической задачей, черновым планом работ или явным намерением изменить систему.

Flow origin policy: `project_local`.

`protocol.md` маршрутизирует практическую задачу в initial `specify`. Он не
выполняет `plan`, `code` или `merge`.

Если пользователь формулирует намерение как "оформи протокол", "создай протокол", "заведи протокол" или любой близкий вариант, это означает именно запуск `protocol.md` и переход в `specify`. Недостаточно просто записать summary или черновик без этого flow.

## Первый action

После обязательного Goal, если его требует harness, первым worker flow action
запусти bootstrap стадии. Не читай вручную preflight-файлы, не ищи CLI, не
вызывай help/status/version/permissions и не создавай protocol/RUN отдельно:

```bash
dd-flow stage start --bootstrap --stage specify --project-root <root> \
  --subject <label> --intake-file <path> --json
```

Ответ команды содержит единственный требуемый stage prompt, Git/runtime/
permission/session receipt, aliases, bounded required context и точную команду
finish. Эти факты авторитетны для текущей попытки. Прочитай только returned
stage prompt и перечисленные им project sources.

`protocol.md` всегда открывает problem-space work, а не solution-space
planning. Bootstrap создаёт минимальный durable scaffold; immediate SPECIFY
определяет scope, methods, gap ledger, scenario consequences и user-question
gate. Этот pass может завершиться без вопросов (`baseline_only`), с вопросами
(`waiting_for_user`) или plan-ready specification; он не выбирает архитектуру
и не заменяет design aspects.

## Scope Sizing

Протокол является исполнительным SDLC-документом. Он должен описывать доставляемую работу, которую можно спланировать, реализовать, проверить и довести до merge в одном lifecycle.

Перед созданием большого `PRT-*` выбери один из verdict-ов:

- `single_executable_protocol` - одна содержательная цель, понятная граница и один главный acceptance-сценарий;
- `single_compact_protocol` - маленькая локальная правка, где допустим compact specify/plan;
- `specification_with_slices_required` - пользователь описал объём, который нужно оформить как спецификацию и разрезать на несколько исполняемых протоколов;
- `blocked_by_problem_space_question` - нельзя даже сформировать спецификацию/нарезку без ответа пользователя по problem space.

Не используй verdict `interactive_flow`: интерактивный режим является отдельным entry prompt/stage route и не должен попадать в эту оценку.

Не создавай `spike_protocol_required` как дефолтный выход. Если нужно исследование, сначала выполни `context_discovery`; если после него остается delivery-работа, она получает обычный executable protocol.

Критерии oversized scope:

- несколько независимых целей или acceptance-сценариев;
- несколько пользовательских потоков, каждый из которых можно принять отдельно;
- изменение затрагивает несколько подсистем и требует разных verification gates;
- требуется foundation/migration/hardening работа до пользовательской фичи;
- нельзя честно закрыть план, код, проверки и merge одним reviewable diff.

Если выбран `specification_with_slices_required`, не создавай mega-protocol и не заводи отдельный non-executable umbrella protocol. Создай coordination record для набора исполнимых протоколов:

```text
.memory-bank/protocol/_set/PSET-XXX-<slug>.md
.memory-bank/protocol/PRT-XXX-<slice-a>.md
.memory-bank/protocol/PRT-YYY-<slice-b>.md
```

`PSET-*` является human-readable coordination layer. Он не заменяет `PRT-*` и не создаёт новый класс неисполняемых протоколов. Каждый member protocol остаётся обычным исполнительным SDLC-документом с собственной целью, acceptance, проверками, code/readiness and merge closure.

В `PSET-*` зафиксируй:

- исходную широкую задачу and decomposition rationale;
- member protocols and their roles;
- какие protocols startable now, а какие blocked;
- cross-links на raw intake, specs, ADR, epics/features/scenarios when applicable;
- компактный `Execution Topology` decision до первого `code` member-а.

### PSET Execution Topology

`PSET-*` остаётся human-readable coordination layer: topology не создаёт runtime entity, scheduler, очередь или новую lifecycle stage. Она объясняет, как уже созданные executable member protocols безопаснее исполнить и передать в существующий Git/merge contour.

Сначала построй dependency graph из `blocked_by_protocols`, ожидаемого overlap write scope, общих контрактов и repository boundaries. В таблицу включай только feasible modes; рядом с таблицей кратко назови исключённые режимы и причину. Не выдумывай точные часы: укажи qualitative relative duration от самого быстрого feasible `baseline` и реальную причину overhead (критический путь, повторный bootstrap, merge/CI gates или ожидаемый conflict/rework).

Поддерживаемые режимы:

| Mode | Execution model | Когда применим |
| --- | --- | --- |
| `shared_serial_bundle` | Один feature branch/worktree; members идут в dependency order; каждый сохраняет `ready_for_merge`; один final bundle merge и cleanup | Связанная цепочка, общий контракт или заметный overlap write scope |
| `isolated_parallel` | Независимые worktrees и параллельные members с их обычной интеграцией | Нет unresolved dependencies, write scopes раздельны, а итоговая интеграция не требует одного change bundle |
| `isolated_dependency_waves` | Раздельные worktrees, но members запускаются только топологическими волнами | Есть безопасные параллельные волны с отдельными mutation scopes |

Выбери режим и запиши в frontmatter/section PSET минимум:

```yaml
execution_topology:
  selected: shared_serial_bundle | isolated_parallel | isolated_dependency_waves
  workspace_owner: <PRT-ID | not_applicable>
  confirmation_gate: before_first_code
```

Затем добавь текстовый execution graph и компактную таблицу feasible modes: mode, graph, relative duration и reason. Для `shared_serial_bundle` назови owner worktree/branch, запрети independent member merge/cleanup и явно укажи, что один existing `merge bundle` claim/complete закрывает всех ready members только после готовности всего selected bundle. Если member затрагивает отдельный Git repository, используй один companion branch/worktree для всего PSET в этом repository; один Git worktree не может охватывать несколько repositories.

Перед первым `code` revalidate topology. Измени решение явно, а не молча, только если обнаружены material dependency, write-scope collision, cross-repository blocker или external gate. `blocked_by_protocols` остаётся единственным mandatory dependency mechanism для v1; topology не заменяет его.

В каждом member protocol frontmatter укажи:

- `protocol_set: '.memory-bank/protocol/_set/PSET-XXX-<slug>.md'`;
- `blocked_by_protocols: []` или список blocking `PRT-*`;
- `source_user_input`, если общий дословный ввод хранится в первом протоколе или рядом с set;
- `related_epics`, `related_features`, `related_specs`, `related_adrs`, `related_scenarios`;
- `continuation_prompt: protocol-implement.md`.

`blocked_by_protocols` - единственный mandatory dependency mechanism для v1. Не изобретай обязательный graph engine: CLI and dashboard can derive ready/blocked state from each member protocol frontmatter plus runtime status.

Если большой scope требует durable system/product knowledge, создай или обнови соответствующие `spec/`, `plans/epics`, `plans/features`, `adr/` and `scenarios/` документы как самостоятельные deliverables внутри member protocols. Не используй `spec/features/<feature-id>/slicing.md` as canonical oversized-work branch.

Исходный пользовательский ввод сохрани дословно один раз в `intake/user-input.md` там, где он задаёт общий scope: обычно рядом с исходным/первым member protocol или согласно PSET. Остальные протоколы ссылаются на `source_user_input`, а не дублируют весь raw intake.

Для больших продуктовых фич предпочитай вертикальные слайсы: каждый protocol slice должен иметь одну цель, одного основного пользователя/оператора, один главный сценарий приемки и собственные проверки. Foundation, migration и hardening slices допустимы, когда без них нельзя безопасно доставить вертикальные slices; причина должна быть записана в `PSET-*` decomposition rationale and member protocol scope.

Не спрашивай пользователя про solution-space и орг-детали нарезки: порядок протоколов, внутренние срезы, Git/worktree route, worker topology, file layout. Агент предлагает оптимальную схему сам. Пользовательские вопросы допустимы только по problem space: цель, scope/non-goals, acceptance, внешние договорённости, риск-толерантность и ручные gates.

## Raw User Intake

До summary/scope нормализации определи, есть ли в пользовательском сообщении содержательные вводные для задачи или проекта.

Создавай `.memory-bank/protocol/<PRT-ID>/intake/user-input.md` только если вводные содержательные: они влияют на problem statement, scope, acceptance, workflow/policy, архитектуру, проверки, Git/release/deploy, Memory Bank structure, доменное знание или future reusable context.

Не создавай `user-input.md` для служебных команд без новой смысловой вводной: "продолжай", "сделай plan", "запускай code flow", "делай merge". В таком случае в `summary.md` или stage report запиши `raw_intake: not_applicable`.

Если raw intake создаётся:

- сохраняй пользовательский текст буквально, без суммаризации и улучшения формулировок;
- добавляй `INPUT-001`, timestamp, source, protocol id and related run/session;
- redacted-секреты не записывай открытым текстом;
- в `summary.md` дай ссылку на raw intake, но не заменяй им working understanding.

## Формат общения

Когда задаёшь вопросы:

- нумеруй их `Q-001`, `Q-002`, ...;
- объясняй, почему вопрос влияет на спецификацию;
- давай 2-3 варианта и рекомендуемый вариант;
- сохраняй ответы в протоколе;
- не повторяй уже закрытые вопросы.

Если вопросов нет, создай compact specification и передай следующий шаг в `plan.md`.

## Выход

Финальный доклад должен содержать:

- `prompt: protocol.md`;
- `protocol: <PRT-ID>`;
- `current_stage: specify | waiting_for_user`;
- `completed_stage: protocol_bootstrap`;
- `scope_sizing_verdict`;
- выбранный Git contour;
- `base_commit`;
- созданные/обновлённые файлы;
- вопросы `Q-*`, если они есть;
- следующий безопасный шаг: продолжить `specify`, запустить `plan.md`, либо ждать пользователя.
- если создан или обновлён `PSET-*`: member protocol table with `ready`, `blocked`, `running/claimed`, `done`, and команда `dd-flow protocol ready --project-root "<project-root>" --json`, если CLI доступен.
