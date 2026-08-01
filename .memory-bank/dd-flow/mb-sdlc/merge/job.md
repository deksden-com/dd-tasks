# Merge Job: общий контракт интеграции claimed protocol or branch bundle

Этот prompt выполняет фактический merge job для one-shot `merge.md`, branch bundle claim and long-lived `merge-start.md`.

Все три claimed route проходят через этот файл и `.memory-bank/dd-flow/mb-sdlc/merge/integrate.md`; entrypoint не должен выполнять post-integration checks в обход общего job.

Он не является пользовательским entrypoint-ом. Запускай его только после того, как CLI вернул claimed job or claimed bundle, текущая session зарегистрирована как `flow_kind: merge_job`, worker владеет merge lane lock, а included protocol runtime переведён в `integration`.

## Что прочитать

Всегда прочитай:

- `.memory-bank/project-policy.md` and any linked branch retention owner, если файл существует;
- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/lifecycle-guards.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/sdlc-contours.md`
- `.memory-bank/dd-flow/common/policy-presets.md`
- `.memory-bank/dd-flow/common/changelog.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/operational-access.md`
- `.memory-bank/dd-flow/common/workspace-bootstrap.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/common/goal-traceability.md`
- `.memory-bank/dd-flow/workers/knowledge-promotion.md`, если real merge job закрывает протокол с code/specification artifacts
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/dd-flow/workers/protocol-archive.md`
- `.memory-bank/dd-flow/mb-sdlc/merge/integrate.md`

## Preflight authority

Перед Git merge проверь и докажи:

- claimed queue job существует и принадлежит текущему `worker_id`;
- если это bundle mode, все `protocol_ids` из claim существуют, имеют queue status `claimed`, owned by текущий `worker_id`, и находятся в той же branch/worktree context;
- текущая session имеет `flow_kind: merge_job`;
- merge lane lock active и принадлежит `worker_id`;
- workspace path совпадает с registered merge workspace;
- protocol runtime stage `integration` для каждого included protocol;
- `protocol/<PRT-ID>/summary.md` существует, не пустой и содержит readiness verdict/evidence для каждого included protocol, если protocol file layout требует summary;
- Git/source branch/commit совпадают с protocol/workspace facts or bundle branch context;
- active `DEF-*`, блокирующие merge, отсутствуют;
- stale mismatch между Git/docs/run/protocol runtime/queue отсутствует.
- `Merge Guard` из `common/lifecycle-guards.md` пройден: protocol was `ready_for_merge` before claim или claimed queue job is authoritative for this worker; for bundle mode, every included protocol was ready before claim.

Если любой пункт не сходится, fail/refuse до Git merge. Не называй Git-only merge успехом.

## Интеграция

1. Выполни смысловой checklist из `.memory-bank/dd-flow/mb-sdlc/merge/integrate.md`.
2. Проведи merge/fast-forward/squash/PR delivery по проектной политике.
3. Выполни post-integration bootstrap gate через `merge/integrate.md`, который является единственным owner исполнения. До первого project check проверь созданный `<run-home>/04-merge/workspace-bootstrap-integration-receipt.md` (legacy: existing `03-merge/`). Feature receipt не переносится между путями. `bootstrap_blocked`/`bootstrap_failed` останавливают checks и идут в существующий failure/requeue path ниже; `job.md` не запускает gate повторно.
4. Выполни post-merge checks, CI/deploy/beta gates только если они требуются profile/project policy.
5. Если возник conflict resolution или integration fix, выполни review качества этих правок.
6. Обработай Merge Changelog Gate по `.memory-bank/dd-flow/common/changelog.md`: запись в changelog для принятого результата, version recommendation и явное указание, требуется ли решение пользователя о release version.
7. Выполни Delivery Decision Gate по `common/sdlc-contours.md`: зафиксируй, закрыт ли только текущий integration gate, нужен ли дальше release, deploy или publish, и какой следующий prompt/operator action корректен.
8. Перед protected remote push or remote branch deletion consume a fresh exact `operational_access` preflight. Local-only integration requires an explicit project-policy-backed `not_required`. Never login, refresh or switch provider context inside merge job.
9. Выполни Branch Cleanup Revision по project policy:
   - прочитай `project-policy.md` и linked branch retention owner;
   - найди local merged branches через `git branch --merged <integration>`;
   - найди remote merged branches через `git branch -r --merged origin/<integration>`;
   - отфильтруй disposable branches, обычно `feature/*`, с учётом project policy;
   - исключи retained branches from retention table;
   - никогда не удаляй current/integration/protected/unmerged/dirty worktree-owned branches;
   - удали безопасные merged disposable branches locally and remotely;
   - запиши deleted local, deleted remote, retained and unsafe skipped branches with reasons and command/evidence paths.
10. Создай `04-merge/stage-report.json`, `stage-report.html`, `report.md` только для real merge job. Для legacy run layout используй существующий `03-merge/`.

Перед terminal closure real merge job обязан выполнить knowledge promotion gate:

- найти `knowledge-extraction/candidates.json`, если он был создан;
- собрать code-derived knowledge из diff, code/readiness reports, changed docs/contracts/tests and evidence;
- запустить dedicated worker `.memory-bank/dd-flow/workers/knowledge-promotion.md` для nontrivial протокола;
- получить `knowledge-promotion/promotion-report.json`;
- валидировать его схемой `dd-flow/knowledge-promotion-report@1`, если schema validation доступна.

Если promotion gate выявил `blocked_promotions`, не выполняй `merge-queue complete`.

## Queue outcome order

Порядок успеха:

1. Git/project integration done.
2. Checks/evidence done.
3. Changelog/protocol summary/evidence updated.
4. Stage report data/report updated.
5. Close queue outcome:
   - single protocol: `dd-flow merge-queue complete <PRT-ID> --worker-id <worker-id> --path <merge-workspace> --summary "<pre-cleanup summary>" --json`;
   - branch bundle: `dd-flow merge bundle complete --project-root "<project-root>" --worker-id "<worker-id>" --path "<merge-workspace>" --summary "<pre-cleanup summary>" --json`.
6. Cleanup ветки/worktree/session/dashboard по политике проекта.
7. `dd-flow merge-queue note <PRT-ID> --worker-id <worker-id> --summary "<final summary after cleanup>" --json`.
8. Release/stop handling:
   - one-shot session stops after the job;
   - long-lived worker continues waiting unless stop-after-current was requested;
   - stop-after-current worker must stop and must not claim another job.

Порядок failure:

1. Зафиксируй reason.
2. Record queue failure:
   - single protocol: `dd-flow merge-queue fail <PRT-ID> --worker-id <worker-id> --path <merge-workspace> --reason "<reason>" --requeue true|false --json`;
   - branch bundle: `dd-flow merge bundle fail --project-root "<project-root>" --worker-id "<worker-id>" --path "<merge-workspace>" --reason "<reason>" --requeue true|false --json`.
3. Release/stop handling по текущему worker state.
4. Stage report or failure report must make next action explicit.

## Merge stage report

`stage-report.json` должен валидироваться схемой `dd-flow/merge-stage-report@1` и показывать:

- `invocation_mode`: `one_shot` или `long_lived_worker`;
- protocol/run/project;
- bundle mode, branch context and `protocol_ids`, if multiple protocols are claimed;
- worker status before/after;
- queue before/claimed/after/final reason;
- lane lock acquired/released/final status;
- integration source/target/commit/conflict result;
- checks/evidence;
- integration-workspace bootstrap receipt path/status;
- cleanup;
- branch cleanup revision: deleted local branches, deleted remote branches, retained branches with reasons/review dates, unsafe skipped branches with reasons and command/evidence paths;
- `operational_access` with `authorized` for protected external Git mutations or policy-backed `not_required` for local-only integration;
- knowledge promotion: candidate results, code-derived knowledge, durable writes, deferred DEFs and blocked promotions;
- delivery decision: current gate result, release/deploy/publish next action, stage/target status;
- `policy_context`: planned policy sources, workspace route, delivery/fixation strategy, required evidence and actual evidence comparison;
- final verdict and next action;
- post_flow_protocol_reminder: `.memory-bank/dd-flow/common/post-flow-protocol-reminder.md`.

HTML строится только из `.memory-bank/dd-flow/mb-sdlc/merge/stage-report-template.html`: сохраняй структуру template и заменяй только JSON внутри `script#merge-data`. Если template missing/broken или generated HTML не проходит structural/equality/render smoke, report получает `degraded_stage_report_template` и не считается готовым.

`overall.verdict: merged` is forbidden when Git fixation evidence is missing or placeholder. For Git-backed changes, `git.result_commit` and relevant integration/queue evidence must be a real result according to `policy_context.git.delivery_strategy`. Values such as `pending_batch_commit`, `pending_*`, `todo`, `not_yet` or empty result commits force `blocked`, `requeued`, `pending_git_fixation`, `branch_ready_handoff`, `local_uncommitted` or another honest non-merged status.
