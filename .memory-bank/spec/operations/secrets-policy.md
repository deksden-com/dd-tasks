---
file: '.memory-bank/spec/operations/secrets-policy.md'
description: 'Source-backed secret and value-handling policy for local/test and private preview contours.'
purpose: 'Разделяет public fixture defaults, operation-scoped preview credentials и immutable value-free evidence boundary.'
version: '0.3.0'
date: '2026-08-04'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/operations/index.md'
canonical_template: '.memory-bank/mbb/templates/secrets-policy.md'
applicability_status: 'applicable_local_and_preview'
related_runbooks:
  - .memory-bank/spec/operations/runbooks/workspace-bootstrap.md
  - .memory-bank/spec/operations/runbooks/preview-runtime.md
  - .memory-bank/spec/operations/runbooks/exe-dev-preview.md
related_protocols:
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md
  - .memory-bank/protocol/PRT-004-exe-preview-runtime/index.md
tags: [dd-tasks, operations, secrets, local, preview, value-free]
history:
  - version: '0.3.0'
    date: '2026-08-04'
    changes: 'Добавлены operation-scoped actor secrets для private preview; committed local demo password не является hosted-preview credential.'
  - version: '0.2.0'
    date: '2026-08-02'
    changes: 'Policy promoted with implementation/readiness bootstrap receipts; no external secret requirement remains source-backed not_applicable.'
---

# Secrets и local configuration

## Applicability

Политика различает два контура:

- local/test используют непроизводственные deterministic fixture defaults для
  локального PostgreSQL и SCN-002; они не являются hosted credentials;
- `preview-checkpoint` и `preview-eval-output` получают operation-scoped actor
  passwords (`PREVIEW_OWNER_PASSWORD`, `PREVIEW_MEMBER_PASSWORD`,
  `PREVIEW_OUTSIDER_PASSWORD`) и PostgreSQL password только через одноразовый
  scenario/run environment. Эти значения не коммитятся, не baked в image и не
  записываются в logs, receipts или evidence.

`applicability_status: applicable_local_and_preview` не означает, что Exe.dev
identity, team, VM token или share credential уже известны. Такие inputs остаются
fresh gates отдельного `deploy.md` и provider mutation в CODE не выполняется.

## Разрешённые inputs и destinations

- `.env.example` и local compose defaults могут содержать только public fixture
  values; реальные `.env`, tokens, keys и machine-specific paths не коммитятся;
- preview one-shot `seed` принимает только named actor variables после exact
  profile/run/world/compose/volume guard и до открытия SQL client;
- image metadata содержит только source revision, artifact digest, build run и
  timestamp; оно не содержит passwords, cookies, session tokens или provider
  credentials;
- receipt/report хранит class, destination, readiness, cleanup и redaction
  status, но не values и value-derived hashes.

Committed `DEMO_PASSWORD`/local demo credentials запрещены как hosted preview
credentials. Login proof для preview использует случайные operation-scoped
values; cleanup уничтожает exact disposable volume when the profile requires
it, and superseded checkpoint volumes are removed only after an accepted
replacement and exact readback.

## Bootstrap and cleanup

Bootstrap не запрашивает values, не выполняет login/refresh/context switching и
не читает произвольные `.env*`. Preview scenario создаёт credentials in-memory,
передаёт их только compose/one-shot/browser process-ам и очищает exact compose
project и volume. Если cleanup/readback не подтверждён, scenario/readiness
переходит в failure, а не объявляет private preview accepted.
