# Finish: завершение интерактивного режима

Этот prompt завершает протокол `mode: interactive`. Он анализирует фактически сделанные изменения, строит hardening plan, выполняет hardening/code/readiness и доводит протокол до того же `ready_for_merge`, что обычный code-flow.

Flow origin policy: `project_local`.

`finish.md` является пользовательским entrypoint-ом, но не добавляет durable stage `finish`. Внутренние логические стадии:

```text
consolidation -> hardening -> readiness -> ready_for_merge
```

## Что прочитать сначала

Прочитай:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/sdlc-contours.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/goal-traceability.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/code/readiness.md`
- активный interactive protocol summary

## Consolidation

Восстанови факты:

- исходная цель и rationale из протокола;
- `base_commit` интерактивной сессии;
- фактический Git diff/log от `base_commit`;
- какие пользовательские цели закрывались;
- какие незапланированные изменения появились;
- какие checks/evidence уже есть;
- какие вопросы пользователя или `DEF-*` возникли.

Если перед hardening нужен вопрос пользователя верхнего уровня, переведи протокол в `waiting_for_user` с typed payload:

```yaml
reason: hardening_user_decision
question_ids: [Q-...]
return_to_stage: hardening
blocks: [code, readiness]
does_not_block: []
```

## Hardening

Сформируй и выполни hardening plan:

- привести изменения к стандартам проекта;
- убрать случайные/сиротские правки;
- обновить документы Memory Bank, сценарии, ADR или UI/docs, если изменилась долговечная истина;
- добавить или выполнить проверки;
- оформить ручные verification deferrals как `DEF-*`, если пользователь выбрал SKIP или проверка невозможна сейчас.

Для больших интерактивных накоплений можно использовать внутренние mini-stages и worker reports, но пользовательский pipeline остаётся protocol-centric.

## Readiness

После hardening выполни `code/readiness.md` как обычный gate:

- fresh checks;
- review результата;
- evidence;
- открытые `DEF-*`;
- Git/worktree/lock состояние;
- готовность к merge queue или one-shot merge.

Если verdict положительный, переведи protocol в `ready_for_merge` и добавь job в merge queue тем же механизмом, что `code/readiness.md`.

## Stage report

`finish.md` создаёт code-stage report в текущем `RUN-*`, если run workspace есть. Report должен поддерживать breadcrumbs на предыдущие stage reports и явно показывать:

- источник: `interactive_finish`;
- consolidation summary;
- hardening plan/result;
- checks/evidence;
- readiness verdict;
- queue/merge next action.

HTML строится по template code stage report, чтобы пользователь видел тот же стиль, что в обычном code-flow.
