---
file: '.memory-bank/mbb/aspects/00-aspect-contract.md'
description: 'Contract for canonical Memory Bank knowledge aspect files.'
purpose: 'Read when creating or changing an aspect so flow prompts reuse one canonical meaning instead of duplicating local definitions.'
version: '0.1.0'
date: '2026-05-24'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/aspects/index.md'
tags: [mbb, aspects, contract]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Defined reusable aspect contract and output requirements.'
---

# Aspect Contract

An aspect describes one durable area of project knowledge. It does not describe one flow.

Every aspect should define:

- scope: what belongs to this knowledge area;
- canonical targets: where the knowledge lives in the Memory Bank;
- project sources: where agents should look for facts;
- extraction questions: what to ask of docs, code, tests, configs, comments, Git, and user answers;
- mode guidance: how `init`, `upgrade`, `audit/analyse`, and `distill` use the same aspect differently;
- output: what an aspect worker returns to the orchestrator.

## Confidence

Aspect workers classify observations:

- `confirmed`: directly supported by a source.
- `inferred`: likely from structure or code, but not explicitly stated.
- `unknown`: important but not discoverable from available sources.
- `not_applicable`: the aspect does not apply to this project now.

## Output Contract

Each aspect worker returns:

```text
aspect:
mode:
sources_read:
confirmed_facts:
inferred_facts:
unknowns:
not_applicable:
canonical_targets:
recommended_updates:
questions_for_orchestrator:
defs_or_findings:
confidence_notes:
```

Subagents do not ask the user directly. They prepare questions with evidence, likely answer, recommendation, and target document. The orchestrator asks the user and records the answer.
