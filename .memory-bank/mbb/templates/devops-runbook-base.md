---
file: 'memory-bank/spec/operations/runbooks/<operation>-runbook.md'
description: '<Operator runbook for a repeatable DevOps operation.>'
purpose: '<Read before executing the operation so prerequisites, safety gates, evidence, rollback, and learning capture are explicit.>'
version: '0.3.0'
date: 'YYYY-MM-DD'
status: 'DRAFT'
c4_level: 'documentation'
parent: 'memory-bank/spec/operations/runbooks/index.md'
parent_template: '.memory-bank/mbb/templates/devops-runbook-base.md'
operation_type: '<workspace-bootstrap|release|deploy|publish|migration|rollback|backup-restore|other>'
applicability_status: 'unknown'
related_specs: []
related_adrs: []
related_scenarios: []
related_protocols: []
evidence_files: []
access_binding_refs: []
related_files:
  - memory-bank/spec/operations/operational-access-policy.md
  - memory-bank/spec/operations/secrets-policy.md
tags: [operations, runbook, authorization, access-bindings]
---

# <Operation> Runbook

> This is the base template for DevOps operator runbooks. Combine it with the operation-specific overlay that matches `operation_type`; keep only source-backed project facts, and write `not_applicable` only with a reason.

## Purpose And Scope

- Operation:
- Goal:
- In scope:
- Out of scope:
- Trigger:
- Expected result:

## Applicability

- Applicability status: `applicable | not_applicable | unknown`
- Applies when:
- Does not apply when:
- Not-applicable reason:
- Replacement runbook or policy:

## Ownership And Approval

- Owner:
- Executor:
- Required approver:
- Approval channel:
- Approval reference:
- Approval scope: binding, operation, target, stage, artifact/version/change request, run/request id
- Approval timestamp, expiry and revocation check:
- Emergency override:
- Communication channel:

## Affected Systems And Targets

- Repository/package/service:
- Runtime stages:
- Delivery targets:
- External providers:
- User/data impact:
- Time window:

## Prerequisites And Access

- Required branch/tag/version:
- Required local tools:
- Required environment:
- Required permissions:
- Required secrets:
- Secrets policy source:
- Secret handling rule:
- Operational-access policy source:
- Access binding refs:
- Exact protected operation names:
- Safe identity/authority/target readback procedure ids:
- Authorization unavailable or mismatch behavior:
- Known access blockers:

> Never write secret values or central identity/tenant/target facts into the runbook. Name the secret source, central binding ids, access owner and safe verification procedures instead. Secret material, external authorization and operation approval are separate gates.

## Data, Backup And Safety Posture

- Data impact: `none | read_only | write | destructive | unknown`
- Backup or snapshot required:
- Backup identifier/evidence:
- Restore test required:
- Migration compatibility:
- Known irreversible steps:
- Stop conditions:

> If data can be changed, destroyed, migrated, or made incompatible, the backup/restore posture must be explicit before execution.

## Preflight Checklist

- [ ] Worktree/branch state checked.
- [ ] Version/source artifact confirmed.
- [ ] Dependencies installed, or bootstrap inputs/install policy identified for a `workspace-bootstrap` operation.
- [ ] Access and secrets verified without exposing values.
- [ ] Every protected external mutation resolves exactly one access binding rule for profile, subject/entity, provider target, stage/environment and operation.
- [ ] Fresh read-only preflight confirms identity, authority and target without login, refresh or context switching.
- [ ] Data/backup posture accepted.
- [ ] Rollback or roll-forward path accepted.
- [ ] Required approval is recorded and scoped to this binding, operation, target, stage, artifact/change and run/request.
- [ ] Baseline checks completed.

Stop before mutation on zero/duplicate/ambiguous/conflicting binding matches, missing session, identity or target mismatch, authority `mismatch`/`not_observable`, missing/stale/revoked/differently scoped approval, or freshness/session/target drift.

## Execution Steps

1. <Step>

For each step, record:

- command/action:
- expected output or state:
- evidence to save:
- stop condition:
- rollback/repair hint:

## Verification And Readback

- Pre-mutation access preflight result:
- Identity verdict:
- Authority verdict: `verified | mismatch | not_observable | not_required`
- Target verdict:
- Approval verdict:
- Observation timestamp and expiry/freshness:
- Preflight invalidation check immediately before mutation:
- Local verification:
- Remote/stage verification:
- Registry/store/provider readback:
- Scenario or smoke checks:
- Logs/observability checks:
- User-visible proof:
- What this verification does not prove:

## Evidence Bundle

- Operation id:
- Branch/commit/tag/version:
- Artifact/build/package id:
- Stage or delivery target:
- Commands run:
- Logs/screenshots/reports:
- Approval evidence:
- Access profile and exact binding rule ids:
- Safe readback procedure ids:
- Expected/actual stable public identifiers and verdicts:
- Authorization blocker and next action:
- Backup/snapshot evidence:
- Verification verdict:
- Evidence location:

> Evidence is value-free: never persist credentials, tokens, raw authenticated output, secret-derived hashes or unnecessary personal identifiers. Record a session/context fingerprint only when the operational-access policy defines it as safe and public.

## Rollback Or Roll-Forward

- Rollback supported:
- Rollback artifact/version:
- Rollback command/action:
- Data compatibility:
- Roll-forward option:
- Owner for rollback decision:
- Validation after rollback/roll-forward:
- If impossible, why:

## Failure And Degraded Handling

- Partial success signals:
- Failure signals:
- Immediate stop conditions:
- Retry policy:
- Manual intervention:
- Escalation:
- Communication:
- Cleanup after failure:

## Post-Operation Cleanup

- Temporary files/config removed:
- Worktree-local secret/config cleanup completed according to secrets policy:
- Tokens/sessions revoked when needed:
- Branch/worktree cleanup:
- Follow-up monitoring:
- Deferred tasks:

## Lessons Learned And Insights

For each useful observation:

- `observed_issue_or_learning`:
- `why_it_matters`:
- `operation_context`:
- `evidence_or_command`:
- `runbook_update_required`:
- `target_memory_bank_layer`:
- `promotion_decision`: `promoted | already_documented | task_local_only | rejected | deferred_as_DEF | needs_user_confirmation | blocked`
- `follow_up_def`:

> Capture surprises even when the operation succeeds. Release, deploy, publish, migration, rollback, and recovery work often reveals durable operational knowledge.

## Memory Bank Promotion

- Policy/spec updates:
- Runbook updates:
- Scenario/evidence updates:
- ADR needed:
- DEF created or updated:
- Changelog/release notes impact:
