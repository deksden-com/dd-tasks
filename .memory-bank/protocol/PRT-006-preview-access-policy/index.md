---
file: '.memory-bank/protocol/PRT-006-preview-access-policy/index.md'
description: 'Навигация протокола управляемой видимости preview и режима регистрации.'
purpose: 'Связывает пользовательский ввод, specification, trace и будущую реализацию безопасных deploy-параметров.'
version: '0.2.0'
date: '2026-08-05'
status: 'READY_FOR_CODE'
c4_level: 'operations'
parent: '.memory-bank/protocol/index.md'
children:
  - .memory-bank/protocol/PRT-006-preview-access-policy/summary.md
  - .memory-bank/protocol/PRT-006-preview-access-policy/intake/user-input.md
  - .memory-bank/protocol/PRT-006-preview-access-policy/trace/20260805T195146Z-protocol-start.md
  - .memory-bank/protocol/PRT-006-preview-access-policy/trace/20260805T195146Z-specify-report.md
  - .memory-bank/protocol/PRT-006-preview-access-policy/trace/20260805T-plan-report.md
blocked_by_protocols: []
related_specs:
  - .memory-bank/spec/operations/deploy-policy.md
  - .memory-bank/spec/operations/preview-stages.md
  - .memory-bank/spec/operations/operational-access.md
related_scenarios:
  - .memory-bank/scenarios/SCN-003-private-preview-runtime.md
source_user_input:
  - .memory-bank/protocol/PRT-006-preview-access-policy/intake/user-input.md
continuation_prompt: 'plan.md'
implements_scope: 'Два независимых безопасных preview-параметра: provider visibility и application registration mode.'
tags: [protocol, preview, deploy, auth, registration, exe-dev]
history:
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

Runtime artifacts находятся в ignored run-папке
`.tasks/dd-flow-runs/RUN-304-preview-access-policy/`. CLI недоступен в текущем
окружении, поэтому RUN оформлен как явно degraded файловый runtime без ручной
правки внешнего state store.
