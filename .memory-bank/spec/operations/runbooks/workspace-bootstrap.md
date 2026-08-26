---
file: '.memory-bank/spec/operations/runbooks/workspace-bootstrap.md'
description: 'Source-backed operator runbook подготовки foundation workspace перед project tooling.'
purpose: 'Даёт повторяемый порядок установки зависимостей, локальной PostgreSQL readiness и безопасной передачи receipt в code gate.'
version: '0.2.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/operations/index.md'
parent_template: '.memory-bank/mbb/templates/devops-runbook-base.md'
operation_type: 'workspace-bootstrap'
applicability_status: 'applicable'
related_specs:
  - .memory-bank/spec/operations/workspace-bootstrap-policy.md
  - .memory-bank/spec/operations/secrets-policy.md
related_protocols:
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md
evidence_files:
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/trace/20260802T014200+0200-readiness-bootstrap.md
access_binding_refs: []
tags: [dd-tasks, operations, runbook, workspace-bootstrap, foundation]
history:
  - version: '0.2.0'
    date: '2026-08-02'
    changes: 'Promoted после source-backed implementation receipt; readiness теперь использует отдельную freshness/revalidation receipt.'
---

# Workspace bootstrap runbook

## Purpose and scope

Подготовить один concrete feature worktree для локальной foundation implementation, tests, build и browser scenario. Runbook не является deploy/release runbook-ом и не поднимает production environment.

- operation: `workspace-bootstrap`;
- trigger: code or readiness stage после добавления root manifests и canonical script;
- expected result: `bootstrap_completed` или честно зафиксированный `bootstrap_blocked`/`bootstrap_failed`;
- workspace owner: текущий `PRT-001-checkpoint-01-foundation` code flow;
- approval: не требуется для local-only действия;
- data impact: local/test write only, no shared or production data.

## Applicability

- applicable: concrete feature worktree перед pnpm install, Docker Compose, migrations, tests, build или Playwright;
- not applicable: read-only Memory Bank plan work;
- not applicable reason for external secrets: см. [secrets policy](../secrets-policy.md), external credentials этой волне не нужны.

## Canonical sources

- policy: `../workspace-bootstrap-policy.md`;
- canonical entrypoint: `bash .memory-bank/spec/operations/scripts/bootstrap-workspace.sh`;
- optional local service definition: `docker-compose.yml`;
- readiness receipt: `<run-home>/05-code/workspace-readiness.json`; it is created once by deterministic CODE bootstrap and reused only for the same workspace and frozen command.
- current plan producer: `PRT-001-checkpoint-01-foundation`;
- `dd-flow` CODE gate supplies an opaque checkout suffix through `DD_FLOW_LOCAL_DATABASE_SUFFIX`. With a RUN id, local/test database commands use a dedicated database for that checkout; do not set or reuse this variable manually for preview or shared work.
- If the project-owned loopback PostgreSQL service is already healthy on `POSTGRES_PORT` (default `55433`), bootstrap reuses it. Only a missing service is started with Compose; a worktree must not create a competing container for that port or volume.
- receipt is not valid until script exists, current workspace identity is read back, public inputs are compared and the canonical entrypoint passes for the concrete checkout.

## Preconditions

- [ ] `pwd -P` equals the canonical feature worktree path.
- [ ] branch is `feature/prt-001-checkpoint-01-foundation`.
- [ ] current commit and base are recorded; stable main is not a mutation target.
- [ ] root manifests, workspace declaration and bootstrap script are tracked or explicitly in the current code diff.
- [ ] Node and pnpm are available; versions are recorded without guessing.
- [ ] Docker/Compose is available if the selected local PostgreSQL contour uses it.
- [ ] no arbitrary `.env*` copy, login, provider context switch, remote Git mutation or production action is requested.

## Execution steps

1. Read the current workspace path, repository identity, branch and commit.
2. Read public bootstrap inputs: root manifest, workspace manifest, lockfile if present, runtime/toolchain declarations, policy, runbook, script and Compose definition.
3. Run the canonical entrypoint:

   ```text
   bash .memory-bank/spec/operations/scripts/bootstrap-workspace.sh
   ```

4. The script may perform only deterministic local preparation:
   - validate Node/pnpm versions;
   - install dependencies using the project lockfile policy;
   - start an isolated local PostgreSQL service if needed;
   - wait for a bounded readiness check;
   - avoid migrations, reset/drop, seed, tests, build and Playwright because those are later code-stage gates.
5. Save sanitized command and exit status to the code-stage receipt.
6. If the entrypoint or required access fails, stop before project tooling and record `bootstrap_failed` or `bootstrap_blocked`; do not downgrade the result.

## Safety and local data boundary

- Docker service must use a project-specific local database/name and an explicitly named volume.
- Reset/drop is never implicit in bootstrap; it is a separate guarded command.
- Database reset accepts only local/test connection targets and rejects production-like hosts or names.
- No application/product data, credentials, stack traces or machine-specific paths enter response/evidence.
- A feature-worktree receipt cannot prove another checkout ready.

## Verification and readback

- `bootstrap_status`: `bootstrap_completed | bootstrap_blocked | bootstrap_failed`;
- workspace path/branch/commit readback;
- Node/pnpm/Docker toolchain readiness;
- dependency install result and lockfile presence/hash as public input only;
- local PostgreSQL process readiness if selected;
- canonical policy/runbook/script paths used;
- no secret classes required (`not_applicable`);
- receipt path and cleanup state;
- what remains unproven: migrations, reset/seed, API, web, tests, build and e2e are later gates.

## Reuse and invalidation

Reuse only on the same workspace path and repository identity with unchanged public inputs and a passing lightweight readiness check. Invalidate on path, branch/commit, manifest/lockfile/toolchain/policy/runbook/script/Compose changes or missing dependency/service readiness.

## Rollback and cleanup

- bootstrap itself has no source rollback operation; code diff remains under protocol ownership;
- dependency cache is managed by pnpm, never copied between worktrees;
- Docker service may be stopped with the explicit local command; data volume removal belongs to guarded reset/down flow;
- no worktree removal, branch deletion, commit, push or tag operation is part of this runbook.

## Lessons and promotion

Unexpected setup facts are recorded as task-local lessons in `.tasks/` and promoted to this policy/runbook or `spec/engineering/` only when supported by source-backed code/evidence. The code/readiness report must state whether the receipt was completed, reused, blocked or failed.
