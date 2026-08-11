---
file: '.memory-bank/dd-flow/common/lifecycle-guards.md'
description: 'Ordered predecessor guards for the SPC-004 generated lifecycle.'
purpose: 'Fail closed when protocol, plan, code, readiness or merge evidence is missing.'
version: '1.0.0'
date: '2026-08-10'
status: 'DRAFT'
c4_level: 'policy'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - runtime-contract.md
  - runtime-cli.md
tags: [dd-flow, guards, lifecycle, spc-004]
---

# Lifecycle guards

The normal order is:

```text
protocol -> specify -> plan -> code -> readiness -> ready_for_merge -> merge -> closed
```

## Predecessors

- `protocol`: substantive user intent and protocol file;
- `specify`: accepted problem-space specification and questions state;
- `plan`: plan graph, aspect coverage and plan stage report;
- `code`: plan-ready handoff, selected workspace and stage prompt;
- `readiness`: implementation evidence, fresh checks and accepted findings;
- `ready_for_merge`: explicit protocol transition and merge handoff;
- `merge`: claimed merge session/worker, correct lane and post-merge evidence.

Missing evidence is a blocker. Do not infer completion from a file name or
manually edit runtime state to bypass a guard.

## Runtime evidence

Use `run.json`, `timeline.jsonl`, generated stage reports, generated summary,
protocol state and the current stage workspace. Archive attempts are evidence,
not current output. A mismatch among protocol state, RUN state and stage report
fails closed.

## Delivery boundary

Implementation/readiness sessions do not claim merge lanes or clean feature
workspaces. Only a registered merge session with the required lock/job may
integrate and perform cleanup. Release, deploy and publish remain separate
predecessor-gated contours.
