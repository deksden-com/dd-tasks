---
file: '.memory-bank/protocol/PRT-006-preview-access-policy/index.md'
description: 'Навигация протокола управляемой видимости preview и режима регистрации.'
purpose: 'Связывает пользовательский ввод, specification, trace и будущую реализацию безопасных deploy-параметров.'
version: '0.4.0'
date: '2026-08-11'
status: 'ACTIVE'
protocol_lifecycle: 'CLOSED'
c4_level: 'operations'
parent: '.memory-bank/protocol/index.md'
children:
  - .memory-bank/protocol/PRT-006-preview-access-policy/summary.md
  - .memory-bank/protocol/PRT-006-preview-access-policy/intake/user-input.md
  - .memory-bank/protocol/PRT-006-preview-access-policy/trace/20260805T195146Z-protocol-start.md
  - .memory-bank/protocol/PRT-006-preview-access-policy/trace/20260805T195146Z-specify-report.md
  - .memory-bank/protocol/PRT-006-preview-access-policy/trace/20260805T-plan-report.md
  - .memory-bank/protocol/PRT-006-preview-access-policy/trace/20260805T-readiness-report.md
blocked_by_protocols: []
related_specs:
  - .memory-bank/spec/operations/deploy-policy.md
  - .memory-bank/spec/operations/preview-stages.md
  - .memory-bank/spec/operations/operational-access.md
related_scenarios:
  - .memory-bank/scenarios/SCN-003-private-preview-runtime.md
source_user_input:
  - .memory-bank/protocol/PRT-006-preview-access-policy/intake/user-input.md
continuation_prompt: null
implements_scope: 'Два независимых безопасных preview-параметра: provider visibility и application registration mode.'
tags: [protocol, preview, deploy, auth, registration, exe-dev]
history:
  - version: '0.4.0'
    date: '2026-08-11'
    changes: 'Merge, checkpoint publication и public+closed Exe.dev deployment закрыты точным source/digest readback.'
  - version: '0.3.0'
    date: '2026-08-05'
    changes: 'CODE и readiness приняты на clean feature HEAD с project-specific gates, focused quality review и явными non-blocking degradations; следующий gate — canonical merge.'
  - version: '0.2.0'
    date: '2026-08-05'
    changes: 'Plan stage принят как plan-ready с явным degraded review; добавлены authority/status precedence, executable handoff и обязательный CODE/readiness handoff.'
  - version: '0.1.0'
    date: '2026-08-05'
    changes: 'Создан протокол; optimized specify завершён с plan-ready specification.'
---

# PRT-006 — Preview access policy

- [Сводка и specification](summary.md)
- [Дословный пользовательский ввод](intake/user-input.md)
- [Стартовый trace](trace/20260805T195146Z-protocol-start.md)
- [Отчёт SPECIFY](trace/20260805T195146Z-specify-report.md)
- [Plan handoff](trace/20260805T-plan-report.md)
- [CODE/readiness handoff](trace/20260805T-readiness-report.md)

Исторические planning/readiness artifacts находятся в ignored run-папке
`.tasks/dd-flow-runs/RUN-304-preview-access-policy/`. Feature интегрирована в
`main`; annotated tag `checkpoint-03-preview-access-policy` указывает на commit
`15021169f90245c6d9254488b8a3ba0621b5bc07`. Публичный preview
`https://ddtasks-cp02.exe.xyz/` подтвердил этот revision, artifact digest
`sha256:d73565c7a844b4cea758ad58890d20418a0b0b2367491a3dd2af20017f96803c`
и `registration_mode=closed`.
