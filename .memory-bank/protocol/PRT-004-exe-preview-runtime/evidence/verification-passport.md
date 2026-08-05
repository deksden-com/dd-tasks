---
file: '.memory-bank/protocol/PRT-004-exe-preview-runtime/evidence/verification-passport.md'
description: 'Value-free verification passport for the PRT-004 private preview source package.'
purpose: 'Records the exact source/container/browser evidence boundary and prevents local proof from being promoted to Exe.dev or production claims.'
version: '0.3.0'
date: '2026-08-05'
status: 'STABLE'
c4_level: 'operations'
parent: '.memory-bank/protocol/PRT-004-exe-preview-runtime/index.md'
protocol: '.memory-bank/protocol/PRT-004-exe-preview-runtime/index.md'
scenario: '.memory-bank/scenarios/SCN-003-private-preview-runtime.md'
matrix: '.memory-bank/plans/verification-matrix.md'
tags: [dd-tasks, evidence, passport, PRT-004, SCN-003, source-package]
history:
  - version: '0.3.0'
    date: '2026-08-05'
    changes: 'Fresh stable-main checkpoint/eval source-package evidence accepted after fast-forward integration; live Exe.dev provider acceptance remains pending deploy.md.'
  - version: '0.2.0'
    date: '2026-08-05'
    changes: 'Promoted after fresh clean checkpoint/eval source-package runs; final exact SHA/digest are authoritative in the 03-code manifests and stage report.'
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
accepted_implementation_head: 3cd39525b998ed38b29ba5da7fd87e2c15700821
integrated_acceptance_head: 83c0ae695784787ff69dd1f1163d17c8df0cb90c
integrated_artifact_digest: sha256:058b3bae47fae0c41e1a9c164de06c5353c3ac51be9bb956e0064f4507958822
source_dirty: false_in_both_final_profile_manifests
```

## Fresh evidence ledger

| Gate | Fresh evidence | Acceptance claim | Status |
| --- | --- | --- | --- |
| bootstrap | `RUN-300/03-code/workspace-bootstrap-implementation-receipt.md` and `workspace-bootstrap-readiness-receipt.md` | exact worktree/toolchain/PostgreSQL readiness | passed |
| source quality | `RUN-300/03-code/evidence/quality.log` | format/lint/typecheck/unit/integration/build/value scan | passed |
| container build | `RUN-300/03-code/evidence/preview-build-manifest.json` | baked revision/digest and one-port image | passed; exact profile manifests retained separately |
| SCN-003 checkpoint | `RUN-300/03-code/evidence/scn-003-checkpoint.json` | readiness guard, negative binding, role/browser smoke, retained-volume restart | passed |
| SCN-003 eval | `RUN-300/03-code/evidence/scn-003-eval-output.json` | exact volume cleanup/readback | passed |
| docs/Memory Bank | `RUN-300/03-code/evidence/docs-and-mb-lint.json` | frontmatter, links, matrix, scenario and policy binding | passed |
| readiness reviews | `RUN-300/03-code/reviews/` | independent result, quality, evidence, DEF, Git and runtime/data reviews | accepted; actionable findings closed |
| integrated source quality | `RUN-300/04-merge/report.md` | stable checkout bootstrap, quality, docs, DB/schema, secret/value and reachability gates | passed on local `main@83c0ae6` |
| integrated SCN-003 checkpoint | `RUN-300/04-merge/evidence/scn-003-checkpoint/` | built runtime, API/browser role matrix and retained-volume restart | passed |
| integrated SCN-003 eval | `RUN-300/04-merge/evidence/scn-003-eval/` | built runtime and exact binding cleanup/readback | passed |

Run-home paths above are durable evidence locations resolved by the `dd-flow`
run index; raw `.scenario-runs/` output is kept as input evidence and is not
linked from Memory Bank documents.

## Safety and provider audit

- Preview profiles are private-by-default and disposable.
- Mutating commands reject wrong profile/host/database/run/world/compose/volume
  before creating a SQL client.
- Preview actor credentials are operation-scoped and value-free in all reports.
- No Exe.dev login, team/VM/share/provider mutation, push, tag, release or
  publish is part of this passport; it records local source integration only.
- Live SCN-003 remains `pending_deploy_flow` until a separate deploy operation
  performs fresh provider preflight and readback.

## Verdict

`accepted_integrated_source_package` for local `main`. The accepted feature SHA,
integrated acceptance SHA, artifact digest, profile manifests, browser result
inventories and exact cleanup receipts are recorded across RUN-300 `03-code`
and `04-merge`. This is not a live-provider verdict; the live row remains owned
by the later `deploy.md` flow.
