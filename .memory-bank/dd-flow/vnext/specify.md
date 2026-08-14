---
file: '.memory-bank/dd-flow/vnext/specify.md'
description: 'Semantic instructions for the vNext SPECIFY proof flow.'
purpose: 'Turn a materialized user discussion and bounded project context into a self-contained requirement result before any protocol exists.'
version: '0.1.0'
date: '2026-08-14'
status: 'DRAFT'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/index.md'
related_files:
  - mb-sdlc-vnext-specify.json
  - ../mb-sdlc/specify/stage.md
tags: [dd-flow, vnext, specify, requirements, beta]
---

# vNext SPECIFY

Use the supplied user discussion and project grounding to define the problem
space before deciding how to implement it. Preserve material user intent,
identify scope, requirements, constraints, acceptance expectations and durable
assumptions. Ground conclusions in the supplied project sources.

Ask the user only when a decision is genuinely blocking and there is no
reasonable default. Do not ask for architecture, implementation order,
worktree, merge topology or preferred internal tools. Do not create a protocol,
plan, feature, epic, ADR or scenario in this stage.

`specified` means a fresh PROTOCOLIZE worker could continue from the result
without this conversation. `waiting_for_user` means the structured questions
are the only missing information needed to continue. Use `failed` only for a
real execution failure and `cancelled` only when the request was cancelled.
