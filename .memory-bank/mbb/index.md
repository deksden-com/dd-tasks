---
file: '.memory-bank/mbb/index.md'
description: 'Canonical Memory Bank Bible: rules, standards, templates, and SDLC practices for project memory banks.'
purpose: 'Read first when bootstrapping or upgrading a Memory Bank so structure, metadata, delivery docs, and verification docs stay consistent.'
version: '0.9.9'
date: '2026-08-12'
status: 'DRAFT'
c4_level: 'documentation'
parent: null
architecture: 'Canonical MBB Standards'
children:
  - glossary.md
  - memory-bank-structure.md
  - spec-layer-guide.md
  - principles.md
  - sdlc-workflow.md
  - architectural-approaches.md
  - client-surfaces.md
  - code-contracts-guide.md
  - coding-standards-guide.md
  - ai-runtime-prompt-architecture.md
  - codex-hooks-guide.md
  - operations-release-guide.md
  - layer-extraction-policy.md
  - ui-layer-guide.md
  - user-guides-layer.md
  - delivery-docs-guide.md
  - scenario-docs-guide.md
  - scenario-runner-guide.md
  - seed-fixtures-guide.md
  - evals-experiments-guide.md
  - verification-matrix-guide.md
  - named-deferrals-guide.md
  - mb-lint-guide.md
  - aspects/index.md
  - duo-files-guide.md
  - indexing-guide.md
  - frontmatter-standards.md
  - cross-references.md
  - c4-model.md
  - templates/index.md
tags: [mbb, memory-bank, standards, documentation, sdlc, canonical]
history:
  - version: '3.2.0'
    date: '2026-08-13'
    changes: 'Updated the canonical marker for target-driven engine routing, explicit storage migration safety, immutable RUN engine bindings and schema registry validation.'
  - version: '3.1.0'
    date: '2026-08-12'
    changes: 'Updated the canonical marker for SPC-006 deterministic stage bootstrap, context packets and sealed stage finish.'
  - version: '3.0.0'
    date: '2026-08-11'
    changes: 'Updated the canonical marker for the breaking runtime, stage lifecycle and single-source PLAN contract cutover.'
  - version: '2.18.0'
    date: '2026-08-10'
    changes: 'Updated the canonical marker for local-first specify/plan routing and simplified execution observability contracts.'
  - version: '2.17.1'
    date: '2026-08-09'
    changes: 'Updated the canonical marker and release guidance for mandatory linked-CLI registry/artifact reconciliation.'
  - version: '2.17.0'
    date: '2026-08-08'
    changes: 'Updated the canonical marker for adaptive planning, routing/capacity and flow-contract schema validation.'
  - version: '2.16.1'
    date: '2026-08-07'
    changes: 'Updated canonical Memory Bank release marker to 2.16.1; added intentional lint-exclusion guidance.'
  - version: '2.16.0'
    date: '2026-08-07'
    changes: 'Updated canonical Memory Bank release marker to 2.16.0.'
  - version: '0.9.9'
    date: '2026-08-06'
    changes: 'Standardized new durable specification records on project-local sequential SPC-* identifiers.'
  - version: '2.15.0'
    date: '2026-08-03'
    changes: 'Updated canonical Memory Bank release marker to 2.15.0.'
  - version: '2.14.1'
    date: '2026-07-28'
    changes: 'Updated canonical Memory Bank release marker to 2.14.1.'
  - version: '2.14.0'
    date: '2026-07-28'
    changes: 'Updated canonical Memory Bank release marker to 2.14.0.'
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Initial canonical MBB extracted from source project Memory Bank practices.'
  - version: '0.2.0'
    date: '2026-05-12'
    changes: 'Added canonical client surface, layer extraction, and verification matrix policies.'
  - version: '0.3.0'
    date: '2026-05-12'
    changes: 'Added structure.md, UI layer, Diátaxis guides, scenario runner, and richer delivery templates.'
  - version: '0.4.0'
    date: '2026-05-12'
    changes: 'Added the product/system/engineering/operations spec model, coding standards, code contracts, release workflow, named deferrals, and ADR/coding templates.'
  - version: '0.5.0'
    date: '2026-05-12'
    changes: 'Integrated protocol/spec companion, Prime preflight, scenario disposition, evidence contour, proof bundle, and platform adoption packet practices.'
  - version: '0.6.0'
    date: '2026-05-13'
    changes: 'Integrated thin SDK facade, API/SDK/CLI parity, UI code contracts, scenario-auth, source-only actualization, compatibility ledger, and rollout evidence bundle practices.'
  - version: '0.7.0'
    date: '2026-05-24'
    changes: 'Added canonical mb-lint guide for deterministic Memory Bank linting.'
  - version: '0.8.0'
    date: '2026-05-24'
    changes: 'Added canonical reusable knowledge aspects for init, upgrade, audit, analyse, and distill flows.'
  - version: '0.8.1'
    date: '2026-05-25'
    changes: 'Added Codex hooks guide for dd-flow automation hook schemas and compatibility.'
  - version: '0.8.2'
    date: '2026-06-18'
    changes: 'Added AI runtime and prompt architecture guide to canonical MBB rules.'
  - version: '0.8.3'
    date: '2026-06-23'
    changes: 'Added seed/fixture safety and evals/experiments guides for scenario evidence and agentic assessment.'
  - version: '0.9.0'
    date: '2026-06-30'
    changes: 'Added canonical glossary and strengthened delivery semantics for epics, protocol sets, frontmatter, and traceability.'
  - version: '0.9.1'
    date: '2026-07-07'
    changes: 'Added DevOps operator runbook template family and strengthened operations template usage guidance.'
  - version: '0.9.2'
    date: '2026-07-07'
    changes: 'Added canonical project DEF registry and DEF template guidance.'
  - version: '0.9.3'
    date: '2026-07-08'
    changes: 'Updated canonical Memory Bank release marker to 2.11.0.'
  - version: '0.9.4'
    date: '2026-07-08'
    changes: 'Updated canonical Memory Bank release marker to 2.11.1.'
  - version: '0.9.5'
    date: '2026-07-08'
    changes: 'Updated canonical Memory Bank release marker to 2.11.2.'
  - version: '0.9.6'
    date: '2026-07-09'
    changes: 'Updated canonical Memory Bank release marker to 2.11.3.'
  - version: '0.9.8'
    date: '2026-07-11'
    changes: 'Updated canonical Memory Bank release marker to 2.12.0.'
  - version: '2.13.0'
    date: '2026-07-25'
    changes: 'Updated canonical Memory Bank release marker to 2.13.0.'
  - version: '0.9.7'
    date: '2026-07-09'
    changes: 'Updated canonical Memory Bank release marker to 2.11.4.'
---

# Memory Bank Bible

Текущая версия канона Memory Bank: `3.2.0`.

Memory Bank Bible (MBB) is the canonical rule set for creating and maintaining a project Memory Bank: a compact, linked, agent-friendly knowledge base that preserves context, decisions, contracts, and delivery evidence.

This package is meant to be copied into a project Memory Bank, usually as `memory-bank/mbb/` or `.memory-bank/mbb/`, then adapted only where the project has local conventions.

## Core Principles

- **Single Source of Truth:** one concept has one canonical home.
- **Progressive disclosure:** indexes and summaries give quick orientation; detailed docs are one click deeper.
- **C4-based architecture docs:** system -> container/subsystem -> component -> code.
- **Delivery traceability:** epic/feature/spec/protocol/scenario/evidence links must form a readable chain.
- **Normative spec split:** product, system, engineering, and operations knowledge have separate homes.
- **Project policy hub:** root `project-policy.md` summarizes flow-affecting project policies and links to detailed owners without replacing them.
- **Code and Memory Bank traceability:** public code boundaries link back to specs, ADRs, features, and scenarios.
- **Operational honesty:** local checks, CI, beta, production, and rollout evidence are different gates.
- **Evidence contours:** proof must name what it proves, where it ran, and what it does not prove.
- **Protocol promotion:** protocols coordinate work, while durable decisions and norms move into ADR, spec, scenarios, guides, UI, or operations.
- **Canonical aspects first:** project knowledge aspects live in `mbb/aspects/`; flow prompts select aspects and modes but do not redefine their meaning.
- **Тонкие клиенты (thin clients):** CLI, TUI, GUI, MCP и сценарные раннеры используют клиентский SDK, а не дублируют клиентскую логику.
- **Историческая честность:** материалы только как источник (source-only) могут быть основой для переписывания, но не являются текущим приемочным доказательством.
- **Agent-first navigation:** every important file has frontmatter, annotated links, and clear parent/child relations.
- **Update before create:** find the existing shelf before adding a new file.
- **Docs explain why and where:** code remains the source of truth for exact implementation details.

## Rules

1. [Glossary](glossary.md): compact canonical terminology for epic, feature, spec, ADR, protocol, protocol set, run, scenario, evidence, eval and traceability.
2. [Principles](principles.md): foundational rules for SSOT, atomic concepts, C4 structure, duo files, metadata, and explicit architectural approaches.
3. [Memory Bank Structure](memory-bank-structure.md): why every mature project needs `structure.md` as a folder map separate from the root working index.
4. [Project Policy Guide](project-policy-guide.md): top-level `project-policy.md` as a visible hub for flow-affecting project policies and policy gaps.
5. [Spec Layer Guide](spec-layer-guide.md): why normative knowledge is split into product, system, engineering, and operations.
6. [SDLC Workflow](sdlc-workflow.md): Memory Bank as an AI-assisted SDLC system: idea -> ADR -> SPEC -> implementation -> evidence -> sync.
7. [Architectural Approaches](architectural-approaches.md): recommended agent-friendly approaches for project structure, typed clients, UI contracts, design systems, POM, and stable interaction ids.
8. [Client Surfaces](client-surfaces.md): policy for operation contracts, client SDKs, CLI/TUI/GUI/MCP surfaces, and staged acceptance.
9. [Code Contracts Guide](code-contracts-guide.md): when contracts should exist in code, schemas, packages, or generated artifacts.
10. [Coding Standards Guide](coding-standards-guide.md): engineering rules for maintainable, agent-friendly codebases.
11. [AI Runtime And Prompt Architecture](ai-runtime-prompt-architecture.md): prompt/model/tool/provider/retry/observability/concurrency rules for AI-powered system parts.
12. [Codex Hooks Guide](codex-hooks-guide.md): Codex hook sources, event-specific output schemas, and dd-flow hook compatibility rules.
13. [Operations Release Guide](operations-release-guide.md): git flow, integration, beta acceptance, release, rollout, rollback, and operational evidence.
14. [Layer Extraction Policy](layer-extraction-policy.md): when to keep logic local, extract a package, split a repo, or promote a capability into a platform/shared layer.
15. [UI Layer Guide](ui-layer-guide.md): canonical `ui/` layer for `DESIGN.md`, design systems, screen contracts, automation mapping, and visual references.
16. [User Guides Layer](user-guides-layer.md): Diátaxis-based user documentation layer and how feature delivery updates tutorials, how-to guides, references, and explanations.
17. [Delivery Docs Guide](delivery-docs-guide.md): separation of epic, feature, spec, protocol, and scenario documents.
18. [Scenario Docs Guide](scenario-docs-guide.md): how to write executable `SCN-*` verification contracts with evidence-first outcomes.
19. [Scenario Runner Guide](scenario-runner-guide.md): portable runner specification for runs, phases, seeds, fixtures, artifacts, cleanup, and AI fixture caching.
20. [Seed And Fixture Safety](seed-fixtures-guide.md): how scenarios define seed profiles, fixtures, worlds, cleanup, stage data safety and setup/cleanup evidence.
21. [Evals And Experiments](evals-experiments-guide.md): how to add agentic/metric assessment reports when deterministic scenarios are not enough.
22. [Verification Matrix Guide](verification-matrix-guide.md): how to connect features/capabilities to scenarios, environments, and evidence.
23. [Named Deferrals Guide](named-deferrals-guide.md): how to close work honestly with explicit deferred gates.
24. [mb-lint Guide](mb-lint-guide.md): deterministic Memory Bank linting, configuration, finding classification, and lint rule candidates.
25. [Canonical Knowledge Aspects](aspects/index.md): reusable aspect library for extracting, migrating, auditing, analysing, and distilling project knowledge.
26. [Duo Files Guide](duo-files-guide.md): how to split large docs into summary + detail files without duplication.
27. [Indexing Guide](indexing-guide.md): shallow/deep/hybrid indexes, annotated links, and navigation patterns.
28. [Frontmatter Standards](frontmatter-standards.md): required YAML metadata, versioning, statuses, relations, and history.
29. [Cross-References](cross-references.md): Markdown, code, tests, JSDoc/TSDoc, and implementation link discipline.
30. [C4 Model](c4-model.md): how C4 levels map to Memory Bank documentation.

## Templates

- [Templates Index](templates/index.md): catalog and usage guidance.
- [Structure Template](templates/structure.md): project-level Memory Bank folder map.
- [Project Policy Template](templates/project-policy.md): top-level hub for project policies that affect flow routing, checks, evidence and delivery.
- [ADR Template](templates/adr.md): architectural decision record with alternatives and consequences.
- [Coding Standards Template](templates/coding-standards.md): project engineering standards for code, tests, and agent work.
- [Component Template](templates/component.md): component-level technical documentation.
- [Subsystem Template](templates/subsystem.md): subsystem/container index.
- [Epic Template](templates/epic.md): delivery value group under `epics/`.
- [Feature Template](templates/feature.md): minimal unit of delivered value under an epic.
- [Spec Template](templates/spec.md): implementation-ready design.
- [Protocol Template](templates/protocol.md): factual delivery/remediation trace.
- [DEF Template](templates/def.md): durable project-wide named deferral.
- [DevOps Runbook Templates](templates/index.md): base runbook plus release, deploy, publish, migration, rollback and backup/restore overlays.
- [Scenario Template](templates/scenario.md): executable verification contract.
- [Scenario Disposition Matrix Template](templates/scenario-disposition-matrix.md): classification of canonical, id-first, legacy, rewrite, and upstream scenario ids.
- [UI Screen Template](templates/ui-screen.md): governed GUI/TUI screen contract.

## Recommended Memory Bank Shape

```text
memory-bank/
├── index.md                 # Entry points + router: where to read and where to write
├── structure.md             # Folder map: what sections exist and what each owns
├── project-policy.md        # Flow-affecting project policies, defaults, links, and known gaps
├── spec/                    # Normative truth: product, system, engineering, operations
│   ├── product/             # Actors, product concepts, domain meaning
│   ├── system/              # C4, subsystems, contracts, interactions
│   ├── engineering/         # Coding standards, tests, code docs, agent rules
│   └── operations/          # Git flow, deploy, release, rollout, rollback
├── adr/                     # Decision records and rationale
├── plans/                   # Epics, features, roadmaps, verification matrices
│   └── epics/               # EP-* folders with feature records
├── scenarios/               # SCN-* / XE-* executable verification contracts
├── evals/                   # Optional agentic/metric behavior assessments
├── protocol/                # Curated delivery traces and evidence summaries
├── ui/                      # Design system, screen contracts, automation, references
├── guides/                  # User-facing Diátaxis documentation
├── evidence/                # Verification artifacts, if stored in Memory Bank
├── defs/                    # Durable project-wide named deferrals
├── skills/                  # Agent wiki for stack/tool/vendor-specific details
├── mbb/                     # This rule set
└── archive/                 # Deprecated or historical material with indexes
```

Some older projects use a `docs/` split for product, architecture, and engineering views. That layout remains valid when already established, but new projects should prefer the explicit `spec/`, `adr/`, `plans/`, `ui/`, `guides/`, `scenarios/`, and `protocol/` layers unless the project has a good local reason.

Legacy-compatible shape:

```text
memory-bank/
├── index.md
├── structure.md
├── project-policy.md        # Optional policy hub for mature legacy-compatible banks
├── docs/                    # Product / architecture / engineering views
│   ├── product/             # User-facing semantics, features, UI map, guides
│   ├── architecture/        # C4 boundaries, contracts, invariants, interactions
│   └── engineering/         # Setup, workflow, quality, tooling, delivery, runbooks
├── specs/                   # ADR-* and legacy SPEC-* / current SPC-* records
├── epics/                   # Legacy/project-local value grouping when explicitly retained
├── scenarios/               # SCN-* executable verification contracts
├── plans/                   # Optional planning, feature maps, and verification matrices
├── ui/                      # Optional explicit UI layer, if not under docs/product/ui
├── guides/                  # Optional explicit guides layer, if not under docs/product/guides
├── protocol/                # Curated delivery traces and evidence summaries
├── skills/                  # Agent wiki for stack/tool/vendor-specific details
├── mbb/                     # This rule set
└── archive/                 # Deprecated or historical material with indexes
```

Use the exact root name (`memory-bank/`, `.memory-bank/`, or another project convention) consistently across frontmatter and links.

## Where To Write

- Project folder map -> `structure.md`
- Flow-affecting project policy hub -> `project-policy.md`
- Normative product, system, engineering, and operations rules -> `spec/`
- Decision rationale -> `adr/`
- Epics/features for new projects -> `epics/EP-XXX-<slug>/`
- Roadmaps, implementation playbooks, verification matrices -> `plans/`
- UI screens, design system, automation contracts, visual references -> `ui/`
- User-facing tutorials, how-to guides, references, explanations -> `guides/`
- End-to-end platform/use-case verification -> `scenarios/SCN-*` or `scenarios/XE-*`
- Agentic/metric behavior assessment -> `evals/` when project uses evals/experiments, or protocol evidence for task-local experiments
- Feature/capability acceptance maps -> `plans/verification-matrix.md` or another explicitly linked matrix
- Factual delivery/remediation traces -> `protocol/`
- Stack/tool details for agents -> `skills/`
- Rules for the Memory Bank itself -> `mbb/`

## Maintenance Loop

1. Read `.memory-bank/index.md`, then `.memory-bank/mbb/index.md`.
2. Update existing files before creating new ones.
3. Update parent indexes when files are added, removed, moved, or materially changed.
4. Keep annotated links current and useful.
5. Keep frontmatter, versions, and history meaningful.
6. Archive stale material instead of leaving contradictory docs in active paths.
7. Validate links, frontmatter, orphan files, and index coverage.

## Quality Bar

- Every active file has frontmatter.
- Every active file is reachable from an index.
- Every index explains what a link contains and why to read it.
- Every concept has one canonical source.
- Every delivery item links to design, implementation evidence, and closure state.
- Every project-specific architectural approach is documented where agents can find it.
