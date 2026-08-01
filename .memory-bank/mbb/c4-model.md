---
file: '.memory-bank/mbb/c4-model.md'
description: 'Canonical C4 mapping for Memory Bank documentation: system, subsystem/container, component, and code links.'
purpose: 'Use when deciding where architecture knowledge belongs and how deep each document should go.'
version: '0.2.0'
date: '2026-05-12'
status: 'ACTIVE'
c4_level: 'standard'
tags: [c4-model, architecture, documentation-structure, levels]
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
related_files:
  - .memory-bank/mbb/principles.md
  - .memory-bank/mbb/spec-layer-guide.md
  - .memory-bank/mbb/duo-files-guide.md
history:
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Canonicalized C4 guidance for reusable Memory Banks.'
  - version: '0.2.0'
    date: '2026-05-12'
    changes: 'Aligned C4 placement with the spec/system layer and clarified boundaries with product, engineering, and operations specs.'
---

# C4 Model For Memory Bank

Memory Bank uses C4 as an addressing model for architecture knowledge. C4 answers one recurring question: where does this fact belong?

## Levels

- **L1 System:** whole product/system, actors, external boundaries, top-level capabilities, high-level flows.
- **L2 Subsystem/Container:** major deployable/runtime/logical areas with clear ownership and contracts.
- **L3 Component:** internal building blocks inside a subsystem, with responsibilities, invariants, implementation links, and tests.
- **L4 Code:** source code, JSDoc/TSDoc, tests. Memory Bank links to L4 but does not duplicate it.

## Recommended System Tree

```text
memory-bank/spec/system/
├── index.md             # Entry point and C4 map
├── system-c4.md         # L1 building blocks and boundaries
├── interactions.md      # L1 flows between subsystems
├── quality.md           # L1 quality attributes, risks, constraints
├── repository-map.md    # Repository/storage map when relevant
├── <subsystem>/         # L2 subsystem
│   ├── index.md
│   ├── contract.md
│   ├── architecture.md
│   └── <component>/     # L3 component
│       ├── index.md
│       ├── <component>.md
│       └── <component>-testing.md
└── (shared)/            # Optional meta group, not a C4 container
```

Directories in parentheses are meta groups. They help navigation but do not introduce a new C4 boundary.

Older projects may keep `docs/architecture/`. New projects should prefer `spec/system/` because C4 documents are normative system knowledge, not delivery plans.

## L1: System

Use L1 docs for:
- scope and context;
- external actors/systems;
- top-level building blocks;
- 2-5 key runtime flows;
- deployment/environment constraints;
- cross-cutting concepts;
- major quality attributes and risks;
- links to key ADRs.

Avoid implementation walkthroughs at L1.

## L2: Subsystem / Container

Use L2 docs for:
- ownership boundary;
- public interfaces;
- dependencies;
- data/state ownership;
- internal component map;
- subsystem-level runtime flows;
- important failure modes;
- related ADR/SPEC links.

Each L2 area should have an `index.md`. Add `contract.md` when the subsystem has a meaningful external surface.

## L3: Component

Use L3 docs for:
- purpose and responsibilities;
- public contract and guarantees;
- invariants and red lines;
- key states/transitions at concept level;
- failure modes and observability hooks;
- implementation and test links.

If a component doc grows beyond 250-800 lines, apply the duo pattern: keep a summary file and move details into focused child files.

## L4: Code

Code is the source of truth for exact behavior. Link to code and tests through:
- `implementation_files` in frontmatter;
- `test_files` in frontmatter;
- `@docs` / `@see` references in JSDoc/TSDoc;
- annotated Markdown links.

Do not copy code logic into Memory Bank except for short examples that clarify a contract.

## Placement Rule

Ask:

- Does it describe the whole system? Put it in L1.
- Does it describe a major boundary or owned surface? Put it in L2.
- Does it describe an internal building block? Put it in L3.
- Does it describe exact implementation? Keep it in code/tests and link to it.

When in doubt, put the short invariant in the higher-level doc and link to the lower-level source of truth.

## Boundaries With Other Spec Areas

C4 does not own every kind of knowledge.

- Product actors, roles and domain meaning belong in `spec/product/`.
- System structure, subsystems, components and contracts belong in `spec/system/`.
- Coding standards, JSDoc/docstrings, testing conventions and agent rules belong in `spec/engineering/`.
- Git flow, deployment, rollout and rollback belong in `spec/operations/`.

This separation matters because product meaning, system structure, engineering discipline, and release operations change at different speeds and have different owners.
