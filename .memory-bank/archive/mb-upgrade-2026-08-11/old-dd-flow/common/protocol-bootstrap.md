# Protocol bootstrap

Этот общий блок читают prompt-ы, которые создают новый рабочий протокол: `protocol.md` и `interactive.md`.

## Назначение

Новый `PRT-*` создаётся только после того, как у пользователя появилась практическая задача, первичный план работ, интерактивная цель или явное намерение вести доработку. Исследовательский вопрос без задачи не создаёт протокол.

Протокол - долговечная смысловая рабочая сессия задачи. Runtime state CLI помогает продолжать работу, но не заменяет файловый протокол в Memory Bank.

## Git contour

Перед созданием протокола проверь:

- текущий Git root и ветку;
- чистоту рабочей области;
- `.memory-bank/project-policy.md`, если он есть;
- интеграционную ветку проекта по Git policy;
- есть ли активный lock интеграционной ветки;
- можно ли работать напрямую в интеграционной ветке или нужна feature-ветка/worktree;
- стартовый commit, от которого создаётся протокол.

Если пользователь не указал Git-контур, задай вопрос только верхнего уровня. Рекомендуй feature-ветку/worktree для всего, что может длительно блокировать интеграционную ветку. Прямую работу в интеграционной ветке допускай для маленьких обратимых правок, когда проектная политика это разрешает.

Если интеграционная ветка заблокирована интерактивной или merge-сессией, новый протокол можно создавать от зафиксированного стабильного base commit этой ветки, если проектная политика и `dd-flow` runtime явно позволяют такой старт.

## Общая запись протокола

Минимальный `summary.md` нового протокола должен содержать:

```yaml
protocol:
  id:
  title:
  mode: normal | interactive
  current_stage: specify | interactive
  next_action:
workspace:
  project_root:
  protocol_location:
  integration_branch:
  base_commit:
  feature_branch:
  worktree_path:
  integration_branch_locked: true | false
task:
  original_user_request:
  working_understanding:
  in_scope:
  out_of_scope:
decisions:
  initial_gaps: []
  fixed_questions: []
  open_questions: []
verification:
  acceptance_outline:
  check_profile:
```

`initial_gaps` заполняется сразу после создания протокола: агент фиксирует очевидные gaps, неоднозначности and недоговорённости из пользовательского ввода. Если их не видно, пиши `initial_gaps: none_detected`. Для обычного протокола эти gaps становятся первичным входом в stage `specify`; для интерактивного протокола они фиксируются как context/risk notes for later `finish`.

Не дублируй Git log в протоколе. Фиксируй мотивацию, цель, принятые решения, контекст проверки и то, что будущий агент не восстановит из diff-а.

## Runtime registration

Если доступен CLI, зарегистрируй или обнови protocol/run state по `runtime-cli.md`. Runtime payload должен хранить:

- `protocol_id`;
- `project_root`;
- `workspace_path`;
- `base_commit`;
- `integration_branch`;
- `feature_branch`, если есть;
- `current_stage`;
- `next_action`;
- `flow_mode`: `normal` или `interactive`;
- snapshot auto policy, если она влияет на переходы.
- snapshot relevant project-policy entries, если они повлияли на Git contour, check profile, delivery route or evidence gate.

Если CLI недоступен, продолжай файлово и запиши `runtime_cli_degraded` в trace/summary.

## Следующий шаг

Для обычного протокола следующий логический stage - `specify`: уточнение задачи в problem space. Внутри него сразу выполняются baseline completeness scan и оптимизированный research/method gap pass по `mb-sdlc/specify/gap-analysis/index.md`; если substantive discussion уже достаточна, агент возвращает пользователю этот plan-ready результат, а не только факт регистрации протокола. Для интерактивного протокола следующий stage - `interactive`: пользователь и агент сразу работают в выбранном Git-контуре, а rationale изменений фиксируется в протоколе.
