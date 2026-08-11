---
file: '.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/01-use-case-analysis.md'
description: 'Specify checklist for actor goals and observable interaction flows.'
purpose: 'Find missing preconditions, main behavior, material alternate/error paths and observable outcomes without designing the implementation.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '../index.md'
tags: [requirements, use-case, scenarios, specify]
---

# Use Case Analysis

## Purpose

Find missing preconditions, main behavior, material alternate/error paths and
observable outcomes without designing the implementation.

## Applicability signals

Use when a user, operator or external system has a goal, interacts with the
system, or follows a multi-step workflow.

## Skip conditions

Skip when the change is a purely editorial/internal rule with no actor-visible
behavior and the baseline scan already proves acceptance.

## Light checklist

- name the primary actor and goal;
- state the trigger and relevant precondition;
- outline the main path in observable steps;
- record one material alternate or error path, if one exists;
- state the observable success result.

## Full checklist

- identify actor, affected parties and actor authority at a problem-space level;
- state trigger, preconditions, inputs/needed context and success postcondition;
- write the main path as actor-visible steps, not implementation calls;
- enumerate material branches: rejection, empty state, duplicate action,
  unavailable dependency, timeout, retry, cancellation and recovery when
  relevant;
- distinguish alternate successful outcomes from failed outcomes;
- state what the actor can observe and what evidence proves completion;
- check whether repeating the action changes the accepted result;
- connect every material branch to a requirement or explicit non-goal.

## Typical gap patterns

Missing actor authority, an unstated precondition, a happy path with no result,
an error that has no expected state, duplicate/retry behavior, or a branch that
changes scope but is treated as an implementation detail.

## What to record

Record `actors`, `trigger`, `preconditions`, `main_path`,
`alternate_paths`, `error_paths`, `postconditions`, `observables` and linked
`GAP-*`/`REQ-*` ids in the shared ledger.

## When a gap becomes a user question

Ask only when two materially different actor outcomes, scopes, permissions or
risk tolerances remain and project facts/analogy cannot choose between them.
Offer options and recommend one; do not ask how the agent should implement the
flow.

## Stop conditions

Stop when the actor goal, precondition, observable main result and all material
alternate/error branches are recorded or explicitly excluded.

## Small example

“Operator requests an export” is incomplete until accepted scope says what
happens for an empty result, unauthorized operator, duplicate request and
provider failure.
