---
file: '.memory-bank/mbb/templates/devops-runbook-workspace-bootstrap.md'
description: 'Overlay template for project workspace bootstrap runbooks.'
purpose: 'Use with devops-runbook-base.md to prepare one concrete checkout for project code, tests, build, packaging, or delivery tooling.'
version: '0.1.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/mbb/templates/index.md'
parent_template: '.memory-bank/mbb/templates/devops-runbook-base.md'
operation_type: 'workspace-bootstrap'
related_files:
  - .memory-bank/mbb/templates/secrets-policy.md
tags: [mbb, templates, operations, runbook, workspace, bootstrap, secrets]
---

# Workspace Bootstrap Runbook Overlay

> Apply this overlay on top of `devops-runbook-base.md` when `operation_type: workspace-bootstrap`. The filled runbook and any script are project-owned under `.memory-bank/spec/operations/**`; this canonical overlay supplies structure only.

## Additional Required Fields

- Bootstrap applicability: `applicable | not_applicable | unknown`
- Not-applicable reason:
- Concrete workspace path:
- Checkout identity: branch and commit SHA
- Workspace owner/flow:
- Bootstrap policy source:
- Canonical bootstrap entrypoint:
- Optional project-owned script:
- Secrets policy source:
- Dependency manifests and lockfiles:
- Authoritative install command:
- Runtime/toolchain declarations:
- Generated-artifact inputs and commands:
- Allowlisted local-configuration classes and methods:
- Lightweight readiness command/check:
- Receipt location:
- Invalidation inputs:
- Cleanup requirements:

## Additional Preflight

- [ ] The command is the one project-owned canonical entrypoint; flow-local setup sequences are not substituted.
- [ ] The workspace path, branch, commit, and owner are recorded.
- [ ] Package manager, lockfile policy, runtime/toolchain files, and generated inputs are unambiguous.
- [ ] Secrets/local configuration are limited to classes and destinations allowlisted by the linked secrets policy.
- [ ] Required access is available without printing, persisting, or requesting secret values in the runbook.
- [ ] The entrypoint is idempotent and excludes destructive migrations, production actions, and unapproved external mutations.
- [ ] Reuse eligibility has been checked against workspace identity and all public invalidation inputs.

## Execution Boundaries

- Use immutable/frozen dependency installation when the project supports it.
- Reuse package-manager caches only through supported cache mechanisms; never copy dependency directories between worktrees.
- Fetch, generate, copy, or symlink only allowlisted local configuration according to the secrets policy.
- Keep judgment, approval, and interactive access steps in the runbook; keep deterministic repeated steps in the canonical script/command when practical.
- Stop before project code, tests, build, packaging, or delivery tooling when bootstrap is blocked or failed.

## Additional Verification And Evidence

- Bootstrap status: `bootstrap_not_required | bootstrap_reused | bootstrap_completed | bootstrap_blocked | bootstrap_failed`
- Workspace path/branch/commit readback:
- Policy, runbook, and entrypoint used:
- Dependency/toolchain readiness:
- Generated-artifact readiness:
- Secrets/configuration readiness by class or filename only:
- Commands executed and exit status:
- Relevant public input fingerprints or changed-file summary:
- Reuse verdict and reason:
- Blocker and next action:
- Cleanup verification:

> Never include secret values, raw `.env*` contents, credential-bearing output, or hashes derived from secret values in the receipt.

## Reuse And Invalidation

Reconsider reuse when any of these change:

- workspace path, branch, commit, or checkout identity;
- dependency manifests or lockfiles;
- runtime/toolchain declarations;
- bootstrap policy, runbook, script, or canonical entrypoint;
- generated-code/artifact configuration;
- required environment/configuration declarations;
- an integration merge that changes any relevant input.

A receipt from another workspace path, including a feature worktree, cannot prove readiness for the integration checkout.

## Unavailable Or Degraded Handling

- Missing current access or required configuration: record `bootstrap_blocked`, name only the class/file and access owner or next action, then stop the gated work.
- Entrypoint execution failure: record `bootstrap_failed`, preserve safe stderr summary, and do not claim project-tooling readiness.
- Durable unknown policy: create or link a scoped DEF only when the unknown affects a current or future gate.
- Genuine documentation/read-only exemption: record `bootstrap_not_required` with the concrete reason; do not install project dependencies by default.

## Additional Lessons To Capture

- setup command or package manager differed from documented policy;
- lockfile/runtime change failed to invalidate an old receipt;
- ignored configuration was copied outside the allowlist;
- permission or cleanup rules were missing;
- feature-worktree readiness was incorrectly assumed for another checkout;
- bootstrap performed an external or destructive action that needs a separate gate.
