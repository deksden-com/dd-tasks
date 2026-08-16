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

For compatible non-high-risk aspects, prefer one grouped wave; split only real
trust, irreversible or hard-dependency boundaries. Review findings are inputs,
not votes: accept evidence-backed material findings, reject unsupported or
non-material preferences, and retry only a group invalidated by a meaningful
plan correction.

If `dispatch` returns `capacity_probe_required`, it is a harness measurement,
not a set of reviewer Works: launch up to 15 empty fresh sessions in parallel,
have each return `READY` immediately without reading project files, and wait
60 seconds. Count only sessions that actually started, record that one number
with the returned `plan-review capacity record` command, then dispatch again.
Do not register, wait for, or finish probe Works.

When the latest required reviewer results are complete, write the exact
`decision.json` path from the packet. Use `needs_changes` if a material plan
correction and targeted retry remain; use `accepted` only when the plan and
proposed CODE graph are ready. Then run the exact finish command. The CLI
validates evidence, registers CODE atomically and generates the reports.

If the start response is `review_off`, no model review occurs. Follow its CODE
entry command directly; do not create a reviewer, decision file or a separate
review report yourself.
