---
file: '.memory-bank/mbb/sdlc-workflow.md'
description: 'Memory Bank as an AI-assisted SDLC workflow: decisions, specs, implementation, evidence, and synchronization.'
purpose: 'Read when setting up or improving the project development process around Memory Bank, ADR/SPEC docs, scenarios, and review/apply loops.'
version: '0.8.0'
date: '2026-06-30'
status: 'DRAFT'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
related_files:
  - .memory-bank/mbb/glossary.md
  - .memory-bank/mbb/spec-layer-guide.md
  - .memory-bank/mbb/delivery-docs-guide.md
  - .memory-bank/mbb/scenario-docs-guide.md
  - .memory-bank/mbb/scenario-runner-guide.md
  - .memory-bank/mbb/user-guides-layer.md
  - .memory-bank/mbb/ui-layer-guide.md
  - .memory-bank/mbb/architectural-approaches.md
  - .memory-bank/mbb/cross-references.md
  - .memory-bank/mbb/client-surfaces.md
  - .memory-bank/mbb/code-contracts-guide.md
  - .memory-bank/mbb/coding-standards-guide.md
  - .memory-bank/mbb/operations-release-guide.md
  - .memory-bank/mbb/layer-extraction-policy.md
  - .memory-bank/mbb/verification-matrix-guide.md
tags: [mbb, sdlc, adr, spec, protocol, evidence, sync, ai-agents]
history:
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Initial SDLC workflow distilled from source project ADR and mb sync practices.'
  - version: '0.2.0'
    date: '2026-05-12'
    changes: 'Linked client surfaces, layer extraction policy, and verification matrix into the SDLC model.'
  - version: '0.3.0'
    date: '2026-05-12'
    changes: 'Added explicit Memory Bank layers for structure, UI, guides, scenarios, and runner-related maintenance triggers.'
  - version: '0.4.0'
    date: '2026-05-12'
    changes: 'Added the product/system/engineering/operations split, code contract flow, coding standards, and release/rollout gates.'
  - version: '0.5.0'
    date: '2026-05-12'
    changes: 'Добавлены Prime/preflight, протокол со спецификацией-компаньоном и продвижение уроков из task-артефактов в Memory Bank.'
  - version: '0.6.0'
    date: '2026-05-13'
    changes: 'Добавлен протокол актуализации исторического Memory Bank и source-only provenance.'
  - version: '0.7.0'
    date: '2026-06-15'
    changes: 'Добавлены first-class SDLC contours: Git, stage/environment, release, deploy/publish, verification and runbooks.'
  - version: '0.8.0'
    date: '2026-06-30'
    changes: 'Added plans/epics feature layer, protocol set coordination, and stronger code-to-doc traceability in SDLC chains.'
---

# SDLC Workflow

Memory Bank works best when it is treated as part of the development process, not as a passive Markdown archive. Its job is to reduce guessing for humans and agents: where to look, why a boundary exists, which decision governs a change, and how the result was verified.

## 1. Knowledge Pyramid

Use this split to avoid duplication:

- **Code:** exact WHAT/HOW.
- **JSDoc/TSDoc:** public contract for code consumers plus `@docs` links when useful.
- **Memory Bank:** WHY/WHERE, boundaries, invariants, navigation, decisions, evidence.

Do not put pseudocode walkthroughs or copied config values into Memory Bank when the code/config file is the source of truth. Instead, describe the invariant and link to the owning file.

## 2. Standard Change Flow

For meaningful features, refactors, platform changes, or architectural decisions:

1. **Idea / discussion:** capture the wanted outcome and constraints.
2. **Prime / предварительный контроль (preflight):** record branch, commit, worktree, open gates, and operational risk when the change is non-trivial.
3. **ADR:** record the decision, alternatives, consequences, and review date if needed.
4. **SPEC:** write an implementation-ready plan grounded in the current codebase.
5. **Protocol:** for cross-layer or multi-agent work, create a temporary implementation integrator with task packets, verifier packets, evidence, and closeout rules.
6. **Implementation:** make the change in code with tests and docs updates in scope.
7. **Evidence:** collect test results, scenario verdicts, run ids, screenshots, reports, release notes, or machine-readable proof bundles.
8. **Memory Bank sync:** update active docs, indexes, links, closure state, and promote durable lessons from `.tasks` or runtime artifacts.

Short fixes can skip ADR/SPEC, but they still need relevant docs/index/evidence updates if they change behavior, contracts, commands, UI, or workflows.

Протокол (protocol) не заменяет спецификацию (specification). Если в ходе волны возникла долговечная норма, она должна быть перенесена в `spec/`, `adr/`, `scenarios/`, `ui/`, `guides/` или `operations/`. `.tasks` и runtime-артефакты могут хранить рабочую детализацию, но важные уроки и принятые правила должны быть подняты в Банк памяти.

`.tasks/` по умолчанию не является коммитнутым слоем проекта. Перед закрытием волны агент должен поднять всё долговечное знание из `.tasks/` в Memory Bank и убрать обязательные ссылки активных документов на `.tasks/...`. Если нужен проверяемый след запуска, создай curated-протокол в `protocol/<PRT-ID>/`, а не коммить рабочую папку целиком.

## 3. Root Views

Recommended active Memory Bank layers:

- **`spec/`:** normative requirements and invariants, split into product, system, engineering, and operations.
- **`adr/`:** decisions and rationale.
- **`plans/`:** epics/features under `plans/epics/`, roadmaps, implementation playbooks, verification matrices.
- **`scenarios/`:** executable verification contracts and cross-feature journeys.
- **`protocol/`:** factual traces of work, remediation, acceptance and evidence summaries.
- **`ui/`:** design system, `DESIGN.md` policy, screen contracts, automation contracts and visual references.
- **`guides/`:** user-facing documentation in Diátaxis form.
- **`mbb/`:** Memory Bank rules and templates.

Recommended `spec/` split:

- `spec/product/` - actors, roles, product concepts, domain meaning.
- `spec/system/` - C4, subsystems, components, contracts, interactions.
- `spec/engineering/` - coding standards, tests, code documentation, agent work rules.
- `spec/operations/` - git flow, environments, deployment, releases, rollout, rollback.

Older projects may keep a `docs/product`, `docs/architecture`, `docs/engineering` split. That is acceptable when already established, but new projects should prefer explicit layers because they make placement rules clearer for agents. If operations are substantial, keep them explicit rather than hiding rollout rules inside generic engineering docs.

The project-level `structure.md` explains the folder map; the root `index.md` remains the working quick start.

## 4. Memory Bank Sync Model

Use a sync process when bootstrapping or upgrading an existing project Memory Bank.

Recommended stages:

1. **Copy/update MBB:** install canonical `mbb/**`.
2. **Scan project:** collect deterministic facts about repo layout, scripts, packages, tests, UI surfaces, and runtime config.
3. **Scan Memory Bank:** detect current roots, indexes, frontmatter, broken links, and orphans.
4. **Module discovery:** inspect bounded areas in read-only mode.
5. **Change plan:** generate a scoped plan per module.
6. **Review loop:** user/operator reviews module plans and adds notes.
7. **Apply:** write only accepted changes inside each module's write-scope.
8. **Index/validate:** update indexes and validate links, frontmatter, orphans, and traceability.

Discovery must be read-only. Writes happen only in apply/reviewed stages.

## 4a. Historical Memory Bank Actualization

Если проект рождается из старого репозитория, mixed-repo или большого архива, не копируй старый Memory Bank механически.

Нужен протокол актуализации (actualization protocol):

```text
inventory
-> classification
-> current-code grounding
-> taxonomy / id reservation
-> rewrite
-> verifier
-> aggregate sync
-> conservative maturity
```

Логика:

- inventory собирает исторические эпики, фичи, сценарии, runbook-и и спеки;
- classification решает, что принадлежит текущему продукту, платформе, другому продукту, архиву или устаревшему recovery path;
- current-code grounding сверяет документы с реальным кодом, пакетами, API, UI, БД и операциями;
- taxonomy / id reservation заранее фиксирует новые пути, ID и места записи, чтобы работники не создавали конфликтующие документы;
- rewrite переписывает только актуальные материалы, а не переносит старый текст;
- verifier проверяет соответствие текущей реальности и write scope;
- aggregate sync обновляет индексы, матрицы и статусные документы;
- conservative maturity сохраняет `documented_anchor` / `planned`, пока нет новых доказательств текущего проекта.

Историческое доказательство должно маркироваться как `source_only`, если оно относится к другой кодовой базе, ветке, окружению или продукту. Его можно использовать как происхождение и материал для переписывания, но нельзя считать текущей приемкой.

## 5. Suggested Sync Modules

These modules are a useful starting point:

- `product/ui-map`: screens, semantic components, navigation map, entry points.
- `product/features`: capabilities, features, scenarios, evidence links.
- `architecture/code`: C4 elements, boundaries, ownership, contracts, implementation links.
- `engineering/core`: setup, workflow, quality, tooling, delivery, runbooks.

Each module needs:
- clear input sources;
- a strict write-scope;
- a gap report;
- a change plan;
- links to evidence when it changes user-visible or contract behavior.

## 6. Review/Apply Rule

Treat Memory Bank updates as reviewable changes:

- group proposed changes by module/view;
- show what will be created, updated, moved, archived, or left untouched;
- let notes attach to a module instead of a global blob;
- rebuild only dirty modules after notes;
- do not let one failed module block accepted ready modules;
- record skipped/error modules in the final report.

## 7. Traceability Chains

Delivery traceability:
```text
epic -> feature -> spec/ADR -> implementation boundary -> tests/scenarios -> evidence -> closure state
```

Platform verification traceability:
```text
ADR / capability -> scenario -> evidence -> verdict / follow-up
```

Architecture traceability:
```text
C4 element -> contract/invariant -> implementation files -> tests -> ADR/SPEC links
```

Code traceability:
```text
public/significant code boundary -> JSDoc/docstring links -> SPEC/ADR/feature/protocol/scenario -> tests/evidence
```

Protocol-set traceability:
```text
PSET -> member protocols -> blocked_by_protocols -> run evidence -> set status
```

Operations traceability:
```text
Prime/preflight -> feature branch -> draft PR -> develop -> beta deploy -> scenario evidence -> release verdict -> production approval
```

If a chain is broken, the knowledge is incomplete.

## 8. Client And Acceptance Chain

Для проектов с сервером, клиентским набором методов, командной строкой, текстовым или графическим интерфейсом действует дополнительная цепочка:

```text
серверный контракт операций
-> клиентский набор методов
-> командная строка
-> текстовый интерфейс / графический интерфейс
-> сценарии и стендовая приемка
```

Смысл: клиентская логика должна проверяться до графического интерфейса. Командная строка служит простой опорной поверхностью для агента и разработчика, а текстовый и графический интерфейсы остаются управляемыми поверхностями поверх того же клиентского слоя.

Подробные правила описаны в [Client Surfaces](client-surfaces.md).

## 9. Layer Extraction Chain

Если работа переносит код, документы или контракты между областями, пакетами или репозиториями, сначала нужно ответить:

- почему этот слой должен жить отдельно;
- кто им владеет;
- кто его потребляет;
- как он проверяется;
- какие продуктовые инварианты нельзя поднимать в общий слой.

Подробные правила описаны в [Layer Extraction Policy](layer-extraction-policy.md).

## 10. Code Contracts And Coding Standards

Some contracts must exist in code, not only in Markdown.

Use code contracts when a boundary is consumed by multiple clients, tests, scenarios, packages, or repositories:

```text
api-contract
client-sdk
ui-contract
event-contract
domain-contract
scenario-contract
```

Memory Bank explains owner, purpose, invariants, and links. Code or schemas make the contract executable.

Projects should also keep `spec/engineering/coding-standards.md` so agents know:

- target file size and decomposition rules;
- where domain logic, adapters, UI and contracts belong;
- JSDoc/docstring expectations;
- required test commands;
- when to stop and ask instead of inventing a local abstraction.

Detailed rules:

- [Code Contracts Guide](code-contracts-guide.md)
- [Coding Standards Guide](coding-standards-guide.md)

## 11. Release And Rollout Flow

For projects with beta/prod environments, user-facing runtime behavior, migrations, auth, external providers or hosted UI, the SDLC includes operational gates.

Feature branch checks prove that a change is ready for integration. They do not prove that the integrated system is accepted.

The Memory Bank must keep SDLC contours separate:

- Git policy moves source changes.
- Environment/stage policy names where artifacts or systems run.
- Release policy fixes versions and change sets.
- Deploy policy delivers artifacts to stages and includes post-deploy checks.
- Publish policy covers inseparable release+delivery operations.
- Verification policy binds requirements, scenarios, stages and evidence.
- Runbooks execute operations step by step.

Target flow:

```text
feature branch
-> draft PR
-> local checks and review
-> merge to develop
-> beta deploy
-> scenario evidence
-> release verdict
-> production approval
-> rollout / rollback evidence
```

Detailed rules: [Operations Release Guide](operations-release-guide.md).

If a project changes its Git flow, release model, deploy chain, stage policy, verification matrix or runbooks, this is still normal project work. Do not create a special `sdlc-refactor` flow. Use the ordinary `plan -> code -> merge` path, but include operations, verification, migration and DEF gates in the plan.

## 12. Maintenance Triggers

Update Memory Bank when:

- public behavior changes;
- a project boundary or ownership area changes;
- an API/CLI/TUI/GUI contract changes;
- a scenario, workflow, or quality gate changes;
- a scenario runner, seed model, fixture format, or artifact policy changes;
- a verification matrix changes;
- a client SDK or managed interface contract changes;
- a code contract package, schema, event shape, UI contract, or scenario contract changes;
- coding standards, JSDoc/docstring rules, file-size policy, or agent coding rules change;
- a `DESIGN.md`, design-system rule, screen contract, stable id, visual reference, or UI automation mapping changes;
- a user-facing tutorial, how-to guide, reference, or explanation becomes stale after a feature;
- ownership moves between local code, packages, repos, product layers, or platform layers;
- a new decision or implementation plan is accepted;
- a release/deploy/runbook process changes;
- a Git, environment/stage, release, deploy/publish or verification policy changes;
- a document becomes stale, duplicated, or contradicted by code.

The maintenance rule is simple: if future agents will otherwise have to guess, update the Memory Bank now.
