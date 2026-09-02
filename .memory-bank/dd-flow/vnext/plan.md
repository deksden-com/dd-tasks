# PLAN

PLAN, not the CLI, selects verification. The project check profile supplies
reusable `@check/...` aliases, aggregate gates and only those raw commands
that must use an alias. Declare one top-level `checks[]` catalogue with stable
`CHK-*` id, command, purpose, gate and availability; plan items and acceptance
entries reference it with `check_refs`. Ordinary focused local commands may be
declared directly. A `planned` check names the item that first materializes it;
for a new `@check/...` alias also record its exact definition. PLAN finish
checks only structural references, ordering and guarded-command policy.
Every semantic `@check/...` entry also stores the exact accepted profile
command in `definition`; the CLI executes the current profile only after
proving that definition has not drifted.

The generated prompt is the complete stage input. Read the accepted SPECIFY and
PROTOCOLIZE artifacts named in it, then perform proportional grounding.

The CLI verifies the immutable PROTOCOLIZE workspace receipt before PLAN opens.
For a feature route, all project reads and writes are in that named worktree;
the stable project root is used only by lifecycle commands. Do not create,
switch, merge or delete branches/worktrees.

For each PRT the CLI has already materialized a partially filled
`.memory-bank/protocol/<PRT>/plan.json` in the registered feature worktree (or
direct workspace) and `<RUN>/03-plan/<PRT>/aspect-map.json`. Complete those
exact files in place; do not create replacements. The packet identifies the
fields already populated and owned by the CLI and the semantic fields still
owned by PLAN. Empty or missing semantic values are intentional draft markers,
not accepted defaults. Keep future behavior DRAFT/PLANNED; do not change
application code or claim implementation evidence.

Plan is traceable rather than a prose restatement: every plan item references
the accepted `R-*` and/or `AC-*` identifiers it realizes; every acceptance
entry references its original `AC-*` and the plan items that prove it. The CLI
owns `schema_id`, `plan_id`, `protocol_id`, the initial `revision` and
`source_refs`; keep them unchanged. PLAN-REVIEW alone increments revision after
an accepted correction. Do not invent a hash or rewrite identity fields.

For each accepted requirement and criterion, choose the proof that is actually
relevant in this project. Start with an existing focused test or a reusable
project alias; when neither is enough, plan the new test/check as part of the
delivery. A future check is never an anonymous shell line: make it a new
`@check/...` alias in `checks[]`, give it a precise `definition`, and name the
PLAN item that materializes it in `provided_by`. Every consumer must strictly
depend on that provider; the provider's `planned_write_areas` should normally
mention `.memory-bank/spec/engineering/code-check-profile.json`. Workspace
bootstrap before CODE is not a check catalogue entry. `readiness` is final
acceptance verification after CODE fan-in and may be planned when its provider
precedes that fan-in. Do not call a test “too heavy” and drop it: choose its
`run_at` deliberately, or state a real external/manual proof limit.

Use `run_at` literally: `work` proves one Work contribution; `code` proves the
combined feature workspace; `readiness` proves the completed acceptance path;
`merge` proves the actual integrated target; `release` belongs to RELEASE;
`external` records a non-shell proof boundary. A receipt from an earlier gate
does not silently satisfy a later one.

Do not copy every project `mandatory_by_gate` alias into `checks[]`. The CLI
combines those current policy floors with PLAN's semantic checks into one
visible effective gate in every relevant stage packet and report. Add an alias
to `checks[]` only when PLAN selected it to prove a concrete `R-*` or `AC-*`;
exact duplicate semantic/policy inputs execute once and retain both refs. For
every real source/target integration unit ensure the resulting effective merge
gate is non-empty. Every merge-level acceptance criterion still needs a
semantic PLAN check; a generic project floor is not its explanation. Omit a
merge gate only when delivery creates no new integrated tree, and record the
concrete strategy-backed reason in `decisions`.

A focused check belongs to the Work that owns every source path it may need to
repair. A project aggregate command from the engineering check profile (for
example `pnpm quality`) must use `run_at: "code"` or `"readiness"`, never
`"work"`: it runs after the CODE graph fans in, and a failed receipt then
creates a bounded repair Work with the actual affected paths. Do not attach an
aggregate gate to the final leaf merely because it happens to run last.

Each command or alias must own its required setup, fixtures, managed services
and cleanup. Required durable outputs go to `DD_FLOW_EVIDENCE_DIR` through
`required_artifacts`. A verification command must not update snapshots,
generated source, formatting or any other tracked/non-ignored project file;
such creation or repair belongs to a Work before the check runs.

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
give it concrete project-relative `required_read` paths and, when useful for
parallel coordination, stable `planned_write_areas` hints,
checks, stop conditions, requirement references, and observable verification.
Every `required_read` path must already exist when its Work starts; use an
accepted predecessor result rather than predicting a future input from an area
hint.
overlapping planned areas are allowed: the runtime serializes active overlap;
add `depends_on` only when one Work truly needs the other Work's result.
Give negative cases and migration/backfill proof their own explicit verification
entry whenever an accepted requirement needs them.

Every durable `document_updates` entry has exactly one existing PLAN item id as
its `owner` (`P1`, never `P1/P3`). Choose the item responsible for materializing
and verifying the update; other items may inform or precede it, but shared
ownership is not a valid substitute for one accountable Work. The CLI adds the
owned document path to that Work's planned coordination areas and rejects an unknown
or composite owner.

Before finishing, classify every durable document linked by the protocol that
could express the changed user behaviour—especially a related acceptance
scenario. If its goal, steps, observable ready state or required evidence
changes, add its `update` to `document_updates` with one owner. If it is truly
unaffected, record the path and reason in `decisions`; do not silently omit it.
`pnpm docs:check` verifies document structure, not whether a changed acceptance
contract still tells the truth.

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

Keep the task runner's actual current working directory and use the absolute
artifact paths returned by `stage start`. Do not try to select the provisioned
worktree as a tool `workdir`; lifecycle commands still use their explicit
project root, while project artifacts use the explicit write-workspace paths.

The generated stage packet includes the complete `plan.json` and
`aspect-map.json` contracts, including a valid minimal example, exact paths and
exact schema-validation commands. Run those commands after completing both
drafts, then run the returned `stage finish` command. Do not search schemas,
examples or CLI help to guess an output shape already owned by the stage
contract.
