---
file: '.memory-bank/mbb/templates/devops-runbook-rollback.md'
description: 'Overlay template for rollback operator runbooks.'
purpose: 'Use with devops-runbook-base.md when the operation reverts or mitigates a failed release, deploy, publish, or migration.'
version: '0.2.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/mbb/templates/index.md'
parent_template: '.memory-bank/mbb/templates/devops-runbook-base.md'
operation_type: 'rollback'
related_files:
  - .memory-bank/mbb/templates/operational-access-policy.md
tags: [mbb, templates, operations, runbook, rollback]
---

# Rollback Runbook Overlay

> Apply this overlay on top of `devops-runbook-base.md` when `operation_type: rollback`.

## Additional Required Fields

- Rollback trigger:
- Incident/change being reverted:
- Safe previous artifact/version:
- Data compatibility:
- User communication:
- Provider/channel actions:
- Validation after rollback:
- Follow-up repair path:
- Access binding refs for every provider/channel rollback action:
- Exact protected rollback operation names:

## Additional Preflight

- [ ] Owner approved rollback versus roll-forward.
- [ ] Previous artifact/version is available.
- [ ] Data migrations and external side effects are classified.
- [ ] Communication path is ready.
- [ ] Post-rollback monitoring is defined.
- [ ] Each provider/channel action resolves one exact binding and fresh readback verifies identity, authority and target.
- [ ] Approval scope includes binding, rollback action, target, incident/change, safe artifact and run/request id when required.

## Additional Verification And Evidence

- Rollback command/action output:
- Artifact/version readback:
- Stage health check:
- User-visible smoke:
- Data compatibility check:
- External provider/channel readback:
- Follow-up DEF/protocol links:
- Value-free identity/authority/target/approval verdicts:

## Additional Lessons To Capture

- rollback is impossible after data change;
- previous artifact unavailable;
- external provider state requires manual repair;
- communication template missing;
- rollback check proves less than production recovery needs.
