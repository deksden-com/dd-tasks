---
file: '.memory-bank/mbb/glossary.md'
description: 'Canonical MBB glossary for durable delivery, decision, verification, protocol, and evidence terms.'
purpose: 'Read before creating or reviewing Memory Bank documents so epic, feature, spec, ADR, scenario, protocol, evidence, and run terms stay distinct.'
version: '0.1.0'
date: '2026-06-30'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
related_files:
  - .memory-bank/mbb/delivery-docs-guide.md
  - .memory-bank/mbb/frontmatter-standards.md
  - .memory-bank/mbb/cross-references.md
  - .memory-bank/mbb/spec-layer-guide.md
  - .memory-bank/mbb/sdlc-workflow.md
tags: [mbb, glossary, terminology, epic, feature, spec, adr, protocol, scenario, evidence]
history:
  - version: '0.1.0'
    date: '2026-06-30'
    changes: 'Added canonical terminology entrypoint for MBB delivery semantics and traceability.'
---

# MBB Glossary

This glossary is the compact entrypoint for Memory Bank terms. Detailed rules stay in the linked guides; this file defines meanings and canonical homes.

## Durable Knowledge

### Spec

`Spec` is the durable normative layer: what must remain true after a protocol closes. It describes product meaning, system structure, engineering rules, or operations policy.

Canonical home:

```text
memory-bank/spec/product/
memory-bank/spec/system/
memory-bank/spec/engineering/
memory-bank/spec/operations/
```

Specs do not store execution logs. If a spec explains a decision with real alternatives, create or link an ADR.

### ADR

`ADR` is a decision record. It explains why a path was chosen, what alternatives were considered, and what consequences follow.

Canonical home:

```text
memory-bank/adr/ADR-XXX-<slug>.md
```

ADR is not a feature, implementation plan, or protocol log. A spec can state the accepted norm after the ADR.

### Epic

`Epic` is a large value area or capability cluster. It groups related features and explains who benefits.

Canonical new-project home:

```text
memory-bank/epics/EP-XXX-<slug>/index.md
```

Top-level `memory-bank/epics/` is legacy-compatible only unless a project policy explicitly keeps it.

### Feature

`Feature` is the minimal delivered capability or behavior that can be accepted with evidence. It records outcome, actors, scope, acceptance intent, affected areas, and links to specs, ADRs, scenarios, protocols, and evidence.

Canonical new-project home:

```text
memory-bank/epics/EP-XXX-<slug>/features/FT-XXX-YY-<slug>/index.md
```

Feature docs do not replace specs. They link the durable product/system/engineering/operations rules they rely on.

## Execution And Verification

### Memory Bank Version

`Memory Bank version` is the project/canon release marker that drives compatibility. A project declares this version as the primary machine-readable compatibility signal.

Canonical current-project marker:

```text
memory-bank/index.md frontmatter: memory_bank_version
```

The project should not duplicate every runtime, storage, summary or dashboard contract version in its own config. The compatibility matrix expands the Memory Bank version into tool and data contracts.

### Compatibility Matrix

`Compatibility matrix` maps a Memory Bank version to compatible tool packages, router/engine expectations, storage contract sets, project summary contracts, dashboard contracts and migration policy.

Canonical home:

```text
memory-bank/dd-flow/compatibility.json
memory-bank/dd-flow/schemas/compatibility.schema.json
```

The matrix is the source agents and CLI use to decide whether normal operation is allowed, degraded, blocked or must move through `mb-upgrade`.

### CLI Router

`CLI router` is the stable globally installed `dd-flow` command shell. In the routed model it discovers project context, reads the project Memory Bank version, resolves a compatible installed engine and invokes that engine.

Flow prompts should keep calling `dd-flow`; they should not hardcode old package versions unless router diagnostics explicitly provide an install fallback.

### CLI Engine

`CLI engine` is the immutable command implementation snapshot installed under the dd-flow home engine store and selected by the router for a project/version.

Canonical planned store:

```text
~/.dd-flow/engines/
```

Old engines are installed from old npm package versions, for example `npx @deksden-com/dd-flow-cli@<version> engine install`. Installing an old engine must not downgrade or replace the globally installed router.

That command is available only for package versions that shipped `engine install`. Older historical CLI versions remain legacy direct-CLI versions and require explicit compatibility/degraded handling.

### Storage Contract Set

`Storage contract set` names the versioned runtime/home data schemas and semantics used by a compatible CLI engine. It covers things like project registry records, protocol runtime, run indexes, sessions, lanes, locks and queues when those contracts are part of the active Memory Bank release.

Normal CLI commands must not silently migrate storage contracts. Migration belongs to `mb-upgrade`.

### Project Summary Contract

`Project summary contract` is a compact versioned read model prepared by a project-compatible CLI engine for global dashboard aggregation.

Global dashboard data preparation reads project summaries, not deep project runtime. The dashboard UI displays prepared data and does not own compatibility decisions or migrations.

### Dashboard Contract

`Dashboard contract` is the versioned JSON/HTML data boundary for project and global dashboards. A project dashboard is tied to the project's compatible Memory Bank/CLI version. A global dashboard may support several project summary contract versions at once, but incompatible projects must remain visible in diagnostics rather than disappearing silently.

### Protocol

`Protocol` is an executable SDLC trace for a concrete wave of work. It connects problem discussion, specify, plan, code/readiness, merge, evidence, named deferrals, and durable knowledge promotion.

Canonical home:

```text
memory-bank/protocol/PRT-XXX-<slug>.md
memory-bank/protocol/PRT-XXX-<slug>/
```

Protocols are not eternal architecture documents. Durable decisions and norms discovered during execution must move to `spec/`, `adr/`, `scenarios/`, `ui/`, `guides/`, or operations docs.

### Protocol Set

`Protocol set` coordinates several executable protocols that together implement a larger agreed scope. It is a coordination document, not a replacement for executable protocols.

Canonical home:

```text
memory-bank/protocol/_set/PSET-XXX-<slug>.md
```

Each member protocol stays independently executable. `blocked_by_protocols` in protocol frontmatter is the minimal dependency mechanism.

### Run

`Run` is the runtime envelope for one concrete flow launch. A run may belong to a protocol, audit, upgrade, init, experiment, or other flow.

Runtime artifacts can live outside committed Memory Bank. Curated results are promoted into protocol/evidence/spec/ADR/scenario docs when they must survive as project knowledge.

### Scenario

`Scenario` is an executable or reproducible verification contract. It describes setup, phases, supported environments, expected evidence, and pass criteria.

Canonical home:

```text
memory-bank/scenarios/SCN-XXX-<slug>.md
memory-bank/scenarios/XE-XXX-<slug>.md
```

Scenarios are not ordinary unit tests and not implementation logs. They prove a capability, lifecycle block, or canonical user/system path.

### Evidence

`Evidence` is proof of a check or gate with scope and limits. It names what was run, where it ran, what commit/environment it covers, the verdict, and what it does not prove.

Canonical homes are project-policy dependent:

```text
memory-bank/evidence/
memory-bank/protocol/PRT-XXX-<slug>/evidence/
memory-bank/scenarios/<scenario-run-or-proof>/
```

Raw `.tasks/` logs are not durable evidence by themselves. Promote them into a verification passport or curated protocol trace if active Memory Bank docs must depend on them.

### Eval / Experiment

`Eval` or `Experiment` is an agentic or metric assessment used when deterministic scenarios are insufficient. It records inputs, runner/profile, metrics or review axes, model/tool context when applicable, and an analyst verdict.

Canonical home:

```text
memory-bank/evals/
```

Experiments can inform acceptance thresholds later, but their first job is to make behavior observable and reviewable.

## Traceability

Minimum delivery chain:

```text
epic -> feature -> spec/ADR -> implementation boundary -> tests/scenarios -> evidence -> closure state
```

Minimum protocol-set chain:

```text
PSET -> member protocols -> blocked_by_protocols -> run evidence -> set status
```

Minimum code boundary chain:

```text
public/significant code boundary -> JSDoc/docstring links -> spec/ADR/feature/protocol/scenario -> tests/evidence
```

Use the smallest set of links that lets the next agent understand ownership, constraints, and proof. Do not add decorative links.
