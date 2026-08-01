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
role: <semantic worker role id, for example code_worker, knowledge_extraction or mb_upgrade_diff_analysis>
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

Resolve exactly one leaf specialization. `role_prompt` can itself be the complete leaf, or it can be a consumed shared wrapper when one `aspect_prompt` or `target_prompt` supplies the leaf. For example, an SDLC aspect packet may read `worker-session -> workers/verify -> aspect-worker role wrapper -> one selected aspect prompt`. Two leaf aspect/target prompts, or a wrapper without a leaf, are incomplete.

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
