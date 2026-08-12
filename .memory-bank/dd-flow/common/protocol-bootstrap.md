# Protocol bootstrap

Этот общий блок читают prompt-ы, которые создают новый рабочий протокол: `protocol.md` и `interactive.md`.

## Назначение

Новый `PRT-*` создаётся только после того, как у пользователя появилась практическая задача, первичный план работ, интерактивная цель или явное намерение вести доработку. Исследовательский вопрос без задачи не создаёт протокол.

Протокол - долговечная смысловая рабочая сессия задачи. Runtime state CLI помогает продолжать работу, но не заменяет файловый протокол в Memory Bank.

## Git contour

Для практической задачи worker не выполняет Git/runtime bootstrap вручную.
Первый `stage start --bootstrap --stage specify` детерминированно возвращает
Git snapshot, compatibility, точные permission probes, protocol/RUN/workspace
aliases и session-binding result. Эти сведения авторитетны для текущей попытки.

Initial SPECIFY не выбирает feature worktree, ветку, merge lane или deployment
route: это не влияет на выявление problem-space gaps. CLI проверяет только
безопасность выбранного текущего workspace; worktree route выбирается и
создаётся в той поздней стадии, где он действительно требуется.

## Общая запись протокола

В bootstrap mode CLI создаёт минимальный scaffold протокола и raw intake.
Semantic `summary.md` генерируется при успешном `stage finish`; worker не
создаёт и не редактирует summary/index/transition как самостоятельные runtime
артефакты. Его долговечное содержание после finish должно включать:

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

CLI registration is part of `stage start`, not a worker subtask. A missing or
incompatible CLI fails the required bootstrap before semantic work; the worker
does not search for alternate binaries or hand-edit runtime files. The CLI owns
protocol/RUN fields, policy snapshots and lifecycle state.

## Следующий шаг

Для обычного протокола следующий логический stage - `specify`: уточнение задачи в problem space. Внутри него сразу выполняются baseline completeness scan и оптимизированный research/method gap pass по `mb-sdlc/specify/gap-analysis/index.md`; если substantive discussion уже достаточна, агент возвращает пользователю этот plan-ready результат, а не только факт регистрации протокола. Для интерактивного протокола следующий stage - `interactive`: пользователь и агент сразу работают в выбранном Git-контуре, а rationale изменений фиксируется в протоколе.
