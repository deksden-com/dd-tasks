---
file: '.memory-bank/dd-flow/common/trace.md'
description: 'Deprecated notice for the retired manual trace contract.'
purpose: 'Prevent active flows from creating a second hand-authored lifecycle record.'
version: '1.0.0'
date: '2026-08-10'
status: 'DEPRECATED'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - runtime-contract.md
  - flow-runs.md
tags: [dd-flow, deprecated, spc-004]
---

# Manual trace contract retired

SPC-004 removes the requirement for agents or prompts to create
`trace/*.md`. Do not create, index or read a manual trace as a lifecycle
authority and do not introduce a replacement manual trace format.

Use the CLI-owned `run.json`, append-only `timeline.jsonl`, generated stage
reports and generated protocol summary. Historical protocol evidence may keep
old trace paths as historical evidence; that language is not an active
instruction.
