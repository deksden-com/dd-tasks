---
file: '.memory-bank/spec/operations/secrets-policy.md'
description: 'Project-owned policy for secret and ignored local configuration handling without storing values.'
purpose: 'Define which configuration classes may enter a workspace, where they come from, how they are prepared, who may access them, and how evidence and cleanup remain value-free.'
version: '0.1.0'
date: 'YYYY-MM-DD'
status: 'DRAFT'
c4_level: 'documentation'
parent: '.memory-bank/spec/operations/index.md'
canonical_template: '.memory-bank/mbb/templates/secrets-policy.md'
applicability_status: 'unknown'
related_specs: []
related_runbooks: []
related_protocols: []
tags: [operations, secrets, local-configuration, access, redaction, cleanup]
---

# Secrets And Local Configuration Policy

> Store policy and identifiers only. Never place secret values, raw `.env*` contents, private keys, tokens, credentials, or value-derived hashes in Memory Bank, Git, receipts, logs, screenshots, or examples.

## Applicability And Scope

- Applicability status: `applicable | not_applicable | unknown`
- Applies to workspaces/stages:
- Applies to flows/operations:
- Does not apply to:
- Not-applicable reason:
- Policy owner:
- Access owner/contact:

## Secret And Configuration Classes

Use stable class names and public identifiers only. Do not record values.

| Class/id | Consumers | Required when | Authoritative source/provider | Allowed method | Allowlisted destination and workspace scope | Access/approval gate | Unavailable behavior |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `<class-or-public-name>` | ... | ... | ... | `fetch | generate | copy | symlink` | ... | ... | `block | skip_with_not_applicable_reason | approved_degraded_mode` |

Rules:

- `fetch`: retrieve through the named provider/tool using authorized access.
- `generate`: create a local non-authoritative value or file through the documented command.
- `copy`: copy only the named allowlisted source to the named destination; never copy arbitrary `.env*` files.
- `symlink`: link only an allowlisted source whose ownership and cleanup behavior are explicit.
- A class may use more than one method only when precedence and fallback are documented.

## Source And Trust Policy

- Authoritative providers/stores:
- Approved operator-local sources:
- Prohibited sources:
- Source freshness/rotation check:
- Offline/degraded source behavior:
- Generated local-only material ownership:

## Access And Permissions

- Required user/team/provider roles:
- Human approval requirements:
- Agent permissions and prohibited actions:
- File owner/group requirements:
- File/directory modes or platform equivalent:
- Symlink restrictions:
- Permission verification command/readback:

Agents must not ask users to paste values into chat, reports, protocols, or committed files. When access cannot be obtained through the approved source, stop and report the class/id, access owner, failed gate, and next action only.

## Redaction And Evidence

- Allowed evidence fields: class/id, source/provider name, method, destination filename/path, workspace scope, readiness status, permission status, cleanup status, blocker, and next action.
- Forbidden evidence: values, raw files, credential-bearing command output, private URLs with embedded credentials, screenshots containing values, or hashes derived from secret values.
- Command redaction requirements:
- Log/screenshot review requirements:
- Receipt/report location:
- Incident response for accidental exposure:

Readiness statuses should distinguish `ready`, `not_required`, `blocked`, and `failed` by class without revealing values.

## Workspace Preparation

- Owning bootstrap runbook/entrypoint:
- Preparation order:
- Destination creation rules:
- Existing-file overwrite policy:
- Validation without value disclosure:
- Cross-worktree reuse policy:

Secret/configuration material is workspace-scoped unless this policy explicitly names a safe shared source. A ready feature worktree does not prove another checkout is ready.

## Cleanup, Revocation And Rotation

- Cleanup trigger: worktree removal, operation completion, failure, expiry, or other:
- Files/symlinks/sessions to remove:
- Material that must be retained and why:
- Token/session revocation rule:
- Rotation trigger and owner:
- Cleanup verification without values:
- Failure/escalation behavior:

## Unavailable And Failure Behavior

For each required class, choose one source-backed outcome:

- `block`: stop bootstrap or the affected operation before gated tooling runs;
- `skip_with_not_applicable_reason`: only when the class is genuinely irrelevant to the selected flow/stage;
- `approved_degraded_mode`: only with named approval, bounded behavior, evidence, and a next gate.

Missing current access is an operational blocker, not a durable DEF. Create a scoped DEF only when the project policy itself is unknown and that unknown affects a current or future gate. Never invent a value, provider, permission, fallback, or access path to close a gap.

## Audit And Review

- Review cadence:
- Last reviewed:
- Rotation/access review evidence:
- Stale class removal rule:
- Related DEF/blockers:
- Related runbooks and scenarios:
