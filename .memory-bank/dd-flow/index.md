---
file: '.memory-bank/dd-flow/index.md'
description: 'Compact dd-flow catalog for session priming and flow routing.'
purpose: 'Read during prime.md and /go grounding so a fresh agent understands available flows, predecessor gates, outputs and safe next actions.'
version: '0.3.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - .memory-bank/dd-flow/prime.md
  - .memory-bank/dd-flow/common/lifecycle-guards.md
  - .memory-bank/dd-flow/flow-contract.json
  - .memory-bank/dd-flow/common/flow-runs.md
  - .memory-bank/dd-flow/mb-sdlc/plan-aspects/index.md
  - .memory-bank/dd-flow/common/post-flow-protocol-reminder.md
  - .memory-bank/dd-flow/common/operational-access.md
  - .memory-bank/dd-flow/common/semantic-grounding.md
tags: [dd-flow, index, priming, routing, lifecycle]
history:
  - version: '0.1.0'
    date: '2026-06-23'
    changes: 'Created compact flow catalog for priming and ordered flow routing.'
  - version: '0.2.0'
    date: '2026-07-04'
    changes: 'Updated aspect catalog reference to canonical mb-sdlc/plan-aspects path and documented specify design aspects.'
  - version: '0.3.0'
    date: '2026-07-10'
    changes: 'Added operational-access preflight and dedicated discovery/init/upgrade/runtime/review worker prompt family.'
---

# dd-flow Index

This file is the compact flow catalog. `prime.md` reads it so a fresh agent understands what the user means by "run plan flow", "start code flow", "merge" and similar commands.

It is not a replacement for individual prompts. When a flow starts, read the specific prompt and its required common blocks.

## Core Entities

- `PRT-*` protocol: executable SDLC document for one deliverable slice.
- `PSET-*` protocol set: coordination record for several executable member protocols under `.memory-bank/protocol/_set/`; dependencies live in each member `blocked_by_protocols`.
- `RUN-*` run: concrete flow execution envelope with stage workspaces and stage reports.
- `mb-sdlc`: ordinary protocol SDLC flow; machine value `mb_sdlc`.
- `stage report`: data-driven JSON + HTML report for a completed stage.
- `mb-sdlc-review`: project-level review flow; machine value `mb-sdlc-review`.
- `task_profile` / `flow_profile`: route, impact, verification, evidence and execution decisions.
- `SCN-*` / `XE-*`: executable acceptance scenario contracts.
- `DEF-*`: named deferral for a known gap that cannot be closed now.
- `verification passport`: durable proof summary accepted by a protocol, scenario or matrix.
- `semantic spine`: compact selected context that links a meaningful task to user outcome, responsibility, constraints, non-goals and the evidence level it can honestly claim.
- `plan aspect catalog`: canonical `.memory-bank/dd-flow/mb-sdlc/plan-aspects/index.md` source for named plan/readiness review aspects and applicability/coverage-mode semantics.
- `specify design aspects`: `.memory-bank/dd-flow/mb-sdlc/specify/design-aspects/index.md` checklist for CLI, AI pipeline/model prompt, UI and future task-shape defaults during `specify`.
- `post-flow protocol reminder`: shared rule for returning from completed `code`/`merge` to free discussion while routing any new "оформи протокол" request through `protocol.md`.

## Ordinary Development Flow

| User intent | Entry prompt | Predecessor gate | Output / next safe action |
| --- | --- | --- | --- |
| Prime a fresh session | `prime.md` | Memory Bank exists or degraded reason | Session is `primed`; no protocol is created. |
| Turn discussion into work | `protocol.md` | User has substantive task input | `PRT-*` exists and logical stage enters `specify`. |
| Continue existing protocol | `protocol-implement.md` | Existing non-terminal `PRT-*` is selected | Frontmatter/runtime/blocker preflight, then `specify`, `plan`, `code`, `merge`, `blocked` or `waiting_for_user`. |
| Specify task | `common/specification.md` via `protocol.md` or `/go` | Protocol exists, task is not purely interactive | Problem-space specification, questions, task profile. |
| Plan protocol | `plan.md` -> `mb-sdlc/plan/*` | Protocol exists, specify is complete or explicit degraded reason | `02-plan/stage-report.*`, `ready_for_code` handoff. |
| Implement protocol | `code.md` -> `mb-sdlc/code/implement.md` | Plan is `ready_for_code` or compact route explicitly allows code | Implementation, checks, readiness, `ready_for_merge` or blocker. |
| Re-run readiness only | `code.md` -> `mb-sdlc/code/readiness.md` | Code exists and readiness was interrupted or must be repeated | Updated code stage report and readiness verdict. |
| Merge ready work | `merge.md` or `merge-start.md` | Protocol is `ready_for_merge` or queued for merge | Integration stage report and closed protocol. |
| Review project conformance | `review.md` -> `mb-sdlc/review.md` | User explicitly asks for project/protocol/feature/subsystem/diff review | `mb-sdlc-review` RUN with aspect reports, critic pass, JSON/HTML review report and optional `review-fix`. |
| Turn review findings into work | `review-fix.md` -> `mb-sdlc/review-fix.md` | Accepted `mb-sdlc-review` findings exist and user wants repair planning | Ordinary executable protocol(s) or `PSET-*`, then normal `mb-sdlc`. |

## Interactive Flow

| User intent | Entry prompt | Predecessor gate | Output / next safe action |
| --- | --- | --- | --- |
| Start fast interactive work | `interactive.md` | User chooses interactive mode and Git contour is safe | Protocol enters `interactive`; session records rationale and changes. |
| Finish interactive work | `finish.md` | Interactive work has accumulated changes | Consolidation, hardening, readiness, then standard merge route. |

Interactive mode is still protocol-based. It does not create multiple child protocols during the session. Its final hardening must account for the whole accumulated diff.

## Delivery Flows

| User intent | Entry prompt | Predecessor gate | Output / next safe action |
| --- | --- | --- | --- |
| Release canon/project version | `release.md` when present, otherwise project release policy | Completed protocol set and changelog/release policy | Version fixation, release notes, tag or explicit blocker. |
| Deploy artifacts | `deploy.md` when present, otherwise operations runbook | Release/artifact exists or hybrid policy says inseparable | Delivery evidence for a target environment. |
| Publish package/artifact | `publish.md` when present, otherwise operations runbook | Package/release policy allows publish | Registry/static/store evidence and rollback/undo notes. |

Release fixation and deploy/publish delivery are different gates unless project policy explicitly says they are inseparable.

Delivery prompts must read [common/delivery-flows.md](common/delivery-flows.md). They are evidence orchestration prompts, not universal platform executors. Platform-specific commands, approvals, credentials and rollback procedures stay in project runbooks and `spec/operations/*`.

Before any protected external mutation, the owning flow also reads [common/operational-access.md](common/operational-access.md), resolves one exact operation-scoped binding and requires fresh identity, authority, target and approval evidence. Workers never login, switch context or execute the protected mutation.

## Memory Bank Flows

| User intent | Entry prompt | Predecessor gate | Output / next safe action |
| --- | --- | --- | --- |
| Create Memory Bank | `mb-init.md` | Target project has no usable Memory Bank | Canonical Memory Bank, initial specs/scenarios/evidence where supported. |
| Upgrade Memory Bank | `mb-upgrade.md` | Target project has older Memory Bank | Upgraded layout, path migration, lint verification, mandatory `05-review`, `06-merge` and DEFs. |
| Audit Memory Bank | `mb-audit.md` | Memory Bank exists | Findings and `DEF-*`/repair plan. |
| Fix audit DEFs | `mb-fix.md` | User selected actionable DEFs | Updated Memory Bank and verification. |
| Distill practices into canon | `mb-distill.md` | Target project has candidate practices | Read-only report and candidate canon improvements. |

Canonical-only flows must resolve the canon root via `DD_MEMORYBANK`/`dd-flow canon resolve` where possible.

## Worker And Repair Prompts

- `common/subagents.md`: orchestrator-only delegation, downgrade and report-acceptance guidance.
- `common/worker-session.md`: worker-facing primer for fresh/forked context, light project priming, task grounding and source-backed reports.
- `workers/code.md`: bounded implementation task.
- `workers/verify.md`: independent verification of diff, evidence, scenario, `DEF-*` or quality.
- `workers/docs.md`: documentation and Memory Bank updates.
- `workers/repair.md`: validation-driven repair of invalid model output.
- `workers/operational-access-discovery.md`: read-only inventory of external authorization requirements.
- `workers/operational-access-init-policy.md`: source-backed initial policy materialization.
- `workers/operational-access-upgrade-reconciliation.md`: preservation-first policy reconciliation.
- `workers/operational-access-runtime-preflight.md`: safe readback and fail-closed runtime verdict.
- `workers/operational-access-review.md`: coverage, reference integrity and separation review.
- `def/plan.md` and `def/fix.md`: internal DEF planning and fixing prompts.
- `review.md` and `review-fix.md`: project-level conformance review and accepted-finding repair routing.

## Ordered Guard Summary

Use [common/lifecycle-guards.md](common/lifecycle-guards.md) before moving between major stages.

Default order:

```text
protocol -> specify -> plan -> code/readiness -> ready_for_merge -> merge -> closed
```

Fail closed if the requested flow is out of order. Give the user the current state, missing predecessor evidence and the next safe action.
