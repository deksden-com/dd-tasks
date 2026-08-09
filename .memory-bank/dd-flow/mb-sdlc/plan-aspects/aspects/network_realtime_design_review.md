---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/network_realtime_design_review.md'
description: 'Aspect prompt for network/realtime design review.'
purpose: 'Review streaming, WebSocket, SSE, realtime and long-running network session behavior.'
version: '0.1.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: program
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, realtime, network]
---

# Aspect: network_realtime_design_review

Applies to WebSocket, SSE, realtime subscriptions, streaming output, push/events, long-running sessions or offline/online sync.

Grounding sources: network code, protocol docs, auth/session docs, event schemas, tests, observability traces and scenarios.

Plan review: check connection lifecycle, reconnect, heartbeat, ordering, replay/backfill, auth refresh, cleanup and tenant/channel security.

Readiness review: verify actual implementation handles stale events, dedupe, gaps, cleanup, observability and security boundaries.

Blocking findings: reconnect/backfill undefined, leaked connection resources, tenant/channel auth gap, unobservable streaming failure.

Acceptable DEF: load/replay evidence deferred to staging with clear safety boundary.
