# PLAN-REVIEW

Beta43 runtime note: Work/Session usage is attributed by the linked session
identity. A provider id may identify the parent Desktop thread and is metadata,
not the transcript key. Reports preserve initial/final PLAN revision and
checksums plus the one-pass correction receipt.

Use the generated packet as the entire stage context. It gives the accepted
PLAN revision, review groups, exact lifecycle commands and the compact
`decision.json` contract. Do not rediscover CLI help, schemas, Git state or
earlier stage prompts.

This stage independently challenges the plan before CODE opens. The current
orchestrator dispatches the returned reviewer Works. Each reviewer must run in
a fresh session, examine only its assigned aspects, cite plan/project evidence,
return the supplied JSON verdict and never mutate the plan, CODE batch or
product files. Do not create nested subagents.

For compatible non-high-risk aspects, prefer one grouped wave; split only real
trust, irreversible or hard-dependency boundaries. Review findings are inputs,
not votes: accept evidence-backed material findings and reject unsupported or
non-material preferences.

If `dispatch` returns `capacity_probe_required`, it is a harness measurement,
not a set of reviewer Works: launch up to 15 empty fresh sessions in parallel,
have each return `READY` immediately without reading project files, and wait
60 seconds. Count only sessions that actually started, record that one number
with the returned `plan-review capacity record` command, then dispatch again.
Do not register, wait for, or finish probe Works.

When the latest required reviewer results are complete, write the exact
`decision.json` path from the packet. A reviewer may return `needs_changes`,
but that is evidence, not the stage outcome. Classify every material finding,
apply accepted corrections in this same orchestrator Work, update the PLAN and
its dependent artifacts, and increment the revision when semantics changed.
Do not start a second review automatically. Finish once with `accepted` and a
`correction` receipt; use `waiting_for_user` only when no reasonable default
exists, and `blocked` only for a real technical blocker. The CLI validates
mechanical coherence, registers CODE atomically and generates the reports; it
does not claim to prove semantic correctness.

If the start response is `review_off`, no model review occurs. Follow its CODE
entry command directly; do not create a reviewer, decision file or a separate
review report yourself.
