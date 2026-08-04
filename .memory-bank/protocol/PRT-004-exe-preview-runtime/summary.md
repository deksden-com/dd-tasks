---
file: '.memory-bank/protocol/PRT-004-exe-preview-runtime/summary.md'
description: 'Рабочая сводка протокола preview runtime и операционного контура Exe.dev.'
purpose: 'Фиксирует problem-space цель, scope, Git workspace, начальные gaps и handoff в SPECIFY.'
version: '0.4.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/protocol/PRT-004-exe-preview-runtime/index.md'
blocked_by_protocols: []
related_specs:
  - .memory-bank/spec/operations/index.md
related_scenarios:
  - .memory-bank/scenarios/SCN-002-workspace-task-core.md
  - .memory-bank/scenarios/SCN-003-private-preview-runtime.md
source_user_input:
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/intake/user-input.md
continuation_prompt: 'code.md после явного запуска CODE'
tags: [protocol, plan, ready-for-code, exe-dev, preview, runtime, runbook]
history:
  - version: '0.4.0'
    date: '2026-08-04'
    changes: 'CODE implementation registered in the exact feature worktree; one-port preview runtime, guarded data lifecycle, readiness, source SCN-003 and local/eval smoke are being closed before readiness handoff.'
  - version: '0.3.0'
    date: '2026-08-04'
    changes: 'SPECIFY и полный PLAN приняты; PLAN-004 фиксирует minimal private preview package, data/access/evidence gates и отдельный будущий deploy.md.'
  - version: '0.2.0'
    date: '2026-08-04'
    changes: 'Protocol bootstrap зарегистрирован как RUN-300; ownership gap безопасно перенесён в deploy-time operational-access gate без блокировки source plan.'
  - version: '0.1.0'
    date: '2026-08-04'
    changes: 'Создан feature-worktree protocol handoff.'
---

# PRT-004 — Exe preview runtime

## Protocol

```yaml
protocol:
  id: PRT-004-exe-preview-runtime
  title: Exe preview runtime and operations contour
  mode: normal
  current_stage: implementation
  next_action: complete CODE verification/readiness, then hand exact source HEAD to the separate merge session
scope_sizing_verdict: single_executable_protocol
stage_verdict: ready_for_code
plan_id: PLAN-004-exe-preview-runtime
plan_items: 11
```

Одна цель протокола: сделать точный checkpoint dd-tasks воспроизводимо
запускаемым как безопасный preview и оформить долговечные operational policies,
stage model, runbook и acceptance evidence, достаточные для отдельного
последующего `deploy.md` на Exe.dev.

## Workspace

```yaml
workspace:
  project_root: /Users/deksden/Documents/_Projects/dd-tasks
  protocol_location: feature_worktree
  integration_branch: main
  base_commit: 4c26c33e100da970ac54b5560b6dfbb0e8d9e0cc
  feature_branch: feature/prt-004-exe-preview-runtime
  worktree_path: /Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/checkouts/worktrees/PRT-004-exe-preview-runtime/RUN-300-exe-preview-runtime/dd-tasks
  integration_branch_locked: false
```

Git route — `feature_worktree`, delivery strategy исходного изменения —
`feature_merge`. Создание или изменение VM, секретов и provider resources не
является CODE/merge side effect: реальный preview deploy должен идти отдельным
delivery flow после принятого source commit.

## Task

```yaml
task:
  original_user_request: .memory-bank/protocol/PRT-004-exe-preview-runtime/intake/user-input.md
  working_understanding: >-
    Описать local/preview stages и Exe.dev operational contour, добавить
    минимальный production-like runtime package, deterministic reset/seed,
    health/browser smoke и операторский runbook; затем отдельно развернуть
    checkpoint preview VM.
  in_scope:
    - project-policy hub links and detailed spec/operations owners
    - environment, check-profile, deploy, access and secrets policies
    - Exe.dev deploy runbook
    - runtime packaging for web, API and internal PostgreSQL
    - deterministic migration/reset/seed and preview smoke
    - canonical SCN-003 preview acceptance and verification-matrix binding
  out_of_scope:
    - production environment or production availability claims
    - background activity, autoscaling platform or multi-tenant control plane
    - provider mutation during source CODE/merge
    - CI/CD platform unless PLAN proves it necessary
```

## Decisions and initial gaps

```yaml
decisions:
  initial_gaps:
    - id: GAP-001
      summary: Expected Exe.dev account/team ownership context is not yet explicit.
      impact: May change operational-access binding and deploy acceptance.
    - id: GAP-002
      summary: Preview exposure and data-lifecycle defaults need explicit requirements treatment.
      impact: Affects safety, reset semantics and acceptance evidence.
  fixed_questions: []
  open_questions: []
```

Safe proposed defaults for SPECIFY to validate: preview is private by default;
its data is disposable and recreated from deterministic fixtures; no backup,
staging or production promise is introduced. `DEF-MBU-RUNTIME-ACTIVE-STATE` is
`not_relevant`: it concerns dd-flow home/runtime contract migration, not the
application PostgreSQL preview runtime.

Actual Exe.dev identity/team is deliberately not persisted or guessed during
source planning. It becomes an operation-scoped input to the later `deploy.md`
preflight, where fresh readback must bind exactly one expected account/team and
target VM before provider mutation. Поэтому GAP-001 не блокирует PLAN.

## Verification outline

```yaml
verification:
  acceptance_outline: >-
    From one clean accepted commit an operator follows the runbook, starts the
    preview stack, observes web and API health, logs in as the deterministic
    owner and completes the basic task flow without exposing secrets.
  check_profile: full local quality plus container/runtime smoke and SCN-003
```

SPECIFY завершён с `specified_ready_for_plan`: baseline/research routing,
fresh knowledge extraction, consolidated gaps, scenario coverage и user gate
закрыты без открытых problem-space вопросов.

## Accepted PLAN

`PLAN-004-exe-preview-runtime` содержит 11 исполнимых пунктов от workspace
bootstrap до отдельного deploy handoff. Фазы reflection, review,
implementation-plan, operations и scenarios выполнены; обязательные focused
architecture, data/migration, security/privacy, testing, evidence,
release/deploy, external integration и scenario reviews приняты после
исправлений.

```yaml
accepted_runtime:
  long_running_processes:
    - one built Hono app serving API and the Vite SPA on one external port
    - one internal PostgreSQL process
  operations:
    - guarded migrate
    - explicit serialized reset/seed under exact world binding
  readiness: database reachability + migration checksums + seed marker + immutable artifact provenance
profiles:
  - local
  - test
  - preview-checkpoint
  - preview-eval-output
source_gate:
  git: feature_merge to local main after readiness
  result: exact commit SHA + deploy_required_next
  excluded: [push, tag, release, publish, provider mutation]
future_deploy_gate:
  prompt: deploy.md
  required: fresh identity/team/authority/VM/private-share/transport/capacity readback
  success: accepted live SCN-003 rollout evidence
```

Preview работает в production execution mode с secure same-origin cookies, но
не получает production semantics. Данные disposable; checkpoint volume может
переживать ordinary restart без backup promise, eval-output требует TTL и exact
cleanup. Коммитнутые local demo credentials запрещены для live preview;
operation-scoped actor/runtime/provider secret classes разделены и не попадают
в Git, image metadata, logs или evidence.

Source readiness требует immutable commit-to-artifact digest, built-package
smoke, migration/reset/seed failure gates, full authorization matrix, SCN-003
source passport и чистый worktree. Live-provider rows остаются pending до
фактического отдельного deploy flow.

Плановый runtime renderer имеет локальную диагностику: RUN сохранил base HEAD
до protocol-bootstrap commit и поэтому `prompt render` возвращает
`prompt_runtime_mismatch`; ветка/worktree точны, CLI не имеет штатного rebind,
runtime вручную не редактировался и новый RUN не создавался. Explicit RUN-local
task packets и fresh focused sessions закрыли review; это не CODE blocker.

`CODE` зарегистрирован после `ready_for_code` handoff в exact feature worktree.
Source-package preview checks не являются Exe.dev evidence: provider identity,
team, VM, private share, transport and capacity остаются отдельным deploy gate.
