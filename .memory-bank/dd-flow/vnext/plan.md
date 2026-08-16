# PLAN

The generated prompt is the complete stage input. Read the accepted SPECIFY and
PROTOCOLIZE artifacts named in it, then perform proportional grounding.

For each PRT write `.memory-bank/protocol/<PRT>/plan.json` conforming to
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

Planning depth and review routing are independent decisions.
`orchestrator_local` is only the initial routing owner, not the default review
route. Use `local_compact` only for one genuinely tiny semantic unit or one
short source scope. For substantive multi-aspect read-only work, separate only
real hard-output or independent trust boundaries, group the remaining
compatible aspects in packets of at most three and prefer
`single_wave_grouped`. Use known free capacity or one bounded probe when it is
unknown; capacity changes packing only. Accept every aspect separately and
retry only a rejected unit.

Prepare `code-work-batch.json` with one `entry` CODE coordinator and its child
Works. Each task must contain its implementation assignment, boundaries,
invariants, checks and completion contract. Finish with the exact command in
the generated prompt.

For `single_wave_grouped` or `multi_wave_grouped`, use the second PLAN action
after the draft artifacts exist: run the exact `plan reviews dispatch` command
from the stage packet. It validates the draft and returns one ready Work per
declared group plus exact worker-start commands. Launch those Work through the
current harness in the available wave(s). Every worker's first action is its
returned `work start` command; it must finish with a compact verdict result.
Consume those results, update the affected aspect-map rows to
`grouped_subagent` evidence, then run PLAN finish. Do not claim a grouped route
without completed review Work and accepted verdicts.

Use project-relative references for project artifacts and `run://<RUN-ID>/…`
for RUN artifacts. Do not put an absolute filesystem path in a semantic plan,
map or Work task; the CLI resolves portable RUN references in the live worker
packet.

The generated stage packet must include the complete `plan.json`,
`aspect-map.json` and `code-work-batch.json` contracts, including a valid
minimal example and exact paths. Do not search schemas, examples or CLI help to
guess an output shape already owned by the stage contract.
