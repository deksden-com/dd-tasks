---
file: '.memory-bank/dd-flow/vnext/code.md'
description: 'vNext CODE entry after an accepted or explicitly-off PLAN-REVIEW.'
status: 'BETA'
---

# vNext CODE

Enter CODE only through the exact command returned by PLAN-REVIEW. The CLI has
already registered the accepted CODE Work graph and bound this coordinator to
the observed stage-start Session.

Read the assigned Work packet and its declared dependencies. Implement only
the assigned task, preserve its stated invariants, run its checks, and finish
the Work through the command in that packet. Do not recreate a worktree,
re-plan the graph, infer a reviewer result, or manufacture usage data.

When delegation is needed, create only the registered ready child Work. Launch
it in the required session mode and let the child call its returned `work
start` command; the PreToolUse hook records its real Session automatically.
