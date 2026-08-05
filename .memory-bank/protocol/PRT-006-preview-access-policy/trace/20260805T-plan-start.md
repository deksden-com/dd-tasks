---
file: '.memory-bank/protocol/PRT-006-preview-access-policy/trace/20260805T-plan-start.md'
description: 'Стартовый trace планирования для PRT-006.'
purpose: 'Фиксирует predecessor gate, exact worktree, policy context и разрешённое пользователем terminal continuation.'
version: '0.1.0'
date: '2026-08-05'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/protocol/PRT-006-preview-access-policy/index.md'
tags: [trace, plan, preview, auth, delivery]
---

# Prompt start: plan.md

- timestamp: 2026-08-05
- prompt: `.memory-bank/dd-flow/plan.md`
- protocol: `PRT-006-preview-access-policy`
- run: `RUN-304-preview-access-policy`
- cwd: `/Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/checkouts/worktrees/PRT-006-preview-access-policy/RUN-304-preview-access-policy/dd-tasks`
- branch_or_worktree: `feature/prt-006-preview-access-policy`
- trigger: delegated terminal request explicitly requires plan -> code -> readiness -> merge -> checkpoint delivery -> deploy continuation
- predecessor: `specify` accepted as `specified_ready_for_plan`; `.tasks/dd-flow-runs/RUN-304-preview-access-policy/01-specify/stage-report.json` exists
- current_stage: `plan`
- expected_next_action: complete full plan and continue directly into code/readiness per terminal user instruction
- target_language: `ru`
- route: `feature_worktree` -> `feature_merge`; integration branch `main`; delivery target `preview` then exact Exe.dev VM `ddtasks-cp02`
- runtime_cli: `degraded_unavailable`; no `dd-flow` command installed; use file-only RUN artifacts and never edit external SQLite/JSON state manually
- write_preflight: manual degraded passed on macOS 26.3 for `.memory-bank` and `.tasks` directory probes
- active_def: `DEF-MBU-RUNTIME-ACTIVE-STATE` -> `not_touched`; no runtime/home migration in scope
- preserved_preexisting_changes: `.memory-bank/protocol/index.md` modified and `PRT-006-preview-access-policy/` untracked before this flow; do not revert
- constraints: no new dependency, DB migration, deploy CLI/control plane or domain allowlist; hosted defaults `private + closed`; `public + open` rejected
- blockers: none at plan start; provider identity/access and exact target facts are fresh deploy gates, not plan assumptions
