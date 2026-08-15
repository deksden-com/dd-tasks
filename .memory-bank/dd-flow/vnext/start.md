---
file: '.memory-bank/dd-flow/vnext/start.md'
description: 'User-level entry to the vNext SPECIFY-first flow.'
purpose: 'Materialize the active user discussion and start the deterministic SPECIFY flow.'
version: '0.1.0'
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
2. Use `.tasks/dd-flow/intake/<slug>/initial-request.md` as the raw input. If
   it already exists, it is caller-owned: do not read, edit, normalize or
   replace it; pass it unchanged. Only when it does not exist, create it from
   the material user discussion relevant to the requested work, including
   already given answers and constraints. Do not add your own solution,
   questions, plan or inferred requirements to raw intake.
3. Run exactly this first lifecycle command from the current worker session:

   ```bash
   dd-flow stage start --bootstrap --stage specify \
     --project-root "<project-root>" \
     --intake-file "<project-root>/.tasks/dd-flow/intake/<slug>/initial-request.md" \
     --subject "<slug>" --json
   ```

4. Treat returned `worker_prompt_markdown` as the complete SPECIFY task. Do
   not perform separate lifecycle, Git, eval, protocol, plan, code, review or
   merge work before or after it.

The installed PreToolUse hook binds this real worker session automatically. Do
not pass or discover a session id.
