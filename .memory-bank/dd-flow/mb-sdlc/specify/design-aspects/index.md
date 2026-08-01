---
file: '.memory-bank/dd-flow/mb-sdlc/specify/design-aspects/index.md'
description: 'Specify-time design aspect catalog for common software/task shapes.'
purpose: 'Read during MB-SDLC specify to recognize task shapes, propose canonical defaults, ask focused questions and seed plan/readiness verification.'
version: '0.2.0'
date: '2026-07-05'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/mb-sdlc/README.md'
children:
  - .memory-bank/dd-flow/mb-sdlc/specify/design-aspects/01-cli-command-surface.md
  - .memory-bank/dd-flow/mb-sdlc/specify/design-aspects/02-ai-pipeline-and-model-prompts.md
  - .memory-bank/dd-flow/mb-sdlc/specify/design-aspects/03-web-ui-surface.md
related_files:
  - .memory-bank/dd-flow/common/specification.md
  - .memory-bank/dd-flow/mb-sdlc/plan-aspects/index.md
tags: [dd-flow, mb-sdlc, specify, design-aspects]
history:
  - version: '0.1.0'
    date: '2026-07-04'
    changes: 'Created v1 specify design-aspect catalog for CLI, AI pipeline/model prompts and UI.'
  - version: '0.2.0'
    date: '2026-07-05'
    changes: 'Strengthened AI pipeline/model prompt aspect with model profiles, token/cost accounting and deterministic harness guidance.'
---

# Specify Design Aspects

Design aspects are specify-time checklists. They help an agent notice a familiar software shape, propose good defaults and ask better problem-space questions before planning.

They are not hidden requirements. A design aspect becomes binding for one protocol only when `specify` records it in the protocol/RUN artifact with applicability, accepted defaults, deviations, user overrides, verification seeds and a source link.

## How To Use

During `specify`:

1. Read this index.
2. Select every aspect that obviously applies to the user's task.
3. Read the selected aspect files.
4. Ask only user-level questions that affect the problem space or accepted defaults.
5. Record compact decisions in `design_aspects`.
6. Pass `verification_seeds` and `linked_plan_aspects` to `plan`.

Do not create work merely because an aspect exists. If the user rejects a canonical default, record the override and let it outrank the aspect.

## V1 Aspects

| Aspect | Use When | Source |
| --- | --- | --- |
| CLI command surface | The task creates or changes a CLI, subcommand, flag, command output or agent automation surface. | [01-cli-command-surface.md](01-cli-command-surface.md) |
| AI pipeline and model prompts | The task changes prompts, model calls, model profiles, token/cost accounting, AI workers, tool use, structured output, retry/repair or AI-generated artifacts. | [02-ai-pipeline-and-model-prompts.md](02-ai-pipeline-and-model-prompts.md) |
| Web UI surface | The task changes user-facing screens, dashboards, reports, forms, navigation, components or browser-visible interactions. | [03-web-ui-surface.md](03-web-ui-surface.md) |

## Future Candidates

Future protocols may add dedicated aspects for API surfaces, realtime/networking, staged pipelines/workflows, libraries/packages, background workers, data migrations and eval/experiment systems. Until they exist, use the closest current design aspect plus the plan-aspect catalog.

## Compact Artifact Shape

```yaml
design_aspects:
  - id:
    source:
    applicability: applicable | not_applicable | unknown
    applicability_reason:
    canonical_defaults: accepted | accepted_with_deviations | rejected | not_applicable
    accepted_defaults: []
    deviations: []
    user_overrides: []
    questions_closed: []
    verification_seeds: []
    linked_plan_aspects: []
```
