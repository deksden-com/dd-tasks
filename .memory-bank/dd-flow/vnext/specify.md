---
file: '.memory-bank/dd-flow/vnext/specify.md'
description: 'Canonical-specify semantic work adapted to the vNext SPECIFY → PROTOCOLIZE order.'
purpose: 'Produce a portable problem-space contract before any executable protocol is created.'
version: '0.2.0'
date: '2026-08-14'
status: 'DRAFT'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/index.md'
related_files:
  - mb-sdlc-vnext-specify.json
  - ../common/specification.md
  - ../mb-sdlc/specify/discovery.md
  - ../mb-sdlc/specify/gap-analysis/index.md
  - ../mb-sdlc/specify/design-aspects/index.md
tags: [dd-flow, vnext, specify, requirements, beta]
---

# vNext SPECIFY

You own the full canonical **problem-space** work of SPECIFY. The supplied
discussion is the source of user intent; the supplied runtime packet is
authoritative for operational facts. Do not repeat CLI, Git, compatibility or
permission discovery. Do not create a protocol, plan, feature, epic, ADR or
scenario document in this stage.

Your result must let a fresh PROTOCOLIZE worker continue without access to this
conversation. It is a semantic handoff, not a technical design: do not decide
architecture, file layout, endpoints, task ordering, worktree, merge topology
or worker topology.

Start from the supplied Memory Bank navigation excerpts. They are the bounded
context-discovery entry points; follow only links that are material to the user
problem (for example a matching feature/spec, scenario, ADR, policy or prior
protocol). Do not read the whole bank by default. Record every selected source
as research evidence or in the PROTOCOLIZE handoff.

## Required specification

Record all of the following in the result contract:

- user problem, desired goal and affected actors where applicable;
- functional requirements, non-functional requirements and constraints;
- in-scope and intentionally out-of-scope behavior;
- acceptance criteria and one concrete acceptance scenario: initial state,
  actor, steps and observable ready state;
- automated and manual verification, fixture/world/cleanup needs, and whether
  an eval/experiment is needed rather than a deterministic scenario;
- durable assumptions, fixed and open `Q-*` questions;
- project/policy facts that materially constrain accepted behavior;
- independent task assessment axes and their legacy projection;
- a delivery shape: one executable protocol or a protocol set with vertical
  value slices; and a compact handoff to PROTOCOLIZE.

Use the smallest reasonable product decision. A missing optional detail is not
a gap. Ask the user only when there is no safe, reasonable default and the
choice changes outcome, scope, business rule, role/lifecycle semantics,
irreversible effect, compatibility, risk or acceptance evidence. Never ask the
user to design the implementation.

## Canonical requirements-gap pass

Do this in the following order and record it in the result.

1. **Baseline scan — always.** Check outcome/value, actors, scope/non-goals,
   happy path, material alternate/error paths, business rules, acceptance
   evidence, assumptions and conflicts. A clear trivial local task may end
   with `methods: ["baseline_only"]`.
2. **Research gate — only for named uncertainty.** Choose `skip`,
   `memory_bank_first` or `focused_project`. Use Memory Bank durable sources
   before code/history. Record questions, sources, findings, analogy strength,
   conflicts and a stop reason. Stop as soon as the named question is resolved,
   disproved or converted to an explicit gap; do not search merely for more
   confidence.
3. **Applicability matrix before method files.** Make exactly one compact row
   for each of all nine methods below: `not_applicable`, `light` or `full`, with signal, reason,
   question and stop condition. Read a method file only for `light` or `full`.
   Normally select one to three methods; more needs independent hard-risk
   triggers and an explicit reason.

   | Method | Read when selected |
   | --- | --- |
   | `use_case_analysis` | `.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/01-use-case-analysis.md` |
   | `entity_operation_crud_plus` | `.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/02-entity-operation-crud-plus.md` |
   | `state_transition_analysis` | `.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/03-state-transition-analysis.md` |
   | `decision_table` | `.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/04-decision-table.md` |
   | `example_mapping` | `.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/05-example-mapping.md` |
   | `domain_storytelling` | `.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/06-domain-storytelling.md` |
   | `event_storming_light` | `.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/07-event-storming-light.md` |
   | `misuse_cases` | `.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/08-misuse-cases.md` |
   | `fmea_light` | `.memory-bank/dd-flow/mb-sdlc/specify/gap-analysis/methods/09-fmea-light.md` |

   Signals: interaction flow → use case; entity/lifecycle operation → CRUD+;
   states/approval/retry → state transition; condition combinations → decision
   table; behavioral rule boundaries → example mapping; unfamiliar roles and
   handoffs → domain storytelling; events/async/integration → event storming;
   trust boundary/sensitive action → misuse; irreversible/high consequence →
   FMEA. `light` means only the narrow relevant checklist, not a reduced full
   project.
4. **One ledger and resolution gate.** Consolidate research and selected
   method findings into the one `gap_analysis`: gaps, requirement updates and
   happy/alternate/error coverage. Resolve in order: current user statement or
   authoritative fact; strong analogy as a stated proposed default; safe
   solution-space default; reversible assumption/non-goal; then at most three
   highest-impact user questions; or an explicit deferral/blocker. Never make
   separate reports per method.

For every material user question, use `Q-001` IDs and include why it matters,
two or three meaningful options, recommendation and rationale, and the
scope/acceptance effect. Preserve answered questions as `fixed`; do not reopen
them. `waiting_for_user` is valid only when at least one `open` question
remains. `specified` is valid only when no `open` question remains.

## Design aspects, assessment and handoff

Consult `.memory-bank/dd-flow/mb-sdlc/specify/design-aspects/index.md` only
when a relevant aspect is signalled (for example CLI, AI pipeline/model prompt
or web UI). For every selected aspect, read its source and record applicability,
accepted canonical defaults/deviations, user overrides and verification seeds.
Do not turn a design aspect into a hidden requirement. Put its verification
seeds in `handoff`.

Assess independently: scope breadth, solution novelty, solution uncertainty,
failure impact and the derived plan floor. A cross-layer task or request to
plan is not by itself a `full_plan` trigger. Preserve the one-way legacy
projection (`size`, `risk`, `planning_route_hint`, `verification_mode`).

If this is too large for one executable protocol, set `delivery_shape.kind` to
`protocol_set` and give vertical slices with one goal and acceptance scenario
each. Do not ask the user how to slice it. Otherwise use `single_protocol`.

`handoff` is deliberately small: tell PROTOCOLIZE the outcome it must preserve,
the exact artifacts/facts it must read, any remaining gate, and verification
seeds. Do not restate runtime data or implementation details there.

Use `failed` only for a real execution failure and `cancelled` only when the
request was cancelled.
