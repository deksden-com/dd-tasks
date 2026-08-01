---
file: '.memory-bank/mbb/mb-lint-guide.md'
description: 'Canonical guide for deterministic Memory Bank linting with mb-lint.'
purpose: 'Read before running, configuring, or interpreting mb-lint so formal Memory Bank checks are consistent across flows.'
version: '0.5.0'
date: '2026-07-04'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
related_files:
  - .memory-bank/mbb/glossary.md
  - .memory-bank/mbb/memory-bank-structure.md
  - .memory-bank/mbb/frontmatter-standards.md
  - .memory-bank/mbb/cross-references.md
  - .memory-bank/mbb/named-deferrals-guide.md
  - .memory-bank/mbb/code-contracts-guide.md
  - .memory-bank/dd-flow/compatibility.json
tags: [mbb, mb-lint, lint, verification, memory-bank]
history:
  - version: '0.1.0'
    date: '2026-05-24'
    changes: 'Added canonical mb-lint usage, configuration, finding classification, and rule-candidate guidance.'
  - version: '0.2.0'
    date: '2026-06-30'
    changes: 'Aligned lint candidate guidance with accepted doc-link tags including @docs, @protocol, and @evidence.'
  - version: '0.3.0'
    date: '2026-07-01'
    changes: 'Documented deterministic frontmatter contract checks, mb-lint rules listing, semantic lint boundary, and semantic_review_item classification.'
  - version: '0.4.0'
    date: '2026-07-01'
    changes: 'Added compatibility manifest linkage and recommended mb-lint package version handling.'
  - version: '0.5.0'
    date: '2026-07-04'
    changes: 'Documented Git-aware ignore handling: ignored untracked files are excluded from lint scope, while active links to them are errors.'
---

# mb-lint Guide

`mb-lint` is the deterministic linter for Memory Bank projects.

It checks formal properties that should not require model judgment: root files, structure, frontmatter, Markdown links, frontmatter links, named deferrals, code documentation tags, `.tasks` leakage, and other mechanical consistency rules.

`mb-lint` is not a semantic audit. It does not decide whether architecture is good, product meaning is complete, or a practice should enter the canon. Use `mb-audit`, review, or `mb-distill` for those questions.

## Canonical Command

Prefer the published package:

```bash
npx @deksden-com/mb-lint@latest --root . --format json
```

For human-readable output:

```bash
npx @deksden-com/mb-lint@latest --root .
```

To inspect the deterministic rule catalog exposed by the installed linter:

```bash
npx @deksden-com/mb-lint@latest rules
```

If the project defines a local command in README, `package.json`, `spec/operations/`, or another project-owned operations document, prefer the project command. If the package is unavailable but a local development checkout exists, a local fallback is acceptable, for example:

```bash
node ../mb-lint/dist/cli.js --root . --format json
```

Do not use the old package name `@deksden.com/mb-lint`; the published npm package is `@deksden-com/mb-lint`.

The recommended package version for a Memory Bank canon release is recorded in `.memory-bank/dd-flow/compatibility.json` under `mb_lint.recommended_version`. For Memory Bank `2.9.1`, the recommended linter is `@deksden-com/mb-lint@0.3.0`.

When a flow needs reproducible behavior, prefer the recommended version from the compatibility manifest over floating `latest`. `latest` is acceptable for ordinary interactive use only when the registry version matches the manifest or the project policy explicitly accepts newer lint behavior.

## When To Run

Run `mb-lint`:

- after `mb-init` creates or changes active Memory Bank documents;
- after `mb-upgrade` merges target work and before final acceptance;
- after `mb-fix` changes formal Memory Bank structure, links, frontmatter, indexes, or DEF records;
- during `mb-audit` when a deterministic check is useful alongside semantic review;
- before closing any protocol that claims Memory Bank formal correctness.

If `mb-lint` is unavailable in a flow where it is a required gate, do not call the Memory Bank formally verified. Create or update the relevant DEF with attempted commands and the next gate.

## Typical Project Config

Projects should keep `.mb-lint.json` at repository root when they copy `mbb/` into `.memory-bank/`. The config should ignore non-active truth, not real problems.

Typical starting point:

```json
{
  "ignorePaths": [
    "README.md",
    ".memory-bank/README.md",
    ".memory-bank/dd-flow/**",
    ".memory-bank/mbb/templates/**",
    ".memory-bank/archive/**",
    ".tasks/**",
    ".scenario-runs/**",
    "node_modules/**",
    "dist/**",
    "build/**",
    "coverage/**",
    ".next/**",
    ".turbo/**"
  ],
  "ignoreFindings": [
    {
      "ruleId": "links/markdown-target-exists",
      "file": ".memory-bank/mbb/templates/**",
      "reason": "Canonical MBB templates contain placeholder markdown links."
    },
    {
      "ruleId": "links/frontmatter-target-exists",
      "file": ".memory-bank/mbb/templates/**",
      "reason": "Canonical MBB templates contain placeholder frontmatter links."
    },
    {
      "ruleId": "def/required-fields",
      "file": ".memory-bank/mbb/named-deferrals-guide.md",
      "target": "DEF-UI-PROTECTED-BROWSER-PROOF",
      "reason": "Canonical guide contains an illustrative DEF example, not an active project deferral."
    }
  ]
}
```

Adapt this config to the project. Canonical templates may be ignored because they contain placeholders rather than active project truth. Never hide active `spec/`, `adr/`, `plans/`, `ui/`, `protocol/`, `scenarios/`, `guides/`, or `evidence/` findings just to get a green run.

## Git-Aware Ignore Policy

When a checked project is a Git repository, `mb-lint` should respect Git ignore rules by default:

```json
{
  "git": {
    "respectIgnore": true
  }
}
```

This setting may be omitted because `true` is the default. Set it to `false` only when a project policy deliberately wants lint to inspect ignored scratch/build files.

The rule is intentionally narrow:

- files that are both Git-ignored and untracked are excluded from the lint input set;
- files that are merely untracked are still linted, because new valid Memory Bank documents often exist before `git add`;
- active Markdown links, frontmatter relation fields, and supported code doc tags must not point to Git-ignored untracked files;
- such active references are reported as `links/target-ignored-untracked`, not as ordinary missing-target findings.

Treat `links/target-ignored-untracked` as an active traceability error. Either move the referenced file into committed Memory Bank truth, change the link to a durable committed artifact, or remove the active reference. Do not silence it unless the project policy explicitly permits active canonical documents to depend on out-of-repository local state.

## Deterministic Rule Scope

`mb-lint` may enforce only explicit, mechanically checkable contracts. The canonical frontmatter/link rule layer includes:

- `frontmatter/parseable` - YAML frontmatter must parse;
- `frontmatter/required-fields` - active Memory Bank markdown documents must carry the universal required fields;
- `frontmatter/file-path-matches` - `file` must point to the document itself;
- `frontmatter/status-valid` - `status` must use the documented status vocabulary;
- `frontmatter/date-format` - date-like fields must use ISO `YYYY-MM-DD`;
- `frontmatter/version-format` - `version` must use semver-like `MAJOR.MINOR.PATCH`;
- `frontmatter/no-absolute-local-paths` - frontmatter path fields must not contain local absolute paths;
- `links/frontmatter-target-exists` - frontmatter link/path fields must point to existing project or Memory Bank files;
- `links/target-ignored-untracked` - active Memory Bank and code-doc references must not point to Git-ignored untracked files;
- `frontmatter/type-aware-contracts` - type-specific contracts are checked only when `doc_type` or an unambiguous canonical path/id pattern identifies the document type.

The type-aware layer must remain conservative:

- protocol semantic relation fields such as feature/spec/ADR/scenario links are not universally mandatory;
- optional relation fields stay optional, but if present their targets must resolve;
- prompts and flow implementation documents under `.memory-bank/dd-flow/**` are not forced into the same frontmatter contract as active project knowledge documents;
- if a question needs judgment, project understanding, or architectural interpretation, it belongs to review, `mb-audit`, or a documented lint-candidate, not to the deterministic linter.

## Finding Classification

Classify findings before fixing:

- `active_error` - real issue in active Memory Bank truth;
- `config_gap` - `.mb-lint.json` is absent or incomplete;
- `template_noise` - canonical template placeholder that is not active project truth;
- `archive_noise` - archived or deprecated material linted as active truth;
- `build_output_noise` - generated output linted as source;
- `semantic_review_item` - issue is real or plausible but requires human/model judgment and must be handled by review or audit, not by a deterministic lint rule;
- `possible_linter_bug` - behavior contradicts the documented rule or parser expectations;
- `needs_user_decision` - formally detected issue cannot be fixed without choosing project policy.

Only `template_noise`, `archive_noise`, and `build_output_noise` are normal candidates for ignore config. `active_error` should be fixed, `semantic_review_item` should be routed to the relevant review/audit flow, and `possible_linter_bug` should be reported with a minimal reproduction.

## Fixing Rules

When fixing `mb-lint` findings:

- fix active Memory Bank errors directly when the correction is mechanical and source-backed;
- do not invent missing product, architecture, or operations truth just to satisfy a rule;
- create DEF when a formal issue exposes a real missing decision;
- update indexes after adding or moving documents;
- rerun `mb-lint` after fixes;
- record the command, version, summary, and unresolved findings in the protocol or final report.

For `mb-upgrade`, the final `mb-lint` run must be performed by the orchestrator after any lint-fix worker completes. Do not accept a worker's report as the final gate.

## Rule Candidates

When an agent finds a repeated issue that can be checked without model judgment, record a lint candidate:

```text
lint-candidate:
  rule_id:
  observation:
  why_deterministic:
  positive_example:
  negative_example:
  source:
```

Good candidates:

- `@docs`, `@spec`, `@adr`, `@feature`, `@protocol`, `@scenario`, and `@evidence` references must point to existing files;
- `DEF-*` entries must contain owner/reason/next gate fields;
- indexes must not list missing child files.

Bad candidates:

- "text is weak";
- "architecture feels wrong";
- "practice is not interesting enough";
- "scenario is probably incomplete".

Those belong to review, `mb-audit`, or `mb-distill`, not deterministic lint.
