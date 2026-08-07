# Runtime CLI dd-flow

Этот файл читают prompt-ы, которые работают с проектом через `dd-flow` CLI. CLI не заменяет Memory Bank и не принимает смысловые решения. Он хранит и проверяет механическое состояние: проекты, протоколы, планы, рабочие деревья, lanes, locks, sessions, merge queue, hook events и dashboard.

Перед runtime-операциями также прочитай:

- `entity-ids.md` - формат `TYPE-<sequence>-slug`, short aliases и правила allocation;
- `flow-runs.md` - `RUN-*`, stage workspace layout and stage report chain;
- `workspace-layout.md` - project-scoped layout, service checkout records и cleanup guards.
- `flow-origin.md` - canonical-only flows, project flow pack manifest and `DD_MEMORYBANK` discovery.

## Ответственность

Prompt отвечает за смысл:

- что хочет пользователь;
- какой маршрут нужен;
- достаточно ли планирования;
- что считать качественным кодом, документом, сценарием или evidence;
- можно ли проходить merge, CI, beta или production gate.

CLI отвечает за механическое состояние:

- зарегистрирован ли проект;
- какой protocol активен;
- какие plan items начаты/завершены/заблокированы;
- какая Codex session связана с каким flow;
- какой `RUN-*` соответствует конкретному запуску flow;
- какие stage artifacts привязаны к `run-index.json`;
- кто держит lane lock;
- какой queued protocol / `queue_item` claimed в merge queue;
- какие dashboard markdown files надо обновить.

## Flow flags and RUN snapshot

Для нового RUN CLI фиксирует flow-flag snapshot до начала stage work:

```bash
dd-flow run start ... --preset normal --json
dd-flow run flags status RUN-001 --project-root <root> --json
dd-flow run flags revise RUN-001 --project-root <root> \
  --expected-revision 1 --idempotency-key risk-escalation-1 \
  --flag verification.depth=full --json
```

`--preset` — только входной preset. CLI расширяет его по canonical
`flow-contract.json`, применяет `task_profile`/override и mandatory floors,
после чего сохраняет revision/checksum в `run.json` и compact projection в
`run-index.json`. `flags revise` использует CAS по expected revision и
idempotency key; повтор того же запроса возвращает первоначальный результат.
Старые RUN и legacy `flow_profile` остаются читаемыми как
`legacy_incomplete`/loss-aware projection.

## Flow Guidance

Status-like CLI commands may include a structured `flow_guidance` block when they have enough project/protocol/run/merge context.

The block is a mechanical hint for agents:

- `current_stage`;
- `allowed_next_stages` from the snapshotted `flow_contract`;
- `recommended_next_action`;
- `recommended_prompt`;
- `required_predecessor_evidence`;
- `guards` with `pass`, `fail`, `unknown`, `not_applicable` or `degraded`;
- `blocked_if_missing`.

Commands that should emit guidance in v1 when context exists:

- `dd-flow protocol status`;
- `dd-flow protocol ready`;
- `dd-flow protocol blockers`;
- `dd-flow protocol implement`;
- `dd-flow protocol transition`;
- `dd-flow protocol ready-for-merge`;
- `dd-flow protocol sync-from-run`;
- `dd-flow run status`;
- `dd-flow run complete-stage`;
- `dd-flow project status`, on each protocol item rather than as a single guessed project action;
- `dd-flow merge status` and `dd-flow merge one-shot`, on queued/claimed protocol context.

CLI guidance does not decide problem space, architecture, verification sufficiency or user intent. If a guard cannot be proven from runtime/filesystem evidence, CLI returns `unknown` or `degraded`; it must not turn missing semantic evidence into optimistic `pass`.

Minimal JSON shape:

```json
{
  "flow_guidance": {
    "current_stage": "plan",
    "allowed_next_stages": ["implementation", "blocked", "waiting_for_user"],
    "recommended_next_action": "run code flow",
    "recommended_prompt": ".memory-bank/dd-flow/code.md",
    "required_predecessor_evidence": [
      "runs/<RUN>/02-plan/stage-report.json",
      "runs/<RUN>/02-plan/stage-report.html"
    ],
    "guards": [
      {
        "id": "code_flow_requires_plan_ready",
        "status": "pass",
        "summary": "Plan stage report exists in linked run evidence."
      }
    ],
    "blocked_if_missing": []
  }
}
```

## Merge Queue And Lane Waits

Merge queue commands coordinate queued/claimed protocols, not a separate domain job entity. Runtime tables may still be named `merge_queue`, and JSON keeps `job` as a compatibility alias, but prompts should treat these primary fields as canonical when present:

- `queue_item`: queue row for the protocol waiting for or inside merge;
- `protocol`: compact protocol identity and queue status;
- `claim`: worker/session claim over the queued protocol;
- `job`: legacy alias for `queue_item` during the compatibility window.

For in-session `code -> merge` or long-lived merge worker waiting, use the CLI waiter path instead of token-level polling or manual merge attempts:

```bash
dd-flow merge-queue wait-next --project-root "<project-root>" --worker-id "<worker-id>" --path "<merge-workspace>" --timeout 1200 --poll-interval 10 --acquire-lock true --json
```

With `--acquire-lock true`, `wait-next` composes over generic `lane lock wait-acquire --lane merge`: it creates/reuses a FIFO lane waiter, acquires the merge lane lock only when the waiter reaches the head, then heartbeats the lock while looking for a ready protocol. Timeout/stopped/blocked/claimed outcomes are explicit (`outcome`, `timed_out`, `stopped`, `queue_item`, `claim`) and must not be replaced with unregistered manual `git merge`.

## Branch Context And Bundle Merge

When a protocol was implemented in a feature branch/worktree, CLI status surfaces may include `branch_context`. This is mechanical guidance for agents and dashboards; it does not replace prompt-level semantic review.

`branch_context` tells the agent:

- current protocol id, if known;
- project id/root;
- integration branch, feature branch and concrete worktree path;
- Git diagnostics for the inspected workspace;
- every known protocol in the same branch/worktree with runtime stage, queue status and active sessions;
- derived `merge_bundle` status: eligible ready protocols, not-ready protocols, claimed protocols, blocked protocols, `claimable` and reason.

Use these read-only commands before branch-level merge work:

```bash
dd-flow protocol branch-status "<PRT-ID>" --json
dd-flow protocol branch-status --project-root "<project-root>" --path "<workspace>" --json
dd-flow merge bundle status --project-root "<project-root>" --path "<workspace>" --json
```

Relevant JSON outputs should also include `branch_context` when enough data exists:

- `dd-flow protocol status`;
- `dd-flow protocol implement`;
- `dd-flow protocol ready-for-merge`;
- `dd-flow merge status --path`;
- `dd-flow merge one-shot`;
- `dd-flow merge bundle status|claim|complete|fail`.

For a feature branch containing multiple completed protocols, keep each protocol in `ready_for_merge` after code/readiness. Do not invent an additional "accepted in worktree" stage. The merge contour handles the branch as a derived bundle:

```bash
dd-flow merge bundle claim --project-root "<project-root>" --worker-id "<worker-id>" --path "<workspace>" --json
dd-flow merge bundle complete --project-root "<project-root>" --worker-id "<worker-id>" --path "<workspace>" --summary "<summary>" --json
dd-flow merge bundle fail --project-root "<project-root>" --worker-id "<worker-id>" --path "<workspace>" --reason "<reason>" --requeue true|false --json
```

Bundle claim requires owned merge lane lock and is conservative: if the branch has not-ready, claimed, blocked or branch-mismatched protocols, the bundle is not claimable by default. In that case report `branch_context.merge_bundle.reason` and the next safe action instead of manually merging the branch.

## Protocol Set And Continuation Commands

For multi-protocol work, prompts should use these mechanical commands when CLI is available:

```bash
dd-flow protocol ready --project-root "<project-root>" --json
dd-flow protocol blockers "<PRT-ID>" --project-root "<project-root>" --json
dd-flow protocol implement "<PRT-ID>" --project-root "<project-root>" --json
```

`protocol ready` reads `.memory-bank/protocol/PRT-*.md` frontmatter and runtime state, then reports member protocol status: `ready`, `blocked`, `running/claimed`, `done`.

`protocol blockers` explains `blocked_by_protocols` for one protocol and whether each blocker is resolved.

`protocol implement` is a preflight/guidance command only. It never performs implementation. It must:

- refuse unresolved `blocked_by_protocols` unless `--force --reason` is supplied;
- refuse terminal protocols (`closed`, `cancelled`, `MERGED`, `CLOSED`);
- detect active session/claim where runtime data supports it;
- report expected next prompt/stage;
- report related frontmatter context and coding standards sources;
- include runtime/protocol/RUN mismatch diagnostics where available.

Prompt-level guards still decide whether semantic evidence is sufficient. CLI only provides mechanical state and file-derived hints.

## CLI Version Preflight

Before a flow relies on runtime CLI behavior, check the installed `dd-flow` CLI version and compatibility with the active Memory Bank canon.

Use:

```bash
dd-flow version --json
dd-flow status --project-root "<project-root>" --json
```

`dd-flow version` reports only the installed CLI package identity:

- `schema_id: dd-flow/version-report@1`;
- `cli.package_name`;
- `cli.version`, read from the package metadata derived from `dd-flow-cli/package.json`.

`dd-flow --version` is the human CLI convention alias. It must print the same package version in compact form.

`dd-flow status --json` is the richer preflight. It may include:

- `cli.version`;
- `cli.package_name`;
- `cli.compatibility`;
- `canon.resolved`;
- project Memory Bank version, project flow pack and drift details;
- `flow_guidance`, when protocol/run context exists.

The canonical compatibility map lives in:

```text
.memory-bank/dd-flow/compatibility.json
```

The manifest is validated by `dd-flow/compatibility@1` and maps a Memory Bank release to:

- the legacy/direct `dd_flow_cli` package compatibility used by current CLI versions;
- future router package compatibility;
- compatible engine range and engine install hints;
- storage, project summary, project dashboard and global dashboard contract identifiers;
- migration policy for runtime/home data.

The project declares its Memory Bank version; it does not duplicate every storage/dashboard/project-summary contract version in project frontmatter. The compatibility matrix owns the expansion from Memory Bank version to executable and data contracts.

During the router transition, `dd_flow_cli` remains the effective command executor for versions that do not yet implement router/engine dispatch. After the router/engine split, flow prompts still call stable `dd-flow`; the router selects an installed engine compatible with the active project. Missing old engines should be installed from npm through the old package version, for example:

```bash
npx @deksden-com/dd-flow-cli@<version> engine install
```

That command installs the old version's engine into `~/.dd-flow/engines/` and must not replace the globally installed router package.

This remediation is valid only for package versions that actually implement `engine install`. Versions published before the router/engine release boundary are legacy direct-CLI versions; router diagnostics must not suggest an impossible old-engine install command for them. In that case the safe options are a documented legacy route, read-only diagnostics, or `mb-upgrade`, depending on the compatibility verdict.

Router-native commands are limited to bootstrap and diagnostics, such as `engine install`, `engine list`, `engine info`, `engine resolve`, `engine doctor`, help/version output and missing-engine remediation. Project/runtime mutations must route through a compatible selected engine or fail closed.

Operation-level compatibility preflight is mandatory for project/runtime state changes. The CLI classifies commands as:

- `read_only_diagnostics` - status, blockers, implement guidance, run/plan/project status, lane/merge/session status, dashboard data and schema/memory preflights that do not mutate runtime;
- `normal_write` - protocol transitions, run stage updates, plan item updates, project registration/configuration, lane locks, merge queue/claims, dashboard refresh/render and similar runtime or project mutations;
- `mb_upgrade` - explicit upgrade/migration contour, selected with documented mb-upgrade flow intent and CLI flags/environment such as `--compatibility-mode mb-upgrade` or `DD_FLOW_COMPATIBILITY_MODE=mb-upgrade`.

If selected engine resolution is `missing`, incompatible or otherwise unsafe, `read_only_diagnostics` may still run in degraded mode and must expose recovery details under `engine.selection` / `engine.compatibility` or error `details.compatibility`. `normal_write` must fail before mutation. Agents must not bypass this by editing runtime JSON, project registries, queues, locks, stages or dashboard artifacts manually. The safe next action is to install the compatible engine, run the explicit `mb-upgrade` contour, or stop with a blocker/DEF when the flow cannot proceed.

Normal CLI commands must not migrate project runtime or home data. Runtime/data contract migrations are allowed only inside `mb-upgrade`, with backup, adjacent migration chain, report evidence and post-upgrade verification. If a newer CLI/engine can read an older project for diagnostics, that does not imply permission to mutate its runtime.

`mb-upgrade` migration evidence uses explicit CLI helpers:

```bash
dd-flow migration plan --project-root "<target-project-root>" --source-version "<old>" --target-version "<new>" --run "<RUN-ID>" --backup-path "<backup>" --json
dd-flow migration report --project-root "<target-project-root>" --source-version "<old>" --target-version "<new>" --run "<RUN-ID>" --backup-path "<backup>" --json
dd-flow migration verify --file "<run-home>/03-upgrade/migration-report.json" --json
```

These commands prepare and validate `dd-flow/mb-upgrade-migration-report@1` evidence. They must show `mode: mb-upgrade-only`, adjacent migration steps, backup status, active protocol/run/merge/lock state and derived artifacts to regenerate. A report with active unsupported state is valid only as a blocked/degraded report; it is not permission to mutate runtime.

Project summaries:

- the CLI prepares compact per-project summary data; dashboards display prepared data;
- publish with `dd-flow project summary --project-root "<target-project-root>" --json`;
- `dashboard refresh --project <project>` should publish the summary before rendering project/global dashboards;
- the contract is `dd-flow/project-summary@1` and the default path is `~/.dd-flow/projects/<project-id>/summary/project-summary.json`;
- global dashboard data should read prepared project summaries, expose `supported_summary_versions` and `summary_version_groups`, and list missing/unreadable/unsupported summaries under `unsupported_projects`;
- unsupported projects must stay visible with project id/name/root, summary path, reason and engine/install hint when known;
- dashboard HTML renders the prepared JSON model; it does not own summary scanning, compatibility decisions or migrations.

Compatibility verdicts:

- `ok` - installed CLI satisfies minimum and recommended compatibility;
- `outdated` - installed CLI satisfies minimum compatibility but is below recommended version; continue with a warning unless the current flow requires a newer recommended-only behavior;
- `incompatible` - installed CLI is below minimum version or the package name does not match; do not run mutating protocol/code/merge/memory writes that require missing CLI behavior;
- `missing` - CLI is unavailable; continue only if the flow explicitly allows file-only degraded mode and record `runtime_cli_degraded`;
- `unknown` - compatibility could not be determined; continue only with an explicit degraded note and do not claim a clean runtime preflight.

If the verdict is `incompatible`, prefer updating the CLI before mutation. If it cannot be fixed inside the current session, create or update a durable `DEF-*` only when the incompatibility remains relevant after the current flow or blocks future work; otherwise record it as a stage blocker/degraded note.

Network registry checks are explicit. Default `status` must not contact npm.

Use:

```bash
dd-flow status --project-root "<project-root>" --check-registry --json
```

`--check-registry` may return `cli.registry` with npm latest version and should use a short cache. Registry failure is degraded evidence, not a default blocker for offline project work.

Prompts must not auto-update or publish the CLI unless the user or project release policy explicitly authorizes it. When a Memory Bank release depends on a new CLI behavior, the release report must record:

- Memory Bank version;
- required and recommended CLI version;
- package version in `dd-flow-cli/package.json`;
- CLI build metadata with Memory Bank canon version and commit;
- npm publish evidence or an explicit publish deferral;
- local installed/linked `dd-flow version --json` evidence;
- compatibility verdict from `dd-flow status --project-root <project> --json`.

## Output Contract

`dd-flow` и проектные CLI, которые вызываются из prompt-ов, должны разделять человекочитаемый и машинный вывод.

Human mode:

- используется по умолчанию, когда `--json` не передан;
- stdout содержит короткий итог команды;
- долгие команды могут писать редкий progress в stderr: start, waiting/running, done или failed;
- progress не должен превращаться в per-poll spam.
- when `flow_guidance` exists, output may show compact `stage`, `next`, `guard` and `missing` lines.

JSON mode:

- включается явным `--json`;
- stdout содержит один валидный JSON-документ и ничего кроме него;
- при ошибке stderr содержит один валидный JSON-документ `{ ok: false, error: ... }`;
- progress возвращается внутри итогового JSON как `progress`/`events`, а не печатается рядом текстом;
- hook-и, prompt-ы, скрипты и agent automation всегда используют `--json`.

Нельзя смешивать human text и JSON на stdout. Если нужна потоковая машинная телеметрия, она должна быть включена отдельным явным режимом вроде `--progress-jsonl`, а не обычным `--json`.

Codex hook commands являются особо строгим контуром: они должны оставаться JSON-pure и не получать human progress output.

## Project Register

## Canon Register And Resolve

Canonical-only Memory Bank flows must locate the canonical checkout before reading support prompts:

```bash
dd-flow canon resolve --json
dd-flow canon register --root "$DD_MEMORYBANK" --json
dd-flow canon status --json
dd-flow status --project-root "<target-project-root>" --json
```

`dd-flow canon resolve` checks explicit `--root`, then `DD_MEMORYBANK`, then registered runtime config, then known nearby `dd-memorybank` checkouts from the current working directory. If multiple valid canon roots disagree, it fails closed with structured blockers. Do not guess between multiple canonical checkouts.

If the CLI is absent, canonical-only flows may use `DD_MEMORYBANK` directly or a clearly unambiguous nearby `dd-memorybank/` checkout, but must report `runtime_cli_degraded` and show the canonical root they used.

Project-local coding/audit/fix flows should not infer canonical-only support files from `DD_MEMORYBANK`; they read their installed project flow pack under `.memory-bank/dd-flow/` and its `manifest.json`.

Если проект ещё не зарегистрирован в CLI, зарегистрируй его:

```bash
dd-flow project register --root "<project-root>" --json
```

Если проект уже зарегистрирован, используй:

```bash
dd-flow project status --root "<project-root>" --json
```

Новый runtime должен показывать project full id и short alias, например `PRJ-001-dd-flow-playground` и `PRJ-001`. Команды могут принимать уникальный alias, но JSON/report должны хранить full id.

Если global dashboard показывает старый зарегистрированный root, который уже физически удалён, не правь SQLite вручную. Используй штатное архивирование:

```bash
dd-flow project archive <PRJ-ID-or-PRJ-short-id> --reason "<why this root is stale>" --json
dd-flow project archive --root "<old-root-path>" --reason "<why this root is stale>" --json
```

Архивирование убирает проект из активной global dashboard секции, но не удаляет protocols, merge queue, audit history и evidence. Если тот же root снова зарегистрирован и существует, `project register` возвращает его в active state.

Не считай ошибкой отсутствие CLI в проекте, где он ещё не установлен. В таком случае веди протокол обычным файловым способом и зафиксируй `DEF-*` или operational note, если runtime CLI является обязательным gate.

## Stable Runtime State

Runtime state, который нужен CLI и hook-ам для продолжения, остановки, merge, cleanup и аудита, должен жить в стабильном `dd-flow` storage под project-scoped root:

```text
~/.dd-flow/projects/<PRJ-ID-slug>/runtime/
```

Он не должен зависеть от существования feature worktree.

Инвариант:

- `project_root` - стабильная идентичность проекта для queues, lanes, locks, sessions, dashboard и merge worker;
- `workspace_path` - конкретный checkout, где агент работает сейчас;
- authoritative protocol runtime state - состояние в `dd-flow` CLI/storage;
- `.memory-bank/protocol/<PRT-ID>/summary.md`, evidence, trace и project snapshots - долговечная документация проекта, но не единственный source of truth для механического продолжения flow.

Feature worktree можно удалить после merge. Это не должно ломать:

- `dd-flow protocol status`;
- `dd-flow merge-queue complete/fail`;
- `dd-flow protocol cancel`;
- `dd-flow cleanup scan/apply`;
- Stop hook routing.

Run runtime state and run artifacts follow the same stable-storage rule for new runs:

```text
~/.dd-flow/projects/<PRJ-ID-slug>/runs/<RUN-ID-slug>/
  run.json
  run-index.json
```

The project-local legacy report surface is still readable when an existing run index points there:

```text
<workspace>/.tasks/dd-flow-runs/<RUN-ID-slug>/
```

Do not store continuation-critical run state only inside disposable feature worktrees. New prompts should resolve `run_home.path`, current `stage_runs[*].dir` and report paths through `dd-flow run status --json` / `run-index.json`, not by reconstructing `.tasks` paths.

## Flow Run Register

Every practical launch should determine or create a `RUN-*`.

Happy path:

```bash
dd-flow run start \
  --project-root "<stable-project-root>" \
  --workspace-root "<current-workspace>" \
  --flow-kind mb_sdlc \
  --subject-type protocol \
  --subject-id "<PRT-ID>" \
  --slug "<slug>" \
  --json
```

Stage lifecycle:

```bash
dd-flow run attach-stage "<RUN-ID-or-RUN-short-id>" \
  --project-root "<stable-project-root>" \
  --stage code \
  --dir 03-code \
  --status running \
  --data-schema-id dd-flow/code-stage-report@2 \
  --json

dd-flow run complete-stage "<RUN-ID-or-RUN-short-id>" \
  --project-root "<stable-project-root>" \
  --stage code \
  --status done \
  --data 03-code/stage-report.json \
  --stage-report 03-code/stage-report.html \
  --report 03-code/report.md \
  --json
```

Run diagnostics are read-only and agent-safe in JSON mode:

```bash
dd-flow run timeline "<RUN-ID-or-RUN-short-id>" --project-root "<project-root>" --json
dd-flow run usage "<RUN-ID-or-RUN-short-id>" --project-root "<project-root>" --group-by session|role|stage|aspect|plan-item --json
dd-flow session usage sync --project-root "<project-root>" --session-id "<session-id>" --json
```

`run usage` performs the normal reconciliation; `session usage sync` is a diagnostic/recovery command, never a mandatory manual telemetry ritual. Read models expose source/coverage status and must not fabricate zero usage or precise stage attribution for a counter that spans a lifecycle boundary.

Delivery flows use the same run/stage mechanics with their own report contracts:

```bash
dd-flow run attach-stage "<RUN-ID-or-RUN-short-id>" \
  --project-root "<stable-project-root>" \
  --stage release \
  --dir 04-report \
  --status running \
  --data-schema-id dd-flow/release-stage-report@1 \
  --json
```

Use `dd-flow/deploy-stage-report@1` for `deploy.md` and `dd-flow/publish-stage-report@1` for `publish.md`. The CLI validates and records run/report artifacts; provider-specific commands, registry publishing, store submissions and hosting deployments remain owned by project runbooks, scripts, CI/CD or explicit user-approved agent actions.

For legacy runs that already have `01-plan/02-code/03-merge`, keep the existing numbering and record `legacy_stage_layout: true`; do not renumber a live run.

Run completion:

```bash
dd-flow run complete "<RUN-ID-or-RUN-short-id>" \
  --project-root "<stable-project-root>" \
  --status done \
  --verdict accepted \
  --next-action "<next gate>" \
  --json
```

Завершение stage в `RUN-*` не заменяет `dd-flow protocol transition`. Если после `run complete-stage` protocol всё ещё находится на более ранней стадии, prompt обязан либо выполнить явный `dd-flow protocol transition`, либо остановиться с диагностикой/`DEF-*`, либо использовать `dd-flow protocol sync-from-run` для evidence-based repair.

Use short `RUN-<sequence>` aliases only in commands when they resolve uniquely. Persist full `RUN-<sequence>-slug` ids in files. New ordinary protocol runs use `flow_kind: mb_sdlc`; `coding` is legacy compatibility for old runs.

When a prompt needs an id before durable creation, prefer CLI preview instead of prompt-side guessing:

```bash
dd-flow id next --type run --project-root "<stable-project-root>" --slug "<slug>" --json
dd-flow id next --type protocol --project-root "<stable-project-root>" --slug "<slug>" --json
```

If the CLI does not yet support `dd-flow run`, create a degraded run index in the best available local run folder and record `runtime_cli_degraded` in `report.md`, protocol summary and final navigation. Prefer `<run-home>` when the project id is known; use `.tasks/dd-flow-runs/<RUN-ID>/run-index.json` only as legacy compatibility.

Если CLI или prompt видит, что `state_path` указывает в удалённый worktree, это runtime/design finding, а не повод чинить состояние ручной правкой SQLite. Зафиксируй blocker/DEF или используй штатные cleanup/cancel команды, если они уже доступны.

Проектные protocol files могут быть синхронизированы, экспортированы или смержены как evidence/docs. Но удаление worktree не должно уничтожать состояние, нужное CLI для закрытия очереди.

`dd-flow cleanup scan/apply` должен быть безопасным путём восстановления таких хвостов. Если `cleanup apply` пытается починить `missing_protocol_runtime_state`, старый `state_path` может указывать в уже удалённый feature worktree. CLI в этом случае не должен падать необработанным `ENOENT`: он либо восстанавливает runtime snapshot в допустимом stable location/создаёт нужные parent directories, либо возвращает structured refusal с `protocol_id`, `state_path` и recommended action.

`~/.dd-flow-exp` не является активным runtime root для новых experiment runs. `dd-flow-exp` должен использовать тот же `DD_FLOW_HOME` layout:

```text
~/.dd-flow/projects/<PRJ-ID-slug>/experiments/<EXP-ID-slug>/
```

## Flow Contract

Project flow contract живёт в:

```text
.memory-bank/dd-flow/flow-contract.json
.memory-bank/dd-flow/flow-contract.yaml
```

CLI снапшотит contract при регистрации протокола и использует его как механический источник стадий, transitions, `ready-for-merge` gate и target stage после `merge-queue complete`.

Канонические активные стадии prompt-ов: `priming`, `specify`, `plan`, `interactive`, `consolidation`, `hardening`, `implementation`, `readiness`, `ready_for_merge`, `queued_for_merge`, `integration`, `closed`, `cancelled`, `blocked`, `waiting_for_user`.

During the lifecycle normalization transition, CLI JSON keeps legacy fields such as `stage`, `current_stage`, `raw_stage`, `status` and `job` for compatibility, but newer consumers should read the normalized `lifecycle` object when it is present:

```json
{
  "current_stage": "implementation",
  "lifecycle": {
    "flow": "mb_sdlc",
    "stage": "code",
    "substage": "implementation",
    "status": "in_progress",
    "terminal": false,
    "legacy_stage": "implementation",
    "legacy_status": "running",
    "raw_stage": "implementation",
    "raw_status": "running",
    "queue_status": null,
    "source": "runtime_state",
    "diagnostics": []
  }
}
```

`lifecycle.stage` answers where the protocol is in the conceptual flow. `lifecycle.status` answers what is happening in that stage. `legacy_stage` and `raw_stage` explain compatibility values from older runtime rows and flow contracts. New prompt or CLI code must not add new ad hoc mappings for `ready_for_merge`, `queued_for_merge`, `integration`, `blocked`, `waiting_for_user`, `closed` or `cancelled`; it should use the CLI lifecycle normalizer/projection and preserve raw fields only as compatibility evidence.

Dashboard JSON follows the same separation. New consumers should treat these fields as primary when present:

- `lifecycle` on protocol/project cards and protocol pages;
- `lifecycle_summary` for aggregate counts by normalized lifecycle;
- `resource_summary` for lane locks, waiters and queued protocols;
- `queued_protocols` on project dashboards;
- `queue_item` and `claim` on protocol dashboards when the protocol is in merge coordination.

Compatibility aliases such as `current_stage`, `raw_stage`, `raw_status`, `merge_queue` and `job` can remain in JSON or markdown fallback while older prompts/scripts migrate, but they must not be the source of a new lifecycle interpretation table.

`dd-flow status --json` also reports project flow-pack `flow_contract` and drift comparison. If `project.drift.flow_contract.status` is `diverged`, `invalid` or `unknown`, mutating flows that rely on current lifecycle semantics should stop or route through canonical `mb-upgrade` before changing protocol stages, queues, locks, dashboard artifacts or run state.

Initial compatibility mapping:

| Legacy stage | Normalized lifecycle |
| --- | --- |
| `registered` | `stage: protocol`, `status: registered` |
| `implementation` | `stage: code`, `substage: implementation`, `status: in_progress` |
| `readiness` | `stage: code`, `substage: readiness`, `status: readiness` |
| `ready_for_merge` | `stage: code`, `status: ready_for_merge` |
| `queued_for_merge` | `stage: merge`, `status: queued` or `claimed` according to queue state |
| `integration` | `stage: merge`, `substage: integration`, `status: in_progress` |
| `blocked` | `status: blocked`; preserve or diagnose missing return stage |
| `waiting_for_user` | `status: waiting_for_user`; preserve or diagnose missing return stage |
| `closed` | `stage: closed`, `status: done`, `terminal: true` |
| `cancelled` | `stage: closed`, `status: cancelled`, `terminal: true` |

Protocol lifecycle transitions выполняются явной командой:

```bash
dd-flow protocol transition "<protocol-id>" \
  --to "<stage>" \
  --payload-file "<payload.json>" \
  --json
```

Payload содержит `next_action`, route, workspace, `protocol_location`, `blockers` и `active_def` по текущему handoff. CLI валидирует `from -> to` по snapshotted `flow_contract` из protocol state, обновляет lifecycle fields и пишет audit event. `--json-file` и top-level `dd-flow transition` допустимы как legacy compatibility alias, но новые prompt-ы используют `dd-flow protocol transition`.

`RUN-*` stage completion является evidence для protocol transition, а не неявным lifecycle transition. `dd-flow run complete-stage` не должен молча переводить `PRT-*` из `registered` в `plan`, `implementation`, `ready_for_merge` или `closed`. Если protocol state и latest linked run расходятся, CLI должен возвращать diagnostic вроде `protocol_run_stage_mismatch` и recommended repair command:

```bash
dd-flow protocol sync-from-run "<protocol-id>" \
  --run "<RUN-ID-or-RUN-short-id>" \
  --target auto \
  --json
```

`sync-from-run` используется для legacy/degraded states, когда RUN evidence уже существует. Он проверяет subject/project match, stage chain and verdict, затем либо repair-ит protocol state с audit event, либо возвращает structured refusal. Не редактируй runtime JSON руками.

`prime.md` означает только session priming и не создаёт протокол. Старое значение "prime как intake задачи" мигрирует в связку `protocol.md` + logical stage `specify`.

`waiting_for_user` является общей остановкой для любого flow. Runtime payload должен быть typed:

```json
{
  "reason": "specification_gap | manual_verification | hardening_user_decision | git_contour_decision | other",
  "question_ids": ["Q-001"],
  "return_to_stage": "specify",
  "blocks": ["plan"],
  "does_not_block": [],
  "context": "short user-facing reason"
}
```

После ответа пользователя prompt возвращается в `return_to_stage`, а не угадывает следующую стадию по последней команде.

Project-level auto policy хранится в:

```text
~/.dd-flow/projects/<PRJ-ID-slug>/config.json
```

Минимальный формат:

```json
{
  "schema_id": "dd-flow/project-config@1",
  "automation": {
    "ready_for_code_auto": false,
    "ready_for_hardening_auto": false,
    "ask_before_code_after_plan": true,
    "ask_before_hardening_after_consolidation": true
  }
}
```

`ready_for_code_auto` и `ready_for_code_after_user_review` являются выходными решениями плановой стадии, а не protocol stages. Prompt должен снапшотить применённую auto policy в run/stage report, если она повлияла на переход.

Старые `g0`, `m1`, `m2`, а также старый `prime` как intake допустимы только как aliases внутри flow contract для миграции старых runtime-записей, а не как имена новых prompt-файлов или новых отчётов.

## Protocol Register

Для feature-worktree разделяй стабильную идентичность проекта и checkout, где лежат файлы протокола:

```bash
dd-flow protocol register "<protocol-id-or-handshake>" --project-root "<stable-project-root>" --workspace-path "<current-feature-worktree>" --json
```

`project_root` всегда указывает на стабильный проект, чьи queues, lanes, dashboards и merge worker должны видеть протокол. `workspace_path` указывает на checkout, где агент делает рабочие изменения и где могут создаваться project Memory Bank snapshots: `.memory-bank/protocol/<PRT-ID>/summary.md`, evidence, trace и другие документы.

Не считай worktree-local `state.json` authoritative runtime state. Если текущая версия CLI ещё пишет `state.json` в worktree, prompt всё равно должен вести flow так, будто это временный snapshot: не удаляй worktree до успешного handoff/complete, и фиксируй canonical/runtime mismatch, если CLI требует этот файл после удаления worktree.

Если `route.git: feature_worktree`, не регистрируй проект повторно с `--root` равным worktree. Worktree - это рабочая область, а не новая project identity для `dd-flow` CLI. Для `integration_branch_direct` `workspace_path` можно не указывать, потому что он совпадает со стабильным `project_root`.

## Flow Session Register

Каждый runtime prompt, который ведёт практическую работу, должен зарегистрировать flow session, если в проекте доступен `dd-flow` CLI и установлены/используются hooks.

Команда:

```bash
dd-flow session register --payload-file ".tasks/dd-flow/session-payload.json" --json
```

Payload записывается в JSON-файл до вызова `dd-flow session register`:

```json
{
  "project_root": "/abs/project",
  "flow_kind": "implementation",
  "run_id": "RUN-001-flow-run-contract",
  "protocol_id": "PRT-...",
  "worker_id": null,
  "workspace_path": "/abs/workspace",
  "continuation_policy": "implementation_plan",
  "current_stage": "implementation",
  "next_action": "continue implementation plan"
}
```

Не регистрируй session через shell-переменную в `--payload-base64`, например `payload=$(...); dd-flow session register --payload-base64 "$payload"`. Codex `PreToolUse` hook получает сырую команду до shell expansion, поэтому увидит строку `"$payload"`, а не значение переменной. Для prompt-ов стандартом является `--payload-file`: hook сможет прочитать тот же JSON-файл до исполнения команды, а сам CLI зарегистрирует session из этого файла.

`--payload-base64` допустим только когда в команде передан буквальный base64-token, уже вычисленный заранее, без shell-подстановок. `--payload-json` допустим для тестов или очень коротких операторских вызовов, но для runtime prompt-ов хуже из-за quoting.

Перед регистрацией session проверь рабочую папку:

```bash
pwd -P
```

`workspace_path` в payload должен быть фактическим checkout, из которого текущая Codex session будет делать файловые изменения. Для `route.git: feature_worktree` это feature-worktree, обычно service checkout under `~/.dd-flow/projects/<PRJ-ID-slug>/checkouts/`, а не стабильный `project_root`. `project_root` остаётся стабильной идентичностью проекта в `dd-flow`, но не заменяет `workspace_path`.

Если `workspace_path` не совпадает с `pwd -P`, не регистрируй рабочую session "на будущее" и не продолжай state-changing шаг. Сначала перезапусти Codex из правильного checkout или остановись с навигационным блоком и точной командой перезапуска.

Матрица:

| Prompt | `flow_kind` | `continuation_policy` |
| --- | --- | --- |
| `go.md`, `prime.md`, `protocol.md`, `interactive.md`, `plan.md` | `planning` | `go_router` |
| `code.md`, `code/implement.md` | `implementation` | `implementation_plan` |
| `merge.md` status-only | none or current session | none |
| `merge.md` one-shot claimed job | `merge_job` | `merge_job` |
| `merge-start.md` long-lived worker | `merge_worker` | `merge_queue` |
| `merge-stop.md` worker controller | none or current session | none |
| `merge/job.md` for claimed job | `merge_job` | `merge_job` |
| `mb-init`, `mb-upgrade`, `mb-distill`, `mb-audit`, `mb-fix` | `memory_flow` | `memory_flow` |
| исследование без протокола | `research_no_protocol` | `none` |

Если prompt работает без протокола, но это заметное read-only research, регистрируй `research_no_protocol` только если это реально помогает Stop hook/dashboard. Не создавай протокол только ради session register.

## Plan Graph

Если есть протокол и план задач, отражай его в CLI:

```bash
dd-flow plan set "<protocol-id>" --file "<plan.json>" --json
dd-flow plan item start "<protocol-id>" "<item-id>" --json
dd-flow plan item done "<protocol-id>" "<item-id>" --summary "<summary>" --evidence "<evidence>" --json
dd-flow plan item block "<protocol-id>" "<item-id>" --reason "<reason>" --json
dd-flow plan item skip "<protocol-id>" "<item-id>" --reason "<reason>" --json
```

Плановые пункты должны включать не только кодовые задачи, но и gates, если они значимы:

- проверки;
- сценарии;
- result verification;
- quality review;
- evidence/passport creation;
- documentation update;
- merge readiness.

Для микроправки можно не создавать большой graph. Достаточно короткого протокола и итогового trace/report.

## Dashboard

Prompt-ы не вызывают `cmux` напрямую.

Нормальный путь:

- CLI сам обновляет project/global dashboard после state-changing команд, если это включено конфигом;
- `dd-flow dashboard refresh` пересобирает global/system HTML dashboard без знания пути `~/.dd-flow/dashboard/global-dashboard.html`;
- `dd-flow dashboard refresh --project <project>` пересобирает project HTML dashboard, JSON рядом с ним, protocol pages для active/recent протоколов и global HTML dashboard, если global включён;
- `dd-flow dashboard refresh --all` пересобирает global dashboard и dashboards активных проектов с per-project статусами;
- compatibility forms `--project-root`, `refresh-global`, `render-global` and `data --global` остаются допустимыми для старых prompt/script, но новые инструкции должны предпочитать target-based commands;
- `cmux` показывает markdown через markdown viewer, а HTML через browser/file viewer;
- если нужно вручную пересобрать или открыть dashboard, используй CLI:

```bash
dd-flow dashboard open --json
dd-flow dashboard refresh --json
dd-flow dashboard refresh --all --json
dd-flow dashboard refresh --project "<project-id|slug|root>" --open auto --json
dd-flow dashboard render --project "<project-id|slug|root>" --format html --protocol "<PRT-ID>" --json
dd-flow dashboard data --project "<project-id|slug|root>" --json
dd-flow dashboard data --json
dd-flow dashboard open --project "<project-id|slug|root>" --viewer cmux --json
```

Если `cmux` недоступен, markdown и HTML файлы всё равно должны оставаться полезными как локальные артефакты. Viewer failure не является смысловым failure фичи, если только config явно не требует viewer как gate.

После регистрации session, изменения protocol/plan/queue/lock или другого state-changing шага периодически запрашивай runtime summary или используй известные config paths и в докладе показывай полные пути:

```markdown
- dashboard_project: /abs/project/.tasks/dd-flow-dashboard/project-dashboard.html
- dashboard_global: /Users/<user>/.dd-flow/dashboard/global-dashboard.html
```

Пока HTML dashboard rollout не прошёл gates, markdown fallback можно указывать отдельной строкой `dashboard_markdown_fallback`. После стабилизации HTML dashboard не показывай markdown path как основной dashboard path.

Не вызывай `cmux` напрямую из prompt-а. Если нужно открыть viewer, используй:

```bash
dd-flow dashboard open --project "<project-id|slug|root>" --format html --viewer cmux --json
```

или сообщи пользователю путь к локальному HTML-файлу. Открытый viewer сам обновится при перезаписи файла, если viewer это поддерживает.

## Lane Waiters And Wait-Acquire

A lane waiter is a persisted runtime coordination record for an actor waiting to own an exclusive lane. Waiters are not protocols, runs, stages, queue jobs or domain work items. They exist so agents can wait inside the CLI process without manual polling or bypassing runtime state.

Use `wait-acquire` when a flow is allowed to wait for a lane and should acquire it as soon as FIFO order permits:

```bash
dd-flow lane lock wait-acquire \
  --project-root "$PROJECT_ROOT" \
  --lane merge \
  --worker-id "$WORKER_ID" \
  --path "$WORKSPACE" \
  --timeout 300 \
  --poll-interval 10 \
  --ttl 300 \
  --reason "merge worker" \
  --json
```

Rules:

- the command validates the registered lane workspace before waiting;
- one queued waiter per `project/lane/worker-id` is active at a time;
- retrying the same worker is idempotent and does not create duplicate queued waiters;
- lock acquisition follows FIFO order by queued waiter position;
- timeout returns `status: "timed_out"` and leaves audit evidence;
- stale queued waiters with expired deadlines can be found by `cleanup scan` and expired by `cleanup apply`;
- `session stop` cancels queued waiters for that session worker without releasing another worker's lock.

Inspect or cancel lane waiters explicitly:

```bash
dd-flow lane waiters --project-root "$PROJECT_ROOT" --lane merge --json
dd-flow lane waiter cancel --project-root "$PROJECT_ROOT" --lane merge --worker-id "$WORKER_ID" --reason "session stopped" --json
```

`dd-flow lane status` includes both locks and waiters so dashboards and agents can show current ownership and waiting positions separately from protocol lifecycle.

## Merge Queue

Обычная рабочая session не делает merge сама, если проект использует merge queue.

Нормальный code-flow не останавливается между implementation и readiness. `code/implement.md` после реализации сам переходит к readiness gate и запускает нужных reviewers. Stop hook используется только как страховка, если session прервалась до завершения gate.

Во время code-flow допустимые state transitions:

```text
implementation -> readiness -> ready_for_merge | close_protocol | ask_user | blocked
```

Если implementation завершилась, но readiness ещё не выполнен из-за остановки session, runtime state должен содержать `current_stage: readiness` и `next_action: run_readiness_gate`, чтобы Stop hook продолжил с `code/readiness.md`.

После `readiness`, если feature branch готова:

```bash
dd-flow protocol ready-for-merge "<protocol-id>" --json
```

Дальше один из merge entrypoints:

- `.memory-bank/dd-flow/merge.md` проверяет active worker/queue/lock и либо печатает status-only, либо claim-ит ровно один job для текущей session;
- `.memory-bank/dd-flow/merge-start.md` стартует или проверяет долгоживущий project worker;
- `.memory-bank/dd-flow/merge-stop.md` мягко останавливает worker-а;
- `.memory-bank/dd-flow/merge/job.md` выполняет общий claimed-job lifecycle и вызывает `merge/integrate.md` как checklist;
- завершает job через `merge-queue complete` или `merge-queue fail`.

Если protocol поставлен в merge queue, implementation/planning session завершает свою часть на `ready_for_merge`. Она не запускает `merge/integrate.md`, не берёт merge lane lock, не вызывает `merge-queue next/wait-next/complete/fail`, не выполняет `git merge` и не чистит feature-worktree после merge. Эти действия принадлежат только `merge.md` one-shot, `merge-start.md` worker and `merge/job.md` session.

После успешного `dd-flow protocol ready-for-merge` implementation session должна штатно остановить себя через `dd-flow session stop`, если CLI session state доступен. Причина остановки должна явно говорить, что протокол передан merge worker-у. Иначе Stop hook может продолжать уже завершённую readiness-сессию и повторно требовать `ready-for-merge`.

Если при последующей проверке protocol уже `ready_for_merge`, `claimed`, `merged` или `closed`, implementation session не должна повторять `ready-for-merge`; она должна остановиться или разрешить Stop hook завершить сессию.

`merge/integrate.md` в проекте с merge queue допустим только внутри `merge/job.md`, когда job уже claimed и текущая session зарегистрирована как `flow_kind: merge_job` с тем же `protocol_id` и `worker_id`. Если текущая session была `implementation`, её нельзя "переодеть" в `merge_job`: нужно остановиться и передать работу `merge.md` или `merge-start.md`.

После terminal completion merge job session должна быть остановлена через `dd-flow session stop ... --reason "protocol closed"` или эквивалентный штатный путь. Runtime обязан отпустить active `merge` lane lock, если его держит тот же `worker_id`; оставшийся active lock после `closed/closed/none` является finding.

Долгоживущий merge worker не должен останавливаться из-за обычного loop guard на повторяющийся `merge_queue_wait_next`. Повторное ожидание пустой очереди является нормальным состоянием, пока worker явно не остановлен через `dd-flow session stop-worker`.

## Worktree Cleanup Guard

Codex session не должна удалять рабочее дерево, в котором сама находится.

Перед cleanup проверь:

```bash
pwd -P
git worktree list
```

Если `pwd -P` равен удаляемому worktree или находится внутри него, не выполняй `git worktree remove`. Cleanup выполняется из стабильного project root, merge workspace или отдельной cleanup-сессии. Иначе после удаления собственного `cwd` последующие tool/hook calls получают `No such file or directory` и session становится механически повреждённой.

Обычная implementation session при merge queue не чистит feature-worktree после merge. Это делает merge job или отдельный cleanup-контур после закрытия протокола.

Для отменённых или неудачных экспериментальных прогонов сначала используй штатную отмену runtime, а не ручное удаление папки:

```bash
dd-flow protocol cancel "<protocol-id>" --reason "<why this run is stale>" --close-sessions true --cancel-queue true --release-locks true --worktree remove --force --json
```

Ожидаемое поведение CLI: protocol становится `cancelled/cancelled`, связанный disposable feature worktree удаляется даже если он был записан только в `state.workspace`, локальная feature branch удаляется при `--force`, dashboard/queue/locks можно проверить после refresh. Если CLI сообщает `removed`, но `git worktree list` или `git branch --list` всё ещё показывает хвост, это cleanup/runtime finding.

Для merge job порядок cleanup такой:

1. merge/integration выполнен;
2. обязательные проверки и evidence обновлены;
3. raw browser/scenario artifacts из `.tasks/`, `.scenario-runs/` или tool temp folders подняты в durable protocol evidence либо явно summarized в verification passport;
4. protocol/project snapshots синхронизированы настолько, насколько требует gate;
5. `dd-flow merge-queue complete` или `fail` успешно выполнен;
6. только потом удаляются feature worktree и branch, если проектная политика разрешает cleanup.

Не удаляй feature worktree до `merge-queue complete`, если текущая версия CLI ещё может читать protocol state из worktree-local файлов. Даже после перехода на stable runtime state этот порядок остаётся более безопасным: сначала закрыть runtime job, потом убирать рабочие артефакты.

После успешного `merge-queue complete` canonical runtime state должен быть terminal: `stage: closed`, `status: closed`, `next_action: none`. Если protocol остаётся `integration/running` после merged queue job, это runtime closure finding, а не нормальное состояние.

## Ошибки CLI

Не обходи CLI-ошибки ручной правкой SQLite или подменой состояния.

Если CLI отказал:

- прочитай structured error;
- исправь явный хвост, если это в scope;
- если блокер внешний или не закрывается сейчас, оформи `DEF-*`;
- если ошибка означает, что prompt и канон устарели относительно CLI, зафиксируй это как canonical/runtime mismatch.
