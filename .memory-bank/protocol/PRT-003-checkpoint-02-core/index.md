---
file: '.memory-bank/protocol/PRT-003-checkpoint-02-core/index.md'
description: 'Навигация source-backed протокола checkpoint-02-core.'
purpose: 'Связывает intake, historical audit, CODE/readiness trace, SCN-002 и RUN-298 evidence.'
version: '0.3.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/protocol/index.md'
children:
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/summary.md
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/intake/user-input.md
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/intake/code-merge-authorization.md
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/trace/20260802T1719-runtime-cli-degraded.md
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/trace/20260803T090440+0200-code-start.md
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/trace/20260803T093941+0200-readiness-review.md
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/trace/20260803T094844+0200-merge-closure.md
  - .memory-bank/protocol/PRT-003-checkpoint-02-core/evidence/verification-passport.md
tags: [protocol, checkpoint-02, core, code, readiness, merged, closed]
history:
  - version: '0.3.0'
    date: '2026-08-03'
    changes: 'Добавлен local main merge/checkpoint closure trace и final RUN-298 merge evidence route.'
  - version: '0.2.0'
    date: '2026-08-03'
    changes: 'Добавлены CODE+merge authorization, implementation trace, SCN-002 passport и RUN-298 CODE/readiness navigation.'
---

# PRT-003 — checkpoint-02-core

- [Сводка протокола](summary.md)
- [Вход пользователя](intake/user-input.md)
- [CODE → merge authorization](intake/code-merge-authorization.md)
- [Runtime CLI degradation trace](trace/20260802T1719-runtime-cli-degraded.md)
- [CODE start trace](trace/20260803T090440+0200-code-start.md)
- [Readiness review trace](trace/20260803T093941+0200-readiness-review.md)
- [Merge closure trace](trace/20260803T094844+0200-merge-closure.md)
- [Verification passport](evidence/verification-passport.md)
- [SCN-002](../../scenarios/SCN-002-workspace-task-core.md)
- [Historical RUN-297 SPECIFY stage](/Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/runs/RUN-297-prt-003-checkpoint-02-core-specify-plan/01-specify/report.md) — immutable degraded audit.
- [Recovery RUN-298 SPECIFY stage](/Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/runs/RUN-298-prt-003-checkpoint-02-core-recovery/01-specify/report.md)
- [Recovery RUN-298 PLAN stage](/Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/runs/RUN-298-prt-003-checkpoint-02-core-recovery/02-plan/report.md)
- [Recovery RUN-298 CODE stage](/Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/runs/RUN-298-prt-003-checkpoint-02-core-recovery/03-code/report.md)
- [Recovery RUN-298 MERGE stage](/Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/runs/RUN-298-prt-003-checkpoint-02-core-recovery/04-merge/report.md)
- [Recovery RUN-298 run index](/Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/runs/RUN-298-prt-003-checkpoint-02-core-recovery/run-index.json)

Runtime artifacts live outside the repository under the project-scoped
`dd-flow` run home. RUN-297 remains historical `done/degraded`; RUN-298 is the
canonical implementation/readiness/merge run. Runtime state is authoritative only
after corrected CLI readback; source evidence never replaces queue/session data.
