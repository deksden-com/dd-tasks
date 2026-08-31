---
file: '.memory-bank/spec/engineering/SPC-006-stage-bootstrap-and-context-packet.md'
description: 'Project-facing summary of the canonical SPC-006 stage bootstrap, context-packet and sealed-finish contract.'
purpose: 'Makes the canonical stage bootstrap and context-packet boundary discoverable without duplicating the canonical specification.'
version: '0.2.0'
date: '2026-08-31'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/spec/engineering/index.md'
canonical_source: '/Users/deksden/Documents/_Projects/dd-memorybank/.memory-bank/spec/engineering/SPC-006-stage-bootstrap-and-context-packet.md'
related_files:
  - '.memory-bank/dd-flow/common/runtime-contract.md'
  - '.memory-bank/dd-flow/common/runtime-cli.md'
  - '.memory-bank/dd-flow/flow-contract.json'
  - '.memory-bank/dd-flow/schemas/stage-prompt.schema.json'
  - '.memory-bank/dd-flow/schemas/stage-start-response.schema.json'
tags: [dd-tasks, engineering, dd-flow, spc-006, stage-bootstrap, context-packet]
---

# SPC-006: stage bootstrap and context packet

## Source and scope

This is a project-facing summary of canonical SPC-006 within the
4.0.0 Memory Bank release. The canonical specification remains authoritative;
the active project implementation surface is the curated `.memory-bank/dd-flow/`
pack and the compatible `dd-flow-cli` runtime.

## Active contract

- A new practical task starts with one CLI-owned
  `dd-flow stage start --bootstrap --stage specify` command.
- The start receipt owns deterministic Git, compatibility, permission, alias
  and session facts and returns one authoritative context packet.
- `stage-prompt.json` is the structured source for the saved Markdown prompt
  and worker prompt projection; they must represent the same context.
- Stage prompts use a closed stage-to-fragment allowlist. A stage must not
  receive instructions for CODE, readiness, merge or unrelated PLAN work.
- The worker contributes bounded semantic input only. Runtime state, IDs,
  transitions, reports, timestamps, hashes and usage are CLI-owned.
- Finish uses a validated `--outcome` flag. Accepted semantic artifacts are
  sealed; a correction creates a new attempt and archives the prior attempt.

## Project boundary

SPC-006 changes the Memory Bank/flow runtime contract, not dd-tasks product
behavior. Runtime/home migration remains a separate guarded operation and
requires a supported CLI migration route plus post-migration verification.

## Verification surface

The active contract is discoverable through `flow-contract@6`, the stage-prompt
and stage-start-response schemas, and the canonical `dd-flow-cli` 0.8.0
compatibility record. A clean initial specify-to-plan eval remains a release
gate owned by the coordinated canonical/CLI release, not by this project
documentation file alone.
