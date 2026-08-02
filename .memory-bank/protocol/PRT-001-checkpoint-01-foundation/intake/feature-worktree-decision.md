---
file: '.memory-bank/protocol/PRT-001-checkpoint-01-foundation/intake/feature-worktree-decision.md'
description: 'Новый буквальный пользовательский input/decision о feature worktree для PRT-001.'
purpose: 'Сохраняет provenance исправления Git-контура отдельно от первоначального INPUT-001.'
version: '0.1.0'
date: '2026-08-01'
status: 'ACTIVE'
parent: '.memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md'
related_protocols:
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/summary.md
tags: [protocol, source-user-input, INPUT-002, git, feature-worktree]
history:
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Сохранено явное решение пользователя исправить protocol bootstrap на feature worktree.'
---

# Raw user input / decision

- `input_id`: `INPUT-002`
- `timestamp`: `2026-08-01T17:44:53+02:00`
- `source`: `codex_delegation.input`
- `source_thread_id`: `019fb9e5-2ecd-79e0-b5a3-2f9d9aac1624`
- `protocol_id`: `PRT-001-checkpoint-01-foundation`
- `decision`: `route.git = feature_worktree`
- `decision_scope`: protocol bootstrap correction; delivery/fixation strategy remains a separate future gate
- `supersedes`: none; `INPUT-001` preserved unchanged
- `run_id`: `N/A - dd-flow CLI unavailable; no run registered`

Ниже сохранён новый содержательный пользовательский ввод без переписывания `INPUT-001`:

> Независимое ревью protocol stage выявило must-fix. Пользователь сейчас явно выбрал Git-контур: feature worktree (recommended). Исправь только protocol bootstrap и снова остановись перед specify; downstream-стадии не запускай, не коммить, не пушь и не создавай/не двигай теги.
>
> Перед исправлением перечитай точные правила:
> - .memory-bank/dd-flow/common/protocol-bootstrap.md, Git contour;
> - .memory-bank/dd-flow/common/git-ops.md, особенно строки о canonical feature_worktree для многозонной/длинной работы и о том, что долговечный PRT должен жить в том же контуре;
> - .memory-bank/dd-flow/protocol.md, запрет задавать пользователю solution-space/organizational вопросы.
>
> Must-fix:
> 1. Foundation — многозонная существенная работа, поэтому integration_branch_direct был выбран неверно. Безопасно перенеси весь незакоммиченный protocol diff из stable main в отдельную feature branch/worktree, используя канонический project-scoped service checkout layout из common/workspace-layout.md. Не теряй изменения: используй recoverable migration и проверь содержимое до очистки исходного checkout. Stable /Users/deksden/Documents/_Projects/dd-tasks должен стать чистым на main@739fd2bc3665257f70e9680bce2abf17144a146f; все protocol-изменения должны находиться только в новом worktree. Выбери conventional branch, связанную с PRT-001. Не создавай runtime state и не изображай dd-flow ownership, если CLI отсутствует; честно запиши physical/manual degraded ownership и cleanup policy в разрешённый evidence/trace.
> 2. Зафиксируй новый явный пользовательский input/decision о feature worktree с корректным provenance. Не переписывай INPUT-001 задним числом.
> 3. Обнови summary/start/report/index так, чтобы workspace_path, feature_branch, route.git, base commit, integration branch, delivery state и session-boundary handoff были фактическими и непротиворечивыми.
> 4. Исправь initial gaps/questions:
>    - Playwright и root e2e уже обязательны по README; агент должен принять минимальный deterministic Playwright smoke как foundation evidence, а не спрашивать пользователя.
>    - конкретные root command names и PostgreSQL local/test contour — solution-space решения specify/plan; агент должен предложить conventional минимальный вариант, а не спрашивать пользователя.
>    - durable companion specs/document promotion определяются MBB и source-backed результатом; это обязанность flow, не пользовательский вопрос.
>    - Git route закрыт явным решением пользователя: feature_worktree. Delivery/fixation strategy может оставаться отдельным будущим gate, но не маскируй её под problem-space Q.
>    Оставь open user questions только если после этого реально остаётся problem-space ambiguity.
> 5. runtime_cli_degraded не называй текущим blocker, если разрешённый file-only path позволяет продолжить specify/plan. Раздели current blockers и operational degradation/future gated mutations.
> 6. Для тегов запиши не только annotated tag object ids, но и peeled commit targets, чтобы evidence не вводил в заблуждение.
> 7. Повтори mb-lint, git diff --check, relative-link/navigation/frontmatter/scope checks. Отдельно докажи: stable main clean; worktree branch/path/base; только ожидаемые незакоммиченные protocol-файлы в worktree; теги неизменны; specify/plan/code не запускались.
>
> В финале дай точный worktree path и branch, перечень исправлений, проверки и следующий шаг. Затем остановись перед specify.
