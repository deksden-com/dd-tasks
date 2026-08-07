---
file: '.memory-bank/dd-flow/mb-sdlc/review/index.md'
description: 'Execution model for mb-sdlc-review.'
purpose: 'Read before running project-level review so focus modes, artifacts, critics, reports and dashboard links stay consistent.'
version: '0.1.0'
date: '2026-06-30'
status: 'DRAFT'
c4_level: 'documentation'
parent: '../review.md'
children:
  - aspects.md
  - critics/universal.md
  - critics/architectural-harmonization.md
  - stage-report-template.html
tags: [dd-flow, review, index, aspects, critics]
history:
  - version: '0.1.0'
    date: '2026-06-30'
    changes: 'Created mb-sdlc-review execution index.'
---

# MB-SDLC Review Index

`mb-sdlc-review` is an on-demand diagnostic flow. It answers:

> Does the project state match the durable knowledge and delivery evidence the project claims to have?

The flow is project-level even when focused on a protocol, feature, epic, subsystem or diff.

## Artifact Chain

```text
source map
-> aspect coverage and aspect reports
-> candidate findings
-> critic pass
-> stage-report.json
-> stage-report.html
-> final-report.md
-> optional review-fix protocol(s)
```

`stage-report.json` is the source of truth for the visible HTML and final summary.

## Flow-owned route adapter (PRT-336)

Перед запуском critics зафиксируй для каждого applicable review aspect одну
route: `self_check`, `grouped_subagent` или `focused_subagent`.

| Decision | Route | Rule |
| --- | --- | --- |
| `self_check_allowed` | `self_check` | Deterministic source-map/coverage/schema/HTML-JSON checks; не закрывает aspect без coverage row. |
| `group_allowed` | `grouped_subagent` | Только named read-only group из allowlist ниже, общий snapshot и per-aspect report sections. |
| `keep_separate` | `focused_subagent` | Critical/security/contract boundary, hard predecessor, conflicting evidence или mutation/operational chain. |

- `self_check` разрешён для source-map/coverage/schema/HTML-JSON equality и
  других deterministic checks; он не закрывает aspect без явной coverage row.
- `grouped_subagent` разрешён только для read-only critics одного immutable
  snapshot из flow allowlist: `navigation_and_trace`
  (`structure_navigation_review`, `frontmatter_crosslink_review`,
  `protocol_delivery_trace_review`), `system_and_contract`
  (`spec_conformance_review`, `architecture_harmonization_review`,
  `contract_traceability_review`) и `evidence_and_operations`
  (`scenario_evidence_review`, `operations_policy_review`,
  `def_followup_review`). Не более трёх aspects в группе.
- `focused_subagent` обязателен для critical/security/contract boundary,
  conflicting evidence, hard predecessor или отдельного доверительного
  контекста. Writers, mutation, merge и operational-access chains не
  группируются.

`requires_output_of` — hard dependency и открывает следующий critic только
после принятого predecessor report; `related_to`/`informed_by` — soft context
и не создают wave. Existing `multi_subagent` в `aspects.md` является только
report/UI adapter для canonical `grouped_subagent`.

Один grouped report может обслуживать несколько coverage rows только при
отдельной секции на aspect с findings, verdict, evidence, limitations и
report reference. Partial/missing section делает group non-green и запускает
recovery только для affected aspect; aggregate report не заменяет coverage.

## Minimum Accepted Review

An accepted review must have:

- focus mode and reviewed object;
- source map;
- aspect coverage map;
- at least one review mode per applicable aspect;
- critic pass over candidate findings;
- JSON schema validation;
- HTML/JSON equality proof;
- clear next action: no repair needed, review-fix, DEF, or blocked/degraded rerun.

## Findings Do Not Repair The Project

The review report can create or reference DEFs if the finding must be discoverable, but it must not silently edit project code/docs to fix findings. Repairs go through `review-fix` and ordinary executable protocols.
