---
file: '.memory-bank/dd-flow/vnext/protocolize.md'
description: 'Materialize delivery documents from an accepted vNext SPECIFY result.'
purpose: 'Create one executable PRT or a PSET with member PRTs before PLAN.'
status: 'BETA'
---

# vNext PROTOCOLIZE

You receive an accepted, self-contained SPECIFY result. Do not reopen the
discussion transcript, repeat requirements-gap analysis, design implementation,
read arbitrary code, create a worktree or write a PLAN. The CLI has already
created the project-selected workspace before this stage begins.

## Delivery decision

The supplied frozen Git policy is authoritative. Decide only the delivery
shape, PRT/PSET topology and durable product links. Do not choose a branch,
path or bootstrap command. On the finish command, `dd-flow` allocates durable
ids, validates the already provisioned workspace, registers it, and
materializes the PRT, PSET and feature documents there. A feature-worktree
route then starts PLAN in a new session from the returned workspace path. The
finish receipt contains the exact branch, base commit and write workspace;
that receipt is mandatory input to every later mutating stage.

First record `scope_sizing_verdict`:

- `single_executable_protocol` — one vertical slice can be planned and coded
  without a dependency boundary;
- `single_compact_protocol` — one deliberately small change;
- `specification_with_slices_required` — several independently useful slices
  are necessary; use a PSET.

Do not use a PSET merely to make work look parallel. A `protocol_set` needs at
least two members, a decomposition rationale and execution topology. Keep
technical design, aspect analysis, task graphs, subagent routing and test
details for PLAN.

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

## Obligation ownership

Allocate every supplied `R-*` and `AC-*` exactly once in
`obligation_ownership`; do not paraphrase or invent behavior. An obligation
may list multiple temporary `member_keys` only when it genuinely spans slices,
never as blanket duplication. Every member must own at least one `AC-*`.
The primary acceptance is a concise member contract, not a duplicate PLAN.
The CLI writes the exact accepted statements into the PRT/PSET documents.

Preserve the accepted actor/entity/state vocabulary exactly. In particular, do
not turn a project-owned lifecycle or permission into a task-owned lifecycle
just because the task is the mutation target. If such a mismatch is exposed,
pause this same Work as a material semantic conflict instead of materializing
a PRT whose literal acceptance cannot be proven. When the user's answer
changes the wording of an already accepted obligation, retain SPECIFY as
historical input and add exactly one `obligation_amendments` item: target id,
replacement, reason and returned `HITL-*` reference. PLAN uses that effective
wording; it never rewrites the original SPECIFY artifact.

If PROTOCOLIZE itself exposes a material user decision with no reasonable
default, pause this same PROTOCOLIZE Work, ask the question returned by the
CLI, resume it with the raw answer, and then complete the delivery decision.
Never restart or return to SPECIFY for HITL.

## Durable context

`durable_links` contains existing Memory Bank paths worth retaining as links:
epics, features, specs, ADRs and scenarios. Keep `preserve_raw_intake=false`
by default. Set it only when the verbatim wording has a concrete durable audit,
legal or contractual value that the semantic SPECIFY artifact cannot retain.
Never create placeholder docs. Creating or revising a spec, ADR or scenario
requires its own positive trigger and explicit content; otherwise link the
existing document or leave its list empty.

For a PSET, write `delivery.pset`:

- its selected execution mode and the `before_first_code` confirmation gate;
- a concise dependency graph based only on real blocked-by, overlap or
  boundary constraints;
- feasible modes with their trade-offs, and excluded modes with a reason.

Give every member a concise `role`. Mark a member blocked only by another
member key; members without blockers are startable now.

## Output

Write only the supplied `protocolize-result.json` template. Use slugs and
temporary member keys; CLI allocates all durable ids and renders documents.
When `feature.action` is `create`, fill its `epic_path`, `title`, `slug` and
short `summary`; they are required to create a useful, indexed feature record.
For `link` or `update`, fill the existing feature's epic path and slug; CLI
adds the new PRT ids to its `related_protocols` backlink idempotently. Leave
those fields empty only for `not_applicable`.
Replace every empty template placeholder, including `obligation_ownership`,
before the one finish command. Do not run a separate syntax check:
the finish command validates the result and returns any actionable error.
Do not create PRT/PSET, epic, feature, runtime, report, Git or worktree files
yourself. Finish with the exact command in the generated packet.
