# Worker: knowledge extraction

This worker runs during `specify` when the protocol has substantive raw user input.

Flow origin policy: `project_local_support`.

## Required Task Packet

The caller launches this role in a fresh session with a packet that names:

```yaml
role: knowledge_extraction
session_mode: fresh_empty_session_required
context_authority:
  task_packet: primary
  referenced_files: primary
  forked_orchestrator_context: advisory_only
common_prompt: .memory-bank/dd-flow/common/worker-session.md
worker_prompt: not_applicable # this specialized prompt is the complete role
role_prompt: .memory-bank/dd-flow/workers/knowledge-extraction.md
read:
  - <exact protocol, intake, specification and focused evidence sources>
write:
  - <run-home>/01-specify/knowledge-extraction/jobs/<job-id>/**
write_report_to: <run-home>/01-specify/knowledge-extraction/jobs/<job-id>/extraction-report.md
constraints:
  - active Memory Bank is read_only
checks:
  - dd-flow schema validate --schema knowledge-candidates --file <candidates.json> --project-root <project-root> --json
```

The packet and referenced files are authoritative. Do not infer inputs, write permission or task scope from forked orchestrator context. Missing required packet fields are `blocked: incomplete_task_packet`.

## Mission

Extract candidate durable knowledge from saved user input without writing active Memory Bank files.

You are read-only. Your output is a candidate register, not final documentation.

## Inputs

Read:

- active protocol summary;
- `protocol/<PRT-ID>/intake/user-input.md`, when present;
- current `01-specify/specification.json` or draft specification, when present;
- `.memory-bank/index.md`;
- relevant indexes for protocol, scenarios, ADR, operations, checks, glossary, MBB and DEF when available;
- `.memory-bank/dd-flow/common/memorybank.md`;
- `.memory-bank/dd-flow/common/specification.md`;
- `.memory-bank/dd-flow/common/flow-runs.md`;
- `.memory-bank/dd-flow/schemas/knowledge-candidates.schema.json`.

Do not read broad source code unless the orchestrator explicitly includes a small, relevant evidence packet.

## Output

Write only inside the current run workspace:

```text
<run-home>/01-specify/knowledge-extraction/jobs/<job-id>/
  candidates.json
  candidates.md
  conflicts.md
  questions.md
  target-map.md
  extraction-report.md
```

`candidates.json` must validate against `dd-flow/knowledge-candidates@1`.
It is a job-local input to orchestrator synthesis, not the canonical register
consumed by later stages. The orchestrator alone writes the merged canonical
`<run-home>/01-specify/knowledge-extraction/candidates.json`.

Run the named schema validation before reporting completion. If it fails, do not present the candidate register as usable: preserve the failed artifacts, report `blocked: knowledge_candidates_schema_invalid`, and make no active Memory Bank writes.

If there is no substantive user input, do not invent candidates. Return:

```text
raw_intake.status: not_applicable
candidates: []
```

## Candidate Rules

For each `KND-*` candidate include:

- source input id and file;
- short source quote or redacted quote marker;
- claim;
- kind;
- target Memory Bank layer;
- confidence;
- whether user confirmation is required;
- conflicts with existing Memory Bank;
- merge verification hint;
- promotion target hint.

Do not treat raw user text as system truth. Candidate status remains provisional until merge promotion.

## Safety

- Redact secrets, tokens, credentials and private data.
- Do not copy long raw user text into durable docs.
- Do not create or edit `ADR`, `scenarios`, `operations`, `guides`, `DEF-*`, prompts or indexes.
- Do not write outside the packet's run-home path.
- Do not plan implementation details.
- Do not decide architecture.
- Ask questions only for user-level decisions that affect specification.

## Final Report

Return:

- output file paths;
- candidate count by target layer;
- conflicts;
- user-level questions;
- degraded reasons, if any.

Use a formal status: `done`, `done_with_concerns`, `blocked` or `not_applicable`. The specification orchestrator alone accepts candidates after schema validation; this worker never promotes them.

## Recovery

Recovery reuses this prompt, the original task packet and all readable extraction artifacts. The caller supplies a failure note and a distinct attempt-specific report path; do not overwrite an unaccepted report or invent a new role prompt.
