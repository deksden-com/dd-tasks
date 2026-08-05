---
file: '.memory-bank/protocol/PRT-006-preview-access-policy/summary.md'
description: 'Problem-space specification для provider visibility и управляемой регистрации preview.'
purpose: 'Фиксирует безопасную матрицу режимов, scope, acceptance и handoff в plan без преждевременного technical design.'
version: '0.3.0'
date: '2026-08-05'
status: 'READY_FOR_MERGE'
c4_level: 'operations'
parent: '.memory-bank/protocol/PRT-006-preview-access-policy/index.md'
blocked_by_protocols: []
related_specs:
  - .memory-bank/spec/operations/deploy-policy.md
  - .memory-bank/spec/operations/preview-stages.md
  - .memory-bank/spec/operations/operational-access.md
  - .memory-bank/spec/operations/runbooks/exe-dev-preview.md
  - .memory-bank/spec/operations/runbooks/preview-runtime.md
related_scenarios:
  - .memory-bank/scenarios/SCN-003-private-preview-runtime.md
source_user_input:
  - .memory-bank/protocol/PRT-006-preview-access-policy/intake/user-input.md
continuation_prompt: 'plan.md'
implements_scope: 'Управляемая видимость Exe.dev preview и server-authoritative open/closed registration policy.'
tags: [protocol, specified, preview, visibility, registration, auth, security]
history:
  - version: '0.3.0'
    date: '2026-08-05'
    changes: 'CODE/readiness gate completed: clean source-package evidence, readiness assessment/review and project-specific acceptance passed with disclosed non-blocking gaps.'
  - version: '0.2.0'
    date: '2026-08-05'
    changes: 'Plan completed with explicit degraded aspect recovery: independent provider/application authority, API precedence, executable manifest handoff, stage/retry matrix and CODE/readiness gate are accepted.'
  - version: '0.1.0'
    date: '2026-08-05'
    changes: 'Создан protocol bootstrap и завершён requirements-gap pass; открытых blocking-вопросов нет.'
---

# PRT-006 — Preview access policy

## Protocol

```yaml
protocol:
  id: PRT-006-preview-access-policy
  title: Preview visibility and registration policy
  mode: normal
  current_stage: readiness
  stage_status: completed
  next_action: canonical fast-forward merge into main, post-merge checks and source delivery gate
  scope_sizing_verdict: single_executable_protocol
  stage_verdict: ready_for_merge
run_id: RUN-304-preview-access-policy
runtime_cli: degraded_unavailable
```

Одна цель протокола: сделать видимость hosted preview и возможность регистрации
явными, независимо управляемыми и проверяемыми параметрами, сохранив закрытые
безопасные значения по умолчанию и существующую application authentication.

## Workspace

```yaml
workspace:
  project_root: /Users/deksden/Documents/_Projects/dd-tasks
  protocol_location: feature_worktree
  integration_branch: main
  base_commit: 0099c93253c1e449621e05be654788d1a784be39
  feature_branch: feature/prt-006-preview-access-policy
  worktree_path: /Users/deksden/.dd-flow/projects/PRJ-018-dd-tasks/checkouts/worktrees/PRT-006-preview-access-policy/RUN-304-preview-access-policy/dd-tasks
  integration_branch_locked: false
```

Git route — `feature_worktree`; delivery strategy будущей реализации —
`feature_merge`. Этот protocol/specify pass не делает commit, push, tag, merge
или provider mutation.

## Problem and outcome

Сейчас Exe.dev runbook жёстко описывает private proxy, а приложение всегда
показывает и принимает регистрацию. Оператор не может выразить и доказательно
прочитать обратно два независимых решения для конкретного deploy:

1. доступен ли preview через Exe.dev proxy только авторизованным пользователям
   Exe.dev или публично в интернете;
2. может ли новый пользователь создать application account.

Результат должен дать оператору два явных входа — `proxy_visibility` и
`registration_mode` — и единый проверяемый handoff, не смешивая provider access
с application authentication.

## Actors

- deploy operator выбирает допустимую комбинацию и проверяет фактическое состояние;
- существующий пользователь входит в приложение независимо от provider visibility;
- новый пользователь видит регистрацию только там, где она явно разрешена;
- reviewer получает ровно тот уровень provider/application access, который зафиксирован запуском.

## Functional requirements

- `proxy_visibility` принимает только `private` или `public`; hosted preview по
  умолчанию остаётся `private`.
- `registration_mode` принимает только `closed` или `open`; hosted preview по
  умолчанию остаётся `closed`, а local/test сохраняют существующий открытый
  developer flow.
- Оба значения независимы в handoff и runtime readback; proxy state не считается
  доказательством registration state и наоборот.
- В режиме `closed` сервер отклоняет регистрацию до создания account/session;
  UI не предлагает sign-up, а прямой переход на `/register` показывает понятное
  закрытое состояние и путь на login.
- В режиме `open` существующий register flow сохраняет текущее поведение.
- UI получает режим из server-authoritative non-secret runtime state и при
  невозможности прочитать его ведёт себя как `closed`.
- Deploy runbook применяет запрошенный Exe.dev share mode и читает обратно exact
  mode; mismatch блокирует acceptance без fallback на другой режим.
- Application login и workspace authorization остаются обязательными при
  `private` и `public` visibility.

## Decision table

| proxy_visibility | registration_mode | Результат текущего контура |
| --- | --- | --- |
| `private` | `closed` | Hosted preview default; Exe.dev gate + application login, sign-up закрыт. |
| `private` | `open` | Допустим только как явный controlled-preview выбор; Exe.dev gate остаётся. |
| `public` | `closed` | Допустим только как явный выбор; application login остаётся, sign-up закрыт. |
| `public` | `open` | Не поддерживается этим протоколом: rollout отклоняется до mutation. |
| unknown/invalid | любое | Fail closed; deploy/runtime не принимается. |
| любое | unknown/invalid | Fail closed; registration не открывается. |

`public + open` исключён из стандартного контура, пока проект не получит
отдельно принятые abuse controls: как минимум подтверждённую eligibility-модель
(invite/verified domain) и защиту регистрационного endpoint. Синтаксическая
проверка email-домена без подтверждения владения адресом не считается таким
контролем.

## Scope

В scope:

- server-authoritative open/closed registration behavior;
- browser-visible login/register states;
- preview runtime/configuration binding и non-secret readback;
- Exe.dev runbook input для private/public share mode и exact readback;
- безопасная матрица комбинаций, tests/scenarios и Memory Bank updates;
- сохранение текущей application auth и owner/member/outsider isolation.

Вне scope:

- invite system, email verification и verified-domain registration;
- rate limiting, CAPTCHA, password reset, MFA, OAuth/SSO;
- изменение session/password primitives или workspace authorization;
- создание нового deploy CLI/control plane/provider abstraction;
- автоматический deploy текущего checkpoint в рамках CODE;
- публичная открытая регистрация.

## Acceptance story

Оператор берёт опубликованный immutable checkpoint, явно выбирает допустимую
пару visibility/registration и запускает стандартный preview deploy. Handoff
сохраняет оба значения. Provider readback подтверждает exact share mode, а
application readback — exact registration mode. В `public + closed` любой
посетитель видит login, не видит доступного sign-up, прямой `/register` сообщает
о закрытой регистрации, а register request получает безопасный отказ без
account/session mutation. Существующий fixture actor входит и работает как
раньше. Запрос `public + open`, неизвестное значение или readback mismatch
останавливают rollout до принятия.

## Acceptance criteria

- Hosted preview без явных overrides оказывается `private + closed`.
- Каждая допустимая пара имеет детерминированный config/API/UI test.
- Closed registration доказан и на UI, и прямым API запросом; DB/session mutation
  не происходит.
- Open registration сохраняет успешный и duplicate-email paths текущего API.
- Public visibility не ослабляет login, session или workspace authorization.
- `public + open`, invalid/missing protected input и provider/app readback
  mismatch отклоняются до accepted rollout.
- Deploy report показывает requested и observed visibility/registration без
  секретов и связывает их с exact run/checkpoint.
- Runbook не выполняет автоматический fallback между private/public.
- Документация и SCN-003 отражают обе оси и границы доказательства.

## Verification contour

- unit tests: profile defaults, parsing, invalid values and fail-closed behavior;
- API integration: open/closed registration, no mutation on closed, current
  login/session behavior unchanged;
- web unit/browser: hidden sign-up, direct closed route, open registration and
  config-read failure state;
- preview scenario: requested/observed registration binding plus existing role
  isolation; provider visibility remains deploy-time readback;
- docs/runbook checks: decision matrix, exact Exe share command per requested
  mode, no-fallback rule and value-free evidence;
- final readiness: project quality/docs/scenario gates, with live Exe.dev mutation
  owned only by a later explicitly authorized deploy flow.

## Requirements-gap result

```yaml
research_routing: focused_project
methods:
  - use_case_analysis: light
  - decision_table: full
  - misuse_cases: full
resolved_gaps:
  - GAP-001: provider visibility and application registration were conflated
  - GAP-002: hosted registration default was undefined
  - GAP-003: closed mode lacked direct-route and API rejection behavior
  - GAP-004: public plus open registration had no abuse-control boundary
  - GAP-005: requested settings lacked independent runtime/provider readback
open_questions: none
fixed_questions:
  - Q-001: proxy visibility is a deploy input; default private
  - Q-002: registration is a deploy input; hosted default closed

## Plan handoff

Plan, CODE and readiness reports are RUN-local provenance under
`.tasks/dd-flow-runs/RUN-304-preview-access-policy/`; this durable summary and
its traces carry the accepted decisions without requiring that ignored folder.
CODE and readiness are `ready_for_merge` with explicit non-blocking generic
maturity gaps and file-only dd-flow CLI degradation. Fresh project-specific
gates and source-package scenarios passed on clean feature HEAD
`e2f8eee4e7200f2b65d14cf2399b92e140d3df0f`; the source artifact digest is
`sha256:b4e6e1fa9ee7a6f606a9624ad63e71b5e1a39da0b9d01010aba3ee60346cc665`.
`DEF-MBU-RUNTIME-ACTIVE-STATE` remains `not_touched`. Merge, remote checkpoint
delivery and provider mutation are still required and are not claimed here.
```

## Design aspects

`web_ui_surface` применим: accepted defaults включают explicit closed/error
state, keyboard/focus/labels, responsive behavior и browser evidence. Новый
design system или экран настроек не требуется: меняется только auth surface,
который уже существует.

## Policy context

Прочитаны `.memory-bank/project-policy.md`, operations index, deploy/access/
secrets policies, preview stages, base/provider runbooks и SCN-003.
`DEF-MBU-RUNTIME-ACTIVE-STATE` классифицирован как `not_touched`: этот flow не
мигрирует runtime/home primary data и потому DEF не блокирует файловый
protocol/specify. Provider mutation, remote checkpoint delivery и live
public/private readback остаются последующими gates, а не частью specify.

## Handoff

`plan.md` должен подготовить минимальный сквозной change set без новой
зависимости, DB migration, deploy CLI или domain-allowlist abstraction. План
обязан связать runtime/API/UI/Compose/runbook/tests и сохранить отдельное
provider/application evidence для обеих осей.
