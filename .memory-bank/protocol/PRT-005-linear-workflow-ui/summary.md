---
file: '.memory-bank/protocol/PRT-005-linear-workflow-ui/summary.md'
description: 'Scope, UX findings and executable acceptance for Linear-подобного workflow UI.'
purpose: 'Ограничивает изменение project/task interaction model минимальным полезным контуром.'
version: '0.3.0'
date: '2026-08-11'
status: 'ACTIVE'
protocol_lifecycle: 'CLOSED'
c4_level: 'product'
parent: '.memory-bank/protocol/PRT-005-linear-workflow-ui/index.md'
source_user_input:
  - .memory-bank/protocol/PRT-005-linear-workflow-ui/intake/user-input.md
related_scenarios:
  - .memory-bank/scenarios/SCN-002-workspace-task-core.md
tags: [protocol, ui, ux, projects, tasks, accessibility]
history:
  - version: '0.3.0'
    date: '2026-08-11'
    changes: 'Зафиксированы integration closure и включение результата в deployed checkpoint-03.'
---

# PRT-005 — Linear workflow UI

## UX findings

- The always-visible empty `Project name` create form is visually ambiguous.
- Project/task rename uses native `window.prompt`, so edit state is hidden and browser-dependent.
- Tasks have no detail route; a row is static content with disconnected actions.
- Project names can overflow the viewport at the current display size.
- Stateful navigation uses action buttons rather than real links.

## Scope

Reuse the existing project and task API. Add no dependency and no backend
endpoint. Deliver a compact, dense, keyboard-visible UI inspired by Linear,
without cloning Linear's command system, issue states, cycles or collaboration.

Implementation plan:

1. Separate creation from browsing with explicit `New project` / `New task` actions.
2. Replace prompt-based project rename with inline editing.
3. Make task rows real deep links and add a task detail route.
4. Put title, description, save and guarded delete on task detail.
5. Fix responsive typography, overflow, focus and empty/error states.
6. Update unit/browser coverage and pass project quality gates.

## Acceptance

- No empty create field appears until the user asks to create something.
- Project rename is visible, cancellable and saves through the existing API.
- Every task has a stable deep link.
- Task title and description can be edited from its detail view.
- Task deletion requires explicit confirmation and returns to the project.
- Long names do not create horizontal overflow at desktop or mobile widths.
- Existing owner/member authorization behavior is unchanged.

## Result

- Creation forms are disclosed only after `New workspace`, `New project` or
  `New task` is selected.
- Project rename is an inline, populated and cancellable edit state.
- Task rows are real links to stable detail routes.
- Task detail owns title/description editing, dirty-state feedback, unsaved
  navigation protection and explicit delete confirmation.
- Existing API endpoints and authorization remain unchanged; no dependency was
  added.
- Automated gates and a browser-level owner walkthrough are recorded in the
  [verification passport](evidence/verification-passport.md).
- Feature commit `a394286` интегрирован в `main`; результат входит в
  `checkpoint-03-preview-access-policy` и текущий Exe.dev preview.
