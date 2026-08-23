---
file: '.memory-bank/dd-flow/vnext/code.md'
description: 'vNext CODE entry after an accepted or explicitly-off PLAN-REVIEW.'
status: 'BETA'
---

# vNext CODE

Enter CODE only through the exact command returned by PLAN-REVIEW. The CLI has
already registered the accepted CODE Work graph and has rebound the RUN's root
orchestrator Work to this stage-start Session. CODE does not create an
artificial coordinator Work.

The stage-start response contains the current graph. Launch only ready Works,
up to the measured RUN capacity. Each worker receives its complete accepted
requirements, semantic responsibility, selected project context, write scope,
verification commands and stop conditions from `work start`; do not make a
fresh worker reconstruct PLAN or broadly prime the whole Memory Bank.

The packet names the immutable `workspace_root`. All source reads and writes
belong there; the stable project root is only the `dd-flow` lifecycle identity.
CODE refuses to open if that route receipt, worktree, branch or base commit no
longer matches the route frozen at PROTOCOLIZE.

Implement only the packet's task and preserve its invariants. `work finish`
validates the result and runs the packet's focused checks before accepting the
Work. A failed focused check stays in that same Work for correction.

When delegation is useful, launch the registered ready child Work in a fresh
session and make its first command the supplied `work start`; the PreToolUse
hook records the real Session automatically. Close disposable workers after
they settle. After every completion, use the returned graph to dispatch newly
ready Works.

Finish CODE only after the graph has fanned in. `stage finish` checks obligation
coverage, runs the project aggregate gate and renders the deterministic report.
If that gate fails, create the returned repair Work from the failed receipt and
the relevant completed origin Works. The repair packet contains the original
context plus the failure delta; do not make an untracked root-session fix.
