---
file: '.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/07-event-storming-light.md'
description: 'Specify checklist for eventful, asynchronous or integrated workflows.'
purpose: 'Find missing triggers, consumers, ordering, duplicate/retry and failure semantics without designing a message architecture.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '../index.md'
tags: [requirements, events, async, integrations, specify]
---

# Event Storming Light

## Purpose

Find missing triggers, consumers, ordering, duplicate/retry and failure
semantics without designing a message architecture.

## Applicability signals

Use when the task mentions events, commands, queues, background work, webhooks,
external integrations, eventual consistency, notifications or asynchronous
completion.

## Skip conditions

Skip for synchronous local behavior with no external side effect, event
contract or delayed completion.

## Light checklist

- identify the trigger/command and observable completion event;
- name relevant actors, external parties and consumers;
- state ordering, duplicate/retry and failure behavior;
- state what the user sees before and after completion.

## Full checklist

- map trigger, command, accepted fact/event and actor/consumer in business terms;
- identify external boundaries, ownership and delivery assumptions;
- define ordering, causality, duplicate, replay, retry, timeout and idempotency
  expectations;
- cover partial completion, unavailable consumer/provider, dead-letter/manual
  recovery and eventual consistency visibility;
- define completion, cancellation and terminal failure evidence;
- distinguish normative behavior from implementation transport choices;
- ensure every externally visible event has an acceptance consumer or explicit
  non-goal.

## Typical gap patterns

“It runs in the background” with no completion signal, duplicate webhook
effects, retry that violates business idempotency, user sees stale state with no
expectation, or a provider failure with no recovery owner.

## What to record

Record a compact trigger/command/fact/consumer table, ordering and retry rules,
observable intermediate/final states, recovery owner and linked gaps.

## When a gap becomes a user question

Ask when delivery guarantees, duplicate effects, manual recovery, completion
visibility or external obligations change accepted risk. Offer a recommended
business outcome; do not ask the user to choose a queue, broker or scheduler.

## Stop conditions

Stop when trigger, completion, consumer, ordering, duplicate/retry/failure and
observable consistency behavior are explicit.

## Small example

“Send notification after approval” needs a rule for approval success when the
notification provider is down and for a retried approval event.
