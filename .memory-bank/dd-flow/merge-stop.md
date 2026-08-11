# Merge Stop: остановка долгоживущего merge worker

Этот prompt мягко останавливает project-level merge worker.

Flow origin policy: `project_local`.

## Смысл

`merge-stop.md` управляет только worker lifecycle:

- no worker: no-op/status;
- exactly one idle/waiting worker: stop immediately and release owned lock;
- worker waiting through `merge-queue wait-next --acquire-lock true`: stop cancels queued lane waiters and releases owned merge lock through CLI/runtime cleanup;
- busy worker with claimed job: mark `stop_after_current`; current job must complete/fail through `merge/job.md`;
- multiple active/stopping workers without explicit `worker_id`: blocker, no guessing.

Status-only/stop-only путь не создаёт merge stage report (`04-merge/stage-report.*` в новом layout, `03-merge/stage-report.*` в legacy layout).

## Что прочитать

Всегда прочитай:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/flow-origin.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/closure.md`

## Алгоритм

1. Определи `project_root`.
2. Если пользователь указал `worker_id`, используй его. Если нет, разрешено default target только когда ровно один active/stopping merge worker существует.
3. Проверь:

   ```bash
   dd-flow merge-worker status --project-root "<project-root>" --json
   dd-flow merge-queue status --project-root "<project-root>" --json
   dd-flow lane status --project-root "<project-root>" --json
   ```

4. Выполни:

   ```bash
   dd-flow merge-worker stop --project-root "<project-root>" --worker-id "<worker-id>" --reason "<operator reason>" --json
   ```

   Если worker id не выбран и status показывает no worker:

   ```bash
   dd-flow merge-worker stop --project-root "<project-root>" --reason "<operator reason>" --json
   ```

5. Интерпретация:
   - `stopped: true`: worker остановлен, owned lock released;
   - `stop_after_current: true`: worker занят claimed job; не пытайся release lock или cancel job вручную;
   - `stopped: false`, `reason: no_active_merge_worker`: штатный no-op;
   - `merge_worker_ambiguous`: попроси пользователя или оператора указать `worker_id`.

## Доклад

Доложи:

- worker id;
- before/after worker status;
- queue status;
- lock release status;
- если `stop_after_current`, какой claimed protocol должен завершиться до остановки;
- `stage_report: N/A - status-only; no merge job ran`.
