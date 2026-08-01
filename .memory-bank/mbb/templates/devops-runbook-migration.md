---
file: '.memory-bank/mbb/templates/devops-runbook-migration.md'
description: 'Overlay template for data or schema migration operator runbooks.'
purpose: 'Use with devops-runbook-base.md when the operation changes persistent data, schemas, compatibility, or migration state.'
version: '0.2.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/mbb/templates/index.md'
parent_template: '.memory-bank/mbb/templates/devops-runbook-base.md'
operation_type: 'migration'
related_files:
  - .memory-bank/mbb/templates/operational-access-policy.md
tags: [mbb, templates, operations, runbook, migration]
---

# Migration Runbook Overlay

> Apply this overlay on top of `devops-runbook-base.md` when `operation_type: migration`.

## Additional Required Fields

- Migration id:
- Direction:
- Affected stores:
- Compatibility window:
- Backup/snapshot id:
- Dry-run command:
- Migration command:
- Verification query/check:
- Rollback or roll-forward path:
- Data loss boundary:
- Access binding refs for affected stores/provider targets:
- Exact protected migration operation name:

## Additional Preflight

- [ ] Backup or explicit no-backup approval exists.
- [ ] Dry run or rehearsal result is recorded when available.
- [ ] Old/new code compatibility is understood.
- [ ] Long-running/locking behavior is understood.
- [ ] Restore or roll-forward validation is defined.
- [ ] One exact binding resolves and fresh safe readback verifies identity, authority and affected store/target before migration.
- [ ] Approval scope includes binding, migration id/direction, target stage/store, change request and run/request id when required.

## Additional Verification And Evidence

- Before state sample:
- After state sample:
- Schema/version readback:
- Row/object count or invariant check:
- Application compatibility smoke:
- Backup/restore evidence:
- Irreversibility statement:
- Value-free identity/authority/target/approval verdicts:

## Additional Lessons To Capture

- migration is not reversible despite assumptions;
- backup does not cover all affected data;
- old and new code cannot coexist;
- dry-run data differs from production;
- verification query missed a domain invariant.
