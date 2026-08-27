---
file: '.memory-bank/dd-flow/index.md'
description: 'Compact dd-flow catalog for session priming, flow routing and the coordinated SPC-009 beta target.'
purpose: 'Tell a fresh agent which prompt and predecessor gate apply and where the pending breaking runtime model is specified.'
version: '1.1.0'
date: '2026-08-27'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - prime.md
  - common/runtime-contract.md
  - common/lifecycle-guards.md
  - flow-contract.json
  - ../spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md
tags: [dd-flow, index, routing, lifecycle, spc-004, spc-009]
history:
  - version: '1.1.0'
    date: '2026-08-27'
    changes: 'Added the SPC-009 beta-target boundary without presenting the not-yet-cut-over contract as current runtime behavior.'
---

# dd-flow index

| User intent | Prompt | Predecessor | Result |
|---|---|---|---|
| Prime a fresh session | `prime.md` | Memory Bank exists | Read-only priming |
| Formalize discussed work | `vnext/start.md` | substantive user discussion | SPECIFY-first RUN; no PRT yet |
| Materialize accepted requirements | `vnext/protocolize.md` | accepted SPECIFY | managed workspace plus PRT/PSET |
| Plan | `vnext/plan.md` | accepted PROTOCOLIZE | verified implementation graph and CODE handoff |
| Review plan | `vnext/plan-review.md` | accepted PLAN | accepted correction or CODE opening |
| Implement | `vnext/code.md` | accepted or skipped PLAN-REVIEW | registered CODE Work graph |
| Continue a legacy protocol | `protocol-implement.md` | selected non-terminal `PRT-*` | legacy next-safe-stage route |
| SPECIFY worker | `vnext/specify.md` | vNext RUN started | self-contained result or blocking user questions |
| Merge | `merge.md` / `merge-start.md` | ready for merge | claimed integration and closure |

## Runtime invariants

- A concrete flow has one `RUN-*`, one current `run.json` and one append-only
  `timeline.jsonl`.
- A stage has one generated eight-section `stage-prompt.md`, one current stage
  root and archive-only `try-NNN` directories.
- The only stage lifecycle actions are `stage start` and `stage finish`.
- Successful finish always generates JSON, Markdown, HTML and summary views.
- `run.json`, stage reports and generated summary are runtime evidence; durable
  decisions belong in Memory Bank truth layers.
- If project policy selects `feature_worktree`, `PROTOCOLIZE start` creates and
  bootstraps it before any PRT/PSET materialization. PLAN, PLAN-REVIEW and CODE
  require the immutable route receipt and use only that workspace for project
  reads/writes; the stable project root is lifecycle identity, not a write target.

## Safe next actions

If a predecessor is missing, stop and name the missing artifact and gate. Do not
use a lifecycle command from a previous contract as a workaround. Read
[common/runtime-contract.md](common/runtime-contract.md) before changing the
flow itself.

## Pending breaking target

Before changing entity IDs, RUN/Work paths, state projections, stage
directories, findings, check receipts, snapshots or cleanup, read
[SPC-009](../spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md).
It is one coordinated flow-pack/engine/eval change. The current runtime
invariants above remain executable until the matching beta pair is released.
