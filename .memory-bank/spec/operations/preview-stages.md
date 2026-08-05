---
file: '.memory-bank/spec/operations/preview-stages.md'
description: 'Accepted local and private preview stage policy for PRT-004.'
purpose: 'Defines the smallest reproducible execution contours without creating production, CI or control-plane semantics.'
version: '0.2.0'
date: '2026-08-05'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/operations/index.md'
related_runbooks:
  - .memory-bank/spec/operations/runbooks/preview-runtime.md
  - .memory-bank/spec/operations/runbooks/exe-dev-preview.md
related_protocols:
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/index.md
tags: [dd-tasks, operations, preview, stages, private-by-default]
---

# Local and preview stages

PRT-004 defines four bounded profiles, not four availability tiers:

| profile | contour | database | lifecycle | exposure |
| --- | --- | --- | --- | --- |
| `local` | developer loopback | existing `dd_tasks_foundation_local*` convention | migrate, explicit reset/seed | loopback |
| `test` | test-only loopback | existing `dd_tasks_foundation_test*` convention | migrate, explicit reset/seed | loopback |
| `preview-checkpoint` | active checkpoint preview | `dd_tasks_preview_checkpoint` | migrate on restart; explicit reset/seed; remove superseded volume after accepted replacement | private |
| `preview-eval-output` | short-lived disposable preview | `dd_tasks_preview_eval_output` | migrate; explicit reset/seed; mandatory cleanup | private |

The application execution is production-like only where that improves the
preview proof: one built Hono process serves `/api` and the Vite SPA through
one external port, cookies use secure same-origin defaults, and PostgreSQL is
an internal service. This does not create a production policy, backup promise,
availability target, multi-tenant control plane, background worker, queue or
autoscaling behavior.

Preview is private by default. A source-package smoke run is not provider
evidence and never opens a share. The active checkpoint may keep its disposable
volume through an ordinary restart, but it has no backup or recovery promise;
only the current accepted volume is retained per target. Superseded checkpoint
volumes are removed after the replacement passes health/readiness/live checks
and exact absence is read back. `preview-eval-output` has an owner/run binding
and a bounded TTL; cleanup is a required phase, not an optional convenience.

Every mutation records a sanitized `run_id`, exact profile and exact world
binding. Unknown profiles, malformed URLs, host/database mismatches,
production-like names and missing preview bindings fail before a database
client is opened. Reset and seed are never implicit in application startup.

The only later live contour is a separately authorized `deploy.md` using the
Exe.dev overlay. It must re-read identity, authority, team, target, private
access, transport and capacity immediately before any provider mutation.
