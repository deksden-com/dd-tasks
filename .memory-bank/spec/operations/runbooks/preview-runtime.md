---
file: '.memory-bank/spec/operations/runbooks/preview-runtime.md'
description: 'Base runbook for the one-port built dd-tasks private preview composition.'
purpose: 'Provides exact, guarded local/source-package lifecycle commands and evidence boundaries.'
version: '0.1.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/operations/index.md'
parent_template: '.memory-bank/mbb/templates/devops-runbook-base.md'
operation_type: 'preview-runtime'
applicability_status: 'applicable'
related_specs:
  - .memory-bank/spec/operations/preview-stages.md
  - .memory-bank/spec/operations/check-profiles.md
  - .memory-bank/spec/operations/secrets-policy.md
related_protocols:
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/index.md
evidence_files:
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/evidence/verification-passport.md
tags: [dd-tasks, runbook, preview, runtime, docker, private]
---

# Base preview runtime runbook

## Inputs and safety

Use a fresh sanitized `run_id`, one exact profile and one exact world binding.
For a retained checkpoint use `preview-checkpoint`; for a disposable result
use `preview-eval-output`. Do not use a production-like database name, a public
share or a committed local fixture password as a hosted credential.

The Compose project, database and volume names are explicit inputs. Cleanup
targets only the recorded Compose project/volume; prefix discovery and inferred
cleanup are forbidden.

## Build and start

From the exact feature worktree, after `pnpm bootstrap` and a clean source
readback:

```text
pnpm preview:build -- --run-id <run-id> --profile <profile>
```

The wrapper is the canonical binding generator because the project slug
contains a readable run prefix plus a run-id hash. For a manual Compose
operator, copy the value-free binding receipt and export the complete tuple
before any Compose command:

```text
export PREVIEW_PROFILE=<profile>
export PREVIEW_RUN_ID=<run-id>
export PREVIEW_WORLD_ID=<world-id from bindings.json>
export PREVIEW_DATABASE_NAME=<database from bindings.json>
export PREVIEW_VOLUME=<volume from bindings.json>
export PREVIEW_COMPOSE_PROJECT=<compose_project from bindings.json>
export PREVIEW_PORT=<private loopback port>
export PREVIEW_POSTGRES_PASSWORD=<operation-scoped secret, supplied out of band>
docker compose -f compose.preview.yml --project-name "$PREVIEW_COMPOSE_PROJECT" \
  up -d postgres app
```

`PREVIEW_POSTGRES_PASSWORD` is required for Compose interpolation and is never
committed, baked into the image, or written to receipts. `PREVIEW_VOLUME` and
`PREVIEW_COMPOSE_PROJECT` are part of the exact cleanup target. Prefer
`pnpm scenario:preview -- --run-id <run-id> --profile <profile>` so the
binding, secret split, browser output directory and cleanup are managed as one
operation.

The app is one built Node process. It serves the API and Vite `dist` assets on
the one external port; PostgreSQL is reachable only by the Compose service
name `postgres`. No Vite dev server or second web process is evidence.

## Initialize and verify

Before client/browser checks, run the image's guarded one-shot operations:

```text
docker compose -f compose.preview.yml --project-name <compose-project> run --rm app \
  node dist/db/commands.js migrate --profile <profile> --run-id <run-id> --world-id <world-id> \
  --compose-project <compose-project> --volume <volume>
docker compose -f compose.preview.yml --project-name <compose-project> run --rm app \
  node dist/db/commands.js reset --profile <profile> --run-id <run-id> --world-id <world-id> \
  --compose-project <compose-project> --volume <volume>
docker compose -f compose.preview.yml --project-name <compose-project> run --rm app \
  node dist/db/commands.js seed --profile <profile> --run-id <run-id> --world-id <world-id> \
  --compose-project <compose-project> --volume <volume>
```

Readiness must remain false until migration identities/checksums and the exact
seed marker are present. Then check `/api/health` and `/api/ready`, compare the
observed source revision and artifact digest with the image/build manifest,
and run `pnpm scenario:preview` against the managed HTTP URL.

## Restart and cleanup

For `preview-checkpoint`, stop/start the exact Compose project, run guarded
migrate only, and prove the seed marker/world is retained. For
`preview-eval-output`, stop the exact app and PostgreSQL services, remove only
the recorded project volume, and read back that the exact binding is absent.
Cleanup failure blocks the verdict and keeps the run's diagnostic artifacts.

All logs and evidence are redacted. The run records exact phase statuses and
commands but no database URLs, passwords, cookies, email values, raw payloads
or provider credentials. Source-package proof does not prove Exe.dev or any
production behavior.
