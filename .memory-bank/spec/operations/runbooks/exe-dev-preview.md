---
file: '.memory-bank/spec/operations/runbooks/exe-dev-preview.md'
description: 'Future Exe.dev overlay for a private dd-tasks preview, intentionally not executed by CODE.'
purpose: 'Binds the accepted source artifact to a fresh non-mutating provider preflight and later live SCN-003 gate.'
version: '0.1.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/operations/index.md'
parent_template: '.memory-bank/mbb/templates/devops-runbook-provider-overlay.md'
operation_type: 'provider-preview-deploy'
applicability_status: 'deferred'
related_specs:
  - .memory-bank/spec/operations/deploy-policy.md
  - .memory-bank/spec/operations/operational-access.md
  - .memory-bank/spec/operations/secrets-policy.md
related_runbooks:
  - .memory-bank/spec/operations/runbooks/preview-runtime.md
related_protocols:
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/index.md
tags: [dd-tasks, runbook, exe-dev, provider, deferred, private]
---

# Exe.dev private preview overlay

## Status and boundary

This is a future `deploy.md` input, not a CODE action and not evidence that a
VM or preview currently exists. No Exe.dev login, token refresh, team switch,
VM creation, share mutation or deletion is performed by PRT-004 source CODE.

The deploy owner first consumes the accepted source handoff: exact clean SHA,
source archive/build identity, artifact digest, profile, `run_id` and runbook
version. A fresh preflight is required even when an earlier plan or runbook
contains an observed provider fact.

## Read-only preflight

Using the current official Exe.dev documentation and the separately supplied
operation-scoped access context, read back exactly one:

1. identity and authority for the selected account/team;
2. supported source transport or artifact transfer for this run;
3. VM target ownership, lifecycle, resource/capacity and external port;
4. proxy/private/share state and reviewer access semantics;
5. approval, timeout, retry and cleanup capability.

Record `verified`, `mismatch`, `not_observable` or `not_required`, with source
URLs, observation time, target/run id and redaction status. Login, refresh,
context switching, inferred target selection and public-share fallback are
not preflight shortcuts. Any mismatch or non-observable protected field blocks
before mutation.

## Protected action order

After a fresh approved gate, the future deploy operation may create or update
only the exact target bound by the preflight, transfer the accepted artifact,
start one app process plus internal PostgreSQL, and read back private proxy,
port, revision, `/api/health` and `/api/ready`. It then runs live SCN-003 with
operation-scoped actors, revokes reviewer access, and proves retain/delete
readback for the chosen checkpoint/eval lifecycle.

Timeouts and provider errors require target readback before retry. Partial
create/start/transfer outcomes are retired or resumed only under the exact
provider contract. A public share, wrong port, wrong revision, missing cleanup
readback or stale access state is a failed/blocked rollout, never a source
readiness pass.

## Source ledger to revalidate

The planning ledger observed the following official pages on 2026-08-04; the
deploy owner must revalidate them immediately before use:

- [Exe.dev proxy](https://exe.dev/docs/proxy) — HTTPS proxy, private default,
  explicit port and forwarding.
- [Exe.dev sharing](https://exe.dev/docs/sharing) — access/share semantics.
- [Exe.dev CLI new](https://exe.dev/docs/cli-new) — VM creation inputs.

The overlay intentionally leaves the account, team, VM, quotas, transport,
secret source and capacity unset until that future authorized gate.
