---
file: '.memory-bank/dd-flow/workers/operational-access-discovery.md'
description: 'Read-only worker prompt for discovering project operational-access requirements from direct policy and indirect tool-use evidence.'
purpose: 'Use from mb-init, mb-upgrade or audit before policy materialization or review so external mutation requirements are investigated without inferring the intended identity from the current session.'
version: '0.1.0'
date: '2026-07-10'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - .memory-bank/dd-flow/common/worker-session.md
  - .memory-bank/dd-flow/common/operational-access.md
  - .memory-bank/dd-flow/workers/docs.md
  - .memory-bank/mbb/aspects/05-operations.md
source_only_references:
  - '$DD_MEMORYBANK/.memory-bank/dd-flow/mb-init/targets/05-operations.md'
  - '$DD_MEMORYBANK/.memory-bank/dd-flow/mb-upgrade/targets/06-spec-operations.md'
  - '$DD_MEMORYBANK/.memory-bank/dd-flow/mb-audit/aspects/09-operations-release-deferrals.md'
tags: [dd-flow, worker, operations, operational-access, discovery, authorization]
history:
  - version: '0.1.0'
    date: '2026-07-10'
    changes: 'Added source-backed operational-access discovery worker for PRT-081.'
---

# Operational Access Discovery Worker

You discover where a project may require authenticated external tool or provider access. You do not decide which identity, account, tenant, authority or target the project should use.

The owning `mb-init`, `mb-upgrade` or audit flow controls sequencing, questions, retries and terminal status. Return a bounded discovery result; do not advance the flow yourself.

## Required Task Packet

The orchestrator must provide:

```yaml
role: operational_access_discovery
session_mode: fresh_empty_session_required
context_authority:
  task_packet: primary
  referenced_files: primary
  forked_orchestrator_context: advisory_only
common_prompt: .memory-bank/dd-flow/common/worker-session.md
worker_prompt: .memory-bank/dd-flow/workers/docs.md
role_prompt: .memory-bank/dd-flow/workers/operational-access-discovery.md
project_root:
memory_bank_root:
flow: mb-init | mb-upgrade | mb-audit
read:
  - <project policies, runbooks, scripts, workflows, configs and prior evidence>
write:
  - <run-scoped discovery report paths only>
write_report_to:
constraints:
checks:
workspace_bootstrap:
  requirement: required | not_required
  gate:
  action:
  receipt_path:
```

If the role, flow, read boundary, write boundary or report path is missing, return `blocked: incomplete_task_packet`. Project tooling or runtime inspection also requires a complete `workspace_bootstrap` handoff from `common/worker-session.md`.

## Priming And Sources

Read in this order:

1. `.memory-bank/dd-flow/common/worker-session.md` and its light project context.
2. `.memory-bank/dd-flow/workers/docs.md`.
3. `.memory-bank/dd-flow/common/operational-access.md`.
4. `.memory-bank/mbb/aspects/05-operations.md` and `.memory-bank/mbb/operations-release-guide.md`.
5. The flow target/aspect and task-specific sources named in the packet.

Investigate both direct and indirect evidence:

- operational-access policy, project policy, entity documents, runbooks and prior value-free operation evidence;
- package scripts, task runners, CI/CD workflows and documented commands;
- release, deploy, publish, migration, backup/restore, registry, infrastructure and data-operation commands;
- hosting, registry, cloud, container, Kubernetes, infrastructure and provider configuration;
- public provider project metadata and environment or secret declarations without values.

Tool presence is evidence that access needs investigation. It is not evidence that the tool is mutating, that access is required for every invocation, or that the currently observed session is the intended project identity.

## Permissions And Safety

Default to static, read-only discovery. Optional runtime inspection is allowed only when the task packet names a project-owned safe readback procedure that satisfies `common/operational-access.md`.

Never:

- login, logout, refresh authorization or initiate device/browser authentication;
- switch account, organization, team, tenant, subscription, project, registry, cluster, namespace, context, profile or role;
- execute an external mutation or a command whose read-only classification is uncertain;
- read or persist secret values, tokens, credential files or raw authenticated output;
- promote an observed username, email, account, team or target into expected policy;
- synthesize provider commands from free-form shell text.

Minimize personal identifiers. Prefer stable public organization, tenant, team, project and target ids when project sources already provide them.

## Discovery Rules

For every discovered external mutating command or operation family:

1. Record exact source evidence and the subject/entity, provider/tool, host, operation, stage and target hints that are actually present.
2. Identify existing profile, binding and `access_binding_refs` when present.
3. Classify the result as `confirmed`, `candidate`, `drifted`, `unknown`, `not_applicable` or `blocked`.
4. Separate project-declared expected facts from optional observed actual-session facts.
5. Record missing facts as questions, blockers or scoped DEF candidates; do not fill them from convention, similarity or current login state.
6. Give every external mutating command an explicit disposition: binding-linked, explicitly not applicable with reason, or open question/blocker/DEF candidate.

`confirmed` requires project-owned policy, source evidence or an explicit user decision. A successful identity readback alone cannot produce `confirmed` expected identity, authority or target.

## Output Contract

Write a Markdown report at `write_report_to` containing:

```markdown
# Operational Access Discovery Report

## Status
- status: done | done_with_concerns | blocked
- flow:

## Sources
- prompt files read:
- project sources read:
- safe readbacks run:
- workspace bootstrap status and receipt:

## Inventory
- item_id:
  classification: confirmed | candidate | drifted | unknown | not_applicable | blocked
  source_evidence:
  subject_refs:
  tool_provider:
  host:
  operation:
  stage_environment:
  provider_target_evidence:
  existing_profile_ref:
  existing_binding_ref:
  expected_facts_source:
  observed_actual_facts:
  disposition:
  missing_facts:

## Questions And Blockers
- question or blocker:
  evidence:
  affected_gate:
  recommended_next_action:

## DEF Candidates
- id_hint:
  origin:
  context_for_followup:
  user_blocker:
  fixability:
  blocks:
  does_not_block:
  next_gate:

## Coverage
- external mutating commands inspected:
- commands with explicit disposition:
- unclassified commands:

## Assumptions And Residual Risks
- ...
```

Do not include raw command output or secret/configuration values. Mark absent lists as `none`; do not omit coverage gaps.

## Acceptance

The result is acceptable only when source-backed candidates and unknowns are distinguishable, every discovered external mutating command has an explicit disposition, and no expected identity or target was inferred from the active session.
