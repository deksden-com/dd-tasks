---
file: '.memory-bank/dd-flow/common/lifecycle-guards.md'
description: 'Common ordered-flow guards for dd-flow prompts.'
purpose: 'Read before plan/code/merge/release/deploy transitions to avoid running a flow before predecessor gates and handoff artifacts are ready.'
version: '0.1.0'
date: '2026-06-23'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - .memory-bank/dd-flow/index.md
  - .memory-bank/dd-flow/flow-contract.json
  - .memory-bank/dd-flow/common/flow-runs.md
  - .memory-bank/dd-flow/common/runtime-cli.md
tags: [dd-flow, lifecycle, guards, protocol, plan, code, merge]
history:
  - version: '0.1.0'
    date: '2026-06-23'
    changes: 'Added fail-closed predecessor checks for plan, code, merge, release and deploy/publish.'
---

# Lifecycle Guards

These guards protect the SDLC pipeline from out-of-order flow execution.

They are semantic guards. CLI state helps, but prompts must also inspect protocol files, stage reports and handoff artifacts. If runtime and files disagree, do not silently pick the optimistic state.

`flow_guidance` from CLI is advisory evidence for these guards. It can name the likely next prompt and missing predecessor evidence, but it does not replace prompt-level review. A `pass` guard from CLI means only that CLI could verify the mechanical condition it knows how to inspect.

## Default Order

```text
protocol created
-> specify completed
-> plan completed / ready_for_code
-> code completed / ready_for_merge
-> merge completed / closed
-> release / deploy / publish only when their policies allow it
```

## Evidence Sources

Check the strongest available evidence:

- `dd-flow protocol status <PRT-ID> --project-root <root> --json`;
- `dd-flow protocol branch-status <PRT-ID> --project-root <root> --json`;
- `dd-flow protocol blockers <PRT-ID> --project-root <root> --json`;
- `dd-flow protocol implement <PRT-ID> --project-root <root> --json`, when continuing an existing protocol;
- `dd-flow protocol transition <PRT-ID> --project-root <root> ... --json`;
- `dd-flow protocol sync-from-run <PRT-ID> --project-root <root> ... --json`;
- `dd-flow protocol ready-for-merge <PRT-ID> --project-root <root> --json`;
- `dd-flow protocol cancel <PRT-ID> --project-root <root> ... --json`;
- `flow_guidance` blocks in status/transition/run/merge command outputs;
- `run-index.json`;
- `01-specify/stage-report.json` when present;
- `02-plan/stage-report.json`;
- `03-code/stage-report.json`;
- `04-merge/stage-report.json`;
- `protocol/<PRT-ID>/summary.md`;
- merge queue status;
- Git branch/commit state.

Runtime state alone is not enough if required filesystem handoff artifacts are missing.

For SDLC work with Git-backed durable changes, terminal `merged/closed` also requires policy/evidence consistency:

- plan or code handoff contains `policy_context` or an explicit legacy/degraded reason;
- actual workspace route matches `policy_context.git.workspace_route` or the deviation is recorded;
- merge/fixation evidence matches `policy_context.git.delivery_strategy`;
- placeholder evidence such as `pending_batch_commit`, `pending_*`, `todo`, `not_yet` or empty commit fields is rejected for `merged`.

## Plan Guard

Before `plan.md` proceeds:

- protocol exists;
- if protocol has `blocked_by_protocols`, blockers are resolved or there is an explicit forced override with reason;
- substantive task input or protocol summary exists;
- non-trivial work has specification or an explicit degraded reason;
- scope sizing does not require a multi-protocol specification;
- active `DEF-*` preflight is considered;
- applicable policy sources are identified: `.memory-bank/project-policy.md`, `spec/operations/*`, verification/scenario/DEF layers or explicit `missing/not_applicable` entries.

Block with:

```text
blocked: plan_requires_protocol_and_specification
current protocol state: <state>
missing: protocol/specification/scope sizing
next safe action: run protocol/specify or create specification slices
```

## Code Guard

Before `code.md` starts implementation:

- if protocol has `blocked_by_protocols`, blockers are resolved and reflected in runtime/frontmatter checks;
- protocol state is `plan`, `implementation`, or a documented compact route allows code;
- full-plan work has `02-plan/stage-report.json` and `stage-report.html`;
- plan verdict is `plan_ready` or `ready_for_code`;
- `handoff.must_read` files exist or missing files have explicit degraded reasons;
- current workspace matches selected Git route;
- planned `policy_context` is available for non-trivial Git/check/delivery work or the plan records an explicit degraded/legacy reason.

Block with:

```text
blocked: code_flow_requires_plan_ready
current protocol state: <state>
missing: plan stage report / ready_for_code transition / workspace
next safe action: run plan flow
```

Do not auto-run plan from code unless project/user policy explicitly allows auto-continuation and no blockers exist.

## Merge Guard

Before `merge.md` or `merge/job.md` integrates work:

- protocol is `ready_for_merge` or an existing merge queue job is claimed;
- code stage report exists for the current run or has explicit legacy/degraded reason;
- readiness verdict allows merge;
- merge-blocking `DEF-*` are closed, non-blocking, or explicitly deferred to a later gate;
- Git status and merge lane lock are safe;
- `policy_context.git.delivery_strategy` or an explicit legacy/degraded route is known;
- `overall.verdict: merged` will have real fixation evidence for that strategy.

Block with:

```text
blocked: merge_requires_ready_for_merge
current protocol state: <state>
missing: code readiness / ready_for_merge / queue job
next safe action: run code readiness
```

For `integration_branch_direct`, merge may be inapplicable as a Git operation, but closure still requires the Git Fixation Gate: commit/push evidence or an honest non-merged status such as `pending_git_fixation` or `local_uncommitted`.

## Release, Deploy And Publish Guards

Release checks version fixation and release set. Deploy/publish checks artifact delivery.

- Do not deploy because changelog/tag exists.
- Do not release because a stage smoke passed.
- Hybrid publish may combine fixation and delivery only if project policy says they are inseparable.

Block with a diagnostic that names the missing release/deploy/publish predecessor and the next safe flow.

## Repair

If runtime state and filesystem evidence disagree:

- inspect `RUN-*` stage reports;
- inspect protocol summary and trace;
- use explicit repair commands such as `dd-flow protocol sync-from-run` only when evidence proves the target state;
- otherwise stop with a blocker.

Never advance lifecycle state because the next requested command would be convenient.

Guard ids used by CLI guidance should match prompt-level ids where possible:

- `protocol_blockers_resolved`;
- `plan_requires_protocol_and_specification`;
- `code_flow_requires_plan_ready`;
- `merge_requires_ready_for_merge`;
- `release_requires_release_set`;
- `deploy_requires_artifact_delivery_policy`;
- `publish_requires_publish_policy`.
