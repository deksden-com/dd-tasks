---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/data_persistence_migration_review.md'
description: 'Aspect prompt for data persistence and migration review.'
purpose: 'Review durable data, schema, migration, rollback and safety behavior.'
version: '0.1.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: program
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, data, migration]
---

# Aspect: data_persistence_migration_review

Applies to database, schema, storage, queue, migration, backfill, transaction or durable data behavior changes.

Grounding sources: schemas, migrations, storage contracts, rollback/backup runbooks, seed/fixture data and tests.

Plan review: check schema existence, migration/rollback, transaction boundaries, data safety, backup and fixture impact.

Distinguish fresh installation from upgrading an existing data world and from reset/cleanup followed by recreation. When the change touches schema objects, trace all affected objects (including types, indexes, constraints and extensions) through those lifecycle paths. A fresh disposable database does not prove repeatability on the same database or preservation of existing records. Name the migration/reset/fixture sources, the relevant initial state, expected preserved data and cleanup ownership in the PLAN; require only the paths relevant to accepted scope.

Readiness review: verify migrations/checks/evidence prove safe behavior or precise DEFs exist.

Blocking findings: missing rollback/backup for risky migration, unsafe destructive data change, transaction boundary unclear.

Acceptable DEF: production backfill evidence deferred to controlled deploy gate.
