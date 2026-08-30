---
file: '.memory-bank/dd-flow/mb-sdlc/code/implement.md'
description: 'Canonical implementation prompt for a generated SPC-004 v0.2/SPC-005 code stage.'
purpose: 'Implement the selected plan, verify it and hand off at readiness without merging.'
version: '1.1.0'
date: '2026-08-10'
status: 'DRAFT'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/code.md'
related_files:
  - ../../common/runtime-contract.md
  - ../../common/flow-runs.md
  - readiness.md
  - ../../schemas/protocol-plan.schema.json
tags: [dd-flow, code, implementation, readiness, spc-004, spc-005]
---

# Code implementation

Read the generated `stage-prompt.md` from the current code stage plus the
selected protocol summary, specification, canonical protocol `plan.json` and applicable MBB
coding/contract/verification guides. The generated prompt is assembled from
the installed project flow pack and runtime facts; do not recreate it manually.

## Execute

Use the response from:

```bash
dd-flow stage start <RUN> --stage code --json
```

`@stage` is the hard artifact boundary; keep `@stage/try-NNN` read-only.
The project workspace selected by the packet is the hard source boundary.
The plan item's `planned_write_areas` are only soft coordination hints: change
any project-local file inside that workspace when the semantic task requires
it, then report the actual changed path as coordination drift if it was not
predicted. Keep mutable progress in the runtime projection, and keep companion
runtime/scanner code outside this repository.

The agent supplies semantic decisions only in `@stage/stage-input.json`, with
result, acceptance, changed files, checks, evidence, reviewer findings, DEF
outcomes and next action. Do not supply timestamps, duration, hashes, Git facts,
paths, session ids, usage totals, attempt paths or report selectors.

## Finish and readiness

Run the cheapest relevant checks during implementation. Before readiness, run
fresh canonical checks and then:

```bash
dd-flow stage finish <RUN> --stage code --outcome <outcome> --json
```

Finish owns mechanical enrichment, exact delta validation, generated
`stage-report.json`, `stage-report.md`, `stage-report.html`, protocol summary
and the allowed transition. It does not create a second plan or hand-authored
report. Then execute `readiness.md` in the same stage
handoff. A passing readiness result is `ready_for_merge`; it is not a merge.
