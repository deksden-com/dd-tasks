# PLAN

PLAN, not the CLI, selects verification. The project check profile supplies
reusable `@check/...` aliases, aggregate gates and only those raw commands
that must use an alias. Declare one top-level `checks[]` catalogue with stable
`CHK-*` id, command, purpose, gate and availability; plan items and acceptance
entries reference it with `check_refs`. Ordinary focused local commands may be
declared directly. A `planned` check names the item that first materializes it;
for a new `@check/...` alias also record its exact definition. PLAN finish
checks only structural references, ordering and guarded-command policy.

The generated prompt is the complete stage input. Read the accepted SPECIFY and
PROTOCOLIZE artifacts named in it, then perform proportional grounding.

The CLI verifies the immutable PROTOCOLIZE workspace receipt before PLAN opens.
For a feature route, all project reads and writes are in that named worktree;
the stable project root is used only by lifecycle commands. Do not create,
switch, merge or delete branches/worktrees.

For each PRT write `.memory-bank/protocol/<PRT>/plan.json` in the registered
feature worktree (or direct workspace) conforming to
`dd-flow/protocol-plan@4` and `<RUN>/03-plan/<PRT>/aspect-map.json` conforming
to `dd-flow/plan-aspect-map@3`. Keep future behavior DRAFT/PLANNED; do not
change application code or claim implementation evidence.

Plan is traceable rather than a prose restatement: every plan item references
the accepted `R-*` and/or `AC-*` identifiers it realizes; every acceptance
entry references its original `AC-*` and the plan items that prove it. The CLI
owns `schema_id`, `plan_id`, `protocol_id`, the initial `revision` and
`source_refs`; keep them unchanged. PLAN-REVIEW alone increments revision after
an accepted correction. Do not invent a hash or rewrite identity fields.

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
when compatible aspects allow it. Put two or three compatible aspects in a
group; do not create one group per aspect merely for convenience. PLAN must
use the already-measured RUN capacity in its stage packet to target one wave.
More waves are allowed only for a real trust, irreversible, high-risk or
hard-dependency boundary; record that short reason in the map. PLAN-REVIEW
executes these unchanged groups and does not regroup them.

The next stage resolves the RUN-level `plan_review.mode` and either opens one
grouped fresh-reviewer wave or deterministically skips it for `off`.

Do not create, edit, or describe `code-work-batch.json`. The CLI projects its
CODE Works from validated plan items at finish. Make each item self-sufficient:
give it concrete project-relative `required_read` and `write_scope` paths,
checks, stop conditions, requirement references, and observable verification.
Reads must already exist, except for a path written by an explicit predecessor;
two items may share a write path only when their dependency graph orders them.
Give negative cases and migration/backfill proof their own explicit verification
entry whenever an accepted requirement needs them.

For every conditional mutation that depends on current authorization, ownership,
membership or lifecycle state, plan the check and write as one atomic database
boundary: one conditional statement or one transaction with the necessary lock
and predicates. A prior read followed by an unconditional write is not proof
that permission or state was still valid at mutation time. Include a negative
or concurrency proof when that boundary can change concurrently.

PLAN finishes when the plan and aspect maps validate; the CLI then generates
the CODE batch. It
returns the exact `plan-review` start command. Do not start reviewers, mutate
the generated batch or start CODE from this stage.

Use project-relative references for project artifacts and `run://<RUN-ID>/…`
for RUN artifacts. Do not put an absolute filesystem path in a semantic plan,
map or Work task; the CLI resolves portable RUN references in the live worker
packet.

Write artifacts only at the exact paths printed in the generated `<artifacts>`
packet: `plan.json` belongs under the protocol directory in the registered
RUN workspace; the aspect map belongs under the listed RUN stage workspace. A
similarly named file elsewhere is not an input to PLAN finish.

The generated stage packet includes the complete `plan.json` and
`aspect-map.json` contracts, including a valid minimal example and exact paths.
Do not search schemas, examples or CLI help to guess an output shape already
owned by the stage contract.
