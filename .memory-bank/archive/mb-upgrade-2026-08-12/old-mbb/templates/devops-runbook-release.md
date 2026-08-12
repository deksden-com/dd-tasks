---
file: '.memory-bank/mbb/templates/devops-runbook-release.md'
description: 'Overlay template for release operator runbooks.'
purpose: 'Use with devops-runbook-base.md when the operation fixes a release version, release set, notes, tag, or build artifact.'
version: '0.2.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/mbb/templates/index.md'
parent_template: '.memory-bank/mbb/templates/devops-runbook-base.md'
operation_type: 'release'
related_files:
  - .memory-bank/mbb/templates/operational-access-policy.md
tags: [mbb, templates, operations, runbook, release]
---

# Release Runbook Overlay

> Apply this overlay on top of `devops-runbook-base.md` when `operation_type: release`.

## Additional Required Fields

- Release version:
- Release set source:
- Included protocols/features/fixes:
- Excluded changes:
- Changelog source:
- Release notes target:
- Version source of truth:
- Tag name:
- Build artifacts:
- Compatibility matrix impact:
- Access binding refs for tag/release/build-provider mutations:
- Exact protected operation names:

## Additional Preflight

- [ ] Release set reviewed against changelog/version policy.
- [ ] Generated changelog source updated when the project uses Changesets, release-please, semantic-release, or conventional commits.
- [ ] Version readback command identified.
- [ ] Tag/build artifact creation command identified.
- [ ] Previous release rollback or hotfix path understood.
- [ ] Each external tag/release/build-provider mutation has one exact binding and a fresh safe readback.
- [ ] Approval scope includes release version, release set or change request, target and run/request id when required.

## Additional Verification And Evidence

- Version file readback:
- Changelog/release notes readback:
- Tag readback:
- Artifact checksum/id:
- Package/image/app metadata:
- Compatibility manifest readback:
- Release verdict:
- Value-free identity/authority/target/approval verdicts:

## Additional Lessons To Capture

- stale manual changelog fragments;
- generated changelog source mismatch;
- version metadata mismatch between source and artifact;
- tag/build created from the wrong commit;
- compatibility matrix gaps.
