---
file: '.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/index.md'
description: 'Umbrella router for optimized requirements-gap analysis during specify.'
purpose: 'Run a baseline completeness scan, select the smallest sufficient research/method contour and consolidate findings before planning.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/mb-sdlc/README.md'
children:
  - .memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/01-use-case-analysis.md
  - .memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/02-entity-operation-crud-plus.md
  - .memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/03-state-transition-analysis.md
  - .memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/04-decision-table.md
  - .memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/05-example-mapping.md
  - .memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/06-domain-storytelling.md
  - .memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/07-event-storming-light.md
  - .memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/08-misuse-cases.md
  - .memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/09-fmea-light.md
related_files:
  - .memory-bank/dd-flow/common/specification.md
  - .memory-bank/dd-flow/mb-sdlc/specify/discovery.md
  - .memory-bank/dd-flow/mb-sdlc/specify/design-aspects/index.md
tags: [dd-flow, specify, requirements, gaps, routing, methods]
---

# Requirements-gap router

This is the umbrella prompt for requirements completeness inside `specify`. It
is read after `common/specification.md` and before any selected method file.
It does not replace context discovery, semantic grounding, design aspects or
scenario guidance.

## Route in four passes

### 1. Baseline scan — always

Check only the facts that can change the accepted task:

- desired outcome and value;
- actors/affected parties, when relevant;
- scope and explicit non-goals;
- primary happy path;
- material alternate, rejection and error paths;
- business rules and externally visible constraints;
- acceptance evidence;
- assumptions, contradictions and source conflicts.

For a trivial, local and reversible task, this scan may be the complete result:
record `methods: baseline_only` and do not read specialized method files.

### 2. Optional discovery

Read `discovery.md`, choose `skip`, `memory_bank_first` or `focused_project`,
and record the questions, sources, facts, analogy strength, conflicts and stop
reason. Discovery is justified by uncertainty, not by the existence of a
research-shaped file.

### 3. Applicability matrix — before method files

Create a compact matrix. Do not read a method file until its row is selected.

```yaml
method_applicability:
  - method: entity_operation_crud_plus
    applicability: not_applicable | light | full
    signals: []
    reason:
    questions_to_answer: []
    stop_condition:
```

Use these signals:

| Method | Signals | Gaps sought |
| --- | --- | --- |
| Use Case Analysis | actor intent, user/system interaction, multi-step flow | preconditions, main/alternate/error flow, observable result |
| CRUD+ / Entity–Operation Matrix | named entity/resource/record, permissions or lifecycle operations | relevant create/read/change/archive/delete/restore/list/search/export and operation rules |
| State Transition Analysis | statuses, approval, retry, pause/resume, terminal states | illegal/missing transitions, guards, effects, recovery and terminal behavior |
| Decision Tables | roles, eligibility, conditions, business-rule combinations | uncovered combinations, conflicts, precedence and default outcome |
| Example Mapping | behavioral rule or acceptance claim needs concrete examples | rule/example mismatch, boundaries, counterexamples and acceptance ambiguity |
| Domain Storytelling | unfamiliar domain, several roles and handoffs | actors, artifacts, ownership and vocabulary |
| Event Storming Light | events, commands, async work or integrations | triggers, consumers, ordering, duplicate/retry/failure and completion |
| Misuse/Abuse Cases | permissions, trust boundary, sensitive data/action, abuse potential | unauthorized behavior, escalation, disclosure and safe rejection |
| FMEA Light | high consequence, irreversible action, operational hazard or costly failure | failure mode, impact, detection, prevention, recovery and residual risk |

Depth is proportional:

- `not_applicable`: no meaningful signal; do not read the file;
- `light`: one narrow signal; run only the relevant checklist section;
- `full`: method is central or an independent hard-risk trigger applies.

Prefer the smallest sufficient set, normally one to three methods. Select more
only when independent hard triggers remain after the first methods and record
why. Similar findings are deduplicated in the common ledger.

### 4. Consolidate and resolve

Every selected method writes conceptually into the same ledger; it does not
produce a separate user-facing report. Use this shape:

```yaml
gap_analysis:
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
  methods: []
  gaps:
    - id: GAP-001
      source_method:
      category: missing | ambiguous | conflicting | unverified_assumption
      problem_space: true
      impact: blocking | significant | non_blocking
      evidence: []
      affected_requirement:
      resolution: project_fact | proposed_default | user_decision | assumption | non_goal | deferral
      status: open | resolved | deferred
      question_id:
  scenario_coverage:
    happy_paths: []
    alternate_paths: []
    error_paths: []
  requirement_updates: []
```

Do not create a gap because an optional field is empty. A gap exists only when
omission, ambiguity, conflict or an assumption can materially change outcome,
scope, externally visible behavior, safety, obligation or acceptance.

## Gap resolution and question gate

Resolve in this order:

1. current user statement or authoritative project fact;
2. strong analogue, recorded as a proposed default unless binding;
3. safe agent-owned default that stays in solution space and can be chosen in
   plan;
4. reversible assumption or explicit non-goal for low-risk uncertainty;
5. user question only if the remaining choice changes problem-space acceptance;
6. blocker or named deferral when external authority is required.

Questions may address outcome, scope, business rules, roles/permissions,
lifecycle semantics, irreversible effects, compatibility, risk tolerance,
external obligations and acceptance evidence. They must not ask the user for
architecture, schemas, endpoints, files, implementation sequence, worker
strategy or routine Git/tooling choices.

Each material question has a stable `Q-*` id, why it matters, two or three
meaningful options, a recommendation with rationale and the scope/acceptance
effect. The user may state a different option. Ask only the highest-impact
questions, preferably no more than three per round; never reopen a fixed `Q-*`.

## Stop conditions and protected errors

Stop the router when baseline and selected method target questions are answered,
every material branch is recorded, and remaining unknowns are explicit
assumptions, non-goals, questions or deferrals. Protect against:

- method explosion: weak signals do not select every method;
- research sprawl: no named question or stop reason means no research;
- checklist cargo cult: empty optional fields do not become requirements;
- silent analogy adoption: weak/conflicting analogies become options or questions;
- happy-path-only output: material rejection/error paths remain visible;
- solution-space leakage: user is never asked to design the implementation;
- duplicate reports: all findings stay in one `gap_analysis` ledger.

## Scenario routing examples

- Clear local task: `research: skip`, `methods: baseline_only`, no user question.
- Existing entity extension: `memory_bank_first`; CRUD+ `full`, Use Case `light`.
- Approval workflow: State Transition `full`, Decision Table `full`, Example
  Mapping `light`.
- Async external side effect: focused project research, Event Storming Light,
  Misuse Cases or FMEA only when their independent triggers remain.
- Conflicting analogy: record the conflict and propose options; do not silently
  convert observed legacy behavior into a requirement.

Design-aspects are selected through their own index and recorded separately.
They may seed plan verification, but they do not count as requirements methods
and must not be substituted for this applicability matrix.
