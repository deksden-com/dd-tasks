# Git, окружения и приемка

Перед операциями с Git изучи проектные правила в `.memory-bank/spec/operations/` или ближайшем аналоге. Если правил нет, зафиксируй разумную политику в протоколе и предложи обновление Банка памяти.

Для dd-flow-managed service checkouts также прочитай `workspace-layout.md`. Канонический service checkout root находится под `~/.dd-flow/projects/<PRJ-ID-slug>/checkouts/`.

Если выбранный checkout будет изменяться или использоваться для project code/tests/build/package/tooling, применяй канонический gate из `workspace-bootstrap.md`. Этот файл определяет Git-контур; status, receipt, reuse, invalidation, secrets evidence и blocker/DEF semantics определены только в `workspace-bootstrap.md`.

## Связь с flow profile

Git-режим задаётся в `flow_profile.route.git`:

- `integration_branch_direct` - работай прямо в основной интеграционной ветке после обязательного Git-preflight. Это допустимо для маленькой безопасной правки или проекта без сложного Git-flow, если проектная политика не требует feature-ветку.
- `feature_worktree` - на старте протокола создай или используй отдельную feature-ветку в рабочем дереве (worktree). Это канонический режим для рискованных, длинных, контрактных, многозонных или требующих merge/PR работ.

Git-preflight не является флагом и выполняется всегда, независимо от `route.git`.

Рабочее дерево (worktree) не означает параллельность. Для нас это способ безопасно вести весь протокол в feature-ветке. Если `route.git: feature_worktree`, основная реализация должна идти в этом рабочем дереве до `readiness/integration` и merge.

## Route vs delivery fixation

Не смешивай Git route и доказательство доставки.

- `route.git` / `policy_context.git.workspace_route` показывает, где выполнялась работа: `integration_branch_direct` или `feature_worktree`.
- `policy_context.git.delivery_strategy` показывает, как результат фиксируется или передаётся дальше: `direct_commit`, `direct_commit_push`, `feature_merge`, `pull_request`, `merge_queue`, `squash_merge`, `rebase_ff`, `release_branch`, `external_handoff`, `local_only` или `no_git`.

Для tracked durable changes в Git-backed проекте терминальный результат `merged/closed` допустим только при реальном evidence выбранной стратегии:

- `direct_commit` - commit SHA в интеграционной ветке;
- `direct_commit_push` - commit SHA плюс push/remote evidence;
- `feature_merge`, `squash_merge`, `rebase_ff` - result commit reachable from target branch;
- `pull_request` - PR merge/closed state and target evidence according to project policy;
- `merge_queue` - queue completion plus result commit/target evidence;
- `external_handoff` - handoff evidence, but not `merged`;
- `local_only` - honest local-only status, but not `merged`;
- `no_git` - no Git fixation evidence required, with reason.

Запрещённые placeholder evidence для `merged/closed`: `pending_batch_commit`, любые `pending_*`, `todo`, `not_yet`, empty commit fields or dirty worktree without a local-only verdict.

## Unified Git Operation Context

Перед любым mutating Git operation (`commit`, `tag`, `push`, `merge`, `rebase`, PR/queue handoff, branch/worktree cleanup or release Git fixation) собери один и тот же контекст. Это единый Git-контур для SDLC, delivery and Memory Bank operation flows.

Если операция обращается к внешнему Git provider/remote authority, до mutation также выполни `.memory-bank/dd-flow/common/operational-access.md`. Разрешение должно дать ровно один operation-scoped binding для remote/organization/repository/branch operation, а safe readback должен подтвердить expected identity, authority and target. Missing session, zero/duplicate/ambiguous binding, mismatch, unobservable authority, stale approval or freshness drift block before mutation. Не выполняй auto-login, credential refresh, account/organization switch, remote rewrite or context switch.

Обязательный контекст:

- `project_root`, Memory Bank root, active `PRT-*` or `RUN-*`, current flow stage;
- project Git policy source: `.memory-bank/project-policy.md`, `.memory-bank/spec/operations/*`, runbook, `README`/`CONTRIBUTING`, CI config or explicit user decision;
- current branch, upstream, base commit, worktree path, dirty state and pre-existing changes;
- integration/continuation branch;
- route/workspace model: `integration_branch_direct`, `feature_worktree`, upgrade branch, PR/queue handoff, external handoff, local-only or no Git;
- delivery/fixation strategy: `direct_commit`, `direct_commit_push`, `feature_merge`, `pull_request`, `merge_queue`, `squash_merge`, `rebase_ff`, release tag/object, deploy/publish readback, `external_handoff`, `local_only` or `no_git`;
- required evidence before terminal claim: commit SHA, push/readback, tag/release object, PR/queue result, deploy/publish readback or honest non-merged/non-delivered status;
- branch/worktree cleanup and retention policy when the operation owns disposable resources;
- expected continuation branch after merge/delivery;
- commit trace tag to use if the operation creates a commit.
- `operational_access` preflight result for externally protected Git mutation, or explicit project-policy-backed `not_required` for a local-only operation.

Если любой пункт невозможно определить and it affects the current gate, stop and ask, create/update a scoped `DEF-*`, or return an honest non-terminal handoff. Do not silently invent project Git policy.

Read-only flows (`mb-audit`, `mb-lint`, review, scouts) still report Git state when relevant, but they do not need a commit trace tag unless they create Git fixation as part of an explicit fix or delivery path.

## Протокол и Git-контур

Протокол (protocol) является рабочей сессией задачи, поэтому он должен создаваться в том Git-контуре, где будет выполняться работа.

Правило:

- `route.git: integration_branch_direct` - протокол создаётся или обновляется в текущей интеграционной ветке после Git-preflight; для микроправки это короткий `summary.md`, а не полный протокол с графом задач;
- `route.git: feature_worktree` - сначала создаётся или выбирается feature-ветка в отдельном рабочем дереве (worktree), затем протокол создаётся уже внутри этого рабочего дерева;
- не создавай долговечный `protocol/PRT-*` в интеграционной ветке, если уже понятно, что работа должна идти в feature-worktree;
- если до создания worktree нужно сохранить черновые выводы `prime`, используй `.tasks/`, а после входа в feature-worktree перенеси итоговое понимание в протокол.

Это нужно, чтобы протокол, план, изменения, проверки, evidence и последующий merge принадлежали одной ветке. Иначе будущий агент видит протокол в интеграционной ветке, а фактическая работа живёт отдельно, и трассировка ломается.

Обратная ошибка тоже важна: не создавай feature-worktree, bootstrap и большой протокол для маленькой безопасной правки, если проектная политика не требует этого. Git-flow должен соответствовать масштабу задачи.

Если фактическое состояние Git противоречит профилю, не продолжай молча:

- повысить `route.git` с `integration_branch_direct` до `feature_worktree` можно, если политика проекта запрещает прямую правку или риск оказался выше;
- понизить `route.git` можно только с объяснением, почему feature-ветка не нужна;
- если выбор влияет на push, PR, merge или deploy и не выводится из проекта, остановись на вопросе пользователю.

Если выбран `integration_branch_direct`, merge stage обычно не выполняет `git merge`, но всё равно обязан выполнить Git Fixation Gate: commit/push/CI/deploy evidence по `policy_context.git.delivery_strategy`. Нельзя закрывать протокол как `merged`, если изменения только лежат в dirty worktree или stage report содержит placeholder вроде `pending_batch_commit`.

## Безопасный старт

Сначала проверь:

- текущую ветку;
- не находишься ли уже в отдельном рабочем дереве (worktree): сравни `git rev-parse --git-dir` и `git rev-parse --git-common-dir`;
- не является ли текущее расположение подмодулем (submodule), если `git-dir` отличается от `git-common-dir`;
- связь с удалённой веткой;
- `git status`;
- подготовленные и неподготовленные изменения (`staged` и `unstaged`);
- какие изменения относятся к текущей работе, а какие появились раньше или принадлежат пользователю.

Не коммить чужие или не относящиеся к протоколу файлы. Если в тех же файлах есть чужие изменения, работай аккуратно поверх них и не откатывай без явного указания.

Если рабочее дерево уже изолировано, не создавай вложенное рабочее дерево. Если нужно создать новое dd-flow-managed рабочее дерево, используй project-scoped service checkout root из `workspace-layout.md`. Не создавай новые dd-flow service worktrees внутри target repo, `.worktrees/`, `worktrees/`, `_worktrees/` или `.tasks/worktrees/`. Project-local manual worktrees допустимы только как проектная политика, а не как dd-flow service layout.

Перед реализацией существенной работы зафиксируй baseline: какие проверки известны, какие удалось запустить до изменений, какие уже падали и почему. Это нужно, чтобы отличить новые ошибки от старого состояния проекта.

## Создание feature-worktree

Если `flow_profile.route.git: feature_worktree`, создай рабочую область как ранний операционный шаг после выбора маршрута и до публикации протокола.

Порядок:

1. Определи интеграционную ветку по проектной политике: обычно `develop`, иногда `main` или текущая основная ветка.
2. Убедись, что стартовая ветка чиста или что несвязанные изменения не будут захвачены.
3. Зафиксируй базовый commit SHA.
4. Выбери имя feature-ветки по проектной политике, например `feature/<short-slug>` или `protocol/<PRT-ID>-<slug>`.
5. Создай worktree в project-scoped service checkout root: `~/.dd-flow/projects/<PRJ-ID-slug>/checkouts/worktrees/<EXP-ID-slug-or-protocol>/<RUN-ID-slug>/<repo-slug>/`, если проект не выбрал явно другой service root.
6. Перейди в новый worktree и проверь `git status`, текущую ветку и base commit.
7. Выполни или проверь bootstrap рабочей области по `workspace-bootstrap.md` и сохрани receipt текущего stage.
8. Зарегистрируй runtime-протокол с `--workspace-path <feature-worktree>` и создай файловый `protocol/PRT-*` уже в feature-worktree, записав туда Git/workspace state.
9. Если текущая Codex session остаётся в stable root, ограничь запись в feature-worktree минимальным handoff-пакетом: `.memory-bank/protocol/<PRT-ID>/summary.md`, optional `.memory-bank/protocol/<PRT-ID>/trace/` и compact index update. Не меняй продуктовые файлы, не создавай plan graph и не начинай implementation из stable-root session.
10. Перед остановкой stable-root session проверь, что `summary.md` существует и не пустой. Runtime state в `~/.dd-flow` сам по себе не является достаточным handoff.

Если проектная политика требует другой порядок, следуй ей и объясни отклонение в протоколе.

### Codex session boundary

Для Codex отдельный worktree является также границей рабочей session.

После создания или выбора feature-worktree проверь:

```bash
pwd -P
git rev-parse --show-toplevel
```

Если текущий `pwd -P` не равен выбранному `worktree_path`, не продолжай продуктовые файловые изменения, не вызывай `apply_patch` для исходного кода, не записывай plan graph и не запускай реализацию из старого checkout. До остановки разрешено только выполнить stable-root handoff: зарегистрировать протокол через `dd-flow protocol register ... --workspace-path "<worktree_path>"`, создать и проверить непустой `<worktree_path>/.memory-bank/protocol/<PRT-ID>/summary.md`, проверить `dd-flow protocol status`, обновить dashboard и затем дать пользователю точную команду запуска Codex из worktree. Для экспериментов предпочтительно использовать `dd-flow-exp start <EXP-ALIAS> --phase code`; для обычного проекта можно дать прямой запуск:

```bash
CODEX_HOME="<managed-codex-home>" codex --dangerously-bypass-approvals-and-sandbox --dangerously-bypass-hook-trust -C "<worktree_path>" "<prompt>"
```

Это правило обязательно, потому что Codex file-edit tools привязаны к session cwd. `workdir` у shell-команд не доказывает, что последующие файловые edits пойдут в этот же checkout.

В новой session из feature-worktree снова выполни короткий Git-preflight. Если протокол уже зарегистрирован stable-root planning session, не создавай второй протокол: проверь `dd-flow protocol status "<protocol-id>" --json` и продолжай его. Для `dd-flow` CLI сохраняй разделение:

- `project_root` - стабильный корень проекта, откуда была выбрана интеграционная ветка и где работает merge queue;
- `workspace_path` - текущий feature-worktree из `pwd -P`.

Если протокол ещё не зарегистрирован, сначала зарегистрируй его так, чтобы файлы протокола создавались в worktree, но состояние оставалось привязано к стабильному проекту:

```bash
dd-flow protocol register "<protocol-id>" --project-root "<stable-project-root>" --workspace-path "<feature-worktree>" --json
```

Затем зарегистрируй flow session с тем же `project_root` и `workspace_path`, создай plan graph и продолжай маршрут.

Перед любыми code/readiness действиями в feature-worktree проверь, что `.memory-bank/protocol/<PRT-ID>/summary.md` существует и не пустой. Если файла нет, это blocker `missing_feature_worktree_protocol_summary`: не восстанавливай handoff молча внутри code stage, остановись и верни задачу на planning/handoff.

## Bootstrap рабочего дерева

Новый worktree не считается готовым к реализации только потому, что Git его создал. До implementation или project tooling выполни `workspace-bootstrap.md`.

В протоколе или `task_profile.workspace.bootstrap` сохрани только compact handoff на канонический contract и stage receipt. Подробные поля receipt, допустимые statuses, same-path reuse, invalidation, безопасная работа с secrets/config и правило `blocker` против durable `DEF-*` не дублируй здесь.

Feature-worktree receipt не подтверждает готовность merge/integration checkout. Перед post-merge project checks интеграционный flow обязан применить тот же contract к своему фактическому workspace.

## Ветки и коммиты

Обычная модель:

```text
ветка фичи (feature/*)
-> черновой запрос на слияние (draft pull request)
-> локальные проверки
-> готовность к интеграции
-> слияние (merge) в develop
-> бета-стенд (beta)
-> допуск к продуктовому окружению (production approval)
```

Проект может использовать другую модель. В таком случае следуй проектному Банку памяти.

Коммиты делай по смысловым блокам. Сообщение коммита должно объяснять, какую устойчивую единицу изменения оно фиксирует.

### Trace tags in commit messages

Если flow создаёт Git commit, subject должен заканчиваться trace tag, который связывает commit с Memory Bank execution context:

```text
<human-readable subject> [PRT-XXX/stage]
<human-readable subject> [RUN-XXX/stage]
```

Правила выбора tag:

- используй `[PRT-XXX/stage]`, если commit фиксирует работу конкретного протокола;
- используй `[RUN-XXX/stage]`, если flow не привязан к одному протоколу, но есть конкретный `RUN-*`, например `mb-init`, `mb-upgrade`, `mb-fix`, `release`, `deploy`, `publish` or other operation flow;
- для protocol set предпочитай member `PRT-*`, а не `PSET-*`; set остаётся coordination context и отражается в protocol summary/stage report;
- если один commit покрывает несколько протоколов, поставь primary `PRT-*` в subject, а остальные протоколы перечисли в commit body, stage report or final report;
- если commit создаётся без `PRT-*` и без `RUN-*`, tag можно не ставить, но final report должен объяснить, почему Git evidence не имеет trace tag;
- не добавляй plan item ids в subject по умолчанию; при необходимости укажи их в body, например `Plan-Items: P1, P3`.

`stage` должен совпадать с фактическим flow stage или operation name: `specify`, `plan`, `code`, `merge`, `review`, `review-fix`, `release`, `deploy`, `publish`, `mb-init`, `mb-upgrade`, `mb-fix`, `hotfix` и т.п.

Примеры:

```text
Document commit trace tag convention [PRT-076/code]
Release dd-memorybank 2.11.1 [RUN-160/release]
Upgrade project Memory Bank to 2.11.1 [RUN-161/mb-upgrade]
```

Trace tag не заменяет protocol frontmatter, run index, stage report, changelog или release notes. Это компактный указатель в Git log для человека и агента.

Пуш (push) делай, когда это нужно для удалённой фиксации, проверки, запроса на слияние (pull request), предварительного окружения (preview), бета-стенда (beta) или другой проектной операции. Не запускай дорогие сборки без причины.

## Владение рабочими деревьями и ветками

Процесс может удалять только те ветки и рабочие деревья, которыми он владеет:

- ветка создана текущим протоколом или явно передана пользователем для этой работы;
- изменения ветки уже смержены или пользователь выбрал discard;
- рабочее дерево находится в dd-flow service checkout root или в явно указанном project-owned/manual месте;
- проектная политика не запрещает удаление.

Не удаляй рабочее дерево, если оно создано внешним harness, находится вне ожидаемой папки, имеет detached HEAD без ясного владельца или содержит незамерженные изменения.

Не удаляй текущее рабочее дерево собственной Codex session. Перед `git worktree remove` проверь `pwd -P`; если текущая session находится в удаляемом worktree или внутри него, остановись. Cleanup должен выполняться из стабильного project root, merge workspace или отдельной cleanup-сессии. Удаление собственного `cwd` ломает последующие shell/tool/hook вызовы ошибкой `No such file or directory`.

Если проект использует `dd-flow` merge queue, implementation session не удаляет feature-worktree после `ready_for_merge` и не чистит branch после merge. Cleanup относится к merge job или отдельному post-merge cleanup-контуру, потому что только он видит интеграционный результат.

## Post-Merge Branch Revision

Merge/post-merge cleanup owns disposable branch cleanup.

Before deleting branches, read `.memory-bank/project-policy.md` and any linked branch retention owner. Generic Memory Bank indexes are not enough for this gate. If policy requires a separate retention source and that source is missing, malformed, unreadable or contradictory, skip deletion and report the reason.

Default semantics:

- merged disposable `feature/*` branches are deleted by default after successful merge/fixation;
- retention is exception-only;
- missing or empty retention exceptions mean no branches are retained by default;
- retained branches must have a reason and review date when the project records them.

Branch revision should review both local and remote merged branches:

```bash
git branch --merged <integration>
git branch -r --merged origin/<integration>
```

Delete only branches that are all of these:

- proven merged into the selected integration branch;
- match the disposable branch patterns from project policy;
- not the current branch, integration branch, protected branch or long-lived branch;
- not listed in branch retention exceptions;
- not associated with a dirty worktree or unsafe external ownership.

Report cleanup in four groups: deleted local branches, deleted remote branches, retained branches with reasons, and unsafe skipped branches with reasons. An empty retention table is a positive signal that no branches are retained.

## Контекст после merge

После успешного merge, fast-forward, squash merge, PR merge или другого project delivery шага агент должен явно перейти в тот checkout/ветку, где проект дальше будет использовать результат.

Правило по умолчанию:

- если результат доставлен в интеграционную ветку, перейди на неё (`develop`, `main` или другую ветку из проектной политики);
- если delivery выполнялся через PR/remote merge, обнови локальную интеграционную ветку через безопасный fetch/pull по проектной политике;
- если текущая сессия остаётся в feature/upgrade ветке или target worktree, не продолжай обычную работу из неё после merge;
- если перейти нельзя, зафиксируй blocker или retention reason и дай точную команду, из какого checkout продолжать.

Минимальная post-merge проверка:

```bash
git branch --show-current
git status --short --branch
git rev-parse --short HEAD
git branch --contains "<merged-commit-or-upgrade-head>"
```

В closure report запиши:

- expected continuation branch;
- actual current branch after merge;
- команду перехода на интеграционную ветку;
- подтверждение, что merged commit достижим из интеграционной ветки;
- почему сессия остаётся не в интеграционной ветке, если это осознанно.

## Различай контуры готовности

- Локальные проверки доказывают, что текущая ветка проходит выбранные команды.
- Готовность ветки фичи доказывает готовность к интеграции.
- Слияние (merge) в `develop` доказывает только интеграцию кода.
- Бета-проверка (beta check) доказывает работоспособность интегрированного состояния на целевом стенде.
- Продуктовое окружение (production) требует отдельного допуска, понимания миграций, отката и доказательств.

Зелёная непрерывная интеграция (CI), preview-ссылка и локальная дымовая проверка (smoke) полезны, но сами по себе не являются приемкой системы.
