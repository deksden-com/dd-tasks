---
file: '.memory-bank/dd-flow/README.md'
description: 'Canonical dd-flow prompt package and SPC-004/005/006 contract entry.'
purpose: 'Route agents through the Memory Bank SDLC while keeping runtime ownership explicit.'
version: '1.2.0'
date: '2026-08-12'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/index.md'
related_files:
  - index.md
  - common/runtime-contract.md
  - common/flow-runs.md
  - common/runtime-cli.md
  - schemas/index.md
tags: [dd-flow, prompts, spc-004, spc-005, spc-006, navigation]
---

# dd-flow

`dd-flow/` contains the canonical prompts that guide Memory Bank work. Durable
meaning remains in `.memory-bank/`; runtime facts remain in the CLI-owned RUN.
The normative breaking contracts for the current flow pack are
[SPC-004](../spec/engineering/SPC-004-flow-runtime-observability-workspaces-and-lint-throughput.md),
[SPC-005](../spec/engineering/SPC-005-single-source-plan-and-fast-plan-stage.md)
and [SPC-006](../spec/engineering/SPC-006-stage-bootstrap-and-context-packet.md),
implemented in the canonical follow-up protocol
`../protocol/PRT-341-spc-004-v2-spc-005-canonical-cutover.md`.

## Normal route

```text
prime.md (only without a selected practical task)
  -> vnext/start.md -> vNext SPECIFY
  -> protocolize / plan (after specified result)
  -> code.md -> mb-sdlc/code/implement.md -> readiness
  -> merge.md / merge-start.md -> merge/job.md -> merge/integrate.md
```

The current stage is created and completed through exactly two mechanical
actions:

```bash
dd-flow stage start <RUN> --stage <stage> --json
dd-flow stage finish <RUN> --stage <stage> --outcome <outcome> --json
```

For a discussed ordinary task, `vnext/start.md` materializes raw intake and
starts `flow launch --flow mb-sdlc-vnext-specify`. Launch returns the
authoritative context packet and generates its identical
`stage-prompt.md` audit projection; the agent performs semantic work in
`@stage`; finish derives mechanical facts, validates the semantic outcome and
unconditionally renders
`stage-report.json`, `stage-report.md`, `stage-report.html` and the protocol
summary/transition. Accepted stage artifacts are sealed; reruns create a new
`try-NNN` attempt.

## Shared contracts

- [common/runtime-contract.md](common/runtime-contract.md): single RUN state,
  timeline, stage prompt, finish input, generated artifacts, sessions, usage,
  validation, Worktrunk and mb-lint boundaries;
- [common/flow-runs.md](common/flow-runs.md): RUN home, stage roots and archive
  attempts;
- [common/runtime-cli.md](common/runtime-cli.md): mechanical commands and
  ownership;
- [common/lifecycle-guards.md](common/lifecycle-guards.md): predecessor gates;
- [schemas/index.md](schemas/index.md): machine-readable contracts;
- [common/workspace-bootstrap.md](common/workspace-bootstrap.md): project-owned
  bootstrap receipt and safe configuration;
- [common/style.md](common/style.md): Russian user-facing navigation blocks.

Historical protocol records may mention retired paths as evidence. Active
prompts, schemas, examples and templates must not instruct agents to use a
second RUN state, manual trace, report selector, current archive path, raw-Git
workspace fallback or model-authored mechanical telemetry.

## Flow ownership

Prompts own meaning and instructions. `dd-flow-cli` owns runtime enforcement,
session binding, Worktrunk activation and generated views. `mb-lint` owns
bounded async scanning and throttled `stderr` progress. Their implementation
protocols are linked from SPC-004; this repository does not duplicate their
source code.
