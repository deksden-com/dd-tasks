---
file: '.memory-bank/dd-flow/release.md'
description: 'Top-level flow prompt for release/version and change-set fixation.'
purpose: 'Use when the user asks to release a project/canon/package version or fix a release set.'
version: '0.5.0'
date: '2026-08-09'
status: 'DRAFT'
c4_level: 'flow-entrypoint'
parent: '.memory-bank/dd-flow/index.md'
related_files:
  - .memory-bank/dd-flow/common/delivery-flows.md
  - .memory-bank/dd-flow/common/changelog.md
  - .memory-bank/dd-flow/common/sdlc-contours.md
  - .memory-bank/dd-flow/common/git-ops.md
  - .memory-bank/dd-flow/common/operational-access.md
  - .memory-bank/dd-flow/compatibility.json
  - .memory-bank/dd-flow/schemas/compatibility.schema.json
  - .memory-bank/dd-flow/schemas/release-stage-report.schema.json
  - .memory-bank/dd-flow/stage-reports/release-stage-report-template.html
tags: [dd-flow, release, version, changelog, release-set]
history:
  - version: '0.5.0'
    date: '2026-08-09'
    changes: 'Added package and linked-CLI reconciliation against registry artifact commits so stale Changesets cannot create a duplicate release and a Memory Bank canon cannot recommend unpublished required behavior.'
  - version: '0.1.0'
    date: '2026-07-07'
    changes: 'Added first-class release flow prompt.'
  - version: '0.2.0'
    date: '2026-07-07'
    changes: 'Added release stage-report schema/template requirements.'
  - version: '0.3.0'
    date: '2026-07-10'
    changes: 'Added fail-closed operational-access preflight for tags, release objects and other protected release mutations.'
  - version: '0.4.0'
    date: '2026-08-04'
    changes: 'Made compatibility manifest update and schema/consistency validation mandatory for every Memory Bank canon release.'
---

# Release Flow

Use this prompt when the user asks to release a project, Memory Bank canon, package, app, image or documented change set.

Read `.memory-bank/dd-flow/common/delivery-flows.md` first. If the release creates or verifies Git commits, tags or push evidence, apply `.memory-bank/dd-flow/common/git-ops.md`, including unified Git operation context and commit trace tags.

## Scope

Release answers:

```text
Which version and which change set are officially fixed?
```

Release does not deploy a runtime stage unless project policy explicitly says release and delivery are inseparable. If they are inseparable, route to `publish.md`.

## Preflight

1. Resolve project root, Memory Bank root and current `RUN-*`.
2. Read project policy, operations release policy, changelog policy, runbooks and active DEFs.
3. Identify release source:
   - explicit user-selected protocols/commits/tags;
   - completed protocol set;
   - all merged changes since last release;
   - package/app/image/static artifact selected by policy.
4. For a package with generated release-note inputs, reconcile the registry
   baseline before choosing a version:
   - read the latest published version and the artifact source/build commit;
   - read the current package version, peeled Git tag and pending release-note
     inputs such as Changesets;
   - build the candidate release set from commits after the published artifact
     commit, not from pending fragments alone;
   - classify a fragment as stale release-accounting debt when its
     implementation commit is already contained in the published artifact;
   - classify a newer package version or Git tag absent from the registry as
     the current unpublished release, which must be completed or repaired
     before another version is created.
5. For every Memory Bank canon release, reconcile each CLI/package named by
   project policy or `.memory-bank/dd-flow/compatibility.json`, even when the
   canon diff does not change CLI code:
   - compare checkout HEAD/package version/peeled tag with registry `latest`
     and the published artifact build/source commit;
   - inspect pending generated release-note inputs and classify them against
     the published artifact commit;
   - if canon-required behavior exists only in an unpublished checkout/tag,
     either include that exact package publication in the coupled release set
     or block the canon release;
   - never set a compatibility recommended version to a package version that
     registry readback cannot resolve.
6. Determine whether the agent may execute the release or should prepare a release handoff.
7. Check whether version decision requires user confirmation. If yes, stop and ask before changing version files/tags.
8. For any protected tag, release-object, registry or provider mutation, resolve one exact access binding and complete fresh safe readback plus scoped approval under `common/operational-access.md`.

## Release Set

Build a release set with:

- included protocols, features, issues, commits or artifacts;
- excluded ready changes and reason;
- published registry baseline, artifact commit and stale/current classification
  of pending release-note inputs when package tooling is used;
- linked CLI/package checkout, tag, registry, artifact-commit and pending
  release-note reconciliation for a Memory Bank canon release;
- source branch/tag/commit;
- version decision and version source of truth;
- changelog or release-note target;
- compatibility manifest target and schema/consistency checks;
- artifacts to build or select;
- verification gates required before claiming release.

## Execution

Execute only the steps allowed by project policy:

- create `.memory-bank/release-impact/<target-version>.json` from the adjacent released version using `dd-flow/release-impact@1`;
- validate the artifact with `dd-flow schema validate --schema release-impact --file <file> --project-root <canon-root> --json`;
- compare its declared domains and migration flags with the canonical diff since `from_version`; do not release with unexplained changed canonical files;
- update `.memory-bank/dd-flow/compatibility.json` for every canon release: set `memory_bank_version` and `migrations.to_this` to the target version, and `migrations.from_previous` to the adjacent `release-impact.from_version`;
- validate the manifest with `dd-flow schema validate --schema compatibility --file .memory-bank/dd-flow/compatibility.json --project-root <canon-root> --json`;
- verify that the manifest version and migration window agree with `VERSION`, the canonical version marker and `.memory-bank/release-impact/<target-version>.json`; preserve CLI/engine/contract values unless the release explicitly changes compatibility requirements;

- update changelog source or release notes;
- backfill and retire stale generated release-note fragments whose changes are
  already present in the published artifact; never use them to bump the next
  version;
- update version map targets;
- build or select release artifacts;
- create tag/release object when policy requires;
- run release checks;
- perform readback of tag/release/package metadata when available.

For package publication, completion requires the registry version, published
artifact build/source commit and peeled Git tag to agree. A source-only tag is
`release_not_published`, not a completed package release.

The release-impact artifact is the authoritative input for future `mb-upgrade` scope selection. It is not generated blindly from Git: release authors declare the semantic impact and the release check proves that the declaration covers the changed surface. Missing, invalid or non-adjacent impact evidence blocks a lightweight downstream upgrade and must be reported as requiring `full_migration`.

Do not silently choose patch/minor/major. Use policy, tooling output or explicit user decision.

## Output

Write release evidence under the current `RUN-*`:

- release set;
- version before/after;
- changelog/release-note changes;
- artifact references;
- checks and readback;
- DEF/BLOCK items;
- next delivery action: none, deploy, publish, ask user or handoff.

Write the release semantics to `@stage/stage-input.json`. `dd-flow stage finish`
validates that input and generates the generic `stage-report.json`,
`stage-report.md`, `stage-report.html` and protocol summary. Release-specific
fields remain semantic data; the CLI owns paths, timestamps, Git facts and
rendering. A completed release input must include release set, version decision
evidence, artifacts, release readback and authorized or policy-backed
not-required `operational_access` evidence.
