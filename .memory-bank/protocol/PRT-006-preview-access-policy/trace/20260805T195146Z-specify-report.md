---
file: '.memory-bank/protocol/PRT-006-preview-access-policy/trace/20260805T195146Z-specify-report.md'
description: 'Completion trace optimized specify для PRT-006.'
purpose: 'Фиксирует итог gap analysis, проверки артефактов и безопасный handoff в plan.'
version: '0.1.0'
date: '2026-08-05'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/protocol/PRT-006-preview-access-policy/index.md'
tags: [trace, specify, preview, auth]
---

# Prompt report: protocol.md → specify

- timestamp: 2026-08-05T19:55:51Z
- prompt: `.memory-bank/dd-flow/protocol.md` with logical `specify`
- protocol: `PRT-006-preview-access-policy`
- completed_stage: protocol bootstrap and specify
- next_action: run `.memory-bank/dd-flow/plan.md` in the feature worktree
- status: `specified_ready_for_plan`
- files_changed: protocol index/summary/intake/trace plus ignored RUN-304 specify artifacts
- state_changed: local feature worktree and file-only degraded run created; no external/provider state changed
- checks: canonical workspace bootstrap, JSON schema validation, HTML template equality/structure, focused protocol-doc validation and final docs check passed; browser execution smoke and mb-lint explicitly not run because their CLI/tooling was unavailable
- evidence: `.tasks/dd-flow-runs/RUN-304-preview-access-policy/01-specify/`
- verification: requirements, decision combinations, misuse boundary and acceptance story are plan-ready
- review: smallest coherent scope; no dependency, DB migration, deploy CLI or domain allowlist introduced
- blockers: none for plan; runtime CLI remains unavailable/degraded
- active_def: `DEF-MBU-RUNTIME-ACTIVE-STATE` — `not_touched`, non-blocking
- user_decision_required: no

## Summary

Baseline, focused project research, light use-case analysis, full decision table
and full misuse-case analysis converged on two independent settings. Hosted
defaults are `private + closed`; `private + open` and `public + closed` are
explicit supported choices. `public + open` is excluded until a separate
protocol adds accepted eligibility and abuse controls. Provider/application
readbacks remain independent and fail closed on mismatch or unknown values.

Knowledge extraction was not delegated because the active session policy did
not authorize a fresh worker. No candidates were fabricated; stage artifacts
record `compact_no_subagent` as a degraded provenance boundary. The complete
raw intake remains linked for later merge-time knowledge promotion.
