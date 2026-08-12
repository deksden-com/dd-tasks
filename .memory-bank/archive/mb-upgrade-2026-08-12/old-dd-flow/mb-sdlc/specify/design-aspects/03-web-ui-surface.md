---
file: '.memory-bank/dd-flow/mb-sdlc/specify/design-aspects/03-web-ui-surface.md'
description: 'Specify-time design aspect for web UI surfaces.'
purpose: 'Use when a task changes browser-visible screens, dashboards, reports, forms, navigation or components.'
version: '0.1.0'
date: '2026-07-04'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/mb-sdlc/specify/design-aspects/index.md'
tags: [dd-flow, mb-sdlc, specify, design-aspect, ui]
---

# 03 Web UI Surface

## Applicability

Use this aspect when the task creates or changes:

- user-facing screens, dashboards, reports or forms;
- navigation, layout, components, tables, cards, controls or visual states;
- browser interactions, responsive behavior or accessibility affordances.

## Canonical Defaults

- Build the actual usable experience first, not a marketing placeholder.
- Match UI density and tone to the domain and repeated workflow.
- Define loading, empty, error, success, disabled and permission states where relevant.
- Use familiar controls: icons for tool buttons, menus for option sets, toggles for binary settings, tabs for views and tooltips for unfamiliar icons.
- Text must fit its container on mobile and desktop without overlap.
- Accessibility, keyboard/focus and responsive behavior are part of the acceptance surface.
- Visual verification uses screenshots/browser checks when the UI is material.

## Specify Questions

- What user task must the screen make easier?
- What data states must be represented?
- Is the UI operational/dense, editorial/marketing, game-like or documentation/report-oriented?
- What viewports and interaction modes matter?
- What visual proof is sufficient for acceptance?

## Decisions To Record

- Primary user workflow and screen states.
- Target density/tone and design constraints.
- Required controls and interactions.
- Accessibility and responsive requirements.
- Screenshot/browser/evidence requirements.
- Deviations from canonical UI defaults.

## Verification Seeds

- `screen_state_coverage`: key loading/empty/error/success states are implemented or not applicable.
- `responsive_layout_check`: no text or controls overlap on mobile/desktop.
- `accessibility_check`: keyboard/focus/labels are checked where relevant.
- `visual_evidence`: screenshot or browser evidence proves the changed screen.
- `workflow_check`: the user can complete the primary task without hidden instructions.

## Linked Plan Aspects

- `ui_ux_accessibility_review`
- `testing_system_design_review`
- `verification_evidence_review`
- `scenario_seed_eval_review`
- `contract_propagation_design`

## Anti-Patterns

- A landing/hero page replaces the actual requested app/tool experience.
- The UI explains itself with instructional text instead of clear controls and states.
- Layout depends on viewport-scaled font size or fragile content dimensions.
- Visual acceptance is claimed without rendering the screen.
