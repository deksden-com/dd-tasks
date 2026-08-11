---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/external_integration_review.md'
description: 'Aspect prompt for external integration review.'
purpose: 'Review third-party provider contracts, quotas, auth, environments, fallback and errors.'
version: '0.1.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: program
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, external-integration]
---

# Aspect: external_integration_review

Applies to third-party providers, webhooks, remote APIs, quotas, sandbox/prod split or provider availability changes.

Grounding sources: provider docs/runbooks, env config, secrets policy, error handling, quotas, tests and fallback behavior.

Plan review: check provider contract, quotas, auth, sandbox/prod separation, fallback and error taxonomy.

Readiness review: verify provider errors, retries/backoff, fallback and evidence are implemented or deferred honestly.

Blocking findings: production/sandbox confusion, missing auth/secret handling, no provider error path, quota risk ignored.

Acceptable DEF: live provider verification deferred to staging with safe local/mock proof.
