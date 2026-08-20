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
2. Make `stage start` the first practical command. Pass the raw material user
   discussion once on standard input: the original request plus already given
   answers and constraints. Do not add your solution, questions, plan or
   inferred requirements. The CLI stores the bytes unchanged in the new RUN.

   ```bash
   cat <<'USER_INTAKE' | dd-flow stage start --bootstrap --stage specify \
     --project-root "<project-root>" \
     --subject "<slug>" --intake-stdin --json
   <raw material user discussion>
   USER_INTAKE
   ```

   If a caller has already supplied a durable raw-input file, pass that exact
   file with `--intake-file` instead; do not read, edit, normalize or replace
   it.
3. Treat returned `worker_prompt_markdown` as the complete SPECIFY task. After
   a successful `specified` outcome, follow the returned `next` directive:
   `same_session` continues in this session; `new_session` stops so the
   controller can start `protocolize` in a fresh session. This is the
   `workspace.next_stage_session` value in `project-workspace.json`, not an
   agent choice or a separate runtime setting.

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
not pass or discover a session id.
