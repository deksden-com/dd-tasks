---
file: '.memory-bank/dd-flow/common/worker-session.md'
description: 'Shared session primer for worker, verifier, scout and aspect-review subagents.'
purpose: 'Read before specialized worker prompts so focused subagents use explicit task packets, light project priming and source-backed reports instead of hidden orchestrator context.'
version: '0.4.0'
date: '2026-07-25'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - .memory-bank/dd-flow/common/subagents.md
  - .memory-bank/dd-flow/common/workspace-bootstrap.md
  - .memory-bank/dd-flow/workers/code.md
  - .memory-bank/dd-flow/workers/docs.md
  - .memory-bank/dd-flow/workers/verify.md
  - .memory-bank/dd-flow/mb-sdlc/plan-aspects/aspect-worker.md
tags: [dd-flow, subagents, workers, priming, task-packet]
history:
  - version: '0.5.0'
    date: '2026-08-07'
    changes: 'Added route-aware grouped packet, per-unit report and focused recovery contract for PRT-336.'
  - version: '0.4.0'
    date: '2026-07-25'
    changes: 'Added deterministic rendered-prompt contract: one registered profile, selected plan-item execution context, semantic spine, bounded discovery and RUN-local provenance artifacts.'
  - version: '0.1.0'
    date: '2026-07-09'
    changes: 'Created shared worker-session primer for PRT-079.'
  - version: '0.2.0'
    date: '2026-07-10'
    changes: 'Added compact workspace-bootstrap receipt and blocker handoff for workers that run project tooling.'
  - version: '0.3.0'
    date: '2026-07-10'
    changes: 'Made this file the sole normative owner of common task-packet vocabulary and defined wrapper-versus-leaf specialization semantics.'
---

# Worker Session Primer

This file is for the subagent that performs focused work. Orchestrators use `.memory-bank/dd-flow/common/subagents.md` to decide when and how to delegate; workers use this primer to enter the task safely.

Use the simplest sufficient context. Do not add extra prompt layers, statuses, fields or documents unless the current task packet has a real consumer for them.

## Required Task Packet

The task packet is the source of truth. It must name:

```yaml
role: <semantic worker role id, for example code_worker, knowledge_extraction, capacity_probe or mb_upgrade_diff_analysis>
session_kind: llm_worker
session_mode: fresh_empty_session_required | fresh_empty_session_preferred | forked_context_allowed | recovery_continuation
context_authority:
  task_packet: primary
  referenced_files: primary
  forked_orchestrator_context: advisory_only
common_prompt: .memory-bank/dd-flow/common/worker-session.md
worker_prompt: .memory-bank/dd-flow/workers/<code|docs|verify|repair>.md
role_prompt: <complete role specialization or optional consumed shared role wrapper>
aspect_prompt: <one leaf aspect specialization when applicable>
target_prompt: <one leaf target specialization when applicable>
read:
  - <project/protocol/stage/source files>
write:
  - <allowed paths or read-only>
write_report_to:
handoff:
  acceptance_owner:
  predecessor_reports:
    - aspect_id:
      verdict: accepted | not_applicable
      report_path:
  recovery_attempt_paths: []
routing:
  route: self_check | grouped_subagent | focused_subagent
  coverage_unit_ids: []
  job_id:
  group_id:
  wave_id:
  batch_id:
  requires_output_of: []
  related_to: []
  capacity_observation_ref:
constraints:
checks:
workspace_bootstrap:
  contract: .memory-bank/dd-flow/common/workspace-bootstrap.md
  requirement: required | not_required
  producer:
  gate:
  action: produce | revalidate | record_not_required
  receipt_path:
  candidate_receipt:
  status: <status from contract, if already known>
  blocker_or_def_handoff:
```

This is the sole normative definition of common packet fields and incomplete-packet behavior. `common/subagents.md` owns delegation, launch, recovery and acceptance, but references this contract instead of defining a second field vocabulary.

`routing` is run-local execution metadata, not a new lifecycle entity. The
selection/coverage artifact records all three canonical routes:
`self_check`, `grouped_subagent` and `focused_subagent`. `self_check` has no
worker packet or independent session claim; it must leave source-backed
orchestrator evidence. A delegated packet uses `focused_subagent` for one
unit or `grouped_subagent` for a compatible subset.

`requires_output_of` names the exact accepted predecessor output needed to
start the packet. `related_to`/`informed_by` name context only. `group_id`
identifies units sharing one job, `wave_id` is semantic dependency depth, and
`batch_id` is only the capacity slice. Capacity comes from the referenced
RUN-local observation; zero is valid and unknown capacity is never replaced by
one.

For a probe, keep `session_kind: llm_worker` and set `role: capacity_probe`.
Its bounded packet reads no project sources, performs no priming/project tools,
holds the accepted slot for 60 seconds and returns its assigned unique token.

## Grouped Packet Variant

The focused one-leaf packet remains the default. A grouped packet uses one
explicit `grouped_review` wrapper and one checked leaf entry per covered unit;
it does not paste unrelated leaf prompts into one field:

```yaml
group_manifest:
  group_id: <stable run-local id>
  route: grouped_subagent
  snapshot_anchor: <immutable/read-equivalent snapshot>
  anchor_unit_id: <optional focused anchor>
  compatibility_source: .memory-bank/dd-flow/mb-sdlc/plan-aspects/index.md
  units:
    - unit_id: <coverage unit>
      aspect_prompt: <one checked leaf path>
      read_scope: []
      write_scope: []
      report_obligation:
        layout: grouped_sections | per_unit_file
        path: <group or unit report path>
```

The grouped wrapper is valid only when the flow-owned compatibility and
separation rules, snapshot, read-only scope, trust level and report contract
have passed orchestrator checks. A focused anchor may carry two compatible
secondary units without changing their routes. Missing metadata is not inferred.

## Grouped Report and Recovery

A grouped report keeps unit evidence addressable even when one session covers
several units:

```yaml
group_id:
session_id:
snapshot_anchor:
units:
  - unit_id:
    attempt_id:
    completeness: complete | incomplete
    verdict: accepted | incomplete | blocked | degraded
    findings: []
    evidence_refs: []
    limitations: []
    report_ref:
cross_unit_synthesis: <after all unit sections>
```

An affected-unit recovery keeps the original attempt addressable:

```yaml
recovery:
  unit_id: <affected coverage unit>
  original_packet: <path>
  failure_note: <path>
  prior_report: <path>
  original_job_id:
  attempt_id: <new attempt>
  parent_attempt_id: <failed attempt>
  report_path: <new report path>
  promotion: pending | authoritative
```

The group is accepted only when every covered unit is accepted. A partial
result preserves accepted units, marks the affected unit `incomplete` and
does not use a shared synthesis as its evidence. Recovery preserves the
original packet/report, adds a failure note and a new attempt/report path for
only the affected unit; accepted units are not rerun. The recovery packet
uses `session_mode: recovery_continuation` and names the authoritative report
after acceptance. Recovery identity is `unit_id + original_job_id`; the initial
attempt is `1`, the sole recovery is `2`, and attempt `3` is invalid. The repair
packet contains the original packet, invalid output and validation findings.

## Rendered Packet Route

For a delegated meaningful `plan.json` item, prefer a rendered packet over manual copying. For a non-plan worker, the orchestrator first writes one bounded `dd-flow/worker-task@1` manifest inside the selected RUN home; its `task` uses the same task-specific vocabulary as a plan item, but does not carry plan-graph dependencies.

```bash
dd-flow prompt render \
  --project-root "$PWD" \
  --run "<RUN-ID>" \
  --stage "<stage>" \
  --plan-item "<P-N>" \
  --profile "<code_implementation|documentation|verification>" \
  --json
```

Replace `--plan-item` with `--task-file "<RUN-home>/<stage>/.../worker-task.json"` for the generic route. The renderer validates either route before materializing the same launch prompt, stack and report artifacts. It does not launch the worker or infer task scope.

The plan item supplies only task-specific `execution_context`: `prompt_profile`, `required_read`, `discovery_boundary`, `write_scope` and `checks`. It also carries the selected `semantic_spine`. The profile supplies stable worker rules; RUN facts supply the concrete workspace and report location. Do not duplicate common primer, Git or recovery prose in `execution_context`.

The renderer writes `launch-prompt.md`, `prompt-stack.json` and `render-report.json` under the selected RUN stage. `prompt-stack.json` identifies the static inputs and hashes so a later reviewer can reconstruct the instruction stack. Project sources remain paths to read, not copied content. A `required_read` or `discovery_boundary` source inside the selected RUN home uses checked `run://<relative-path>`; write scope remains project-local. Unsafe `.env`/outside-root paths, missing required reads, profile mismatch and stale workspace facts must fail before worker launch.

For a dependency-aware review, the generic manifest's optional `handoff`
contains only accepted hard-predecessor report paths and their verdicts, the
acceptance owner and reserved recovery attempt paths. Do not copy graph
dependencies into the generic manifest or rely on the orchestrator session to
remember them.

For `focused_subagent`, resolve exactly one leaf specialization. `role_prompt`
can itself be the complete leaf, or it can be a consumed shared wrapper when
one `aspect_prompt` or `target_prompt` supplies the leaf. For example, an SDLC
aspect packet may read `worker-session -> workers/verify -> aspect-worker role
wrapper -> one selected aspect prompt`. Two leaf aspect/target prompts, or a
wrapper without a leaf, are incomplete. For `grouped_subagent`, the single
leaf is the validated `grouped_review` wrapper and its `group_manifest` is
the complete list of unit leaves.

If the task packet is missing the goal, read sources, write boundary or report path, return `blocked: incomplete_task_packet`. Do not infer a large task from hidden session memory.

If the worker will mutate project code or run project tests, build, packaging, generation or other project tooling, the packet must include the `workspace_bootstrap` handoff. Read the named contract before tooling. If `requirement: required` lacks a gate, action or receipt path, return `blocked: incomplete_task_packet`. Produce or revalidate the receipt as assigned; a blocked or failed contract result stops the worker before project tooling. Use the contract's blocker-versus-DEF rule instead of inventing a worker-local status or deferral.

## Context Mode

Default to a fresh empty session unless the task packet explicitly says otherwise.

If the platform forks the orchestrator context, treat it only as convenience. It is not evidence. Facts that shape the report must come from the task packet, prompt files, project files, commands, diff, stage reports or other named sources.

For `recovery_continuation`, first read the failed task packet, partial report, diff and failure note. Continue from verified artifacts; do not restart from scratch if the previous work is usable.

## Priming Order

Read in this order:

1. This worker-session primer.
2. Light project context:
   - `.memory-bank/dd-flow/common/style.md`
   - `.memory-bank/dd-flow/common/memorybank.md`
   - `.memory-bank/index.md`
   - `.memory-bank/structure.md`, if present
   - `.memory-bank/project-policy.md`, if present
   - `.memory-bank/mbb/index.md`, if present
3. Task grounding from the packet: protocol/DEF/scenario/run/stage reports, source files, diff, constraints, write boundary and report path.
4. `.memory-bank/dd-flow/common/workspace-bootstrap.md`, when the packet marks bootstrap required or provides a receipt to revalidate.
5. The optional generic `worker_prompt`, then the role wrapper and exactly one leaf specialization named by the packet.
6. Focused source inspection and checks.
7. Source-backed report.

Do not run full `prime.md` from a worker unless the task packet explicitly asks for it.

## Work Boundaries

- Work only inside the packet's read/write boundaries.
- Do not revert unrelated or user changes.
- Do not create abstractions, files, statuses or prompt blocks "for later".
- If a simpler solution satisfies the task and current consumers, choose it.
- If the current design is overcomplicated and can be simplified inside scope, report `needs_fixes` or fix it before reporting `done`.
- Keep assumptions explicit.
- Treat a worker report as evidence for the orchestrator, not as final authority.

## Report Baseline

Every worker report must include:

- status;
- task summary;
- prompt files read;
- project sources read;
- changes or findings;
- checks run or skipped with reason;
- assumptions and residual risks;
- exact files written, if any;
- workspace bootstrap status and receipt path when the task invoked project tooling;
- DEF candidates, if any.

If a required source cannot be read, mark the report `blocked` or `done_with_concerns`; do not hide the gap.
