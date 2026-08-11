---
file: '.memory-bank/dd-flow/review.md'
description: 'Root entrypoint for project-level mb-sdlc review.'
purpose: 'Use when the user asks to review the project, a protocol, a feature, an epic, a subsystem or a diff against durable project knowledge.'
version: '0.1.0'
date: '2026-06-30'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - .memory-bank/dd-flow/mb-sdlc/review.md
  - .memory-bank/dd-flow/mb-sdlc/review/index.md
  - .memory-bank/dd-flow/review-fix.md
  - .memory-bank/dd-flow/schemas/mb-sdlc-review-report.schema.json
tags: [dd-flow, mb-sdlc, review, project-review]
history:
  - version: '0.1.0'
    date: '2026-06-30'
    changes: 'Created root convenience entrypoint delegating project-level review to mb-sdlc/review.md.'
---

# Review Entrypoint

This is a convenience entrypoint. For execution, read and follow:

- [mb-sdlc/review.md](mb-sdlc/review.md)

Use this prompt only when the user explicitly asks for project review, protocol review, feature/epic review, subsystem/spec review or diff/commit-range review.

Do not use this prompt for `mb-audit`. `mb-audit` checks whether the Memory Bank itself is complete, current and usable. `mb-sdlc-review` checks whether the project state conforms to specs, features, ADRs, scenarios, policies, protocol evidence and code.
