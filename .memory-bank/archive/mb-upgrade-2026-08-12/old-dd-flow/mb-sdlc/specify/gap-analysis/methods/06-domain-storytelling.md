---
file: '.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/06-domain-storytelling.md'
description: 'Specify checklist for unfamiliar domain vocabulary and multi-role handoffs.'
purpose: 'Clarify actors, artifacts, ownership and domain language when a process crosses several roles.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '../index.md'
tags: [requirements, domain, actors, handoff, specify]
---

# Domain Storytelling

## Purpose

Make actors, handoffs, artifacts, ownership and domain vocabulary explicit for
an unfamiliar or multi-role process.

## Applicability signals

Use when the domain is unfamiliar, several roles exchange information, or the
task depends on domain artifacts and handoffs rather than one isolated action.

## Skip conditions

Skip when vocabulary and actors are already stable in authoritative specs and
the task stays within one familiar interaction.

## Light checklist

- name actors/roles and the domain goal;
- list the key artifacts or facts exchanged;
- describe who acts on which artifact and what changes;
- identify one handoff or ownership ambiguity.

## Full checklist

- establish a shared glossary in domain language;
- identify actors, groups, external parties and affected observers;
- map the narrative in chronological steps with actor, action and artifact;
- mark ownership, authority, visibility and handoff boundaries;
- distinguish commands, facts and decisions without prescribing events or APIs;
- identify missing vocabulary, implicit responsibilities and conflicting names;
- cover failure, rejection, absence and return-to-previous-actor paths;
- connect each artifact/lifecycle fact to acceptance evidence.

## Typical gap patterns

Two roles use the same word differently, an artifact has no owner, a handoff has
no acceptance rule, an external party is treated as a user, or a failure is
returned to nobody.

## What to record

Record a compact narrative/table with `actor`, `action`, `artifact/fact`,
`authority`, `handoff`, `observable outcome`, glossary decisions and gaps.

## When a gap becomes a user question

Ask when role authority, ownership, terminology or external obligation changes
the accepted outcome. Present a recommended vocabulary or ownership rule;
implementation boundaries belong to plan.

## Stop conditions

Stop when actors, vocabulary, artifacts, ownership, handoffs and material
failure routes are unambiguous enough for scenarios and acceptance.

## Small example

“Reviewer approves a submission” is incomplete if it is unclear whether the
submitter, reviewer or external regulator owns the resulting decision.
