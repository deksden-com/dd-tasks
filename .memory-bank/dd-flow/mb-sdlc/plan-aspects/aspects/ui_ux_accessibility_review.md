---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/ui_ux_accessibility_review.md'
description: 'Aspect prompt for UI, UX and accessibility review.'
purpose: 'Review user-facing screens, components, dashboards, reports and interactions.'
version: '0.1.0'
date: '2026-07-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: vertical_slice
depends_on: [architecture_design_quality]
informs: [contract_propagation_design]
tags: [dd-flow, mb-sdlc, aspect, ui, accessibility]
---

# Aspect: ui_ux_accessibility_review

Applies to user-facing screen, component, dashboard, report, form, navigation or interaction changes.

Grounding sources: UI docs, changed components/templates, screenshots, browser/DOM smoke, accessibility expectations and responsive states.

Plan review: cover states, accessibility, keyboard/focus, loading/error/empty, responsive behavior and visual proof.

Readiness review: verify browser/DOM/visual evidence proves the changed UI and no text/element overlap exists.

Blocking findings: no rendered proof for changed UI, inaccessible control, overlapping text, missing error/empty state for required flow.

Acceptable DEF: cross-browser or device matrix beyond current gate with primary proof already passing.
