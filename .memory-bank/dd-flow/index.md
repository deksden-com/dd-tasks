---
file: '.memory-bank/dd-flow/index.md'
description: 'Compact dd-flow catalog for session priming and flow routing.'
purpose: 'Tell a fresh agent which prompt and predecessor gate apply.'
version: '1.0.0'
date: '2026-08-10'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - prime.md
  - common/runtime-contract.md
  - common/lifecycle-guards.md
  - flow-contract.json
tags: [dd-flow, index, routing, lifecycle, spc-004]
---

# dd-flow index

| User intent | Prompt | Predecessor | Result |
|---|---|---|---|
| Prime a fresh session | `prime.md` | Memory Bank exists | Read-only priming |
| Materialize work | `protocol.md` | substantive task input | `PRT-*` and specify handoff |
| Continue a protocol | `protocol-implement.md` | selected non-terminal `PRT-*` | next safe stage |
| Specify | `common/specification.md` | protocol exists | problem-space acceptance |
| Plan | `plan.md` | specify ready | plan graph and plan stage report |
| Implement | `code.md` | plan ready | code stage and readiness |
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

## Safe next actions

If a predecessor is missing, stop and name the missing artifact and gate. Do not
use a lifecycle command from a previous contract as a workaround. Read
[common/runtime-contract.md](common/runtime-contract.md) before changing the
flow itself.
