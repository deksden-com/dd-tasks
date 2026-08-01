---
file: '.memory-bank/mbb/project-policy-guide.md'
description: 'Canonical guide for the top-level project-policy.md policy hub.'
purpose: 'Use when creating, upgrading, auditing, or reading a Memory Bank so project-level flow policies are visible without hiding detailed rules in one operations file.'
version: '0.3.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
related_files:
  - .memory-bank/mbb/memory-bank-structure.md
  - .memory-bank/mbb/spec-layer-guide.md
  - .memory-bank/mbb/operations-release-guide.md
  - .memory-bank/mbb/templates/project-policy.md
  - .memory-bank/mbb/templates/devops-runbook-workspace-bootstrap.md
  - .memory-bank/mbb/templates/secrets-policy.md
  - .memory-bank/mbb/templates/operational-access-policy.md
  - .memory-bank/dd-flow/common/workspace-bootstrap.md
  - .memory-bank/dd-flow/common/flow-flags.md
  - .memory-bank/dd-flow/common/sdlc-contours.md
tags: [mbb, project-policy, policy-hub, flow-routing, operations, verification, authorization, access-bindings]
history:
  - version: '0.1.0'
    date: '2026-06-24'
    changes: 'Added canonical project-policy.md role as a top-level Memory Bank policy hub.'
  - version: '0.1.1'
    date: '2026-07-08'
    changes: 'Added branch cleanup and exception-only branch retention visibility requirements.'
  - version: '0.2.0'
    date: '2026-07-10'
    changes: 'Added compact routing for project-owned workspace bootstrap and secrets policy owners.'
  - version: '0.3.0'
    date: '2026-07-10'
    changes: 'Added compact routing for project-owned operational access policy and entity-local binding references without duplicating identity facts.'
---

# Project Policy Hub

`project-policy.md` is a top-level Memory Bank file that summarizes project policies that affect agents and dd-flow routing.

It answers:

```text
Which project rules change how an agent should plan, code, verify, merge, release, deploy, or update this Memory Bank?
```

It is not a replacement for detailed specs. It is a hub: compact defaults, links to owning documents, current status, and visible gaps.

## Location

Canonical location:

```text
.memory-bank/project-policy.md
```

If a project uses `memory-bank/` instead of `.memory-bank/`, place it at:

```text
memory-bank/project-policy.md
```

Do not hide the policy hub only under `spec/operations/`. Operations owns Git, release, deploy, stages, and runbooks, but project policy also includes engineering standards, verification, scenarios, seed/eval policy, UI/client surfaces, and agent-flow automation.

## Relationship To Other Files

- `index.md` is the working entry point: what to read first.
- `structure.md` is the shelf map: where knowledge lives.
- `project-policy.md` is the policy hub: what project rules influence flow behavior.
- `spec/operations/*` owns detailed Git, workspace bootstrap, secrets, operational access, environment, release, deploy, publish, rollback, runbook, script, and operational evidence policy.
- `spec/engineering/*` owns coding standards, tests, contracts, and agent coding rules.
- `scenarios/*`, `evals/*`, `ui/*`, and `guides/*` own their detailed policies and artifacts.

`project-policy.md` may repeat only compact defaults and links. It must not duplicate full runbooks, coding standards, scenario bodies, or release instructions.

## Required Visibility

A mature project should link `project-policy.md` from:

- `.memory-bank/index.md`;
- `.memory-bank/structure.md`;
- relevant section indexes when a policy has detailed owners;
- protocol/stage reports when a policy affected route selection or gate decisions.

Priming should read `project-policy.md` when it exists. If it does not exist, priming should treat that as missing policy hub visibility, not as a blocker for every small project.

SDLC stage reports may carry `policy_context` snapshots derived from `project-policy.md` and detailed owners. These snapshots are handoff evidence for one run, not a replacement for the policy hub.

## Recommended Sections

Use the template at `.memory-bank/mbb/templates/project-policy.md`.

Recommended section set:

- Project Identity;
- Git And Workspace Policy;
- Workspace Bootstrap And Secrets Routing;
- Operational Access Routing;
- Flow Automation Policy;
- Check Profiles;
- Verification Policy;
- Scenario, Seed And Eval Policy;
- Engineering Policy;
- UI And Client Surface Policy;
- Release, Deploy And Publish Policy;
- Known Policy Gaps.

Git policy should distinguish workspace route from delivery/fixation strategy: where work happens (`integration_branch_direct` or `feature_worktree`) is separate from how the result is evidenced (`direct_commit`, PR, merge queue, local-only handoff, and so on).

Git policy should also expose branch cleanup and retention exceptions because they affect merge/post-merge behavior:

- merged disposable feature branches are deleted by default after successful merge/fixation;
- cleanup reviews both local and remote merged feature branches, not only the branch that was just merged;
- branch retention is exception-only, with a visible reason and review date;
- missing or empty retention exceptions mean no branches are retained by default;
- merge flow must read `project-policy.md` and any linked retention owner before branch cleanup;
- if project policy requires a separate retention owner and that owner is missing, malformed or unreadable, cleanup must fail safe or skip deletion with a clear report reason.

The hub may keep the retention table inline for small projects. Larger projects may link to a detailed operations owner, for example `.memory-bank/spec/operations/git-branch-retention.md`, but `project-policy.md` must still name that source.

Release/deploy/publish policy should distinguish flows from contours:

- top-level flows (`release.md`, `deploy.md`, `publish.md`) execute operations and write evidence;
- contours are policy/evidence aspects that may apply inside any flow;
- `publish` is not unrelated to release/deploy; it is release fixation plus artifact delivery to a publication target plus publish-specific gates.

The hub should expose compact matrices only:

- runtime stages: stage, deploy provider, deploy target, source artifact, gate, evidence owner;
- delivery/publish targets: target kind, package/store/registry/channel, release coupling, readback, rollback or fallback posture.

Detailed commands, approvals, provider-specific procedures and runbooks belong in `.memory-bank/spec/operations/*`.

### Workspace Bootstrap And Secrets Routing

The hub must make workspace readiness discoverable without copying the operational implementation into the top-level file. Keep a compact routing block that names:

- bootstrap applicability: `applicable`, `not_applicable`, or `unknown`;
- the one canonical bootstrap entrypoint, or a reason why bootstrap is not applicable;
- the project-owned workspace bootstrap policy/runbook and optional script;
- the authoritative dependency/toolchain policy source;
- secrets-policy applicability and the project-owned secrets-policy owner;
- the allowed local-configuration methods at summary level: `fetch`, `generate`, `copy`, `symlink`, or `not_applicable`;
- the receipt/evidence expectation and unavailable-secret behavior.

The detailed owners belong under project-owned `.memory-bank/spec/operations/**`, for example:

```text
.memory-bank/spec/operations/workspace-bootstrap-policy.md
.memory-bank/spec/operations/secrets-policy.md
.memory-bank/spec/operations/runbooks/workspace-bootstrap.md
.memory-bank/spec/operations/scripts/bootstrap-workspace.sh
```

The runbook may point to an established root command when that is already the canonical project entrypoint. Do not move project-specific commands into `.memory-bank/dd-flow/**` or `.memory-bank/mbb/**`: those are canon-managed layers and upgrades may replace them. Canonical templates provide structure only and must not overwrite discovered project commands, methods, access rules, or scripts.

The hub must never contain secret values, raw `.env*` content, credential-bearing command output, or instructions to copy arbitrary ignored files. It links to the secrets policy, which defines allowlisted classes, sources, methods, access gates, permissions, redaction, cleanup, and unavailable behavior without values.

When bootstrap or secrets are genuinely not applicable, record `not_applicable` with a project-specific reason and use `bootstrap_not_required` evidence when a flow must report readiness. Missing current access is a blocker, not a DEF. Create a scoped DEF only for durable unknown policy that affects a current or future gate.

Vercel-like hosting providers are usually deploy providers for runtime stages, not publish targets. Treat them as publish targets only when project policy explicitly defines a release+publication operation for that surface.

### Operational Access Routing

Keep external tool/provider authorization separate from both workspace secret material and operation approval:

- the secrets policy governs material delivered to a workspace, process, container or workload;
- the operational-access policy governs the expected authenticated identity, authority and provider target for external tools;
- the runbook or owning flow governs whether one protected mutation is approved.

Credential presence or a successful identity readback does not prove authority and never grants approval.

When external authenticated mutation applies, the hub should name one project-owned policy, normally:

```text
.memory-bank/spec/operations/operational-access-policy.md
```

The hub remains a router. It may record applicability, the policy owner, repository/Git binding references, the freshness rule and default fail-closed behavior, but it must not copy account, tenant, role or target facts from the central policy.

Add `access_binding_refs` only to project entities that already exist and participate in an operation, such as an existing repository, runtime stage, deploy/delivery target, dependency, data/infra resource or operator runbook. Do not create stage, dependency, registry or resource document types solely to hold a reference. Existing compact tables may add an `Access binding refs` column. Filled runbooks carry the same references in frontmatter and operation fields.

Each central rule resolves one exact tuple:

```text
profile + subject/entity + provider target + stage/environment + operation
```

Zero, duplicate, ambiguous or conflicting matches block. Arrays are acceptable only as an authoring shorthand whose expansion is explicit and cannot accidentally grant a Cartesian product.

Expected identities and targets come from project sources or explicit user decisions, never from whichever account is currently logged in. `mb-init` leaves unconfirmed facts as candidates/questions/BLOCK/DEF. `mb-upgrade` preserves confirmed ids and facts, reports drift, and changes them only from source evidence or user decision.

The linked policy must define safe readback, authority outcomes, approval references, freshness and value-free evidence. A readback procedure is noninteractive, time-bounded and read-only; it forbids login, token refresh, account/team/project/registry/context switching and mutation. `authority: not_observable` blocks protected mutation. `authority: not_required` is valid only when the project policy proves that authority is irrelevant for the exact operation.

Approval, when required, is scoped to the approver authority, binding, operation, target, stage, artifact/version/change request when applicable, run/request id, decision source, timestamp, expiry/freshness and revocation state. Missing, stale, revoked or differently scoped approval blocks even when identity and target match.

Preflight evidence is consumed immediately before mutation and is invalidated by a process boundary, session/context change, target change, expiry or material delay. Durable evidence stores profile/binding/procedure ids, public stable identifiers, verdicts, timestamps and blockers only; it excludes credential material, raw authenticated output, value-derived hashes and unnecessary personal identifiers.

Projects may omit a section only with a traceable `not_applicable` reason or because the section is clearly out of scope for the project size and current gates.

## Policy Gaps And DEF

Do not create a `DEF-*` for every absent policy in a small project.

Create a named `DEF-*` when a policy detail is required by the canon and one of these is true:

- it affects the current flow gate;
- it affects route selection, such as Git contour, CI gate, delivery target, or required evidence;
- it affects future agent work and would be hard to rediscover;
- it creates data, staging, production, release, deploy, seed, eval, secret, provider, or rollback risk;
- detailed policy documents contradict observed project behavior.

If a policy is unknown but not relevant now, mark it as `unknown_not_blocking` or leave a compact note in `Known Policy Gaps` without inventing a DEF.

## Init, Upgrade, Audit

`mb-init` should create `project-policy.md` when project sources contain enough substantive policy facts. For tiny projects, it may create a compact stub if the file is needed for navigation.

`mb-init` and `mb-upgrade` should extract runtime stages, deploy providers, deploy targets, delivery targets and publish targets separately. They should also inspect direct and indirect evidence of external mutating commands, materialize only confirmed operational-access facts, preserve existing profile/binding ids on upgrade, and keep meaningful unknowns when they affect active gates, future agent work or operational safety.

For Git-backed projects, `mb-init` and `mb-upgrade` should also discover or preserve branch cleanup policy:

- whether merged temporary feature branches are deleted locally;
- whether merged remote feature branches are deleted;
- which branch patterns are disposable;
- where branch retention exceptions are documented;
- whether missing cleanup/retention policy affects future merge, worktree cleanup, queue handoff, evidence or agent continuation.

Create `DEF-MBI-OPERATIONS-*` or `DEF-MBU-OPERATIONS-*` only when that missing policy affects those gates. Do not create a DEF for every tiny or no-Git project.

`mb-upgrade` should add the file when missing, migrate discoverable policy summaries from existing docs, and link detailed owners.

`mb-audit` should verify that the policy hub is visible, not stale, and not contradicted by `spec/operations`, `spec/engineering`, scenarios, evals, UI docs, runbooks, CI config, package scripts, or recent protocol evidence. It should also find dangling/orphan `access_binding_refs`, duplicated identity facts, ambiguous exact-operation rules and external mutating commands with no binding or explicit disposition.

`mb-distill` may extract reusable project-policy patterns into the canon only after applicability analysis.
