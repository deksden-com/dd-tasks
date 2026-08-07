---
file: '.memory-bank/dd-flow/mb-sdlc/review.md'
description: 'Project-level mb-sdlc-review flow with aspect reviewers, critic pass, JSON/HTML report and review-fix routing.'
purpose: 'Run on demand to review project conformance to specs/features/ADRs/scenarios/policies/code, optionally focused on a protocol, feature, subsystem or diff.'
version: '0.1.0'
date: '2026-06-30'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/mb-sdlc/README.md'
related_files:
  - .memory-bank/dd-flow/mb-sdlc/review/index.md
  - .memory-bank/dd-flow/mb-sdlc/review/aspects.md
  - .memory-bank/dd-flow/mb-sdlc/review/critics/universal.md
  - .memory-bank/dd-flow/mb-sdlc/review/critics/architectural-harmonization.md
  - .memory-bank/dd-flow/mb-sdlc/review/stage-report-template.html
  - .memory-bank/dd-flow/schemas/mb-sdlc-review-report.schema.json
  - .memory-bank/dd-flow/mb-sdlc/review-fix.md
tags: [dd-flow, mb-sdlc, review, aspects, critics, stage-report]
history:
  - version: '0.1.0'
    date: '2026-06-30'
    changes: 'Created project-level review flow prompt for PRT-049.'
---

# MB-SDLC Review

Read first:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/lifecycle-guards.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/subagents.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/browser-verification.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/dd-flow/mb-sdlc/plan-aspects/index.md`
- `.memory-bank/dd-flow/mb-sdlc/review/index.md`
- `.memory-bank/dd-flow/mb-sdlc/review/aspects.md`

Перед выбором глубины review примени `common/flow-flags.md` RUN snapshot
consumer gate: используй effective `plan.review.mode`, `subagents.route`,
`verification.depth` и `evidence.level` из `run.json`; при mismatch revision/
checksum остановись с `reconciliation_required`. Если optional report,
knowledge или HTML выключены, зафиксируй `not_applicable`/`reduced_artifact`,
не создавая пустой ceremony.

Then read durable MBB guidance:

- `.memory-bank/mbb/index.md`
- `.memory-bank/mbb/memory-bank-structure.md`
- `.memory-bank/mbb/spec-layer-guide.md`
- `.memory-bank/mbb/delivery-docs-guide.md`
- `.memory-bank/mbb/cross-references.md`
- `.memory-bank/mbb/coding-standards-guide.md`
- `.memory-bank/mbb/code-contracts-guide.md`
- `.memory-bank/mbb/scenario-docs-guide.md`
- `.memory-bank/mbb/seed-fixtures-guide.md`
- `.memory-bank/mbb/evals-experiments-guide.md`
- `.memory-bank/mbb/named-deferrals-guide.md`

## Review Object

`mb-sdlc-review` reviews the project state as a system.

A protocol, protocol set, feature, epic, subsystem, spec area or diff can be the focus lens, but the reviewed object remains the project. Do not reduce the flow to "review this protocol file" unless the user explicitly asks for a narrow document review outside `mb-sdlc-review`.

## Review vs Audit

- `mb-audit` checks whether the Memory Bank is complete, fresh, connected and agent-usable.
- `mb-sdlc-review` checks whether the project conforms to durable specs, features, epics, ADRs, scenarios, policies, protocol evidence and actual code.

If the user asks to audit the Memory Bank quality, route to `mb-audit.md`. If the user asks whether the project matches its declared architecture, features, contracts or evidence, stay in `mb-sdlc-review`.

## Focus Modes

Choose exactly one primary focus mode and record it in `review_focus`:

- `whole_project`
- `latest_protocol`
- `specific_protocol`
- `protocol_set`
- `subsystem_or_spec_area`
- `feature_or_epic`
- `diff_or_commit_range`

The focus determines evidence priority, not the review object. For example, `specific_protocol` means the protocol's changes receive special attention and the report links that protocol page, while project-level conformance and drift are still checked.

## Runtime And Workspace

Create or recover a `RUN-*` envelope with `flow_kind: mb-sdlc-review` or compatible legacy `review`. Use the home-run layout:

```text
<run-home>/
  01-intake/
    focus.md
    source-map.md
  02-aspect-review/
    aspect-coverage.md
    tasks/
    reports/
  03-critic-pass/
    candidate-findings.json
    universal-critic.md
    architectural-harmonization-critic.md
    critic-result.md
  04-review/
    stage-report.json
    stage-report.html
    final-report.md
    evidence/
```

Attach the review stage in the run index:

```bash
dd-flow run attach-stage "<RUN-ID>" --project-root "<project-root>" --stage review --dir 04-review --status running --data-schema-id dd-flow/mb-sdlc-review-report@1 --json
```

If `dd-flow` runtime is unavailable, record `runtime_cli_degraded` in `final-report.md` and do not claim dashboard integration evidence.

## Source Map

Build `01-intake/source-map.md` and `source_map` in JSON before aspect review. Include applicable sources:

- `.memory-bank/spec/product`, `.memory-bank/spec/system`, `.memory-bank/spec/engineering`, `.memory-bank/spec/operations`
- `.memory-bank/plans/epics/**`
- `.memory-bank/adr/**`
- `.memory-bank/scenarios/**`
- `.memory-bank/protocol/**`
- related `PSET-*`
- active `DEF-*`
- project policy/check profiles
- changed code, schemas, CLI commands, prompts, tests and runbooks
- run/stage reports and evidence for the focused protocol or diff

Missing expected sources are findings or `not_applicable` decisions, not silent omissions.

## Aspect Coverage

Create `02-aspect-review/aspect-coverage.md` before aspect workers start.

Every baseline aspect from [review/aspects.md](review/aspects.md) must appear with:

- applicability: `applicable`, `not_applicable` or `blocked`;
- coverage mode: `self_review`, `focused_subagent`, `multi_subagent`, `external_tool`, `degraded`;
- reason;
- task packet path;
- report path;
- status and verdict.

For non-trivial, high-risk, architecture/runtime/data/API/operations/release or user-requested deep review, use focused subagents. If subagents are technically unavailable, record a degraded review and explain the impact; do not pretend a solo pass is equivalent to aspect review.

## Critic Pass

Aspect reports produce candidate findings. Candidate findings are not final until critic pass completes.

Before the pass, declare `critic_execution_mode: orchestrator_local | delegated_subagent` in the review report. `orchestrator_local` reads the critic prompts and records its own reasoning, but never creates a fake subagent packet or report. `delegated_subagent` uses the canonical worker-session packet, one critic prompt as `role_prompt`, exact candidate findings in `read`, a bounded `write_report_to`, and named orchestration acceptance owner.

Read:

- `.memory-bank/dd-flow/mb-sdlc/review/critics/universal.md`
- `.memory-bank/dd-flow/mb-sdlc/review/critics/architectural-harmonization.md` when architecture coherence, spec refactoring, durable knowledge promotion, system boundaries, protocol sets, public contracts, runtime pipelines or many high-impact findings are involved.

The critic pass classifies each candidate as:

- `accepted`
- `downgraded`
- `rejected`
- `duplicate`
- `def_candidate`
- `review_fix_candidate`

Rejected and downgraded findings stay traceable in `critic_pass`, with rationale and evidence. The final report must not hide critic disagreement.

## Findings Register

Accepted findings use stable ids:

```text
FIND-SDLC-REVIEW-001
FIND-SDLC-REVIEW-002
```

Each finding records:

- type: `project_defect`, `spec_drift`, `code_drift`, `memory_bank_gap`, `frontmatter_crosslink_gap`, `coding_standards_gap`, `policy_process_gap`, `evidence_gap`, `observation` or `rejected_noise`;
- severity: `blocking`, `major`, `minor` or `informational`;
- confidence: `high`, `medium` or `low`;
- impact, evidence, affected objects and rootness;
- recommended disposition: `fix_now`, `create_protocol`, `create_protocol_set`, `create_DEF`, `report_only` or `reject`.

Blocking findings prevent an accepted verdict unless fixed before report or explicitly produce a failed/blocked verdict.

## Stage Report

Create:

```text
<run-home>/04-review/stage-report.json
<run-home>/04-review/stage-report.html
<run-home>/04-review/final-report.md
```

Validate the JSON:

```bash
dd-flow schema validate --schema mb-sdlc-review-report --file "<run-home>/04-review/stage-report.json" --project-root "<project-root>" --json
```

Generate HTML from `.memory-bank/dd-flow/mb-sdlc/review/stage-report-template.html` by replacing `<script id="review-data" type="application/json">`. Prove embedded JSON is semantically equal to standalone `stage-report.json` and save the proof under `04-review/evidence/`.

Required report sections:

- `schema_id`
- `run`
- `review_focus`
- `source_map`
- `aspect_coverage`
- `critic_pass`
- `findings_register`
- `conformance_summary`
- `review_fix_recommendation`
- `deferrals`
- `dashboard_links`

## Dashboard Integration

Refresh dashboards after the report when CLI support is available:

```bash
dd-flow dashboard refresh --project-root "<project-root>" --format html --json
```

Project dashboards should expose recent review runs. Protocol dashboards should expose review runs focused on that protocol. The review report should link back to project dashboard, protocol dashboard, related specs/features/ADRs/scenarios and follow-up protocols.

## Review-Fix Handoff

`mb-sdlc-review` diagnoses; it does not silently repair.

If accepted findings need repair, set `review_fix_recommendation.required: true` and give a compact next action:

```text
Run .memory-bank/dd-flow/review-fix.md with <review-run-id>.
```

`review-fix` discusses the findings with the user and creates ordinary executable protocols or a protocol set, then returns to normal `mb-sdlc`.
