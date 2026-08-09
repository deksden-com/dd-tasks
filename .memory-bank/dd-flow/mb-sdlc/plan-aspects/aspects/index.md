---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/index.md'
description: 'Index of dedicated MB-SDLC plan/readiness aspect prompts.'
purpose: 'Use to route focused aspect reviewers from aspect ids to concrete prompt files.'
version: '0.4.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '../index.md'
children:
  - 00-aspect-template.md
  - goal_traceability.md
  - architecture_design_quality.md
  - coding_standards_design_review.md
  - verification_evidence_review.md
  - def_blocker_review.md
  - memorybank_documentation_review.md
  - git_delivery_contour_review.md
  - design_aspect_traceability_review.md
  - testing_system_design_review.md
  - execution_efficiency_review.md
  - api_contract_design_review.md
  - network_realtime_design_review.md
  - contract_propagation_design.md
  - pipeline_design_review.md
  - concurrency_pipeline_design.md
  - data_persistence_migration_review.md
  - security_privacy_review.md
  - observability_runtime_review.md
  - external_integration_review.md
  - agentic_runtime_design_quality.md
  - ui_ux_accessibility_review.md
  - performance_capacity_review.md
  - release_deploy_publish_review.md
  - scenario_seed_eval_review.md
tags: [dd-flow, mb-sdlc, aspects, prompt-library]
history:
  - version: '0.4.1'
    date: '2026-08-09'
    changes: 'Defined hard predecessor outputs as accepted local aspect-map rows or delegated reports.'
  - version: '0.4.0'
    date: '2026-08-09'
    changes: 'Restricted hard dependencies to predecessor reports explicitly consumed by the successor and removed unused informational catalog links.'
  - version: '0.3.0'
    date: '2026-07-27'
    changes: 'Added the final conditional execution-efficiency review leaf prompt.'
  - version: '0.2.0'
    date: '2026-07-26'
    changes: 'Defined optional depends_on/informs metadata used by selected planning-aspect execution graphs.'
  - version: '0.1.0'
    date: '2026-07-09'
    changes: 'Created aspect prompt index for PRT-078.'
---

# SDLC Aspect Prompt Library

Each file in this directory is a dedicated prompt for one `aspect_id` from `../index.md`.

Focused aspect reviewer task packets must point to:

- common prompt: `../aspect-worker.md`;
- worker prompt: `.memory-bank/dd-flow/workers/verify.md` or `.memory-bank/dd-flow/workers/docs.md`;
- aspect prompt: one file from this directory;
- task/protocol/stage sources and report path.

The task packet routes the fresh subagent. The aspect file owns aspect-specific grounding.

## Dependency Metadata

An aspect prompt may declare:

```yaml
depends_on: [<aspect_id>]
```

`depends_on` is exceptional. Add it only when the aspect prompt explicitly
requires data from an accepted predecessor output, names that output in its
Grounding section and uses the data in its verdict. The output may be an
accepted local `aspect-map.json` row or a delegated report. Similar subject matter,
shared source files, a useful review order or a report that *might* help are not
dependencies. Those aspects independently read the same frozen draft.

For every selected hard dependency, `aspect-graph.json` records the exact
predecessor output path and the data consumed. If that cannot be named, omit
the edge. The current catalog intentionally has only the two dependencies of
`execution_efficiency_review`.
