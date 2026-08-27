---
file: '.memory-bank/spec/engineering/SPC-010-agent-owned-verification-and-safe-hitl.md'
purpose: 'Records the beta vNext verification and HITL contract.'
status: 'BETA'
---

# SPC-010 — Agent-owned verification and safe HITL

PLAN chooses proportionate verification from project evidence. It declares a
single check catalogue and references it from items and acceptance contracts.
The CLI validates references, provider ordering, gates and protected command
aliases; it does not classify a check as relevant, cheap or sufficient.

A planned check identifies the Work that materializes it. Consumers depend on
that Work. A new `@check/...` alias records the exact command definition;
ordinary focused local commands require no pre-registration.

`aspect-map.json` records applicability and reviewer routing only. Reviewer
results remain immutable child-Work output plus the stage decision.

When a PROTOCOLIZE HITL answer changes an accepted obligation, preserve
`specify.json` and record a `HITL-*`-backed amendment in
`protocolize-result.json`. Later stages use the effective wording.

The lifecycle hook must never append data to a Bash command containing a
heredoc. Resume uses trusted matching arguments instead of a rewrite.
