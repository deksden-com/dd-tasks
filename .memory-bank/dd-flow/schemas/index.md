---
file: '.memory-bank/dd-flow/schemas/index.md'
description: 'Canonical machine-readable SPC-004/005/006 contracts.'
purpose: 'Map schema ids to generated runtime artifacts and semantic input.'
version: '1.4.5'
date: '2026-10-16'
status: 'DRAFT'
c4_level: 'schema-catalog'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - ../common/runtime-contract.md
  - ../common/flow-runs.md
tags: [schemas, dd-flow, spc-004, spc-005, spc-006, plan]
history:
  - version: '1.4.5'
    date: '2026-10-16'
    changes: 'Indexed the CLI-owned six-stage hybrid upgrade result contract.'
  - version: '1.4.4'
    date: '2026-10-08'
    changes: 'Indexed CLI-owned initial-review and bounded-correction contracts; productive repair and mb-init qualification remain pending.'
  - version: '1.4.3'
    date: '2026-10-08'
    changes: 'Indexed versioned E3 bootstrap Git-state admission without changing retained receipt@1 or activating public init.'
  - version: '1.4.2'
    date: '2026-10-08'
    changes: 'Indexed the CLI-owned draft E3 composition Work result without activating productive memory handlers.'
  - version: '1.4.1'
    date: '2026-10-07'
    changes: 'Grounded selected active copies against CLI-owned contracts, vNext PLAN and causal CODE review checks.'
  - version: '1.4.0'
    date: '2026-08-14'
    changes: 'Added the semantic result schema for the isolated vNext SPECIFY beta flow.'
  - version: '1.3.0'
    date: '2026-08-12'
    changes: 'Documented structured implementation guidance for newly authored protocol plan items.'
---

# Schema catalog

The active schema set has one owner per fact. JSON is the canonical machine
payload; Markdown and HTML are deterministic renders. Schemas do not make the
agent author mechanical facts.

| Schema id | File | Owner |
|---|---|---|
| `dd-flow/flow-contract@6` | `../flow-contract.json` | canonical contract |
| `dd-flow/flow-run@3` | `flow-run.schema.json` | compact current RUN projection |
| `dd-flow/run-engine-binding@1` | `run-engine-binding.schema.json` | immutable executor binding beside a RUN |
| `dd-flow/timeline-event@1` | `timeline-event.schema.json` | safe append-only event |
| `dd-flow/stage-prompt@2` | `stage-prompt.schema.json` | generated context/prompt |
| `dd-flow/stage-start-response@2` | `stage-start-response.schema.json` | start receipt with rendered prompt |
| `dd-flow/stage-finish-input@1` | `stage-finish-input.schema.json` | semantic agent input |
| `dd-flow/stage-report@2` | `stage-report.schema.json` | generated stage report with inline summary |
| `dd-flow/verification-matrix@1` | `verification-matrix.schema.json` | derived accepted PLAN/receipt view, not semantic acceptance |
| `dd-flow/plan-review-result@1` | `plan-review-result.schema.json` | reviewer-local PLAN findings |
| `dd-flow/plan-review-decision@4` | `plan-review-decision.schema.json` | canonical PLAN decisions, bound duplicate/DEF dispositions |
| `dd-flow/code-review-result@1` | `code-review-result.schema.json` | reviewer-local CODE findings |
| `dd-flow/code-review-decision@3` | `code-review-decision.schema.json` | canonical CODE finding decisions with causal repair checks |
| `dd-flow/plan-stage-report@5` | `plan-stage-report.schema.json` | generated PLAN receipt projection |
| `dd-flow/protocol-plan@6` | `protocol-plan.schema.json` | vNext semantic protocol plan; CLI owner file is `vnext-protocol-plan.schema.json` |
| `dd-flow/protocol-summary@1` | `protocol-summary.schema.json` | generated durable summary |
| `dd-flow/session-usage@1` | `session-usage.schema.json` | session/usage coverage |
| `dd-flow/memorybank-delta@1` | `memorybank-delta.schema.json` | post-write validation |
| `dd-flow/worktrunk-workspace@1` | `worktrunk-workspace.schema.json` | verified workspace result |
| `dd-flow/mb-lint-progress@1` | `mb-lint-progress.schema.json` | lint output boundary |
| `dd-flow/engine-manifest@1` | `engine-manifest.schema.json` | immutable engine snapshot and schema registry |
| `dd-flow/memory-bootstrap-receipt@2` | [memory-bootstrap-receipt-v2.schema.json](memory-bootstrap-receipt-v2.schema.json) | draft E3 bootstrap with independently observed committed/unborn Git state; not semantic Memory Bank acceptance |
| `dd-flow/mb-upgrade-stage-result@1` | [mb-upgrade-stage-result.schema.json](mb-upgrade-stage-result.schema.json) | CLI-owned six-stage upgrade semantic result; schema validity is not preservation or readiness acceptance |

The existing domain-specific `*-stage-report.schema.json` files remain
semantic payload profiles for release, review and delivery contours. They are
not alternative runtime authorities. The selected stage finish contract owns
its accepted result and generated report views; legacy semantic envelopes do
not replace the typed vNext stage results.

## Rules

- SQLite owns current RUN state; `run.json` is a generated portable projection,
  not a second writable lifecycle authority.
- `engine-binding.json` is a router-owned immutable sidecar, not a second RUN
  state. It identifies the exact checksum-verified engine snapshot that must
  execute commands for that RUN. New RUNs receive it at allocation; a legacy
  RUN can receive it only after a successful read probe by the selected engine.
- The legacy stage prompt envelope has eight ordered sections. vNext packets
  follow their selected stage-specific returned contract; the envelope does
  not authorize manually constructing or substituting that packet.
- `stage-finish-input` accepts semantic values only. Mechanical facts are
  generated by the CLI.
- New vNext PLAN uses `protocol-plan@6`. It lives at
  `.memory-bank/protocol/<PRT-ID>/plan.json`; runtime progress, workers,
  timestamps and derived evidence are never plan fields.
- Newly authored plan items use `details` for an actionable
  guidance block with an approach, ordered steps, controls, pitfalls, stop
  conditions and completion criterion. Its `checks[]` is the check catalog;
  items and acceptance use `check_refs`. Every `@check` alias includes its
  accepted command definition. Historical accepted `protocol-plan@1` files
  are handled through their supported pinned engine, not revalidated against @6.
- Completed stage reports have JSON, Markdown, HTML and summary views according
  to the selected finish contract. Pause, block and repair are not completion.
- Session coverage distinguishes `complete`, `partial` and `unavailable`.
- Cache-read and cache-write tokens are distinct and nullable.
- Delta validation names changed files/links and ignores unrelated pre-existing
  findings.
- Worktrunk results require an official pinned verified artifact.
- mb-lint progress is `stderr`; final text/JSON result is `stdout`; concurrency
  is bounded at `32` and findings are deterministic.
- A RUN-bound artifact resolves its schema from the immutable engine snapshot's
  `schema_registry`, not from a later project canon; the registry stores each
  schema `$id` (including its version), path and checksum. The binding is the
  exact engine snapshot checksum, not merely the package version; historical
  snapshots without a manifest registry use an explicit checksum-bound
  compatibility registry and otherwise fail closed.

Validate changed JSON with the installed CLI schema command when its engine
knows the schema id; otherwise use the repository's schema-capable test
runner and record a degraded CLI note rather than inventing a pass.

Executable schemas belong to dd-flow-cli. Canon files are selected checked
copies, not a competing registry. Source-only copy verification does not
activate a release or migrate an existing RUN. The E1 hybrid schemas remain
CLI-owned; canon carries checked examples under `examples/spc-014`, not new
executable schema copies.

E3 draft: [composition Work result](memory-composition-work-result.schema.json)
is a checked copy of the CLI-owned output contract for writer and assembly
Works. Preparation binds assigned packet identity, unit coverage and observed
artifact bytes. It does not prove SQL packet custody, physical Session settlement
or semantic completeness, and does not activate unfinished mb-init handlers.

E3 draft: [independent review Work result](memory-review-work-result.schema.json)
binds one unit, wave and immutable packet to exact evidence. Material findings
cannot accompany an accepted review and each finding cites its assigned unit.
[Correction plan](memory-review-correction-plan.schema.json) binds retained
review identity to a bounded dependency graph, material findings, approved
profiles and project-owned Memory Bank write paths.
[Repair Work result](memory-repair-work-result.schema.json) names exact
before/after hashes and causal resolution deltas. These checked CLI-owned
copies establish result shapes, not physical write permission, accepted repair,
independent delta re-review or completion. The memory handler group and public
init remain pending until the complete E3/G3 qualification.
