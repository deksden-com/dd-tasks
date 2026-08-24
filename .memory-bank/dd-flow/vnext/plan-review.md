# PLAN-REVIEW

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

PLAN performs semantic grouping using the one-shot capacity already stored for
this RUN. PLAN-REVIEW does not regroup or re-probe. Execute those groups in
`ceil(group_count / capacity)` waves: start up to the measured capacity
concurrently, then start the unchanged queued Works only after the prior wave
returns. Never create extra reviewers to fill unused slots or replacements for
a launch rejected before it starts.

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
Every reviewer finding has a stable id; preserve that id in the decision.
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
mechanical coherence, registers CODE atomically and generates the reports; it
does not claim to prove semantic correctness.

If the start response is `review_off`, no model review occurs. Follow its CODE
entry command directly; do not create a reviewer, decision file or a separate
review report yourself.
