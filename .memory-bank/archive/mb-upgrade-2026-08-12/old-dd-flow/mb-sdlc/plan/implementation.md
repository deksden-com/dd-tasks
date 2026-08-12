---
file: '.memory-bank/dd-flow/mb-sdlc/plan/implementation.md'
description: 'Canonical PLAN implementation-design prompt for SPC-005.'
purpose: 'Turn accepted review findings into one executable, lossless plan and a CODE handoff.'
version: '2.0.0'
date: '2026-08-10'
status: 'DRAFT'
c4_level: 'prompt'
parent: '../README.md'
related_files:
  - ../../plan.md
  - ../../common/runtime-contract.md
  - ../../schemas/protocol-plan.schema.json
  - review.md
tags: [dd-flow, plan, implementation, spc-005]
---

# PLAN implementation design

Read the generated PLAN prompt, accepted specification, review/aspect map and
the canonical schema. Produce or update the protocol-owned `plan.json`; do not
split semantic planning between a task folder, a stage report and runtime.

## Plan item contract

Each executable item must contain:

```yaml
id: P<number>
kind:
title:
summary: non-empty
details: optional structured explanation
depends_on: []
owner:
target_stage: specify | plan | code | readiness | merge | release
required: true | false
requirements: [SPC-004@<version>/R-<n>, SPC-005@<version>/R-<n>]
semantic_spine:
  user_outcome:
  component_responsibility:
  must_preserve: []
  non_goals: []
  acceptance_contribution:
execution_context:
  prompt_profile: documentation_contract | code_implementation | verification
  required_read: []
  discovery_boundary: []
  write_scope: []
  checks: []
verification_contract:
  checks: []
  evidence: []
```

The plan owns intended work and proof design. It does not contain mutable
status, progress, worker/session ids, timestamps, Git facts or actual evidence.
`depends_on` is a hard execution edge only when the successor consumes a named
accepted predecessor output. A common input is not a dependency.

Use the source specification's versioned requirement IDs, never an unqualified
ID. Do not silently drop `details`, `verification`, `note` or other accepted
semantic fields during validation. Empty summaries and inferred defaults are
invalid.

## Minimal sufficient topology

Use the smallest graph that preserves acceptance:

- serialize writes that share a schema, prompt or consumer boundary;
- keep independent read-only audits eligible for one grouped wave;
- use `local_compact` for one short/tiny task without a capacity probe;
- use `single_wave_grouped` for compatible substantive multi-aspect review;
- let capacity change only the compatible packing and number of batches;
- do not add a scheduler, graph projection or aggregate job artifact.

The plan's top-level `route_decision` records that `orchestrator_local` is only
the initial state. The aspect map records actual route and coverage. CODE does
not need a prose phase summary to reconstruct the accepted plan.

## Contract propagation

Map each requirement to the canonical file, companion owner and evidence:

| Surface | Canonical owner | Proof boundary |
| --- | --- | --- |
| plan schema/example | dd-memorybank | schema and round-trip fixtures |
| prompt/routing | dd-memorybank | seven-section and route snapshots |
| runtime progress/readers | dd-flow-cli PRT-012 | runtime integration fixtures |
| selected-file lint | mb-lint PRT-003 | isolation and all-findings fixtures |
| reports/summary | CLI projection over canonical data | receipt schema/template fixtures |
| integrated clean PLAN | all three compatible releases | external integrated eval |

Do not claim companion work from canonical prose. Preserve the current-truth
boundary: future implementation belongs in DRAFT/PLANNED target documents and
planned verification, while implemented/current documents change only after
CODE/readiness evidence.

## Finish handoff

The protocol plan must name these CODE inputs:

- accepted specification paths, versions and SHA;
- canonical plan path and revision;
- aspect-map path and accepted coverage;
- exact canonical prompt/common contracts;
- verification commands and known external companion gate.

`stage finish --stage plan` reads the plan and map, returns every validation
error together, calculates hashes/counts and generates the JSON, Markdown,
HTML and protocol summary. The agent supplies semantic acceptance only. On
success transition to `code`; on failure keep the same attempt for correction
and publish no partial acceptance.
