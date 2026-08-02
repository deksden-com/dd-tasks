---
file: '.memory-bank/spec/operations/secrets-policy.md'
description: 'Active source-backed policy for the foundation workspace: no external secrets are required.'
purpose: 'Разделяет отсутствие secret requirement от неописанной политики и задаёт value-free evidence boundary.'
version: '0.2.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/operations/index.md'
canonical_template: '.memory-bank/mbb/templates/secrets-policy.md'
applicability_status: 'not_applicable'
related_runbooks:
  - .memory-bank/spec/operations/runbooks/workspace-bootstrap.md
related_protocols:
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md
tags: [dd-tasks, operations, secrets, local-only, foundation]
history:
  - version: '0.2.0'
    date: '2026-08-02'
    changes: 'Policy promoted with implementation/readiness bootstrap receipts; no external secret requirement remains source-backed not_applicable.'
---

# Secrets и local configuration

## Applicability

Для `PRT-001-checkpoint-01-foundation` secret-bearing configuration не требуется: работа локальная, внешние provider operations и production data не затрагиваются, а PostgreSQL fixture credentials принадлежат только изолированному local Docker service. Статус `not_applicable` относится к external secrets, не к общему правилу «никогда не записывать значения».

- applicability_status: `not_applicable`;
- scope: local/test foundation workspace;
- owner: project engineering;
- review trigger: появление auth, external provider, hosted environment или non-public credential.

## Разрешённые публичные inputs

- `.env.example` может содержать только локальные fixture defaults без production identity или token;
- `docker-compose.yml` может задавать непроизводственные local/test database defaults;
- реальные `.env`, tokens, keys и machine-specific paths не коммитятся и не копируются bootstrap script-ом;
- receipt/report хранит только class, destination, readiness и cleanup status, без значений и value-derived hashes.

## Bootstrap behavior

Bootstrap не запрашивает значения секретов, не выполняет login/refresh/context switching и не читает произвольные `.env*`. Если будущая code wave введёт обязательный credential, она должна сначала изменить applicability, authoritative source, allowlisted destination, permission/readback и blocker behavior в этой политике.

## Cleanup

Local Docker volume cleanup выполняется только явной `db:down`/reset операцией в local/test contour. Удаление worktree или внешних credentials этой волной не выполняется.
