---
file: '.memory-bank/dd-flow/mb-sdlc/README.md'
description: 'Internal prompt layout for the ordinary Memory Bank SDLC flow.'
purpose: 'Read to understand how root dd-flow entrypoints dispatch into specify, plan, code/readiness and merge stages.'
version: '0.1.0'
date: '2026-06-25'
status: 'DRAFT'
c4_level: 'documentation'
parent: '../README.md'
tags: [dd-flow, mb-sdlc, prompts, run-lifecycle]
---

# MB-SDLC

`mb-sdlc` is the ordinary executable protocol flow:

```text
protocol -> specify -> plan -> code/readiness -> ready_for_merge -> merge -> closed
```

Root files in `.memory-bank/dd-flow/` remain the user/operator entrypoints:

- `protocol.md`;
- `plan.md`;
- `code.md`;
- `merge.md`;
- `review.md`;
- `review-fix.md`;
- `interactive.md`;
- `finish.md`.

This directory holds the internal stage prompts and templates:

```text
mb-sdlc/
  specify/
    stage.md
    discovery.md
    gap-analysis/
  plan/
  code/
  merge/
  review/
```

Runtime convention:

- `run.flow_kind: mb_sdlc` for new ordinary protocol runs;
- legacy `run.flow_kind: coding` remains readable;
- `session.flow_kind` stays role-specific: `planning`, `implementation`, `merge_job`, `merge_worker`.

The canonical `mb-sdlc` stage layout inside `<run-home>` is:

```text
~/.dd-flow/projects/<PRJ-ID>/runs/<RUN-ID>/
  01-specify/
  02-plan/
  03-code/
  04-merge/
```

Legacy runs may still expose the same stage folders under `.tasks/dd-flow-runs/<RUN-ID>/`; use their stored `run.json` paths rather than creating new happy-path artifacts there.

When a stage is rerun, the current stage folder stays canonical. Previous contents move to `try-###` inside that same stage folder.

`mb-sdlc-review` is an on-demand project-level review flow, not a normal protocol stage in the ordered delivery chain. It uses `flow_kind: mb-sdlc-review`, writes its own `04-review/` report directory inside the review run home and may create follow-up ordinary protocols through `review-fix`.

The `specify/gap-analysis/` library is an optimized requirements-completeness
contour inside `specify`. Its umbrella router selects bounded discovery and the
smallest sufficient method checklists; it does not create a runtime stage or
replace `specify/design-aspects/`, which remains the owner of design defaults
passed to planning.

`specify/stage.md` is the stage-specific fragment selected by the SPC-006
renderer. A generated SPECIFY prompt must include it and may include only its
allowlisted discovery/gap/design fragments; it must not include root `code.md`,
implementation, readiness, merge or PLAN-only fragments.
