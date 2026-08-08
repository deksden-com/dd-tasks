---
file: '.memory-bank/dd-flow/mb-sdlc/specify/discovery.md'
description: 'Bounded optional project discovery gate before requirements-method routing in specify.'
purpose: 'Resolve material problem-space uncertainty from authoritative project evidence before asking the user or selecting specialized gap-analysis methods.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/mb-sdlc/README.md'
related_files:
  - .memory-bank/dd-flow/common/specification.md
  - .memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/index.md
  - .memory-bank/dd-flow/common/context-discovery.md
tags: [dd-flow, specify, discovery, research, requirements]
---

# Specify Discovery

Discovery is an optional, read-only logical substep inside `specify`. It answers
named problem-space questions from the project before the requirements-gap
router decides which methods to use. It is not a new runtime stage, a spike
protocol or permission to design the implementation.

## Start with questions, not browsing

Before opening files, write the smallest set of questions that could change the
specification, for example:

- Is there an existing feature, entity, workflow or policy whose observable
  behavior should be preserved or offered as an analogy?
- Is the current behavior or compatibility rule already documented somewhere?
- Does an existing scenario define the accepted happy, alternate or error path?

If no question could change outcome, scope, acceptance, risk or an external
obligation, choose `research: skip` and record why.

## Research-depth routing

Choose exactly one level and record the decision before searching:

| Level | Select when | Action |
| --- | --- | --- |
| `skip` | Discussion and authoritative sources already settle outcome, scope and acceptance; task is local and reversible. | Run baseline scan only. |
| `memory_bank_first` | A durable spec, scenario, ADR, protocol, guide, policy or project convention may answer a material question. | Search named/relevant Memory Bank sources and stop when questions are settled. |
| `focused_project` | Memory Bank is missing or conflicting and the task affects public behavior, lifecycle, data, permissions, integration, migration, recovery or high-risk acceptance. | Inspect a bounded code/history/config surface with explicit queries and a stop condition. |

Hard triggers for at least `memory_bank_first`:

- the user asks to behave “as elsewhere” or names an analogue;
- an existing entity, role, status, workflow or policy is extended;
- compatibility or current behavior is part of acceptance;
- durable sources disagree.

Escalate to `focused_project` only when Memory Bank evidence is insufficient or
conflicting. Do not escalate merely because more confidence would be pleasant.

## Source order

Use the narrowest authoritative sources in this order:

1. current user discussion, raw intake and accepted protocol decisions;
2. relevant `spec/`, `scenarios/`, `adr/`, policy and guides in Memory Bank;
3. previous protocols and established project conventions;
4. focused code/config/history inspection only when the escalation trigger is
   present.

Generic methodology material is background, not evidence of this project's
requirements. Observed legacy behavior is evidence of what exists, not by itself
evidence of what the new behavior must be.

## Analogy strength

Record the strength of every analogy:

- `binding`: authoritative rule explicitly says to preserve or reuse it;
- `strong`: same project responsibility and no conflicting source; propose as
  default and record the evidence;
- `weak`: shape is similar but context differs; use as an option, never silently
  as a requirement;
- `conflict`: sources disagree; expose the conflict and ask only if the target
  behavior materially changes.

## Bounded search contract

For each research question record:

```yaml
research:
  level: skip | memory_bank_first | focused_project
  questions: []
  sources: []
  findings: []
  analogies:
    - source:
      strength: binding | strong | weak | conflict
      proposed_default:
      user_confirmation_required: false
  conflicts: []
  stop_reason:
```

Stop when every named question is resolved, disproven or converted into an
explicit unknown/gap. Also stop when a safe requirement or proposed default is
supported and further browsing would only increase confidence without changing
the decision. Record failed searches and unresolved facts; never turn silence
into a requirement.

## Output boundary

Discovery may produce project facts, analogy proposals, conflicts, unknowns and
questions for the gap ledger. It must not produce architecture, file layout,
data structures, implementation order, worker topology or routine Git choices.
Those belong to `plan` or to the agent's implementation work.

Discovery may supply source facts for the five-axis `task_assessment`, especially
`surfaces`, `reason` and `solution_uncertainty`. It does not choose flow flags,
infer assessment from research depth or artifact count, or read the selected
route back into assessment. The specification owner records the final five axes
and the one-way legacy projection.
