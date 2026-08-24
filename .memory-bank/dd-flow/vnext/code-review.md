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
workers. Workers neither edit the product nor create child workers. The
coordinator classifies findings and creates bounded repair Work only where it
is justified. P0 and P1 must be repaired. A bounded safe P2 is repaired by
default; it may be deferred only through a named durable DEF with an allowed
reason, owner/trigger and evidence. P3 is an observation or a reasoned
rejection, never an automatic DEF.

After repairs the coordinator closes each accepted finding against evidence and
the final diff. Do not repeat the entire review after a bounded repair. A new
review is warranted only when the repair expands the reviewed surface or opens
a new security, trust, data, or concurrency boundary, or when the user asks.
