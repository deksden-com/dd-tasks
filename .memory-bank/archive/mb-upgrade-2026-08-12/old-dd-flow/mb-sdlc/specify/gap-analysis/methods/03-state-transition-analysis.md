---
file: '.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/03-state-transition-analysis.md'
description: 'Specify checklist for lifecycle states, guards and transitions.'
purpose: 'Find missing or illegal lifecycle transitions, terminal behavior and recovery semantics before planning implementation.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '../index.md'
tags: [requirements, state, lifecycle, workflow, specify]
---

# State Transition Analysis

## Purpose

Find missing or illegal lifecycle transitions, terminal behavior and recovery
semantics before planning implementation.

## Applicability signals

Use when the task mentions statuses, approval, review, retry, pause/resume,
cancel, activation, expiration, terminal states or lifecycle progression.

## Skip conditions

Skip when no stateful behavior is accepted and no existing lifecycle is being
extended.

## Light checklist

- list meaningful states, including initial and terminal states;
- name the actor/event that triggers each relevant transition;
- record guards and the observable result;
- record invalid-transition behavior and one recovery path.

## Full checklist

- define states by observable business meaning, not storage enum names;
- identify initial, active, paused, rejected, failed, expired and terminal
  states only when signaled;
- map each transition to actor/trigger, precondition/guard, accepted outcome,
  side effect visible to users, and evidence;
- check missing, duplicate, illegal, concurrent, retried and late transitions;
- define what happens after partial completion, dependency failure, timeout,
  cancellation and recovery;
- state whether terminal states are reversible and who can reopen them;
- check that every state can be reached and every material state has an exit or
  explicit terminal rationale;
- preserve compatibility rules for existing states; do not invent a new state
  for a planning convenience.

## Typical gap patterns

Status names without meaning, an approval path with no rejection state, retry
that creates a second accepted result, “failed” with no recovery, terminal
state that can be edited accidentally, or an invalid transition silently
ignored.

## What to record

Record `states`, `initial_state`, `terminal_states`, transition rows with
`from`, `trigger`, `actor`, `guard`, `to`, `result`, `error/recovery` and
`evidence`, plus linked gaps. Keep implementation status/enum names out unless
they are already the accepted external vocabulary.

## When a gap becomes a user question

Ask when reversal, rejection, retry, retention or terminal behavior changes the
accepted business outcome or risk. Offer a recommended lifecycle policy; never
ask the user to design a state machine representation.

## Stop conditions

Stop when all material states, legal transitions, invalid behavior and recovery
or terminal rules are explicit.

## Small example

An approval request needs more than `pending → approved`: it must define
rejection, withdrawal, duplicate approval and what happens when the approver
loses access while the request is pending.
