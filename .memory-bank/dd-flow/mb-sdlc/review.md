---
file: '.memory-bank/dd-flow/mb-sdlc/review.md'
description: 'Compatibility reference to the canonical registered project-review workflow.'
purpose: 'Redirect legacy review navigation without starting a manual lifecycle.'
version: '0.2.0'
date: '2026-10-20'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/mb-sdlc/README.md'
related_files:
  - .memory-bank/dd-flow/mb-sdlc/review/aspects.md
tags: [dd-flow, review, compatibility, read-only]
---

# Project review compatibility reference

New work uses `review.md` from the selected global canon, not a project copy:
`dd-flow review` (alias of `dd-flow flow project-review`).
The CLI registers preflight → analyze → review → report and owns snapshot,
Work, independent critics, results and physical settlement. Do not manually
create the old 01-intake/02-aspect-review lifecycle, start a generic review
stage or refresh project dashboards from these reference pages.

An existing bound RUN continues only through its frozen packet and exact
continuation, never a new RUN or a switch to this source tree's engine.
[Aspect criteria](review/aspects.md) and [critic criteria](review/index.md)
remain reference material, not permission to dispatch local subagents.

Review is read-only: do not fix the reviewed project before reporting.
Blocking findings retain a failed/blocked verdict while unresolved; runtime
completion does not assert project conformance. A separately authorized repair
does not retroactively change this review's frozen inputs.

Scope approval alone does not authorize SDLC formalization or create PRT/PSET.
Only explicit formalization opens the selected SPECIFY-first route.
