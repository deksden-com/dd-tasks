---
file: '.memory-bank/spec/operations/operational-access-policy.md'
description: 'Project-owned policy for expected external tool identities, authority, provider targets and exact operation-scoped access bindings.'
purpose: 'Use before authenticated external mutations so the owning flow can resolve one expected context, compare it with safe actual readback and enforce separate scoped approval without storing credentials.'
version: '0.1.0'
date: 'YYYY-MM-DD'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/spec/operations/index.md'
related_files:
  - .memory-bank/project-policy.md
  - .memory-bank/spec/operations/secrets-policy.md
  - .memory-bank/spec/operations/runbooks/index.md
tags: [operations, authorization, identity, authority, targets, access-bindings, approval, evidence]
---

# Operational Access Policy

This file is the single project-owned source for expected authenticated external tool/provider contexts. It contains no credentials and does not approve an operation.

## Applicability And Separation

- Applicability: `applicable | not_applicable | unknown`
- Not-applicable reason:
- Policy owner:
- Review cadence or trigger:

Separate owners:

- secret/configuration material: `.memory-bank/spec/operations/secrets-policy.md`;
- external tool/provider authorization: this policy;
- approval for one protected mutation: the owning operation runbook or flow.

Rules:

- Credential availability or an authenticated session does not prove intended identity, authority, target or approval.
- Current login state is observed actual context, never the source of expected project policy.
- Do not store passwords, tokens, private keys, cookies, raw authenticated output or secret-derived hashes here.

## Access Profiles

Profiles own expected identity and authorization context once. Runbooks and entities reference profile/binding ids instead of copying these facts.

| Profile id | Tool/provider | Host | Expected public identity/organization/tenant | Authorization mode | Owner | Unavailable behavior |
| --- | --- | --- | --- | --- | --- | --- |
| `access-profile-...` | ... | ... | stable public id preferred | `external_session | device_browser_login | provider_managed_identity | other` | ... | block and name next action |

For each profile record:

- `profile_id`:
- `tool_provider`:
- `host`:
- `expected_public_identity`:
- `expected_organization_team_tenant`:
- `required_authority`:
- `authorization_mode`:
- `identity_readback_procedure_ref`:
- `authority_readback_procedure_ref`:
- `owner`:
- `renewal_or_login_owner`:
- `unavailable_behavior`:
- `source_evidence`:
- `last_confirmed_at`:

Use stable public provider ids over display names when available. Persist a username or email only when it is the required expected public identity and project policy explicitly accepts that privacy cost.

## Safe Readback Procedures

Every procedure used by runtime preflight must be demonstrably read-only.

| Procedure id | Tool/provider and host | Exact argv or bounded procedure | Extracted public fields | Timeout | Side effects |
| --- | --- | --- | --- | --- | --- |
| `access-readback-...` | ... | `[...]` | ... | ... | `read_only` |

For each procedure record:

- `procedure_id`:
- `tool_provider`:
- `host`:
- `argv`: exact argument array, or a link to an explicitly bounded project-owned procedure
- `procedure_steps`: when multiple read-only calls are required, list each exact argv as an ordered bounded step; never express the sequence through shell chaining
- `permitted_environment_variable_names`: names only, never values
- `noninteractive_mode`:
- `timeout_seconds`:
- `side_effect_classification`: `read_only`
- `structured_field_extractor`:
- `redaction_rules`:
- `persistence_rules`:
- `forbidden_actions`: login, refresh, account/team/project/registry/context switch, mutation

Shell interpolation and free-form command synthesis are forbidden for an approved exact-argv procedure. If read-only behavior cannot be established, preflight blocks.

## Access Bindings

Bindings connect one profile to existing project subjects/entities and exact provider operations. Add local `access_binding_refs` only to entity documents and runbooks that already exist; do not create new stage, dependency, registry or resource document types merely to hold references.

| Binding id | Profile ref | Subject refs | Rule ids | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| `access-binding-...` | `access-profile-...` | existing paths or stable entity ids | `access-rule-...` | ... | `confirmed | candidate | drifted | unknown | blocked | retired` |

Each rule resolves one exact tuple:

```text
profile + subject/entity + provider target + stage/environment + operation
```

For each binding rule:

- `rule_id`:
- `binding_id`:
- `profile_ref`:
- `subject_ref`: existing entity id/path or runbook path
- `provider_target`:
- `stage_environment`:
- `operation`: one exact protected operation name
- `target_readback_procedure_ref`:
- `required_authority`:
- `approval_requirement_ref`:
- `mismatch_behavior`: block without login, refresh or context switch
- `source_evidence`:

Resolution rules:

- runtime resolution must yield exactly one applicable rule;
- zero, duplicate, ambiguous or conflicting matches block;
- arrays may be used only as authoring shorthand when the explicit expanded rules are listed or deterministically obvious and cannot grant a Cartesian product;
- central bindings carry subject references for reverse impact review;
- local subjects carry only `access_binding_refs`, not duplicated identity/tenant facts.

## Authority Outcomes

Authority verdict is one of:

- `verified`;
- `mismatch`;
- `not_observable`;
- `not_required`.

`not_observable` blocks a protected mutation. `not_required` is allowed only when a project-policy source proves that authority is irrelevant for that exact operation. Credential presence, identity match or successful readback does not prove authority.

## Approval Requirements

Approval is evaluated after identity, authority and target and remains separate from authorization.

For each approval requirement:

- `approval_requirement_id`:
- `required`:
- `approver_identity_or_authority`:
- `binding_and_operation_scope`:
- `target_and_stage_scope`:
- `artifact_version_change_request_scope`:
- `run_request_id_scope`:
- `decision_source`:
- `timestamp_required`:
- `expires_after_or_at`:
- `revocation_check`:

Missing, stale, revoked or differently scoped approval blocks. A reusable broad approval is invalid unless project policy explicitly defines the bounded operations, targets, duration and revocation behavior it covers.

## Runtime Preflight And Freshness

The owning mutating flow resolves the binding and consumes a fresh preflight result immediately before the protected operation. The preflight worker performs only approved safe readback and never executes the mutation.

Bind every result to:

- profile, binding and exact rule ids;
- operation and subject;
- provider target and stage/environment;
- tool/provider and host;
- run/request id;
- observation timestamp and expiry/freshness;
- optional value-free session/context fingerprint only when this policy defines it as safe and public.

Invalidate preflight and read back again after a process boundary, session/context change, target change, expiry or material delay. Define project-specific freshness:

- Maximum age:
- Process-boundary rule:
- Session/context fingerprint rule:
- Target-change rule:
- Material-delay rule:

## Preflight Outcomes

The owning flow records one honest outcome:

- `authorized`;
- `authorization_required`;
- `identity_mismatch`;
- `target_mismatch`;
- `insufficient_authority`;
- `approval_required`;
- `blocked`;
- `failed`;
- `not_required`, with policy source.

`authorized` requires exactly one resolved rule, fresh identity/authority/target evidence and valid scoped approval when required. Missing or mismatched evidence never authorizes mutation.

## Value-Free Evidence

Persist only what later reviewers need:

- profile, binding, rule and procedure ids;
- expected and actual stable public identity/organization/tenant/target identifiers when policy requires them;
- separate identity, authority, target and approval verdicts;
- run/request id, observation timestamp, expiry/freshness and optional approved public fingerprint;
- blocker, next action and what the evidence does not prove.

Never persist credentials, secret values, raw authenticated output, value-derived hashes or unnecessary personal identifiers. Preserve historical operation evidence as a snapshot; later policy changes must not rewrite it.

## Missing, Mismatch And Escalation Behavior

- Missing session:
- Unknown expected identity or target:
- Identity mismatch:
- Authority mismatch or not observable:
- Target mismatch:
- Missing/stale/revoked approval:
- Safe readback unavailable:
- Renewal/login owner and handoff:
- Escalation owner/channel:

All protected cases fail closed. The agent must not silently login, refresh, switch account/team/project/registry/context, choose a similar target or weaken the approval scope.

## Reference And Coverage Review

Review must prove:

- profile and binding ids are unique and references resolve;
- every local `access_binding_refs` entry points to a binding that points back to that subject;
- every external mutating command is bound, explicitly not applicable with reason, or represented by an open question/BLOCK/gate-relevant DEF;
- every runtime request resolves exactly one rule;
- confirmed expected identities/targets remain source-backed and are not overwritten by observed current sessions;
- secrets, authorization and approval remain separate;
- evidence remains fresh, value-free and honest about what it does not prove.

## Known Gaps And Decisions

| Item | Status | Source evidence | Blocks | Next action/owner | DEF |
| --- | --- | --- | --- | --- | --- |
| ... | `candidate | unknown | drifted | blocked | not_applicable` | ... | ... | ... | ... |
