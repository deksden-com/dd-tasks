---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/pipeline_design_review.md'
description: 'Aspect prompt for pipeline/staged workflow design review.'
purpose: 'Review staged workflow contracts, handoff, ownership and failure/retry semantics.'
version: '0.1.1'
date: '2026-07-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: program
depends_on: [architecture_design_quality]
informs: [contract_propagation_design]
tags: [dd-flow, mb-sdlc, aspect, pipeline]
history:
  - version: '0.1.1'
    date: '2026-07-09'
    changes: 'Moved detailed pipeline orchestration ownership guidance from the catalog into this aspect prompt.'
  - version: '0.1.0'
    date: '2026-07-09'
    changes: 'Created dedicated aspect prompt for pipeline/staged workflow design review.'
---

# Aspect: pipeline_design_review

Applies to staged workflow, lifecycle, multi-step algorithm, worker orchestration, queue/claim/lock flow, ETL, release/deploy/publish, scenario runner, model/tool pipeline, async/event processing or operator handoff.

Grounding sources: pipeline owner/source of truth, stage prompts, runtime state, schemas, queues, reports, dashboards, tests and handoff artifacts.

Plan review: require stage contract matrix, single orchestration owner, status vocabulary, durable handoff, errors, retry/resume and walkthrough.

Readiness review: verify actual diff preserves stage contracts, handoff artifacts, failure/retry evidence and avoids fragmented global pipeline logic.

Blocking findings: orchestration owner missing, status vocabulary split, handoff only in model memory, stage overrides global routing.

Acceptable DEF: non-blocking future failure branch with next gate and representative data.

## Pipeline Orchestration Ownership

When this aspect applies, the review must identify the pipeline orchestration source of truth.

The invariant:

- stage order, transition rules, terminal verdicts, status vocabulary, retry/resume/skip policy and handoff contract live in one explicit owner/source of truth;
- stage modules may implement local work, local validation and local side effects, but must not secretly redefine global routing, lifecycle transitions, final status semantics or retry policy;
- UI, dashboard, prompt text, tests and reports may render, validate or explain the pipeline, but must not become second orchestration sources;
- duplicated declarative tables are acceptable only when generated from, validated against, or explicitly linked to the authoritative contract;
- if the project intentionally splits orchestration across multiple cooperating owners, the boundary and synchronization rule must be documented before the gate can pass.

Plan review should name:

- `orchestration_owner`;
- `orchestration_source`;
- `global_transition_source`;
- `status_vocabulary_source`;
- `stage_local_responsibility`;
- any allowed generated/derived copies.

Readiness should look for fragmented logic:

- route/order/status/retry maps copied in CLI, worker, UI, prompt or stage modules without an owner;
- a stage deciding the next global stage on its own when the pipeline has a central lifecycle;
- dashboards or reports deriving terminal status differently from runtime state;
- tests encoding a different state machine than the implementation;
- prompt instructions becoming the only place where transition behavior exists.

Finding names:

- `pipeline_orchestration_owner_missing`;
- `pipeline_logic_fragmented`;
- `status_vocabulary_split`;
- `stage_overrides_global_routing`;
- `derived_pipeline_copy_unchecked`.
