---
file: '.memory-bank/dd-flow/review-fix.md'
description: 'Root entrypoint for turning accepted mb-sdlc-review findings into normal executable protocols.'
purpose: 'Use after a project-level review when the user wants to discuss accepted findings and create repair protocols or protocol sets.'
version: '0.1.0'
date: '2026-06-30'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - .memory-bank/dd-flow/mb-sdlc/review-fix.md
  - .memory-bank/dd-flow/mb-sdlc/review.md
tags: [dd-flow, review-fix, findings, protocols]
history:
  - version: '0.1.0'
    date: '2026-06-30'
    changes: 'Created root convenience entrypoint delegating review finding repair planning to mb-sdlc/review-fix.md.'
---

# Review-Fix Entrypoint

This is a convenience entrypoint. For execution, read and follow:

- [mb-sdlc/review-fix.md](mb-sdlc/review-fix.md)

`review-fix` does not repair findings silently. It discusses accepted review findings with the user, selects the repair scope and creates ordinary executable `PRT-*` protocols or a coordination-only `PSET-*` when the repair scope is too large for one SDLC cycle.
