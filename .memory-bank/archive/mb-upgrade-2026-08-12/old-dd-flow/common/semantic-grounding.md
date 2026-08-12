---
file: '.memory-bank/dd-flow/common/semantic-grounding.md'
description: 'Compact semantic-spine contract that keeps meaningful SDLC work connected to user intent, system responsibility and correctly scoped evidence.'
purpose: 'Read when specifying, planning, implementing, verifying or merging non-trivial work so local tasks and green tests do not lose their product and architecture meaning.'
version: '0.1.0'
date: '2026-07-23'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/index.md'
related_files:
  - .memory-bank/dd-flow/common/goal-traceability.md
  - .memory-bank/dd-flow/common/specification.md
  - .memory-bank/mbb/c4-model.md
  - .memory-bank/mbb/code-contracts-guide.md
  - .memory-bank/mbb/verification-matrix-guide.md
tags: [dd-flow, semantic-grounding, traceability, c4, evidence]
---

# Semantic Grounding

## Purpose

`goal-traceability.md` connects the protocol goal to planning and closure. This contract supplies the compact task-level handoff that makes the connection usable by a worker or verifier without copying the whole Memory Bank into its context.

The semantic spine is selected context, not a second knowledge base. Product specs, system/C4 documents, ADRs, scenarios, policies and raw user intake remain authoritative.

## Meaning Chain

For meaningful work, preserve the relevant part of this chain:

```text
raw user intent
  -> product outcome and actor
  -> feature or capability
  -> system boundary and C4 responsibility
  -> component/module contract and invariants
  -> changed behaviour
  -> test, scenario or operational evidence
  -> merge verdict against the original goal
```

Cross-cutting ADR, engineering, security, operations and project-policy constraints are linked source documents. Do not restate them unless the task needs a short, concrete preservation rule.

## Semantic Spine Card

`specify` selects authoritative source layers. `plan` creates one compact card for every meaningful plan item or grouped task packet. The card may live in the plan report, protocol implementation plan or task packet, provided the worker and verifier can read it.

```yaml
semantic_spine:
  sources:
    user_intent: <raw intake/protocol link or not_applicable>
    product: <spec/feature/scenario link or not_applicable>
    system: <C4/component/ADR link or not_applicable>
    constraints: [<ADR/policy/engineering links>]
  user_outcome: <short observable outcome>
  feature_or_capability: <short name or not_applicable>
  system_boundary: <relevant C4 boundary or not_applicable>
  component_responsibility: <what the changed module owns>
  why_this_change: <why this task exists now>
  must_preserve: [<invariant or constraint>]
  non_goals: [<explicitly excluded responsibility>]
  acceptance_contribution:
    behaviour: <claim this task contributes to>
    evidence_level: local_contract | integration_handoff | user_scenario | evaluation | operational
    proof: <test/scenario/passport/check>
    does_not_prove: [<claims still requiring other evidence>]
```

Links plus concise task-specific statements are enough. Do not paste complete specifications, C4 trees or policy text into a card.

## Proportionality

A tiny local change may use `semantic_spine: not_applicable` only with a short reason showing why the existing goal/constraint matrix and local contract are sufficient. `not_applicable` is not permission to omit grounding from a meaningful change.

Do not require a C4 document for every file. When a change affects a system, container, component or module responsibility, name the relevant level and responsibility. When it does not, state why that boundary is unaffected.

## Evidence Rules

A proof must name the level it proves:

- `local_contract`: a unit/module contract or deterministic helper behaviour;
- `integration_handoff`: a boundary between components, stages or consumers;
- `user_scenario`: an observable actor outcome;
- `evaluation`: a quality or agent-behaviour assessment;
- `operational`: deployment, release, safety or runtime behaviour.

A green local-contract test cannot close a user-scenario, integration or operational claim by implication. Record the missing evidence, add it, narrow the claim, or create a precise blocking `DEF-*`.

## Stage Responsibilities

- `specify`: select source layers, record user outcome, constraints and accepted non-goals.
- `plan`: assign a semantic spine to meaningful plan items; reject orphan work and needless abstractions.
- worker packet: include only the selected card relevant to the task.
- `code` and `docs`: implement the declared responsibility and stop when a required source or boundary is missing.
- `verify` and `readiness`: review top-down from outcome to evidence and bottom-up from actual diff/tests to the claimed outcome; flag responsibility drift and evidence mismatch.
- `merge`: state whether the original goal was achieved and what each proof does not prove.

## Minimalism Is A Correctness Rule

An abstraction, entity, status, field, prompt block or widened module responsibility is a defect when it has no current consumer, lifecycle, required constraint or acceptance contribution. Prefer the smallest coherent change that satisfies the card. Record a concrete compatibility or safety reason for any deliberate extra complexity.
