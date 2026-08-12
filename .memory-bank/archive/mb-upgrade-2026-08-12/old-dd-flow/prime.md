---
file: '.memory-bank/dd-flow/prime.md'
description: 'Session priming without protocol creation.'
purpose: 'Load Memory Bank and active dd-flow SPC-004 context before a user selects practical work.'
version: '1.0.0'
date: '2026-08-10'
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

Priming does not create a protocol, specification, plan, stage, report,
summary, trace or project runtime state. It does not choose a task profile,
ask specification questions or start implementation. If the user explicitly
asks to create a protocol, continue with `protocol.md`.

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
- the next safe action: discussion, `protocol.md`, `interactive.md` or focused
  read-only research;
- project policy and active DEF visibility;
- the Memory Bank entry points read.

Do not create a manual trace. If a diagnostic flow needs durable lifecycle
evidence, use the canonical RUN/stage commands and generated artifacts.
