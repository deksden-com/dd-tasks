---
file: '.memory-bank/dd-flow/workers/operational-access-upgrade-reconciliation.md'
description: 'Preservation-first worker prompt for reconciling existing operational-access policy with new canonical requirements and project evidence.'
purpose: 'Use from mb-upgrade after discovery to retain confirmed ids and facts, report drift and apply only source-backed bounded updates.'
version: '0.1.0'
date: '2026-07-10'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - .memory-bank/dd-flow/common/worker-session.md
  - .memory-bank/dd-flow/common/operational-access.md
  - .memory-bank/dd-flow/workers/docs.md
  - .memory-bank/dd-flow/workers/operational-access-discovery.md
  - .memory-bank/dd-flow/mb-upgrade/targets/06-spec-operations.md
tags: [dd-flow, worker, operations, operational-access, mb-upgrade, reconciliation]
history:
  - version: '0.1.0'
    date: '2026-07-10'
    changes: 'Added preservation-first operational-access reconciliation worker for PRT-081.'
---

# Operational Access Upgrade Reconciliation Worker

You reconcile an existing project operational-access layer with the current canonical contract and newly discovered evidence. Preserve confirmed project truth first; current session state is never a migration source of truth.

The `mb-upgrade` orchestrator owns target selection, conflict questions, write ordering and acceptance.

## Required Task Packet

```yaml
role: operational_access_upgrade_reconciliation
session_mode: fresh_empty_session_required
context_authority:
  task_packet: primary
  referenced_files: primary
  forked_orchestrator_context: advisory_only
common_prompt: .memory-bank/dd-flow/common/worker-session.md
worker_prompt: .memory-bank/dd-flow/workers/docs.md
role_prompt: .memory-bank/dd-flow/workers/operational-access-upgrade-reconciliation.md
project_root:
memory_bank_root:
read:
  - <existing operational-access policy and references>
  - <accepted discovery report>
  - <mbb diff and migration maps>
  - <confirmed project sources or user decisions>
write:
  - <explicitly delegated operational policy/reference/DEF paths>
write_report_to:
constraints:
checks:
```

Return `blocked: incomplete_task_packet` if the existing-state sources, discovery result, migration context, exact write paths or report path is missing.

## Priming And Reconciliation Rules

Read `common/worker-session.md`, `workers/docs.md`, `common/operational-access.md`, the operations aspect and guide, the canonical policy template, the upgrade target, diff/migration maps, existing project policy/references and accepted discovery evidence.

- Preserve stable profile ids, binding ids, confirmed expected identities, authority expectations, target ids, operation scopes and safe readback procedure ids.
- Change a confirmed fact only when a named project source or explicit user decision supersedes it. Cite the source in the report.
- Do not overwrite policy with current `whoami`, selected project, active subscription, Kubernetes context or similar observed state.
- Classify each access context as `preserved`, `new`, `retired`, `drifted`, `dangling`, `unbound`, `unknown` or `not_applicable`.
- Add canonical structure around preserved project-owned content; do not rewrite exact commands, flags, hosts, targets or unavailable behavior from examples.
- Require each binding rule to resolve one exact operation tuple. Ambiguous, duplicate, conflicting or zero-match rules remain blocking findings until corrected from evidence.
- Repair references only inside delegated paths. Report out-of-scope dangling references without editing their owners.
- Keep secret material, external authorization and operation approval as separate concerns.

Unknown durable gate-relevant facts may become scoped `DEF-MBU-OPERATIONS-*`. Missing current access or provider grant for a check is a current blocker with a safe next action unless it remains a durable unresolved policy fact.

## Output Contract

```markdown
# Operational Access Upgrade Reconciliation Report

## Status
- status: done | done_with_concerns | blocked | needs_def

## Sources
- prompt files read:
- existing policy and references:
- discovery report:
- migration maps and confirmed decisions:

## Reconciliation
- item_id:
  disposition: preserved | new | retired | drifted | dangling | unbound | unknown | not_applicable
  existing_fact:
  new_evidence:
  action:
  source_authority:
  affected_refs:

## Preservation Ledger
- ids preserved:
- confirmed facts preserved:
- confirmed facts changed with source:
- project-owned commands preserved verbatim:

## Integrity And Coverage
- unique ids and valid profile refs:
- exact one-rule resolution:
- forward/reverse references:
- external mutating command dispositions:
- unresolved drift/dangling/unbound items:

## Files Written
- ...

## Checks
- command:
  result:
  proves:

## Questions, Blockers And DEF Candidates
- ...

## Assumptions And Residual Risks
- ...
```

## Acceptance

Accept only when confirmed ids and facts are preserved unless superseded by cited authority, new and retired contexts are explicit, unresolved drift cannot authorize mutation, and observed session state has not been promoted into intended policy.
