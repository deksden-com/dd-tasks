---
file: '.memory-bank/protocol/PRT-007-task-priority/summary.md'
description: 'Give every task a required Low, Medium or High priority and show that human-readable label on the project task list.'
purpose: 'Records the executable protocol scope and acceptance.'
version: '0.1.0'
date: '2026-08-29'
status: 'ACTIVE'
c4_level: 'product'
parent: '.memory-bank/protocol/PRT-007-task-priority/index.md'
protocol_set: null
blocked_by_protocols: []
source_user_input: null
related_epics: ['.memory-bank/epics/EP-001-task-management/index.md']
related_features: ['.memory-bank/epics/EP-001-task-management/features/FT-001-task-priority/index.md']
related_specs: ['.memory-bank/spec/product/index.md']
related_adrs: []
related_scenarios: ['.memory-bank/scenarios/SCN-002-workspace-task-core.md']
tags: [protocol]
---

# PRT-007-task-priority — Task priority

## Goal

Give every task a required Low, Medium or High priority and show that human-readable label on the project task list.

## Delivery role

Delivers the request end to end.

## Scope

### In scope
- Required priority on the existing task entity with closed display labels Low, Medium and High
- Assign priority when creating a task in an active project and change it when editing that task
- Show the human-readable priority text on every project task list row
- Default Medium when create omits priority and for already persisted tasks
- Reject values outside the closed set with a public error and leave the stored task unchanged
- Keep archived-project task mutations rejected while the list remains readable, including priority text
- Keep owner and member workspace isolation and existing title and description behavior

### Out of scope
- Sorting, filtering, search, boards, drag-and-drop, status workflow, custom vocabularies, per-workspace labels, notifications, activity history, and bulk priority changes
- Changing who may mutate tasks, how project archive works, or non-member 404 behavior
- Cloning Linear issue states, cycles or command palette

## Primary acceptance

- Actor: workspace member
- Initial state: An active project in a workspace the actor belongs to; the project already has at least one persisted task that predates priority; the deterministic local/test world is reset and seeded.
- Action: Open the project task list; create a task choosing High; create another task without choosing priority; change the pre-existing task to Low; attempt an invalid priority; archive the project and attempt a priority change.
- Expected result: The list shows High, Medium and Low as readable text; invalid input is rejected without changing stored priority; the archived project remains readable and rejects the mutation.
- Verification: Extend the existing local SCN-002-style API and browser contour to prove list labels, create and edit, Medium defaults, invalid-value rejection, archived-project read-only, and non-member isolation.
- Proof limits: Proof is local/test exact checkout only. It does not prove sort, filter, board, status workflow, CI, preview or production.

## Owned requirements

- R-001: Every task has exactly one priority from the closed set whose human-readable labels are Low, Medium, and High.
- R-002: The project task list shows that human-readable priority text for every listed task; the actor must not have to infer priority from a machine token or from color alone.
- R-003: A workspace owner or member can assign priority when creating a task in an active project and can change it when editing that task.
- R-004: If the actor creates a task without choosing a priority, the task is stored as Medium. Existing persisted tasks that have no priority receive Medium.
- R-005: A priority outside the closed set is rejected with a public error; the stored task and the list text stay unchanged.
- R-006: Task mutations, including priority changes, remain rejected in an archived project. An authorized actor can still read the list and see each task's priority text.
- R-007: Owner/member workspace isolation, safe non-member 404 behavior, and existing title/description task behavior remain unchanged.

## Owned acceptance criteria

- AC-001: On an active project's task list, each row shows one of the labels Low, Medium, or High as readable text next to the task.
- AC-002: A workspace member creates a task with priority High and then sees High on that task's list row.
- AC-003: A workspace member creates a task without choosing a priority and then sees Medium on that task's list row.
- AC-004: A workspace member changes an existing task from Medium to Low and, after the change, the list row shows Low.
- AC-005: An attempt to assign a value that is not Low, Medium, or High is rejected with a public error, and the list still shows the previous valid label.
- AC-006: A previously persisted task that had no priority appears as Medium in the list after the change is in effect.
- AC-007: In an archived project the list still shows each task's priority text, and an attempt to change priority is rejected.
- AC-008: A non-member cannot observe another workspace's tasks or their priority text; protected routes continue to return a safe 404.

## Flow handoff

- Source RUN: RUN-001-task-priority
- Next action: PLAN

## Latest RUN state

- Source RUN: RUN-001-task-priority
- CODE-REVIEW complete; this RUN reached its configured terminal boundary.
