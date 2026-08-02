---
file: '.memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md'
description: 'Индекс протокола checkpoint-01-foundation после локальной merge-интеграции и fallback fixation recovery.'
purpose: 'Даёт навигацию по source-backed handoffs, scenario/passport evidence, runtime run, merge integration и scoped direct fixation.'
version: '0.7.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/protocol/index.md'
children:
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/summary.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/intake/user-input.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/intake/feature-worktree-decision.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/trace/20260801T154035+0200-protocol-start.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/trace/20260801T154606+0200-protocol-report.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/trace/20260801T191048+0200-specify.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/trace/20260802T014200+0200-readiness-bootstrap.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/trace/readiness-orchestrator-review.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/trace/20260802T155806+0200-merge-recovery-start.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/evidence/verification-passport.md
related_files:
  - README.md
  - .memory-bank/plans/index.md
  - .memory-bank/project-policy.md
  - .memory-bank/dd-flow/protocol.md
  - .memory-bank/dd-flow/common/specification.md
  - .memory-bank/dd-flow/common/flow-runs.md
tags: [protocol, checkpoint-01, foundation, feature-worktree, dd-flow]
history:
  - version: '0.7.0'
    date: '2026-08-02'
    changes: 'Создан RUN-005 fallback merge recovery: readiness и local integration приняты, queue requeue defect CLI 0.4.0 обойдён только для этого protocol, exact tag/push targets заданы без force.'
  - version: '0.6.0'
    date: '2026-08-02'
    changes: 'Fast-forward integration в main и свежие main checks приняты; checkpoint tag/push остановлены на точном user gate.'
  - version: '0.5.0'
    date: '2026-08-02'
    changes: 'Принят local readiness: SCN-001, docs promotion, passport и fresh checks закрыты; следующий gate — canonical merge.'
  - version: '0.4.0'
    date: '2026-08-02'
    changes: 'Добавлены принятый plan, завершённый code handoff, evidence runs и readiness stop boundary.'
  - version: '0.3.0'
    date: '2026-08-01'
    changes: 'Зафиксированы source-backed specify result, stage artifacts, runtime run и handoff только к следующему plan gate.'
  - version: '0.2.0'
    date: '2026-08-01'
    changes: 'Обновлены Git/workspace facts и navigation после миграции protocol diff в feature worktree.'
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Создан индекс протокола checkpoint-01-foundation до стадии specify.'
---

# Checkpoint-01 Foundation

- `route.git`: `feature_worktree`
- `feature_branch`: `feature/prt-001-checkpoint-01-foundation`
- `workspace_path`: `/Users/deksden/.dd-flow/projects/PRJ-001-dd-tasks/checkouts/worktrees/PRT-001-checkpoint-01-foundation/manual-protocol/dd-tasks`
- `base_commit`: `739fd2bc3665257f70e9680bce2abf17144a146f`
- `completed_stage`: `integration` (local source integration); `current_stage`: `integration`; verdicts: `specified_ready_for_plan` → `ready_for_code` → `implemented_with_named_deferrals` → `accepted_local` → `local_integrated_pending_direct_fixation`.
- `stage artifacts`: specify `RUN-001-prt-001-checkpoint-01-foundation-specify`, plan `RUN-002-prt-001-checkpoint-01-foundation-plan`, code `RUN-003-prt-001-checkpoint-01-foundation-code`, fallback merge recovery `RUN-005-prt-001-checkpoint-01-foundation-merge-recovery`; canonical data/report/html/evidence находятся в соответствующих run homes.

- [Сводка протокола](summary.md): цель, границы, handoffs, readiness acceptance, merge result и fixation gate.
- [Исходный пользовательский ввод](intake/user-input.md): буквальная постановка задачи и ограничения текущей волны.
- [Решение о feature worktree](intake/feature-worktree-decision.md): новый явный пользовательский Git-контур с provenance; не заменяет INPUT-001.
- [Стартовый след](trace/20260801T154035+0200-protocol-start.md): контекст запуска protocol.md и зафиксированный degraded runtime.
- [Итоговый след](trace/20260801T154606+0200-protocol-report.md): фактический результат protocol bootstrap и verification evidence.
- [Specify trace](trace/20260801T191048+0200-specify.md): problem-space gap analysis, runtime evidence и остановка перед plan.
- [Code handoff summary](summary.md#plan-и-code-continuation-evidence): source-backed implementation, quality evidence и точная остановка перед readiness.
- [Verification passport](evidence/verification-passport.md): accepted local contour, fresh SCN-001, quality/docs/browser/DB evidence and proof limits.
- [Merge integration trace](trace/20260802T024600+0200-merge-integration-gate.md): fast-forward result, post-merge evidence, knowledge recovery and exact user gate.
- [Merge recovery start trace](trace/20260802T155806+0200-merge-recovery-start.md): user-authorized degraded route, exact preflight and CLI 0.4.0 queue-contour bypass boundary.
