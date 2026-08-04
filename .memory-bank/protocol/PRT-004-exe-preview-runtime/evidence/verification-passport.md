---
file: '.memory-bank/protocol/PRT-004-exe-preview-runtime/evidence/verification-passport.md'
description: 'Value-free verification passport for the PRT-004 private preview source package.'
purpose: 'Records the exact source/container/browser evidence boundary and prevents local proof from being promoted to Exe.dev or production claims.'
version: '0.1.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/protocol/PRT-004-exe-preview-runtime/index.md'
protocol: '.memory-bank/protocol/PRT-004-exe-preview-runtime/index.md'
scenario: '.memory-bank/scenarios/SCN-003-private-preview-runtime.md'
matrix: '.memory-bank/plans/verification-matrix.md'
tags: [dd-tasks, evidence, passport, PRT-004, SCN-003, source-package]
history:
  - version: '0.1.0'
    date: '2026-08-04'
    changes: 'Создан value-free passport contract; final commit/revision and readiness receipts are filled only from fresh CODE evidence.'
---

# PRT-004 source-package verification passport

## Claim and boundary

This passport is for the private, disposable source-package contour only. It
accepts one built Hono process serving API and Vite SPA on one external port,
one internal PostgreSQL service, guarded data lifecycle, readiness, API/browser
authorization and exact restart/cleanup behavior. It does not accept Exe.dev,
provider identity/team/VM/share/transport/capacity, production, backup, CI/CD
or public-sharing claims.

## Identity

```yaml
protocol: PRT-004-exe-preview-runtime
run: RUN-300-exe-preview-runtime
worktree: /Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/checkouts/worktrees/PRT-004-exe-preview-runtime/RUN-300-exe-preview-runtime/dd-tasks
branch: feature/prt-004-exe-preview-runtime
expected_start_head: 2db129c5d16aee8de782dfdcea157897e2777002
accepted_implementation_head: filled_from_final_clean_readback
source_revision: filled_from_final_preview_build
artifact_digest: filled_from_final_preview_build
source_dirty: must_be_false_for_final_passport
```

## Fresh evidence ledger

| Gate | Fresh evidence | Acceptance claim | Status |
| --- | --- | --- | --- |
| bootstrap | `RUN-300/03-code/workspace-bootstrap-implementation-receipt.md` and `workspace-bootstrap-readiness-receipt.md` | exact worktree/toolchain/PostgreSQL readiness | pending final receipt |
| source quality | `RUN-300/03-code/evidence/quality.log` | format/lint/typecheck/unit/integration/build/value scan | pending final rerun |
| container build | `RUN-300/03-code/evidence/preview-build-manifest.json` | baked revision/digest and one-port image | pending final clean build |
| SCN-003 checkpoint | `RUN-300/03-code/evidence/scn-003-checkpoint.json` | readiness guard, negative binding, role/browser smoke, retained-volume restart | passed in source run; final clean rerun required |
| SCN-003 eval | `RUN-300/03-code/evidence/scn-003-eval-output.json` | exact volume cleanup/readback | passed in source run; final clean rerun required |
| docs/Memory Bank | `RUN-300/03-code/evidence/docs-and-mb-lint.json` | frontmatter, links, matrix, scenario and policy binding | pending final rerun |
| readiness reviews | `RUN-300/03-code/reviews/` | independent result, quality, evidence, DEF, Git and runtime/data reviews | pending final reports |

Run-home paths above are durable evidence locations resolved by the `dd-flow`
run index; raw `.scenario-runs/` output is kept as input evidence and is not
linked from Memory Bank documents.

## Safety and provider audit

- Preview profiles are private-by-default and disposable.
- Mutating commands reject wrong profile/host/database/run/world/compose/volume
  before creating a SQL client.
- Preview actor credentials are operation-scoped and value-free in all reports.
- No Exe.dev login, team/VM/share/provider mutation, push, tag, release,
  publish, merge or worktree deletion is part of this passport.
- Live SCN-003 remains `pending_deploy_flow` until a separate deploy operation
  performs fresh provider preflight and readback.

## Verdict

The final readiness verdict is written only after all required CODE plan items,
fresh checks, reviewer findings and clean-head readback are complete. A green
source-package verdict is not a live-provider verdict.
