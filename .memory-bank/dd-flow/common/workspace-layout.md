---
file: '.memory-bank/dd-flow/common/workspace-layout.md'
description: 'Canonical project-scoped workspace and service checkout layout for dd-flow.'
purpose: 'Read before creating dd-flow runtime state, service checkouts, experiment runs, cleanup plans or dashboards.'
version: '0.2.0'
date: '2026-06-28'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - entity-ids.md
  - runtime-cli.md
  - git-ops.md
  - ../.memory-bank/protocol/2026-05-31-entity-ids-project-workspaces.md
tags: [dd-flow, workspace, runtime, checkouts, experiments]
history:
  - version: '0.1.0'
    date: '2026-05-31'
    changes: 'Created canonical project-scoped workspace layout for dd-flow service state and checkouts.'
  - version: '0.2.0'
    date: '2026-06-28'
    changes: 'Added project-scoped runs/ as primary RUN artifact home and clarified dashboard/checkouts separation.'
---

# Workspace Layout

All dd-flow-managed service state is grouped by project id under the active `DD_FLOW_HOME`.

Default home:

```text
~/.dd-flow/
```

Canonical shape:

```text
~/.dd-flow/
  config.json
  registry.json
  dashboard.md

  projects/
    PRJ-001-dd-flow-playground/
      project.json

      runtime/
        db.sqlite
        sessions/
        protocols/
        queue/
        lanes/
        locks/
        dashboards/

      runs/
        RUN-001-flowboard-safe-ui-smoke/
          run.json
          run-index.json
          run-summary.md
          state/
          01-specify/
          02-plan/
          03-code/
          04-merge/
          promotion/

      dashboard/
        project-dashboard.html
        project-dashboard.json
        protocols/

      checkouts/
        stable/
          dd-flow-playground/
        merge/
          dd-flow-playground/
        worktrees/
          EXP-001-playground-merge-queue-live/
            RUN-001-flowboard-safe-ui-smoke/
              dd-flow-playground/

      experiments/
        EXP-001-playground-merge-queue-live/
          experiment.json
          runs/
            RUN-001-flowboard-safe-ui-smoke/
              state.json
              events.jsonl
              report.md
              artifacts/
```

## Project Root And Workspace Path

`project_root` is the stable identity of the target project. Queues, lanes, locks, sessions, merge workers and dashboards route through it.

`workspace_path` is the concrete checkout where an agent edits files right now.

For a feature-worktree flow:

- `project_root` remains the stable target repository root;
- `workspace_path` is the service checkout under `~/.dd-flow/projects/<PRJ-ID-slug>/checkouts/...`;
- do not register the service checkout as a new project identity.

For a run:

- `run_home` is `~/.dd-flow/projects/<PRJ-ID-slug>/runs/<RUN-ID-slug>/`;
- `run_home` stores reports, payloads, task packets, raw evidence and stage artifacts;
- deleting or cleaning a feature worktree must not delete `run_home`.

## Target Repository

The target repository may contain:

- product code;
- `.memory-bank/**`;
- `.tasks/**`;
- normal Git files and project-owned artifacts.

The target repository must not contain dd-flow-managed service checkouts as the happy path. Do not create new dd-flow service worktrees under target repo `.worktrees/`, `worktrees/`, `_worktrees/` or `.tasks/worktrees/`.

Project-local manual worktrees are allowed only if the project has its own policy and they are not represented as dd-flow-managed service checkouts.

## Service Checkout Records

Every dd-flow-managed checkout must have an ownership record before cleanup or live acceptance:

```yaml
service_checkout_record:
  id: CHK-001-flowboard-safe-ui-smoke
  project_id: PRJ-001-dd-flow-playground
  experiment_id: EXP-001-playground-merge-queue-live
  run_id: RUN-001-flowboard-safe-ui-smoke
  protocol_id: PRT-001-flowboard-safe-ui-smoke
  purpose: stable|merge|feature|fixture|cleanup
  source_repo: /absolute/source/repo
  path: /declared/checkout/path
  realpath: /resolved/checkout/path
  branch: feature/example
  base_commit: git-sha
  head_commit: git-sha
  status: planned|active|closing|removed|kept|failed
  created_by: session-or-command
  created_at: iso-8601
  closed_at: iso-8601-or-null
  physical_owner: dd-flow|dd-flow-exp|worktrunk|manual
  cleanup_policy: remove_when_clean|keep_for_debug|manual
```

`removed` means physical deletion has been confirmed. If deletion is skipped or unsafe, use `kept` or `failed` with a reason.

## Cleanup Guards

Cleanup commands must enforce safety at service level, not only through hooks:

- refuse to delete current `pwd -P`;
- refuse paths outside the project-scoped checkout root unless the record is explicitly manual;
- refuse symlink escape after `realpath`;
- require stale cleanup preconditions: scan id, generated time, expected status, expected owner/session, expected path and expected head.

## Dashboards

Runtime dashboard state may live under `runtime/dashboards/`.

Rendered project dashboards may still be written to project-owned locations such as:

```text
<project-root>/.tasks/dd-flow-dashboard.md
~/.dd-flow/dashboard.md
```

HTML project/protocol dashboards are rendered under:

```text
~/.dd-flow/projects/<PRJ-ID-slug>/dashboard/
```

Project-local markdown dashboards remain compatibility/reporting artifacts, not alternate runtime state.
