---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/agentic_runtime_design_quality.md'
description: 'Aspect prompt for agentic runtime and AI model-call design quality.'
purpose: 'Review prompts, model profiles, deterministic harness split, retry/repair, validation and usage accounting.'
version: '0.2.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: program
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, ai, prompts, model-profiles]
history:
  - version: '0.2.0'
    date: '2026-07-31'
    changes: 'Added reference-based context and progressive repair attempt-lineage review requirements.'
---

# Aspect: agentic_runtime_design_quality

Applies to prompts, model calls, tool use, provider profiles, token/cost accounting, repair/retry, context injection, worker orchestration or AI-generated artifacts.

Grounding sources: AI runtime guide, prompt files, model profile config, provider/fallback settings, usage accounting, validation/parsing code, traces, evals and repair prompts.

Plan review: require named model profiles where practical, provider/model/parameters/fallbacks, token/cost/latency accounting, deterministic harness boundaries, compact-id roundtrip, retry/repair and output validation. Existing source data should move through stable resolvable references rather than model restatement. Addressable invalid output should use progressive repair with minimal patches, immutable attempt lineage and full reconstructed-result validation; full regeneration needs an explicit reason.

Readiness review: verify prompts and runtime do not rely on model memory for deterministic work; the harness resolves/version-pins selected sources, materializes inaccessible context, preserves repair attempts, applies scoped patches deterministically and validates the complete result; validation, usage trace, profile/fallback and repair behavior are implemented or honestly deferred.

Blocking findings: model asked to restate source data or do deterministic normalization/restoration without a task-specific reason; opaque or unresolvable context reference; no schema validation for automated output; repair rewrites valid sections without justification or loses attempt evidence; model profile unknown; no accounting for repeated/user-billable/provider-limited calls.

Acceptable DEF: provider-level metrics deferred only when current use is non-repeated, non-billable and non-operationally important.
