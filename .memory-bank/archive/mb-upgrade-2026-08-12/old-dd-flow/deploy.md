---
file: '.memory-bank/dd-flow/deploy.md'
description: 'Top-level flow prompt for deploying an artifact to a runtime stage.'
purpose: 'Use when the user asks to deploy a commit, tag, package, image, app build or static bundle to a runtime stage.'
version: '0.3.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'flow-entrypoint'
parent: '.memory-bank/dd-flow/index.md'
related_files:
  - .memory-bank/dd-flow/common/delivery-flows.md
  - .memory-bank/dd-flow/common/sdlc-contours.md
  - .memory-bank/dd-flow/common/git-ops.md
  - .memory-bank/dd-flow/common/operational-access.md
  - .memory-bank/dd-flow/schemas/deploy-stage-report.schema.json
  - .memory-bank/dd-flow/stage-reports/deploy-stage-report-template.html
tags: [dd-flow, deploy, runtime-stage, environment, rollback]
history:
  - version: '0.1.0'
    date: '2026-07-07'
    changes: 'Added first-class deploy flow prompt.'
  - version: '0.2.0'
    date: '2026-07-07'
    changes: 'Added deploy stage-report schema/template requirements.'
  - version: '0.3.0'
    date: '2026-07-10'
    changes: 'Added exact identity-authority-target-approval preflight before deploy mutation.'
---

# Deploy Flow

Use this prompt when the user asks to deploy an artifact to `local`, `dev`, `preview`, `qa`, `beta`, `staging`, `production` or a project-specific runtime stage.

Read `.memory-bank/dd-flow/common/delivery-flows.md` first.

## Scope

Deploy answers:

```text
Which artifact was delivered to which runtime stage, by which procedure, and how was the deployed result verified?
```

Deploy consumes a source artifact. It does not invent a release set or version. If no release/artifact exists and project policy requires one, route to `release.md` or ask the user.

## Preflight

1. Identify `runtime_stage`, `deploy_provider` and concrete `deploy_target`.
2. Identify source artifact: commit, tag, package, image, app build, static bundle or external artifact id.
3. Read deploy policy, environment policy, runbook, verification policy, active DEFs and prior release evidence.
4. Resolve exactly one operation-scoped access binding for provider, host, target and runtime stage.
5. Run only the binding's safe read-only/noninteractive readback and compare expected identity, authority and target; then verify separately scoped approval and freshness.
6. Check credentials by variable name only; never reveal values.
7. Run pre-deploy gates:
   - previous stage/release evidence;
   - backup or migration posture;
   - feature flags and config;
   - freeze window/approval;
   - dependency and secret availability.

If stage, artifact, credential boundary, binding, identity, authority, target, approval, freshness, destructive operation or rollback posture is unclear, block or ask. Do not improvise production deployment, login or switch provider context.

## Execution

Follow the project runbook or explicit user instruction:

- execute documented deploy command or CI/CD trigger;
- record deployment id, URL, provider project/environment and commit/artifact;
- run post-deploy checks: health, smoke, browser/e2e, read-only production check, logs/metrics or scenario-specific acceptance;
- record rollback or roll-forward status.

## Output

Write deploy evidence:

- target stage/provider/target;
- source artifact;
- command/trigger used;
- pre-deploy gates;
- post-deploy verification;
- deployment id/domain/alias;
- rollback/roll-forward notes;
- next stage or closure.

If deploy reached provider but checks failed, report `partial_failure` or `failed`; do not call it deployed.

Write the deployment semantics to `@stage/stage-input.json`.
`dd-flow stage finish` validates that input and generates the generic
`stage-report.json`, `stage-report.md`, `stage-report.html` and protocol
summary. Deployment-specific fields remain semantic data; the CLI owns paths,
timestamps, Git facts and rendering. A completed deploy input must include
runtime stage, deploy provider, concrete target, source artifact, authorized
`operational_access`, execution evidence and post-deploy verification evidence.
