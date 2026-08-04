---
file: '.memory-bank/spec/operations/check-profiles.md'
description: 'Canonical local, built-package and SCN-003 check profiles for PRT-004.'
purpose: 'Keeps command names, setup, evidence and proof limits aligned across source, container and later provider checks.'
version: '0.1.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/operations/index.md'
related_specs:
  - .memory-bank/spec/system/index.md
  - .memory-bank/spec/engineering/index.md
related_runbooks:
  - .memory-bank/spec/operations/runbooks/preview-runtime.md
related_protocols:
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/index.md
tags: [dd-tasks, operations, checks, evidence, SCN-003]
---

# Check profiles

## Broad source profile

`pnpm quality` remains the existing source gate: format, lint, types, unit,
integration and build plus the value-absence scan. It proves source consistency
only. It does not prove that the built container starts, that a preview port is
private, or that Exe.dev can run the artifact.

`pnpm docs:check` validates required Memory Bank paths/frontmatter and durable
references. `pnpm db:check -- --profile <profile>` is a non-mutating ledger and
schema readback. The mutating commands are explicit:

```text
pnpm db:migrate -- --profile local --run-id <run-id>
pnpm db:reset -- --profile local --run-id <run-id> --world-id <world-id>
pnpm db:seed -- --profile local --run-id <run-id> --world-id <world-id>
```

`--target` remains a compatibility alias for local/test callers. Preview
commands additionally require the exact profile/world/compose/volume binding.

## Built source-package profile

`pnpm preview:smoke -- --profile preview-checkpoint --run-id <run-id>` builds
one immutable image, starts PostgreSQL and the app, runs guarded migrate and
explicit reset/seed, waits for `/api/ready`, performs API and browser smoke,
then records the exact compose project and cleanup readback. The final command
is `pnpm scenario:preview` with the same binding; it emits separate
built-integration and SCN-003 source claims from one identical execution only
when SHA, artifact digest, profile and world all match.

The browser runner uses the managed HTTP base URL and never `file://`. It
records role labels and safe response shapes, not cookies, passwords, email
values or raw authenticated payloads.

## Later live profile

The future Exe.dev runbook owns fresh provider preflight and live SCN-003. Its
row stays `pending` until exact provider identity, private access, revision,
API/browser, reviewer access and cleanup readback exist. Source-package green
does not promote a live row.

## Evidence vocabulary

Each source run has one exact clean commit, artifact digest, profile, world,
start/end time, phase exit statuses, expected/observed revision, negative
authorization result, data safety result, restart or cleanup result, redacted
artifact list, blockers/DEFs and an explicit `does_not_prove` list. The durable
passport belongs under the protocol evidence directory; RUN-local raw output is
an input to that passport and not a substitute for it.
