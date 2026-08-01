# Protocol: материализация обсуждения в рабочий протокол

Этот prompt запускается, когда свободное обсуждение с пользователем стало практической задачей, черновым планом работ или явным намерением изменить систему.

Flow origin policy: `project_local`.

`protocol.md` создаёт или обновляет `PRT-*`, выбирает Git-контур и переводит обычную задачу в стадию `specify`. Он не выполняет `plan`, `code` или `merge`.

Если пользователь формулирует намерение как "оформи протокол", "создай протокол", "заведи протокол" или любой близкий вариант, это означает именно запуск `protocol.md` и переход в `specify`. Недостаточно просто записать summary или черновик без этого flow.

## Что прочитать сначала

Прочитай:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/protocol-bootstrap.md`
- `.memory-bank/dd-flow/common/context-discovery.md`
- `.memory-bank/dd-flow/common/specification.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/index.md`
- `.memory-bank/protocol/index.md`, если есть
- `.memory-bank/mbb/index.md`

После чтения `common/runtime-cli.md` выполни CLI version/operation preflight, если `dd-flow` доступен: `dd-flow version --json` и `dd-flow status --project-root "<project-root>" --json`. Если compatibility verdict `incompatible` или `unknown`, не скрывай это: зафиксируй degraded/blocker note до создания/изменения runtime state и продолжай только если выбранный route безопасен без требуемого CLI поведения. Если CLI блокирует project/runtime mutation через operation-level compatibility gate, не обходи отказ ручным редактированием runtime-файлов; установи compatible engine, перейди в explicit `mb-upgrade` contour или остановись с blocker/DEF.

## Алгоритм

1. Определи, есть ли уже выбранный активный `PRT-*`.
2. Если пользователь явно хочет новый протокол, выдели новый id по `entity-ids.md`.
3. До финального создания executable protocol проверь, достаточно ли task-specific контекста. Если общего priming-а мало, выполни `context_discovery` по `common/context-discovery.md`.
   Если текущая сессия только что выполняла `.memory-bank/dd-flow/fix-def.md`, используй его финальный отчет как structured problem-space context: выбранные группы DEF, рекомендации, ответы пользователя и protocolization guidance. Не повторяй полный DEF inventory без причины; `protocol.md` всё равно остаётся единственной точкой создания `PRT-*`/`PSET-*`.
4. Выполни `scope_sizing`: оцени, помещается ли работа в один исполняемый протокол с одной целью и одним главным acceptance-сценарием.
5. Выполни Git preflight и выбери Git contour по `common/protocol-bootstrap.md`.
6. Если нужен feature worktree, создай/выбери его по `git-ops.md`, выполни workspace bootstrap и создай протокол уже там.
7. Запиши `summary.md` с исходным запросом, пониманием, scope, workspace, base commit, текущей стадией `specify` и следующим шагом.
8. Если есть `protocol/index.md`, добавь ссылку на новый протокол.
9. Зарегистрируй runtime protocol/run state, если доступен CLI.
10. Запусти первую итерацию `specify` только до уровня верхнеуровневых вопросов/черновой specification. Если появились вопросы пользователя, остановись на `waiting_for_user`.

Важно: `protocol.md` всегда открывает problem-space work, а не solution-space planning. Если запрос был "оформи протокол", следующий осмысленный шаг после materialization - именно `specify`, а не ручное создание протокола без фазы вопросов.

## Scope Sizing

Протокол является исполнительным SDLC-документом. Он должен описывать доставляемую работу, которую можно спланировать, реализовать, проверить и довести до merge в одном trace.

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
