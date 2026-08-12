---
file: 'memory-bank/scenarios/SCN-XXX-<slug>.md'
description: '<Executable verification contract for a platform capability, lifecycle block, or golden path.>'
purpose: '<Read to reproduce the scenario, understand expected evidence, and interpret pass/fail verdicts.>'
version: '0.3.0'
date: 'YYYY-MM-DD'
status: 'DRAFT'
c4_level: 'documentation'
scenario_id: 'SCN-XXX'
scenario_kind: 'capability'
execution_status: 'planned'
parent: 'memory-bank/scenarios/index.md'
related_files: []
related_features: []
related_specs: []
related_adrs: []
related_protocols: []
evidence_files: []
tags: [scenario, verification, evidence]
history:
  - version: '0.2.0'
    date: 'YYYY-MM-DD'
    changes: 'Added execution status, evidence contour, proof id, and non-authority note.'
  - version: '0.3.0'
    date: 'YYYY-MM-DD'
    changes: 'Added source provenance and optional parity matrix prompts.'
---

# SCN-XXX: <Scenario Name>

## Goal

<What capability or lifecycle block this proves.>

## Preconditions

- <Environment, fixture, account, data, config>

## Fixtures

- <Fixture/project/profile>

## Source Provenance

- Source anchors:
- Provenance status: `<source_only/current/rewrite>`
- What can be reused:
- What cannot be imported as current proof:

## Phases

1. <Action phase>
2. <Verification phase>

## Parity Matrix

> Use only for API/SDK/CLI parity scenarios. Remove if not applicable.

- logical action:
- API operation id:
- client SDK method:
- CLI command:
- positive expected outcome:
- negative/access/validation/conflict expected outcome:
- request/correlation id assertion:
- evidence artifact:

## Expected Evidence

- <Report/log/screenshot/run id/artifact>
- proof id:
- latest artifact path:

## Evidence Contours

- local:
- ci:
- beta/staging:
- live provider:
- production:

## Pass Criteria

- <Observable condition>

## Supported Environments

- <local/CI/staging/etc>

## Verification Matrix Links

- <Feature/capability>: <primary/secondary; local/staging/external>

## Evidence Authority

- This evidence proves:
- This evidence does not prove:
- Owning spec/protocol/matrix that accepts the evidence:

## Follow-up Policy

- On failure:
- On partial result:
