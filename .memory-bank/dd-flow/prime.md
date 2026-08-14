---
file: '.memory-bank/dd-flow/prime.md'
description: 'Session priming before a user chooses or formalizes practical work.'
purpose: 'Load the Memory Bank and the active flow entrypoint for a later user-led SDLC start.'
version: '1.2.0'
date: '2026-08-14'
status: 'DRAFT'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - .memory-bank/dd-flow/common/runtime-contract.md
  - .memory-bank/dd-flow/index.md
  - .memory-bank/dd-flow/common/style.md
tags: [dd-flow, prime, session, spc-004]
---

# Prime: session priming

Read the project Memory Bank entry points, project policy, MBB indexes and the
active dd-flow catalog. Also read `common/runtime-contract.md` so later work
uses one RUN state, generated stages and the explicit ownership boundaries.

Use this entrypoint only when no practical task is selected. When a user asks
to create, change or plan a concrete task, do not run a standalone priming
ritual first: after any harness-required Goal, route through the active
user-level flow entry. In this beta that entry is `vnext/start.md`; its
`stage start --bootstrap --stage specify` command returns the bounded stage
instructions that matter for the task.

Priming does not create a protocol, specification, plan, stage, report,
summary, trace or project runtime state. It does not choose a task profile,
ask specification questions or start implementation.

When a later user says “оформи протокол”, “создай протокол”, “заведи протокол”
or an equivalent request, start the active user-level entry
`vnext/start.md`. It starts SPECIFY-first work; it does **not** create a
`PRT-*` before the problem space is specified. Do not return to `protocol.md`
for that new-work trigger in this beta.

## Required reading

- `.memory-bank/index.md`;
- `.memory-bank/structure.md`, when present;
- `.memory-bank/project-policy.md`, when present;
- `.memory-bank/mbb/index.md`;
- `.memory-bank/dd-flow/index.md`;
- `.memory-bank/dd-flow/common/style.md`;
- `.memory-bank/dd-flow/common/runtime-contract.md`;
- `.memory-bank/dd-flow/common/lifecycle-guards.md`.

## Output

Return a short Russian summary containing:

- `prompt: prime.md`;
- `protocol: not_created`, unless an existing protocol was explicitly selected;
- `runtime_state: not_created`;
- `current_stage: primed`;
- `completed_stage: priming`;
- the next safe action: discussion, `vnext/start.md`, `interactive.md` or
  focused read-only research;
- project policy and active DEF visibility;
- the Memory Bank entry points read.

Do not create a manual trace. If a diagnostic flow needs durable lifecycle
evidence, use the canonical RUN/stage commands and generated artifacts.
