---
file: '.memory-bank/mbb/codex-hooks-guide.md'
description: 'Canonical guide for Codex CLI hooks used by dd-flow automation.'
purpose: 'Read when installing, implementing, debugging, or changing Codex hooks for dd-flow sessions, merge queues, and protocol state tracking.'
version: '0.1.0'
date: '2026-05-25'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
related_files:
  - .memory-bank/mbb/operations-release-guide.md
  - .memory-bank/mbb/coding-standards-guide.md
tags: [mbb, codex, hooks, cli, automation, merge-queue]
history:
  - version: '0.1.0'
    date: '2026-05-25'
    changes: 'Added Codex hook sources, output schemas, and dd-flow no-op hook policy.'
---

# Codex Hooks

## Sources

Primary source:

- OpenAI Developers, Codex Hooks: <https://developers.openai.com/codex/hooks>

Secondary verification source:

- The installed Codex CLI contains release-local JSON schemas for hook input and output. When behavior is unclear, inspect the local binary schemas for the exact installed version before changing hook output.

Example local inspection:

```bash
strings "$(find /usr/local/lib/node_modules/@openai/codex -path '*vendor/*/bin/codex' -type f | head -1)" \
  | sed -n '/pre-tool-use.command.output/,/pre-compact.command.input/p'
```

The website may mention linked `main` branch schemas that include fields not available in the current release. Treat the installed Codex CLI behavior and official page release notes as the compatibility gate.

## Discovery And Runtime Model

Codex discovers hooks next to active config layers:

- `hooks.json`;
- inline `[hooks]` tables in `config.toml`;
- plugin-bundled hook files.

Project-local hooks require the project `.codex/` layer to be trusted. Managed hooks from system, MDM, cloud, or requirements sources are trusted by policy.

Runtime rules that matter for `dd-flow`:

- matching hooks from multiple sources all run;
- multiple matching command hooks for the same event run concurrently;
- one matching hook cannot prevent another matching hook from starting;
- command hooks run with the session `cwd`;
- repo-local hook commands should resolve paths from Git root, not from a relative `.codex/...` assumption;
- `transcript_path` is convenient, but not a stable API contract.

## Supported Output Fields

`SessionStart`, `PreCompact`, `PostCompact`, `UserPromptSubmit`, `SubagentStop`, and `Stop` support common output fields:

```json
{
  "continue": true,
  "stopReason": "optional",
  "systemMessage": "optional",
  "suppressOutput": false
}
```

But these fields are not universally supported for every event.

The safe baseline:

- exit code `0` with no stdout means success and Codex continues;
- stdout `{}` is a valid no-op JSON response for observing hooks;
- do not emit fields just because they appear in another event schema.

## Event-Specific Rules

### `SessionStart`

`SessionStart` may add context:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Load project conventions before editing."
  }
}
```

For `dd-flow` session tracking, prefer no-op output `{}` unless the hook intentionally injects context.

### `PreToolUse`

`PreToolUse` can observe or guard Bash, `apply_patch` edits, and MCP tool calls, but it is not a complete enforcement boundary.

Compatibility rules:

- `systemMessage` is supported;
- `continue`, `stopReason`, and `suppressOutput` are not supported;
- returning unsupported fields makes Codex mark the hook run as failed while continuing the tool call.

For an observing `PreToolUse` hook, return:

```json
{}
```

Do not return:

```json
{
  "continue": true,
  "suppressOutput": true
}
```

### `PostToolUse`

`PostToolUse` may observe tool results and can use limited control fields.

Compatibility rules:

- `systemMessage`, `continue: false`, and `stopReason` are supported;
- `suppressOutput` is not supported for this event;
- for observation-only hooks, return `{}`.

For an observing `PostToolUse` hook, return:

```json
{}
```

### `Stop`

`Stop` expects JSON on stdout when it exits `0`; plain text output is invalid.

To continue the current turn as a new prompt:

```json
{
  "decision": "block",
  "reason": "Continue dd-flow protocol PRT-...: run the next pipeline step."
}
```

For `Stop`, `decision: "block"` does not reject the turn. It asks Codex to continue and uses `reason` as the continuation prompt.

If no continuation is needed, return:

```json
{}
```

## dd-flow Hook Policy

`dd-flow` hooks have two roles:

- observing hooks record explicit session/tool/protocol state in SQLite;
- `Stop` hooks may continue an active protocol when the protocol state says work is still running.
- `Stop` hooks may also continue an active merge-session even when no protocol is currently claimed.

Observing hooks must be conservative:

- `SessionStart` -> record session binding, return `{}`;
- `PreToolUse` -> record command intent, return `{}`;
- `PostToolUse` -> record result and bind protocol if the command registered one, return `{}`;
- never return `suppressOutput` from `PreToolUse` or `PostToolUse`;
- never return `continue` or `stopReason` from `PreToolUse`;
- only return `decision: "block"` from `Stop` when a real continuation is required.

For ordinary protocol sessions, `Stop` continuation requires an active protocol binding. For merge queue sessions, this is not required: while the merge queue is empty, `current_protocol_id` can be `null`, but the active merge-session is still the state object that must continue. In that case `Stop` should return a continuation prompt that tells the agent to run `.memory-bank/dd-flow/merge.md` and poll:

```bash
dd-flow merge-queue next --project-root "<project-root>" --session-id "<merge-session-id>" --json
dd-flow merge-queue status --project-root "<project-root>" --json
```

If a merge-session has a claimed `current_protocol_id`, the continuation prompt should direct the agent to finish that claimed job through `complete` or `fail`.

Hook output is part of a public tool contract. Changes must have tests that call `dd-flow codex hook handle` for at least `SessionStart`, `PreToolUse`, `PostToolUse`, and `Stop`.

Minimum checks:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Manual smoke:

```bash
printf '%s' '{"hook_event_name":"PreToolUse","session_id":"s","turn_id":"t","cwd":"<project-root>","model":"gpt-5","permission_mode":"bypassPermissions","tool_name":"Bash","tool_use_id":"tool-1","tool_input":{"command":"echo ok"},"transcript_path":null}' \
  | dd-flow codex hook handle --event PreToolUse --json
```

The managed hook command must not hard-code `--project-root`. Codex provides
the session `cwd` in stdin; the handler resolves the registered project from
that path. `--project-root` remains an optional manual override for a manual
smoke or recovery command. After changing the installed `dd-flow` CLI, reinstall
the hook in every active `CODEX_HOME`, run `dd-flow codex hooks status`, and
start a new Codex session; only installer/status commands receive
`--project-root`.

Expected output:

```json
{}
```
