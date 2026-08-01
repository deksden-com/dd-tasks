# SDLC contours

This common block defines the delivery contours that dd-flow prompts must keep separate.

Read it when a task touches Git policy, environments, release/versioning, deployment, publishing, verification gates, Memory Bank operations, or project workflow rules.

## Core rule

Do not collapse all delivery work into "merge" or "done".

## Policy context handoff

Every non-trivial SDLC run must carry a compact `policy_context` handoff from `specify/plan` into `code/readiness/merge`.

`policy_context` is not a new source of truth. It is a stage-local snapshot of the project policy facts that affect routing, checks, evidence and delivery for the current protocol. Durable ownership remains in:

- `.memory-bank/project-policy.md` as the top-level policy hub;
- `.memory-bank/spec/operations/*` for detailed Git, release, deploy, publish, rollback, environment and runbook policy;
- project verification, scenario, seed/eval, engineering and DEF layers for their respective rules;
- MBB/common files only as fallback vocabulary when a project-local owner is absent.

Minimum shape:

```yaml
policy_context:
  sources:
    project_policy: .memory-bank/project-policy.md | missing
    operations: []
    engineering: []
    verification: []
    scenarios: []
    defs: []
  git:
    preset:
    integration_branch:
    production_branch:
    workspace_route: integration_branch_direct | feature_worktree
    delivery_strategy:
    fixation_required:
    result_evidence_required: []
    push_required:
    pr_required:
    clean_worktree_required_for_closure:
  checks:
    local_profile:
    ci_profile:
    stage_profiles: []
  delivery:
    current_gate:
    runtime_stages: []
    deploy_providers: []
    deploy_targets: []
    delivery_targets: []
    publish_targets: []
    release_required_next:
    deploy_required_next:
    publish_required_next:
    next_prompt_or_runbook:
  gaps:
    questions: []
    blockers: []
    defs: []
```

Stage responsibilities:

- `prime` discovers whether the policy hub and operational owners exist.
- `specify` records policy sources and asks user-level questions only when a policy gap affects accepted behavior or delivery gates.
- `plan` creates the applied `policy_context` and records route/fixation decisions.
- `code/readiness` verifies actual work against the planned `policy_context`.
- `merge` enforces the Git delivery/fixation strategy before terminal closure.

Use these contours:

- Git policy: source movement, branches, worktrees, pull requests, merge queue, cleanup, post-merge checkout.
- Environment/stage policy: where a running system lives: `local`, `dev`, `preview`, `qa`, `beta`, `staging`, `prod`, or a project-specific runtime stage.
- Release policy: version and change-set fixation: version map, changelog, tags, release notes, artifacts, included protocols/features/issues.
- Deploy policy: delivery of an artifact to a runtime stage through a deploy provider/target: trigger, commands, CI/CD, pre-deploy gates, post-deploy checks, rollback or roll-forward.
- Publish policy: hybrid operation where release fixation and artifact delivery cannot be cleanly separated, such as npm publish, container registry push, app/extension store submission, or static site publication when the project explicitly treats it as release+publication.
- Verification policy: what proves the result, on which stage, through which contour, with what evidence and blocking status.
- Check profiles: project-level named sets of hygiene checks and manual/automated verification rules that define what "green" means for a stage.
- Runbooks: exact operator instructions. Policy says what rules apply; runbook says how to execute an operation.
- Project policy hub: top-level `.memory-bank/project-policy.md` summary of flow-affecting project defaults, links, check profiles and policy gaps.

`release.md`, `deploy.md`, and `publish.md` are top-level delivery prompts when present in the project flow pack. They are separate from the ordinary `mb-sdlc` source-integration flow. Existing `plan/code/merge` must still reason about the contours above and must route to delivery prompts only when the current gate requires them.

## Flow vs contour

Top-level flow prompts execute operations. Contours are policy/evidence aspects that apply inside flows.

- `release.md` executes a release operation; `release contour` says what version/change-set evidence applies.
- `deploy.md` executes a deploy operation; `deploy contour` says what runtime stage/provider/target and checks apply.
- `publish.md` executes a composite operation:

```text
publish = release fixation + artifact delivery to publication target + publish-specific gates
```

Use `runtime_stage` for runnable stages. Use `deploy_provider` for hosting/execution platforms such as Vercel, Netlify, Render, Fly, Railway, Cloudflare Pages, Kubernetes or ECS. Use `deploy_target` for the concrete provider project, environment, deployment URL or deployment id.

Use `delivery_target` for artifact destinations that are not runtime stages, such as package registries, container registries, app stores, extension stores and static publication targets. Use `publish_target` when that delivery participates in a publish flow.

Default examples:

- Vercel Preview/Production is deploy to `runtime_stage: preview|production`.
- npm publish is publish to `publish_target: package-registry`.
- Docker/OCI image push is publish to `publish_target: container-registry`; deploying that image to Kubernetes/ECS is a separate deploy contour unless policy couples them.
- App or extension store submission is publish to a store/review target.
- Static docs/site hosting is deploy by default; classify as publish only when project policy treats public publication as inseparable from release.

## Status taxonomy

Use separate status fields when reporting SDLC analysis. Do not overload one word such as `done`.

- `applicability_status`: whether a contour applies to the current task.
  - `applicable`
  - `not_applicable`
  - `unknown`
- `verification_state`: whether evidence exists for the current gate.
  - `not_checked`
  - `checked_passed`
  - `checked_failed`
  - `blocked`
  - `deferred`
- `closure_state`: what can honestly be claimed after this stage.
  - `accepted_local`
  - `ready_for_merge`
  - `merged`
  - `released`
  - `deployed`
  - `published`
  - `implemented_with_named_deferrals`
  - `blocked`
- `gate_status`: whether the current gate may pass.
  - `pass`
  - `warn`
  - `block`
  - `not_applicable`

`not_applicable` requires a traceable reason. It is not a quiet omission. Meaningful unknowns become a question, `BLOCK-*`, or `DEF-*` according to the gate they affect.

## Git delivery and fixation strategy

`route.git` answers where work happens. `policy_context.git.delivery_strategy` answers how the result becomes durable or is honestly handed off.

Initial strategy vocabulary:

- `direct_commit` - work happens on the integration branch and closure requires a real local commit SHA.
- `direct_commit_push` - direct integration also requires push/remote evidence.
- `feature_merge` - a feature branch/worktree is merged into the target branch locally.
- `pull_request` - a PR is the delivery gate; closure requires PR state/evidence, not just a local branch.
- `merge_queue` - queue ownership and completion are the delivery gate.
- `squash_merge` - closure evidence is the squash/result commit on the target branch.
- `rebase_ff` - closure evidence is fast-forward reachability from target branch.
- `release_branch` - integration targets a release branch and later release gates remain explicit.
- `external_handoff` - another system/operator owns delivery; closure must say handoff, not merged.
- `local_only` - current gate accepts local/uncommitted or local-only evidence and must not use `merged`.
- `no_git` - project has no Git-backed fixation gate.

For Git-backed tracked changes, `overall.verdict: merged` requires valid evidence for the selected strategy. Placeholder evidence is invalid:

- `pending_batch_commit`;
- `pending_*`;
- `todo`;
- `not_yet`;
- empty commit fields;
- worktree-only dirty state reported as merged;
- PR/queue handoff reported as merged before target branch evidence exists.

Honest alternatives are `pending_git_fixation`, `branch_ready_handoff`, `local_uncommitted`, `queued_or_waiting`, `blocked`, or a project-specific status that clearly does not claim merge completion.

## BLOCK vs DEF

Use `BLOCK-*` when the current gate cannot honestly continue.

Use `DEF-*` when a meaningful unresolved issue is allowed to move past the current gate but must be visible at a later named gate. A DEF must say:

- what is unresolved;
- why it was not closed now;
- what it blocks and what it does not block;
- the next gate where it must be closed or re-decided;
- whether a user decision, access, secret, environment, or follow-up protocol is required.

Manual verification may be deferred only through a named DEF. A user-selected `SKIP` is not a pass. The DEF should include:

```yaml
verification_deferral:
  scenario:
  skipped_by:
  reason:
  required_environment:
  next_gate:
  blocks:
  does_not_block:
  user_confirmation:
```

Use `not_applicable` when the contour truly does not apply, with a reason.

## Plan requirements

During `plan`, include SDLC contours only when they influence the task. Avoid operational noise for a pure local documentation or code cleanup task.

If the task changes Git, CI, release, deploy, staging, environments, package publishing, verification gates, scenario evidence, rollout, rollback, or runbooks:

- include the relevant contours in aspect coverage;
- identify the current project policy and runbook sources;
- check `.memory-bank/project-policy.md`, if present, and keep it linked to detailed policy owners;
- assemble `policy_context` with source links, route, delivery/fixation strategy, check profile and explicit gaps;
- add a Policy Migration Block when existing project policy changes;
- state the verification stage and evidence contour for each acceptance scenario;
- create questions, blockers, or DEF entries for meaningful unknowns.

For every acceptance scenario, state whether verification is automated or manual, and on which stage/check profile it runs. If a manual check can be skipped, define the DEF gate where it must be revisited.

The plan report must show all applicable aspects even when a grouped subagent covered several of them.

## Code requirements

During `code`, implement the accepted plan without silently changing the delivery route.

For each changed contour:

- compare actual branch/workspace/check behavior against the planned `policy_context`;
- update durable Memory Bank docs or explain why no durable fact changed;
- keep policy and runbook separate;
- verify each required gate or create a named deferral with next gate;
- cite the check profile used for claims like "branch is green" or "ready for merge";
- record evidence in the code stage report;
- do not claim beta, production, release, deploy, or publish readiness from local checks alone.

## Merge requirements

During `merge`, run the Delivery Decision Gate before closing the stage.

Before `overall.verdict: merged`, also run the Git Fixation Gate:

- read planned `policy_context.git.workspace_route` and `policy_context.git.delivery_strategy`;
- verify required evidence for that strategy;
- reject placeholder commits such as `pending_batch_commit`;
- for `integration_branch_direct`, require a real commit SHA if tracked durable files changed unless strategy is explicitly `local_only`;
- for feature/PR/queue strategies, verify target branch/PR/queue evidence rather than only branch readiness;
- if evidence is absent, report an honest non-merged status and next action.

The merge report must say one of:

- `delivery_complete_for_current_gate`: source integration completed and no further delivery was in scope;
- `queued_or_waiting`: long-lived worker or queue owns the merge and this invocation is status-only;
- `release_required_next`: integration completed, but a release flow is the next correct step;
- `deploy_required_next`: integration completed, but deployment to a stage is the next correct step;
- `publish_required_next`: release and delivery are inseparable and a publish flow is the next correct step;
- `blocked`: current gate cannot pass.

The decision must include the next prompt or operator action.

## Memory-flow requirements

`mb-init`, `mb-upgrade`, `mb-audit`, and `mb-distill` must extract and preserve the split between:

- git policy;
- environment/stage policy;
- release policy;
- deploy/publish policy;
- verification policy;
- project check profiles and stage-specific check commands/procedures;
- runbooks;
- top-level project-policy hub visibility and known policy gaps;
- active DEF/BLOCK items.

If a meaningful contour is absent, decide whether it is:

- not applicable for the project now;
- an unknown that requires a user question;
- a blocker for the current flow;
- a DEF for a future gate.

Do not create DEF files for every absent policy in a tiny project. Create them when the absence affects active documents, gates, or future agent work.

`mb-init`, `mb-upgrade` and `mb-audit` must explicitly assess the checks contour. They should discover check commands from package scripts, CI config, docs, runbooks and user answers; classify each by stage; and create questions/BLOCK/DEF only when the missing definition affects active gates.
