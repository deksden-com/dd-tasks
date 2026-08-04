---
file: '.memory-bank/protocol/PRT-004-exe-preview-runtime/summary.md'
description: 'Рабочая сводка протокола preview runtime и операционного контура Exe.dev.'
purpose: 'Фиксирует problem-space цель, scope, Git workspace, начальные gaps и handoff в SPECIFY.'
version: '0.1.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/protocol/PRT-004-exe-preview-runtime/index.md'
blocked_by_protocols: []
related_specs:
  - .memory-bank/spec/operations/index.md
related_scenarios:
  - .memory-bank/scenarios/SCN-002-workspace-task-core.md
source_user_input:
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/intake/user-input.md
continuation_prompt: 'protocol.md -> specify, затем plan.md'
tags: [protocol, specify, exe-dev, preview, runtime, runbook]
---

# PRT-004 — Exe preview runtime

## Protocol

```yaml
protocol:
  id: PRT-004-exe-preview-runtime
  title: Exe preview runtime and operations contour
  mode: normal
  current_stage: specify
  next_action: continue optimized specify from the feature worktree
scope_sizing_verdict: single_executable_protocol
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
  open_questions:
    - Q-001
```

Safe proposed defaults for SPECIFY to validate: preview is private by default;
its data is disposable and recreated from deterministic fixtures; no backup,
staging or production promise is introduced. `DEF-MBU-RUNTIME-ACTIVE-STATE` is
`not_relevant`: it concerns dd-flow home/runtime contract migration, not the
application PostgreSQL preview runtime.

## Verification outline

```yaml
verification:
  acceptance_outline: >-
    From one clean accepted commit an operator follows the runbook, starts the
    preview stack, observes web and API health, logs in as the deterministic
    owner and completes the basic task flow without exposing secrets.
  check_profile: full local quality plus container/runtime smoke and SCN-003
```

SPECIFY must perform baseline scan, bounded Memory Bank/provider research,
method applicability and the user-question gate before PLAN. PLAN owns concrete
container layout, commands and implementation order.
