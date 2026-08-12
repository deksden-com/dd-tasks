---
file: '.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/02-entity-operation-crud-plus.md'
description: 'Specify checklist for entity/resource lifecycle and relevant operations.'
purpose: 'Expose missing operation coverage for a named entity without blindly requiring every CRUD verb or asking for a technical data model.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '../index.md'
tags: [requirements, entity, crud, lifecycle, specify]
---

# CRUD+ / Entity–Operation Matrix

## Purpose

Expose missing operation coverage for a named entity without blindly requiring
every CRUD verb or asking for a technical data model.

## Applicability signals

Use when the task names an entity, resource, record, collection, account,
document or other object with ownership, permissions or lifecycle behavior.

## Skip conditions

Skip when no domain entity/resource is introduced or changed. Do not select the
method merely because the word “object” appears in an implementation detail.

## Light checklist

- name the entity and its business purpose;
- identify actors and ownership/visibility rules;
- select only operations signaled by the task: create, read, list/search,
  change, archive/delete, restore, export/import, bulk or link/unlink;
- for each selected operation state precondition, observable result and one
  material rejection/error;
- check whether the operation changes lifecycle or permissions.

## Full checklist

- define entity identity in business language and distinguish it from a
  technical table/document/class;
- build an operation matrix and mark `required`, `not_applicable` or
  `unknown`; explain every non-obvious choice;
- for each relevant operation record actor, purpose, allowed state, scope of
  visibility, accepted result, side effects visible to users and failure result;
- check create vs import, read vs list/search, update vs state transition,
  archive/delete vs restore, single vs bulk and link/unlink semantics where
  the task signals them;
- check ownership transfer, retention, uniqueness, duplicate requests and
  idempotency at the requirement level;
- record whether history/audit/notification is an accepted outcome or a
  non-goal;
- ensure every lifecycle operation has a recovery or terminal rule when the
  entity can become unavailable or retired.

## Typical gap patterns

“Add entity” with no actor or purpose, create without read/list visibility,
update with no allowed state, archive with no restore/retention rule, delete
that is actually archive, bulk behavior left implicit, or an operation whose
permission differs from the rest without a stated rule.

## What to record

Record an `entity_operation_matrix` with rows for relevant operations only:
`operation`, `actor`, `purpose`, `precondition`, `result`, `error/rejection`,
`visibility`, `lifecycle_effect`, `recovery`, `evidence` and linked gaps. Use
`not_applicable` with a reason rather than empty filler rows.

## When a gap becomes a user question

Ask when the choice changes business lifecycle, retention, ownership,
permission or externally visible data effect. Recommend a default based on a
strong project analogy. Do not ask the user to choose fields, tables, APIs or
identifiers.

## Stop conditions

Stop when every operation materially implied by the task has a requirement or
explicit non-goal, and cross-operation lifecycle/permission invariants are
clear.

## Small example

For a “restore report” task, the matrix may need `restore`, `read`, `list` and
the rejection for a permanently deleted report; it need not invent `export` or
`bulk restore` without a signal.
