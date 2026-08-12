---
file: '.memory-bank/dd-flow/schemas/examples/invalid/README.md'
description: 'Invalid mb-upgrade-review-data fixtures used by CLI and schema tests.'
purpose: 'Read before updating invalid schema fixtures.'
version: '0.1.0'
date: '2026-06-04'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/index.md'
tags: [dd-flow, schemas, fixtures, invalid]
history:
  - version: '0.1.0'
    date: '2026-06-04'
    changes: 'Created invalid fixture notes for mb-upgrade-review-data.'
---

# Invalid Fixtures

These files are intentionally invalid. Tests should use them directly for broad failure checks and may also mutate `../mb-upgrade-review-data.valid.json` for targeted semantic cases:

- `missing-required-field.json`: missing most required top-level fields.
- `major-report-only.json`: major finding uses `report_only`.
- `explicit-not-tracked-without-reason.json`: significant finding uses `explicitly_not_tracked` without a reason and `reason_code`.
