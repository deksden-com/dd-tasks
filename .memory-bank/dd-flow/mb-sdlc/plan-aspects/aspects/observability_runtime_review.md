---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/observability_runtime_review.md'
description: 'Aspect prompt for observability and runtime review.'
purpose: 'Review diagnostic visibility for runtime behavior, external calls, queues and model/tool calls.'
version: '0.1.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: vertical_slice
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, observability]
---

# Aspect: observability_runtime_review

Applies to runtime behavior, external calls, async work, model/tool calls, queues, dashboard/status or failure investigation changes.

Grounding sources: logs, metrics, traces, dashboards/status, runtime state, error taxonomy, token/cost/latency/provider traces where relevant.

Plan review: identify correlation ids, state transitions, stuck detection, usage accounting and operator visibility.

Readiness review: verify failures can be diagnosed without session memory while respecting privacy/redaction boundaries.

Blocking findings: silent failure, no operator-visible state, no correlation for async/model work, unredacted sensitive trace.

Acceptable DEF: richer metrics after current gate if minimal diagnosis is already possible.
