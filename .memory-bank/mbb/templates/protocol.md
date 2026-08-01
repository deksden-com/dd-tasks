---
file: 'memory-bank/protocol/PRT-XXX-<slug>.md'
description: '<Integrating protocol for a cross-feature implementation, remediation, migration, or acceptance wave.>'
purpose: '<Read to understand how this wave is planned, executed, verified, closed, and promoted into durable Memory Bank docs.>'
version: '0.5.0'
date: 'YYYY-MM-DD'
status: 'DRAFT'
c4_level: 'documentation'
parent: 'memory-bank/protocol/index.md'
protocol_set: null
blocked_by_protocols: []
related_epics: []
related_features: []
related_specs:
  - memory-bank/spec/engineering/coding-standards.md
  - memory-bank/spec/operations/release-policy.md
related_adrs: []
related_scenarios: []
source_user_input: []
continuation_prompt: protocol-implement.md
implements_scope: '<Narrow executable scope for this SDLC cycle.>'
related_files:
  - memory-bank/spec/engineering/coding-standards.md
  - memory-bank/spec/operations/release-policy.md
  - memory-bank/plans/verification-matrix.md
tags: [protocol, evidence, implementation, closure]
history:
  - version: '0.3.0'
    date: 'YYYY-MM-DD'
    changes: 'Added Prime/preflight, normative design companion, implementation packet graph, and machine-readable proof references.'
  - version: '0.4.0'
    date: 'YYYY-MM-DD'
    changes: 'Added source-only inputs, compatibility ledger, and rollout evidence prompts.'
  - version: '0.5.0'
    date: 'YYYY-MM-DD'
    changes: 'Added Git route, protocol location, feature worktree, and workspace bootstrap fields.'
---

# <Protocol Title>

> Протокол - временный интегратор волны работ. Он может держать план, отчеты, проверки и решения во время реализации, но долговечные знания после закрытия должны быть подняты в `spec/`, `adr/`, `scenarios/`, `ui/`, `guides/` или `operations`.

## Context

<Why this run/work happened.>

## Historical Inputs / Source-Only Material

- Source repositories/docs:
- `source_only` materials:
- What must be rewritten before becoming current truth:
- What is excluded from current ownership:

## Goal And Scope

- Goal:
- In scope:
- Out of scope:

## Required Grounding

- Product specs:
- System specs:
- Engineering standards:
- Operations/release docs:
- ADRs:
- Features/epics:
- Scenarios:
- Source user input:

## Protocol Set / Dependencies

- Protocol set:
- Blocked by protocols:
- Downstream protocols:
- Can start now:
- Force-start policy:

## Normative Design Companion

- Companion spec:
- Why protocol alone is not enough:
- Durable docs to update after closeout:

## Open Questions / Required Research

- <Question or `none`>

## Prime / Operational Preflight

- Branch:
- Base commit SHA:
- Worktree state:
- Git route:
- Integration branch:
- Feature branch:
- Worktree path:
- Protocol location:
- Workspace bootstrap:
  - secrets:
  - dependencies:
  - commands:
  - blockers:
- Existing pull request:
- Closed gates:
- Gates opened by this protocol:
- External providers / migrations / deploy risk:
- Existing unrelated local changes:

## Implementation Plan

- <Phase or task>

## Implementation Packet Graph

- `Prime`:
- `P0`:
- `P1`:
- `P2`:
- Parallel packets:
- Sequential barriers:
- Local gate:
- Hosted/beta gate:

## Task Packets

- Worker tasks:
- Verifier tasks:
- Disjoint write scopes:
- Forbidden scopes:
- Semantic spine for each meaningful packet (or explicit `not_applicable` reason):
  - user outcome and authoritative sources:
  - system/C4 or component responsibility:
  - must preserve and non-goals:
  - acceptance contribution, evidence level and what the proof does not prove:

## Execution Trace

- <Step/report>: <what happened and what changed>

## Evidence

- <artifact/test/report/proof_id>: <what it proves and which evidence contour it belongs to>

## Machine-Readable Proofs

- `proof_id`:
- latest artifact path:
- scenario ids:
- evidence contour:
- provider calls expected/actual:
- verdict:
- what this proof does not prove:

## Decisions And Deviations

- <Decision made during execution>

## Named Deferrals

- `DEF-<AREA>-<SLUG>`:
  - type:
  - severity:
  - reason:
  - owner:
  - origin:
    - protocol:
    - phase:
    - task:
    - files:
  - context_for_followup:
    - summary:
    - why_deferred:
    - already_done:
    - already_checked:
    - required_docs:
    - required_code_paths:
    - relevant_commands:
    - evidence_so_far:
  - user_blocker:
    - required:
    - question:
    - options:
    - recommendation:
  - fixability:
    - can_attempt_now:
    - expected_effort:
    - requires_followup_protocol:
  - does not block:
  - blocks:
  - next gate:

## Compatibility-Only Ledger

- legacy id/name:
  - type:
  - owner:
  - target replacement:
  - reason retained:
  - allowed use:
  - retirement milestone:
  - evidence new work uses target path:

## Documentation Promotion

- ADR updates:
- Product specs:
- System specs:
- Engineering specs:
- Operations specs:
- Scenario docs:
- UI docs/contracts:
- User guides:

## Operational Gates

- Branch:
- Pull request:
- Local checks:
- CI:
- Beta deploy:
- Beta scenarios:
- Rollout evidence bundle:
- Rollback handoff:
- Production:
- Rollback/roll-forward:

## Closure

- Result:
- Closure state:
- Follow-up:
- Evidence summary:
