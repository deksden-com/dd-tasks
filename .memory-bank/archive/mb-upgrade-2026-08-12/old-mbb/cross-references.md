---
file: '.memory-bank/mbb/cross-references.md'
description: 'Canonical cross-reference rules for linking Memory Bank docs, code, tests, ADR/SPEC files, scenarios, and evidence.'
purpose: 'Use when adding or reviewing links so humans and agents can trace concepts across documentation and implementation.'
version: '0.3.0'
date: '2026-06-30'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
related_files:
  - .memory-bank/mbb/glossary.md
  - .memory-bank/mbb/frontmatter-standards.md
  - .memory-bank/mbb/indexing-guide.md
  - .memory-bank/mbb/sdlc-workflow.md
  - .memory-bank/mbb/coding-standards-guide.md
  - .memory-bank/mbb/code-contracts-guide.md
tags: [mbb, cross-references, links, jsdoc, traceability]
history:
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Canonicalized cross-reference rules for reusable Memory Banks.'
  - version: '0.2.0'
    date: '2026-05-12'
    changes: 'Expanded code-to-doc traceability with JSDoc/docstring links to specs, ADRs, features, scenarios, and evidence.'
  - version: '0.3.0'
    date: '2026-06-30'
    changes: 'Added protocol/evidence traceability, @spec/@protocol tags, and explicit epic-feature-spec-ADR-protocol-scenario-code link discipline.'
---

# Cross-References

Cross-references turn a Memory Bank from a pile of files into a navigable knowledge graph. Every important concept should be traceable to its owning docs, code, tests, decisions, and evidence.

## 1. Link Types

Use these link types intentionally:

- **Parent/children:** hierarchy and breadcrumbs.
- **Related files:** adjacent concepts, decisions, scenarios, and guides.
- **Implementation files:** code that owns the behavior or contract.
- **Test files:** tests that prove the behavior or protect regressions.
- **ADR/SPEC links:** decision and implementation-plan grounding.
- **Scenario/evidence links:** operational proof and closure state.
- **Protocol links:** factual delivery/remediation trace and current/follow-up work context.
- **Epic/feature links:** value and acceptance grounding for delivery work.

## 2. Frontmatter Links

Use frontmatter for machine-readable relations:

```yaml
parent: memory-bank/spec/system/runtime/index.md
children:
  - state-store.md
related_files:
  - memory-bank/adr/ADR-012-runtime-boundaries.md
related_features:
  - memory-bank/plans/epics/EP-001-runtime/features/FT-001-01-state-store.md
related_specs:
  - memory-bank/spec/system/runtime/state-store.md
related_protocols:
  - memory-bank/protocol/PRT-001-runtime-state.md
evidence_files:
  - memory-bank/evidence/VP-001-runtime-state.md
implementation_files:
  - packages/runtime/src/state-store.ts
test_files:
  - packages/runtime/src/state-store.test.ts
```

Keep paths relative to the project root. Do not use absolute local paths.

## 3. Annotated Markdown Links

Indexes and summary docs should use annotated links:

```markdown
- [State Store](state-store.md): Runtime state contract and invariants. Read before changing persistence, locking, or recovery behavior.
```

Good annotations explain:
- what the file contains;
- why or when to read it.

Avoid vague labels like "more info", "notes", or "misc".

## 4. Code To Docs

Use JSDoc/TSDoc links when code exposes a contract that is explained in Memory Bank:

```ts
/**
 * Applies a state transition with optimistic concurrency guarantees.
 *
 * @docs memory-bank/spec/system/runtime/state-store.md
 * @see memory-bank/adr/ADR-012-runtime-boundaries.md
 */
export async function applyTransition(input: TransitionInput) {}
```

Use code comments sparingly. Prefer linking to Memory Bank only for stable concepts, not for every helper.

Add these links on public or significant implementation boundaries, not on every private helper. Significant boundaries include exported APIs, CLI commands, SDK methods, schemas, prompt/tool/model orchestration modules, workflow/pipeline coordinators, persistence adapters, event contracts, state machines, scenario runners, and governed UI contracts.

### Recommended tags

Use only tags that are meaningful for the boundary:

```ts
/**
 * Short responsibility statement.
 *
 * @docs memory-bank/spec/system/<area>/contract.md
 * @spec memory-bank/spec/system/<area>/contract.md
 * @adr memory-bank/adr/ADR-XXX-<slug>.md
 * @feature memory-bank/plans/epics/EP-XXX-<slug>/features/FT-XXX-YY-<slug>.md
 * @protocol memory-bank/protocol/PRT-XXX-<slug>.md
 * @scenario memory-bank/scenarios/SCN-XXX-<slug>.md
 * @evidence memory-bank/evidence/<run-or-report>.md
 */
```

Recommended minimum:

- package entrypoints should link to the owning system or engineering spec;
- SDK entrypoints should link to client boundary docs;
- operation handlers should link to API/system contract docs;
- UI contract exports should link to screen registry and automation docs;
- scenario runners should link to scenario docs and fixture/seed policy;
- domain policies and state machines should link to domain/system specs and ADRs when relevant.
- prompt/model/tool orchestration modules should link to AI runtime/prompt architecture docs and relevant protocol/spec records.

Do not add decorative links. A link should help a future maintainer understand why the code exists and what rule it must preserve.

## 5. Docs To Code

Architecture/component docs should link to owning code through frontmatter and short implementation sections:

```markdown
## Implementation Links

- `packages/runtime/src/state-store.ts`: Owns the transition API and persistence adapter.
- `packages/runtime/src/state-store.test.ts`: Covers optimistic concurrency and recovery cases.
```

Do not paste large code excerpts into docs.

## 6. Delivery Traceability

For feature work, maintain:

```text
epic -> feature -> spec/ADR -> implementation boundary -> tests/scenarios -> evidence -> closure state
```

For platform or lifecycle verification:

```text
capability/ADR -> scenario -> evidence -> verdict -> follow-up
```

For code boundaries:

```text
code export -> JSDoc/docstring -> SPEC/ADR -> tests/scenarios -> evidence
```

For protocol-set work:

```text
PSET -> member protocol -> blocked_by_protocols -> run evidence -> downstream protocol status
```

For durable knowledge promotion:

```text
protocol decision/deviation -> ADR/spec/scenario update -> code/doc links -> evidence
```

If an item is accepted without evidence links, document the gap explicitly.

## 7. Link Hygiene

When files move or change scope:

1. Update `file`, `parent`, `children`, `related_files`, `implementation_files`, and `test_files`.
2. Update parent indexes.
3. Search for old paths.
4. Fix broken links.
5. Archive or redirect deprecated files.

Suggested checks:

```bash
rg "old/path/or-name" memory-bank
rg "\\]\\([^)]*\\.md" memory-bank
```

## 8. Anti-Patterns

- Linking only from body text while frontmatter stays stale.
- Adding docs that no index can reach.
- Linking to generated/raw runtime logs as if they were verification passports.
- Duplicating exact values from config instead of linking to the config owner.
- Creating circular docs where no file is the canonical source.
