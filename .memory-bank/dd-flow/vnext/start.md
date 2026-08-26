---
file: '.memory-bank/dd-flow/vnext/start.md'
description: 'User-level entry to the vNext SPECIFY-first flow.'
purpose: 'Materialize the active user discussion and start the deterministic SPECIFY flow.'
version: '0.2.0'
date: '2026-08-14'
status: 'DRAFT'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/index.md'
related_files:
  - mb-sdlc-vnext-protocolize.json
  - specify.md
tags: [dd-flow, vnext, start, specify, beta]
---

# Start vNext SPECIFY

Use this entry only after the user has already discussed a concrete change and
asks to formalize it. The semantic first stage is SPECIFY. `vnext/specify.md`
is not opened directly: `stage start --bootstrap --stage specify` creates the
RUN, root Work, stage workspace, trusted session binding and bounded prompt.

## Actions

1. Choose a short stable slug from the discussed task.
2. Make `stage start` the first technical action and run it as one standalone
   Bash command. The Controller/adapter prepares the raw material user
   discussion as a durable intake file: the original request plus already
   given answers and constraints. Do not add a solution, questions, plan or
   inferred requirements. The CLI stores those bytes unchanged in the new RUN.

   ```bash
   DD_FLOW_HOME="<runtime-home>" dd-flow stage start --bootstrap --stage specify \
     --project-root "<project-root>" \
     --subject "<slug>" --intake-file "<prepared-intake-file>" --json
   ```

   Do not prepend a skill read, Git command or `cat`; do not use `&&`, `;`, a
   pipe, background execution or a subshell. A compound lifecycle command is
   rejected and the hook returns the exact standalone retry for this same
   Session. Do not open a new Session to repair a hook mismatch.
3. Treat returned `worker_prompt_markdown` as the complete SPECIFY task. After
   a successful `specified` outcome, follow the returned `next` directive:
   `same_session` (the default) continues the root coordinator in this
   session for the whole flow. `new_session` stops only when the project
   explicitly requests a Controller-managed handoff to a fresh coordinator
   session. This is the frozen `stage_session_mode` from
   `dd-flow/project-execution.json`, not an agent choice and not part of the
   workspace-routing policy. Fresh sessions for delegated workers and
   reviewers are controlled by their Work launch policy, independently.

The bootstrap checkout is intentionally only the stable project identity while
SPECIFY resolves the problem space. If the project selects `feature_worktree`,
the CLI creates and bootstraps it at `PROTOCOLIZE start`, before it materializes
any durable delivery document. The resulting receipt then binds PLAN,
PLAN-REVIEW and CODE to that workspace. Agents do not create branches or
worktrees themselves.

If the user explicitly requested no plan review or a deep/focused plan review,
normalize that single instruction immediately after bootstrap into this RUN;
otherwise leave the default `auto` untouched. This is the only place where
user prose is interpreted for the policy:

```bash
dd-flow run config set <RUN-ID> --project-root "<project-root>" \
  --key plan_review.mode --value off|deep --reason "explicit user instruction" --json
```

`plan-review` later reads this stored RUN value. It never rereads the intake
to guess whether review is wanted.

Every lifecycle receipt must be sufficient for the next action. `stage start`
returns the exact semantic output contract and finish command for the current
stage; successful `stage finish` returns the exact next-stage directive and
command, or an explicit terminal/user gate. A normal worker never searches CLI
help or flow files to reconstruct either command.

The installed PreToolUse hook binds this real worker session automatically. Do
not pass or discover a session id. Every successor `stage start` and every
`work start` is likewise the first technical action of its worker Turn and one
standalone Bash command.
