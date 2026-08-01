---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/api_contract_design_review.md'
description: 'Aspect prompt for API/CLI/SDK contract design review.'
purpose: 'Review request/response/error/auth/idempotency/versioning contracts and consumers.'
version: '0.1.0'
date: '2026-07-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: program
depends_on: [contract_propagation_design]
informs: [architecture_design_quality]
tags: [dd-flow, mb-sdlc, aspect, api, contract]
---

# Aspect: api_contract_design_review

Applies to HTTP/RPC/SDK/CLI/API requests, responses, schemas, errors, auth, pagination, idempotency, rate limits or webhooks.

Grounding sources: API specs, schemas, CLI help, SDK docs, examples, tests, scenarios and consumers.

Plan review: list changed operations, compatibility, auth, errors, idempotency/rate limits and examples.

Readiness review: inspect actual code/docs/tests for contract propagation and at least one relevant error/compatibility path.

Blocking findings: undocumented public contract change, consumer not updated, error/auth/idempotency behavior undefined.

Acceptable DEF: downstream consumer update outside current repo with owner and next gate.
