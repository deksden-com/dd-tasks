---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/memorybank_documentation_review.md'
description: 'Aspect prompt for Memory Bank documentation review.'
purpose: 'Verify durable knowledge is placed in the right Memory Bank layer with indexes and cross-links.'
version: '0.1.0'
date: '2026-07-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: vertical_slice
depends_on: [goal_traceability]
informs: [contract_propagation_design]
tags: [dd-flow, mb-sdlc, aspect, memorybank, docs]
---

# Aspect: memorybank_documentation_review

Applies to durable knowledge, policy, contract, scenario, runbook or prompt behavior changes.

Grounding sources: `.memory-bank/index.md`, `structure.md`, MBB guides, changed docs, frontmatter, indexes and related protocol/spec/ADR/feature/scenario links.

Plan review: decide the owning layer and required cross-links before implementation.

Readiness review: check durable docs, frontmatter, index entries and changelog are updated or not-applicable reason is explicit.

Blocking findings: active docs depend on `.tasks`, missing owning layer, missing required cross-link, stale index.

Acceptable DEF: missing fact that cannot be recovered now and is recorded in canonical DEF storage.
