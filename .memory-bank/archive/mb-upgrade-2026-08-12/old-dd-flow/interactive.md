# Interactive: старт интерактивного режима протокола

Этот prompt создаёт новый `PRT-*` в режиме `interactive`, где пользователь и агент сразу вносят небольшие правки в текущей сессии, а затем отдельный `finish.md` выполняет consolidation/hardening/readiness.

Flow origin policy: `project_local`.

`interactive.md` не является отдельной сущностью runtime. Это обычный протокол с `mode: interactive` и стадией `interactive`.

## Что прочитать сначала

Прочитай:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/protocol-bootstrap.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/index.md`
- `.memory-bank/mbb/sdlc-workflow.md`
- `.memory-bank/mbb/operations-release-guide.md`

## Git contour

Интерактивный режим может работать:

- в feature-ветке/worktree - рекомендуемый режим для накопления серии правок;
- напрямую в интеграционной ветке - только для маленьких обратимых правок, если проектная Git policy разрешает это.

Если интерактивный режим мутирует главную интеграционную ветку (`main`, `develop` или другую по Git policy), он должен поставить lock той ветки по той же логике, что merge-сессия: в каждый момент времени только один actor мутирует интеграционную ветку.

Зафиксируй `base_commit` до старта интерактивной работы. Новые обычные протоколы могут стартовать от этого стабильного commit-а, если интеграционная ветка сейчас заблокирована интерактивной сессией и проектная политика разрешает такой старт.

## Что фиксировать в протоколе

Во время интерактивной работы агент дописывает в протокол:

- почему правка делалась;
- какую пользовательскую цель она закрывает;
- какие решения приняты;
- какие проверки предполагаются;
- какие ручные наблюдения пользователя важны;
- какие изменения нужно будет переосмыслить на `finish`.

Не дублируй Git log. Diff и commit history покажут "что изменилось"; протокол должен объяснить "зачем" и "как проверить".

## Выход

После старта:

- `current_stage: interactive`;
- `next_action: continue_interactive_work`;
- HTML stage report не создаётся;
- пользователь получает краткий навигационный блок и правила ведения интерактивной сессии.

Для завершения интерактивного режима используй `.memory-bank/dd-flow/finish.md`.
