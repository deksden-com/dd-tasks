---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/concurrency_pipeline_design.md'
description: 'Aspect prompt for concurrency and parallel pipeline design.'
purpose: 'Review parallelism, queues, locks, leases, map/reduce patterns and shared-state safety.'
version: '0.1.2'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: program
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, concurrency]
history:
  - version: '0.1.1'
    date: '2026-07-09'
    changes: 'Moved concurrency subsection guidance from the catalog into this aspect prompt.'
  - version: '0.1.0'
    date: '2026-07-09'
    changes: 'Created dedicated aspect prompt for concurrency and parallel pipeline design.'
---

# Aspect: concurrency_pipeline_design

Applies to parallel workers/model stages, queues, locks, leases, aggregation, fan-out/fan-in, map-reduce, worker pools, async pipelines or shared state.

Grounding sources: queue/lock services, worker lifecycle, state store, timeout/retry policy, aggregation/reducer code, observability and tests.

Plan review: identify parallelization model, serialization point, locks/leases/timeouts, idempotency, backpressure and stuck-state detection.

Readiness review: verify atomic ownership, stale-worker cleanup, retry idempotency, deterministic aggregation and no unsafe parallel mutation.

Blocking findings: no lock owner, no timeout/lease cleanup, non-idempotent retry, race-prone mutation apply.

Acceptable DEF: high-volume tuning only after safe correctness behavior is proven.

## Concurrency Subsections

Keep concurrency as one strong aspect unless a future protocol promotes a subsection into its own aspect. When this aspect applies, consider:

- `parallelization_model`: what can run in parallel, what must be sequential, and where reducer/aggregator/serialization points exist.
- `concurrency_pattern`: fan-out/fan-in, map-reduce, parallel pipeline, worker pool, queue consumers, actor/mailbox or single-writer.
- `shared_state_and_serialization`: immutable data, shared mutable state, ordering and consistency.
- `lock_lease_timeout`: lock/claim/lease/heartbeat/fencing tokens/timeouts.
- `retry_idempotency`: retry policy, duplicate delivery, idempotency keys and poison work.
- `failure_recovery`: partial failure, cancellation, resume and cleanup.
- `capacity_backpressure`: concurrency limits, queue depth, rate limits and starvation.
- `observability`: trace/run/worker ids, state transitions and stuck detection.

For high-risk async/pipeline tasks, happy-path walkthrough is insufficient. Include at least one failure/retry walkthrough, such as "worker claims job, writes partial state, hangs, lease expires, another worker resumes".
