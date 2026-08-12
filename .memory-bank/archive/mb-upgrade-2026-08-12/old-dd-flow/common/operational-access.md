---
file: '.memory-bank/dd-flow/common/operational-access.md'
description: 'Shared fail-closed operational-access preflight for externally mutating flows.'
purpose: 'Resolve one exact identity-target binding, perform safe readback and require fresh identity, authority, target and approval verdicts before mutation.'
version: '0.1.0'
date: '2026-07-10'
status: 'ACTIVE'
c4_level: 'flow-common'
parent: '.memory-bank/dd-flow/index.md'
related_files:
  - .memory-bank/dd-flow/common/git-ops.md
  - .memory-bank/dd-flow/common/delivery-flows.md
  - .memory-bank/dd-flow/schemas/operational-access-preflight.schema.json
  - .memory-bank/mbb/operations-release-guide.md
tags: [dd-flow, operations, access, authorization, preflight]
history:
  - version: '0.1.0'
    date: '2026-07-10'
    changes: 'Added exact binding resolution, safe readback, freshness and fail-closed authorization rules for protected mutations.'
---

# Operational Access Preflight

This contract applies before an operation mutates an external provider, hosted target, registry, remote Git authority, cloud account, cluster, data service or other protected system. It is separate from workspace secret material and from approval to perform the operation.

## Owning Flow

The owning Git, release, deploy, publish or operations flow controls retry, mutation and terminal status. A runtime-preflight worker may observe and report, but it never logs in, refreshes authentication, switches account/team/project/context, grants authority, changes targets or performs the protected mutation.

## Exact Resolution

Resolve the requested operation against project-owned operational-access policy. One rule must match the exact tuple:

```text
profile + subject/entity + provider target + stage/environment + operation
```

Runtime resolution must return exactly one rule. Zero, duplicate, ambiguous or conflicting matches block. Authoring arrays are acceptable only when their expansion is explicit and cannot grant a Cartesian product.

## Safe Readback

Use only the readback procedure referenced by the resolved rule. It must define stable procedure id, provider/host, one exact argv or ordered exact `procedure_steps` in an explicitly bounded procedure, permitted environment variable names, noninteractive mode, timeout, read-only classification, structured extractor, redaction rules and value-free persistence. Multiple steps are data, not shell chaining.

Free-form shell synthesis, secret values, raw authenticated output and value-derived hashes are forbidden. If readback safety cannot be established, block. Missing authorization remains `authorization_required`; do not run login, refresh or context-switch commands.

## Verdicts

Compare expected project policy with safely observed public context for all dimensions:

- identity: `verified`, `mismatch` or `not_observable`;
- authority: `verified`, `mismatch`, `not_observable` or policy-backed `not_required`;
- target: `verified`, `mismatch` or `not_observable`;
- approval: `verified`, `missing`, `stale`, `revoked`, `scope_mismatch` or policy-backed `not_required`.

Credential presence or successful identity readback does not prove authority. Approval, when required, must be scoped to the approver, binding/rule, operation, target, stage, artifact/change when applicable, run/request, decision source, timestamp, expiry and revocation state.

`authorized` is valid only for one exact rule, verified safe readback, verified identity and target, verified or explicitly not-required authority and approval, fresh observation, no blockers and no authentication/context-switch/mutation actions. Every other state blocks before mutation and names a next action. An operation may be `not_required` only from an explicit project-policy source.

## Freshness

Bind the result to profile, binding rule, operation, subject, provider/host, target, stage, run/request and observation time. Consume it immediately before mutation. Expiry, material delay, process boundary, session/context change or target change invalidates the result and requires a new readback.

## Report Contract

Record `operational_access` using `dd-flow/operational-access-preflight@1`. Evidence is value-free: stable public organization/team/project/target ids and policy/evidence paths only. Reports never persist credentials, tokens, raw authenticated output, private identity data unless project policy explicitly requires a public identity, or secret-derived fingerprints.
