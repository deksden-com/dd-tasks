---
file: '.memory-bank/dd-flow/mb-sdlc/specify/packet.md'
description: 'Bounded SPECIFY packet rendered directly into a RUN stage prompt.'
purpose: 'Give the worker the necessary priming, project grounding and semantic contract once.'
version: '0.1.1'
date: '2026-10-18'
status: 'ACTIVE'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/mb-sdlc/specify/stage.md'
tags: [dd-flow, specify, stage-packet]
---

# SPECIFY: bounded work packet

## Project grounding

Establish the current baseline from the selected project's source, README and
applicable specifications; cite the inspected sources. Use the RUN-local intake
for the requested change and accepted task decisions. If a fact is not supported
by those inputs, keep it unknown rather than borrowing another project's stack,
features or implementation claims. This shared packet supplies no project facts.

## Goal

Turn the user request and the RUN-local intake into the smallest reliable set
of unresolved product decisions. Ground each question in that inspected baseline
and the user request. Do not design implementation, select architecture,
create a worktree, plan, merge, or run checks for a later stage.

## Method

1. Separate current behavior, accepted task decisions and open target questions
   using the evidence boundary below. Identify only decisions still unsettled.
2. For each real gap, explain its user or scenario impact and give the smallest
   recommended answer when one is useful.
3. Do not re-ask accepted task decisions. Background implementation alone does
   not fix target behavior that the intake explicitly leaves open.
4. If no material gap remains, state that explicitly and finish `done`.

## Evidence and decision boundaries

- **Current behavior:** cite what code, README or earlier specifications do.
  This is background, not automatic approval for the new feature.
- **Accepted decisions:** identify the explicit user/protocol source and scope.
  Recommendations and observed implementation are not accepted decisions.
  Preserve genuinely binding obligations.
- **Open questions:** retain material target choices not yet accepted, especially
  those the intake explicitly declares undecided. Offer legacy behavior as
  background or an option, never as an invented accepted constraint.

Expose conflicts between existing rules and the requested change. An explicitly
accepted scoped exception supersedes the general rule only within that scope;
preserve the rule elsewhere. For example, legacy rejection of archive mutations
does not settle priority editing in archives when that choice is explicitly open.
Do not say it is “already fixed” or ask the user to override invented approval.

Recommendations for open choices are proposals, not obligations. Say “I recommend
preserving the current behavior” rather than “the existing rule remains mandatory”.
Words such as “mandatory”, “required” or “cannot change” need a cited binding
source that explicitly applies to the proposed feature, not just legacy behavior.
If that applicability is uncertain, expose it as an open question. A binding
security, legal or accepted task constraint stays binding; do not silently waive
it. Do not call the same target choice both open and mandatory in the question,
recommendation, semantic result or next-stage handoff.

## Semantic output

Edit the generated `@stage/stage-input.json` only. It is the valid layout:
replace every placeholder, retain `waiting_for_user` plus structured questions
when a clarification is needed, or change to `done` and omit `questions` when
it is not. The CLI derives Git data, reports, HTML and summary.

## Conflict boundary

If the CLI rejects the required semantic status or its receipt contradicts the
result, stop with `flow_contract_conflict`. Never convert a waiting result to
another lifecycle status merely to make a command succeed.
