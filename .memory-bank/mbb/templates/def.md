---
file: 'memory-bank/defs/DEF-<AREA>-<SLUG>.md'
description: '<Durable named deferral with owner, gate, blocking scope, and close condition.>'
purpose: '<Read before planning or closing work in the affected area so known gaps are handled honestly.>'
version: '0.1.0'
date: 'YYYY-MM-DD'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'memory-bank/defs/index.md'
def_id: 'DEF-<AREA>-<SLUG>'
def_status: 'open'
def_type: '<code_blocker|documentation_blocker|verification_blocker|operations_blocker|safe_named_deferral|external_dependency>'
severity: '<low|medium|high|critical>'
owner: '<role/person/agent>'
next_gate: '<plan|code|merge|scenario|beta|release|deploy|production|follow-up>'
blocks: []
does_not_block: []
related_protocols: []
related_specs: []
related_scenarios: []
related_files: []
tags: [deferral]
---

# DEF-<AREA>-<SLUG>: <Title>

> Use this template only for durable project-wide DEFs. If the deferral is local to one protocol and does not affect future agents, keep it in the protocol or run closure report instead.

## Summary

<What is deferred and why it matters.>

## Current Status

- Status: `open | needs_user_decision | blocked_by_external_gate | in_progress | closed | rejected | superseded`
- Type:
- Severity:
- Owner:
- Opened:
- Review date or condition:

## Origin

- Protocol:
- Phase:
- Task/run:
- Files:
- Evidence:

## Context For Follow-Up

- What is known:
- What was already done:
- What was already checked:
- Required docs:
- Required code paths:
- Relevant commands:
- Evidence so far:

## User Blocker

- Required: `true | false`
- Question:
- Options:
- Recommendation:

## Fixability

- Can attempt now:
- Expected effort:
- Requires follow-up protocol:
- Suggested scope:

## Blocking Scope

- Does not block:
- Blocks:
- Next gate:
- Close condition:

## Links

- Related protocol:
- Related feature/epic:
- Related spec/ADR:
- Related scenario/evidence:

## Resolution History

- YYYY-MM-DD: Created.
