---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/00-aspect-template.md'
description: 'Template for dedicated MB-SDLC aspect prompts.'
purpose: 'Copy when adding a new plan/readiness aspect prompt.'
version: '0.2.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
depends_on: []
tags: [dd-flow, mb-sdlc, aspects, template]
---

# Aspect Prompt Template

`depends_on` lists only accepted predecessor outputs whose concrete data this
aspect cannot work without. An output may be an accepted local aspect-map row
or a delegated report. The Grounding section must name each artifact and the
Plan Review section must use its output. Shared inputs, related topics and
outputs that may merely be useful do not belong here. Keep the list empty by
default.

## Aspect Id

`<aspect_id>`

## Applies When

- ...

## Grounding Sources

- ...

## Plan Review

- ...

## Readiness Review

- ...

## Blocking Findings

- ...

## Acceptable DEF

- ...

## Report Notes

Use `../aspect-worker.md` report format and include suggested aspect-map update.
