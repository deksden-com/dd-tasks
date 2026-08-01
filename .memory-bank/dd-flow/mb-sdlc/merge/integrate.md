# Integration checklist: интеграция, бета и итоговая приемка claimed job or bundle

Этот файл не является самостоятельным пользовательским entrypoint-ом. Его вызывает `.memory-bank/dd-flow/mb-sdlc/merge/job.md` после того, как CLI уже claim-нул один merge job или branch bundle, текущая session зарегистрирована как `flow_kind: merge_job`, worker владеет merge lane lock, а included protocol runtime находится в `integration`.

Если файл запущен напрямую из обычной planning/implementation/current-session без claimed queue job, остановись и передай пользователя к:

- `.memory-bank/dd-flow/merge.md` для current-session one-shot/status;
- `.memory-bank/dd-flow/merge-start.md` для долгоживущего project merge worker;
- `.memory-bank/dd-flow/merge-stop.md` для остановки worker-а.

Не выполняй Git merge из прямого запуска `merge/integrate.md`.

Прочитай общие правила:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/sdlc-contours.md`
- `.memory-bank/dd-flow/common/policy-presets.md`
- `.memory-bank/dd-flow/common/changelog.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/operational-access.md`
- `.memory-bank/dd-flow/common/workspace-bootstrap.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/common/goal-traceability.md`
- `.memory-bank/dd-flow/common/semantic-grounding.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/dd-flow/workers/protocol-archive.md`
- `.memory-bank/dd-flow/common/browser-verification.md`

Затем прочитай в MBB:

- `.memory-bank/mbb/operations-release-guide.md`
- `.memory-bank/mbb/scenario-docs-guide.md`
- `.memory-bank/mbb/scenario-runner-guide.md`
- `.memory-bank/mbb/verification-matrix-guide.md`
- `.memory-bank/mbb/named-deferrals-guide.md`
- `.memory-bank/mbb/cross-references.md`

## Язык пользовательских артефактов

Зафиксируй `target_language` по `common/style.md`: язык текущего prompt-а или язык claimed protocol/job. Все пользовательские ответы, merge/integration summaries, stage reports, final reports и visible user-facing content пиши на `target_language`; внутренние review packets, raw evidence, JSON keys, code identifiers и HTML/CSS/JS templates могут оставаться английскими.

Выполненные доработки нужно интегрировать по правилам проекта и по актуальному `flow_profile`.

Если `merge/integrate.md` выполняется внутри claimed merge job и доступен `dd-flow` CLI, зарегистрируй merge job session по `common/runtime-cli.md`:

- `flow_kind: merge_job`;
- `continuation_policy: merge_job`;
- `current_stage: integration`;
- `worker_id`: worker, который claimed job;
- `next_action`: текущий integration gate.

Найди subject coding `RUN-*` через protocol summary, run-index, queue metadata or code-stage handoff. Claimed merge job должен прикрепляться к этому run, а не создавать независимый semantic run, если это продолжение той же coding цепочки. For branch bundle mode, выбери primary RUN по current/first protocol and list all included protocol ids in merge report; do not hide secondary protocol evidence. Long-lived `merge_worker` session может иметь собственную диагностическую session запись, но `03-merge` stage принадлежит subject coding run.

В начале integration stage:

```bash
dd-flow run attach-stage "<RUN-ID>" --project-root "<project-root>" --stage merge --dir 03-merge --status running --data-schema-id dd-flow/merge-stage-report@1 --json
```

Если проект использует `dd-flow` merge queue, `merge/integrate.md` нельзя запускать из обычной `planning` или `implementation` session. Перед любыми merge-действиями проверь, что job or bundle уже claimed в очереди, текущий `worker_id` совпадает с claimed owner for every included protocol, session зарегистрирована как `merge_job`, а `workspace_path` является merge workspace проекта. Если эти условия не выполнены, остановись с навигационным блоком и передай работу `merge.md`; не пытайся перерегистрировать текущую implementation session в merge role.

Перед любыми merge-действиями найди и проверь `.memory-bank/protocol/<PRT-ID>/summary.md` в feature workspace или в ожидаемом canonical protocol location for each included protocol. Summary должен быть непустым и содержать readiness verdict/evidence. Если summary отсутствует или пустой, не мержи: это blocker `missing_feature_worktree_protocol_summary` или failure job-а по policy.

Integration gate в первую очередь выполняет верификацию интегрированного состояния: результат должен соответствовать исходной задаче и gate уже после merge, CI, deploy или beta. Ревью качества на integration gate повторяется только там, где появились новые изменения: conflict resolution, интеграционные фиксы, правки deploy-конфигурации, сценариев или evidence.

## Применение flow profile

Найди последний актуальный `flow_profile` в протоколе, отчёте `implementation`, отчёте `readiness` или `.tasks/...`.

Применяй профиль так:

- `route.git: feature_worktree` - нужен merge feature-ветки из рабочего дерева в интеграционную ветку по проектной политике.
- `route.git: integration_branch_direct` - merge неприменим; проверь только те интеграционные действия, которые реально были нужны: commit, push, CI, deploy.
- `policy_context.git.delivery_strategy` - выбери и проверь evidence для фактической фиксации результата. Для `direct_commit` нужен реальный commit SHA, для `direct_commit_push` ещё и push evidence, для PR/queue/merge strategies нужен target/queue/PR evidence, а `local_only`/`external_handoff` не могут называться `merged`.
- `workspace` - используй feature branch, worktree path, integration branch и base commit из протокола; не мержи "похожую" ветку, если она не связана с текущим протоколом.
- `route.delivery: local` - не делай preview/beta/production без причины; ограничься локальным закрытием и отчётом.
- `route.delivery: preview` - проверь preview и собери доказательства.
- `route.delivery: beta` - после интеграции дождись beta и запусти сценарии/проверки, которые закрывают gate.
- `route.delivery: production` - не проходи production gate без проектной политики, rollback-плана и явного допуска.
- `route.ci: if_push` - проверь CI, если был push, PR или merge.
- `route.ci: required` - CI является gate; без результата нужен `DEF-*`.
- `evidence.level: rollout_evidence` - собери доказательства CI/deploy/beta/production/rollback readiness.
- `verification.plan.scenarios: acceptance_gate` - сценарии должны быть выполнены и связаны с паспортом проверки или `DEF-*`.

Если профиль отсутствует, восстанови его кратко из фактической работы и явно укажи допущения.

## Delivery Decision Gate

Перед финальным merge verdict раздели результат:

- source integration: что попало в интеграционную ветку;
- release fixation: нужен ли release set/version/changelog/tag/release notes сейчас или позже;
- deploy delivery: нужен ли deploy на named stage сейчас или позже;
- publish hybrid: есть ли операция, где release и delivery неразделимы;
- verification: какие gates закрыты evidence, какие перенесены в DEF.

Merge stage может закрыть только текущий gate. Если следующий честный шаг - release/deploy/publish, укажи его как `next_action`, не называя его выполненным.

## Git Fixation Gate

Перед `overall.verdict: merged` проверь `policy_context.git.delivery_strategy` against actual Git state:

- `direct_commit`: tracked durable changes are committed and `git.result_commit` is a real commit SHA reachable from the integration branch.
- `direct_commit_push`: `direct_commit` evidence plus remote/push evidence is present.
- Before protected remote push, PR mutation, tag/release operation or remote branch deletion, consume a fresh exact `operational_access` result from `common/operational-access.md`. Local-only integration may use project-policy-backed `not_required`. Missing, ambiguous, stale or mismatched context blocks before mutation; never auto-login, refresh credentials or switch account/organization/repository context.
- `feature_merge`, `squash_merge`, `rebase_ff`: target branch contains the result commit according to project policy.
- `pull_request`: PR state and target branch evidence prove delivery; an open PR is only handoff.
- `merge_queue`: queue completion and target branch evidence prove delivery.
- `release_branch`: source integration is recorded, release gate remains separate unless policy says otherwise.
- `external_handoff`: record handoff evidence and do not use `merged`.
- `local_only`: record local-only acceptance and do not use `merged`.
- `no_git`: record why Git evidence is not applicable.

Reject placeholder evidence for `merged`: `pending_batch_commit`, any `pending_*`, `todo`, `not_yet`, empty commit fields, dirty worktree without local-only verdict, or branch-ready/PR/queue handoff represented as target delivery.

## Слияние

Изучи проектный поток Git (git flow) и определи интеграционную ветку, обычно это `develop`, если `flow_profile.route.git` требует merge.

If CLI returned `branch_context`, use it as the mechanical branch board:

- list every included protocol id;
- verify `merge_bundle.claimable` was true before claim or every included protocol is now queue-claimed by the worker;
- if the branch contains not-ready protocols, stop unless the claim explicitly excluded them with recorded user-approved risk;
- perform one Git integration for the branch/worktree, not repeated manual merges per protocol.

Во время слияния (merge):

- проверь состояние рабочей ветки;
- выполни слияние по проектной политике;
- реши конфликты без отката чужих изменений;
- после фактической интеграции и до первого project-owned post-merge check как единственный execution owner произведи или revalidate `<run-home>/04-merge/workspace-bootstrap-integration-receipt.md` для реального integration checkout по `common/workspace-bootstrap.md`; receipt из feature worktree не переиспользуется через другой path;
- повтори обязательные проверки после слияния;
- проверь, что интеграционная ветка всё ещё достигает операционной цели протокола, а не только содержит коммиты feature-ветки;
- если при merge появились ручные правки или conflict resolution, выполни ревью качества этих правок до продолжения;
- исправь выявленные недостатки и повторяй проверки до чистого результата.

Если интеграция изменила relevant bootstrap inputs, rebootstrap integration checkout до проверок. `bootstrap_blocked` или `bootstrap_failed` запрещают checks/closure и обрабатываются через failure/requeue order в `merge/job.md`; не меняй queue, lock или session semantics.

## Уборка веток после успешного merge

Перед уборкой веток прочитай `.memory-bank/project-policy.md` и any linked branch retention owner. Если retention owner required by project policy is missing, unreadable, malformed or contradictory, fail safe: не удаляй ветки и запиши skipped cleanup with reason in merge report.

Если retention table отсутствует или пуста, это значит no retention exceptions. Это не значит "сохранить все ветки".

После успешного merge/fixation выполни general branch revision, not only current source branch cleanup:

```bash
git branch --merged <integration>
git branch -r --merged origin/<integration>
```

Из результата выбери disposable branches по project policy, обычно `feature/*`. Для каждой candidate branch запиши один из результатов:

- `deleted_local` - локальная ветка доказанно merged, disposable, не current/integration/protected, не retained и не владеет dirty worktree;
- `deleted_remote` - remote branch доказанно merged into `origin/<integration>`, disposable, not retained and safe to delete;
- `retained` - branch listed in retention exceptions, with reason and review date when available;
- `skipped_unsafe` - deletion guard triggered: current branch, integration/protected branch, unmerged branch, dirty worktree-owned branch, non-disposable pattern, missing required retention source or contradictory policy.

Если рабочая ветка была создана для текущего протокола и проектная политика не запрещает удаление веток, после успешного merge удали её локально и в `origin` as part of the same general revision.

Если проект использует `dd-flow` merge queue, не удаляй feature worktree или feature branch до успешного закрытия runtime job через `dd-flow merge-queue complete` или фиксации failure через `merge-queue fail`. Сначала должны быть обновлены protocol summary/evidence, выполнены post-merge checks и зафиксирован queue outcome. Только после этого можно делать cleanup ветки/worktree.

Перед `merge-queue complete` снова проверь, что protocol summary/evidence обновлены в файловом Банке памяти. Complete без файлового closure запрещён, даже если Git merge и проверки прошли.

Причина: feature worktree является disposable checkout, а runtime state должен быть стабильным. Пока CLI полностью не перешёл на stable runtime state, раннее удаление worktree может удалить worktree-local `state.json` и сломать `merge-queue complete`. Даже после перехода на stable runtime state порядок "complete first, cleanup after" остаётся стандартом приёмки.

После cleanup, если job был закрыт через `merge-queue complete`, обнови финальную queue note:

```bash
dd-flow merge-queue note "<protocol-id>" --worker-id "<worker-id>" --summary "<merged, pushed, checked, cleanup done/skipped final summary>" --json
```

Финальная `last_reason` должна описывать уже завершённый cleanup или явную причину его пропуска. Не оставляй `pending cleanup` как итоговый queue reason.

После cleanup также обнови protocol summary до финального состояния:

- `current_stage/status: closed`;
- `queue_status: merged`;
- `next_action`/`next_step: none`;
- commit/push/cleanup status;
- deleted/retained/skipped branch cleanup summary;
- ссылка на post-cleanup trace/evidence.

Создай короткий post-cleanup trace/evidence в `protocol/<PRT-ID>/trace/` или `evidence/`, где зафиксированы queue completion, push, worktree/branch cleanup, lock release и dashboard refresh. Это нужно, чтобы cleanup order был доказан файловым протоколом, а не только audit/runtime state.

Перед удалением проверь:

- изменения рабочей ветки действительно попали в интеграционную ветку;
- нет незамерженных коммитов, которые потеряются;
- запрос на слияние (pull request) закрыт или смержен;
- проектный Банк памяти не требует сохранять ветку.
- branch не указан в retention exceptions или review date не требует повторного решения пользователя.
- текущий процесс действительно владеет веткой и рабочим деревом;
- рабочее дерево не является внешне управляемым harness-workspace или detached HEAD без ясного владельца.

По умолчанию ветку нужно удалить: раз процесс её создал, процесс должен убрать след после завершения. На GitHub удалённую ветку обычно можно восстановить из закрытого запроса на слияние, поэтому сохранение каждой завершённой feature-ветки не является обязательным.

Не удаляй ветку, если:

- это запрещено правилами проекта;
- ветка нужна для release/hotfix;
- в ней остались незамерженные изменения;
- пользователь явно попросил сохранить её;
- не удалось подтвердить, что merge завершён.
- рабочее дерево создано не текущим процессом или находится вне проектно принятой папки.

В итоговом докладе явно укажи, удалена ли локальная и удалённая ветка, и почему.

Merge stage report cleanup rows must be automation-friendly even without schema changes. Use explicit row names:

- `branch cleanup policy read`;
- `merged local branch revision`;
- `merged remote branch revision`;
- `deleted local branches`;
- `deleted remote branches`;
- `retained branches`;
- `unsafe skipped branches`.

Each row should include `status` and `evidence`. Evidence may be a command log, curated trace, or merge report section that lists branch names and reasons.

## Бета и сценарии

После интеграции проверь систему на нужном стенде, если проект имеет такие ворота (gate):

- убедись, что проверяется правильная ветка, коммит (commit) и окружение;
- дождись нужной выкладки (deploy);
- проверь ручку здоровья (health endpoint) или иной признак идентичности окружения (environment identity);
- запусти сценарии, которые закрывают сделанные фичи;
- сопоставь результаты сценариев с матрицей цели и ограничений;
- собери доказательства (evidence) по каждому сценарию;
- обнови матрицу проверки и протокол.

Если интеграционный gate включает UI, browser smoke или visual proof, перед проверкой выбери браузерный маршрут по `.memory-bank/dd-flow/common/browser-verification.md`: `cmux-browser`, если доступен cmux browser surface; иначе `agent-browser`, если доступен; иначе project-native e2e runner; иначе честно downgrade до HTTP/source smoke только если gate это допускает. В паспорте проверки укажи выбранный маршрут, probes доступности, URL, commit и ограничения evidence.

Если для browser/HTTP smoke нужен локальный dev server, запускай его только как managed background process по `.memory-bank/dd-flow/common/browser-verification.md`: явный порт, лог, PID, bounded health-check и cleanup. Запрещено запускать `pnpm dev`, `npm run dev`, `vite`, `next dev` или аналогичный сервер foreground-командой в tool call.

Если сценарный раннер, проверяющий агент или ручная проверка оставили материалы в `.tasks/`, `.scenario-runs/` или другом runtime-каталоге, перед итоговым докладом создай паспорт проверки (verification passport) в `protocol/<PRT-ID>/evidence/` или `evidence/`.

Если browser/UI evidence использует cmux, `agent-browser`, Playwright screenshots, DOM snapshots или текстовые dumps, до cleanup feature worktree сделай durable promotion: скопируй важные raw artifacts в `protocol/<PRT-ID>/evidence/`/`trace/` или внеси curated summary в паспорт проверки. Не оставляй verification passport, который ссылается только на `.tasks/...` внутри удаляемого worktree.

## Knowledge Promotion Gate

До `merge-queue complete`, cleanup disposable worktree или terminal protocol closure выполни promotion pass:

1. Прочитай `knowledge-extraction/candidates.json`, если он есть.
2. Собери code-derived knowledge from changed prompts/code/docs/tests/contracts and readiness evidence.
3. Запусти dedicated worker `.memory-bank/dd-flow/workers/knowledge-promotion.md` для write-plan/report.
4. Запиши `<run-home>/04-merge/knowledge-promotion/promotion-report.json` и `.md`.
5. Валидируй `promotion-report.json` against `dd-flow/knowledge-promotion-report@1`, если CLI доступен.
6. Примени approved durable Memory Bank writes или оформи `DEF-*`.
7. В merge stage report запиши `knowledge_promotion`.

Если code stage уже задокументировал знание в правильном durable layer, не дублируй его: отметь `already_documented`.

Минимум паспорта проверки:

- `passport_id`;
- `proof_id` или устойчивый run id;
- сценарий и версия;
- branch/commit;
- среда и контур доказательства;
- verdict;
- ссылки на proof bundle или runtime artifacts, если они хранятся вне Банка памяти;
- что доказано и что не доказано.

Матрица проверки и протокол должны ссылаться на паспорт проверки, а не на `.tasks/...` или сырой runtime artifact.

Если бета-стенд (beta) или внешний контур недоступны, оформи `DEF-*`: что именно не проверено, почему, что это блокирует и какие следующие ворота (gate).

## Итоговый вердикт по цели

После слияния (merge), проверок и применимых стендовых ворот дай итоговый вердикт:

- `goal_achieved` - цель достигнута в интеграционной ветке или на нужном стенде;
- `goal_partially_achieved` - часть цели закрыта, остаток оформлен как `DEF-*`;
- `goal_blocked` - цель не достигнута, дальнейшие ворота нельзя честно проходить;
- `goal_changed` - цель изменилась по явному решению пользователя или ADR.

Вердикт должен объяснять, какие исходные ограничения были проверены, какие сценарии и паспорта проверки это подтверждают, и что остаётся за пределами текущих ворот.

Для meaningful protocol summary также перечисли semantic spine closure: user outcome, затронутая system/module responsibility, сохранённые non-goals and constraints, доказанный evidence level и то, что evidence не доказывает. Не заменяй этим список проверок: это его смысловая интерпретация.

## Changelog и рекомендация версии

После успешной интеграции и свежих проверок выполни Merge Changelog Gate по `.memory-bank/dd-flow/common/changelog.md`.

Правила:

- построй changelog target matrix по `.memory-bank/dd-flow/common/changelog.md` для каждого затронутого repository/package/artifact/release surface;
- если изменение заметно пользователю, операторам, downstream-проектам или агентным flow, обнови changelog/release-note source каждого применимого target: manual `CHANGELOG.md` в `Нераспределено`/`Unreleased`, `.changeset/*`, release note fragment, conventional commit/PR metadata or local equivalent;
- если `code/readiness` подготовил draft entry, сверяй его с фактически принятым merge result и правь по фактам;
- не присваивай новую версию без явного решения пользователя или проектной release policy;
- если пользователь или policy разрешили version bump, обнови все targets из `Version Map` и запусти проверки по изменённым файлам;
- если version bump не выполнялся, в отчёте предложи следующий release step и рекомендуемый bump: `patch`, `minor`, `major` или `none`.

Для текущего канона `dd-memorybank` версия ведётся в `VERSION`, `CHANGELOG.md`, `index.md`, `README.md` и `mbb/index.md`; эти места должны совпадать при release bump.

## Merge stage report handoff

После merge/integration gate создай stage completion report merge-фазы:

```text
<run-home>/04-merge/stage-report.json
<run-home>/04-merge/stage-report.html
<run-home>/04-merge/report.md
```

Для legacy run layout используй существующие `03-merge/*` пути.

`stage-report.json` должен соответствовать `.memory-bank/dd-flow/schemas/merge-stage-report.schema.json` (`schema_id: dd-flow/merge-stage-report@1`) и показывать:

- claimed job/protocol;
- source branch/commit and target branch;
- conflict status and integration result;
- post-merge checks;
- push/CI/deploy status, если применимо;
- `operational_access` using `dd-flow/operational-access-preflight@1`; `merged` requires `authorized` for protected external Git mutation or policy-backed `not_required` for a local-only operation;
- cleanup status;
- final queue outcome/reason;
- delivery decision and next release/deploy/publish action, если применимо;
- Git Fixation Gate result and evidence required by `policy_context.git.delivery_strategy`;
- final verdict, remaining `DEF-*` and next action.
- changelog target matrix, changelog entry status, version recommendation and version bump status, если эти поля поддерживаются текущей схемой; иначе включи их в `report.md` и protocol summary.
- related protocol set status, если claimed protocol has `protocol_set`: ready, blocked, running/claimed and done member protocols, using `dd-flow protocol ready --project-root "<project-root>" --json` when available.

`stage-report.html` генерируй на основе `.memory-bank/dd-flow/mb-sdlc/merge/stage-report-template.html`: замени JSON внутри `<script id="merge-data" type="application/json">` на validated `stage-report.json`.

Применяй общий контракт `.memory-bank/dd-flow/common/flow-runs.md` / `Stage Report Chain`: HTML-отчёт является инстансом установленного template, а не новой страницей. Сохраняй визуальную структуру, CSS/JS, DOM anchors и render functions template; меняй только embedded JSON и stage-visible text из data. Если template отсутствует, не читается, не содержит `script#merge-data`, generated HTML не похож на template, browser/DOM smoke падает или embedded JSON не равен standalone data, это `blocked`/`degraded_stage_report_template`; не называй merge stage report готовым.

Проверки:

- `dd-flow schema validate --schema merge-stage-report --file <stage-report.json> --project-root <project-root> --json`;
- embedded JSON equals standalone `stage-report.json`;
- HTML создан из `.memory-bank/dd-flow/mb-sdlc/merge/stage-report-template.html`, содержит `script#merge-data` и обязательные template anchors/render functions;
- stage report visible text/browser smoke or explicit degraded reason;
- breadcrumbs link to specification, plan and code stage reports if they exist; legacy breadcrumbs may still link to `01-plan/stage-report.html` and `02-code/stage-report.html`.

Перед integration и перед `merge-queue complete` проверь `dd-flow protocol status "<protocol-id>" --json`. Если diagnostics содержит `protocol_run_stage_mismatch` severity `error`, не продолжай merge: сначала выполни безопасный repair через `dd-flow protocol sync-from-run` или останови job как failed/requeued с понятной причиной. Merge stage не должен скрывать registered-but-merged или stale RUN/protocol state.

В конце merge stage:

```bash
dd-flow run complete-stage "<RUN-ID>" --project-root "<project-root>" --stage merge --status done --data 04-merge/stage-report.json --stage-report 04-merge/stage-report.html --report 04-merge/report.md --json
dd-flow run complete "<RUN-ID>" --project-root "<project-root>" --status done --verdict accepted --next-action none --json
```

## Архивный sweep

После итогового вердикта обнови summary текущего протокола: итоговый статус, lifecycle, `closed_at`, `archive_after`, merge/deploy/beta evidence, открытые `DEF-*` и следующий gate.

После успешного `dd-flow merge-queue complete` ожидаемое runtime-состояние протокола - terminal `closed/closed/none`. Если CLI вернул merged queue job, но `dd-flow protocol status` показывает `integration/running/run_integration`, зафиксируй runtime closure finding и не называй stage report здоровым.

Если работа закрыта, запусти архивный sweep через субагента на `gpt-5.4-mini` с каноническим worker-session packet: `common_prompt: .memory-bank/dd-flow/common/worker-session.md`, `worker_prompt: .memory-bank/dd-flow/workers/docs.md`, `role_prompt: .memory-bank/dd-flow/workers/protocol-archive.md`, fresh session, `memory_bank_root`, `trigger`, `current_date`, `current_protocol`, лимит, bounded `read`/`write`, `write_report_to`, constraints и checks. Оркестратор остаётся acceptance owner: он проверяет diff и отчёт, не принимает неполный результат и при сбое передаёт replacement worker-у failure note, partial artifacts и отдельный recovery report path. Архиватор обновляет индексы, переносит устаревшие безопасные закрытые протоколы и создаёт обычный `DEF-*`, если обязательное архивирование заблокировано.

Оркестратор проверяет diff архиватора перед принятием результата. Если архиватор создал `DEF-*`, включи его в итоговый доклад.

## Итоговый доклад

Доложи:

- навигационный блок из `.memory-bank/dd-flow/common/style.md`: `prompt: merge/integrate.md`, протокол, текущая стадия, завершённая стадия, следующий шаг, маршрут, блокеры, активные `DEF-*`, необходимость решения пользователя;
- как прошло слияние;
- был ли merge применим по `route.git`;
- достигнута ли операционная цель после интеграции и на каком вороте это доказано;
- какие проверки выполнены после слияния;
- как верифицировано интегрированное состояние относительно исходной цели;
- было ли нужно ревью качества новых merge/deploy-правок;
- как прошла выкладка (rollout) на бета-стенд (beta) или почему она не применима;
- какие сценарии запускались;
- какие доказательства собраны;
- какие паспорта проверки созданы и какие runtime-артефакты остались вне Банка памяти;
- как обновлён changelog, какая version recommendation дана, была ли присвоена новая версия и какие Version Map targets обновлены;
- какие `DEF-*` остаются;
- удалена ли рабочая ветка локально и в `origin`;
- если проект использует merge queue, был ли `merge-queue complete/fail` выполнен до cleanup feature worktree/branch;
- как обновлён протокол и запускался ли архивный sweep;
- какие блоки `flow_profile` применены, повышены или оказались неприменимы;
- готова ли система к следующим воротам (gate), включая допуск к продуктовому окружению (production approval), если он предусмотрен.

В финальном докладе укажи:

```text
integration gate завершён
```
