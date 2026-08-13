---
file: '.memory-bank/dd-flow/mb-sdlc/specify/packet.md'
description: 'Bounded SPECIFY packet rendered directly into a RUN stage prompt.'
purpose: 'Give the worker the necessary priming, project grounding and semantic contract once.'
version: '0.1.0'
date: '2026-08-14'
status: 'DRAFT'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/mb-sdlc/specify/stage.md'
tags: [dd-flow, specify, stage-packet, beta]
---

# SPECIFY: bounded work packet

## Project grounding

dd-tasks is a TypeScript task-management product with React/Vite frontend,
Hono API, Drizzle/Postgres persistence, pnpm, Biome, Vitest and Playwright.
Its current baseline has authenticated users, workspaces, projects and tasks;
workspace isolation and task CRUD behavior are already established.

## Goal

Turn the user request and the RUN-local intake into the smallest reliable set
of unresolved product decisions. Ground each question in the baseline above
and the user request. Do not design implementation, select architecture,
create a worktree, plan, merge, or run checks for a later stage.

## Method

1. Identify only decisions that project evidence and the request cannot settle.
2. For each real gap, explain its user or scenario impact and give the smallest
   recommended answer when one is useful.
3. Do not ask questions whose answer is already fixed by the supplied context.
4. If no material gap remains, state that explicitly and finish `done`.

## Semantic output

Edit the generated `@stage/stage-input.json` only. It is the valid layout:
replace every placeholder, retain `waiting_for_user` plus structured questions
when a clarification is needed, or change to `done` and omit `questions` when
it is not. The CLI derives Git data, reports, HTML and summary.

## Conflict boundary

If the CLI rejects the required semantic status or its receipt contradicts the
result, stop with `flow_contract_conflict`. Never convert a waiting result to
another lifecycle status merely to make a command succeed.
