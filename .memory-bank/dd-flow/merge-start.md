# Merge Start: долгоживущий merge worker проекта

Этот prompt стартует или проверяет долгоживущий merge worker для проекта.

Flow origin policy: `project_local`.

## Смысл

`merge-start.md` отвечает только за project-level worker lifecycle:

- если worker уже активен или останавливается, prompt печатает status и не создаёт дубликат;
- если worker не активен, prompt готовит isolated Codex home/hooks при необходимости, регистрирует `merge_worker` session и входит в bounded `merge-queue wait-next`;
- фактическая интеграция claimed job выполняется через `.memory-bank/dd-flow/mb-sdlc/merge/job.md`.

Status-only путь не создаёт merge stage report (`04-merge/stage-report.*` в новом layout, `03-merge/stage-report.*` в legacy layout).

## Что прочитать

Всегда прочитай:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/flow-origin.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/common/goal-traceability.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/dd-flow/workers/protocol-archive.md`
- `.memory-bank/dd-flow/mb-sdlc/merge/job.md`

## Изолированный Codex home

Правильный долгоживущий worker работает в isolated Codex home проекта:

```bash
dd-flow codex home init --project-root "<project-root>" --json
dd-flow codex hooks install --project-root "<project-root>" --target isolated --json
dd-flow codex home print-env --project-root "<project-root>" --json
```

Пользователь или supervisor запускает:

```bash
cd "<project-root>"
CODEX_HOME="<isolated-home>" codex --yolo "Запусти .memory-bank/dd-flow/merge-start.md"
```

Если текущая сессия не в isolated home, агент может подготовить home/hooks, но должен сообщить, что для настоящего long-lived worker нужен перезапуск с `CODEX_HOME`.

## Алгоритм

1. Определи `project_root`, `merge_workspace`, `integration_branch`, `worker_id`.
2. Проверь status:

   ```bash
   dd-flow project status --root "<project-root>" --json
   dd-flow merge-worker status --project-root "<project-root>" --json
   dd-flow merge-queue status --project-root "<project-root>" --json
   dd-flow lane status --project-root "<project-root>" --json
   ```

3. Если status показывает active/stopping worker, доложи status-only и не стартуй новый worker.
4. Если worker отсутствует, зарегистрируй lane workspace и worker:

   ```bash
   dd-flow merge-worker start --project-root "<project-root>" --worker-id "<worker-id>" --path "<merge-workspace>" --branch "<integration-branch>" --json
   ```

5. Если `started: false`, это idempotent status-only. Не продолжай wait loop.
6. Если `started: true`, входи в bounded wait через merge specialization over generic lane waiters:

   ```bash
   dd-flow merge-queue wait-next --project-root "<project-root>" --worker-id "<worker-id>" --path "<merge-workspace>" --timeout 1200 --poll-interval 10 --acquire-lock true --json
   ```

   Эта команда использует FIFO `lane lock wait-acquire --lane merge`, поэтому worker не должен отдельно busy-poll-ить lane lock и не должен вызывать ручной `git merge`, пока CLI не вернул claimed protocol.

7. Если wait вернул `stopped: true`, обнови dashboard/status и заверши worker.
8. Если wait вернул `outcome: wait_timeout`/`timed_out: true` без `queue_item`, доложи waiting-state и повторяй bounded wait, пока worker не остановлен или не появился claimed protocol.
9. Если wait вернул `outcome: blocked`, не обходи lock/session guard; доложи blocker и next safe action.
10. Если protocol claimed, зарегистрируй текущую session как `merge_job` для claimed protocol and worker id, затем запускай `.memory-bank/dd-flow/mb-sdlc/merge/job.md`. Primary fields are `queue_item`, `protocol`, `claim`; `job` is a legacy alias.
11. После job complete/fail:
    - если worker был `stop_after_current`, не возвращайся к wait;
    - иначе проверь stop/status и возвращайся к bounded wait.

## Stop semantics

Worker, остановленный через `merge-stop.md`, не должен заново брать lock, входить в `wait-next`, claim-ить jobs или продолжаться через Stop hook. Busy worker с `stop_after_current` завершает текущий job, выполняет cleanup/final note/release, затем останавливается.
