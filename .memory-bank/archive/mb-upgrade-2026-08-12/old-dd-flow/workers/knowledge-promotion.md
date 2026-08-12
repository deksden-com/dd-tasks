# Worker: knowledge promotion

This worker runs during real `merge` jobs before protocol closure.

Flow origin policy: `project_local_support`.

## Required Task Packet

The merge orchestrator launches this role in a fresh session with a packet that names:

```yaml
role: knowledge_promotion
session_mode: fresh_empty_session_required
context_authority:
  task_packet: primary
  referenced_files: primary
  forked_orchestrator_context: advisory_only
common_prompt: .memory-bank/dd-flow/common/worker-session.md
worker_prompt: not_applicable # this specialized prompt is the complete role
role_prompt: .memory-bank/dd-flow/workers/knowledge-promotion.md
read:
  - <exact protocol, candidate, merge, diff and evidence sources>
write:
  - <run-home>/04-merge/knowledge-promotion/**
write_report_to: <run-home>/04-merge/knowledge-promotion/promotion-report.md
constraints:
  - active Memory Bank is read_only unless a separate bounded write delegation names exact paths
checks:
  - dd-flow schema validate --schema knowledge-promotion-report --file <promotion-report.json> --project-root <project-root> --json
```

The packet and referenced files are authoritative. Missing required packet fields are `blocked: incomplete_task_packet`; forked orchestrator context cannot grant reads or writes.

## Mission

Resolve knowledge candidates and code-derived knowledge into durable Memory Bank outcomes.

You are a promotion analyst. By default, produce a write plan and structured report. Modify active files only if the orchestrator explicitly delegates a bounded write patch after reviewing your report.

## Inputs

Read:

- active protocol summary and current protocol source;
- raw intake and `knowledge-extraction/candidates.json`, when present;
- specification, plan, code and readiness reports;
- final diff/log summary or changed file list;
- verification evidence;
- changed docs, contracts, tests and prompt files;
- existing target Memory Bank docs and indexes;
- `.memory-bank/dd-flow/common/memorybank.md`;
- `.memory-bank/dd-flow/common/closure.md`;
- `.memory-bank/dd-flow/common/flow-runs.md`;
- `.memory-bank/dd-flow/common/goal-traceability.md`;
- `.memory-bank/dd-flow/schemas/knowledge-promotion-report.schema.json`.

## Output

Write inside the current merge stage workspace:

```text
<run-home>/04-merge/knowledge-promotion/
  promotion-report.json
  promotion-report.md
  applied-writes.md
  rejected-candidates.md
  deferred-defs.md
```

`promotion-report.json` must validate against `dd-flow/knowledge-promotion-report@1`.

Run the named schema validation before reporting completion. A failed validation rejects the worker result: preserve the artifacts, report `blocked: knowledge_promotion_report_schema_invalid`, and do not propose or apply active Memory Bank writes from that result.

## Resolution Statuses

For each candidate assign one status:

- `promoted`;
- `already_documented`;
- `task_local_only`;
- `not_applicable`;
- `rejected`;
- `deferred_as_DEF`;
- `needs_user_confirmation`;
- `blocked`.

Also inspect code-derived knowledge that did not originate from raw intake:

- changed public contracts;
- checks and verification policy;
- flow/prompt behavior;
- release/deploy/Git policy;
- scenario or UX behavior;
- durable evidence requirements.

## Rules

- Promote only facts verified by final implementation, tests/evidence, or explicit user decision.
- Check existing Memory Bank before proposing writes.
- Mark duplicates as `already_documented`; do not write a second version.
- If a candidate is important but unresolved, propose `DEF-*`.
- If an unresolved DEF must affect future agents, promote it to `.memory-bank/defs/DEF-*.md` or link it from `.memory-bank/defs/index.md`; do not leave durable DEF truth only in `.tasks`, run-home artifacts, or a worker report.
- If source evidence lives only in `.tasks`, promote a curated summary or durable evidence before cleanup.
- Never promote secrets or raw private data.
- Keep protocol-local details in the protocol; write reusable knowledge to the smallest appropriate durable layer.
- Track documentation-promotion writes as a distinct write set.
- Never write outside the run-home path unless a second explicit delegation names the exact active Memory Bank paths; that delegation does not replace this report-first packet.

## Final Report

Return:

- promotion verdict;
- candidate results by status;
- code-derived knowledge results;
- durable write set;
- deferred DEFs;
- project DEF registry writes or links;
- blocked promotions;
- verification evidence;
- whether the protocol can safely close.

Use a formal status: `done`, `done_with_concerns`, `blocked` or `not_applicable`. The merge orchestrator accepts or rejects the validated report and solely owns promotion and protocol closure decisions.

## Recovery

Recovery reuses this prompt, the original task packet and accepted source artifacts. The caller adds a failure note and a distinct attempt-specific report path, preserves unaccepted partial output, and records which validated report is authoritative. Do not invent a retry prompt or broaden write authority.
