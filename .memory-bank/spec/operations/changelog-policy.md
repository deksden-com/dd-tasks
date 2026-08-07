---
file: '.memory-bank/spec/operations/changelog-policy.md'
description: 'Project-owned version and changelog decision policy for dd-tasks.'
purpose: 'Separates product package versioning from Memory Bank canon markers and keeps release-version decisions explicit.'
version: '0.1.0'
date: '2026-08-07'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/operations/index.md'
tags: [dd-tasks, operations, changelog, versioning, release]
---

# Changelog and version policy

`package.json` is the current product version source (`0.1.0`). The repository
does not currently contain a project `CHANGELOG.md`; a product release must
therefore make an explicit user-approved version decision and record release
notes in the selected delivery evidence.

The Memory Bank canon marker is separate: `.memory-bank/index.md` and
`.memory-bank/dd-flow/compatibility.json` track the canonical Memory Bank
version and adjacent migration window. Updating the Memory Bank canon does not
implicitly bump `package.json`.

No product release or package-version mutation is part of this Memory Bank
upgrade.
