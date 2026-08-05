---
file: '.memory-bank/spec/operations/runbooks/exe-dev-preview.md'
description: 'Exe.dev provider overlay for deploying a private dd-tasks preview.'
purpose: 'Binds an accepted source artifact and the verified workstation SSH identity to a guarded private Exe.dev deployment.'
version: '0.3.0'
date: '2026-08-05'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/operations/index.md'
parent_template: '.memory-bank/mbb/templates/devops-runbook-provider-overlay.md'
operation_type: 'provider-preview-deploy'
applicability_status: 'applicable'
related_specs:
  - .memory-bank/spec/operations/deploy-policy.md
  - .memory-bank/spec/operations/operational-access.md
  - .memory-bank/spec/operations/secrets-policy.md
related_runbooks:
  - .memory-bank/spec/operations/runbooks/preview-runtime.md
related_protocols:
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/index.md
tags: [dd-tasks, runbook, exe-dev, provider, deploy, private]
---

# Exe.dev private preview overlay

## Status and boundary

This is a `deploy.md` input, not a CODE action and not by itself evidence that
a VM or preview exists. Exe.dev login, token refresh and account/team switching
are not deploy shortcuts. VM, proxy/share and lifecycle mutations require the
fresh operation-scoped gate below.

The deploy owner first consumes the accepted source handoff: remote URL,
published `main` SHA, immutable checkpoint tag, exact clean SHA, source
archive/build identity, artifact digest, profile, `run_id` and runbook version.
A fresh preflight is required even when an earlier plan or runbook contains an
observed provider fact.

## Immutable Git checkpoint gate

Provider mutation is blocked until the deploy owner reads back a complete
remote checkpoint. The required order is:

1. verify the stable checkout is clean and post-merge checks passed;
2. push exact `main` to `origin/main` and read back the same commit SHA;
3. create an immutable annotated `checkpoint-NN-<slug>` tag at that SHA, push
   the exact tag and read back its remote target;
4. record the remote URL, branch, tag, commit SHA and artifact digest in the
   deploy handoff;
5. only then transfer/build the source and require `/api/ready` to return the
   recorded SHA and digest.

The Exe.dev operation does not push Git itself. A local-only SHA, mutable
branch label, missing tag or failed remote readback is a hard stop, even when
the local build and provider preflight are otherwise healthy.

## Verified workstation SSH binding

On the current operator workstation, Exe.dev access is bound to this key:

```text
identity_file: ~/.ssh/algo-n2
identities_only: yes
key_type: ED25519
fingerprint: SHA256:0oh9t9ZFItRZKkI00WpwwT9Q3VdOvkxoBQvFPDLL0XM
```

The binding was verified on 2026-08-05 by testing every available candidate
key noninteractively, reading `ssh-key list --json`, and comparing the one
server-side `current` fingerprint with `ssh-keygen -lf ~/.ssh/algo-n2.pub`.
The private key value and account email are not evidence and must never be
recorded. Re-run the fingerprint comparison for every fresh deploy operation;
a missing, non-current or mismatched key blocks mutation.

All lobby and VM commands in this runbook use the explicit option tuple:

```text
ssh -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes \
  -i "$HOME/.ssh/algo-n2" <host> <command>
```

For `scp` and `rsync`, pass the same SSH tuple through `-S` or `-e`. Do not rely
on agent key ordering. An equivalent optional workstation config is:

```text
Host exe.dev *.exe.xyz
  IdentitiesOnly yes
  IdentityFile ~/.ssh/algo-n2
```

The runbook does not mutate `~/.ssh/config`; explicit command options remain
the auditable default.

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

The minimum readback is:

```text
ssh <explicit-options> exe.dev whoami --json
ssh <explicit-options> exe.dev ssh-key list --json
ssh <explicit-options> exe.dev billing plan --json
ssh <explicit-options> exe.dev ls --json
ssh <explicit-options> exe.dev share show <vm> --json   # existing target only
```

Redact email addresses and public-key material from durable evidence. A create
operation also proves that the requested VM name is absent before `new`.

## Create and source transfer

The checkpoint-02 target is `ddtasks-cp02`. Unless a later protocol changes the
resource envelope, create it with the default `exeuntu` image, two CPUs, 4 GB
memory and a 25 GB disk:

```text
ssh <explicit-options> exe.dev new --name=ddtasks-cp02 --cpu=2 \
  --memory=4GB --disk=25GB --comment='dd-tasks checkpoint-02 private preview' --json
```

Exeuntu supports Docker. Transfer an exact clean source tree with `rsync` over
the explicit SSH binding; do not perform Git mutation from the VM and do not
require a provider Git credential. The Git push/tag gate above must already be
complete. Exclude `.git`, `node_modules`, `.scenario-runs`, local environment
files and other generated or secret-bearing paths. Record the accepted remote
source SHA and verify the transferred source manifest before build.

On the VM, use `.memory-bank/spec/operations/runbooks/preview-runtime.md` with
profile `preview-checkpoint`, a fresh run id and port `8000`. Generate the
PostgreSQL and actor passwords on the VM, keep them in a mode-`0600`
operation-scoped environment file, and never print or copy their values into
the flow evidence.

## Private proxy and verification

After the app is healthy on VM loopback port `8000`, explicitly set and read
back the provider proxy:

```text
ssh <explicit-options> exe.dev share port ddtasks-cp02 8000
ssh <explicit-options> exe.dev share set-private ddtasks-cp02
ssh <explicit-options> exe.dev share show ddtasks-cp02 --json
```

The accepted URL is `https://ddtasks-cp02.exe.xyz/`. Success requires all of:

- exact source SHA and artifact digest read back from `/api/ready`;
- exact remote checkpoint tag and commit SHA recorded in the deploy handoff;
- `/api/health` and `/api/ready` passing from the VM;
- the private HTTPS route and an application deep link passing in an
  authenticated browser session;
- live SCN-003 role/isolation checks with operation-scoped actors;
- explicit private-share and port-8000 readback;
- checkpoint retention readback after a controlled restart.

Reviewer access is added only for an explicit reviewer identity and removed in
the same operation. When no reviewer is supplied, record grant/revoke as
`not_required`; do not invent an address. A failed provider or verification
step is `partial_failure` or `failed`, never `accepted_live_provider`.

## Retain, stop and delete

The `preview-checkpoint` default retains only the current accepted VM and
Compose volume, with no background workload beyond the app and PostgreSQL.
Historical or superseded preview volumes are not retained. During a
replacement, the old exact Compose project and volume are removed only after
the new runtime passes health, readiness and live checks; exact absence is
read back afterward. If the replacement fails, the old active runtime remains
and its volume is not removed. Delete the current VM or volume only under a
new explicit destructive authorization, then read back absence by exact name.

## Protected action order

After a fresh approved Git and provider gate, the deploy operation may create
or update only the exact target bound by the preflight, transfer the accepted
artifact, start one app process plus internal PostgreSQL, and read back private
proxy, port, revision, `/api/health` and `/api/ready`. It then runs live SCN-003
with operation-scoped actors, revokes reviewer access, accepts the new runtime,
and removes/readbacks any superseded exact Compose project and volume. A
failed replacement never triggers old-runtime cleanup.

Timeouts and provider errors require target readback before retry. Partial
create/start/transfer outcomes are retired or resumed only under the exact
provider contract. A public share, wrong port, wrong revision, missing cleanup
readback or stale access state is a failed/blocked rollout, never a source
readiness pass.

## Source ledger to revalidate

The deploy ledger revalidated the following official pages on 2026-08-05; the
deploy owner must revalidate them immediately before use:

- [Exe.dev proxy](https://exe.dev/docs/proxy) — HTTPS proxy, private default,
  explicit port and forwarding.
- [Exe.dev sharing](https://exe.dev/docs/sharing) — access/share semantics.
- [Exe.dev CLI new](https://exe.dev/docs/cli-new) — VM creation inputs.
- [Exe.dev SSH key selection](https://exe.dev/docs/faq/ssh-key) — explicit
  `IdentityFile` and `IdentitiesOnly` binding.
- [Exe.dev Docker](https://exe.dev/docs/faq/docker) — Docker support on the
  default `exeuntu` image.
- [Exe.dev VM customization](https://exe.dev/docs/customization) — source
  transfer with SSH, SCP or rsync.

Account identity, current key status, quota, target absence/ownership, private
share state and capacity are still fresh-operation facts and cannot be inferred
from this document.
