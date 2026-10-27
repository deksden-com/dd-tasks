---
file: '.memory-bank/dd-flow/README.md'
description: 'Canonical dd-flow prompt package and active SPECIFY-first SDLC runtime entry.'
purpose: 'Route agents through the stable Memory Bank SDLC with explicit runtime ownership and stage contracts.'
version: '2.1.0'
date: '2026-10-18'
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
  - version: '2.1.0'
    date: '2026-10-18'
    changes: 'Kept canonical design provenance portable and described installed hybrid init/upgrade without activating remaining workflow families.'
  - version: '2.0.1'
    date: '2026-10-07'
    changes: 'Grounded selected vNext route, typed controls and diagnostic scope; separated legacy and future flow entrypoints.'
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
Canonical design provenance for the SDLC pack is retained in
[SPC-004](https://github.com/deksden/dd-memorybank/blob/cc36fc4ec1331fde12a1ca49b00143c087e035cc/.memory-bank/spec/engineering/SPC-004-flow-runtime-observability-workspaces-and-lint-throughput.md),
[SPC-005](https://github.com/deksden/dd-memorybank/blob/cc36fc4ec1331fde12a1ca49b00143c087e035cc/.memory-bank/spec/engineering/SPC-005-single-source-plan-and-fast-plan-stage.md),
[SPC-006](https://github.com/deksden/dd-memorybank/blob/cc36fc4ec1331fde12a1ca49b00143c087e035cc/.memory-bank/spec/engineering/SPC-006-stage-bootstrap-and-context-packet.md),
[SPC-009](https://github.com/deksden/dd-memorybank/blob/cc36fc4ec1331fde12a1ca49b00143c087e035cc/.memory-bank/spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md),
[SPC-010](https://github.com/deksden/dd-memorybank/blob/cc36fc4ec1331fde12a1ca49b00143c087e035cc/.memory-bank/spec/engineering/SPC-010-agent-owned-verification-and-safe-hitl.md),
[SPC-011](https://github.com/deksden/dd-memorybank/blob/cc36fc4ec1331fde12a1ca49b00143c087e035cc/.memory-bank/spec/engineering/SPC-011-planned-verification-materialization.md)
and the canonical follow-up
[PRT-341](https://github.com/deksden/dd-memorybank/blob/cc36fc4ec1331fde12a1ca49b00143c087e035cc/.memory-bank/protocol/PRT-341-spc-004-v2-spc-005-canonical-cutover.md).
These immutable source-repository references are not required consumer-project
files. Do not copy foreign specifications into a project to satisfy navigation.
The selected installed canon, descriptor and engine remain execution authority;
source history does not authorize a different generation.

## Active coordinated runtime

[SPC-009](https://github.com/deksden/dd-memorybank/blob/cc36fc4ec1331fde12a1ca49b00143c087e035cc/.memory-bank/spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md)
defines identity, Work/RUN materialization, runtime state, paths, reports,
snapshots and cleanup. The prompt pack, schemas and engine form one compatible
contract; do not cherry-pick individual runtime rules into an older engine.

## Normal route

```text
explicit formalization -> vnext/start.md
  -> specify -> protocolize -> plan -> plan-review -> code -> code-review -> merge
```

The selected CLI packet supplies each exact command and output contract.
PLAN_REVIEW and CODE_REVIEW may be skipped only by the accepted CLI policy and
directive; the catalog alone does not authorize a skip. MERGE uses
`vnext/merge.md` and its returned `merge apply`, repair/retry and finish commands,
not the retained legacy `merge/job.md` route.

Stage entry and semantic finish use these command families:

```bash
dd-flow stage start <RUN> --project-root <root> --stage <stage> --json
dd-flow stage finish <RUN> --project-root <root> --stage <stage> --semantic-file <RUN-local-json> --json
```

An ordinary authorized task or discussion does not create RUN/PRT. `prime.md`
loads context read-only; `go.md` distinguishes ordinary work, explicit new
formalization and selected runtime continuation. For explicit formalization,
`vnext/start.md` starts `stage start --bootstrap --stage specify` with raw intake
prepared by the Controller/adapter, not agent-inferred scope. It returns the
authoritative context packet and generates its identical
`stage-prompt.md` audit projection. That prompt names the result file, its
schema, a compact valid skeleton, and the exact `stage finish` invocation;
the worker does not discover those details itself. In the active flow,
SPECIFY finish validates and receipts the result, renders its Markdown
projection, and moves the RUN either to `waiting_for_user` or `specified`.
It deliberately creates no protocol before PROTOCOLIZE.

Typed pause/answer, block/unblock, Work launch, checks and bounded repair may
also be required by the selected packet. Start/finish are not the entire control
surface. Runtime state belongs to CLI-owned SQLite; generated JSON, timeline and
Markdown are projections, not a second writable lifecycle.

Historical RUN continuation requires its supported pinned engine and exact
scope. Retained legacy wrappers and `flow-contract@6` do not redefine active
vNext. Missing binding fails closed instead of registering a replacement RUN.
For the installed hybrid generation, `dd-flow setup` installs computer-level
canon and engine custody; it does not initialize a project. `dd-flow init` starts
the selected `mb-init` flow and `dd-flow upgrade` starts `mb-upgrade`, each in its
own RUN. They use the same descriptor/controller and frozen stage-packet
mechanism as `dd-flow flow mb-init` and `dd-flow flow mb-upgrade`.
Existing RUNs continue through their retained engine pins; installing a newer
canon does not retarget them. The installed setup and explicit selection must
admit this generation: merely finding a CLI executable is not admission.
Other Memory workflow families retain their supported route until their own
installed family gate; this README does not activate future E5 descriptors.

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
