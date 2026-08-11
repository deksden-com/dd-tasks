# Fix-DEF: read-only DEF priming

This prompt starts a focused discussion from existing project DEFs.

Flow origin policy: `project_local`.

`fix-def.md` does not fix anything by itself. It prepares the current session to discuss accumulated `DEF-*` / `DEF-MBU-*` obligations and decide what scope should later be materialized through ordinary `protocol.md`.

## Hard Guardrails

This prompt is read-only.

It must not:

- create or edit files;
- create, update, close, or delete DEF files;
- create `PRT-*`;
- create `PSET-*`;
- start or attach `RUN-*`;
- register runtime state, sessions, lanes, locks, queue items, or CLI protocol state;
- run `plan.md`, `code.md`, `merge.md`, `def/plan.md`, or `def/fix.md`;
- perform implementation fixes;
- close DEFs.

If the user asks to actually fix selected DEFs, first finish this prompt's report, then tell the user that the next step is `protocol.md` for the chosen scope.

## What To Read

Read:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/defs/index.md`, if it exists
- `.memory-bank/defs/DEF-*.md`, if any exist
- `.memory-bank/project-policy.md`, if it exists
- `.memory-bank/index.md`
- `.memory-bank/structure.md`, if it exists
- `.memory-bank/mbb/named-deferrals-guide.md`
- active protocol/index documents that are directly referenced by discovered DEFs
- profile documents linked from each relevant DEF

If `.memory-bank/defs/` does not exist in the target project, fall back to the legacy active DEF discovery locations listed in `common/memorybank.md`.

Do not crawl old unrelated `.tasks/` runs as durable truth. Read `.tasks/` only when an active durable document links to a specific artifact and that artifact is needed to understand a current DEF.

## Analysis

For each discovered DEF, classify:

- current status;
- affected area;
- blocking scope;
- next gate;
- user decision needed or not;
- external access/provider/stage needed or not;
- whether the agent can likely resolve it without user input;
- stale, duplicate, superseded, malformed, or suspected closed;
- related files to inspect before protocolization.

Bounded research is allowed when it can clarify whether the DEF is still relevant. Prefer local project sources. Use external sources only when the DEF depends on current third-party behavior, and cite the source in the final report.

## Grouping

Group DEFs into coherent discussion packages:

- requires user decision;
- agent-fixable now;
- external gate or access required;
- blocks merge/current work;
- blocks release/deploy/production;
- documentation/Memory Bank hygiene;
- stale/duplicate/suspected closed;
- unrelated follow-up.

Recommend one group to discuss first. Explain why.

## Protocolization Guidance

For each group, state the likely protocol shape:

- one coherent group -> likely one `PRT-*`;
- several independent groups -> likely one `PSET-*` with member `PRT-*`;
- user-decision-only group -> likely `protocol.md` creates a protocol that may stop in `specify` or `waiting_for_user`;
- stale/duplicate cleanup group -> likely audit/review or a small protocol, depending on write scope.

Do not create the protocol. `protocol.md` owns materialization.

## Final Report

Return a session report with:

- `prompt: fix-def.md`;
- `mode: read_only`;
- total DEFs found;
- sources read;
- groups and recommended order;
- DEFs in each group;
- stale/duplicate/suspected closed candidates;
- user questions to discuss now;
- likely protocol shape per group;
- explicit statement: no files, runtime state, protocols, runs, fixes, or DEF closures were created.
