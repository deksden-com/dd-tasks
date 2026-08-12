---
file: '.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/05-example-mapping.md'
description: 'Specify checklist for turning rules into concrete acceptance examples.'
purpose: 'Expose ambiguity through a small set of rules, examples and questions rather than asking for implementation details.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '../index.md'
tags: [requirements, examples, acceptance, specify]
---

# Example Mapping / Specification by Example

## Purpose

Turn material rules into concrete examples and counterexamples so acceptance
boundaries are visible before planning implementation.

## Applicability signals

Use when a rule, acceptance claim, boundary, exception or user-visible behavior
would be clearer with concrete examples.

## Skip conditions

Skip when the behavior is already unambiguous, fully covered by an existing
scenario and no boundary or exception is material.

## Light checklist

- state the rule in one sentence;
- provide one normal example and one counterexample;
- add a boundary or error example when relevant;
- record unanswered questions revealed by the examples.

## Full checklist

- separate rule, example, question and assumption;
- include happy, alternate, boundary, empty, duplicate and material error
  examples as applicable;
- vary one condition at a time so the rule is testable;
- identify examples that contradict an existing rule or analogy;
- state the expected observable result and evidence for each example;
- convert recurring examples into acceptance criteria or scenario seeds;
- keep examples in domain language, not test fixture implementation language.

## Typical gap patterns

Rule and example disagree, only positive examples exist, boundary values are
missing, an error example has no expected user-visible result, or a sample is
mistaken for a complete requirement.

## What to record

Record `rules`, `examples`, `questions`, `assumptions`, expected outcomes and
links to `REQ-*`, `GAP-*` and scenario ids. Mark examples as illustrative or
normative.

## When a gap becomes a user question

Ask when competing examples imply different accepted business outcomes and no
fact or safe default resolves them. Recommend the smallest coherent rule set;
do not ask how examples should be encoded.

## Stop conditions

Stop when each material rule has a normal example, a counterexample and any
needed boundary/error example, with no unresolved acceptance ambiguity.

## Small example

“A duplicate submission is harmless” needs examples for first submission,
same submission repeated and changed submission—not a storage-key proposal.
