---
file: '.memory-bank/dd-flow/plan.md'
description: 'Canonical PLAN-stage prompt for SPC-004 v0.2 and SPC-005.'
purpose: 'Turn an accepted specification into one lossless semantic protocol plan and an honest CODE handoff.'
version: '2.0.0'
date: '2026-08-10'
status: 'DRAFT'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - common/runtime-contract.md
  - common/runtime-cli.md
  - schemas/protocol-plan.schema.json
  - mb-sdlc/plan/review.md
  - mb-sdlc/plan/implementation.md
tags: [dd-flow, plan, spc-004, spc-005, canonical-plan]
---

# PLAN

Read the generated `stage-prompt.md`, the selected protocol summary and fresh
specification. The CLI-rendered prompt is the only required stage input. It
contains exactly seven top-level sections; PLAN-specific blocks are nested in
the applicable-instructions and completion-contract sections.

## Lifecycle

The normal path is exactly:

```bash
dd-flow stage start <RUN-ID> --stage plan --json
# write the semantic plan at @plan and coverage at @aspect-map
dd-flow stage finish <RUN-ID> --stage plan --status ready_for_code --json
```

`stage start` returns `@plan`, `@aspect-map`, `@stage`, accepted input refs and
the exact finish command. Do not call global help, `plan set`, a separate
permission preflight, a separate lint preflight or a manual report command.

## Canonical semantic plan

Write exactly one semantic plan to:

```text
.memory-bank/protocol/<PRT-ID>/plan.json
```

Validate it against `schemas/protocol-plan.schema.json`. The plan owns the
goal, constraints, non-goals, versioned specification refs and SHA, task
assessment, route decision, SDLC contours, executable task graph, semantic
spines, execution contexts, verification contracts and CODE handoff.

Every executable item has a non-empty `summary`, `depends_on` only for an
actual consumed predecessor output, `semantic_spine`, `execution_context` and
`verification_contract`. Preserve every structured field; do not collapse
details, verification or notes into prose and do not default missing fields.

The plan is immutable after acceptance. Mutable item progress, worker/session
state, timestamps, Git facts, hashes generated at finish and actual evidence
belong to `run.json` and `timeline.jsonl`, not to `plan.json`. A changed plan
requires a new PLAN attempt and incremented `revision`.

## Routing

`orchestrator_local` is only the initial ownership state. It is not a default
recommendation, a completed self-check or a veto on delegation.

- Choose `local_compact` for tiny work or one short source scope. Do not run a
  capacity probe for this route.
- For substantive multi-aspect read-only work, identify real hard output
  dependencies, separate mandatory focused units, then prefer
  `single_wave_grouped` for compatible independent units.
- Capacity may change only packing and batch count. It never changes
  applicability, semantics, dependencies or separation rules.
- Retry only a rejected coverage unit; accepted siblings are not rerun.

The aspect map is the only semantic coverage artifact. It records every catalog
aspect, including `not_applicable` reasons, route, accepted findings, verdict,
deferrals and evidence refs. Do not create `aspect-graph.json`,
`aspect-job-map.json` or `subagent-decision.md`; graph and worker state are
derived from the map plus runtime workers.

## Artifact and truth boundary

The agent authors only `plan.json`, `aspect-map.json` and real worker packets
when delegation actually occurs. The CLI generates `run.json`,
`timeline.jsonl`, `stage-prompt.md`, JSON/Markdown/HTML stage reports and the
protocol summary. Do not author `phase-summary.md`, a parallel `report.md`,
manual trace files, runtime plan copies or HTML/browser validation receipts.

PLAN may write only protocol plan data, DRAFT/PLANNED target contracts and
verification designs marked `planned`/`not_run`. Never publish unimplemented
behavior into an active `implemented` or `current` document.

## Finish contract

Finish reads the canonical plan and aspect map, validates all structural and
semantic errors in one result, and performs no accepted mutation on failure.
On success the CLI computes plan/aspect SHA and derived counts, records runtime
progress and workers, performs delta-only Memory Bank lint when changed
documents exist, renders all reports and transitions to CODE. Full `mb-lint`
remains an explicit repository/readiness gate.

The completion input contains semantic result, acceptance, changed files,
checks, evidence, findings, DEF outcomes and next action only. Never supply
timestamps, duration, paths, hashes, session ids, usage or report selectors.
