---
file: '.memory-bank/dd-flow/mb-sdlc/review/aspects.md'
description: 'Baseline aspects for project-level mb-sdlc-review.'
purpose: 'Use as the aspect checklist and task-packet source for mb-sdlc-review.'
version: '0.2.0'
date: '2026-07-09'
status: 'DRAFT'
c4_level: 'documentation'
parent: 'index.md'
tags: [dd-flow, review, aspects]
history:
  - version: '0.2.0'
    date: '2026-07-09'
    changes: 'Linked project-level review aspects to the shared SDLC aspect-worker fresh-session contract.'
  - version: '0.1.0'
    date: '2026-06-30'
    changes: 'Created baseline project-review aspect list.'
---

# MB-SDLC Review Aspects

These aspects are the baseline for every project-level review. Each review must mark each aspect as `applicable`, `not_applicable` or `blocked`.

Project-level review may reuse the shared SDLC aspect worker model when an aspect needs focused review:

```text
.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspect-worker.md
.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/<closest-plan-aspect>.md
```

If a project-level aspect does not have a one-to-one plan-aspect prompt, the task packet must name the closest reusable prompt and add project-level focus notes. The subagent still starts as a fresh session, reads the common worker prompt, reads the selected aspect prompt and writes a source-backed aspect report. The project-review orchestrator accepts or rejects findings.

| Aspect | Question |
| --- | --- |
| `structure_navigation_review` | Can an agent and human find the system truth, flow entrypoints, dashboards, protocols, specs, scenarios and evidence without guessing? |
| `feature_epic_layer_review` | Are epics/features present where needed, grouped by durable value/capability, and linked to scenarios/evidence? |
| `spec_conformance_review` | Does actual project state match normative product/system/engineering/operations specs? |
| `architecture_harmonization_review` | Is the system described top-down and conceptually coherent, without fragmented or protruding parts? |
| `adr_decision_review` | Are significant decisions, alternatives and consequences captured in ADRs and linked to affected docs/code/protocols? |
| `scenario_evidence_review` | Do scenarios, seed/fixtures, evals/experiments and verification evidence cover declared capabilities safely? |
| `contract_traceability_review` | Are API/CLI/schema/config/event/code contracts traced through docs, tests, scenarios and interacting systems? |
| `frontmatter_crosslink_review` | Are frontmatter and cross-links between protocols, protocol sets, epics, features, specs, ADRs, scenarios, evidence and code present and current? |
| `engineering_standards_review` | Does actual code follow project/MBB coding standards: module size, decomposition, responsibility, imports/layers, side effects, errors, tests and public boundary docs? |
| `operations_policy_review` | Are Git/worktree/release/deploy/environment/check-profile/runbook policies coherent and followed? |
| `protocol_delivery_trace_review` | Do protocols and RUN artifacts give factual trace, closure, evidence and durable knowledge promotion? |
| `def_followup_review` | Are active DEFs visible, deduplicated, still relevant, linked to next gates and not hiding blocking work? |

## Applicability

`not_applicable` requires a reason tied to focus and project state. Do not use it as a speed shortcut.

`blocked` requires missing evidence, inaccessible tools or contradiction that prevents meaningful review. A blocked aspect influences the overall verdict.

## Coverage Mode

Use:

- `focused_subagent` for high-risk or substantial applicable aspects;
- `multi_subagent` for broad architecture/runtime/data/release reviews;
- `self_review` only for compact, low-risk reviews with explicit rationale;
- `external_tool` when deterministic tooling is the main evidence source;
- `degraded` when the intended review mode could not run.

## Engineering Standards Specifics

This aspect must inspect actual code where the project has code changes or drift, not only documentation. It checks large modules, boundaries, generated exceptions, current consumers, public entrypoints and docstring/JSDoc cross-links to durable docs where applicable.
