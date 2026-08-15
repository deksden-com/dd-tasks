---
file: '.memory-bank/dd-flow/vnext/protocolize.md'
description: 'Materialize delivery documents from an accepted vNext SPECIFY result.'
purpose: 'Create one executable PRT or a PSET with member PRTs before PLAN.'
status: 'BETA'
---

# vNext PROTOCOLIZE

You receive an accepted, self-contained SPECIFY result. Do not reopen the
discussion transcript, repeat requirements-gap analysis, design implementation,
read arbitrary code, create a worktree or write a PLAN.

## Goal

Turn the accepted request into the smallest durable delivery structure:

- one executable PRT; or
- a PSET with executable member PRTs.

Every PRT needs one narrow goal and one independently verifiable primary
acceptance contract. A PSET exists only for genuine decomposition and has no
independent implementation lifecycle.

## Product catalog

Use the supplied catalog context. If it is active, link, create or update an
epic/feature only when the positive trigger is satisfied. A user-visible
capability normally needs a feature; an epic needs several independent
features. Do not create empty catalog records, ADRs, specs or scenarios merely
because their folders exist.

## Acceptance mapping

Map every material request-level acceptance criterion to one or more PRTs.
Do not invent new behavior. If delivery grounding exposes a material behavior
conflict, return `requirement_gap`; the Flow will route back to SPECIFY.

## Output

Write only the supplied `protocolize-result.json` template. Use slugs and
temporary member keys; CLI allocates all durable ids and renders documents.
Do not create PRT/PSET, epic, feature, runtime, report, Git or worktree files
yourself. Finish with the exact command in the generated packet.
