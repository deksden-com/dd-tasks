# dd-tasks

`dd-tasks` is a small team task tracker used to evaluate AI coding agents that
follow the Memory Bank and `dd-flow` lifecycle.

This repository contains the product and its project Memory Bank only. Eval
cases, hidden requirements, reference answers, review prompts, runner code, and
results belong to `deksden-com/dd-eval` and must not be copied here.

## Current state

`checkpoint-00-initial` preserves the intentional zero checkpoint. The
The accepted `checkpoint-01-foundation` foundation is now fast-forward
integrated into stable `main` at commit
`a03169559e60767042c9a39829adae9f9ff8228f`: workspace, API, database, browser,
quality and Memory Bank contours are source-backed and freshly rechecked on the
integrated checkout. The feature worktree remains available at the same clean
commit while branch retention is not defined by project policy.

Checkpoint fixation is intentionally not claimed here: the project contract
requires an annotated tag, but the later tag name and remote push target have
not been defined by source-backed policy.

The accepted local evidence does not claim product/task-tracker behavior, CI,
release, deployment, production or external-provider behavior. Product work
must still be introduced through explicit protocols and must not be inferred
from this foundation checkpoint.

## Initial project direction

The foundation stage establishes only a small TypeScript monorepo:

- pnpm workspaces;
- `apps/web` with React, Vite, Tailwind CSS, and shadcn/ui;
- `apps/api` with Hono;
- PostgreSQL with Drizzle ORM and migrations;
- Biome for formatting and linting;
- `tsc --noEmit` for type checking;
- Vitest and Playwright;
- deterministic database seed and reset commands.

Product behavior will be introduced later through explicit protocols. Do not
pre-build speculative features during initialization or foundation work.

## Memory Bank requirements

The project Memory Bank is the source of truth for the state represented by its
commit. It must:

- describe only accepted current behavior and explicitly approved work;
- keep project structure, policies, specifications, plans, scenarios, protocols,
  and code consistent;
- use the installed project `dd-flow` rather than invent a parallel lifecycle;
- route every product feature through `protocol -> specify -> plan -> code ->
  readiness -> merge`;
- preserve verification evidence required by the flow;
- avoid references to hidden eval cases, rubrics, reference answers, or future
  checkpoints;
- update in the same accepted commit as the behavior it documents.

## Checkpoint contract

This project is consumed as immutable snapshots by the external eval runner.

- An accepted checkpoint is an annotated Git tag on a clean commit.
- Tags never move and published checkpoint contents are never rewritten.
- Code, tests, fixtures, migrations, and Memory Bank artifacts must agree at each
  checkpoint.
- Seed and reset commands must produce the same logical demo state every time.
- A checkpoint must not require access to later commits or untracked local files.
- Secrets and machine-specific values are never committed.
- The external runner materializes a new repository from an exact checkpoint;
  agents are not given this repository's other refs or history.

The initial tag should be `checkpoint-00-initial`. Later checkpoint names are
assigned only after their scope passes the applicable flow and verification.

## Repository constraints

- Keep the implementation simple and conventional.
- Add a shared package only after two applications genuinely share code.
- Prefer platform features and database constraints over custom infrastructure.
- Do not add background jobs, cron, polling, billing, analytics, or deployment
  machinery until an approved feature requires them.
- Root commands must provide a deterministic path to format, lint, typecheck,
  test, build, reset data, and run end-to-end scenarios once those capabilities
  exist.
