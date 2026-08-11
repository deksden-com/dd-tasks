---
file: '.memory-bank/dd-flow/publish.md'
description: 'Top-level flow prompt for combined release fixation and artifact publication.'
purpose: 'Use when project policy treats release and delivery as coupled, such as package publish, registry push, store submission or static publication.'
version: '0.3.0'
date: '2026-07-10'
status: 'DRAFT'
c4_level: 'flow-entrypoint'
parent: '.memory-bank/dd-flow/index.md'
related_files:
  - .memory-bank/dd-flow/common/delivery-flows.md
  - .memory-bank/dd-flow/common/changelog.md
  - .memory-bank/dd-flow/common/sdlc-contours.md
  - .memory-bank/dd-flow/common/git-ops.md
  - .memory-bank/dd-flow/common/operational-access.md
  - .memory-bank/dd-flow/schemas/publish-stage-report.schema.json
  - .memory-bank/dd-flow/stage-reports/publish-stage-report-template.html
tags: [dd-flow, publish, package-registry, store, static-site, partial-failure]
history:
  - version: '0.1.0'
    date: '2026-07-07'
    changes: 'Added first-class publish flow prompt.'
  - version: '0.2.0'
    date: '2026-07-07'
    changes: 'Added publish stage-report schema/template requirements.'
  - version: '0.3.0'
    date: '2026-07-10'
    changes: 'Added fail-closed registry/store identity-target and approval preflight.'
---

# Publish Flow

Use this prompt when release fixation and artifact delivery are coupled by project policy or ecosystem constraints.

Read `.memory-bank/dd-flow/common/delivery-flows.md` first.

## Scope

Publish is:

```text
publish = release fixation + artifact delivery to publication target + publish-specific gates
```

Examples:

- npm/PyPI/crates/NuGet/Maven package publish;
- Docker/OCI image push when the publish target is the registry;
- app or extension store submission;
- static docs/site publication only when project policy treats public publication as release+delivery.

Vercel/Netlify/Render/Fly/Railway/Cloudflare Pages app hosting is deploy by default, not publish, unless project policy explicitly says otherwise.

## Preflight

1. Confirm why `publish.md` is correct instead of separate `release.md` then `deploy.md`.
2. Identify `publish_target`/`delivery_target`, channel/dist-tag/store/review target and source artifact.
3. Build or accept release set and version decision.
4. Read publish runbook, changelog policy, token policy, active DEFs and compatibility matrix.
5. Confirm token/secret handling using environment variable names only.
6. Check dry-run/package inspection support and whether publication is immutable.
7. Ask for approval when policy requires it or when failure could create an unrecoverable public artifact.
8. Resolve one exact registry/store/target binding, execute only its safe readback and require fresh identity, authority, target and scoped approval verdicts before publish.

## Execution

Follow the project publish runbook:

- update release/changelog/version targets when allowed;
- build/package artifact;
- run dry-run or package inspection when available;
- execute publish/submission command or external handoff;
- read back registry/store/site/channel state;
- run consumer smoke or install/readback when applicable;
- record fallback: deprecate, revoke, unpublish, rollback, roll-forward, disable channel or operator handoff.

## Partial Failure

Treat partial success as first-class:

- version/tag created but publish failed;
- package/image published but metadata/readback failed;
- store submission accepted but state unknown;
- static publication live but smoke failed;
- consumer install/readback failed after registry accepted artifact.

Report what is immutable, what can be retried, and what requires user/operator action.

## Output

Write publish evidence:

- release set and version;
- publish target/channel;
- artifact identity;
- dry-run/package inspection;
- publish execution;
- readback and consumer smoke;
- partial-failure/retry/idempotency notes;
- next action.

Do not call the result published until target readback and required consumer checks pass.

When `dd-flow/publish-stage-report@1` is available, write and validate `stage-report.json`, generate `stage-report.html` from `.memory-bank/dd-flow/stage-reports/publish-stage-report-template.html`, and keep `report.md` as the concise human narrative. A completed publish report must include release/version evidence, publish target, artifact, authorized `operational_access`, publish execution, target readback and required consumer smoke.
