# dd-tasks

`dd-tasks` is a small team task tracker used to evaluate AI coding agents that
follow the Memory Bank and `dd-flow` lifecycle.

This repository contains the product and its project Memory Bank only. Eval
cases, hidden requirements, reference answers, review prompts, runner code, and
results belong to `deksden-com/dd-eval` and must not be copied here.

## Current state

`checkpoint-00-initial` preserves the intentional zero checkpoint and
`checkpoint-01-foundation` preserves the accepted technical foundation.
PRT-003 implements the local `checkpoint-02-core` slice: accounts and hashed
server-side sessions, workspace owner/member isolation, project lifecycle,
basic task CRUD, guarded PostgreSQL migrations/fixtures and minimal product UI.

Local readiness and merge closure are owned by SCN-002 and RUN-298. The core
implementation `5027fa1` is fast-forward integrated into local `main`; fresh
stable-root checks pass and annotated tag `checkpoint-02-core` fixes the local
checkpoint. It combines unit tests, real
PostgreSQL integration and serialized Chromium acceptance; unit tests alone are
not an acceptance claim. The local-only route does not publish this checkpoint
to origin. CI, release, deployment, production, external IdP,
invitations and checkpoint-03 remain out of scope.

PRT-004 adds a disposable source-package preview contour in its exact feature
worktree: one built Hono/Vite process, internal PostgreSQL, guarded
profile/binding lifecycle, readiness and SCN-003 evidence. PRT-006 keeps
provider visibility (`private|public`) independent from server-authoritative
registration (`closed|open`): hosted defaults are `private+closed`, local/test
defaults remain open, and `public+open` is rejected by the standard contour.
Exe.dev public sharing is a separate deploy gate and never bypasses application
login or workspace authorization.

## Local development

The project is a small TypeScript monorepo:

- pnpm workspaces;
- `apps/web` with React, Vite, Tailwind CSS, and shadcn/ui;
- `apps/api` with Hono;
- PostgreSQL with Drizzle ORM and migrations;
- Biome for formatting and linting;
- `tsc --noEmit` for type checking;
- Vitest and Playwright;
- deterministic guarded database migrate/reset/seed commands.

After `pnpm bootstrap`, use explicit profiles such as `pnpm db:reset --
--profile local --run-id SCN002` and `pnpm db:seed -- --profile local
--run-id SCN002`, then `pnpm dev`. Product routes start at
`/login`; `/foundation` remains the technical regression surface. The seeded
local/test accounts are documented by SCN-002 fixtures and must never be used as
production provisioning.

Canonical source checks are `pnpm quality`, `pnpm test:browser`,
`pnpm db:check -- --profile local` and `pnpm docs:check`. The built preview
contour is `pnpm preview:smoke -- --profile preview-checkpoint
--run-id <run-id>` or the full `pnpm scenario:preview` command. It builds one
Hono process serving the API and Vite SPA on one external port plus an internal
PostgreSQL service. The active checkpoint retains only its current exact
binding; eval-output and superseded checkpoint bindings are removed with
readback. The preview commands are source-package proof; they do not prove
Exe.dev or production behavior. `/api/config` is the application readback for
registration mode; provider visibility is read back separately with Exe.dev
`share show`.

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
