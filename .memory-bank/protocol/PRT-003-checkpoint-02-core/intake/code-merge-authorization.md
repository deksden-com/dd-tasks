---
file: '.memory-bank/protocol/PRT-003-checkpoint-02-core/intake/code-merge-authorization.md'
description: 'Нормализованное продолжение user authorization для CODE, readiness и canonical merge.'
purpose: 'Сохраняет границы нового поручения, которое supersedes прежний pre-CODE stop boundary.'
version: '0.1.0'
date: '2026-08-03'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/protocol/PRT-003-checkpoint-02-core/index.md'
tags: [protocol, intake, code, readiness, merge, authorization]
---

# CODE → readiness → merge authorization

Источник: delegated continuation, `source_thread_id=019fb9e5-2ecd-79e0-b5a3-2f9d9aac1624`.

Пользователь явно поручил выполнить все 17 items `PLAN-003`, полный canonical
CODE, fresh readiness с исправлением findings и затем без промежуточной остановки
canonical merge в local stable `main`. Это поручение заменяет только прежний
pre-CODE stop boundary; historical SPECIFY/PLAN intake и RUN-297/RUN-298 audit
сохраняются.

Разрешены feature commit(s), local main integration и exact checkpoint name
`checkpoint-02-core`, если canonical fixation policy требует tag. Force,
published-history rewrite и destructive cleanup запрещены. Non-force remote
publish разрешён только если canonical policy/readback делает его частью merge
closure; иначе remote остается material user gate. CI setup, Exe.dev/deploy и
checkpoint-03 не входят в scope.
