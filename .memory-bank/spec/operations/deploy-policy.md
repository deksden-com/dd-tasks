---
file: '.memory-bank/spec/operations/deploy-policy.md'
description: 'Source-to-preview deployment policy for the PRT-004 local and Exe.dev contours.'
purpose: 'Defines the non-mutating source handoff and the separate future provider gate without claiming deployment.'
version: '0.1.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/operations/index.md'
related_specs:
  - .memory-bank/spec/operations/preview-stages.md
  - .memory-bank/spec/operations/operational-access.md
related_runbooks:
  - .memory-bank/spec/operations/runbooks/preview-runtime.md
  - .memory-bank/spec/operations/runbooks/exe-dev-preview.md
related_protocols:
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/index.md
tags: [dd-tasks, operations, deploy, source-merge, exe-dev]
---

# Deploy policy

## Current source delivery

CODE produces a clean feature HEAD, a reproducible source-package artifact and
an evidence passport. Readiness hands that exact identity to the separate
local `feature_merge` flow with `deploy_required_next`. This session does not
merge, push, tag, release, publish or create an external resource.

The source artifact is a built Hono process plus Vite assets and internal
PostgreSQL composition. A branch name, `latest` label, mutable source archive
or runtime-overridable revision is not artifact evidence. The image/build
metadata and proof manifest bind the clean SHA to the observed digest.

## Future Exe.dev delivery

Only a separately authorized `deploy.md` may consume the source handoff. It
must revalidate the current official Exe.dev transport, CLI, VM lifecycle,
private proxy/share, port, capacity and cleanup semantics immediately before
mutation. The operation has one exact target and one run id; no provider adapter
or alternate public hosting path is introduced in source CODE.

The future success state is `accepted_live_provider` only after exact revision,
private access, API/browser, reviewer grant/revoke and retain/delete readback.
Missing provider identity, authority, target, capacity, approval or current
transport is `blocked/deferred`, not a source defect and not an excuse to
weaken the local proof boundary.

## Explicit exclusions

There is no production policy, backup guarantee, CI/CD platform, registry
publication, background worker, autoscaling machinery, control plane or remote
Git mutation in PRT-004 source CODE.
