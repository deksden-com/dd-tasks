---
file: '.memory-bank/dd-flow/interactive.md'
description: 'Explicit project-local hybrid interactive workflow entrypoint.'
purpose: 'Route explicit user intent through the bound CLI flow without manual runtime mutation.'
version: '1.0.0'
date: '2026-10-23'
status: 'DRAFT'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/index.md'
tags: [spc-014, hybrid, interactive]
---

# Interactive: one request-bound working session

Ordinary discussion or a small requested edit does not itself authorize creating
a RUN/PRT. Use this entrypoint when the user explicitly selects the interactive
workflow. Explicit SDLC formalization remains `vnext/start.md`, SPECIFY first.
The interactive descriptor is separate from the seven-stage SDLC catalog.

Flow origin: project-local. Read project policy and
`interactive/hybrid/index.md` from this curated pack. Start with
`dd-flow flow interactive --help`; select the existing project, request identity,
original intake file and assigned workspace. Use the configured project Git
route or an explicitly selected route/integration branch. Do not create a PRT,
manually write runtime state or switch branches to satisfy a missing selection.

The default attached route requires the current trusted physical Session and
an exact observed launch command. A terminal without that binding must report
the missing binding; use `--execution managed` only when the user selects it.
Neither installed executable discovery nor environment strings prove attachment.
Profiles and per-stage routes are frozen before dispatch, not changed mid-RUN.

CLI returns one RUN and its immutable contexts. In attached mode start only the
returned entry Stage using its exact context and ordinary trusted Stage command.
In managed mode the existing controller owns execution. Continue this RUN with
`interactive inputs`, `interactive turn` and the issued Stage/Work commands.
Retain actual user messages verbatim; do not synthesize answers or consent.

Use `finish.md` to close free-turn intake in this same RUN. Missing handlers or
an invalid project pack require supported upgrade/repair, not a legacy fallback.
Historical RUNs use their own supported pinned engine and retained instructions;
this current entrypoint does not rewrite their lifecycle.
