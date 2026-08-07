---
file: '.memory-bank/protocol/PRT-005-linear-workflow-ui/evidence/verification-passport.md'
description: 'Проверки реализации Linear-inspired project/task workflow.'
purpose: 'Фиксирует воспроизводимые automated и browser evidence перед merge.'
version: '0.1.0'
date: '2026-08-05'
status: 'ACTIVE'
evidence_kind: 'test'
verdict: 'pass'
environment: 'local'
c4_level: 'product'
parent: '.memory-bank/protocol/PRT-005-linear-workflow-ui/index.md'
tags: [protocol, evidence, verification, ui, browser]
---

# Verification passport

## Automated

- `pnpm quality` — passed: format, lint, typecheck, unit, integration, build and
  value-absence checks.
- `pnpm docs:check` — passed.
- `pnpm --filter @dd-tasks/web test:unit` — 9/9 passed after the final UI change.
- Owner lifecycle browser scenario — passed: create project, inline rename,
  create task, open deep link, edit/save, guarded delete, archive/restore.
- Member permissions and narrow viewport browser scenarios — passed.

## Browser walkthrough

Local owner walkthrough on `2026-08-05` verified:

1. project creation is hidden until `New project`;
2. inline rename opens with the current project name populated;
3. project and task navigation use real links;
4. task detail exposes title, description and save state;
5. delete requires a separate confirmation and can be cancelled;
6. no runtime page errors were reported during the final task-detail pass.

The final walkthrough used an isolated API port because another historical
worktree already occupied the default loopback port. This was a local operator
conflict, not an application defect or repository change.
