---
file: '.memory-bank/dd-flow/common/lifecycle-guards.md'
description: 'Ordered predecessor guards for the SPC-004 generated lifecycle.'
purpose: 'Fail closed when protocol, plan, code, readiness or merge evidence is missing.'
version: '1.2.0'
date: '2026-10-26'
status: 'DRAFT'
c4_level: 'policy'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - runtime-contract.md
  - runtime-cli.md
tags: [dd-flow, guards, lifecycle, spc-004]
history:
  - version: '1.2.0'
    date: '2026-10-26'
    changes: 'Separate accepted results from native retirement and preserve conflict-aware resource safety.'
  - version: '1.1.0'
    date: '2026-10-07'
    changes: 'Grounded active seven-stage SPECIFY-first predecessors; historical protocol lifecycle no longer governs new work.'
---

# Lifecycle guards

The active SDLC stage catalog has this normal order:

```text
specify -> protocolize -> plan -> plan-review -> code -> code-review -> merge
```

PLAN-REVIEW and CODE-REVIEW may be skipped only through the accepted frozen
policy and runtime-issued edge; the agent does not skip them by convenience.
Terminal RUN completion follows accepted MERGE and its required coverage.
Historical protocol transitions are evidence of their pinned engine, not the
new-work dispatcher. Target generic memory-flow descriptors remain SPC-014 E3/E4
work and are not activated by this document.

## Predecessors

- `specify`: substantive intake and explicit formalization; no PRT is required;
- `protocolize`: accepted SPECIFY requirements and resolved material questions;
- `plan`: accepted PROTOCOLIZE, materialized PRT/PSET and immutable workspace route;
- `plan-review`: accepted PLAN and applicable review policy;
- `code`: accepted or explicitly skipped PLAN-REVIEW and implementation graph;
- `code-review`: verified CODE and independent review policy;
- `merge`: accepted CODE/CODE-REVIEW route, queued MRG job, correct owner/lock
  and fresh required checks; physical cleanup/usage coverage remain separate gates.

Missing evidence is a blocker. Do not infer completion from a file name or
manually edit runtime state to bypass a guard.

## Accepted results and technical retirement

The accepted dd-flow Work/Stage result is authoritative after required validation
and checks. A late native error, an idle child card or failed daemon shutdown does
not revoke that result. Record technical remarks and pending cleanup separately;
do not rerun accepted Work or send another model prompt merely to close a session.
After submitting an accepted result, the worker stops writing and ends its Turn.

The controller owns cleanup and progression. A completed Work does not prove its
unfinished siblings or Stage gate complete. A possible writer in a shared
workspace must be stopped or isolated before conflicting work; preserve the
accepted result while reconciling that dependency. An unavailable result or
unknown operation effect still requires reconciliation, never guessed success
or blind replay. Native launch identity and independent reviewer evidence remain
required at assignment start, not re-proved through a fresh tool event at every
managed result submission. Follow only the selected engine's issued commands;
these instructions grant no manual bypass for older pinned engines.

## Runtime evidence

SQLite owns mechanical state; use its CLI projections, timeline, accepted stage
results and current workspace. Generated summary is a view, not a replacement
writer. Missing or inconsistent receipts require exact scoped reconciliation,
not manual state edits. Archive attempts are evidence, not current output.

## Delivery boundary

Implementation/readiness sessions do not claim merge lanes or clean feature
workspaces. Only a registered merge session with the required lock/job may
integrate and perform cleanup. Release, deploy and publish remain separate
predecessor-gated contours.
