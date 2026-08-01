---
file: '.memory-bank/mbb/evals-experiments-guide.md'
description: 'Canonical guide for evals and experiments as agentic assessment artifacts.'
purpose: 'Read when deterministic scenarios are not enough and the project needs metric/aspect-based evaluation of system, agent or model behavior.'
version: '0.1.0'
date: '2026-06-23'
status: 'DRAFT'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
related_files:
  - .memory-bank/mbb/scenario-docs-guide.md
  - .memory-bank/mbb/verification-matrix-guide.md
  - .memory-bank/mbb/ai-runtime-prompt-architecture.md
tags: [mbb, evals, experiments, agentic-assessment, evidence]
history:
  - version: '0.1.0'
    date: '2026-06-23'
    changes: 'Created evals/experiments model with aspect scoring and HTML+JSON report guidance.'
---

# Evals And Experiments

Scenarios prove that a system can pass a defined path. Evals and experiments assess behavior when pass/fail is not enough or the result requires agentic judgment.

## Distinctions

- `Scenario`: executable acceptance contract for a capability, lifecycle block or user/operator path.
- `Eval`: structured assessment of behavior by criteria, metrics and aspect verdicts.
- `Experiment`: exploratory run that studies behavior, compares alternatives or gathers findings.

An eval or experiment can use scenarios as input, but it must not replace a deterministic acceptance scenario when deterministic proof is available.

## When To Use

Use evals/experiments when:

- model, prompt or agent behavior is non-deterministic;
- output quality needs scoring across criteria;
- operator/user workflow quality needs focused review;
- a scenario run needs post-run agentic analysis beyond pass/fail;
- the team wants a baseline, threshold or regression check;
- system behavior must be studied before becoming a formal gate.

Do not create evals "for texture". They need a decision, risk, baseline or learning goal.

## Report Model

Eval/experiment reports should use the `dd-flow` static report pattern:

```text
prepared HTML template + validated JSON data
```

The report should include:

- subject and run id;
- mode: `exploratory`, `baseline`, `gate` or `regression`;
- input scenario/fixtures/evidence;
- aspect axes and scores;
- findings table;
- metric summary;
- threshold if a gate exists;
- model/provider/tool trace if AI behavior is evaluated;
- what the result proves;
- what the result does not prove.

For `dd-flow` self-evals, use `.memory-bank/dd-flow/evals/` or `.memory-bank/dd-flow/experiments/`. For project product/runtime evals, prefer a project-level `.memory-bank/evals/` shelf and link it from `structure.md`.

## Aspect Examples

- correctness;
- robustness;
- reproducibility;
- evidence quality;
- observability;
- operator/user clarity;
- safety and data isolation;
- prompt/runtime quality;
- cost/latency where relevant;
- regression risk.

## Agentic Review

If the result needs model-assisted review, use focused reviewers:

- each reviewer gets one aspect or a small coherent group;
- reviewers receive source evidence and evaluation criteria;
- the orchestrator fact-checks reports before synthesis;
- final report separates evidence, inference and judgment.

## Template Rule

Do not invent a one-off design for eval reports. Reuse existing `dd-flow` visual language and template conventions. Validate JSON data when the eval is a gate. Run browser/DOM smoke for non-trivial HTML, including light/dark/system theme behavior.

## Closure

Eval results can become:

- exploratory findings;
- baseline;
- regression gate;
- `DEF-*`;
- scenario update;
- prompt/runtime change;
- ADR or spec update.

They do not become acceptance verdicts unless the owning protocol, scenario or verification matrix explicitly accepts them for a named gate.
