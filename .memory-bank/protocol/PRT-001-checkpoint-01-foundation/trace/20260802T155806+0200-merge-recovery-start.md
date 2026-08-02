---
file: '.memory-bank/protocol/PRT-001-checkpoint-01-foundation/trace/20260802T155806+0200-merge-recovery-start.md'
description: 'Старт fallback merge recovery для прямой Git fixation checkpoint-01-foundation.'
purpose: 'Фиксирует исходные refs, accepted readiness, сохранённый cancelled queue evidence и user-authorized degraded route до runtime/document mutations.'
version: '0.1.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md'
related_files:
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/summary.md
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/trace/20260802T024600+0200-merge-integration-gate.md
  - README.md
  - .memory-bank/project-policy.md
tags: [protocol, trace, merge-recovery, fallback, checkpoint-01]
history:
  - version: '0.1.0'
    date: '2026-08-02'
    changes: 'Начат user-authorized degraded direct Git fixation после cancelled queue item 185 и requeue completion defect в CLI 0.4.0.'
---

# Старт fallback merge recovery

- timestamp: `2026-08-02T15:58:06+02:00`
- prompt: fallback merge recovery для `PRT-001-checkpoint-01-foundation`
- protocol: `PRT-001-checkpoint-01-foundation`
- stable_project_root: `/Users/deksden/Documents/_Projects/dd-tasks`
- workspace: stable `main`
- branch: `main`
- exact_head: `e60810c6ebcdb22656ed2c19eef19a1c5685b923`
- origin_url: `https://github.com/deksden-com/dd-tasks.git`
- origin_main_lease_expected: `739fd2bc3665257f70e9680bce2abf17144a146f`
- origin_main_readback_at_start: `739fd2bc3665257f70e9680bce2abf17144a146f`
- feature_integration_commit: `a03169559e60767042c9a39829adae9f9ff8228f`
- readiness: `RUN-004-prt-001-checkpoint-01-foundation-readiness` — `done/accepted`
- protocol_before: `ready_for_merge`
- queue_before: item `185`, `cancelled`; historical failed/requeue evidence preserved
- locks_and_sessions_before: merge worker clear; no active locks or sessions
- cleanup_scan_before: no repair actions
- local_checkpoint_tag_before: absent
- remote_checkpoint_tag_before: absent
- cli: `/Users/deksden/Library/pnpm/dd-flow`, `@deksden-com/dd-flow-cli 0.4.0`, compatibility `ok`
- memory_write_preflight: CLI probe hung without output; safe manual fallback passed for tracked Memory Bank/README and `.tasks` directories, with temporary probes removed

## Authorized route

Пользователь явно выбрал fallback-вариант 2:

- не исправлять `dd-flow` CLI 0.4.0 сейчас;
- обойти только сломанный requeue/merge-queue completion contour;
- выполнить прямую Git fixation на stable `main`;
- создать annotated tag `checkpoint-01-foundation` на финальном closure commit;
- push `main` в `origin/main` и tag в `origin` без force;
- после фактического readback закрыть protocol через штатный `dd-flow protocol transition ... --to closed`;
- runtime state не редактировать вручную.

## Scope boundaries

- Не запускать product/readiness повторно.
- Не заявлять CI, deploy, release, production или remote verification до фактического доказательства.
- Не удалять refs, не force-push, не удалять feature branch/worktree без canonical ownership/need.
- Исторический queue item `185` и его cancelled audit evidence сохраняются.
- Все runtime mutations выполняются через `dd-flow` CLI; tracked Memory Bank/README/trace изменяются обычным Git working-tree контуром.

## Next action

Создать новый CLI-owned `RUN-*` и merge-recovery stage, затем подготовить source-backed closure evidence и повторить exact ref preflight перед каждой следующей mutation.
