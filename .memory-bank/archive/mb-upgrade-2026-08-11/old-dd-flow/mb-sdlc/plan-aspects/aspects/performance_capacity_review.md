---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/performance_capacity_review.md'
description: 'Aspect prompt for performance and capacity review.'
purpose: 'Review latency, throughput, batching, caching, memory, rate limits and degradation.'
version: '0.1.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: vertical_slice
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, performance, capacity]
---

# Aspect: performance_capacity_review

Applies when latency, throughput, large inputs, batching, caching, memory, queue depth, rate limits or resource constraints matter.

Grounding sources: expected load, data volume, algorithm paths, limits, existing metrics, tests and operational constraints.

Plan review: define expected load, limits, degradation, capacity checks and fallback behavior.

Readiness review: confirm measurements, tests or explicit non-applicability support the performance claim.

Blocking findings: high-volume path with no limit/backpressure, O(n) assumption unverified for known large inputs, rate-limit path ignored.

Acceptable DEF: benchmark tuning after functional gate if safe limits exist.
