---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/data_persistence_migration_review.md'
description: 'Aspect prompt for data persistence and migration review.'
purpose: 'Review durable data, schema, migration, rollback and safety behavior.'
version: '0.1.0'
date: '2026-07-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: program
depends_on: [architecture_design_quality]
informs: [contract_propagation_design]
tags: [dd-flow, mb-sdlc, aspect, data, migration]
---

# Aspect: data_persistence_migration_review

Applies to database, schema, storage, queue, migration, backfill, transaction or durable data behavior changes.

Grounding sources: schemas, migrations, storage contracts, rollback/backup runbooks, seed/fixture data and tests.

Plan review: check schema existence, migration/rollback, transaction boundaries, data safety, backup and fixture impact.

Readiness review: verify migrations/checks/evidence prove safe behavior or precise DEFs exist.

Blocking findings: missing rollback/backup for risky migration, unsafe destructive data change, transaction boundary unclear.

Acceptable DEF: production backfill evidence deferred to controlled deploy gate.
