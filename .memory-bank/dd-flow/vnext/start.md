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
  - mb-sdlc-vnext-specify.json
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
3. Treat returned `worker_prompt_markdown` as the complete SPECIFY task. Do
   not perform separate lifecycle, Git, eval, protocol, plan, code, review or
   merge work before or after it.

The installed PreToolUse hook binds this real worker session automatically. Do
not pass or discover a session id.
