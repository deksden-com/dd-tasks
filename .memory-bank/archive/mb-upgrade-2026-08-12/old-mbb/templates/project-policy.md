---
file: '.memory-bank/project-policy.md'
description: 'Top-level project policy hub.'
purpose: 'Summarize project policies that affect agent routing, checks, evidence, delivery, and Memory Bank maintenance.'
version: '0.3.0'
date: 'YYYY-MM-DD'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/index.md'
related_files:
  - .memory-bank/structure.md
  - .memory-bank/spec/operations/workspace-bootstrap-policy.md
  - .memory-bank/spec/operations/secrets-policy.md
  - .memory-bank/spec/operations/operational-access-policy.md
tags: [project-policy, routing, verification, operations, authorization, access-bindings]
---

# Project Policy

This file is the top-level policy hub for the project. It links to detailed owners and records current defaults that affect dd-flow and agent work.

## Project Identity

- Project:
- Repository role:
- Memory Bank root:
- Primary runtime or package:

## Git And Workspace Policy

- Integration branch:
- Production/release branch:
- Default route.git:
- Feature branch/worktree policy:
- PR/merge queue policy:
- Cleanup policy:
- Branch cleanup default:
- Disposable branch patterns:
- Local merged branch cleanup:
- Remote merged branch cleanup:
- Branch retention source:
- Post-merge continuation branch:
- Repository/Git access binding refs:

Branch retention exceptions:

| Branch | Scope | Reason | Review after |
| --- | --- | --- | --- |
| _none_ | _not_applicable_ | No retained merged disposable feature branches are currently declared. | _not_applicable_ |

Rules:

- Missing or empty retention exceptions mean no branches are retained by default.
- Retained branches must have a reason and review date.
- Merge/post-merge cleanup must never delete current, integration, protected, unmerged or dirty worktree-owned branches.

Owning documents:

- ...

## Workspace Bootstrap And Secrets Routing

Keep this section compact. Detailed commands, per-class rules, and scripts belong under project-owned `.memory-bank/spec/operations/**`, not in this hub or canon-managed `.memory-bank/dd-flow/**` and `.memory-bank/mbb/**`.

- Bootstrap applicability: `applicable | not_applicable | unknown`
- Not-applicable reason:
- Canonical bootstrap entrypoint:
- Workspace bootstrap policy:
- Workspace bootstrap runbook:
- Optional project-owned script:
- Dependency/toolchain policy source:
- Bootstrap receipt/evidence rule:
- Secrets-policy applicability: `applicable | not_applicable | unknown`
- Secrets policy:
- Allowed local-configuration methods: `fetch | generate | copy | symlink | not_applicable`
- Missing required access behavior:

Rules:

- Name exactly one canonical bootstrap entrypoint when bootstrap is applicable.
- Link the project-owned secrets policy when secrets or ignored local configuration are applicable.
- Never store secret values, raw `.env*` contents, or credential-bearing output in this file or evidence.
- Canonical template upgrades must preserve project commands, runbooks, scripts, and per-class secrets decisions.

Owning documents:

- Workspace bootstrap: ...
- Secrets and local configuration: ...

## Operational Access Routing

Keep this section compact. Expected identity, authority and provider-target facts live only in the linked project-owned operational-access policy. Approval for one mutation lives in the owning runbook or flow.

- Operational-access applicability: `applicable | not_applicable | unknown`
- Not-applicable reason:
- Operational-access policy:
- Default mismatch/missing-session behavior: `block_without_login_or_context_switch`
- Safe readback policy:
- Preflight freshness rule:
- Value-free evidence rule:

Rules:

- Secret/configuration availability, external tool authorization and operation approval are separate gates.
- Add `access_binding_refs` only to existing entities and runbooks that participate in an external operation; do not create entity types solely to hold references.
- Every protected operation must resolve exactly one binding rule for profile, subject/entity, provider target, stage/environment and operation.
- Actual identity, authority and target must come from approved read-only procedures. Never silently login, refresh or switch account/team/project/registry/context.
- Missing, ambiguous, stale or mismatched identity, authority, target or scoped approval blocks before mutation.
- Evidence must exclude credentials, raw authenticated output, secret-derived hashes and unnecessary personal identifiers.

Owning documents:

- Operational access profiles and bindings: ...
- Operation approvals and runbooks: ...

## Flow Automation Policy

- dd-flow project config:
- ready_for_code_auto:
- ready_for_hardening_auto:
- ask-before-code policy:
- ask-before-hardening policy:

Owning documents:

- ...

## Check Profiles

- Local profile:
- CI profile:
- Beta/staging profile:
- Production/publish profile:
- Green definition:

Owning documents:

- ...

## Verification Policy

- Acceptance scenarios:
- Manual verification policy:
- Evidence/passport requirements:
- Browser/UI proof requirements:
- DEF policy for skipped gates:

Owning documents:

- ...

## Scenario, Seed And Eval Policy

- Scenario home:
- Seed/fixture strategy:
- Allowed seed environments:
- Cleanup/world isolation:
- Eval/experiment policy:

Owning documents:

- ...

## Artifact Promotion Policy

- Primary run artifact home:
- Project-local `.tasks` role:
- Project projection policy:
- Retention policy:
- Artifacts promoted to Memory Bank:
- Artifacts retained only in run home:
- Raw logs/payloads/screenshots policy:
- Promotion decision record requirements:

Owning documents:

- ...

## Engineering Policy

- Coding standards:
- Testing strategy:
- Contract propagation:
- Module size/decomposition:
- Agent coding rules:

Owning documents:

- ...

## UI And Client Surface Policy

- Design system:
- Screen registry:
- Stable automation ids:
- Client/SDK/CLI/TUI/GUI policy:
- Visual evidence policy:

Owning documents:

- ...

## Release, Deploy And Publish Policy

- Version map:
- Changelog/release notes:
- Release gate:
- Runtime stages:

| Stage | Deploy provider | Deploy target | Source artifact | Access binding refs | Gate/check profile | Evidence owner |
| --- | --- | --- | --- | --- | --- | --- |
| local | local | local checkout | working tree/commit | `not_applicable` | local | ... |

- Delivery/publish targets:

| Target kind | Target/channel | Flow classification | Release coupling | Access binding refs | Readback/evidence | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| package-registry | ... | publish_target | coupled | ... | ... | ... |

- Deploy gate:
- Publish gate:
- Rollback/roll-forward:

Owning documents:

- ...

## Known Policy Gaps

| Gap | Status | Blocks | Next gate | Owner | DEF |
| --- | --- | --- | --- | --- | --- |
| ... | unknown_not_blocking | ... | ... | ... | ... |
