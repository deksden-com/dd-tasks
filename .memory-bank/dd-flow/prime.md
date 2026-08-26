---
file: '.memory-bank/dd-flow/prime.md'
description: 'Session priming before a user chooses or formalizes practical work.'
purpose: 'Load the Memory Bank and the active flow entrypoint for a later user-led SDLC start.'
version: '1.3.0'
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

Use this entrypoint before a user explicitly formalizes practical work. A
concrete request, a clarification, an approval of a direction or a discussion
of constraints is still discussion: do not create runtime state or start a
flow from it. In this beta the only ordinary user-level entry is the explicit
formalization trigger described below; it opens `vnext/start.md` and its
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

Do not infer that trigger from task details, a proposed solution, an answer to
a question, “ок”, “давай” without the formalization object, or a request to
discuss/estimate/explore. In those cases remain in normal conversation and
wait for the user to explicitly ask for a protocol/formalization.

For that recognized trigger, `stage start` is the first practical command:
do not re-read flow, CLI, Git or runtime material first. Choose a short slug
and pipe only the material user discussion already present in this session
(request, answers and constraints; no agent inference) to:

```bash
cat <<'USER_INTAKE' | dd-flow stage start --bootstrap --stage specify \
  --project-root "<project-root>" --subject "<slug>" --intake-stdin --json
<raw material user discussion>
USER_INTAKE
```

Treat the returned `worker_prompt_markdown` as the complete task from then on.

## Required reading

- `.memory-bank/index.md`;
- `.memory-bank/structure.md`, when present;
- `.memory-bank/project-policy.md`, when present;
- `.memory-bank/mbb/index.md`;
- `.memory-bank/dd-flow/index.md`;
- `.memory-bank/dd-flow/common/style.md`;
- `.memory-bank/dd-flow/common/runtime-contract.md`;
- `.memory-bank/dd-flow/common/lifecycle-guards.md`.

Read these required sources in predictable batches of two or three files.
This avoids truncated tool output and repeated reads; if a source itself is
long, read its consecutive chunks. Once a file arrived intact, do not re-read
it solely for confidence.

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
