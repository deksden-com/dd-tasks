---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/architecture_design_quality.md'
description: 'Aspect prompt for architecture design quality.'
purpose: 'Review conceptual fit, ownership and lifecycle of non-trivial changes.'
version: '0.1.2'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: system
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, architecture]
history:
  - version: '0.1.1'
    date: '2026-07-09'
    changes: 'Made unnecessary complexity an explicit defect: overbuilt architecture should return needs_fixes when simplifiable in current scope.'
  - version: '0.1.0'
    date: '2026-07-09'
    changes: 'Created dedicated aspect prompt for architecture design quality.'
---

# Aspect: architecture_design_quality

Applies to non-trivial, multi-module, canonical-flow, runtime, contract, UI, data or AI/prompt changes.

Grounding sources: C4/system docs, protocol, related ADRs/specs, plan graph, changed files, module boundaries and current consumers.

Plan review: identify owners, lifecycle, current consumers, alternatives and why the change is needed now. Map the applicable C4/module responsibility and explicit non-goals through the semantic spine. Choose the simplest sufficient solution. Reject "for later" fields, entities, extension points, registries or abstractions.

Readiness review: inspect actual diff for responsibility drift, orphan docs/code/tests, accidental secondary sources of truth, overbuilt design and unplanned abstractions. If the result can be simplified now without losing required behavior, treat it as a fixable defect.

Blocking findings: missing owner, no current consumer, unclear lifecycle, duplicate authority, fragmented responsibility, unnecessary complexity that can be removed in the current scope.

Acceptable DEF: architecture debt that does not block current behavior and has a precise next gate.

Simplicity rule: overengineering is not a neutral style issue. A new entity, field, status, prompt block, file, queue, adapter or abstraction must have a current consumer, lifecycle and verification. Otherwise the finding is `needs_fixes` unless there is an explicit compatibility or safety reason to keep it.
