---
file: '.memory-bank/protocol/PRT-006-preview-access-policy/trace/20260805T195146Z-protocol-start.md'
description: 'Стартовый trace protocol/specify для PRT-006.'
purpose: 'Фиксирует исходный Git/runtime контекст и ожидаемую границу работы.'
version: '0.1.0'
date: '2026-08-05'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/protocol/PRT-006-preview-access-policy/index.md'
tags: [trace, protocol, specify]
---

# Prompt start: protocol.md → specify

- timestamp: 2026-08-05T19:51:46Z
- prompt: `.memory-bank/dd-flow/protocol.md`
- protocol: `PRT-006-preview-access-policy`
- cwd: `/Users/deksden/Documents/_Projects/dd-tasks` during priming; feature worktree selected before protocol write
- branch_or_worktree: `feature/prt-006-preview-access-policy`
- trigger: user requested a protocol and complete specify pass
- understood_objective: define safe deploy-time preview visibility and application registration modes
- current_stage: protocol bootstrap
- expected_next_action: optimized specify; stop before plan/code
- route: `feature_worktree`, future `feature_merge`, delivery gate `preview`
- scope_boundaries: no plan, code, merge, push, tag or provider mutation
- assumptions: existing application auth remains mandatory; hosted defaults fail closed
- blockers: `dd-flow` CLI unavailable; file-only degraded runtime permitted by flow contract

## Preflight

- base branch: clean `main`, equal to `origin/main`
- base commit: `0099c93253c1e449621e05be654788d1a784be39`
- write permission: manual read/write/probe preflight passed for Memory Bank and `.tasks`
- project policy: read
- flow catalog: read
- active DEF: `DEF-MBU-RUNTIME-ACTIVE-STATE` read and marked `not_touched`; no runtime/home migration is in scope
