# Code: реализация и готовность ветки

Этот root entrypoint является точкой входа для code/readiness части `mb-sdlc` после `specify` и `plan.md`.

Flow origin policy: `project_local`.

Сначала прочитай `.memory-bank/dd-flow/common/flow-origin.md` и проверь `.memory-bank/dd-flow/manifest.json`, если он есть. `code-flow` работает из project flow pack целевого проекта. Если pack manifest отсутствует или не валидируется, зафиксируй `project_flow_pack_degraded` в отчёте и продолжай только если все нужные support-файлы для code/readiness есть локально.

Он не заменяет детальные prompt-ы, а выбирает правильный кодовый шаг:

- если реализация ещё не выполнена, запускай `.memory-bank/dd-flow/mb-sdlc/code/implement.md`; этот prompt по умолчанию сам доводит работу через readiness gate до итогового verdict;
- если реализация выполнена, но readiness был прерван или нужно повторить gate без повторной реализации, запускай `.memory-bank/dd-flow/mb-sdlc/code/readiness.md`;
- если протокол уже `ready_for_merge`, не выполняй integration inline в code-flow; проверь worker/queue status и передай работу `merge.md` для one-shot/status/in-session wait или `merge-start.md` для долгоживущего worker-а.
- если пользователь заранее поручил "code, затем merge" в той же сессии, после успешного readiness/ready-for-merge запускай `merge.md`, но не обходи merge lane/queue CLI: ожидание занятого merge контура идёт через `dd-flow merge-queue wait-next --acquire-lock true`, а ручной `git merge` допустим только после claimed protocol, registered `merge_job` session and owned merge lane lock.

Перед выбором прочитай:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/flow-origin.md`
- `.memory-bank/dd-flow/common/lifecycle-guards.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/sdlc-contours.md`
- `.memory-bank/dd-flow/common/policy-presets.md`
- `.memory-bank/dd-flow/common/subagents.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/mbb/ai-runtime-prompt-architecture.md`, если задача затрагивает prompt-ы, model calls, agent pipeline, provider profiles, retry/repair или AI-generated artifacts

После чтения `common/runtime-cli.md` выполни CLI version/operation preflight: `dd-flow status --project-root "<project-root>" --json`. Code-flow не должен начинать mutating implementation/readiness actions при `cli.compatibility.verdict: incompatible` или при operation-level refusal для normal writes, если plan/code gate требует отсутствующее CLI поведение. В этом случае установи compatible engine/обнови CLI, остановись с blocker или создай/обнови relevant `DEF-*` по правилам `common/runtime-cli.md`. Не обходи `missing_engine`/`compatibility_preflight_failed` ручным изменением protocol state, run-index, plan state, queues, locks или dashboard artifacts.

## Язык пользовательских артефактов

Сразу после чтения `common/style.md` зафиксируй `target_language`: язык текущего пользовательского prompt-а, если пользователь явно не попросил другой язык. Все пользовательские ответы, readiness summaries, handoff-документы, stage reports, final reports и curated summaries пиши на `target_language`.

Внутренние worker packets, verifier reports, raw evidence, JSON keys, code identifiers и HTML/CSS/JS шаблоны могут оставаться английскими. Если внутренний материал показывается пользователю напрямую, синтезируй или переведи пользовательский слой на `target_language`.

Субагентов использовать разрешено при необходимости. `code-flow` может поручать реализацию независимым code-workers и обязан использовать verifiers/readiness reviewers там, где риск, `task_profile`/`flow_profile.execution` или `code/readiness.md` этого требуют. Если выбран compact solo-проход, объясни причину в отчёте.

Перед выбором `code/implement.md` или `code/readiness.md` выполни active DEF preflight из `common/memorybank.md`. Если relevant `DEF-*` блокирует реализацию или readiness, не обходи его: закрой, обнови, вынеси в blockers или зафиксируй как non-blocking для текущего gate. Code-flow не должен объявлять readiness, если merge-blocking DEF остался без решения.

Если plan/specification handoff содержит `knowledge-extraction/candidates.json`, прочитай его и веди candidate trace:

- какие `KND-*` реализованы или задокументированы;
- какие оказались task-local only;
- какие требуют `DEF-*`, manual/user confirmation или merge-time verification;
- какие уже covered существующим Memory Bank.

Code flow не выполняет final promotion в durable Memory Bank как закрывающий gate. Он может обновлять docs в рамках реализации, но merge promotion затем должен отметить такие пункты как `already_documented` или проверить write quality.

Определи активный протокол, `task_profile`/`flow_profile`, Git-контур, рабочее дерево и текущее состояние plan graph, если он есть в `dd-flow` CLI.

Перед выбором `code/implement.md` или `code/readiness.md` примени `Code Guard` из `common/lifecycle-guards.md`. `code-flow` нельзя использовать как обход `specify`/`plan`: для нетривиальной задачи должен быть fresh specification и готовый plan handoff, либо компактный маршрут с явным degraded/compact reason.

Если predecessor gate отсутствует, остановись:

```text
blocked: code_flow_requires_plan_ready
current protocol state: <state>
missing: plan stage report / ready_for_code transition / workspace
next safe action: run plan flow
```

Если пользователь явно попросил `code`, но protocol state ещё `registered`/`specify`/`plan_blocked`, не запускай реализацию автоматически. Можно предложить безопасный следующий flow (`specify` или `plan`), но не менять scope и не писать код.

Если пользователь явно выбрал существующий `PRT-*`, особенно member protocol из `PSET-*`, перед code routing используй `protocol-implement.md` contract or equivalent preflight: прочитай protocol frontmatter, `blocked_by_protocols`, `protocol_set`, related context and coding standards sources. Если CLI доступен, выполни `dd-flow protocol implement "<PRT-ID>" --project-root "<project-root>" --json` and respect blockers/terminal/active-session diagnostics.

Найди Flow Run handoff из последней плановой стадии. Сначала используй `dd-flow run status --json` / `run-index.json` и получи `<run-home>` плюс `stage_runs[*]`; не реконструируй paths вручную, если CLI evidence доступен:

- `<run-home>/run-index.json`;
- `<run-home>/01-specify/stage-report.json`, если run использует specification stage;
- `<run-home>/01-specify/stage-report.html`, если есть;
- `<run-home>/02-plan/stage-report.json` или legacy `<legacy-run-dir>/01-plan/stage-report.json`;
- `<run-home>/02-plan/stage-report.html` или legacy `<legacy-run-dir>/01-plan/stage-report.html`;
- ссылки на них в `protocol/<PRT-ID>/summary.md` или пользовательском сообщении.

Legacy fallback из старой плановой стадии:

- `.tasks/dd-flow-runs/<RUN-ID-slug>/run-index.json`;
- `.tasks/dd-flow-runs/<RUN-ID-slug>/02-plan/stage-report.json`;
- `.tasks/dd-flow-runs/<RUN-ID-slug>/02-plan/stage-report.html`;
- `.tasks/plan-.../plan-stage-report.json`;
- `.tasks/plan-.../stage-report.html`;
- ссылки на них в `.tasks/plan-.../phase-summary.md` или `protocol/<PRT-ID>/summary.md`.

Если run-index есть, используй его для breadcrumbs и stage artifact discovery. Если stage report есть, используй его как компактную карту code-flow: проверь `overall.verdict`, `route`, `graph`, `aspects`, `plan_items` и `handoff.must_read` перед выбором `code/implement.md` или `code/readiness.md`. Если stage report говорит `needs_user_decision`, `plan_blocked` или `degraded`, не начинай реализацию без снятия причины.

Если stage report содержит `policy_context` top-level или внутри `sdlc_contours`, считай его обязательным handoff: проверь actual branch/workspace against `policy_context.git.workspace_route`, actual work against `policy_context.git.delivery_strategy`, check profile and next delivery gate. Любое отклонение зафиксируй до реализации или readiness; не меняй route/strategy молча.

Если stage report отсутствует, это не всегда blocker для legacy/short/no-plan маршрута, но ты должен явно указать причину отсутствия. Для `route.planning: full_plan` отсутствие `plan-stage-report.json` или `stage-report.html` считается неполным handoff, если нет явного объяснения в протоколе.

Не используй `code.md` как обход specification/plan gates. Если нет свежей specification для нетривиальной задачи, вернись к `protocol.md`/`specify`. Если `route.planning: full_plan`, но план не завершён, вернись к `plan.md`. Если feature-worktree требуется, но текущий `pwd -P` не совпадает с workspace `worktree_path`, остановись и дай команду перезапуска в правильном checkout.

Не используй Stop hook как штатный переход между implementation и readiness. Stop hook только продолжает прерванный code-flow по runtime state.

Старый путь `.memory-bank/dd-flow/code/` является compatibility alias на `.memory-bank/dd-flow/mb-sdlc/code/`.

В финальном докладе укажи, какой детальный prompt был выбран или почему code-flow остановлен:

- `prompt: code.md`
- `current_stage`
- `completed_stage`
- `next_action`
- `protocol`
- `route`
- `blockers`
- `active_def`
- `user_decision_required`
- `post_flow_protocol_reminder: .memory-bank/dd-flow/common/post-flow-protocol-reminder.md`
- `related_protocols`: compact `PSET-*` board with ready/blocked/running-or-claimed/done members, если текущий protocol has `protocol_set`.
