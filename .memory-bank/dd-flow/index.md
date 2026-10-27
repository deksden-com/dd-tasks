---
file: '.memory-bank/dd-flow/index.md'
description: 'Compact dd-flow catalog for session priming and stable SPECIFY-first flow routing.'
purpose: 'Tell a fresh agent which prompt, predecessor gate and runtime invariant apply.'
version: '2.2.3'
date: '2026-10-20'
status: 'ACTIVE'
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
  - version: '2.2.3'
    date: '2026-10-20'
    changes: 'Added canonical CLI routes for read-only audit and project conformance review.'
  - version: '2.2.2'
    date: '2026-10-07'
    changes: 'Replaced legacy fixed prompt envelope with selected stage contract and clarified SQLite authority.'
  - version: '2.2.1'
    date: '2026-10-07'
    changes: 'Grounded native/external delegation and typed lifecycle controls against current CLI policy without activating generic memory-flow commands.'
  - version: '2.2.0'
    date: '2026-09-04'
    changes: 'Required delegated Work to run as native depth-one children of the Stage coordinator using externally qualified harness capacity.'
  - version: '2.1.0'
    date: '2026-08-31'
    changes: 'Made vNext MERGE and its single MRG queue the terminal SDLC route.'
  - version: '2.0.0'
    date: '2026-08-31'
    changes: 'Made the coordinated SPC-009 runtime and SPECIFY-through-CODE-REVIEW route the active stable contract.'
  - version: '1.1.0'
    date: '2026-08-27'
    changes: 'Added the SPC-009 beta-target boundary without presenting the not-yet-cut-over contract as current runtime behavior.'
---

# dd-flow index

| User intent | Prompt | Predecessor | Result |
|---|---|---|---|
| Prime a fresh session | `prime.md` | Memory Bank exists | Read-only priming |
| Audit Memory Bank | canonical `mb-audit.md` / `dd-flow flow mb-audit` | explicit read-only request and configured executor | source-backed findings, independent review and RUN-owned report |
| Review project conformance | canonical `review.md` / `dd-flow review` | explicit review focus and configured executor | spec/code conformance findings without repair |
| Formalize discussed work | `vnext/start.md` | substantive discussion and explicit formalization request | SPECIFY-first RUN; no PRT yet |
| Continue selected work | `go.md` | explicit selector or trusted retained directive | bounded continuation; no inferred new RUN |
| Materialize accepted requirements | `vnext/protocolize.md` | accepted SPECIFY | managed workspace plus PRT/PSET |
| Plan | `vnext/plan.md` | accepted PROTOCOLIZE | verified implementation graph and CODE handoff |
| Review plan | `vnext/plan-review.md` | accepted PLAN | accepted correction or CODE opening |
| Implement | `vnext/code.md` | accepted or skipped PLAN-REVIEW | registered CODE Work graph |
| Review implementation | `vnext/code-review.md` | verified CODE | independent findings, repairs and accepted CODE result |
| Integrate accepted work | `vnext/merge.md` | accepted CODE/CODE-REVIEW and queued `MRG-*` | checked local integration and terminal RUN |
| Continue a legacy protocol | `protocol-implement.md` | selected non-terminal `PRT-*` | legacy next-safe-stage route |
| SPECIFY worker | `vnext/specify.md` | vNext RUN started | self-contained result or blocking user questions |

## Runtime invariants

- A concrete flow has one CLI-owned `RUN-*` authority in SQLite. Current
  `run.json` and `timeline.jsonl` are generated projections, never manually
  writable lifecycle state.
- A stage uses the exact stage-specific packet and output contract returned by
  its selected engine. Its generated prompt is an audit projection, not a
  universal eight-section envelope. Current stage roots and archive-only
  `try-NNN` directories follow that engine's admitted stage contract.
- The normal productive stage pair is `stage start` and `stage finish`.
  Material questions use typed pause/resume; infrastructure failures use
  block/unblock. A pause, repair handoff or accepted command is not terminal PASS.
- Completed finish publishes the views required by its stage contract;
  workers use the returned completion contract, not a reconstructed report shape.
- Frozen execution policy selects native or external delegation. Native Work
  uses qualified depth-one children of the coordinator; external Work uses
  durable runtime launch and its own provider root. Work parent does not imply
  physical Session parent. Capacity/parallel limits affect ready Work packing,
  never semantic applicability, dependencies or settlement.
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

## Runtime model

Before changing entity IDs, RUN/Work paths, state projections, stage
directories, findings, check receipts, snapshots or cleanup, read
[SPC-009](../spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md).
These rules are one coordinated flow-pack/engine contract and must change
together.
