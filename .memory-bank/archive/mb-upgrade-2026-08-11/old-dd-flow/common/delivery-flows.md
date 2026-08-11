---
file: '.memory-bank/dd-flow/common/delivery-flows.md'
description: 'Shared guidance for release, deploy and publish flow prompts.'
purpose: 'Read from release.md, deploy.md and publish.md before planning or executing delivery operations.'
version: '0.3.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'flow-common'
parent: '.memory-bank/dd-flow/index.md'
related_files:
  - .memory-bank/dd-flow/common/sdlc-contours.md
  - .memory-bank/dd-flow/common/changelog.md
  - .memory-bank/dd-flow/common/flow-runs.md
  - .memory-bank/dd-flow/common/git-ops.md
  - .memory-bank/dd-flow/common/operational-access.md
  - .memory-bank/dd-flow/common/workspace-bootstrap.md
  - .memory-bank/dd-flow/schemas/release-stage-report.schema.json
  - .memory-bank/dd-flow/schemas/deploy-stage-report.schema.json
  - .memory-bank/dd-flow/schemas/publish-stage-report.schema.json
  - .memory-bank/mbb/operations-release-guide.md
tags: [dd-flow, delivery, release, deploy, publish, flow-common]
history:
  - version: '0.1.0'
    date: '2026-07-07'
    changes: 'Added shared preflight, evidence and partial-failure rules for release/deploy/publish prompts.'
  - version: '0.2.0'
    date: '2026-07-07'
    changes: 'Linked release/deploy/publish stage-report schemas and templates after PRT-074.'
  - version: '0.2.1'
    date: '2026-07-08'
    changes: 'Added shared Git operation context and commit trace-tag guidance for Git-backed delivery operations.'
  - version: '0.3.0'
    date: '2026-07-10'
    changes: 'Required exact, fresh and fail-closed operational-access preflight before protected delivery mutations.'
---

# Delivery Flows

This common block is shared by `release.md`, `deploy.md` and `publish.md`.

## Core Rule

Do not infer delivery success from merge success.

`merge` proves source integration. `release`, `deploy` and `publish` prove later delivery gates only when the relevant operation actually ran and evidence was recorded.

## Required Reading

Before executing any delivery operation, read:

- `.memory-bank/project-policy.md`, if present;
- `.memory-bank/spec/operations/*` policies and runbooks;
- `.memory-bank/dd-flow/common/sdlc-contours.md`;
- `.memory-bank/dd-flow/common/changelog.md`;
- `.memory-bank/dd-flow/common/git-ops.md`, if the delivery operation creates or verifies Git commits, tags, branches, merge evidence or push evidence;
- `.memory-bank/dd-flow/common/operational-access.md`, before any protected external mutation;
- `.memory-bank/dd-flow/common/workspace-bootstrap.md`, if delivery will run checkout-based project build, test or package tooling;
- active `.memory-bank/defs/` items and protocol/run handoff reports that affect delivery;
- project-local release/deploy/publish docs, CI config, package manifests and scripts.

If project policy contradicts this canonical fallback, project policy wins unless it is unsafe, impossible or inconsistent with user instructions. Record the conflict and ask or block when it affects the current gate.

## Shared Preflight

Every delivery flow must establish:

- selected operation: `release`, `deploy` or `publish`;
- subject: protocol set, protocol, commit, tag, package, image, app build, static bundle or external artifact;
- source of truth: version file, changelog, branch, tag, registry, provider, runbook or external system;
- allowed agent actions: prepare-only, execute, observe/readback, handoff-only;
- required secrets by variable name only;
- target stage or target destination;
- preflight gates and stop conditions;
- evidence path under the current `RUN-*`;
- Git operation context and trace tag to use for any commit created by the flow, usually `[RUN-XXX/release]`, `[RUN-XXX/deploy]` or `[RUN-XXX/publish]`, unless a specific `PRT-*` is the commit owner;
- rollback, roll-forward, deprecate, revoke or handoff posture.
- exact operational-access profile/binding/rule and safe readback procedure, or a project-policy source proving access is not required.

Never write secret values into Memory Bank, reports, changelog, shell examples or committed config.

Immediately before external mutation, resolve exactly one operation-scoped binding and run its project-owned safe readback. Compare expected and actual identity, authority and target, then evaluate the separately scoped approval. Zero/duplicate/ambiguous/conflicting resolution, missing session, unsafe or failed readback, mismatch, unobservable required authority, missing/stale/revoked/mis-scoped approval, process/context/target drift or expired evidence blocks. A matching login alone is insufficient. Never login, refresh or switch account/team/project/context automatically.

Apply the workspace bootstrap gate only when this delivery stage will run checkout-based project build, test or package tooling. Produce or revalidate the current delivery-stage receipt for that concrete checkout before the first such command and stop on `bootstrap_blocked` or `bootstrap_failed`. Artifact/provider-only release, deploy or publish routes do not invoke this gate solely for remote operations; record the route decision in the delivery report. Do not duplicate the canonical status or invalidation algorithm here.

## Status Vocabulary

Use honest delivery outcomes:

- `prepared`: plan/artifacts are ready, execution did not run;
- `completed`: operation executed and required readback passed;
- `blocked`: current gate cannot continue;
- `failed`: operation ran and failed;
- `partial_failure`: operation partially succeeded and needs recovery or human action;
- `handoff_required`: another operator/system owns the next step;
- `not_applicable`: this flow was selected incorrectly or project policy says the contour does not apply.

Do not use `released`, `deployed` or `published` unless the flow completed the corresponding evidence gates.

## Report Discipline

Delivery flows are stage-report-enabled when the current Memory Bank contains the matching schema and template:

| Flow | Schema | Template |
| --- | --- | --- |
| `release.md` | `dd-flow/release-stage-report@1` | `.memory-bank/dd-flow/stage-reports/release-stage-report-template.html` |
| `deploy.md` | `dd-flow/deploy-stage-report@1` | `.memory-bank/dd-flow/stage-reports/deploy-stage-report-template.html` |
| `publish.md` | `dd-flow/publish-stage-report@1` | `.memory-bank/dd-flow/stage-reports/publish-stage-report-template.html` |

Write `stage-report.json`, `stage-report.html` and `report.md` under the current `RUN-*` stage report folder. Validate JSON with `dd-flow schema validate` before claiming completion, and generate HTML by replacing the template's embedded JSON script with the validated payload.

Every report includes `operational_access` using `dd-flow/operational-access-preflight@1`. A completed protected operation requires `outcome: authorized`; a genuinely local or unauthenticated operation uses policy-backed `outcome: not_required`. Other outcomes cannot produce `completed`.

If a project uses an older Memory Bank without these contracts, write a clear `report.md`, record `stage_report_contract_unavailable`, and do not claim schema-backed report completion.

`dd-flow` records run state/evidence and validates reports. It is not a universal executor for external deploy providers, registries, stores or hosting platforms.

## Partial Failure

Partial failure must be explicit when:

- a version/tag/release object was created but artifact publication failed;
- an artifact was published but readback or consumer smoke failed;
- a deploy reached the provider but post-deploy checks failed;
- a store/review submission was accepted but state is unknown;
- an immutable registry version cannot be overwritten.

For partial failure, record:

- what succeeded;
- what failed or is unknown;
- whether retry is safe;
- idempotency key, tag, version, deployment id or submission id;
- fallback: rollback, roll-forward, deprecate, revoke, unpublish, disable channel, operator handoff or follow-up protocol;
- user approval required before destructive recovery.

## Next Action

Every delivery flow finishes by naming the next correct action:

- no further delivery needed;
- run `release.md`;
- run `deploy.md` to a named runtime stage;
- run `publish.md`;
- ask user for approval/target/version;
- create or continue a protocol for missing runbook/policy work;
- hand off to external operator/system.
