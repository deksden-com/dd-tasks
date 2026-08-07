---
file: '.memory-bank/protocol/PRT-004-exe-preview-runtime/index.md'
description: 'Навигация протокола preview runtime и операционного контура Exe.dev.'
purpose: 'Связывает исходный запрос, рабочую сводку, trace и будущие SPECIFY/PLAN/evidence artifacts.'
version: '0.5.0'
date: '2026-08-05'
status: 'ACTIVE'
protocol_lifecycle: 'CLOSED'
c4_level: 'operations'
parent: '.memory-bank/protocol/index.md'
children:
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/summary.md
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/intake/user-input.md
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/trace/20260804T203419+0200-protocol-start.md
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/trace/20260804T203900+0200-protocol-report.md
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/trace/20260804T214804+0200-planning-start.md
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/trace/20260804T232400+0200-planning-report.md
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/trace/20260804T235701+0200-code-start.md
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/trace/20260805T100257+0200-merge-closure.md
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/evidence/verification-passport.md
tags: [protocol, merged-local, deploy-handoff, exe-dev, preview, runtime, operations]
history:
  - version: '0.5.0'
    date: '2026-08-05'
    changes: 'Canonical local main integration and fresh source-package verification closed; merge trace added and future live provider rollout remains deploy.md-owned.'
  - version: '0.4.0'
    date: '2026-08-04'
    changes: 'CODE session registered in the exact feature worktree after ready_for_code handoff; implementation trace added.'
  - version: '0.3.0'
    date: '2026-08-04'
    changes: 'SPECIFY и полный PLAN RUN-300 приняты; добавлены planning trace и ready_for_code handoff.'
  - version: '0.2.0'
    date: '2026-08-04'
    changes: 'Добавлен завершённый protocol-bootstrap report и точный feature-worktree handoff.'
  - version: '0.1.0'
    date: '2026-08-04'
    changes: 'Создана навигация протокола.'
---

# PRT-004 — Exe preview runtime

- [Сводка протокола](summary.md)
- [Дословный пользовательский ввод](intake/user-input.md)
- [Стартовый trace](trace/20260804T203419+0200-protocol-start.md)
- [Protocol bootstrap report](trace/20260804T203900+0200-protocol-report.md)
- [Старт planning-сессии](trace/20260804T214804+0200-planning-start.md)
- [SPECIFY/PLAN report](trace/20260804T232400+0200-planning-report.md)
- [CODE start trace](trace/20260804T235701+0200-code-start.md)
- [Local merge closure](trace/20260805T100257+0200-merge-closure.md)
- [Source-package verification passport](evidence/verification-passport.md)

Runtime artifacts создаются под project-scoped `dd-flow` run home для
`RUN-300-exe-preview-runtime`. Фактическая provider mutation не входит в
source integration этого протокола; она выполняется позднее отдельным
`deploy.md` после новой operational-access проверки.
