---
file: '.memory-bank/spec/system/index.md'
description: 'Source-backed карта системных границ dd-tasks через checkpoint-02-core и private preview runtime.'
purpose: 'Связывает web, HTTP authorization, server-side sessions, PostgreSQL persistence и one-port preview execution с проверками.'
version: '0.6.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'L1'
index_type: 'shallow'
coverage_depth: 1
parent: '.memory-bank/spec/index.md'
content_state: 'implemented_core'
canonical_template: '.memory-bank/mbb/c4-model.md'
implementation_files:
  - apps/api/src/app.ts
  - apps/api/src/auth/password.ts
  - apps/api/src/auth/session.ts
  - apps/api/src/core/service.ts
  - apps/api/src/db/schema.ts
  - apps/api/src/db/migrations.ts
  - apps/api/src/db/fixtures.ts
  - apps/api/src/db/runtime-profile.ts
  - apps/api/src/db/readiness.ts
  - apps/api/src/runtime.ts
  - apps/api/src/server.ts
  - Dockerfile
  - compose.preview.yml
  - apps/web/src/product/api.ts
  - apps/web/src/product/ProductApp.tsx
  - apps/web/src/product/AuthScreen.tsx
test_files:
  - apps/api/tests/password-session.test.ts
  - apps/api/tests/core.integration.test.ts
  - apps/api/tests/readiness.integration.test.ts
  - apps/api/tests/access-policy.test.ts
  - apps/web/src/product/ProductApp.test.tsx
  - apps/web/tests/browser/core.spec.ts
  - apps/web/tests/browser/preview.spec.ts
tags: [dd-tasks, system, checkpoint-02, preview, auth, workspace-isolation, readiness]
history:
  - version: '0.6.0'
    date: '2026-08-05'
    changes: 'Добавлены независимые provider visibility и server-authoritative registration policy, exact /api/config readback и fail-closed preview registration.'
  - version: '0.5.0'
    date: '2026-08-04'
    changes: 'Добавлен source-backed private preview runtime: one-port built Hono/Vite, internal PostgreSQL, exact profiles/bindings, readiness and immutable build metadata.'
  - version: '0.4.0'
    date: '2026-08-03'
    changes: 'Добавлены product HTTP/data/web boundaries, session lifecycle и API-enforced owner/member isolation.'
  - version: '0.3.0'
    date: '2026-08-02'
    changes: 'Принят local foundation contour checkpoint-01.'
---

# Системный слой

Система состоит из React/Vite browser surface, Hono API и project-owned
PostgreSQL. Cookie содержит opaque session token (`HttpOnly`, `SameSite=Lax`),
а БД — только SHA-256 token hash, expiry и revocation. Login атомарно отзывает
предыдущую активную session аккаунта; logout, tampering и expiry проверяются на
каждом запросе.

Все product routes имеют явный `workspaceId`. `CoreService` централизует
membership lookup, owner gate и active-project gate; UI role или URL никогда не
являются authority. Composite project scope и foreign key
`tasks(workspace_id, project_id)` не позволяют связать task с проектом другого
workspace даже при прямой записи.

Миграции forward-only применяются транзакционно под advisory lock и записывают
checksum ledger. Изменённая уже применённая migration отвергается. Reset/seed
доступны только exact loopback local/test profile и создают детерминированный
SCN-002 мир.

Public errors имеют стабильные `code`/`message`; unexpected internals не
выдаются клиенту. Product UI покрывает `/login`, `/register`, `/workspaces`,
project list/lifecycle и task CRUD с loading/empty/error/read-only states.
Foundation `/foundation` и его regression tests сохранены.

Preview execution использует один built Hono process: API namespace остаётся
JSON-only, а non-API routes отдают Vite SPA через тот же внешний port. Profiles
`local`, `test`, `preview-checkpoint` и `preview-eval-output` выбирают exact
database/host/world/compose/volume binding; preview destructive commands
отвергаются до SQL client при mismatch. `/api/health` означает liveness,
`/api/ready` дополнительно проверяет profile, migration ids/checksums, schema,
seed marker и baked source revision/artifact digest. Preview data disposable;
checkpoint restart и eval cleanup являются отдельными source-package claims.
Preview access has two independent axes. `PREVIEW_PROXY_VISIBILITY` is a
provider handoff input (`private|public`); `PREVIEW_REGISTRATION_MODE` is an
application input (`closed|open`) resolved on the server. Local/test default to
open registration, hosted preview profiles default to closed, and the standard
preview contour rejects `public+open`. `GET /api/config` returns only the
server-authoritative `registration_mode`; invalid policy returns `503 NOT_READY`.
Registration in closed mode is rejected before request-body validation and
account/session mutation. Provider share state is never inferred from this API
readback.
