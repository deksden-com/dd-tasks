# Фаза 3: эксплуатация, ветки и выкладка

Прочитай общие правила:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/sdlc-contours.md`
- `.memory-bank/dd-flow/common/policy-presets.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/workspace-bootstrap.md`
- `.memory-bank/dd-flow/common/closure.md`
- `.memory-bank/dd-flow/common/goal-traceability.md`
- `.memory-bank/dd-flow/common/flow-flags.md`

Затем прочитай в MBB:

- `.memory-bank/mbb/operations-release-guide.md`
- `.memory-bank/mbb/spec-layer-guide.md`
- `.memory-bank/mbb/scenario-docs-guide.md`
- `.memory-bank/mbb/verification-matrix-guide.md`
- `.memory-bank/mbb/named-deferrals-guide.md`
- `.memory-bank/mbb/cross-references.md`

## Язык пользовательских артефактов

Зафиксируй `target_language` по `common/style.md`. Все пользовательские summaries, плановые документы, dashboard-и, final reports и visible user-facing content пиши на `target_language`; внутренние task packets, raw evidence, JSON keys, code identifiers и HTML/CSS/JS templates могут оставаться английскими.

Твоя задача - проверить и прописать, как протокол проходит путь от рабочей ветки до приемки на нужном контуре.

Запиши start trace по `common/trace.md` в активный протокол. Если доступен `dd-flow` CLI, зарегистрируй planning session по `common/runtime-cli.md`: `flow_kind: planning`, `continuation_policy: go_router`, `current_stage: f3_ops`, `next_action: git/delivery plan`.

Эксплуатационный план должен показывать, на каком вороте (gate) операционная цель считается доказанной: локально, на ветке фичи (feature branch), после слияния (merge), на бета-стенде (beta) или только перед продуктовым окружением (production).

Раздели контуры:

- Git policy and worktree/branch/PR/merge queue route;
- Git delivery/fixation strategy: how the result becomes durable or is honestly handed off (`direct_commit`, `direct_commit_push`, `feature_merge`, `pull_request`, `merge_queue`, `squash_merge`, `rebase_ff`, `release_branch`, `external_handoff`, `local_only`, `no_git`);
- environment/stage policy and target stages;
- release policy and changelog/versioning impact, including changelog target matrix for every affected repository/package/artifact/release surface;
- deploy/publish policy and whether delivery is in scope now;
- verification policy, evidence contour and next gate;
- runbooks that execute the operation.

If the task creates or materially changes a release, deploy, publish, migration, rollback, backup/restore or comparable DevOps operation, plan must decide whether an operator runbook is required or updated. New or substantially rewritten runbooks use `.memory-bank/mbb/templates/devops-runbook-base.md` plus the relevant overlay template, and the plan must name any missing operational facts as `DEF-*` instead of inventing approval, access, backup, rollback or secret details.

В plan report запиши applied `policy_context`:

- source links: project-policy, spec/operations, check profiles, scenarios, active DEF;
- `git.workspace_route` and `git.delivery_strategy`;
- required evidence for closure, including commit/push/PR/queue evidence;
- check profiles and CI/degraded status;
- release/deploy/publish next gates;
- questions, blockers and DEFs created from policy gaps.

Если контур неприменим, запиши `not_applicable_reason`. Если контур неясен и влияет на текущий gate, задай вопрос или создай blocker. Если неясность переносится на будущий gate, оформи `DEF-*`.

## Применение flow profile

Используй `flow_profile` как обязательный вход:

- `route.git: integration_branch_direct` - опиши, почему работа идёт прямо в интеграционной ветке и какие preflight-проверки удерживают безопасность;
- если `route.git: integration_branch_direct`, отдельно выбери `policy_context.git.delivery_strategy` (`direct_commit`, `direct_commit_push`, `local_only` or `no_git`) and state what evidence makes closure honest;
- `route.git: feature_worktree` - проверь, что протокол уже находится в feature-worktree, и опиши feature-ветку, рабочее дерево, workspace bootstrap, merge и cleanup;
- `route.delivery` - опиши ровно тот контур, до которого доводится работа: local, preview, beta или production;
- `route.ci` - опиши, когда CI является gate, а когда только следствием push/PR;
- `impact.operations` - проверь, не нужны ли изменения `spec/operations`;
- `evidence.level` - опиши, какой rollout/evidence след должен сохраниться;
Если выбран `feature_worktree`, рабочее дерево создаётся на старте протокола и становится основной рабочей зоной планирования, реализации и проверки. Фаза 3 не должна откладывать создание worktree "на потом"; она проверяет, что ранний Git-контур уже материализован, или фиксирует блокер.

Для каждого concrete checkout, который следующий flow будет изменять или использовать для project tooling, заполни compact `workspace.bootstrap` handoff по `common/workspace-bootstrap.md`: requirement, policy source, canonical entrypoint, owning runbook, producer/gate, planned receipt path and candidate receipt. Receipt fields, statuses, reuse/invalidation и blocker/DEF semantics не повторяй в operations plan.

Если проектная политика требует beta после merge, `route.delivery` не может оставаться `local` без объяснения или решения пользователя.

## Что исследовать

Изучи проектный Банк памяти и репозиторий:

- какой предварительный контроль (preflight) нужно выполнить перед изменениями: ветка, удалённая ветка, `git status`, подготовленные (staged) и неподготовленные (unstaged) изменения, чужие правки, секреты и локальная готовность;
- находимся ли уже в рабочем дереве (worktree), подмодуле (submodule) или обычном checkout;
- какая ветка является интеграционной;
- какая ветка является веткой продуктового окружения (production);
- как создаются ветки фич (feature branches) или рабочие деревья;
- где размещаются рабочие деревья и игнорируются ли `.worktrees/` или `worktrees/`;
- когда создаётся черновой запрос на слияние (draft pull request);
- какие проверки запускаются локально;
- какие проверки запускаются в непрерывной интеграции (CI);
- какие окружения есть: предварительное (preview), бета (beta), промежуточное (staging), продуктовое (production);
- как выполняются миграции, резервные копии (backup), начальные данные (seed), откат (rollback);
- какие секреты и внешние провайдеры участвуют;
- где project policy маршрутизирует canonical workspace bootstrap entrypoint и secrets policy, и какой stage будет producer-ом receipt;
- когда пуш (push) оправдан, а когда он только запускает лишнюю сборку.

Если проектных правил нет, предложи разумную политику и запланируй её фиксацию в `spec/operations/`.

## Что прописать в протоколе

Опиши:

- стартовую ветку и правила подготовки;
- результат предварительного контроля (preflight): с какой ветки стартуем, что уже изменено, что коммитим до реализации, что не трогаем;
- baseline проверок до реализации: что запущено, что прошло, что уже падало и почему;
- как отделять текущие изменения от чужих или пользовательских;
- нужно ли создавать ветку фичи или рабочее дерево;
- где уже создан или должен быть создан протокол относительно выбранного Git-контура;
- как не создать вложенное рабочее дерево, если изоляция уже есть;
- как именовать ветку;
- какой compact workspace bootstrap handoff передаётся следующему gate по `common/workspace-bootstrap.md`;
- где хранить `.tasks/`;
- когда делать коммиты;
- нужен ли стартовый документационный коммит перед реализацией, если протокол, спецификации или правила уже приняты и должны стать устойчивой точкой начала;
- когда делать пуш (push);
- какие проверки непрерывной интеграции (CI) и хостинговые проверки ожидаются;
- какие стендовые сценарии нужны;
- какой пакет доказательств выкатки (rollout evidence bundle) должен быть сохранён;
- какие строки матрицы цели и ограничений закрываются локальными проверками, непрерывной интеграцией (CI), предварительным окружением (preview), бета-стендом (beta) и допуском к продуктовому окружению (production approval);
- какая передача на откат (rollback handoff) нужна: что откатываем, кто владелец, какие команды или действия безопасны;
- что является готовностью к интеграции;
- что является бета-приемкой (beta acceptance);
- что блокирует продуктовое окружение (production).
- кто владеет рабочей веткой и рабочим деревом, при каких условиях их можно удалить после merge или discard.

Если проект использует `dd-flow` CLI, проверь механическое состояние через CLI, а не только через prose: project status, активный protocol, workspace/worktree, lanes/locks и merge queue policy. Эксплуатационные gate, worktree bootstrap, ready-for-merge и cleanup должны быть отражены в CLI plan graph, если они обязательны для этого протокола.

## Уроки и инсайты

Пропиши в протоколе, что все неожиданные полезные выводы фиксируются в `.tasks/` как уроки (lessons learned) или инсайты (insights), а затем важное поднимается в Банк памяти по правилам MBB.

## Результат

В протоколе зафиксируй:

```text
стадия проработки протокола: фаза 3 выполнена
```

Итоговый доклад должен начинаться с навигационного блока из `.memory-bank/dd-flow/common/style.md` и объяснять не только набор команд, но и логику контуров: что доказывает ветка, что доказывает непрерывная интеграция (CI), что доказывает бета-стенд (beta), какие ворота остаются дальше.

В докладе укажи `trace_start`, `trace_report` и состояние runtime CLI, если он используется.
