---
file: '.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/08-misuse-cases.md'
description: 'Specify checklist for unauthorized, abusive or privacy-sensitive behavior.'
purpose: 'Make unsafe or unauthorized outcomes explicit while keeping security questions at the behavior and obligation level.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '../index.md'
tags: [requirements, security, misuse, abuse, specify]
---

# Misuse / Abuse Cases

## Purpose

Make unsafe or unauthorized outcomes explicit while keeping security questions
at the behavior and obligation level.

## Applicability signals

Use when the task changes permissions, trust boundaries, sensitive data,
external exposure, destructive actions or a behavior with obvious abuse value.

## Skip conditions

Skip when no authorization, privacy, safety or abuse consequence is affected.

## Light checklist

- name the protected actor/action/data and the unauthorized goal;
- state the rejection behavior and what is not disclosed;
- check privilege/role boundary and one audit/evidence expectation;
- identify a material misuse recovery or escalation path.

## Full checklist

- define authorized actors, intended use and protected assets in business terms;
- enumerate unauthorized access, privilege escalation, replay/duplicate,
  enumeration, disclosure and destructive misuse relevant to the task;
- state preconditions, observable rejection, safe error information and
  whether the attempt is recorded/notified;
- check least-privilege outcome, ownership/tenant boundary and external
  obligations;
- cover abuse during retry, recovery, bulk action and alternate paths;
- distinguish risk acceptance, manual review and explicit non-goals;
- map each material misuse to a requirement and verification scenario.

## Typical gap patterns

Authorization checked only on the happy path, forbidden action leaks whether a
record exists, admin assumption is unstated, replay repeats a destructive effect,
or “security” is listed without a rejection/monitoring outcome.

## What to record

Record `actor`, `intended_action`, `misuse_goal`, `protected_asset`,
`precondition`, `safe_rejection`, `disclosure_limit`, `audit/notification`,
`recovery/manual_gate` and linked gaps. Do not prescribe an auth library or
token schema.

## When a gap becomes a user question

Ask when risk tolerance, legal/privacy obligation, manual approval or acceptable
disclosure materially changes the requirement. Recommend the safer default and
state the cost/scope effect of alternatives.

## Stop conditions

Stop when material unauthorized paths, safe rejection, disclosure limits,
monitoring/manual gate and recovery are explicit.

## Small example

An “export records” feature needs a requirement for an unauthorized user,
cross-tenant identifier guessing and a failed export—not only a successful file.
