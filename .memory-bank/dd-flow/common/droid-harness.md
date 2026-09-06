---
file: '.memory-bank/dd-flow/common/droid-harness.md'
description: 'Factory Droid adapter contract for native Work delegation and observable execution.'
purpose: 'Read when configuring or qualifying droid-cli; preserves the common flow contract while stating provider-specific identity, cancellation and usage requirements.'
version: '0.1.0'
date: '2026-09-06'
status: 'DRAFT'
c4_level: 'runtime'
parent: '.memory-bank/dd-flow/README.md'
related_files:
  - subagents.md
  - worker-session.md
  - ../../spec/engineering/SPC-009-vnext-identity-materialization-and-runtime-state.md
  - ../../spec/engineering/SPC-012-deterministic-merge-stage-and-server.md
tags: [dd-flow, droid, harness, factory, subagents]
history:
  - version: '0.1.0'
    date: '2026-09-06'
    changes: 'Added Droid integration requirements and explicit qualification limits after native transport and child probes.'
---

# Factory Droid harness

`droid-cli` (alias `droid`) uses the `dd-droid` adapter and native
`droid exec --input-format stream-jsonrpc --output-format stream-jsonrpc`.
The adapter owns the execution daemon, operation journal and provider process.
Droid supplies Sessions and Task children; dd-flow remains the owner of
RUN/Stage/Work state and result acceptance. Factory Missions are outside this
integration. This contract does not introduce another lifecycle or scheduler.

## Qualification boundary

Initial transport and native-child probes used Droid `0.212.0`, protocol
`1.201.0` and `gpt-5.6-sol/high`. These observations do not qualify a release
or establish capacity. Each selected runtime/profile must pass compatibility,
native capacity and productive smoke gates from [subagents](subagents.md).
Whole-tree cancellation and resume after teardown require conformance evidence;
this document alone does not claim that gate passed. Selective cancellation of
one Task child while preserving a live coordinator is unsupported until proven.

## Private environment and worker bootstrap

Use an execution-private `FACTORY_HOME_OVERRIDE` with minimal settings and
hooks, explicit model/reasoning and disabled auto-update/cloud sync. Preserve
only required local authorization; credentials are private runtime material,
never checkpoint/evidence content, and are removed after final cleanup.
Verify all effective instruction/configuration sources before scored use:
private storage alone does not prove isolation from project configuration,
user skills, plugins or MCP.

The controller launches native depth-one Task children using the same technical
`dd-flow-worker` definition, profile and workspace strategy for capacity and
productive Work. Observe the actual model/reasoning of root and children;
unverified complexity routing or model fallback cannot satisfy a pinned
profile. The definition only bootstraps the worker: its first lifecycle action
is the exact standalone `work start` command, then the authoritative Work
packet from [worker-session](worker-session.md). It does not replace that
packet with Factory-specific development instructions.

## Physical identity and hooks

Public identity is `{harness_id: "droid-cli", session_id: <native Session ID>}`.
Resolve parent/child from `child_session_available` on the parent Session and
read back `callingSessionId`/`callingToolUseId` from the private child
transcript. A model assertion or a Task label is not identity evidence.

`PreToolUse` for `Execute` goes through the adapter hook wrapper and the
Droid event handler in dd-flow. Validate native identity, parent, transcript,
workspace and profile before accepting lifecycle binding. The tested payload
has no native tool invocation ID: assign a wrapper event UUID and preserve it
on transport retries. A new actual invocation receives a new UUID, even when
the command text is identical. After receipt acceptance, `updatedInput` adds
the one-use `--hook-event-id`; binding failure must not execute an unbound
lifecycle command. Hooks must remain serviceable while a prompt is running.

An empty `SubagentStop` result or `SessionEnd` is not successful Work evidence.
Native terminal outcome and engine acceptance are separate observations;
one failed child must not cancel or duplicate healthy siblings.

## Operations, cancellation and resume

Persist the correlation from adapter operation ID through RPC request ID,
`create_message.requestId`/message ID and terminal `turnId`. An empty RPC
response is an acknowledgement, not a terminal result. Background
`task-completion:*` events cannot complete an unrelated prompt operation.
Lost responses are recovered from the same durable operation; an unknown
outcome returns observation loss rather than permission to repeat the prompt.

`interrupt_session` cancels the root turn but can leave Task children and
Execute descendants alive. Cancellation must stop new productive operations,
snapshot topology/usage, interrupt the root, close the owned runtime and, when
needed, terminate only proven owned processes. Confirm descendants are gone
before returning `settled: true` or freeing resources. Record forced teardown
as unclean shutdown; unconfirmed cleanup remains a failed settlement.

Explicit resume after teardown must prove the same root ID, history and
settings, with no resurrected old children or repeated prompt. Do not use a
new model prompt to perform cleanup, infer tree settlement from root exit
alone, or substitute Mission worker APIs for verified Task control.

## Usage

Use cumulative counters for each physical Session with
`usage_scope=physical_session`. Root inclusive counters are a reconciliation
source only: cancelled roots can omit a still-running child's usage. Capture
snapshots before work, at lifecycle boundaries and after final settlement;
deduplicate ingestion and retain source, time and completeness evidence.
Missing or incomplete counters remain unavailable/partial, never zero or an
invented physical root value. Do not double-count overlapping cache/thinking
counters or sum root inclusive usage with its children. Preserve
`factoryCredits` as a provider metric without an assumed currency conversion.
