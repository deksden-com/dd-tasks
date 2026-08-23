---
file: '.memory-bank/spec/engineering/coding-standards.md'
description: 'Project-specific coding, testing and documentation standards for dd-tasks.'
purpose: 'Give planning and fresh CODE workers one compact source for conventions that are not obvious from a single task file.'
version: '0.1.0'
date: '2026-08-23'
status: 'ACTIVE'
c4_level: 'engineering'
parent: '.memory-bank/spec/engineering/index.md'
tags: [dd-tasks, engineering, typescript, api, web, testing, documentation]
---

# Coding standards

These are project-specific rules. Tool configuration and nearby code remain the
source for formatting and local implementation patterns; this document does
not restate TypeScript, React, Hono or SQL documentation.

## General

- Use TypeScript throughout and keep the existing strict compiler settings.
- Treat external input as `unknown` and validate it at the owning boundary.
- Prefer narrow literal unions and explicit result shapes to `any`, casts or
  duplicated string vocabularies.
- Keep changes in the current owning module until two real consumers justify a
  shared abstraction.
- Preserve existing behavior by default. A changed contract, ordering rule,
  authorization boundary or data invariant needs an explicit accepted reason
  and a test.
- Use existing dependencies and platform/database constraints before adding a
  package or custom framework.
- Follow Biome: two spaces, LF, double quotes, semicolons, trailing commas and
  organized imports. Do not run a repository-wide write formatter from a
  concurrent bounded Work.

## API and domain logic

- Keep Hono routes thin: parse transport input, obtain the actor, call the
  owning service and serialize the established response.
- Keep validation, authorization, archive/lifecycle guards and transactional
  domain behavior in `CoreService` or the existing owning boundary; do not
  create a second path for one endpoint.
- Preserve the structured public error contract and safe `404` behavior. Do
  not expose resource existence across workspace boundaries.
- Parameterize SQL through the existing tagged-template client. Use a
  transaction when several writes must succeed or fail together.
- Enforce durable finite-state and integrity rules in PostgreSQL as well as at
  the API boundary when malformed stored data would violate the domain.
- Never edit an applied migration. Add the next migration and prove upgrade,
  reset/seed and cleanup behavior.

## Web application

- Keep server data authoritative. Optimistic UI must restore the last confirmed
  state after a failed write.
- Reuse the existing product API/error boundary, navigation, loading, empty,
  error and archived/read-only states.
- Prefer native labelled controls and semantic elements. Preserve visible
  keyboard focus, associated labels, status roles and meaning without color.
- Keep machine values separate from human labels and define one local mapping
  per bounded vocabulary.
- The current checkpoint uses the established product CSS. Do not introduce
  Tailwind or shadcn piecemeal for one field; adopting that stack requires a
  coherent project-level change.
- Check the changed surface at the supported desktop and narrow viewport and
  avoid horizontal overflow.

## Tests and evidence

- Put pure/domain/contract behavior in focused Vitest tests; use the existing
  PostgreSQL integration suites for persistence, migrations, authorization and
  lifecycle behavior.
- Extend existing Playwright scenarios for actor journeys. Do not create a
  parallel browser harness, unmanaged localhost server or second reset/seed
  mechanism.
- Every defect fix leaves the smallest test that would fail before the fix.
- Cover the happy path plus material invalid-input, authorization, archive,
  migration and cleanup boundaries that apply to the change.
- Keep stateful database and browser tests isolated and serialized when they
  share targets. Read-only format, lint, typecheck and build checks may run
  after mutation stops.
- State proof limits honestly: local/test evidence is not CI, deploy or
  production evidence.

## Documentation

- Update Memory Bank when delivered behavior, a durable invariant, acceptance
  scenario, operations procedure or a material decision changes.
- Keep user value in feature/epic records, durable system behavior in specs,
  alternative-and-rationale history in ADRs, executable acceptance in scenarios
  and task-local execution in protocols/plans.
- Do not duplicate code, pseudocode, command output or RUN telemetry in durable
  documents. Link the owning source or evidence instead.
- Comments and JSDoc explain a non-obvious invariant, trust boundary or reason;
  they do not narrate visible syntax.
- Future behavior remains DRAFT/PLANNED until implementation evidence exists.

## Default checks

Use the narrow checks declared by the accepted PLAN while implementing. After
fan-in, the project source gate is `pnpm quality`; add `pnpm docs:check`, the
applicable database/browser/scenario commands and changed-file Memory Bank lint
when their surfaces changed. The engineering index and accepted PLAN own exact
environment, fixture and proof-limit details.
