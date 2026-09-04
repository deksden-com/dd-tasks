---
file: '.memory-bank/dd-flow/vnext/code.md'
description: 'vNext CODE entry after an accepted or explicitly-off PLAN-REVIEW.'
status: 'ACTIVE'
---

# vNext CODE

Enter CODE only through the exact command returned by PLAN-REVIEW. The CLI has
already registered the accepted CODE Work graph and has rebound the RUN's root
orchestrator Work to this stage-start Session. CODE does not create an
artificial coordinator Work.

The stage-start response contains the current graph. Launch only ready Works,
up to the measured RUN capacity. Each worker receives its complete accepted
requirements, semantic responsibility, selected project context, planned
coordination areas,
verification commands and stop conditions from `work start`; do not make a
fresh worker reconstruct PLAN or broadly prime the whole Memory Bank.

The packet names the immutable `workspace_root`. All source reads and writes
belong there; the stable project root is only the `dd-flow` lifecycle identity.
CODE refuses to open if that route receipt, worktree, branch or base commit no
longer matches the route frozen at PROTOCOLIZE.

Before the packet is returned, `dd-flow` executes the project-owned bootstrap
command frozen in the RUN execution profile and writes a workspace-bootstrap
receipt in `05-code`. This is operational preparation, not the planned
`run_at: readiness` acceptance gate. PROTOCOLIZE only creates the checkout and
transfers the explicitly allowed local files; it never installs dependencies
or starts the application. Trust a passing bootstrap receipt and do not
independently repeat it.

Implement only the packet's task and preserve its invariants. A packet may
name a `provided_checks` alias: create it exactly with the supplied definition
alongside its corresponding test or script before finishing the Work. Do not
replace it with a similar command. `work finish`
validates the result and runs the packet's focused checks before accepting the
Work. A failed focused check stays in that same Work for correction.

For every mutation that depends on membership, ownership, authorization or a
parent lifecycle state, verify the decision boundary itself: retain the needed
predicate in the write statement, or make the guard and write one explicit
transaction with the needed lock. A prior read may explain an error, but it
never proves that a later write is still permitted. Apply this equally to
create, update, delete and parent-state mutations; do not implement a narrower
atomicity guarantee than the accepted PLAN promises.

The coordinator owns the graph and stage conclusion; every registered CODE
Work runs in a fresh child session, including a serial dependency chain. Each
child makes its first command the supplied `work start`, and the PreToolUse
hook records the real Session automatically. This keeps the coordinator's
context focused on dispatch, evidence and the final gate rather than on
implementation detail.
Silence, an unchanged timestamp,
and the absence of a new artifact are normal while a turn is active; they are
not evidence that a worker is stuck. Do not interrupt, replace or relaunch it.
Wait until the harness reports completion, failure, cancellation, need for
attention, a process exit, or an explicit platform deadline failure. Long
`work finish` checks report progress on stderr. Close a
disposable worker only after its Work is accepted or explicitly failed or
cancelled and its turn has settled. After every accepted completion, use the
returned graph to dispatch newly ready Works.

The packet separates hard boundaries from planning hints. The immutable RUN
`workspace_root`, accepted requirements, non-goals and stop conditions are
hard. `required_read` is mandatory starting material, but not a read allowlist.
`discovery_boundary` and `planned_write_areas` are soft coordination hints:
they help find code and avoid concurrent collisions, but never grant or deny a
necessary project-local edit. If a necessary changed path was not predicted,
complete the Work and report it as `coordination.drift`; do not fail or hide it.
A successful CODE Work still has no unresolved blockers or deviations and
materializes every assigned durable document update.

A repairable engine, harness or environment failure is an external blocker,
not a user question and not a terminal CODE result. Use the exact `stage block`
command in the coordinator packet, repair the cause, run its returned
`unblock_command`, and continue this same CODE stage.

Finish CODE only after the graph has fanned in. Before `stage finish`, write the
small `code-verification.json` requested in the stage-start packet: it is the
orchestrator's evidence-based confirmation that the accepted requirements and
current-gate acceptance criteria are actually satisfied. `stage finish` checks
obligation coverage, validates that semantic conclusion, runs the PLAN-declared
`code` and final `readiness` checks plus the project policy gate, and renders
the deterministic report. The order is strict: all `code` checks first, then
all `readiness` checks. Project-mandatory aliases are present in the visible
effective gate composed by the CLI from the accepted PLAN catalogue and the
current project profile; PLAN does not copy policy floors by ritual. The
packet and report expose every policy declaration and profile hash. Stage
start runs only the project bootstrap;
`readiness` means final acceptance readiness, not entry preparation. `merge`, `release`
and `external` checks remain explicitly scheduled for their own gates and are
never silently substituted here.
The semantic file records only verdict, summary, unresolved items and
deviations. CODE Work reports evidence against acceptance ids; executable
checks produce immutable receipts with a workspace fingerprint and hashes of
the exact artifacts declared by PLAN.
If the coordinator itself finds an unresolved accepted obligation, record it
in `unresolved` and call `stage finish` once. The CLI materializes a semantic
repair Work from that immutable verification file and the completed CODE
context; run it, update the verification to `passed`, then finish again. Do
not leave CODE running with a prose-only `needs_repair` conclusion.
If that gate fails, create the returned repair Work from the failed receipt and
the relevant completed origin Works. The repair packet contains the original
context plus the failure delta; do not make an untracked root-session fix.
Do not repeat `stage finish` against the same workspace fingerprint: the CLI
returns the retained failure until the repair changes the workspace.
After a repair changes the fingerprint, every check in the affected final gate
runs again in a new verification epoch; do not reuse a former pass by judgment.

When the frozen RUN configuration enables it, a passing aggregate gate moves
to the separate optional `code-review` stage. CODE verification is mandatory;
CODE-REVIEW is independent quality scrutiny and must never replace it.
