# Merge: текущая сессия или статус очереди

Этот root entrypoint является безопасным operator entrypoint-ом для merge stage `mb-sdlc` после `code/readiness.md`.

Flow origin policy: `project_local`.

## Смысл

`merge.md` больше не стартует долгоживущую merge-сессию проекта. Он работает в текущей сессии:

- если долгоживущий merge worker уже активен, занят, останавливается или есть активный merge lock/claimed job, prompt делает только status report;
- если active worker/lock/claim нет, prompt может выполнить one-shot для одного готового protocol или branch bundle claim для пачки ready protocols в текущей feature branch/worktree;
- если пользователь явно поручил in-session `code -> merge` и merge lane сейчас занята, prompt не делает ручной merge: он либо отдаёт status-only при active worker, либо регистрирует merge worker/session и ждёт через `dd-flow merge-queue wait-next --acquire-lock true` с bounded timeout;
- если job-ов нет, prompt сообщает no-job/status и не создаёт merge stage report.

Status-only путь не берёт lock, не claim-ит job, не запускает Git merge и не создаёт merge stage report (`04-merge/stage-report.*` в новом layout, `03-merge/stage-report.*` в legacy layout).

```text
stage_report: N/A - status-only; no merge job ran
```

Если пользователь говорит "оформи протокол" / "пропиши протокол" / "сделай протокол" / "создай протокол", `merge.md` не является подходящим entrypoint-ом. Сразу прочитай и выполни `protocol.md`, который создаёт или обновляет `PRT-*` и переводит задачу в `specify`; только после `plan`, `code/readiness` и `ready_for_merge` допустим merge.

## Что прочитать

Всегда прочитай:

- `.memory-bank/project-policy.md` and any linked branch retention owner, если файл существует;
- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/flow-origin.md`
- `.memory-bank/dd-flow/common/lifecycle-guards.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/sdlc-contours.md`
- `.memory-bank/dd-flow/common/policy-presets.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/common/goal-traceability.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/dd-flow/common/post-flow-protocol-reminder.md`
- `.memory-bank/dd-flow/mb-sdlc/merge/job.md`

После чтения `common/runtime-cli.md` выполни CLI version/operation preflight через `dd-flow status --project-root "<project-root>" --json`. Merge one-shot/worker не должен claim-ить job или брать lane lock при `cli.compatibility.verdict: incompatible` или operation-level refusal для normal writes, если установленный CLI/engine может некорректно обработать queue/lock/stage transition. В этом случае report status-only с blocker/update command. Не выполняй ручной merge, queue update, lane lock или protocol close как обход CLI compatibility gate.

Субагентов использовать разрешено при необходимости: для независимого diff/evidence review, conflict review, browser proof или cleanup/queue/lock проверки. Не используй субагентов для ожидания пустой очереди.

## Язык пользовательских артефактов

Зафиксируй `target_language` по `common/style.md`: язык текущего prompt-а или язык claimed protocol/job. Все пользовательские ответы, merge summaries, status reports, stage reports и curated summaries пиши на `target_language`.

## Алгоритм

1. Определи `project_root`:
   - если текущая папка внутри Git-репозитория с `.memory-bank/`, используй Git root;
   - если текущая папка сама содержит `.memory-bank/`, используй её;
   - если выбрать проект нельзя, остановись и попроси `project_root`.
2. Проверь project/runtime status and branch context:

   ```bash
   dd-flow project status --root "<project-root>" --json
   dd-flow merge status --project-root "<project-root>" --path "<workspace>" --json
   dd-flow merge bundle status --project-root "<project-root>" --path "<workspace>" --json
   ```

   До любой cleanup-логики прочитай `project-policy.md` как policy hub. Если `project-policy.md` ссылается на отдельный branch retention owner, прочитай его тоже. Не считай generic Memory Bank index достаточным источником для этого gate.

   Branch cleanup defaults:

   - missing or empty branch retention exceptions mean no retained branches;
   - if project policy requires a separate retention owner and it is missing, unreadable, malformed or contradictory, fail safe: skip deletion and report the reason;
   - retained branches must be reported with their reasons and review dates when known.

3. Если `merge.status.merge_worker.state` не `clear` и нет явного in-session wait intent, остановись status-only:
   - покажи active worker/claimed job/lock reason;
   - покажи queue position/status;
   - дай следующий корректный шаг: ждать worker, запустить `merge-stop.md`, или исправить blocker;
   - не создавай `03-merge` report.
   Если есть явный in-session wait intent, active long-lived worker всё равно не обходится: доложи status-only и объясни, что worker уже владеет merge контуром. Если blocker только в занятости merge lane без active worker/session, допускается зарегистрировать текущую session как `merge_worker` и ждать через CLI:

   ```bash
   dd-flow merge-queue wait-next --project-root "<project-root>" --worker-id "<worker-id>" --path "<project-root>" --timeout 300 --poll-interval 10 --acquire-lock true --json
   ```

   Интерпретируй `outcome: wait_timeout` как штатное ожидание/повтор bounded wait, `outcome: blocked` как blocker, `stopped: true` как stop-only, `outcome: claimed` как handoff в `merge/job.md`. Не выполняй `git merge` без claimed protocol, registered `merge_job` session and owned merge lane lock.
4. Примени `Merge Guard` из `common/lifecycle-guards.md`. One-shot merge или handoff в `merge/job.md` допустим только если protocol state is `ready_for_merge` или уже существует claimed merge queue job с тем же protocol id. Bundle merge допустим только если `branch_context.merge_bundle.claimable: true`; все included protocols должны быть ready/queued for merge. Если пользователь просит merge для протокола без code/readiness verdict, остановись:

   ```text
   blocked: merge_requires_ready_for_merge
   current protocol state: <state>
   missing: code readiness / ready_for_merge / queue job
   next safe action: run code readiness
   ```

   Не исправляй это silent transition-ом и не запускай `code/readiness.md` из merge без явного решения пользователя или project auto policy.
   Если claimed protocol has `protocol_set`, получи compact set board через `dd-flow protocol ready --project-root "<project-root>" --json` or frontmatter/runtime inspection and include it in final merge/status report.
   Также прочитай `policy_context` из plan/code stage report or protocol summary. Если `route.git`/`policy_context.git.workspace_route` is `integration_branch_direct`, one-shot Git merge может быть неприменим, but merge flow must still check `policy_context.git.delivery_strategy`:
   - `direct_commit` requires real local commit SHA before terminal `merged`;
   - `direct_commit_push` also requires push/remote evidence;
   - `local_only` or `external_handoff` must produce an honest non-merged report;
   - placeholder evidence such as `pending_batch_commit` blocks closure.
5. Если state `clear`, сгенерируй one-shot `worker_id`:

   ```text
   merge-oneshot-<project-slug>-<YYYYMMDD-HHMMSS>
   ```

6. Если `branch_context.merge_bundle.eligible_protocols` содержит больше одного protocol и `claimable: true`, выполни bundle claim:

   ```bash
   dd-flow merge bundle claim --project-root "<project-root>" --worker-id "<worker-id>" --path "<workspace>" --json
   ```

   Если bundle status говорит `claimable: false`, не делай ручной Git merge. Доложи `eligible_protocols`, `not_ready_protocols`, `claimed_protocols`, `blocked_protocols`, `reason` и следующий безопасный шаг.

7. Иначе выполни атомарную попытку one-shot claim:

   ```bash
   dd-flow merge one-shot --project-root "<project-root>" --worker-id "<worker-id>" --path "<project-root>" --json
   ```

8. Если команда вернула `mode: status_only`, обработай как status-only.
9. Если команда вернула `claimed: false` и `queue_item: null`/`job: null`, доложи no-job/status и не создавай `03-merge`.
10. Если команда вернула single claim `claimed: true` или bundle claim `outcome: claimed`, возьми claimed protocol из `protocol.id`, `queue_item.protocol_id` or legacy `job.protocol_id`, а для bundle возьми `protocol_ids`; зарегистрируй текущую flow session как merge job:

   ```json
   {
     "project_root": "<project-root>",
     "flow_kind": "merge_job",
     "protocol_id": "<claimed protocol id>",
     "protocol_ids": ["<claimed protocol id or bundle ids>"],
     "worker_id": "<worker-id>",
     "workspace_path": "<project-root>",
     "continuation_policy": "merge_job",
     "current_stage": "integration",
     "next_action": "run shared merge job"
   }
   ```

11. Запусти `.memory-bank/dd-flow/mb-sdlc/merge/job.md` для claimed job or claimed bundle. Не выполняй integration inline в `merge.md`. Старый путь `.memory-bank/dd-flow/merge/` является compatibility alias.

## Финальный status-only доклад

Если merge job не запускался, финальный ответ должен включать:

- `prompt: merge.md`
- `protocol: N/A` или claimed/queued protocol id, если он известен
- `current_stage: merge_status`
- `completed_stage: status_only`
- `next_action`: `wait_merge_worker`, `merge-stop`, `merge-start`, `merge.md one-shot later`, or `none`
- `route`
- `blockers`
- `active_def`
- `user_decision_required`
- `stage_report: N/A - status-only; no merge job ran`
- `post_flow_protocol_reminder: .memory-bank/dd-flow/common/post-flow-protocol-reminder.md`
- `related_protocols`: compact `PSET-*` board with ready/blocked/running-or-claimed/done members, если claimed/queued protocol has `protocol_set`.
- `branch_context`: compact branch bundle summary when CLI returned it.

Не называй status-only результат "integration gate завершён".
