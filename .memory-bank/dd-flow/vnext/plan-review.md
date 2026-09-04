# PLAN-REVIEW

A quiet reviewer remains active until the harness explicitly reports its turn
completed, failed, cancelled, needing attention, a process exit, or a platform
deadline failure. Silence, an unchanged timestamp, and absence of a result
artifact are not evidence of a stuck worker. Wait; do not interrupt, replace,
or relaunch it.

Use the generated packet as the entire stage context. It gives the accepted
PLAN revision, review groups, exact lifecycle commands and the compact
`decision.json` contract. Do not rediscover CLI help, schemas, Git state or
earlier stage prompts.

This stage independently challenges the plan before CODE opens. The current
orchestrator dispatches the returned reviewer Works. Each reviewer must run in
a fresh session, examine only its assigned aspects, cite plan/project evidence,
return the supplied JSON verdict and never mutate the plan, CODE batch or
product files. Do not create nested subagents.

The orchestrator never runs a reviewer's `start_command` itself. It first
creates a fresh child session; that child uses the exact returned
`start_command` as its first tool call. A rejection before the child starts is
not review evidence and must not be "fixed" by claiming the Work in the
orchestrator session.

For compatible non-high-risk aspects, prefer one grouped wave; split only real
trust, irreversible or hard-dependency boundaries. Review findings are inputs,
not votes: accept evidence-backed material findings and reject unsupported or
non-material preferences.

Challenge semantic preservation explicitly: universal/exclusive quantifiers
and accepted exceptions must survive intact from SPECIFY into every owning plan
item. Check that each proof exercises its named failure mechanism; sequential
negative evidence is not concurrency evidence, and a proof limit cannot erase
an accepted obligation.

PLAN performs semantic grouping using the one-shot capacity already stored for
this RUN. PLAN-REVIEW does not regroup or re-probe. Execute the ready portion
of the Work graph in waves: launch up to the measured capacity, wait for that
wave to settle, then query the unchanged graph for newly ready Works. A hard
`depends_on` always wins over the one-wave preference. Never start a blocked
Work, create extra reviewers to fill unused slots, or replace a launch rejected
before it starts. Whether a hard dependency was semantically warranted is a
review-quality question; execution must still respect it.

Capacity, when needed, is described only by the generated lifecycle command
packet. It is a one-shot measurement, not productive Work: launch the one
batch of 15 probes concurrently once, count only launches that actually start,
and never retry, replace, or try to reach fifteen successes. Rejected launches
are expected evidence of the limit. Follow the returned cleanup deadline, then
record the one observed number. Do not improvise another probe. The probes
exist only to measure capacity: after the observation window, cancel every
probe that has not finished and close/delete every finished probe session that
the harness permits. Do this before launching a reviewer. No probe agent may
remain live and consume a slot for productive reviewer or CODE work.

When the latest required reviewer results are complete, write the exact
`decision.json` path from the packet. A reviewer may return `needs_changes`,
but that is evidence, not the stage outcome. Classify every material finding,
apply accepted corrections in this same orchestrator Work, update only the PLAN
and its relevant aspect map, and increment the revision when semantics changed.
Every reviewer finding has a local `FIND-NNN` id. Use the canonical
`<WRK>/FIND-NNN` reference returned by dd-flow in the coordinator decision.
For every durable document linked by the protocol that can describe the changed
user behaviour—especially a related acceptance scenario—verify that PLAN either
assigns one document update or explicitly records why it is unaffected. A
changed scenario goal, steps, observable ready state or proof with no owned
update is a material finding: add the update and its single CODE Work owner in
this same correction. Do not treat a structural `docs:check` as semantic proof.
Before reviewer results exist, delegated applicable aspects remain `pending`;
the review result is the first place that may move them to `pass` or `watch`.
A completed reviewer result with `needs_changes` or `blocked` is evidence for
the coordinator to classify and address in this one pass; only missing,
malformed or unfinished reviewer evidence blocks the stage. Do not start a
second review automatically. Finish once with `accepted` and a
`correction` receipt. `code-work-batch.json` is derived by the CLI after
validation: never edit it or list it as an agent-authored correction. When no
reasonable default exists, pause and later
resume this same PLAN-REVIEW Work; do not finish it as waiting. Use `blocked`
only for a real terminal technical blocker. The CLI validates
mechanical coherence, rejects completion while any selected reviewer Work is
unsettled, registers CODE atomically and generates the reports; it
does not claim to prove semantic correctness.

If the start response is `review_off`, no model review occurs. Follow its CODE
entry command directly; do not create a reviewer, decision file or a separate
review report yourself.
