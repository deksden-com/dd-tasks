---
file: '.memory-bank/mbb/templates/devops-runbook-deploy.md'
description: 'Overlay template for deploy operator runbooks.'
purpose: 'Use with devops-runbook-base.md when the operation delivers an artifact to a runtime stage.'
version: '0.2.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/mbb/templates/index.md'
parent_template: '.memory-bank/mbb/templates/devops-runbook-base.md'
operation_type: 'deploy'
related_files:
  - .memory-bank/mbb/templates/operational-access-policy.md
tags: [mbb, templates, operations, runbook, deploy]
---

# Deploy Runbook Overlay

> Apply this overlay on top of `devops-runbook-base.md` when `operation_type: deploy`.

## Additional Required Fields

- Source artifact:
- Target stage:
- Deploy mechanism:
- Stage owner:
- Traffic or exposure policy:
- Health check endpoint or command:
- Observability source:
- Rollback trigger:
- Post-deploy monitoring window:
- Access binding refs for the target stage/provider:
- Exact protected deploy operation name:

## Additional Preflight

- [ ] Source artifact is immutable or identified by commit/package/image id.
- [ ] Target stage resolves one exact binding and fresh readback confirms identity, authority and provider target.
- [ ] Pre-deploy checks match the stage gate.
- [ ] Migration/seed requirements are handled separately or marked not applicable with reason.
- [ ] Rollback/roll-forward trigger is clear.
- [ ] Approval scope includes the binding, deploy operation, target stage, source artifact/change and run/request id when required.

## Additional Verification And Evidence

- Deployment id/URL:
- Stage health check:
- Smoke/scenario result:
- Log query or dashboard link:
- Error budget/alert status:
- User-visible readback:
- Rollback readiness verdict:
- Value-free identity/authority/target/approval verdicts:

## Additional Lessons To Capture

- deploy command changed in hosting provider;
- preview mistaken for beta/staging/prod;
- health check too shallow;
- logs or dashboards missing correlation ids;
- rollback trigger unclear.
