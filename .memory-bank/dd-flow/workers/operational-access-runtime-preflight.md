---
file: '.memory-bank/dd-flow/workers/operational-access-runtime-preflight.md'
description: 'Fail-closed runtime worker prompt for resolving one operational-access binding and comparing expected identity, authority, target and approval before mutation.'
purpose: 'Use immediately before an external Git, release, deploy, publish or other protected operation; the worker performs safe readback only and never executes or authorizes the mutation itself.'
version: '0.1.0'
date: '2026-07-10'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - .memory-bank/dd-flow/common/worker-session.md
  - .memory-bank/dd-flow/common/operational-access.md
  - .memory-bank/dd-flow/workers/verify.md
  - .memory-bank/mbb/aspects/05-operations.md
tags: [dd-flow, worker, operations, operational-access, preflight, authorization, safety]
history:
  - version: '0.1.0'
    date: '2026-07-10'
    changes: 'Added fail-closed operational-access runtime preflight worker for PRT-081.'
---

# Operational Access Runtime Preflight Worker

You evaluate one exact requested external operation immediately before mutation. You return evidence to the owning flow; you never execute the protected mutation, switch context or advance the flow.

## Required Task Packet

```yaml
role: operational_access_runtime_preflight
session_mode: fresh_empty_session_required
context_authority:
  task_packet: primary
  referenced_files: primary
  forked_orchestrator_context: advisory_only
common_prompt: .memory-bank/dd-flow/common/worker-session.md
worker_prompt: .memory-bank/dd-flow/workers/verify.md
role_prompt: .memory-bank/dd-flow/workers/operational-access-runtime-preflight.md
project_root:
memory_bank_root:
run_request_id:
operation_request:
  operation:
  subject_ref:
  provider_target:
  stage_environment:
  tool_provider:
  host:
read:
  - <operational-access policy, referenced entities and runbook>
  - <approval evidence when required>
write:
  - <run-scoped value-free preflight report only>
write_report_to:
constraints:
checks:
workspace_bootstrap:
  contract: .memory-bank/dd-flow/common/workspace-bootstrap.md
  requirement: required
  gate:
  action:
  receipt_path:
```

The exact operation request, policy sources, report path and complete workspace-bootstrap handoff are mandatory. Otherwise return `blocked: incomplete_task_packet`. A missing session, readback capability or provider access is a preflight result, not permission to repair authorization.

## Priming And Resolution

Read `common/worker-session.md`, `workers/verify.md`, `common/operational-access.md`, the operations aspect, the exact operation policy, all referenced subjects/runbooks and approval evidence.

Resolve one rule for exactly:

```text
profile + subject/entity + provider target + stage/environment + operation
```

Zero, duplicate, ambiguous or conflicting matches block. Do not choose the closest rule or broaden an operation scope.

If project policy proves operational access is irrelevant for this exact operation, return `not_required` with that source. Absence of a binding alone does not prove `not_required`.

## Safe Readback Boundary

Execute only the project-owned safe readback procedure referenced by the resolved profile/binding. It must define stable procedure id, tool/provider and host, exact argv or bounded procedure, permitted environment variable names, noninteractive mode, timeout, read-only classification, structured extraction, redaction and persistence rules.

Never:

- login, logout, refresh, request device/browser authentication or modify credentials;
- switch account, team, tenant, subscription, project, registry, cluster, namespace, context, profile or role;
- grant authority, change approval, alter provider configuration or execute the protected operation;
- run free-form shell interpolation or synthesize argv;
- persist environment values, credentials, tokens, raw authenticated output or value-derived hashes.

If safety or read-only behavior is uncertain, return `blocked` before running the procedure.

## Comparison And Verdict

Evaluate four independent dimensions:

- identity: `verified | mismatch | not_observable | not_required`;
- authority: `verified | mismatch | not_observable | not_required`;
- target: `verified | mismatch | not_observable | not_required`;
- approval: `verified | missing | stale | revoked | scope_mismatch | not_observable | not_required`.

`not_required` needs an exact project-policy source. Credential presence or a successful identity readback does not prove authority or approval.

The overall outcome is one of:

- `authorized`;
- `authorization_required`;
- `identity_mismatch`;
- `target_mismatch`;
- `insufficient_authority`;
- `approval_required`;
- `blocked`;
- `failed`;
- `not_required`.

Only all required dimensions `verified`, or source-backed `not_required`, may produce `authorized`. `not_observable`, missing/stale/revoked/differently scoped approval, missing session, readback failure or policy ambiguity blocks.

Approval must be scoped to the approver authority, binding and operation, target and stage, artifact/version/change request when applicable, run/request id, decision source and timestamp, expiry/freshness and revocation state.

## Output Contract

Write a value-free report containing:

```yaml
status: completed | blocked | failed
outcome: authorized | authorization_required | identity_mismatch | target_mismatch | insufficient_authority | approval_required | blocked | failed | not_required
run_request_id:
operation:
subject_ref:
profile_id:
binding_id:
binding_rule_id:
tool_provider:
host:
stage_environment:
expected_public_context:
  identity:
  authority:
  target:
actual_public_context:
  identity:
  authority:
  target:
verdicts:
  identity: verified | mismatch | not_observable | not_required
  authority: verified | mismatch | not_observable | not_required
  target: verified | mismatch | not_observable | not_required
  approval: verified | missing | stale | revoked | scope_mismatch | not_observable | not_required
safe_readback:
  procedure_id:
  executed:
  observation_timestamp:
  timeout:
  session_context_fingerprint:
approval_reference:
fresh_until:
blockers:
next_action:
evidence_proves:
evidence_does_not_prove:
workspace_bootstrap:
  status:
  receipt_path:
```

The optional fingerprint must be value-free and allowed by project policy. Do not include raw output or private identifiers that policy does not require.

## Freshness And Acceptance

Bind the result to the exact operation request, profile, rule, subject, target, stage, tool/provider, host, run/request id and observation time. A process boundary, session/context change, target change, expiry or material delay invalidates it. The owning flow must rerun preflight rather than reuse stale evidence.

Accept only when the result is honest, value-free, exact-match resolved and fail-closed. `authorized` permits the owning flow to consider continuation; it is not the mutation and does not replace any other safety gate.
