---
file: '.memory-bank/dd-flow/mb-sdlc/specify/design-aspects/02-ai-pipeline-and-model-prompts.md'
description: 'Specify-time design aspect for AI pipelines, model calls and prompts.'
purpose: 'Use when a task changes prompts, model/runtime behavior, AI workers, structured outputs, tools, retries, repair or evals.'
version: '0.2.0'
date: '2026-07-05'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/mb-sdlc/specify/design-aspects/index.md'
tags: [dd-flow, mb-sdlc, specify, design-aspect, ai, prompts]
history:
  - version: '0.1.0'
    date: '2026-07-04'
    changes: 'Created specify design aspect for AI pipelines, model calls and prompts.'
  - version: '0.2.0'
    date: '2026-07-05'
    changes: 'Added model profiles, token/cost accounting, model-vs-harness split, compact-id substitution, concurrency and multi-consumer pipeline API guidance.'
---

# 02 AI Pipeline And Model Prompts

## Applicability

Use this aspect when the task creates or changes:

- prompts, system/developer instructions or prompt templates;
- model calls, provider profiles, tool use or context injection;
- AI workers, repair loops, structured output or evals;
- pipelines where model output feeds later deterministic work.

## Canonical Defaults

- Prompt authority is explicit: mandatory instructions are separated from reference context.
- Source documents are named and linked; agents should not rely on memory for canonical rules.
- Model calls go through named model profiles where practical. A profile records provider, model, endpoint/profile name, key parameters, timeout, fallback profiles and refusal/safety policy.
- Model behavior is separated from deterministic harness behavior: the model makes model-worthy judgments, while deterministic code handles parsing, validation, normalization, id restoration, sorting, enrichment, persistence and mechanical transformations.
- Structured output has a schema or deterministic validation when downstream automation depends on it.
- Long, fragile or machine-generated identifiers are not copied through the model when a short stable alias table can be used. The harness may map `short_id -> full_id` before the call and restore full ids after validation.
- Retry/repair receives the original task, previous output and concrete validation errors.
- Model/provider assumptions, fallback and non-determinism are visible in plan/evidence where relevant.
- Tool calls and model outputs leave enough trace for later verification, including profile name, prompt/template source, selected context, validation result, retry/repair decisions and token/cost/latency data where available.
- Token and cost accounting is planned when model calls are repeated, high-volume, user-billable, provider-limited or operationally important.
- Large or high-throughput AI pipelines consider batching, parallel model calls, queues, fan-out/fan-in, map-reduce, reducer/aggregator points, rate limits and backpressure.
- Candidate generation may be parallel, but applying mutations should go through a deterministic, validated and intentionally serialized or conflict-aware step.
- If the pipeline is consumed by production logic, tests, evals, experiments, dashboards or CLI/debug tools, keep one core pipeline contract and adapt consumers through adapters instead of duplicating pipeline logic.
- Evals or representative examples are planned when deterministic tests cannot prove behavior.

## Specify Questions

- What model behavior must be deterministic enough to rely on?
- What output shape is consumed downstream?
- Which sources have authority over prompt behavior?
- Which named model profile should be used, and what provider, model, parameters, timeout and fallback profiles does it imply?
- Which parts of the work should the model decide, and which parts should deterministic harness code perform before or after the call?
- Are long ids, paths or generated identifiers present, and should the harness use short aliases with deterministic restoration?
- What input volume, latency, throughput, budget, token/cost or rate-limit constraints matter?
- Can candidate discovery/extraction run in parallel, and where must reduction, aggregation or mutation application become sequential or conflict-aware?
- Which consumers will use this pipeline: production flow, tests, evals, experiments, dashboards, CLI/debug tools or external API users?
- What failures are expected: malformed output, missing context, tool error, hallucinated source or provider outage?
- Is a deterministic test enough, or is an eval/experiment required?

## Decisions To Record

- Prompt source of truth and affected prompt files.
- Model profile source of truth, selected profile and fallback policy.
- Required output schema or validation rule.
- Model-vs-harness responsibility split.
- Identifier aliasing/restoration policy when compact ids are used.
- Repair/retry policy and when to stop.
- Provider/profile/fallback assumptions.
- Token, cost, latency, rate-limit and budget accounting policy.
- Parallelization, batching, queueing, reducer/aggregator and mutation-application policy.
- Core pipeline API/contract and consumer adapters when multiple consumers use the same pipeline.
- Trace, logging and evidence expectations.
- Eval/experiment requirement or not-applicable rationale.

## Verification Seeds

- `prompt_source_authority`: prompt reads the canonical source, not duplicated stale text.
- `model_profile_contract`: model calls use a named profile with provider, model, parameters, timeout and fallback behavior visible to plan/evidence.
- `token_cost_accounting`: token, cost, latency or provider-usage data is recorded where available or explicitly not applicable.
- `model_harness_responsibility_split`: deterministic code performs mechanical parsing, validation, normalization, id restoration and persistence instead of asking the model to do it.
- `compact_id_roundtrip`: short aliases are restored to full ids deterministically and unknown/duplicate aliases are rejected.
- `structured_output_validation`: invalid output is detected and handled.
- `repair_loop_contract`: repair prompt receives error context and has a bounded stop condition.
- `parallel_reduce_apply_contract`: parallel candidate work and sequential/conflict-aware mutation application are separated when throughput or shared state requires it.
- `multi_consumer_pipeline_contract`: production, test and eval consumers share core pipeline logic through an explicit API/adapter boundary.
- `traceability_contract`: model inputs/outputs/tool calls are inspectable enough for the gate.
- `eval_needed_check`: eval/experiment is present or explicitly not applicable.

## Linked Plan Aspects

- `agentic_runtime_design_quality`
- `pipeline_design_review`
- `concurrency_pipeline_design`
- `testing_system_design_review`
- `verification_evidence_review`
- `scenario_seed_eval_review`

## Anti-Patterns

- Prompt text becomes the only source of a business or architecture rule.
- Model output is parsed by hope instead of validation.
- Model is used as a mechanical string transformer when deterministic code could safely do the work.
- The model is asked to copy long ids/paths/generated identifiers that could be represented by short aliases.
- Retry repeats the same prompt without concrete error feedback.
- Provider/model assumptions are hidden in code or session memory.
- Token/cost/latency behavior is invisible for repeated or high-volume model calls.
- Test/eval/debug paths duplicate pipeline logic instead of using the same core contract through adapters.
- Evals are used to replace deterministic acceptance checks without an explicit decision.
