---
file: '.memory-bank/mbb/frontmatter-standards.md'
description: 'Canonical YAML frontmatter standards for Memory Bank files: required fields, optional relations, versioning, and history.'
purpose: 'Use when creating or reviewing Markdown files so metadata stays machine-readable and useful for navigation.'
version: '0.7.0'
date: '2026-08-06'
status: 'ACTIVE'
c4_level: 'standard'
tags: [frontmatter, metadata, yaml, standards, documentation]
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
related_files:
  - .memory-bank/mbb/glossary.md
  - .memory-bank/mbb/indexing-guide.md
  - .memory-bank/mbb/cross-references.md
history:
  - version: '0.7.0'
    date: '2026-08-06'
    changes: 'Added SPC-* as the project-local sequential identifier and filename prefix for new durable specification records.'
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Canonicalized frontmatter standards for reusable Memory Banks.'
  - version: '0.2.0'
    date: '2026-05-12'
    changes: 'Updated examples to the spec/system and adr root model.'
  - version: '0.3.0'
    date: '2026-05-25'
    changes: 'Added compact stub metadata fields for intentionally short canonical placeholders.'
  - version: '0.4.0'
    date: '2026-06-30'
    changes: 'Added protocol set, dependency, durable document, evidence, and cross-link frontmatter fields.'
  - version: '0.5.0'
    date: '2026-07-01'
    changes: 'Added deterministic mb-lint rule ids, type-aware contract boundaries and explicit non-goals for frontmatter linting.'
  - version: '0.6.0'
    date: '2026-07-07'
    changes: 'Added DEF frontmatter fields for durable project-wide named deferrals.'
---

# Frontmatter Standards

Every active Markdown file in Memory Bank should start with YAML frontmatter. Frontmatter lets humans and agents understand purpose, ownership, status, and links without reading the whole file.

## Required Fields

```yaml
---
file: memory-bank/spec/system/runtime/state-store.md
description: Runtime state store contract, invariants, and implementation links.
purpose: Read before changing state persistence, transitions, recovery, or related tests.
version: 1.0.0
date: 2026-05-12
status: ACTIVE
---
```

Rules:
- `file`: project-root-relative path; no absolute local paths.
- `description`: what the file contains, 1-2 sentences, under about 50 words.
- `purpose`: why/when to read the file; do not repeat `description`.
- `version`: semantic version `major.minor.patch`.
- `date`: last meaningful content update in `YYYY-MM-DD`.
- `status`: `ACTIVE`, `DRAFT`, or `DEPRECATED`.

Deterministic lint coverage:

- `frontmatter/parseable` checks YAML parseability.
- `frontmatter/required-fields` checks that the six global required fields are present.
- `frontmatter/file-path-matches` checks that `file` matches the document path. For migration compatibility, `mb-lint` may accept project-root-relative and MemoryBank-root-relative paths.
- `frontmatter/status-valid` checks the status enum.
- `frontmatter/date-format` checks `YYYY-MM-DD`.
- `frontmatter/version-format` checks `major.minor.patch`.
- `frontmatter/no-absolute-local-paths` checks that path-like frontmatter fields do not use local absolute paths.

## Recommended Fields

```yaml
c4_level: L1 | L2 | L3 | documentation | standard
index_type: shallow | deep | hybrid
coverage_depth: 2
parent: memory-bank/spec/system/index.md
children:
  - runtime/index.md
related_files:
  - memory-bank/adr/ADR-012-runtime-boundaries.md
related_epics:
  - memory-bank/epics/EP-001-runtime/index.md
related_features:
  - memory-bank/epics/EP-001-runtime/features/FT-001-01-state-store/index.md
related_specs:
  - memory-bank/spec/system/runtime/state-store.md
related_adrs:
  - memory-bank/adr/ADR-012-runtime-boundaries.md
related_scenarios:
  - memory-bank/scenarios/SCN-001-runtime-state.md
related_protocols:
  - memory-bank/protocol/PRT-001-runtime-state.md
evidence_files:
  - memory-bank/evidence/VP-001-runtime-state.md
implementation_files:
  - packages/runtime/src/state-store.ts
test_files:
  - packages/runtime/src/state-store.test.ts
target_audience: [developers, ai-agents]
automation_ready: true
content_state: complete | compact_stub
canonical_template: memory-bank/mbb/templates/ui-screen.md
activation_triggers:
  - confirmed screen contract
  - stable automation selectors
tags: [runtime, state, architecture]
history:
  - version: 1.0.0
    date: 2026-05-12
    changes: Initial canonical component documentation.
```

`doc_type` is optional. If present, deterministic tooling may use it to select type-aware checks. If absent, tooling may use only unambiguous path/id patterns. Do not use `doc_type` to make the linter guess semantic intent.

## Status Values

- `ACTIVE`: current source of truth.
- `DRAFT`: work in progress, not yet canonical.
- `DEPRECATED`: kept for historical reasons; should link to replacement.

Avoid informal statuses like `WIP`, `old`, `done`, or `in progress`.

## Versioning

- **Major:** structural rewrite, changed document responsibility, or incompatible guidance.
- **Minor:** new substantial section, new supported workflow, new important links.
- **Patch:** clarification, small correction, link update, wording improvement.

Update `date` with meaningful content changes, not typo-only edits.

## Specialized Fields

For compact stubs:

```yaml
content_state: compact_stub
canonical_template: .memory-bank/mbb/templates/ui-screen.md
activation_triggers:
  - confirmed screen contract
  - stable automation selectors
  - browser scenario evidence
```

Rules:
- keep `status` as `ACTIVE` when the stub is the current canonical place for future knowledge;
- use `content_state: compact_stub` to show that omitted template sections are intentional;
- `canonical_template` should point to the full template or guide that must be used when the stub is expanded;
- `activation_triggers` should name concrete facts, decisions, evidence, or project needs that justify expanding the document.

For ADR:

```yaml
decision_status: PROPOSED | ACCEPTED | DEPRECATED
decision_date: 2026-05-12
review_date: 2026-11-12
alternatives_considered: [option-a, option-b]
```

For feature:

```yaml
epic: EP-001
feature: FT-001-01
user_value: <short value statement>
related_specs:
  - memory-bank/spec/system/<area>.md
related_adrs:
  - memory-bank/adr/ADR-XXX-<slug>.md
related_scenarios:
  - memory-bank/scenarios/SCN-XXX-<slug>.md
evidence_files:
  - memory-bank/evidence/VP-XXX-<slug>.md
```

For scenario:

```yaml
scenario_id: SCN-001
scenario_kind: capability | lifecycle | golden
related_features:
  - memory-bank/epics/EP-XXX-<slug>/features/FT-XXX-YY-<slug>/index.md
related_specs:
  - memory-bank/spec/system/<area>.md
evidence_files: []
```

For protocol:

```yaml
protocol_set: memory-bank/protocol/_set/PSET-XXX-<slug>.md
blocked_by_protocols:
  - PRT-001-<slug>
related_epics:
  - memory-bank/epics/EP-XXX-<slug>/index.md
related_features:
  - memory-bank/epics/EP-XXX-<slug>/features/FT-XXX-YY-<slug>/index.md
related_specs:
  - memory-bank/spec/system/<area>.md
related_adrs:
  - memory-bank/adr/ADR-XXX-<slug>.md
related_scenarios:
  - memory-bank/scenarios/SCN-XXX-<slug>.md
source_user_input:
  - memory-bank/protocol/PRT-XXX-<slug>/intake/user-input.md
continuation_prompt: protocol-implement.md
implements_scope: <short executable scope>
```

Rules:
- `protocol_set` is required for member protocols of a `PSET-*`.
- `blocked_by_protocols` is the minimal dependency mechanism; use an empty array when there are no blockers.
- `source_user_input` preserves raw user intake when the protocol or protocol set was created from a larger discussion.
- `implements_scope` should stay narrow enough for one executable SDLC cycle.
- `related_epics`, `related_features`, `related_specs`, `related_adrs`, `related_scenarios` and `related_protocols` are not universally mandatory. They are required only when the protocol actually implements or changes those durable knowledge objects.

For protocol set:

```yaml
source_protocol:
  - memory-bank/protocol/PRT-XXX-<slug>.md
source_user_input:
  - memory-bank/protocol/PRT-XXX-<slug>/intake/user-input.md
members:
  - PRT-XXX-<slug>
```

Rules:
- protocol set frontmatter coordinates member protocols but does not make the set executable;
- member ordering is derived from each member protocol's `blocked_by_protocols`;
- do not introduce a graph field unless a project has an explicit tool that consumes it.
- `members` is mandatory for protocol set documents and should contain member `PRT-*` ids.

For durable DEF:

```yaml
def_id: DEF-<AREA>-<SLUG>
def_status: open | needs_user_decision | blocked_by_external_gate | in_progress | closed | rejected | superseded
def_type: code_blocker | documentation_blocker | verification_blocker | operations_blocker | safe_named_deferral | external_dependency
severity: low | medium | high | critical
owner: ops
next_gate: production
blocks:
  - production rollout
does_not_block:
  - local code closure
related_protocols:
  - memory-bank/protocol/PRT-XXX-<slug>.md
related_specs:
  - memory-bank/spec/operations/release-policy.md
related_scenarios: []
```

Rules:
- durable project-wide DEFs live under `defs/DEF-*.md` and are linked from `defs/index.md`;
- `def_id` should match the filename stem;
- `def_status`, `owner`, `next_gate`, `blocks` and `does_not_block` must be explicit enough for future agents to decide whether the DEF affects their current gate;
- use `.memory-bank/mbb/templates/def.md` when creating a new durable project DEF.

For spec/sub-spec:

```yaml
spec_id: SPC-001
related_epics:
  - memory-bank/epics/EP-XXX-<slug>/index.md
related_features:
  - memory-bank/epics/EP-XXX-<slug>/features/FT-XXX-YY-<slug>/index.md
related_adrs:
  - memory-bank/adr/ADR-XXX-<slug>.md
related_scenarios:
  - memory-bank/scenarios/SCN-XXX-<slug>.md
implementation_files: []
test_files: []
```

New independent specification records use
`spec/<product|system|engineering|operations>/SPC-XXX-<slug>.md`. The
`spec_id` must match the filename prefix. `index.md` files are navigation and
do not receive `SPC-*`. Existing unnumbered or legacy `SPEC-*` records remain
valid until an explicit migration; do not silently renumber them.

For ADR:

```yaml
decision_status: PROPOSED | ACCEPTED | DEPRECATED
decision_date: 2026-05-12
related_specs:
  - memory-bank/spec/system/<area>.md
related_features:
  - memory-bank/epics/EP-XXX-<slug>/features/FT-XXX-YY-<slug>/index.md
related_protocols:
  - memory-bank/protocol/PRT-XXX-<slug>.md
```

For evidence:

```yaml
evidence_id: VP-XXX
evidence_kind: test | scenario | eval | review | release | manual
verdict: pass | fail | partial | blocked
run_id: RUN-XXX-<slug>
commit: <sha>
environment: local | ci | beta | staging | production | external
related_scenarios:
  - memory-bank/scenarios/SCN-XXX-<slug>.md
related_protocols:
  - memory-bank/protocol/PRT-XXX-<slug>.md
```

For tests/quality docs:

```yaml
test_type: unit | integration | e2e | scenario
coverage_scope: [runtime, cli, ui]
```

## Formatting Rules

Good:

```yaml
tags: [runtime, state, redis]
implementation_files:
  - packages/runtime/src/state-store.ts
```

Avoid:

```yaml
tags: runtime, state
version: v1.0.0
date: 05/12/2026
status: active
implementation_files: packages/runtime/src/state-store.ts
```

## Quality Rules

- Keep arrays as YAML arrays.
- Keep paths stable and relative to the project root.
- Keep `children` and indexes aligned.
- Keep `history` to the latest 3-7 meaningful changes.
- Do not add fields that no tool or reader uses.
- Do not use frontmatter to hide unresolved contradictions; fix the docs.

## Deterministic Lint Boundary

`mb-lint` implements only the machine-checkable subset of these standards.

It may check:

- required fields and simple formats;
- supported enum values;
- path/id target existence for fields that are present;
- `protocol_lifecycle`, `decision_status`, `scenario_kind`, `evidence_kind` and `verdict` when present;
- `blocked_by_protocols` and protocol set `members` resolution.

It must not infer:

- that every protocol needs a feature, spec, ADR or scenario link;
- that every feature needs evidence before implementation;
- that every spec should link a feature;
- that architecture, product meaning or documentation completeness is good enough.

Those questions belong to `mb-audit`, `mb-sdlc-review`, plan/readiness review or architectural harmonization. If a rule cannot be proved from the file path, frontmatter value, documented enum and filesystem state, it is not an `mb-lint` rule.
