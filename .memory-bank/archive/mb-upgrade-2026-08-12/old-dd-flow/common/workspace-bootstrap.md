---
file: '.memory-bank/dd-flow/common/workspace-bootstrap.md'
description: 'Canonical workspace bootstrap, safe secrets evidence and receipt reuse contract for dd-flow consumers.'
purpose: 'Read whenever a flow selects a checkout that may be mutated or used for project code, tests, build, packaging or other project tooling.'
version: '0.1.0'
date: '2026-07-10'
status: 'ACTIVE'
c4_level: 'documentation'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - .memory-bank/project-policy.md
  - git-ops.md
  - flow-flags.md
  - worker-session.md
  - ../plan.md
  - ../mb-sdlc/plan/operations.md
tags: [dd-flow, workspace, bootstrap, secrets, receipt, worktree]
history:
  - version: '0.1.0'
    date: '2026-07-10'
    changes: 'Created the canonical bootstrap receipt, status, reuse, invalidation and blocker contract for PRT-080.'
---

# Workspace Bootstrap Contract

This file is the sole shared flow contract for resolving and executing project workspace bootstrap, recording safe evidence, reusing a prior result and stopping on a bootstrap blocker. Consumer prompts link here; they must not restate their own status taxonomy, receipt schema or invalidation algorithm.

Git checkout creation and workspace bootstrap are separate gates. A checkout exists when Git materializes tracked files. It is ready for project work only after this contract produces a passing result for that concrete workspace.

## When The Gate Applies

Apply this contract after a concrete checkout is created or selected and before a flow mutates project code or runs project tests, build, packaging, generation, migration tooling or another project-owned command.

The flow about to perform that work owns the current-stage receipt. Later consumers may use an earlier receipt only through the reuse procedure below.

Documentation-only or read-only work that does not invoke project tooling may record `bootstrap_not_required` with a specific reason. If it later invokes project tooling, the exemption ends and the flow must execute this contract before that command.

Only these results pass the bootstrap gate:

- `bootstrap_not_required`;
- `bootstrap_reused`;
- `bootstrap_completed`.

These results stop the current gate:

- `bootstrap_blocked`;
- `bootstrap_failed`.

## Resolve The Project-Owned Entrypoint

Resolve bootstrap in this order:

1. Read `.memory-bank/project-policy.md` and follow its workspace bootstrap and secrets links.
2. Read the linked project-owned policy and runbook under `.memory-bank/spec/operations/` or the project's documented equivalent.
3. Select the one canonical entrypoint named by project policy. It may be an executable command or a deterministic ordered runbook.
4. Use the authoritative dependency install command, runtime/toolchain rules, generation steps, readiness check and secrets/config allowlist from those sources.

Project policy wins over package-manager inference. Discovery from lockfiles, manifests, scripts, CI, containers or examples may identify a candidate, but conflicting commands, package managers or unsafe ambiguity must not be guessed through. If project tooling is required now and no safe canonical entrypoint can be resolved, record `bootstrap_blocked`.

The entrypoint may install dependencies, use safe package-manager caches, generate local artifacts, verify toolchains and prepare allowlisted local configuration. It must not silently perform destructive database migrations, production operations or external mutations that require a separate gate.

## Receipt Location And Ownership

Write or link one Markdown receipt for each gate that may execute or revalidate bootstrap:

```text
<run-home>/<stage>/workspace-bootstrap-<gate>-receipt.md
```

Use a stable gate name such as `implementation`, `readiness`, `integration`, `delivery` or `target-<name>`. When a stage has exactly one bootstrap gate, the compact name `workspace-bootstrap-receipt.md` is allowed. Separate gates in one stage must use separate files so a reuse receipt can link its source without overwriting it or linking to itself.

Use the run-home and stage that own the pending project-tooling gate. Do not store readiness only in chat, hidden runtime state or a feature worktree that a later integration flow cannot inspect.

A reused result writes the current gate receipt with `bootstrap_reused` and links a distinct validated source receipt. An invalidated result writes a new current-gate receipt that links the previous receipt and explains why it was invalidated. Never overwrite the source receipt or create a self-reference.

## Authoritative Receipt Fields

The receipt is compact Markdown with a structured block containing all fields below. Use `not_applicable` only where the selected status makes a field genuinely inapplicable; do not omit the reason.

```yaml
workspace_bootstrap_receipt:
  status: bootstrap_not_required | bootstrap_reused | bootstrap_completed | bootstrap_blocked | bootstrap_failed
  status_reason:
  policy_source:
  canonical_entrypoint:
  owning_runbook:
  receipt_path:

  workspace:
    path:
    repository_identity:
    branch:
    commit:

  readiness:
    dependencies:
    toolchain:
    generated_artifacts:
    environment_secrets:
      status:
      items:
        - class:
          destinations:
          access_state:
          permissions:
          cleanup_required:

  public_inputs:
    - path:
      hash_algorithm:
      content_hash:

  commands:
    - sanitized_command:
      exit_status:

  reuse:
    source_receipt:
    reusable:
    invalidation_reason:

  blocker:
    summary:
    next_action:
    def_id:
```

Field rules:

- `workspace.path` is the resolved real path of the concrete checkout. `repository_identity` identifies the repository/common Git directory without embedding credentials.
- `workspace.commit` is the comparison anchor for later consumers; it is not permission to reuse across another workspace.
- `status_reason` explains the selected status, including why bootstrap is not required or why a prior receipt was not reusable.
- `readiness` records dependency, toolchain and generated-artifact state plus overall environment/secrets readiness, secret/config classes and allowed destination names. It never records values.
- `public_inputs` records paths and content hashes for every relevant public input used by the project policy: dependency lockfiles and manifests, runtime/toolchain files, bootstrap policy/runbook/script, generated-code declarations and required env/config declarations. Record the hash algorithm. Do not persist secret file contents, secret-derived hashes or credential-bearing metadata.
- `commands` records sanitized commands and exit status. Redact secret-bearing arguments and do not paste raw credential-bearing output.
- `reuse` states whether the current receipt can be considered again, links the source receipt for a reused or invalidated result, and records the invalidation reason.
- `blocker` records a redacted summary, exact next action and optional durable `DEF-*` link. It never contains a secret value.

For `bootstrap_not_required`, record the concrete reason in `status_reason` and use `not_applicable` for execution-only fields. For `bootstrap_reused`, the current receipt must identify `reuse.source_receipt`. For `bootstrap_blocked` and `bootstrap_failed`, `blocker.summary` and `blocker.next_action` are required.

## Deterministic Reuse

Reuse is local to the same concrete workspace path. Before writing `bootstrap_reused`, the consumer must:

1. Resolve the current workspace real path, repository identity, branch and commit.
2. Confirm that the candidate receipt belongs to the same workspace path and repository/checkout identity. A feature-worktree receipt never proves an integration checkout ready.
3. Re-resolve project policy, canonical entrypoint and owning runbook.
4. Rebuild the complete relevant public-input path set and recompute each content hash.
5. Compare the current input path set and hashes with the candidate receipt.
6. If the commit changed, compare from the receipt commit safely enough to determine whether integration or local changes introduced a relevant input. A non-comparable, rewritten or ambiguous history is not reusable.
7. Verify the runbook's lightweight readiness condition for dependencies, toolchain and generated artifacts.
8. Verify required allowlisted secret/config destinations still exist with required permissions and access state, without reading values into evidence or hashing their contents.

Write `bootstrap_reused` only when every check passes. Otherwise execute the canonical entrypoint and record a new result.

## Invalidation And Re-Execution

Rerun bootstrap when any of these is true:

- the workspace real path differs;
- repository or checkout identity differs;
- the policy source, canonical entrypoint or owning runbook differs;
- the relevant public-input path set differs;
- any relevant public-input content hash differs;
- dependency lockfiles or manifests changed;
- runtime/toolchain files changed;
- bootstrap policy, runbook or script changed;
- generated-code configuration changed;
- required env/config declarations changed;
- required local configuration is missing, has unsafe permissions or is otherwise no longer ready;
- integration introduced a relevant change;
- the receipt or Git history cannot be compared safely;
- the project readiness check no longer passes.

Do not build a general cache engine. The receipt, public hashes, checkout comparison and project readiness check are the complete reuse mechanism.

## Execution And Status Selection

Run the resolved canonical entrypoint idempotently and sanitize evidence while it executes.

- Use `bootstrap_completed` when the entrypoint and readiness check complete successfully.
- Use `bootstrap_blocked` when execution cannot start or continue because required access, allowlisted configuration, project policy knowledge, source ownership or an external prerequisite is unavailable. Stop before project tooling.
- Use `bootstrap_failed` only when a bootstrap command ran and failed. Record its sanitized command, exit status, redacted diagnostic summary and next action. Stop before project tooling.
- Never downgrade a blocked or failed result to `bootstrap_not_required` merely to pass the gate.

Secrets and local configuration are prepared only from the project allowlist. Record class, destination name, access state, permissions and cleanup requirement. Never copy arbitrary `.env*` files, invent values, expose raw contents or preserve secret-derived hashes. Cleanup remains owned by the existing merge, fix or experiment cleanup flow and removes only policy-marked worktree-local material.

## Blocker And DEF Contract

An execution-time missing secret, access grant, local config item or dependency prerequisite is a current `bootstrap_blocked` result. It blocks the current code, test, merge or delivery gate and must include the next action. It does not automatically create a durable deferral.

Create or update a scoped `DEF-*` only when unresolved project policy knowledge, authoritative source/owner or external access will remain relevant beyond the current stop. The DEF must name:

- owner;
- blocked gate;
- next gate;
- verification required to close;
- whether user or external action is required.

Put the DEF id in `blocker.def_id`. If the missing fact is only an immediate execution prerequisite with a known owner and next action, keep it as the stage blocker and do not create DEF ceremony.

## Handoff To Consumers

`task_profile.workspace.bootstrap` and worker task packets carry a compact pointer to this contract, the requirement, producer, current gate/action, planned or existing receipt path, current status and blocker/DEF handoff. The receipt remains authoritative for detailed fields and evidence.

Planning must resolve enough policy to identify the canonical entrypoint, owning runbook and planned producer/receipt path. If a requirement for the next code gate is unresolved, planning must not report a ready code handoff.

Merge and delivery consumers revalidate against their actual checkout. They never treat dependency directories or receipts from a different workspace path as readiness evidence.
