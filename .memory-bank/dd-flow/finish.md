---
file: '.memory-bank/dd-flow/finish.md'
description: 'Request same-RUN consolidation and independent completion after interactive work.'
purpose: 'Route explicit user intent through the bound CLI flow without manual runtime mutation.'
version: '1.0.0'
date: '2026-10-23'
status: 'DRAFT'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/index.md'
tags: [spc-014, hybrid, interactive]
---

# Finish: close intake in the existing interactive RUN

Flow origin: project-local. Select the actual interactive RUN; do not start a
second RUN, create a PRT or convert it into SDLC. Read its frozen
`execution-bundle/interactive/hybrid/index.md` relative to RUN home and the current
`dd-flow interactive inputs --project-root PROJECT --run RUN --json` output.

After the user's explicit finish request, preserve that actual message in a
bounded UTF-8 intake file and call `dd-flow interactive finish` with this RUN,
a stable request ID, that file and the current `--expected-inputs-sha256`.
Use `--help` for exact options. Text containing the word finish is not enough;
the explicit command closes intake. Retry the same identity/bytes after a lost
response. This is not Git inclusion consent or successful review.

The ordinary coordinator then settles interactive and continues
consolidation → hardening → review → integration within the same RUN. Reassess
the mutation scope after delivered input changes. Resolve original staged/dirty
file inclusion before review: a later user answer changes the reviewed task.
Hardening and independent review use registered Work and actual command checks.
Negative review stays in the same review Stage with separate correction Work.

Only accepted current review can reach scoped Git integration. Never mark
ready_for_merge, enqueue a legacy job, stash/reset unrelated changes or push on
the strength of a summary. A committed-but-unfinished operation must reconcile
its original custody, not repeat unknown effects. Report completion only after
ordinary terminal Stage and RUN settlement; preserve limitations and open issues.
Historical selected generations continue through their own pinned packets.
