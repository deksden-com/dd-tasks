# PLAN

The generated prompt is the complete stage input. Read the accepted SPECIFY and
PROTOCOLIZE artifacts named in it, then perform proportional grounding.

For each PRT write `.memory-bank/protocol/<PRT>/plan.json` in the registered
feature worktree (or direct workspace) conforming to
`dd-flow/protocol-plan@2` and `<RUN>/03-plan/<PRT>/aspect-map.json` conforming
to `dd-flow/plan-aspect-map@2`. Keep future behavior DRAFT/PLANNED; do not
change application code or claim implementation evidence.

Plan is traceable rather than a prose restatement: every plan item references
the accepted `R-*` and/or `AC-*` identifiers it realizes; every acceptance
entry references its original `AC-*` and the plan items that prove it. The CLI
adds hashes for local source references deterministically at finish; never
invent a hash.

Use a compact plan unless a named high-impact, irreversible, security, runtime
or uncertainty trigger requires full depth. Classify every aspect. Ask the user
only when no safe project-compatible default exists.

Planning depth, PLAN execution routing, and independent review grouping are
separate decisions. `routing.groups` describes only subagents used while
making PLAN. `review_groups` describes every applicable aspect that a later
PLAN-REVIEW may inspect. Always cover every applicable aspect exactly once in
`review_groups`, with one to three compatible aspects per group. Do this even
when `routing.selected_route` is `local_compact`: local PLAN does not mean
independent review is unnecessary. Do not launch reviewers in PLAN.

Optimize review grouping semantically: preserve real trust, irreversible,
high-risk and hard-dependency boundaries first, then use the fewest groups
that retain independent review value. One grouped reviewer wave is preferable
when compatible aspects allow it, but PLAN must not guess the number of
physical waves. PLAN-REVIEW measures live fresh-session capacity immediately
before reviewer dispatch and schedules unchanged groups in those waves.

The next stage resolves the RUN-level `plan_review.mode` and either opens one
grouped fresh-reviewer wave or deterministically skips it for `off`.

Prepare `code-work-batch.json` with one `entry` CODE coordinator and its child
Works. Each task must contain its implementation assignment, boundaries,
invariants, checks and completion contract. Every CODE Work has non-empty
`requirement_refs`, `read_paths`, `write_paths` and `verification`; it must be
executable from that record alone, without undefined phase labels or unnamed
documents. Give negative cases and migration/backfill proof their own explicit
verification entry whenever an accepted requirement needs them. Finish with the
exact command in the generated prompt.

PLAN finishes when the plan, aspect maps and proposed CODE batch validate. It
returns the exact `plan-review` start command. Do not start reviewers, mutate
the proposed batch or start CODE from this stage.

Use project-relative references for project artifacts and `run://<RUN-ID>/…`
for RUN artifacts. Do not put an absolute filesystem path in a semantic plan,
map or Work task; the CLI resolves portable RUN references in the live worker
packet.

Write artifacts only at the exact paths printed in the generated `<artifacts>`
packet: `plan.json` belongs under the protocol directory in the registered
RUN workspace; aspect map and CODE batch belong under the listed RUN stage
workspace. A similarly named file elsewhere is not an input to PLAN finish.

The generated stage packet must include the complete `plan.json`,
`aspect-map.json` and `code-work-batch.json` contracts, including a valid
minimal example and exact paths. Do not search schemas, examples or CLI help to
guess an output shape already owned by the stage contract.
