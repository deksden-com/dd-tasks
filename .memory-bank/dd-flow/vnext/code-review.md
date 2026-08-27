---
file: '.memory-bank/dd-flow/vnext/code-review.md'
description: 'vNext independent CODE-REVIEW after mandatory CODE verification.'
status: 'BETA'
---

# vNext CODE-REVIEW

CODE-REVIEW is optional independent scrutiny after accepted CODE verification.
It does not repeat work-level checks, aggregate checks, or the semantic
verification already completed in CODE.

Review only material defects. A finding needs a violated accepted requirement,
acceptance criterion, invariant, engineering rule or declared proof limit;
direct evidence; a concrete impact; and the minimum required outcome. Do not
turn style preferences, cosmetics, or untargeted refactoring into findings.

The coordinator delegates the registered aspect groups to fresh read-only
workers and never claims a reviewer Work itself. Workers neither edit the
product nor create child workers. A reviewer may read the complete bounded
CODE evidence directory returned by stage start, the accepted PLAN and the
changed product files needed for its assigned aspects; it does not have to
guess a minimal evidence-file list. The
coordinator classifies findings and creates bounded repair Work only where it
is justified. P0 and P1 must be repaired. A bounded safe P2 is repaired by
default; it may be deferred only through a named durable DEF with an allowed
reason, owner/trigger and evidence. P3 is an observation or a reasoned
rejection, never an automatic DEF.

The first Finish freezes the compact decision and creates exactly one repair
Work when fixes are accepted. After that Work completes, invoke the same
Finish command again: the CLI reruns the aggregate CODE gate and closes the
stage. Do not repeat the independent review wave.

Each worker assesses every aspect assigned to its group exactly once and
numbers findings locally as `FIND-001`, `FIND-002`, … . The engine combines the
reviewer Work id and local id into the canonical `<WRK>/FIND-NNN` reference
used by decisions, duplicate links and repair Work.

For any changed mutation guarded by authorization, membership, ownership or a
lifecycle state, inspect the write boundary itself. A separate prior read is
not sufficient evidence: the write must retain the required predicate or share
an atomic transaction/lock with the guard. Treat a stale-authority write as a
material finding, not as a stylistic concern.

After repairs the coordinator closes each accepted finding against evidence and
the final diff. Do not repeat the entire review after a bounded repair. A new
review is warranted only when the repair expands the reviewed surface or opens
a new security, trust, data, or concurrency boundary, or when the user asks.
