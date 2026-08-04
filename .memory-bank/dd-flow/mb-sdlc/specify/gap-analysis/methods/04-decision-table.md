---
file: '.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/04-decision-table.md'
description: 'Specify checklist for combinations of conditions, roles and business rules.'
purpose: 'Make rule combinations, precedence and default outcomes explicit without forcing a technical rules engine design.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '../index.md'
tags: [requirements, decision-table, business-rules, specify]
---

# Decision Tables

## Purpose

Make rule combinations, precedence and default outcomes explicit without
forcing a technical rules-engine design.

## Applicability signals

Use when outcomes depend on combinations of roles, eligibility, status,
flags, thresholds, policy conditions or multiple business rules.

## Skip conditions

Skip when the rule is a single unconditional behavior already accepted by the
discussion and project sources.

## Light checklist

- name the decision and outcome options;
- list the conditions that can materially affect it;
- cover the normal, boundary and rejection combinations;
- record the default and precedence when rules overlap.

## Full checklist

- state each condition in problem-space language and its meaningful values;
- enumerate actor/role, lifecycle, eligibility, quantity/time and policy
  combinations that can change the outcome;
- cover positive, negative, boundary, missing/unknown and conflicting inputs;
- check mutually exclusive vs overlapping rules;
- define precedence, tie-breaking and default behavior;
- define the observable outcome for every material row, including rejection or
  manual review;
- identify combinations intentionally out of scope and why exhaustive
  enumeration is unnecessary;
- turn representative rows into examples or acceptance scenarios.

## Typical gap patterns

“If eligible” with no definition, two rules that both match, no default for
missing data, threshold boundary ambiguity, role precedence left implicit, or
an unhandled combination that is discovered only in an error path.

## What to record

Record `decision`, condition columns, outcome, precedence/default rule,
representative examples and linked gaps. Use a compact table; do not prescribe
code predicates or configuration syntax.

## When a gap becomes a user question

Ask when rule precedence, threshold boundary, eligibility or manual-vs-automatic
outcome changes business acceptance or external obligations. Give 2–3 options
and recommend one based on policy/project evidence.

## Stop conditions

Stop when all conditions that can change accepted behavior have representative
rows, including default, boundary and material rejection outcomes.

## Small example

For “can publish,” rows may combine role, approval state and content status;
“role is editor” alone is not a complete rule.
