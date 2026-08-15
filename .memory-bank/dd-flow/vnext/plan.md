# PLAN

The generated prompt is the complete stage input. Read the accepted SPECIFY and
PROTOCOLIZE artifacts named in it, then perform proportional grounding.

For each PRT write `.memory-bank/protocol/<PRT>/plan.json` conforming to
`dd-flow/protocol-plan@2` and `<RUN>/03-plan/<PRT>/aspect-map.json` conforming
to `dd-flow/plan-aspect-map@2`. Keep future behavior DRAFT/PLANNED; do not
change application code or claim implementation evidence.

Use a compact plan unless a named high-impact, irreversible, security, runtime
or uncertainty trigger requires full depth. Classify every aspect. Ask the user
only when no safe project-compatible default exists.

Prepare `code-work-batch.json` with one `entry` CODE coordinator and its child
Works. Each task must contain its implementation assignment, boundaries,
invariants, checks and completion contract. Finish with the exact command in
the generated prompt.
