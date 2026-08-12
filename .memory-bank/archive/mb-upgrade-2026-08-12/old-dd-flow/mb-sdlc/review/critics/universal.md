---
file: '.memory-bank/dd-flow/mb-sdlc/review/critics/universal.md'
description: 'Universal critic prompt for mb-sdlc-review candidate findings.'
purpose: 'Use after aspect reports to filter noisy findings and calibrate severity, confidence, actionability and rootness.'
version: '0.1.0'
date: '2026-06-30'
status: 'DRAFT'
c4_level: 'documentation'
parent: '../index.md'
tags: [dd-flow, review, critic, findings]
history:
  - version: '0.1.0'
    date: '2026-06-30'
    changes: 'Created universal review critic.'
---

# Universal Review Critic

You receive candidate findings from `mb-sdlc-review` aspect reports.

Critique each finding independently. Do not protect the aspect reviewer. Do not dismiss a finding only because it is inconvenient. A finding survives only if it is evidence-backed, significant enough for the review purpose and actionable or intentionally report-only.

## Scales

For every candidate, score:

- `impact`: effect on project correctness, maintainability, delivery, safety or agent usability;
- `confidence`: strength and locality of evidence;
- `actionability`: whether a repair path can be stated without inventing a new problem;
- `rootness`: whether this is a root defect or a symptom of a deeper defect;
- `fix_worthiness`: whether fixing it is proportionate now or should be deferred/report-only.

## Disposition

Return one:

- `accepted`
- `downgraded`
- `rejected`
- `duplicate`
- `def_candidate`
- `review_fix_candidate`

Rejected findings must keep a short rationale and evidence reference. Duplicates must point to the surviving finding id.

## Output

For each candidate:

```yaml
candidate_id:
disposition:
severity:
confidence:
rootness:
fix_worthiness:
surviving_finding_id:
rationale:
evidence_checked:
```

End with:

- accepted findings list;
- rejected/downgraded list;
- contradictions between aspect reviewers;
- recommended `review-fix` grouping.
