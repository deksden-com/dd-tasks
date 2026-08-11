---
file: '.memory-bank/dd-flow/mb-sdlc/code/readiness.md'
description: 'Readiness gate for the generated code stage.'
purpose: 'Prove the implementation, evidence and handoff are complete before merge.'
version: '1.0.0'
date: '2026-08-10'
status: 'DRAFT'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/mb-sdlc/code/implement.md'
related_files:
  - ../../common/runtime-contract.md
  - ../../common/runtime-cli.md
  - ../../common/closure.md
tags: [dd-flow, readiness, verification, spc-004, spc-005]
---

# Readiness gate

Read the current generated code-stage prompt and the protocol-owned semantic
plan. Confirm the actual feature workspace, active DEFs, runtime-projected plan
progress, bootstrap receipt and the full changed-file diff. Read fresh results;
do not trust a prior report or a hand-authored receipt.

## Required checks

- `git diff --check`;
- project-specific tests/build or the documented not-applicable reason;
- schema validation for every changed JSON contract/example;
- deterministic fixture/eval runner;
- full `mb-lint` with parseable result output and its documented progress
  channel (the PLAN stage itself uses selected-file delta lint);
- requirement matrix and evidence links;
- no active superseded lifecycle instruction.

Review architecture, contract propagation, prompt/runtime quality,
concurrency/ownership boundaries, security/redaction, documentation quality,
scenario coverage and Git delivery. Companion implementation evidence must be
listed as external handoff, never substituted by canonical prose.

## Handoff

Write semantic finish input to `@stage/stage-input.json`, containing verdict,
acceptance, checks, evidence, review findings, DEF outcomes and next action.
Let the CLI add timestamps,
duration, paths, Git state, sessions/usage and generated report paths:

```bash
dd-flow stage finish <RUN> --stage code --status done --json
```

Readiness may transition the protocol to `ready_for_merge`. Do not claim a
merge lane, execute merge operations or delete the feature workspace here.
