---
file: '.memory-bank/mbb/aspects/05-operations.md'
description: 'Canonical aspect for Git flow, CI/CD, deployment, release, rollout, rollback, and operations.'
purpose: 'Use to extract, migrate, audit, or distill operational knowledge in a Memory Bank.'
version: '0.3.0'
date: '2026-07-10'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
related_files:
  - .memory-bank/mbb/operations-release-guide.md
  - .memory-bank/mbb/project-policy-guide.md
  - .memory-bank/mbb/verification-matrix-guide.md
  - .memory-bank/mbb/templates/operational-access-policy.md
tags: [mbb, aspects, operations, git-flow, release, authorization, identity, access-bindings]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added operations knowledge aspect.'
  - version: '0.2.0'
    date: '2026-06-15'
    changes: 'Split operations extraction into Git, stage/environment, release, deploy/publish, verification and runbook contours.'
  - version: '0.3.0'
    date: '2026-07-10'
    changes: 'Added source-backed operational-access discovery, exact identity-target bindings, safe readback, scoped approval and value-free evidence requirements.'
---

# Operations

## Scope

Git flow, branch policy, worktrees, PRs, CI, environment/stage policy, beta/preview/prod, release/versioning, deploy/publish, rollout, rollback, secrets, external tool/provider authorization, identity-target bindings, migrations, operator runbooks, active DEF/BLOCK items, and operational evidence.

## Canonical Targets

- `spec/operations/`
- git/release/deploy/publish policies and runbooks
- one project-owned operational-access policy when external authenticated mutation applies
- protocol closure records for delivery work

## Sources

Git state, README, CONTRIBUTING, `.github/`, CI/CD configs, hosting/registry/cloud/infrastructure configs, package scripts, task runners, deployment docs, release notes, environment examples, existing runbooks and policies, public provider project metadata, prior value-free operation evidence, and user answers.

Inspect direct and indirect evidence of external mutation: release, deploy, publish, push, migration, backup/restore, infrastructure and provider commands may imply an access requirement even when no access policy exists. Tool presence or the currently authenticated session is only evidence to investigate; it is never proof of the intended project identity, authority or target.

## Questions

- What branch is the integration branch?
- Are feature branches, PRs, worktrees, beta gates, or merge queues required?
- What happens after push to integration?
- Which checks are local, CI, preview, beta, or production?
- Which SDLC contours are applicable, not applicable, unknown, blocked or deferred?
- Are policy and runbook separated?
- Is release separate from deploy, or is this a publish-style hybrid?
- Which external mutating commands exist, and is each linked to an exact access binding, explicitly not applicable, or represented by a question/BLOCK/DEF?
- Which existing stages, targets, dependencies, resources, repositories and runbooks need local `access_binding_refs`?
- Does each binding resolve exactly one `profile + subject/entity + provider target + stage/environment + operation` rule without an implicit Cartesian product?
- Can actual identity, authority and target be read back through a bounded, noninteractive, read-only procedure without login, refresh or context switching?
- Is operation approval separate from credential availability and external authorization, and is it scoped to the exact binding, operation, target, stage, artifact/change and run/request?
- What freshness invalidates preflight evidence before mutation?
- Does durable evidence exclude credentials, raw authenticated output, secret-derived hashes and unnecessary personal identifiers?
- What must be asked when the project has no documented Git flow?

## Modes

- `init`: capture current Git state, establish or ask for first Git flow, discover access requirements without promoting current login state into policy, and classify missing SDLC/access contours as confirmed, candidate, unknown, not applicable, BLOCK or DEF.
- `upgrade`: migrate old operations notes into current Git/stage/release/deploy/publish policy and runbooks without losing project-specific names; preserve confirmed profile/binding ids and report drift before changing expected identity or target facts.
- `audit/analyse`: find missing release gates, unclear rollback, open deferrals, CI/deploy drift, unbound external mutations, dangling access references, duplicated identity facts and policy/runbook contradictions.
- `distill`: look for operational practices that make agent delivery safer.
