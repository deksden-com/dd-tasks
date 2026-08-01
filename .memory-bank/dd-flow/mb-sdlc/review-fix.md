---
file: '.memory-bank/dd-flow/mb-sdlc/review-fix.md'
description: 'Follow-up flow for turning accepted mb-sdlc-review findings into ordinary executable protocols.'
purpose: 'Use after mb-sdlc-review when the user wants to decide what findings to repair and create protocol(s) or protocol set.'
version: '0.1.0'
date: '2026-06-30'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/mb-sdlc/README.md'
related_files:
  - .memory-bank/dd-flow/mb-sdlc/review.md
  - .memory-bank/dd-flow/protocol.md
  - .memory-bank/dd-flow/protocol-implement.md
tags: [dd-flow, review-fix, findings, protocols]
history:
  - version: '0.1.0'
    date: '2026-06-30'
    changes: 'Created review-fix flow prompt.'
---

# Review-Fix

`review-fix` is the follow-up flow after `mb-sdlc-review`.

It does not fix the project directly. It discusses accepted review findings with the user, selects repair scope and creates ordinary executable `PRT-*` protocols or a coordination-only `PSET-*`.

## Inputs

Read:

- the review run id or review report path given by the user;
- `<review-run>/04-review/stage-report.json`;
- `<review-run>/04-review/final-report.md`;
- any linked project/protocol dashboard pages;
- related specs/features/ADRs/scenarios/protocols/DEFs from the review report.

Validate the review report if possible:

```bash
dd-flow schema validate --schema mb-sdlc-review-report --file "<review-run>/04-review/stage-report.json" --project-root "<project-root>" --json
```

If the report is missing or invalid, stop with a precise blocker. Do not invent repair scope from memory.

## User Discussion

Show the user:

- accepted findings;
- severity/confidence/actionability/rootness;
- critic rationale;
- suggested grouping;
- recommended repair option.

Ask only problem-space questions that materially affect repair scope. Do not ask the user to do orchestration work the system can decide.

## Repair Scope

For each accepted finding, choose one:

- `repair_now_in_protocol`
- `repair_in_protocol_set`
- `defer_as_DEF`
- `report_only`
- `reject_after_user_review`

If several findings share one root cause and one verification route, group them into one protocol. If repair exceeds one executable SDLC cycle, create a `PSET-*` with several executable member protocols and `blocked_by_protocols` dependencies.

## Output

Create or update:

- protocol(s) under `.memory-bank/protocol/PRT-*`;
- optional set under `.memory-bank/protocol/_set/PSET-*`;
- raw review input reference in each protocol frontmatter;
- related specs/features/ADRs/scenarios links;
- `source_user_input` and `source_review_report`;
- `blocked_by_protocols` when ordering is required.

Then route each created protocol through normal `mb-sdlc`:

```text
protocol -> specify -> plan -> code/readiness -> merge
```

Do not mark review findings fixed until the repair protocol is merged/closed or the finding is explicitly rejected with evidence.
