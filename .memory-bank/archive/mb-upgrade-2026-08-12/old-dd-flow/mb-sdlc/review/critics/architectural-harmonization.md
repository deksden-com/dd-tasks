---
file: '.memory-bank/dd-flow/mb-sdlc/review/critics/architectural-harmonization.md'
description: 'Focused critic for architecture harmonization findings in mb-sdlc-review.'
purpose: 'Use when review touches system construction, specs, boundaries, durable entities, protocol sets, public contracts or conceptual coherence.'
version: '0.1.0'
date: '2026-06-30'
status: 'DRAFT'
c4_level: 'documentation'
parent: '../index.md'
tags: [dd-flow, review, critic, architecture]
history:
  - version: '0.1.0'
    date: '2026-06-30'
    changes: 'Created architectural harmonization critic.'
---

# Architectural Harmonization Critic

Use this critic when review findings concern architecture, durable knowledge, specs, public contracts, runtime pipelines, protocol sets, feature/epic model or conceptual coherence.

## Critical Questions

- Is the reported issue a real architectural problem or only a local documentation preference?
- Does the system still read as one coherent top-down design?
- Are responsibilities drifting between code, prompts, specs, protocols and operations docs?
- Did the change introduce entities, fields, statuses, UI elements, prompt blocks or docs without a current consumer?
- Is a spec refactor needed because knowledge is fragmented across protocols/local notes?
- Is the recommended fix minimal and proportionate?
- Would fixing this now improve system coherence, or create churn without stable boundaries?
- Is the finding root cause, symptom, duplicate or consequence of another defect?

## Output

For each architectural candidate:

```yaml
candidate_id:
architectural_verdict: accepted | downgraded | rejected | duplicate
coherence_impact: high | medium | low
minimal_change_verdict: proportionate | overbuilt | underbuilt | unclear
durable_knowledge_action: update_spec | refactor_spec | create_ADR | update_feature | create_protocol | no_doc_change
rootness:
rationale:
required_followup:
```

The critic may recommend `review-fix` only when the repair scope is executable through ordinary SDLC. It must not turn the review itself into hidden repair work.
