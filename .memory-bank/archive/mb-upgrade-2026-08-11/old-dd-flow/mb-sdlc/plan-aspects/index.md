---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/index.md'
description: 'Canonical MB-SDLC plan/readiness aspect catalog.'
purpose: 'Read during plan/review and code/readiness so agents can decide aspect applicability separately from coverage mode and leave a durable RUN aspect map.'
version: '0.7.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/mb-sdlc/README.md'
related_files:
  - .memory-bank/dd-flow/mb-sdlc/plan-aspects/aspect-worker.md
  - .memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/index.md
  - .memory-bank/dd-flow/mb-sdlc/plan/review.md
  - .memory-bank/dd-flow/mb-sdlc/code/readiness.md
  - .memory-bank/dd-flow/workers/verify.md
  - .memory-bank/dd-flow/schemas/plan-stage-report.schema.json
  - .memory-bank/dd-flow/schemas/code-stage-report.schema.json
tags: [dd-flow, aspects, planning, readiness, coverage-map, subagents]
history:
  - version: '0.7.1'
    date: '2026-08-09'
    changes: 'Made hard dependencies route-neutral and restricted grouping to independently promoted units.'
  - version: '0.7.0'
    date: '2026-07-27'
    changes: 'Added the final conditional execution-efficiency review aspect for coverage-preserving plan topology improvements.'
  - version: '0.6.0'
    date: '2026-07-26'
    changes: 'Added selected-aspect dependency graph, durable predecessor handoff and final integration review contract.'
  - version: '0.5.2'
    date: '2026-07-09'
    changes: 'Clarified that avoidable overcomplication is a defect covered by architecture and coding-standards aspects.'
  - version: '0.5.1'
    date: '2026-07-09'
    changes: 'Moved detailed pipeline ownership and concurrency subsection guidance from the catalog into dedicated aspect prompt files.'
  - version: '0.5.0'
    date: '2026-07-09'
    changes: 'Added dedicated aspect prompt library and fresh-session aspect-worker task packet contract.'
  - version: '0.1.0'
    date: '2026-06-25'
    changes: 'Created canonical aspect catalog and separated aspect applicability from coverage mode.'
  - version: '0.2.0'
    date: '2026-06-26'
    changes: 'Strengthened pipeline aspect with a single orchestration owner/source-of-truth invariant to prevent fragmented pipeline logic.'
  - version: '0.3.0'
    date: '2026-07-04'
    changes: 'Moved catalog to mb-sdlc/plan-aspects, added design-aspect traceability and testing-system design review aspects.'
  - version: '0.4.0'
    date: '2026-07-05'
    changes: 'Strengthened AI runtime aspect focus with model profiles, usage accounting, deterministic harness and consumer-adapter traceability.'
---

# MB-SDLC Plan Aspect Catalog

This catalog is the source of truth for named MB-SDLC plan/readiness aspects. It does not decide how deeply an aspect is reviewed. It defines what each aspect means, when it applies, and what plan/readiness should inspect.

## Prompt Library

Dedicated aspect prompts live in:

```text
.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspect-worker.md
.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/<aspect_id>.md
```

Focused SDLC aspect subagents are fresh sessions by default. They must not depend on hidden orchestrator context. The task packet routes the subagent to common priming, worker prompt, one aspect prompt, task/project sources and report path.

The catalog remains the aspect contract and index. The individual aspect files own aspect-specific grounding: what project sources to inspect, what findings block the gate and which DEF patterns are acceptable.

## Aspect State Model

Applicability and coverage are separate dimensions.

```yaml
aspect_id:
applicability: applicable | not_applicable | unknown
applicability_reason:
coverage_mode: none | self_check | focused_subagent | grouped_subagent | external_evidence | deferred_as_DEF | blocked
coverage_reason:
independence_reason: <required only for focused_subagent>
```

- `applicability` answers whether the aspect belongs to the task.
- `coverage_mode` answers how this run will cover the aspect.
- Subagents are a coverage choice, not proof that an aspect applies.
- `not_applicable` requires a reason. It is not a quiet omission.
- `unknown` must become a question, context discovery, blocker or `DEF-*` before a gate passes.
- `focused_subagent` requires an aspect-local `independence_reason`; task-level
  `full_plan`, `high` or another aspect's critical boundary is not sufficient.

Plan flow writes the current map to:

```text
<run-home>/02-plan/aspect-map.json
```

Readiness reads the plan map and verifies implementation coverage for applicable aspects.

## Grouping Compatibility

This compact table is a preference map, not an exact-bundle allowlist. Any
compatible subset of two or three units may form a group; omitting a preferred
member does not invalidate the rest. `must_separate_when` always wins.

| Compatibility family | `preferred_with` | `must_separate_when` | `max_group_size` |
| --- | --- | --- | --- |
| `system_design` | `architecture_design_quality`, `coding_standards_design_review`, `data_persistence_migration_review` | independently changed public/persisted boundary; mutation; incompatible snapshot/report contract | 3 |
| `contract_and_trust` | `api_contract_design_review`, `contract_propagation_design`, `security_privacy_review` | independent security/trust verdict; destructive or irreversible behavior; hard output dependency | 3 |
| `product_surface` | `ui_ux_accessibility_review`, `design_aspect_traceability_review`, `scenario_seed_eval_review` | different source snapshot; operational access; incompatible evidence contract | 3 |
| `verification_and_knowledge` | `testing_system_design_review`, `verification_evidence_review`, `memorybank_documentation_review` | independent gate required; conflicting evidence; hard output dependency | 3 |

A valid group is read-only, uses one immutable or read-equivalent snapshot, has
no `requires_output_of` edge or write conflict between members, and preserves
one report section, verdict and evidence set per unit. It contains only units
that independently passed the promotion gate. A focused unit stays separate;
it does not pull local secondary units into delegation. Two independently
critical boundaries stay separate by default.

## Dependency-Aware Execution

For a full plan with promoted aspect workers, the orchestrator builds one graph
from the selected applicable aspects. An aspect prompt exposes `depends_on`
only for predecessor outputs whose concrete data it reads and uses. A local
accepted aspect-map row and a delegated report are both valid outputs; the edge
does not promote its predecessor. It validates the
selected subgraph before launch: every selected hard prerequisite must exist,
and cycles block the plan. Unselected or justified `not_applicable`
prerequisites do not silently disappear; the aspect map records why the edge
is satisfied or not required.

Launch only the current topological wave. A hard `requires_output_of` edge must
name the exact consumed predecessor data and artifact path. Common inputs or
related subject matter create no edge. A dependent aspect may start after each
hard predecessor has an accepted output. A justified `not_applicable` verdict
satisfies the edge only when the successor contract permits missing data.
Capacity may split one wave into several runtime batches but never changes the
semantic graph or groups. The RUN-local packet names accepted predecessor paths.

After all selected hard aspects are accepted, the orchestrator runs one final
integration review. It reconciles cross-aspect findings, updates the aspect
map and plan graph, and records accepted/rejected findings. This is not a new
runtime lifecycle or scheduler.

## Staged Design Chain

Meaningful plans ground decisions in this proportional order:

```text
Product Design -> System Architecture -> Program Design -> Vertical Slice Design
```

Each dedicated aspect declares `design_stage`, hard `depends_on` and optional
`informs`. Product establishes the user outcome; System assigns the responsible
component boundary; Program defines contracts and implementation ownership;
Vertical Slice binds the change to scenarios, tests, evidence and delivery.
Select only applicable nodes. A skipped predecessor needs an explicit
`not_applicable` reason in the aspect map, never a silent omission. Specialist
aspects fan out only after their declared applicable foundation is accepted.

## Required Aspect Map Fields

Each item should include:

```yaml
aspect_id:
applicability:
applicability_reason:
coverage_mode:
coverage_reason:
independence_reason:
planned_artifacts:
actual_artifacts:
verdict:
findings:
deferrals:
```

Allowed `verdict` values:

- `pending`
- `accepted`
- `accepted_with_findings`
- `accepted_with_DEF`
- `needs_changes`
- `blocked`
- `not_applicable`

## Core Aspects

| Aspect | Applies when | Plan focus | Readiness focus |
| --- | --- | --- | --- |
| `goal_traceability` | Any non-trivial protocol, feature, fix or Memory Bank change. | Operational goal, constraints, in/out of scope, acceptance, no orphan work. | Actual result matches goal/constraints; no unplanned scope expansion. |
| `architecture_design_quality` | Non-trivial, multi-module, canonical-flow, runtime, contract, UI, data or AI/prompt change. | Minimal necessary entities, current consumers, lifecycle, ownership, C4 fit, no "for later" fields. | Actual diff remains coherent, no orphan docs/code/tests, no responsibility drift; avoidable overcomplication is a defect. |
| `coding_standards_design_review` | Code/prompt/schema/module changes or already-large files. | File/module boundaries, maintainability, testability, public entrypoints, standards source and minimal sufficient implementation. | Actual diff avoids monolith growth, boundary drift, hidden side effects, weak error handling and unused abstraction. |
| `verification_evidence_review` | Any deliverable result. | Checks, acceptance scenario, evidence level, manual verification/DEF, proof boundaries. | Evidence proves exactly the claimed gate and names skipped/deferred checks. |
| `def_blocker_review` | Any unresolved gap, external dependency, manual check or unknown that affects a gate. | Decide blocker vs DEF vs not applicable; define next gate and owner. | DEFs are precise, honest and not hiding current required work. |
| `memorybank_documentation_review` | Durable knowledge, policy, contract, scenario, runbook or prompt behavior changes. | Which Memory Bank layer owns the knowledge; indexes and cross-links. | Durable docs are updated or not-applicable reason is explicit. |
| `git_delivery_contour_review` | Code/docs changes, feature worktree, merge queue, release/deploy/publish or branch policy. | Git route, integration branch, worktree/branch ownership, delivery gates. | Branch/worktree state, queue handoff and cleanup policy are safe. |
| `design_aspect_traceability_review` | Specify stage selected one or more design aspects, or the task changes CLI, AI pipeline/model prompts, UI, API, realtime, pipeline, package, worker, data migration or eval behavior. | Every applicable specify design aspect is represented in requirements, plan items, acceptance, tests, scenarios, evidence or explicit DEF; user overrides outrank canonical defaults. | Actual implementation, docs, tests and evidence honor accepted defaults, deviations, user overrides and verification seeds without treating unselected aspect text as hidden requirements. |
| `testing_system_design_review` | Code/contract/runtime/CLI/API/UI/pipeline/data behavior changes. Docs-only tasks may mark it not applicable with reason. | Test levels, stage commands, runner conventions, datasets, fixtures, seeds/worlds, cleanup, scenario links, negative cases and design-decision coverage. | Planned tests/checks were actually added or run; skipped levels and data gaps are explicit and not hiding required current-gate work. |

## Conditional Aspects

| Aspect | Applies when | Plan focus | Readiness focus |
| --- | --- | --- | --- |
| `api_contract_design_review` | HTTP/RPC/SDK/CLI/API requests, responses, schemas, errors, auth, pagination, idempotency, rate limits or webhooks change. | Request/response contract, compatibility, versioning, auth, errors, rate limits, consumers and examples. | Actual code/docs/tests reflect the API contract; compatibility and errors are tested or deferred. |
| `network_realtime_design_review` | WebSocket, SSE, realtime subscriptions, streaming output, push/events, long-running sessions or offline/online sync change. | Connection lifecycle, reconnect/resubscribe, heartbeat, ordering, replay/backfill, auth refresh, cleanup and tenant/channel security. | Actual implementation handles reconnect, stale events, dedupe, gaps, cleanup, observability and security boundaries. |
| `contract_propagation_design` | Public or cross-module contract changes: schemas, statuses, CLI/TUI/GUI/MCP/SDK, events, fixtures or scenario contracts. | Propagation matrix across code, tests, docs, Memory Bank and consumers. | Changed contracts are reflected everywhere or precise `DEF-*` records the gap. |
| `pipeline_design_review` | Staged workflow, pipeline, lifecycle, multi-step algorithm, worker orchestration, queue/claim/lock flow, ETL, release/deploy/publish, scenario runner, model/tool pipeline, async/event processing or operator handoff changes. | Stage contract matrix, single orchestration owner/source of truth, durable handoff, statuses, errors, retry/resume, walkthrough. | Actual diff preserves stage contracts, handoff artifacts, failure/retry evidence and does not fragment global pipeline logic across unrelated modules. |
| `concurrency_pipeline_design` | Parallel workers/model stages, queues, locks, leases, aggregation, fan-out/fan-in, map-reduce, worker pools, async pipelines or shared state change. | Parallelization model, pattern, serialization point, locks/leases/timeouts, idempotency, deadlock/livelock/starvation, backpressure and observability. | Actual diff has atomic ownership, stale-worker safety, timeout cleanup, retry idempotency and stuck-state evidence. |
| `data_persistence_migration_review` | Database/schema/storage/queue/migration/backfill/transaction or durable data behavior changes. | Schema existence, migration/rollback, transaction boundaries, data safety, backup, seed/fixture impact. | Migrations/checks/evidence prove safe data behavior or precise DEFs exist. |
| `security_privacy_review` | Authn/authz, tenant isolation, secrets, permissions, PII, unsafe operations or data visibility changes. | Trust boundaries, roles, secrets, authorization checks, privacy surface and abuse cases. | Actual implementation enforces boundaries and has evidence for security-sensitive paths. |
| `observability_runtime_review` | Runtime behavior, external calls, async work, model/tool calls, queues, dashboard/status or failure investigation changes. | Logs, metrics, traces, correlation ids, state transitions, token/cost/latency/provider usage where relevant, stuck detection and operator visibility. | Actual diff emits/records enough evidence to diagnose failures without session memory while respecting privacy/redaction boundaries. |
| `external_integration_review` | Third-party providers, webhooks, remote APIs, quotas, sandbox/prod split or provider availability changes. | Provider contract, quotas, auth, sandbox/prod separation, fallback and error taxonomy. | Provider errors, retries/backoff, fallback and evidence are implemented or deferred. |
| `agentic_runtime_design_quality` | Prompts, model calls, tool use, provider profiles, token/cost accounting, repair/retry, context injection, worker orchestration or AI-generated artifacts change. | Prompt structure, source authority, model profile, usage accounting, validation, deterministic harness, compact-id roundtrip, provider/fallback/retry/repair and traceability. | Actual prompt/runtime behavior validates outputs, records profile/usage trace where relevant, keeps mechanical work in deterministic harness and does not rely on model memory for deterministic work. |
| `ui_ux_accessibility_review` | User-facing screen, component, dashboard, report, form, navigation or interaction changes. | Screen states, accessibility, keyboard/focus, loading/error/empty, responsive behavior and visual proof. | Browser/DOM/visual evidence proves the changed UI and no text/element overlap exists. |
| `performance_capacity_review` | Latency, throughput, large inputs, batching, caching, memory, queue depth, rate limits or resource constraints matter. | Expected load, limits, degradation, capacity checks and fallback behavior. | Measurements, tests or explicit non-applicability support the performance claim. |
| `execution_efficiency_review` | A full plan has meaningful implementation/verification topology after testing-system and evidence design. Compact local changes are not applicable. | Final coverage-preserving critique of duplicate checks, feedback levels, setup reuse, safe batching/parallelism and intentional serialization. | Implemented checks retain all proof boundaries while following the accepted topology. |
| `release_deploy_publish_review` | Version, changelog, release notes, tags, deploy/publish, registry/store or environment promotion changes. | Release vs deploy vs publish split, runbooks, rollback, target stage and evidence. | Merge/delivery report does not claim a stronger gate than evidence proves. |
| `scenario_seed_eval_review` | Acceptance scenario, seed/fixture/world setup, manual verification, eval/experiment or behavioral assessment is required. | Scenario contract, target environment, seed/fixture safety, eval axes/metrics/report template. | Scenario/eval evidence proves the gate or a precise DEF records skipped manual/eval work. |

## Detailed Aspect Guidance

The catalog intentionally stays compact. Detailed review method belongs to the dedicated aspect prompt files read by focused subagents.

- Pipeline orchestration ownership is part of `pipeline_design_review`; see `.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/pipeline_design_review.md`.
- Concurrency subsections are part of `concurrency_pipeline_design`; see `.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/concurrency_pipeline_design.md`.
- Delivery-process execution efficiency is part of `execution_efficiency_review`; it complements but never replaces product `performance_capacity_review` or correctness/evidence aspects.

## Task Packet Guidance

When a focused subagent receives an aspect task, include the common prompt and the specific aspect prompt. Do not paste the full aspect logic into the packet.

```yaml
role: sdlc_aspect_reviewer
session_mode: fresh_empty_session_required
common_prompt: .memory-bank/dd-flow/common/worker-session.md
worker_prompt: .memory-bank/dd-flow/workers/verify.md
role_prompt: .memory-bank/dd-flow/mb-sdlc/plan-aspects/aspect-worker.md
aspect_prompt: .memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/<aspect_id>.md
aspect_id:
protocol_id:
run_id:
stage:
catalog_source: .memory-bank/dd-flow/mb-sdlc/plan-aspects/index.md
applicability:
coverage_mode:
read:
  - <protocol summary>
  - <stage report>
  - <aspect map>
  - <diff/specs/adrs/scenarios/evidence/policy files>
write_report_to:
constraints:
```

Subagents cover assigned aspects. The orchestrator owns the whole aspect map and final applicability decisions.

If `coverage_mode` is `focused_subagent` or `grouped_subagent`, the stage report must show the aspect prompt path, task packet path or embedded packet summary, report path and whether the orchestrator accepted or rejected findings.
