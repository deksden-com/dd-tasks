---
file: '.memory-bank/dd-flow/mb-sdlc/review/index.md'
description: 'Execution model for mb-sdlc-review.'
purpose: 'Read before running project-level review so focus modes, artifacts, critics, reports and dashboard links stay consistent.'
version: '0.1.0'
date: '2026-06-30'
status: 'DRAFT'
c4_level: 'documentation'
parent: '../review.md'
children:
  - aspects.md
  - critics/universal.md
  - critics/architectural-harmonization.md
  - stage-report-template.html
tags: [dd-flow, review, index, aspects, critics]
history:
  - version: '0.1.0'
    date: '2026-06-30'
    changes: 'Created mb-sdlc-review execution index.'
---

# MB-SDLC Review Index

`mb-sdlc-review` is an on-demand diagnostic flow. It answers:

> Does the project state match the durable knowledge and delivery evidence the project claims to have?

The flow is project-level even when focused on a protocol, feature, epic, subsystem or diff.

## Artifact Chain

```text
source map
-> aspect coverage and aspect reports
-> candidate findings
-> critic pass
-> stage-report.json
-> stage-report.html
-> final-report.md
-> optional review-fix protocol(s)
```

`stage-report.json` is the source of truth for the visible HTML and final summary.

## Minimum Accepted Review

An accepted review must have:

- focus mode and reviewed object;
- source map;
- aspect coverage map;
- at least one review mode per applicable aspect;
- critic pass over candidate findings;
- JSON schema validation;
- HTML/JSON equality proof;
- clear next action: no repair needed, review-fix, DEF, or blocked/degraded rerun.

## Findings Do Not Repair The Project

The review report can create or reference DEFs if the finding must be discoverable, but it must not silently edit project code/docs to fix findings. Repairs go through `review-fix` and ordinary executable protocols.
