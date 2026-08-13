---
file: '.memory-bank/dd-flow/mb-sdlc/specify/stage.md'
description: 'Stage-specific semantic instructions for the generated SPECIFY prompt.'
purpose: 'Keep initial requirements discovery bounded after CLI-owned stage bootstrap.'
version: '0.1.0'
date: '2026-08-12'
status: 'DRAFT'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/mb-sdlc/README.md'
related_files:
  - discovery.md
  - gap-analysis/index.md
  - design-aspects/index.md
  - ../../common/runtime-contract.md
tags: [dd-flow, specify, stage, requirements, spc-006]
---

# SPECIFY stage

The generated stage packet is authoritative for Git, runtime, permissions,
aliases, session binding, write scope and completion command. Do not repeat
those checks or inspect CLI help/status/version. Read only the project sources
listed in `<required_context>`, then stop when its stated questions are settled
or become explicit gaps.

Determine the smallest applicable requirements methods. Record project facts,
problem-space gaps, question impact and scenario consequences. Ask the user
only for decisions that project evidence cannot settle; do not ask for
architecture, implementation order, worktree, merge or other solution-space
choices.

Write semantic results only to the target named by `<work_contract>`. If
blocking product questions remain, set `status: waiting_for_user` and preserve
each question as a structured item in `questions` (`id`, `question`, `impact`,
and a recommendation when known). If they do not, set `status: done`.
Do not hand-author reports, protocol summary/index, transition data or trace.
