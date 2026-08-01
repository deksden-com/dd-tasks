---
file: '.memory-bank/mbb/templates/devops-runbook-backup-restore.md'
description: 'Overlay template for backup and restore operator runbooks.'
purpose: 'Use with devops-runbook-base.md when the operation creates, verifies, restores, or rehearses backups.'
version: '0.2.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/mbb/templates/index.md'
parent_template: '.memory-bank/mbb/templates/devops-runbook-base.md'
operation_type: 'backup-restore'
related_files:
  - .memory-bank/mbb/templates/operational-access-policy.md
tags: [mbb, templates, operations, runbook, backup, restore]
---

# Backup/Restore Runbook Overlay

> Apply this overlay on top of `devops-runbook-base.md` when `operation_type: backup-restore`.

## Additional Required Fields

- Backup scope:
- Restore scope:
- Retention policy:
- Encryption/access policy:
- Backup command/action:
- Restore rehearsal command/action:
- Restore target:
- RPO/RTO expectation:
- Disaster recovery assumption:
- Access binding refs for backup storage, source and restore target:
- Exact protected backup/restore operation names:

## Additional Preflight

- [ ] Backup scope matches the data impact.
- [ ] Storage location and access owner are known.
- [ ] Restore target is safe and non-destructive unless explicitly approved.
- [ ] Encryption/access requirements are met.
- [ ] Retention and deletion expectations are explicit.
- [ ] Each backup/restore mutation resolves one exact binding and fresh readback verifies identity, authority, source/storage/restore target and stage.
- [ ] Restore approval is scoped to binding, operation, source, restore target, backup id/change and run/request id when required.

## Additional Verification And Evidence

- Backup id/location:
- Backup size/metadata:
- Restore rehearsal evidence:
- Integrity check:
- Access/encryption readback:
- Retention readback:
- Recovery verdict:
- Value-free identity/authority/target/approval verdicts:

## Additional Lessons To Capture

- backup excludes a required data store;
- restore was never tested;
- access policy blocks emergency restore;
- retention is too short for rollback window;
- RPO/RTO expectation is undocumented.
