---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/contract_propagation_design.md'
description: 'Aspect prompt for cross-surface contract propagation.'
purpose: 'Ensure public and cross-module contract changes propagate to code, docs, tests and consumers.'
version: '0.1.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: program
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, contract-propagation]
---

# Aspect: contract_propagation_design

Applies to public or cross-module contract changes: schemas, statuses, CLI/TUI/GUI/MCP/SDK, events, fixtures or scenario contracts.

Grounding sources: source contract owner, schemas/types, docs, examples, tests, scenarios, fixtures, dashboards, CLI help and downstream consumers.

Plan review: build a propagation matrix across code, tests, docs, Memory Bank and consumers.

Readiness review: verify each changed contract is updated, not applicable or deferred as precise DEF.

Blocking findings: public contract changed in only one surface, status vocabulary split, generated/derived copy unsynchronized.

Acceptable DEF: downstream system outside current scope with compatibility risk stated.
