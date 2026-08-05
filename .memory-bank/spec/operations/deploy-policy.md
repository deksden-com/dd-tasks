---
file: '.memory-bank/spec/operations/deploy-policy.md'
description: 'Source-to-preview deployment policy for the PRT-004 local and Exe.dev contours.'
purpose: 'Defines the immutable Git checkpoint gate, source handoff and separate provider gate for preview deployment.'
version: '0.2.0'
date: '2026-08-05'
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
local `feature_merge` flow with `deploy_required_next`. A provider deploy may
consume the handoff only after canonical merge, exact `main` push, immutable
checkpoint-tag push and remote readback have all succeeded. CODE itself does
not merge, push, tag, release, publish or create an external resource.

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

The future success state is `accepted_live_provider` only after exact remote
checkpoint and artifact revision, private access, API/browser, reviewer
grant/revoke and current/superseded preview lifecycle readback.
Missing provider identity, authority, target, capacity, approval or current
transport is `blocked/deferred`, not a source defect and not an excuse to
weaken the local proof boundary.

## Immutable Git gate before provider deploy

The deploy operator must stop before provider mutation unless all of these
facts are read back from the same operation:

- stable `main` is clean and post-merge checks passed;
- `origin/main` points to the exact accepted commit SHA;
- an immutable annotated `checkpoint-NN-<slug>` tag points to that same SHA on
  both local and remote Git;
- the handoff records the remote URL, branch, tag, commit SHA, artifact digest,
  profile and `run_id`.

The provider flow does not push Git. It transfers and builds only the accepted
source artifact, and `/api/ready` must match the handoff SHA and digest. A
local-only commit, mutable branch label, missing tag or failed remote readback
is a hard deploy blocker.

## Explicit exclusions

There is no production policy, backup guarantee, CI/CD platform, registry
publication, background worker, autoscaling machinery or control plane in
PRT-004 source CODE. Remote Git publication is a required delivery gate, but
it is performed by the merge/delivery flow before provider deploy, not by CODE
or by the provider VM.
