---
file: '.memory-bank/mbb/templates/index.md'
description: 'Catalog of canonical Memory Bank templates for architecture, delivery, protocol, and scenario documents.'
purpose: 'Use this catalog to choose the right template and keep new Memory Bank files structurally consistent.'
version: '0.9.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/mbb/index.md'
tags: [mbb, templates, documentation]
history:
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Initial template catalog.'
  - version: '0.2.0'
    date: '2026-05-12'
    changes: 'Added ADR and coding standards templates.'
  - version: '0.3.0'
    date: '2026-05-12'
    changes: 'Added scenario disposition matrix template.'
  - version: '0.4.0'
    date: '2026-05-25'
    changes: 'Clarified compact stub usage when project facts do not justify expanding a full template.'
  - version: '0.5.0'
    date: '2026-06-30'
    changes: 'Aligned epic/feature templates with canonical epics layout and traceability fields.'
  - version: '0.6.0'
    date: '2026-07-07'
    changes: 'Added base and operation-specific DevOps runbook templates plus template authoring guidance for agent notes.'
  - version: '0.7.0'
    date: '2026-07-07'
    changes: 'Added canonical DEF template for durable project-wide named deferrals.'
  - version: '0.8.0'
    date: '2026-07-10'
    changes: 'Added project-owned workspace bootstrap runbook overlay and first-class secrets-policy template.'
  - version: '0.9.0'
    date: '2026-07-10'
    changes: 'Added operational-access policy template and access-binding integration for mutating DevOps runbooks.'
---

# Templates

Use templates as starting points, not as forms to fill blindly. Delete sections that do not apply and keep links/frontmatter accurate.

## Template Authoring Guidance

Template files may contain short blockquote notes for the agent that fills the template. These notes are instructions, not project facts.

When creating a project document from a template:

- remove or rewrite instructional blockquotes unless they remain useful as explicit local guidance;
- replace placeholders with source-backed facts;
- use `unknown` or `DEF-*` when a required operational fact matters but is not known;
- use `not_applicable` only with a reason.

Do not inflate Memory Bank with template-shaped documents when project sources do not support them. If a canonical location should exist but facts are not available yet, create a compact stub with:

- `content_state: compact_stub`;
- `canonical_template: <path-to-full-template-or-guide>`;
- `activation_triggers` describing when to expand it;
- a short body saying what is currently unknown and where to place future facts.

Optional sections from full templates are filled only when they carry source-backed project knowledge or an explicit project decision.

- [Component](component.md): L3 component documentation.
- [Subsystem](subsystem.md): L2 subsystem/container index.
- [Structure](structure.md): project-level Memory Bank folder map and placement rules.
- [Project Policy](project-policy.md): top-level policy hub for flow routing, checks, evidence, delivery, and known policy gaps.
- [Secrets Policy](secrets-policy.md): project-owned operations policy for secret/configuration classes, sources, methods, access, permissions, redaction, cleanup, and unavailable behavior without values.
- [Operational Access Policy](operational-access-policy.md): project-owned profiles, exact operation-scoped identity-target bindings, safe readback, authority, approval, freshness and value-free evidence rules without credentials.
- [ADR](adr.md): architectural decision record with alternatives, consequences, and follow-up links.
- [Coding Standards](coding-standards.md): project engineering standards for maintainable, agent-friendly code.
- [Epic](epic.md): group of related delivered value under `epics/`.
- [Feature](feature.md): minimal unit of delivered value under an epic's `features/` folder.
- [Spec](spec.md): grounded implementation design.
- [Protocol](protocol.md): factual execution/remediation trace.
- [DEF](def.md): durable project-wide named deferral under `defs/`.
- [DevOps Runbook Base](devops-runbook-base.md): shared operator runbook structure for repeatable workspace bootstrap, release, deploy, publish, migration, rollback, backup/restore and similar operations.
- [DevOps Workspace Bootstrap Runbook Overlay](devops-runbook-workspace-bootstrap.md): checkout identity, canonical entrypoint, dependency/toolchain, allowlisted local configuration, readiness receipt, invalidation, and cleanup requirements.
- [DevOps Release Runbook Overlay](devops-runbook-release.md): additional release-version, changelog, tag, build and compatibility requirements.
- [DevOps Deploy Runbook Overlay](devops-runbook-deploy.md): additional stage delivery, health, observability and rollback trigger requirements.
- [DevOps Publish Runbook Overlay](devops-runbook-publish.md): additional registry/store/static-site publish and readback requirements.
- [DevOps Migration Runbook Overlay](devops-runbook-migration.md): additional data/schema migration, backup, compatibility and restore requirements.
- [DevOps Rollback Runbook Overlay](devops-runbook-rollback.md): additional rollback trigger, safe artifact, data compatibility and communication requirements.
- [DevOps Backup/Restore Runbook Overlay](devops-runbook-backup-restore.md): additional backup scope, retention, restore rehearsal and disaster recovery requirements.
- [Scenario](scenario.md): executable verification contract with environment, evidence, and verification matrix links.
- [Scenario Disposition Matrix](scenario-disposition-matrix.md): classification of canonical, id-first, legacy, rewrite, and upstream scenario ids.
- [UI Screen](ui-screen.md): governed screen contract for GUI/TUI surfaces, automation, and screenshots.
