---
file: '.memory-bank/spec/operations/workspace-bootstrap-policy.md'
description: 'Source-backed project-owned политика подготовки workspace для foundation tooling.'
purpose: 'Назначает один безопасный bootstrap entrypoint и границы его применения до запуска кода, тестов и сборки.'
version: '0.2.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/spec/operations/index.md'
canonical_template: '.memory-bank/dd-flow/common/workspace-bootstrap.md'
related_runbooks:
  - .memory-bank/spec/operations/runbooks/workspace-bootstrap.md
related_protocols:
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md
evidence_files:
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/trace/20260802T014200+0200-readiness-bootstrap.md
tags: [dd-tasks, operations, workspace-bootstrap, foundation]
history:
  - version: '0.2.0'
    date: '2026-08-02'
    changes: 'Переведена из plan-owned handoff в source-backed policy после materialization canonical script и implementation receipt; readiness reuse/invalidation остаётся обязательным.'
---

# Политика bootstrap workspace

## Статус и владелец

Политика является source-backed частью `PRT-001-checkpoint-01-foundation`: canonical script материализован и implementation receipt подтверждает успешный bootstrap в exact feature worktree. Отдельная readiness receipt должна подтверждать freshness для текущего checkout перед любым readiness-owned project tooling.

- owner: project engineering / текущий foundation protocol;
- applies_to: concrete feature worktree перед install, migration, test, build и browser tooling;
- current delivery contour: local-only;
- production/beta/deploy/release/publish: не применяются к этой волне.

## Canonical entrypoint

Единственный entrypoint для code/readiness bootstrap:

```text
bash .memory-bank/spec/operations/scripts/bootstrap-workspace.sh
```

Скрипт создан как первый implementation item в code и запускается только после того, как его source и root manifests прочитаны без выполнения другого project tooling. Расширенные инструкции и критерии находятся в [workspace bootstrap runbook](runbooks/workspace-bootstrap.md).

## Обязательные свойства

- idempotent: повторный запуск не удаляет пользовательские данные и использует frozen lockfile после его появления;
- local-only: допускается поднять изолированный локальный PostgreSQL через Docker Compose;
- no secrets: foundation использует только публично объявленные local/test defaults; production credentials и произвольные `.env*` не копируются;
- no destructive migration: reset/drop выполняется отдельной явной командой и только после safety guard local/test;
- no external mutation: не выполняются deploy, publish, release, remote Git или protected provider operations;
- receipt: CODE writes the deterministic readiness receipt to `<run-home>/05-code/workspace-readiness.json`; PROTOCOLIZE only creates the checkout and copies policy-allowed ignored files;
- readiness check: package manager/toolchain, dependency install, local database availability и tracked generated inputs должны быть подтверждены value-free evidence.

## Reuse and invalidation

Receipt можно переиспользовать только для того же concrete workspace path, repository identity, branch/commit и тех же manifests, lockfile, toolchain declarations, policy, runbook и script. Изменение любого из этих public inputs требует revalidation или нового bootstrap.

## Плановая миграция политики

До этого протокола project policy фиксировала отсутствие project-owned commands/runbooks. Этот документ и runbook являются scoped policy migration: они закрывают workspace-bootstrap contract для foundation, но не создают постоянную release/CI policy. Любое reuse требует совпадения workspace identity и public inputs, а изменение policy/runbook/script invalidates receipt.
