---
file: '.memory-bank/epics/EP-001-task-management/features/FT-001-task-priority/index.md'
description: 'Workspace members can assign Low, Medium or High to a task and see that readable label on the project task list.'
purpose: 'Records the user-facing feature, product grounding and implemented SCN-002 acceptance evidence after CODE.'
version: '0.2.0'
date: '2026-08-29'
status: 'ACTIVE'
parent: '.memory-bank/epics/EP-001-task-management/index.md'
related_protocols: ['PRT-007-task-priority']
related_specs:
  - .memory-bank/spec/product/index.md
related_scenarios:
  - .memory-bank/scenarios/SCN-002-workspace-task-core.md
related_files:
  - apps/web/tests/browser/core.spec.ts
  - apps/api/tests/core.integration.test.ts
  - apps/api/tests/api-json-contract.test.ts
  - .memory-bank/plans/verification-matrix.md
tags: [feature, task-priority]
history:
  - version: '0.2.0'
    date: '2026-08-29'
    changes: 'Linked implemented Low/Medium/High acceptance evidence on the existing SCN-002 contour after CODE.'
  - version: '0.1.0'
    date: '2026-08-29'
    changes: 'PROTOCOLIZE stub for the required Low/Medium/High task priority field.'
---

# FT-001-task-priority — Task priority

Workspace members can assign Low, Medium or High to a task and see that readable label on the project task list.

## Outcome

Every task has exactly one required priority from the closed set whose
human-readable labels are Low, Medium and High. The project task list shows
that text next to the task. Create without a chosen priority stores Medium;
already persisted tasks without priority receive Medium. Archived-project
mutations, including priority changes, stay rejected while an authorized actor
can still read each row's Low, Medium or High text. Owner/member isolation,
safe non-member 404 and existing title/description behavior are unchanged.

## Grounding

- Product: [spec/product](../../../../spec/product/index.md)
- Scenario: [SCN-002 workspace task core](../../../../scenarios/SCN-002-workspace-task-core.md)
  (same identity; PRT-007 extends the local contour)
- Protocol: [PRT-007-task-priority](../../../../protocol/PRT-007-task-priority/summary.md)
- Matrix: [verification-matrix](../../../../plans/verification-matrix.md)

## Acceptance evidence

Implemented local proof after CODE, not a new scenario:

- Browser list labels, High create, omitted Medium, Low edit of a created task,
  labelled control, archived-project read-only and isolation:
  `apps/web/tests/browser/core.spec.ts`
- API closed-set assign/default/preserve/reject, 0001-era Medium backfill,
  archived-project read-only and non-member 404:
  `apps/api/tests/core.integration.test.ts`
- List/create/update JSON `task.priority` as `low`, `medium` or `high`:
  `apps/api/tests/api-json-contract.test.ts`

## Verification

- Primary scenario: `SCN-002-workspace-task-core` (extended; no new scenario id)
- Local row: PRT-007/SCN-002 on `.memory-bank/plans/verification-matrix.md`
- Proof limits: local/test exact checkout only; not sort/filter/board, CI,
  preview or production
