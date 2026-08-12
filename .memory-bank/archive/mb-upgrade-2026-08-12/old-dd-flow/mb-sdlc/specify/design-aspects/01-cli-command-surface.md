---
file: '.memory-bank/dd-flow/mb-sdlc/specify/design-aspects/01-cli-command-surface.md'
description: 'Specify-time design aspect for CLI command surfaces.'
purpose: 'Use when a task creates or changes CLI commands, flags, output formats or automation contracts.'
version: '0.1.0'
date: '2026-07-04'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/mb-sdlc/specify/design-aspects/index.md'
tags: [dd-flow, mb-sdlc, specify, design-aspect, cli]
---

# 01 CLI Command Surface

## Applicability

Use this aspect when the task creates or changes:

- CLI package, command or subcommand;
- flags, positional args or environment-variable behavior;
- command output intended for humans or agents;
- command help, version, diagnostics or exit behavior.

## Canonical Defaults

- Root `--help` and command-level `--help` exist and explain purpose, usage, options, examples and related commands.
- `--version` returns the version from source/package metadata, not a hand-written duplicate.
- `--json` is available for automation and AI agents where machine use is expected.
- Machine-readable output uses stable field names and avoids progress noise unless explicitly structured.
- Errors include stable exit codes, concise human messages and actionable machine-readable diagnostics.
- Mutating commands document dry-run/check/force behavior where relevant.
- Help text names deprecated aliases and points to the preferred command format.

## Specify Questions

- Who will use the CLI: human operators, scripts, AI agents or all of them?
- Which commands are public/stable and which are internal or experimental?
- Does the command need `--json`, and what downstream automation consumes it?
- Which operations can mutate state and therefore need confirmation, dry-run, force or lock behavior?
- What should happen when context is missing, incompatible or unsafe?

## Decisions To Record

- Public command names and aliases.
- Required flags and output formats.
- `--help`, `--version` and `--json` policy.
- Exit/error contract and compatibility expectations.
- Mutating command safety gates and force/dry-run behavior.
- Explicit user overrides of canonical defaults.

## Verification Seeds

- `help_contract`: root and command help render expected usage and related commands.
- `version_contract`: version is read from package/source metadata.
- `json_contract`: `--json` output is parseable and stable for automation.
- `error_contract`: invalid args/context return expected exit and machine-readable diagnostics.
- `mutation_safety`: mutating commands honor dry-run/check/force/lock rules where applicable.

## Linked Plan Aspects

- `api_contract_design_review`
- `contract_propagation_design`
- `testing_system_design_review`
- `verification_evidence_review`
- `observability_runtime_review`

## Anti-Patterns

- Help exists only at the root while subcommands are undocumented.
- `--version` is manually duplicated and drifts from package metadata.
- Human progress logs make `--json` invalid.
- Exit codes are incidental and not documented or tested.
- CLI behavior is described only in a prompt, not in command help, docs or tests.
