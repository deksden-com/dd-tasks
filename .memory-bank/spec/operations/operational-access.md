---
file: '.memory-bank/spec/operations/operational-access.md'
description: 'Operational access policy for local source proof and policy-controlled Exe.dev preview.'
purpose: 'Separates local CODE authority from fresh provider identity, team, target and sharing gates.'
version: '0.2.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/operations/index.md'
related_specs:
  - .memory-bank/spec/operations/deploy-policy.md
  - .memory-bank/spec/operations/secrets-policy.md
related_runbooks:
  - .memory-bank/spec/operations/runbooks/exe-dev-preview.md
related_protocols:
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/index.md
tags: [dd-tasks, operations, access, private, exe-dev]
---

# Operational access

## CODE boundary

Source CODE and readiness need only the existing exact feature worktree, local
Docker/Compose, loopback local/test PostgreSQL and the committed deterministic
fixture adapter. They do not log in to Exe.dev, create a VM, select a team,
grant a share, publish an image or change remote Git state. This protocol has
no provider identity/team/VM fact to persist.

## Future deploy gate

The separately authorized Exe.dev operation starts with a read-only preflight
for exactly one run/request id. It must return an explicit `verified`,
`mismatch`, `not_observable` or `not_required` state for:

- authenticated identity and authority to operate the selected account/team;
- exact target ownership or an explicitly approved create operation;
- source transport capability and current CLI/documentation contract;
- requested private/public proxy/share state, external port and reviewer access;
- approval, quota and capacity needed for the bounded one-VM contour.

`mismatch` and `not_observable` block protected mutation. Login, token refresh,
context/team switching, inferred targets and blind retry are forbidden. A
public share is allowed only when the handoff explicitly requests
`public+closed`; `public+open` and any public-share fallback are forbidden. A
timeout or ambiguous provider response requires exact target readback before
any retry. A share is never considered private or public because a prior run
used that state.

Provider observations are bound to the operation id, exact target, artifact,
profile and timestamp. They expire on context, target, artifact or access
change and are not reused as current deploy authority.

## Runtime actor access

Source SCN-003 uses the existing local demo fixture adapter. A later live
preview uses operation-scoped named secret inputs and separate actor handles;
it never accepts the committed `local-demo-only` password as proof of hosted
access. Durable evidence keeps only role labels, opaque binding handles and
issuance/revocation outcomes. It never records credential values, hashes,
cookies, session tokens, email values or raw authenticated payloads.
