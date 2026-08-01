---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/security_privacy_review.md'
description: 'Aspect prompt for security and privacy review.'
purpose: 'Review auth, tenant isolation, secrets, permissions, PII and unsafe operations.'
version: '0.1.0'
date: '2026-07-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: vertical_slice
depends_on: [architecture_design_quality]
informs: [contract_propagation_design]
tags: [dd-flow, mb-sdlc, aspect, security, privacy]
---

# Aspect: security_privacy_review

Applies to authn/authz, tenant isolation, secrets, permissions, PII, unsafe operations or data visibility changes.

Grounding sources: security docs, auth code, policies, secret handling, data classification, logs/traces and abuse scenarios.

Plan review: check trust boundaries, roles, secrets, authorization checks, privacy surface and abuse cases.

Readiness review: verify actual implementation enforces boundaries and evidence covers security-sensitive paths.

Blocking findings: missing authorization, secret exposure, PII in logs/evidence, unsafe operation without guard.

Acceptable DEF: formal security review at later gate only if current gate does not expose the risky path.
