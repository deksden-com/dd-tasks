---
file: '.memory-bank/protocol/PRT-006-preview-access-policy/trace/20260805T-plan-report.md'
description: 'Plan-stage handoff for the PRT-006 preview access policy protocol.'
purpose: 'Records accepted plan decisions, evidence boundaries and the next CODE gate.'
version: '0.1.0'
date: '2026-08-05'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/protocol/PRT-006-preview-access-policy/index.md'
protocol_lifecycle: 'READY_FOR_MERGE'
tags: [protocol, plan, preview, access-policy]
---

# PRT-006 plan handoff — 2026-08-05

`plan` stage completed in the exact protocol worktree with verdict
`plan_ready` and disposition `accepted_with_degraded_review`.

## Durable decisions

- `proxy_visibility` belongs to Exe.dev/provider/runbook; `share show` is the
  only provider observation.
- `registration_mode` belongs to the application runtime/API;
  unauthenticated `GET /api/config` is its sole readback.
- `/api/ready` keeps its existing response and remains a readiness/source
  identity gate, not a second registration authority.
- Valid+ready `closed` registration returns `REGISTRATION_CLOSED` 403 before
  body validation/CoreService/session mutation. Invalid/missing/unknown or
  otherwise unready policy returns `NOT_READY` 503 before mutation.
- The one `preview-build.mjs` validator accepts only
  `private+closed`, `private+open`, `public+closed`; `public+open` and invalid
  protected inputs are rejected before build/provider mutation.
- `DEF-MBU-RUNTIME-ACTIVE-STATE` is `not_touched`.

## Evidence and limits

The plan stage report JSON passed its schema, the canonical HTML embeds the
same JSON, and `agent-browser` DOM smoke found all 24 aspect rows, 8 plan rows,
9 graph nodes, the CODE handoff and no overflow. Focused architecture,
coding, design, pipeline, contract and security reports are preserved. Git,
some deep aspects and fresh API/observability rechecks remain degraded or in
bounded recovery and are explicit readiness dependencies. No plan-stage check
proves remote Git fixation or Exe.dev behavior.

RUN-local report paths under `.tasks/dd-flow-runs/RUN-304-preview-access-policy/`
are provenance, not a durable acceptance dependency. Required source/live
passports must be promoted under this protocol's `evidence/` directory before
closure.

## Next action

Enter CODE in the same worktree, run the canonical workspace bootstrap first,
implement P1–P5 only, and close all deferred reviewers in readiness before any
merge, checkpoint tag, provider command or public exposure.
