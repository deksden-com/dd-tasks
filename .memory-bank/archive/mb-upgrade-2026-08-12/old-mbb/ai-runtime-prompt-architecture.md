---
file: '.memory-bank/mbb/ai-runtime-prompt-architecture.md'
description: 'Canonical guide for AI runtime, prompt architecture, provider profiles, retry/repair behavior, observability, and concurrent agent/model pipelines.'
purpose: 'Read when designing, reviewing, or documenting prompt-driven features, model calls, agent pipelines, tool use, provider fallbacks, retry/repair loops, or AI-generated artifacts.'
version: '0.3.0'
date: '2026-07-31'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
related_files:
  - .memory-bank/mbb/principles.md
  - .memory-bank/mbb/coding-standards-guide.md
  - .memory-bank/mbb/code-contracts-guide.md
  - .memory-bank/mbb/cross-references.md
tags: [mbb, ai-runtime, prompts, agents, observability, provider-profile, retry, concurrency]
history:
  - version: '0.3.0'
    date: '2026-07-31'
    changes: 'Added reference-based context, progressive repair, full-result revalidation and immutable repair attempt lineage.'
  - version: '0.2.0'
    date: '2026-07-05'
    changes: 'Added model profile usage accounting, deterministic harness split, compact-id roundtrip and multi-consumer pipeline contract guidance.'
  - version: '0.1.0'
    date: '2026-06-18'
    changes: 'Added canonical AI runtime and prompt architecture guidance.'
---

# AI Runtime And Prompt Architecture

AI runtime is part of system architecture when a project uses prompts, model calls, agents, tool calls, skills, provider profiles, retry/repair loops, or generated artifacts that affect product behavior, developer workflow, verification, or Memory Bank state.

Do not treat prompt changes as "just text" when they control automation. A prompt-driven stage has inputs, contracts, side effects, error modes, observability needs, and consumers.

## Core Rule

Design AI runtime with the same discipline as other code boundaries:

```text
model stage -> input contract -> context provenance -> tool policy -> output contract -> validation -> trace -> retry/fallback -> consumer
```

Do not add model/runtime machinery "на всякий случай". Introduce a prompt block, provider profile, queue, retry loop, field, status, report section, or worker only when it has a current consumer and a gate that checks it.

## Prompt Structure

Use clear structural blocks. XML-like tags are useful for marking sections, but the prompt must not become noisy XML for its own sake.

Good prompt blocks answer:

- what task the model must do;
- which instructions are mandatory;
- which context is reference-only;
- where the model must get data;
- which tools or skills are available;
- when to call tools;
- what output format is required;
- what to do on uncertainty, blocked state, invalid input, or missing evidence.

Separate directive blocks from reference context. A future reviewer should be able to tell which text is an instruction and which text is background.

Avoid asking the model to copy large context into its answer when deterministic code can carry the data forward.

Avoid asking the model to copy long, fragile or generated identifiers when deterministic code can carry an alias table. For model context, prefer stable compact aliases where useful, then restore full ids in harness code after parsing and validation.

## Reference-Based Context: Do Not Restate

When source data already exists in an addressable artifact, the model should not
repeat that data merely to pass it to the next stage. Return stable source
references plus the new judgment, classification, synthesis or change that only
the model is responsible for. The deterministic harness carries source data
forward, resolves references, restores authoritative values and enriches the
validated result.

The context harness must make every reference usable rather than giving the
model or a downstream consumer an opaque path. Where relevant, prepare:

- a stable `source_id` or compact alias;
- a locator such as a project-relative path, artifact id or checked `run://`
  reference;
- a version, content hash or immutable snapshot identity;
- the bounded fragment or permitted read mechanism needed for the task;
- provenance and authority category for the referenced data.

If the model or downstream consumer cannot resolve a reference, the harness
must materialize the required selected context. A bare inaccessible link is not
context. Do not rely on hidden conversation or orchestrator memory to fill the
gap.

Restatement is allowed when transformation of the source is itself the task,
for example summarization, translation, redaction or user-facing synthesis, or
when an external consumer cannot access the source. Even then, preserve source
references and avoid copying unrelated material.

## Source Authority

Every AI stage should know source authority:

- user input is primary for intent and constraints;
- Memory Bank is durable project knowledge;
- code is the source of exact behavior;
- runtime artifacts are evidence for a specific run;
- tool results are facts only for the time and command that produced them;
- model inference is a proposal until validated.

Do not merge these categories in reports. If a model inferred something from evidence, say it is an inference.

## Observability

AI runtime needs traces that let a maintainer reconstruct what happened:

- prompt or prompt version;
- model/provider profile;
- token usage, cost estimate, latency, retry/repair count and provider usage metadata when available and relevant;
- input task and selected context;
- context sources and why they were included;
- tool calls and tool results;
- output validation results;
- retry/repair attempts and their parent/child lineage;
- final model output or rejected output;
- handoff artifact consumed by the next stage.

The project can store traces as structured logs, run artifacts, stage reports, verification passports, or provider-native trace ids. The important rule is that the next gate can inspect enough evidence to reproduce the decision path without relying on memory.

Do not store secrets or sensitive raw provider payloads in durable Memory Bank. Curate evidence before promotion.

## Output Contracts And Validation

If model output drives automation, it needs a contract:

- JSON Schema, typed parser, DSL parser, command contract, scenario contract, or another deterministic validation layer;
- semantic validation where schema correctness is not enough;
- explicit behavior when validation fails.

Prefer deterministic code for parsing, normalization, sorting, deduplication, filtering, formatting, and schema validation. Use the model for judgment, synthesis, ambiguity resolution, or language work where it is actually needed.

The harness should own mechanical post-processing: short-id restoration, authoritative enrichment, persistence, deterministic mutation application and evidence writing. The model should produce candidates or judgments within an output contract, not act as a general string-processing step.

## Error Handling

Classify errors before designing retry behavior:

| Error type | Typical handling |
| --- | --- |
| network timeout | retry with bounded backoff |
| provider unavailable | fallback profile or blocked state |
| rate limit | backoff, queue, or user-visible wait |
| auth/config error | stop and report configuration blocker |
| invalid output schema | repair prompt with validation error |
| semantic mismatch | repair prompt or verifier finding |
| unsafe/tool-denied result | stop or use approved fallback path |
| stale context | refresh context or block with evidence |
| partial worker failure | aggregate as degraded, retry specific part, or create DEF |

Never convert provider failure into empty success unless the contract explicitly says that empty result is correct and evidence proves it.

## Retry And Repair Prompts

A repair prompt is not "try again". It must receive:

- original task;
- required output contract;
- previous model output;
- exact validation or semantic error;
- allowed changes;
- maximum attempts or stop condition.

Prefer progressive repair when the output contract has addressable fields,
items or sections and the error has a bounded scope. The model should return a
minimal patch, keyed replacement or scoped section replacement instead of
regenerating already valid data. The harness applies the change
deterministically and validates the complete reconstructed artifact, not only
the patched fragment.

Use full regeneration when the failure affects global coherence, the repair
scope cannot be isolated safely, the output is broadly corrupted, or a local
patch would preserve hidden contradictions. Repeated failure of the same
progressive repair should also trigger the stop condition or an explicit
escalation to full regeneration rather than an unbounded loop.

Preserve every attempt as immutable trace evidence. At minimum record
`attempt_id`, `parent_attempt_id`, prompt/model profile, selected context
snapshot or references, previous artifact hash, exact error, allowed repair
scope, returned patch or replacement, resulting artifact hash and validation
verdict. Persist the complete attempt history, but inject only the relevant
lineage into the next repair prompt so history does not become unbounded model
context.

Repair should be bounded. If the model repeats the same failure, stop with a finding, `DEF-*`, or user decision instead of looping indefinitely.

In dd-flow projects, `.memory-bank/dd-flow/workers/repair.md` is the standard narrow repair worker prompt for invalid model output. Project-local flows may replace it only if they preserve the same contract: original task, previous output, exact error, allowed changes and stop condition.

## Provider Profiles

When a project depends on model calls, document the provider profile where appropriate:

- provider and model/profile name;
- endpoint or platform surface;
- timeout and retry policy;
- fallback profile and fallback limits;
- cost/latency/safety tradeoff if meaningful;
- schema/output compatibility;
- live-provider vs mocked/local mode for tests;
- what gates require real provider evidence.

Fallbacks must not silently change output shape, safety expectations, or accepted quality. If fallback behavior changes the gate, report it.

For repeated, high-volume, user-billable, provider-limited or operationally important calls, define usage accounting:

- which token/cost/latency fields are available from the provider;
- where usage data is stored or summarized;
- how budgets, rate limits and fallback cost changes are surfaced;
- what is redacted before traces become durable Memory Bank evidence.

If token accounting is unavailable or intentionally skipped, record the reason in plan/evidence rather than leaving the absence implicit.

## Tool And Skill Policy

Tool use should be explicit:

- what tool is available;
- why the model may use it;
- when it must use it;
- what evidence from the tool must be captured;
- what the model must not do through the tool.

Skills are context and procedure, not magic authority. If a skill changes how evidence is collected or how output is validated, the stage report should mention it.

## Concurrency And Pipelines

Parallel AI stages need a small architecture, not just several prompts running at once:

- what can run independently;
- what must wait for another result;
- who owns each queue item or worker claim;
- how intermediate artifacts are named and validated;
- how results are aggregated;
- how conflicts are resolved;
- how partial failure is reported;
- how idempotency and stale-state risks are handled.

Do not add queues, locks, status fields, worker pools, or aggregation reports unless the current flow consumes them.

For high-volume AI pipelines, prefer parallel candidate extraction/generation where safe and a deterministic reducer/apply step for mutations. If mutation application is parallel, the design must explain conflict handling, ordering, idempotency and rollback.

If production code, tests, evals, dashboards or debug tools consume the same AI pipeline, keep one core pipeline contract and expose adapters for each consumer. Do not copy the pipeline logic into test/eval/debug paths.

## Review Checklist

At plan time, check whether the design defines:

- task and output contract;
- context provenance;
- tool/skill policy;
- provider profile and fallback;
- token/cost/latency accounting and redaction when relevant;
- validation and repair;
- model-vs-harness responsibility split;
- compact-id roundtrip when long ids are present;
- trace/evidence;
- concurrency and aggregation, if relevant;
- consumer adapters when the pipeline is reused by production/tests/evals/dashboards/debug tools;
- current consumer for every new runtime field or stage.

At readiness time, check actual implementation:

- traces exist or degraded reason is honest;
- validation actually runs;
- retry/repair prompt is specific;
- fallback behavior is visible;
- model profile and usage accounting are visible or explicitly not applicable;
- deterministic harness handles mechanical parsing, validation, normalization, id restoration and mutation application;
- compact-id aliases cannot pass unknown or ambiguous ids downstream;
- pipeline consumers share one core contract instead of duplicated logic;
- no prompt block, schema field, UI field, status, queue or worker was added without a current consumer.
