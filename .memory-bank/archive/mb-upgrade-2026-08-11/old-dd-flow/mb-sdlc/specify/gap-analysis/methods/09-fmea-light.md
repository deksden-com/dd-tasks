---
file: '.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/09-fmea-light.md'
description: 'Specify checklist for consequence-heavy or irreversible failure modes.'
purpose: 'Prioritize prevention, detection and recovery requirements for costly or irreversible failure without creating a full reliability program.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '../index.md'
tags: [requirements, fmea, risk, failure, specify]
---

# FMEA Light

## Purpose

Prioritize prevention, detection and recovery requirements for costly or
irreversible failure without creating a full reliability program.

## Applicability signals

Use when the task can cause irreversible data effects, high-consequence
operations, costly failures, safety/operational hazards or difficult recovery.

## Skip conditions

Skip for reversible, low-impact documentation or local behavior where ordinary
error-path coverage is sufficient.

## Light checklist

- name the action/failure mode and its consequence;
- state prevention and detection expectations;
- state recovery/rollback or manual gate;
- record residual risk and evidence needed.

## Full checklist

- enumerate credible failure modes across trigger, validation, execution,
  dependency, partial completion, retry and recovery;
- record effect, affected actor/data/operation and consequence severity in
  qualitative terms;
- identify prevention, detection signal, owner, response and recovery;
- cover wrong input, duplicate, timeout, unavailable dependency, partial
  success, stale state, operator error and rollback failure when relevant;
- define acceptance thresholds, manual approval, backup/retention or rollback
  obligations at problem-space level;
- state residual risk and explicit non-goals; do not invent numeric precision
  without project evidence.

## Typical gap patterns

Destructive action has no confirmation/recovery, partial success is reported as
success, detection exists but no owner responds, retry worsens impact, or a
rollback claim has no accepted boundary.

## What to record

Record rows with `failure_mode`, `effect`, `impact`, `prevention`, `detection`,
`response`, `recovery/manual_gate`, `residual_risk`, `evidence` and linked
gaps. Keep severity qualitative unless policy defines a scale.

## When a gap becomes a user question

Ask when risk tolerance, irreversible scope, manual approval, retention or
rollback obligation changes accepted behavior. Recommend the safest feasible
option and state its cost or scope impact; do not ask how to implement backup or
retry mechanics.

## Stop conditions

Stop when every credible material failure has prevention/detection/recovery or
an explicit accepted deferral and the residual risk is visible.

## Small example

For “delete customer data,” the failure analysis includes wrong target,
partial deletion, retry, audit evidence and inability to restore—not just the
successful delete path.
