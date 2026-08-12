---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/coding_standards_design_review.md'
description: 'Aspect prompt for coding standards design and implementation review.'
purpose: 'Verify that planned and actual changes follow project/MBB coding standards and boundary discipline.'
version: '0.1.2'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: program
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, coding-standards]
history:
  - version: '0.1.1'
    date: '2026-07-09'
    changes: 'Added minimal-sufficient implementation rule and bug treatment for avoidable overcomplication.'
  - version: '0.1.0'
    date: '2026-07-09'
    changes: 'Created dedicated aspect prompt for coding standards design and implementation review.'
---

# Aspect: coding_standards_design_review

Applies to code, prompt, schema, module changes or already-large files.

Grounding sources: project coding standards, `.memory-bank/mbb/coding-standards-guide.md`, changed files, public entrypoints, tests and docs.

Plan review: check file/module boundaries, maintainability, testability, side effects, error handling, standards source and whether the planned implementation is the minimal sufficient change.

Readiness review: inspect actual diff for monolith growth, hidden side effects, weak errors, missing tests, missing docstring/JSDoc cross-links where required and unnecessary complexity. If extra abstraction or structure can be removed now, return it as a defect to fix.

Blocking findings: responsibility mix, large-file growth without rationale, changed public entrypoint without docs/tests, hidden behavior change, overcomplicated implementation that is fixable in current scope.

Acceptable DEF: non-blocking refactor debt with exact file, reason, next gate and verification trigger.

Simplicity rule: prefer direct, local, explicit code until repetition, consumers or lifecycle prove the need for abstraction. Do not add framework-like structure, registries, extension points, generic helpers or indirection unless the current task objectively uses them.
