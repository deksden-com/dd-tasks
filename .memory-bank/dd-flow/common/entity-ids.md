---
file: '.memory-bank/dd-flow/common/entity-ids.md'
description: 'Canonical typed entity id rules for dd-flow projects, experiments, runs, protocols, specifications and findings.'
purpose: 'Read before creating durable dd-flow entities or implementing CLI id resolution.'
version: '0.4.0'
date: '2026-08-06'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - workspace-layout.md
  - runtime-cli.md
  - git-ops.md
  - ../.memory-bank/protocol/2026-05-31-entity-ids-project-workspaces.md
tags: [dd-flow, ids, registry, aliases, cli]
history:
  - version: '0.4.0'
    date: '2026-08-27'
    changes: 'Aligned Work, finding and receipt namespaces with SPC-009.'
  - version: '0.3.0'
    date: '2026-08-06'
    changes: 'Added project-local SPC-* allocation for new durable specification records.'
  - version: '0.2.0'
    date: '2026-07-31'
    changes: 'Separated global PRJ allocation from project-scoped PRT/RUN allocation and defined composite resolution and ambiguity rules.'
  - version: '0.1.0'
    date: '2026-05-31'
    changes: 'Created canonical typed entity id rules for dd-flow runtime and experiments.'
---

# Entity IDs

`dd-flow` uses typed ids for durable entities.

Full id:

```text
TYPE-<sequence>-slug
```

Short alias:

```text
TYPE-<sequence>
```

Examples:

```text
PRJ-001-dd-flow-playground
EXP-001-playground-merge-queue-live
RUN-001-flowboard-safe-ui-smoke
PRT-001-flowboard-safe-ui-smoke
SPC-001-subagent-grouping-and-pool-aware-routing
DEF-001-runtime-state-outside-worktree
CHK-001-flowboard-safe-ui-smoke
VP-001-live-acceptance
```

## Rules

- `TYPE` is 2-4 uppercase Latin letters.
- Sequence is a decimal number padded to at least three digits; it continues as
  `1000`, `1001`, and so on after `999`.
- `slug` is lowercase kebab-case.
- Full ids are immutable and must not be reused.
- Durable directories, reports, records, traces and evidence use full ids.
- Human commands may accept the short alias if it resolves uniquely.
- Short aliases are first-class, not fuzzy matches.
- Ambiguous aliases fail closed and return candidates.
- Slug-only ids are not the happy path. They may appear only in explicit migration/status guidance.

## Allocation Ownership

The active `DD_FLOW_HOME` stores the registry, but allocation ownership follows
the entity namespace rather than one global counter:

- `PRJ-*` is global to the active project registry because a project owns the
  namespace below it;
- `PRT-*`, `RUN-*` and file-backed `SPC-*` are allocated inside one stable project namespace;
- `WRK-*` is allocated globally inside one `DD_FLOW_HOME`, because `work_id` is
  the runtime database primary key;
- worktrees inherit the stable project's namespace and never create a new
  allocator;
- nested findings and receipts use local `FIND-NNN` and `RCP-NNN` ids plus the
  parent Work/Run in their canonical reference;
- report labels and stage-local row ids are not promoted into global entities.

Consequently two projects may both own the same full `PRT-*` or `RUN-*` id.
Durable runtime identity for those families is the composite
`(project_id, entity_id)`. A command with project context resolves only inside
that project. A context-free lookup may preserve compatibility when exactly one
project matches; multiple matches fail closed and return project candidates.

Implementation rules:

- allocate by type sequence, for example `EXP-001`, then `EXP-002`;
- calculate the maximum only inside the allocation owner's namespace;
- reserve before writing durable files;
- make reserved-but-unused ids visible in status/report output;
- provide explicit cleanup/release for abandoned reservations;
- never silently guess a full id from a slug.

The typed ID format has no three-digit ceiling. Do not renumber or archive
existing entities merely because the sequence exceeds `999`.

## Protocol IDs

New active protocols should use typed full ids such as:

```text
PRT-001-flowboard-safe-ui-smoke
```

Historical date-based protocol paths may remain in closed or migration-era documentation until an explicit migration rewrites indexes and references. New prompts must treat typed ids as the forward path.

Existing protocol ids are never renumbered when storage moves to composite
identity. Plans, queue rows, sessions, worktrees, audit events and other
references retain the id and gain or use the owning project context.

## Run IDs

`RUN-*` identifies a concrete execution, not the semantic task.

Examples:

```text
RUN-001-flow-run-contract
RUN-002-hr-agent-mb-upgrade
RUN-003-playground-merge-queue-live
```

The semantic subject is stored separately in the sole current `run.json` state:

```json
{
  "run_id": "RUN-001-flow-run-contract",
  "subject": {
    "type": "protocol",
    "id": "PRT-001-flow-run-contract"
  }
}
```

CLI allocation owns `RUN-*` ids. Prompt-side allocation is allowed only as a degraded transition path and must be reported as degraded runtime state.

RUN histories, stage reports, usage snapshots and session links are resolved by
project plus run id. Migration preserves both the id and artifact paths.

## Specification IDs

New independent durable specifications use full ids such as:

```text
SPC-001-subagent-grouping-and-pool-aware-routing
```

`SPC-*` is a project-local file-backed sequence shared across
`spec/product`, `spec/system`, `spec/engineering` and `spec/operations`.
Allocation scans the selected project's `spec/**/SPC-*` records. Spec indexes
are not entities and remain `index.md`. Existing unnumbered or legacy
`SPEC-*` files keep their identity until an explicit migration.

## Command UX

Commands should show both the short alias and full id when useful:

```text
experiment: EXP-001-playground-merge-queue-live
alias: EXP-001
project: PRJ-001-dd-flow-playground
```

Operator examples should prefer the short alias:

```bash
dd-flow-exp prepare EXP-001
dd-flow-exp start EXP-001 --phase plan
dd-flow-exp start EXP-001 --phase merge
dd-flow-exp start EXP-001 --phase code
dd-flow-exp start EXP-001 --phase review
```

JSON output must include the full id so logs and reports stay durable.
