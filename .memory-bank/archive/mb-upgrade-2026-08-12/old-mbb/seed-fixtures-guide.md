---
file: '.memory-bank/mbb/seed-fixtures-guide.md'
description: 'Canonical guide for seed data, fixtures, bindings, cleanup and environment safety in scenarios.'
purpose: 'Read when designing or reviewing scenarios so data setup is reproducible, isolated, safe for the target stage and linked to runbooks.'
version: '0.1.0'
date: '2026-06-23'
status: 'DRAFT'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
related_files:
  - .memory-bank/mbb/scenario-docs-guide.md
  - .memory-bank/mbb/scenario-runner-guide.md
  - .memory-bank/mbb/verification-matrix-guide.md
  - .memory-bank/mbb/operations-release-guide.md
tags: [mbb, scenarios, seeds, fixtures, data-safety, staging]
history:
  - version: '0.1.0'
    date: '2026-06-23'
    changes: 'Created seed/fixture/stage safety guide for executable scenarios.'
---

# Seed And Fixture Safety

Seed data is part of the scenario contract when a scenario depends on prepared state. A scenario that says "run the flow" but hides data setup in a test helper is not reproducible enough for acceptance.

## Terms

- `seed`: initial system state created or selected before scenario phases run.
- `fixture`: named input data, actors, external responses, cached model responses, files or config used by a scenario.
- `binding`: durable handle returned by seed/setup and consumed by later phases.
- `world`: isolated data namespace for a scenario run, such as `world_id`, tenant, organization, database, schema, bucket prefix or account namespace.
- `cleanup`: explicit removal or retirement of entities created by the run.

## Required Scenario Data Fields

If a scenario depends on data or state, document:

- target environment or stage;
- seed profile;
- fixture set;
- actor/account/role requirements;
- world/data isolation strategy;
- bindings produced by setup;
- cleanup strategy;
- idempotency and rerun behavior;
- whether external systems/providers are touched;
- what evidence proves setup and cleanup;
- what this setup does not prove.

If the scenario truly does not need seed data, write `seed: not_applicable` with the reason.

## Environment Rules

### Local

Local scenarios may create ephemeral databases, local files, sandbox tenants or test accounts.

Preferred pattern:

```text
create ephemeral environment -> apply migrations -> load seed -> run scenario -> collect evidence -> cleanup/drop
```

### CI

CI seed must be reproducible and isolated. Parallel CI needs either independent worlds or a lock. Avoid shared mutable state unless the scenario is explicitly testing shared-state behavior.

### Preview

Preview can prove review smoke, UI visibility or package integration. It does not prove beta, staging or production behavior unless project policy explicitly says preview is the target gate.

### Beta / Staging

Beta and staging may allow scenario seed, but only through documented operations rules.

Acceptable isolation examples:

- `world_id`;
- dedicated tenant or organization;
- scenario-only account;
- unique namespace/prefix;
- ephemeral schema/database;
- locked shared environment with cleanup proof.

If beta/staging contains real or long-lived data, scenario seed must say how it avoids touching unrelated data.

### Production

Production seed is forbidden by default.

Allowed production checks are normally read-only smoke, operational health checks, or explicitly approved migration/bootstrap runbooks. Any production write must name approval, rollback, data boundary and evidence.

## Runbook Link

Scenario seed policy must link to the owning project document. Common homes:

- `spec/operations/environments.md`;
- `spec/operations/runbooks/*.md`;
- `spec/engineering/testing.md`;
- `scenarios/seed-fixtures.md`.

Choose one project SSOT and link to it from scenario documents and verification matrix rows.

## Review Findings

Create a blocker or `DEF-*` when:

- seed touches shared/beta/prod data without isolation;
- cleanup is missing for entities created by the run;
- bindings are implicit or guessed;
- cached AI or external responses lack provenance;
- a weaker seed contour is used to claim a stronger gate;
- the scenario cannot be rerun without manual database surgery.
