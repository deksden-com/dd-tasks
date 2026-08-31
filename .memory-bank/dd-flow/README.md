---
file: '.memory-bank/dd-flow/README.md'
description: 'Canonical dd-flow prompt package and active SPECIFY-first SDLC runtime entry.'
purpose: 'Route agents through the stable Memory Bank SDLC with explicit runtime ownership and stage contracts.'
version: '2.0.0'
date: '2026-08-31'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/index.md'
related_files:
  - index.md
  - common/runtime-contract.md
  - common/flow-runs.md
  - common/runtime-cli.md
  - schemas/index.md
  - ../spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md
tags: [dd-flow, prompts, spc-004, spc-005, spc-006, spc-009, navigation]
history:
  - version: '2.0.0'
    date: '2026-08-31'
    changes: 'Promoted the accepted SPC-009/010/011 flow through CODE-REVIEW as the stable Memory Bank 4.0.0 contract paired with dd-flow CLI 0.8.0.'
  - version: '1.3.0'
    date: '2026-08-27'
    changes: 'Linked the coordinated SPC-009 beta target and separated its breaking design from the still-executable current flow contract.'
---

# dd-flow

`dd-flow/` contains the canonical prompts that guide Memory Bank work. Durable
meaning remains in `.memory-bank/`; runtime facts remain in the CLI-owned RUN.
The normative contracts for the current flow pack are
[SPC-004](../spec/engineering/SPC-004-flow-runtime-observability-workspaces-and-lint-throughput.md),
[SPC-005](../spec/engineering/SPC-005-single-source-plan-and-fast-plan-stage.md)
and [SPC-006](../spec/engineering/SPC-006-stage-bootstrap-and-context-packet.md),
[SPC-009](../spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md),
[SPC-010](../spec/engineering/SPC-010-agent-owned-verification-and-safe-hitl.md)
and [SPC-011](../spec/engineering/SPC-011-planned-verification-materialization.md),
implemented in the canonical follow-up protocol
`../protocol/PRT-341-spc-004-v2-spc-005-canonical-cutover.md`.

## Active coordinated runtime

[SPC-009](../spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md)
defines identity, Work/RUN materialization, runtime state, paths, reports,
snapshots and cleanup. The prompt pack, schemas and engine form one compatible
contract; do not cherry-pick individual runtime rules into an older engine.

## Normal route

```text
prime.md (only without a selected practical task)
  -> vnext/start.md -> vNext SPECIFY
  -> protocolize / plan (after specified result)
  -> vnext/code.md -> mandatory CODE verification
  -> optional vnext/code-review.md
  -> merge.md / merge-start.md -> merge/job.md -> merge/integrate.md
```

The current stage is created and completed through exactly two mechanical
actions:

```bash
dd-flow stage start <RUN> --project-root <root> --stage <stage> --json
dd-flow stage finish <RUN> --project-root <root> --stage <stage> --semantic-file <RUN-local-json> --json
```

For a discussed ordinary task, `vnext/start.md` materializes raw intake and
starts `stage start --bootstrap --stage specify`. It returns the
authoritative context packet and generates its identical
`stage-prompt.md` audit projection. That prompt names the result file, its
schema, a compact valid skeleton, and the exact `stage finish` invocation;
the worker does not discover those details itself. In the active flow,
SPECIFY finish validates and receipts the result, renders its Markdown
projection, and moves the RUN either to `waiting_for_user` or `specified`.
It deliberately creates no protocol before PROTOCOLIZE.

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
