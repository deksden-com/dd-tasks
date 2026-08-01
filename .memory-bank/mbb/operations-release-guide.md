---
file: '.memory-bank/mbb/operations-release-guide.md'
description: 'Canonical guide for git flow, integration, beta acceptance, release, rollout, rollback, and operational evidence.'
purpose: 'Read when defining project operations so feature branches, develop, beta, production, and release evidence have clear gates.'
version: '0.11.0'
date: '2026-07-10'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
related_files:
  - .memory-bank/mbb/spec-layer-guide.md
  - .memory-bank/mbb/project-policy-guide.md
  - .memory-bank/mbb/scenario-docs-guide.md
  - .memory-bank/mbb/verification-matrix-guide.md
  - .memory-bank/mbb/named-deferrals-guide.md
  - .memory-bank/mbb/templates/devops-runbook-workspace-bootstrap.md
  - .memory-bank/mbb/templates/operational-access-policy.md
  - .memory-bank/mbb/templates/secrets-policy.md
tags: [mbb, operations, git-flow, release, rollout, beta, production, rollback, evidence, authorization, identity, access-bindings]
history:
  - version: '0.11.0'
    date: '2026-07-10'
    changes: 'Defined separate operational authorization, exact identity-target bindings, safe readback, authority outcomes, scoped approval, freshness and value-free evidence.'
  - version: '0.10.0'
    date: '2026-07-10'
    changes: 'Defined project-owned workspace bootstrap and secrets policy boundaries plus the bootstrap runbook overlay.'
  - version: '0.9.0'
    date: '2026-07-07'
    changes: 'Added canonical base-plus-overlay DevOps runbook template policy, not-applicable discipline, and lessons/insights promotion requirements.'
  - version: '0.8.1'
    date: '2026-07-03'
    changes: 'Добавлены lessons learned для CLI-coupled Memory Bank release: generated changelog sources, порядок canon commit -> CLI build/publish -> readback, and strict build metadata.'
  - version: '0.8.0'
    date: '2026-06-30'
    changes: 'Добавлены token-safe package publish evidence, локальная CLI link/readback verification и Memory Bank/CLI compatibility evidence для package-registry delivery.'
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Added canonical operations and rollout workflow.'
  - version: '0.2.0'
    date: '2026-05-12'
    changes: 'Добавлены Prime/preflight, операторские runbook-и и более строгая политика доказательств.'
  - version: '0.3.0'
    date: '2026-05-13'
    changes: 'Добавлены rollout evidence bundle, rollback handoff и правило schema-existence proof отдельно от security hardening.'
  - version: '0.4.0'
    date: '2026-05-14'
    changes: 'Добавлены правила безопасного жизненного цикла рабочего дерева (worktree lifecycle): detection, ignored directory, baseline и владение рабочими деревьями.'
  - version: '0.5.0'
    date: '2026-05-19'
    changes: 'Связано создание протокола с Git-контуром и bootstrap рабочего дерева: секреты, зависимости, setup-команды и блокеры фиксируются в Prime.'
  - version: '0.6.0'
    date: '2026-05-24'
    changes: 'Добавлены шаблоны Git flow: single-main, feature-to-main, feature-to-develop-main-release, local-only и правила hotfix.'
  - version: '0.7.0'
    date: '2026-06-15'
    changes: 'Разделены Git, environment/stage, release, deploy/publish, verification policy и operator runbooks; добавлены status taxonomy, preset aliases и Delivery Decision Gate.'
---

# Эксплуатация, релизы и rollout

## Зачем это нужно

Разработка не заканчивается на зеленом тесте в feature-ветке.

Для системы с несколькими клиентами, окружениями, внешними провайдерами, миграциями или пользовательским интерфейсом важно различать:

- готовность изменения к интеграции;
- готовность интегрированной системы на beta;
- готовность production rollout;
- возможность rollback.

Иначе проект начинает принимать решения по ложным сигналам: зеленый CI считается приемкой, preview считается beta, один деплой считается всей системой, а локальная проверка считается production readiness.

## Контуры SDLC

Операционная документация должна разделять несколько контуров. Они связаны, но отвечают на разные вопросы:

- **Git policy:** как двигаются исходники: ветки, рабочие деревья (worktrees), pull requests, merge queue, cleanup, куда перейти после merge.
- **Git delivery/fixation strategy:** как изменение становится доказуемо доставленным или честно переданным: direct commit, push, PR, merge queue, squash/rebase result, external handoff, local-only or no-git. Это не то же самое, что место работы.
- **Environment/stage policy:** где живёт артефакт или система: `local`, `dev`, `preview`, `qa`, `beta`, `staging`, `prod`, `package-registry`, `store-review`, `static-site` или проектный stage.
- **Release policy:** какая версия и какой набор изменений зафиксированы: version map, changelog, tag, release notes, package, image or app build.
- **Deploy policy:** как артефакт доставляется на stage: команда, CI/CD trigger, pre-deploy gates, post-deploy checks, rollback/roll-forward.
- **Publish policy:** гибридный случай, где фиксацию релиза и доставку нельзя честно разделить, например `npm publish`, app store submission или static site publication.
- **Verification policy:** что доказывает результат, на каком stage, каким контуром проверки и с каким evidence.
- **Operator runbooks:** пошаговые инструкции выполнения операции. Policy говорит "какие правила действуют", runbook говорит "как выполнить".

Не смешивай эти контуры в один документ "как мержить". Git policy может говорить, что push в ветку запускает deploy, но deploy gates и rollback живут в deploy/environment policy.

В SDLC отчётах `policy_context` является snapshot-ом этих правил для одного протокола. Если stage claims `merged`, Git fixation evidence must match the selected strategy; placeholders such as `pending_batch_commit` are not evidence.

### Flow vs contour

`release.md`, `deploy.md` and `publish.md` are executable top-level flows. They start an operation, create or continue a run, apply gates and write evidence.

`release contour`, `deploy contour` and `publish contour` are policy/evidence aspects that can appear inside any flow, including ordinary SDLC work. A contour answers what must be considered and proven. A flow executes the operation.

Use this distinction in prompts, reports and project policy:

- `Release` flow fixes a version/change set and release evidence.
- `release contour` records whether the current task touches versioning, changelog, release notes, tags, artifacts, compatibility or release approval.
- `Deploy` flow delivers a source artifact to a runtime stage and verifies that deployed runtime.
- `deploy contour` records stage, provider, target, pre/post checks, environment identity, observability and rollback/roll-forward expectations.
- `Publish` flow is composite: release fixation plus artifact delivery to a publication target plus publish-specific gates.
- `publish contour` records registry/store/static publication readback, token safety, channel/dist-tag rules, consumer smoke and partial-failure handling.

Do not describe Vercel, Netlify, Render, Fly, Railway, Cloudflare Pages, Kubernetes, ECS or similar hosting as a `publish_target` by default. For an application or hosted site they are normally `deploy_provider` values for a `runtime_stage`. A project may choose to treat public static documentation publication as `publish`, but that is a policy decision and must be explicit.

## Статусы

В отчётах и политиках используй отдельные статусы:

- `applicability_status`: `applicable`, `not_applicable`, `unknown`;
- `verification_state`: `not_checked`, `checked_passed`, `checked_failed`, `blocked`, `deferred`;
- `closure_state`: `accepted_local`, `ready_for_merge`, `merged`, `released`, `deployed`, `published`, `implemented_with_named_deferrals`, `blocked`;
- `gate_status`: `pass`, `warn`, `block`, `not_applicable`.

`not_applicable` требует причины. Если контур значим, но неясен, это вопрос, `BLOCK-*` или `DEF-*`, а не тихий пропуск.

## Базовая цепочка

Рекомендуемый поток:

```text
feature branch
-> draft PR
-> локальные проверки и ревью
-> готовность к интеграции
-> merge в develop
-> beta deploy
-> сценарии на beta
-> release verdict
-> production approval
-> prod rollout
-> post-release evidence
```

Эта цепочка не обязательна для маленькой библиотеки без окружений. Но если продукт имеет beta/prod, внешние интеграции, auth, данные или UI, она должна быть явной.

## Шаблоны Git flow

Если проектная политика уже описана, следуй ей. Если политики нет, агент не должен задавать пустой вопрос "какой Git flow?". Он должен предложить один из канонических шаблонов, объяснить почему он подходит текущему проекту, и попросить пользователя подтвердить или выбрать другой.

Шаблон - это стартовая операционная модель. Его можно заменить позже через ADR или `spec/operations/`, когда проект станет сложнее. Канонические preset names описаны в `dd-flow/common/policy-presets.md`. Старые имена в этом документе остаются допустимыми алиасами:

- `single-main` -> `simple-main`;
- `feature-to-develop-main-release` -> `develop-main-release`.

### `single-main`

Подходит для маленьких проектов, playground, библиотек без релизного контура, ранних прототипов и репозиториев, где `main` является единственной общей веткой.

Поток:

```text
main
-> локальная правка
-> локальные проверки
-> commit в main
-> push origin/main
```

Правила:

- `main` одновременно является интеграционной и публикуемой веткой;
- отдельная feature-ветка не создаётся, если стоимость ветки/merge сопоставима со стоимостью самой правки;
- перед commit выполняются проверки, соответствующие области изменения;
- `.tasks/`, локальные логи, секреты и build artifacts не коммитятся;
- протокол может жить прямо в `main`, если проект использует протоколы для таких работ.

Hotfix в `single-main` - это обычная короткая правка в `main` с минимально достаточной проверкой и явной записью риска. Если есть production deploy из `main`, после push нужно проверить deploy/CI по правилам проекта.

### `feature-to-main`

Подходит для проектов, где `main` является интеграционной веткой, но изменения уже достаточно велики или рискованны, чтобы изолировать их в feature branch/worktree.

Поток:

```text
main
-> feature/<topic> или worktree feature/<topic>
-> локальные проверки и ревью
-> PR или merge в main
-> push origin/main
```

Правила:

- feature branch создаётся от актуального `main`;
- долговечный протокол создаётся в feature-worktree, если работа ведётся в отдельном worktree;
- после реализации проверяется готовность feature к интеграции;
- merge в `main` сопровождается повторной проверкой нужных gates;
- feature branch/worktree удаляется после успешного merge, если это не запрещено политикой проекта.

Hotfix в `feature-to-main` можно делать прямо в `main`, если исправление мало, срочно, хорошо локализовано и время feature branch/merge сопоставимо со временем исправления. В отчёте надо явно написать, почему выбран короткий путь. Если hotfix не микроскопический или затрагивает данные/auth/deploy, используй `hotfix/<topic>` от `main` и merge обратно в `main`.

### `feature-to-develop-main-release`

Подходит для продуктов с beta/staging, production, внешними интеграциями, миграциями, несколькими клиентами или hosted behavior, где интеграция и релиз должны быть разнесены.

Поток:

```text
develop
-> feature/<topic> или worktree feature/<topic>
-> локальные проверки и ревью
-> merge/PR в develop
-> beta/staging deploy и scenario gates
-> release verdict
-> merge/promote develop в main
-> production rollout
-> post-release evidence
```

Правила:

- `develop` - интеграционная ветка и источник beta/staging;
- `main` - production/release ветка;
- feature branch создаётся от актуального `develop`;
- feature branch доказывает готовность изменения к интеграции, а не готовность всей системы к production;
- после merge в `develop` требуется системная проверка на интеграционном контуре;
- promotion в `main` требует release verdict и rollback/roll-forward понимания.

Hotfix в этой модели начинается от `main`, потому что чинит production-состояние:

```text
main
-> hotfix/<topic>
-> минимальная правка и проверки
-> merge/PR в main
-> production rollout evidence
-> обратный перенос в develop
```

Обратный перенос в `develop` обязателен, если только `develop` уже содержит эквивалентное исправление. Если backport невозможен сразу, создай именованное отложение с владельцем, причиной и gate.

### `local-only`

Это не полноценный Git flow, а временный режим для чернового исследования, локального прототипа, отсутствующего remote или явного решения пользователя не публиковать изменения сейчас.

Правила:

- результат помечается как локальный, например `initialized_local_uncommitted`;
- финальный отчёт показывает, какие файлы изменены и какой commit/push нужен дальше;
- активные документы не должны притворяться опубликованными;
- при первой публикации нужно снова пройти Git finalization gate.

## Выбор шаблона

Агент выбирает рекомендацию по признакам проекта:

- нет явного Git flow, проект маленький, одна ветка `main`, нет CI/deploy: рекомендуй `single-main`;
- есть remote и нужна изоляция изменений, но нет `develop`/release-контура: рекомендуй `feature-to-main`;
- есть `develop`, beta/staging, release, production deploy, protected `main` или явные release gates: рекомендуй `feature-to-develop-main-release`;
- нет remote, пользователь просит только локальное исследование или публикация сейчас запрещена: используй `local-only` как временный режим.

При вопросе пользователю агент должен показывать не только варианты, но и свою рекомендацию:

```text
В проекте есть Git remote и текущая ветка main, но явного Git flow в README/docs/CI не найдено. Рекомендую `single-main`, потому что проект маленький, отдельной develop-ветки и deploy gates не видно. Тогда я закоммичу только разрешенные файлы в main и запушу origin/main; `.tasks/` не попадет в commit.
```

## Stage and target policy

Для каждого runtime stage или delivery target запиши:

- source artifact: branch, commit, tag, package, image, app build or static bundle;
- owner and access requirements;
- bootstrap/setup requirements;
- secrets handling without exposing values;
- allowed agent actions;
- required pre-stage checks;
- required post-stage checks;
- evidence location;
- rollback or roll-forward rule.
- `access_binding_refs` for the exact external operations that require authenticated provider context.

Используй:

- `runtime_stage` для окружений, где система запускается: `local`, `dev`, `preview`, `qa`, `beta`, `staging`, `production` или проектный stage.
- `deploy_provider` для платформы, которая запускает или хостит runtime: Vercel, Netlify, Render, Fly, Railway, Cloudflare Pages, Kubernetes, ECS, on-prem cluster или аналог.
- `deploy_target` для конкретного project/environment/deployment URL/id внутри provider.
- `delivery_target` для мест доставки артефакта, которые сами по себе не являются runtime stage: `package-registry`, `container-registry`, `store-review`, `extension-store`, `static-publication-target`.
- `publish_target` когда `delivery_target` участвует в publish flow, то есть delivery неотделим от release/publication gates.

Default classification examples:

| Example | Default classification | Why |
| --- | --- | --- |
| Vercel Preview Deployment | `deploy_provider: vercel`, `runtime_stage: preview` | The app runs at a preview URL and needs deploy evidence. |
| Vercel Production Deployment | `deploy_provider: vercel`, `runtime_stage: production` | Production runtime exposure, checks and rollback matter. |
| Netlify/Cloudflare Pages app deploy | deploy to runtime stage | Hosted app/site is a running public environment. |
| npm publish | `publish_target: package-registry` | Version fixation and consumer delivery are coupled. |
| Docker/OCI image push | `publish_target: container-registry` | Artifact is published; runtime deploy may happen later. |
| App or extension store submission | `publish_target: store-review` or `extension-store` | Store review/channel/readback is the publication gate. |
| Static docs site | deploy by default; publish only by project policy | Public docs publication may be release+delivery if policy says so. |

## Release, deploy and publish boundary

Release фиксирует версию и набор изменений. Deploy доставляет артефакт на stage. Publish применяется, когда release и delivery практически неразделимы.

Release может состоять из нескольких протоколов, фич, issue groups или merge commits. Поэтому `release` не равен одному `PRT-*`. Release policy должна объяснять, как собирается release set: что входит, что исключено, какие changelog entries закрываются, какая версия назначена и какие артефакты выпущены.

Deploy policy потребляет commit, tag, package, image, build или static bundle и отвечает за доставку на stage. Post-deploy checks являются частью deploy на этот stage, а не отдельным обязательным `observe` flow.

Если проект использует гибрид вроде `npm publish`, app store submission или static site publication, явно запиши publish policy: какие части считаются release fixation, какие delivery, какие evidence и approval нужны.

Для package-registry publish, например npm, release runbook обязан отдельно описывать:

- source of truth версии пакета (`package.json`, `pyproject.toml`, chart metadata или аналог);
- команду сборки и команду publish;
- какие локальные gates выполняются до publish;
- какие build metadata должны попасть в артефакт, если пакет связан с другой канонической системой;
- как выполняется registry readback после publish;
- как локальная машина оператора обновляет installed/linked CLI, SDK или package после publish, если именно эта локальная установка используется агентами;
- как проверяется compatibility verdict между выпущенным пакетом и каноническими документами проекта;
- что считается publish deferral и где оно фиксируется, если registry publish не выполнен в рамках release.

Секреты publish-контуров должны быть описаны только через имена переменных и безопасные команды. Не записывай значения токенов в Memory Bank, changelog, release report, shell history examples или committed config. Для npm предпочтительный шаблон - пробросить operator-local token в `NODE_AUTH_TOKEN` и использовать временный `NPM_CONFIG_USERCONFIG`, где `_authToken` ссылается на `${NODE_AUTH_TOKEN}`, а не содержит значение токена.

Если Memory Bank release требует новую версию runtime CLI, release evidence должен включать:

- версию Memory Bank;
- требуемую и рекомендованную версию CLI из compatibility manifest;
- версию CLI в package manifest;
- build metadata CLI: canon version и canon commit;
- npm/package-registry readback или явный publish deferral;
- локальный `dd-flow version --json` после install/link;
- `dd-flow status --project-root <project> --json` или эквивалентный compatibility verdict.

Lessons learned для CLI-coupled Memory Bank release:

- если новый Memory Bank release документирует CLI behavior, которого нет в опубликованной npm версии, сначала запланируй CLI package release или явно оформи publish deferral; не выпускай канон, который требует недоступный package behavior;
- если CLI build metadata должен ссылаться на canon version and commit, финальный canon release commit должен существовать до `pnpm build`/`npm publish` CLI; если после publish меняются release docs or compatibility files, либо пересобери/перепубликуй CLI, либо явно запиши degraded metadata reason;
- если package использует Changesets, `CHANGELOG.md` обычно является generated/derived target: агент создаёт или обновляет `.changeset/*`, затем запускает `changeset version`; не веди параллельный manual `Unreleased`, а если legacy manual entries уже есть, сверни их в generated release section перед publish;
- release readback для npm package должен проверять registry version, локально установленную/linked CLI version, build metadata, and Memory Bank compatibility verdict; registry readback alone is not enough;
- token handling must remain command-local: source operator `.env` only into environment variables, use temporary npm config when needed, and never copy token values into reports, changelog, shell examples or committed files.

## Prime: предварительный операционный контроль

Любая существенная волна работ должна начинаться с `Prime` - предварительного операционного контроля (operational preflight). Это не бюрократия перед кодом, а фиксация исходного состояния, чтобы закрытие работы было доказуемым.

`Prime` должен записать:

- текущую ветку;
- базовый commit SHA;
- состояние рабочего дерева;
- выбранный Git-маршрут: прямая работа в интеграционной ветке или feature-worktree;
- где создан протокол: в интеграционной ветке или в feature-worktree;
- имя feature-ветки и путь worktree, если они используются;
- статус bootstrap рабочей области: секреты без раскрытия значений, зависимости, setup-команды и блокеры;
- находимся ли уже в отдельном рабочем дереве (worktree), подмодуле (submodule) или обычном checkout;
- есть ли открытый запрос на слияние (pull request);
- какие локальные проверки известны;
- какие baseline-проверки запущены до изменений, что прошло, что уже падало;
- какие ворота приемки (acceptance gates) открыты, закрыты или не применяются;
- есть ли миграции, внешние провайдеры, секреты, beta/prod или ручной deploy в области риска.

Если рабочее дерево уже грязное, `Prime` должен отличить изменения текущей волны от чужих или ранее начатых изменений. Нельзя молча “почистить” чужие правки ради красивого старта.

Для маленькой локальной правки `Prime` может быть коротким разделом в протоколе или итоговом отчете. Для протокола, релиза, миграции или многорепозиторной работы `Prime` должен быть явной секцией.

Если проектная политика требует feature-ветку, долговечный протокол создаётся уже в feature-worktree. Черновые заметки до создания worktree могут жить в `.tasks/`, но опубликованный `protocol/PRT-*` должен находиться в том Git-контуре, где будут план, реализация, проверки и evidence.

## Worktree lifecycle

Рабочее дерево (worktree) защищает текущую ветку от смешивания изменений, но само по себе является операционным объектом. Его нужно создавать и удалять осознанно.

Перед созданием рабочего дерева:

- проверь, не находишься ли уже в отдельном рабочем дереве (worktree);
- проверь, что это не подмодуль, который ошибочно выглядит как рабочее дерево (worktree);
- следуй проектной политике или нативному механизму агентной среды (native agent harness), если он есть;
- если создаёшь рабочее дерево внутри проекта (project-local worktree), убедись, что `.worktrees/` или `worktrees/` игнорируется Git;
- не создавай вложенные рабочие деревья (worktree) без явной причины.

После создания:

- зафиксируй путь, ветку и базовый commit;
- выполни project bootstrap: локальные env/secret-файлы по политике проекта, зависимости, setup-команды и проверку toolchain;
- запусти baseline-проверки или честно запиши, почему они невозможны;
- отделяй проблемы baseline от новых проблем текущей работы.

Bootstrap не должен раскрывать значения секретов в протоколе или логах. Если секрет, доступ, зависимость или setup-команда недоступны, это блокер операционного старта: его нужно явно записать, а не начинать реализацию в полуподготовленном worktree.

### Project-owned bootstrap and secrets boundary

Проектная рабочая область считается готовой не потому, что Git создал worktree, а потому что проектный bootstrap завершился, был безопасно переиспользован или явно признан неприменимым.

Верхнеуровневый `.memory-bank/project-policy.md` является только компактным маршрутизатором. Проектные факты должны жить в project-owned operations layer:

```text
.memory-bank/spec/operations/workspace-bootstrap-policy.md
.memory-bank/spec/operations/secrets-policy.md
.memory-bank/spec/operations/runbooks/workspace-bootstrap.md
.memory-bank/spec/operations/scripts/bootstrap-workspace.sh
```

Проект может ссылаться на существующую корневую команду, но должен иметь один канонический entrypoint. Повторяемые deterministic steps лучше хранить в idempotent script; шаги с judgment, approval или access остаются в runbook. Bootstrap не должен включать destructive migrations, production actions или внешние mutations, которым нужен отдельный gate.

`.memory-bank/dd-flow/**` и `.memory-bank/mbb/**` являются canon-managed layers. Не размещай там project-specific команды, токены, правила копирования локальной конфигурации или bootstrap scripts. `mb-upgrade` может обновлять канонические шаблоны, но не должен заменять project-owned команды, runbooks, scripts или secrets decisions примерами из шаблона.

Secrets policy обязательна, когда workspace, тест, build или delivery требуют ignored local configuration или credentials. Она описывает без значений:

- классы и потребителей;
- authoritative source/provider;
- разрешённый метод: `fetch`, `generate`, `copy` или `symlink`;
- allowlisted destination и workspace scope;
- access/approval gates;
- file permissions;
- redaction/logging;
- cleanup/revocation;
- поведение при недоступности.

Нельзя автоматически копировать все `.env*`, переносить dependency directories между worktrees или считать feature-worktree готовностью доказательством для integration checkout. Недоступный обязательный secret/access блокирует текущую операцию. Durable unknown policy становится scoped DEF только если влияет на текущий или будущий gate; проект без secrets честно фиксирует `not_applicable` без DEF.

Удалять можно только рабочее дерево, которым владеет текущий процесс: оно создано этим протоколом, находится в ожидаемой папке, не содержит незамерженных изменений и проектная политика не требует его сохранить. Внешне управляемые рабочие деревья (worktree) или detached workspace не удаляются без явного решения пользователя.

### Operational access, authorization and approval boundary

Workspace secrets, external authorization and operation approval are separate controls:

- `.memory-bank/spec/operations/secrets-policy.md` defines secret/configuration material that may be delivered to a workspace, process or workload;
- `.memory-bank/spec/operations/operational-access-policy.md` defines expected authenticated identities, authority and provider targets without credentials;
- the operation runbook or owning flow defines approval for one protected mutation.

Having a token, secret file or authenticated session proves none of the other controls. A matching public identity does not prove authority. Matching identity, authority and target do not imply approval.

Projects with authenticated external mutation should keep one compact operational-access policy until a real project need justifies a split. Central profiles own expected public account/organization/team/tenant facts and safe identity readback. Central bindings own exact relationships between a profile, an existing project subject/entity, provider target, stage/environment and allowed operation. Existing stage, target, dependency, resource, repository and runbook documents carry only `access_binding_refs`; do not create new entity types solely to host references or duplicate central identity facts locally.

Runtime resolution must produce exactly one rule for:

```text
profile + subject/entity + provider target + stage/environment + operation
```

Zero, duplicate, ambiguous or conflicting matches block before mutation. If authoring shorthand uses arrays, the document must list the explicit expansion and prove it does not grant an unintended Cartesian product.

Every readback procedure used for preflight must define a stable id, tool/provider and host, exact argv or explicitly bounded procedure, permitted environment variable names without values, noninteractive mode, timeout, read-only side-effect classification, structured extractor, redaction and persistence rules. It must forbid login, refresh, account/team/project/registry/context switching and mutation. Shell interpolation or free-form command synthesis is not allowed for an approved exact-argv procedure.

Authority has exactly one of these outcomes:

- `verified`;
- `mismatch`;
- `not_observable`;
- `not_required`, backed by a project-policy source for that exact operation.

`not_observable` blocks protected mutation. Credential presence, identity readback or a successful harmless API call does not substitute for authority evidence.

When approval is required, the approval reference must cover approver identity/authority, binding and operation, target and stage, artifact/version/change request when applicable, run/request id, decision source and timestamp, expiry/freshness and revocation state. Missing, stale, revoked or differently scoped approval blocks.

The owning mutating flow consumes preflight immediately before the protected command. The result is bound to profile, binding rule, operation, subject, target, stage, tool/provider, host, run/request id and observation timestamp. A process boundary, session/context change, target change, expiry or material delay invalidates it and requires fresh readback. The preflight worker never logs in, changes context or executes the protected mutation.

## Ветки

Полная модель веток для `feature-to-develop-main-release`:

- `feature/*` - рабочая ветка от `develop`;
- `develop` - интеграционная ветка и источник beta;
- `main` - production ветка;
- `hotfix/*` - срочные исправления от `main` с обратным переносом в `develop`.

Для `single-main` и `feature-to-main` не нужно искусственно заводить `develop`, если проект ещё не имеет beta/release-контура. Разделение веток должно уменьшать риск и стоимость интеграции, а не создавать формальную работу без пользы.

Draft PR создается рано, чтобы было видно:

- что меняется;
- какие проверки ожидаются;
- какие документы затронуты;
- какие сценарии нужны;
- какие риски и отложения уже известны.

Feature branch доказывает, что изменение готово к интеграции. Она не доказывает, что вся система в интегрированном состоянии принята.

## Что значит "готово к интеграции"

Feature branch можно считать готовой к merge в `develop`, если:

- локальные проверки для затронутых слоев пройдены;
- код не нарушает архитектурные и инженерные границы;
- связанные Memory Bank документы обновлены;
- новые или измененные контракты покрыты тестами;
- сценарии приемки определены;
- незакрытые пункты оформлены как блокеры или именованные отложения;
- reviewer понимает, какие gates остаются на beta.

Если фича меняет hosted behavior, auth, данные, миграции, провайдеров, webhooks или защищенный UI, beta gate должен быть запланирован до merge.

## Beta acceptance

`develop` после интеграции должен быть проверен как система.

Beta acceptance отвечает на вопрос: "текущее интегрированное состояние системы работает в целевом окружении?"

Минимум:

- деплой идет из правильной ветки;
- проверены реальные стабильные beta alias/domain, а не случайный preview;
- web/server/workflow пары совместимы, если система разнесена на несколько деплоев;
- `/health` или аналог подтверждает environment identity;
- миграции и seed/backfill состояние понятно;
- сценарии приемки запущены на нужном контуре;
- результаты сохранены как evidence.

Preview может быть полезен для review smoke. Он не заменяет beta по умолчанию.

## Production approval

Production promotion не должен быть автоматическим следствием merge в `develop`.

Перед production нужны:

- принятая beta-проверка;
- release verdict;
- понимание миграций и обратной совместимости;
- backup posture, если меняются данные;
- rollback/roll-forward инструкция;
- доказательство, что сценарные или debug-доступы выключены в production;
- явное approval ответственным человеком или процессом.

## Rollout runbook

Проект должен иметь `spec/operations/rollout-runbook.md`, если production rollout включает больше, чем один безопасный deploy.

Runbook должен описывать:

- предварительные условия;
- порядок фаз;
- stop conditions;
- какие команды используются;
- какие evidence сохраняются;
- как принять verdict;
- что делать при деградации;
- как передать rollback.

Для систем с данными runbook должен явно описывать миграции, backup, restore/rollback и совместимость старого/нового кода.

## Операторские runbook-и

Операторское руководство (operator runbook) отличается от пользовательской инструкции тем, что оно ведет ответственного человека или агента через проверяемую операцию: локальный регрессионный пакет, beta-приемку, release, rollback, миграцию, восстановление или публикацию пакета.

Новые и существенно обновляемые DevOps runbook-и должны использовать двухуровневую систему шаблонов:

- базовый шаблон `.memory-bank/mbb/templates/devops-runbook-base.md`;
- один или несколько operation-specific overlays из `.memory-bank/mbb/templates/`;
- frontmatter `parent_template` у заполненного runbook указывает на базовый шаблон;
- `operation_type` фиксирует основной тип операции: `workspace-bootstrap`, `release`, `deploy`, `publish`, `migration`, `rollback`, `backup-restore` или проектный тип с объяснением;
- если секция неприменима, в ней должен быть `not_applicable_reason`, а не молчаливое удаление значимого gate.

Overlay не заменяет базовый шаблон. Он добавляет требования к конкретному виду операции: workspace bootstrap фиксирует checkout identity, canonical entrypoint, dependencies/toolchain, allowlisted local configuration, readiness, receipt и invalidation; release фиксирует version/changelog/tag/build, deploy фиксирует stage/artifact/health/observability, publish фиксирует registry/store readback, migration фиксирует backup/compatibility/restore, rollback фиксирует trigger/safe artifact/data compatibility, backup-restore фиксирует retention/restore rehearsal/recovery expectations.

Для внешней mutation заполненный runbook также должен:

- перечислить `access_binding_refs` и точные protected operation names;
- разделить secrets, authorization и approval;
- определить safe readback procedure ids;
- требовать ровно одно совпавшее binding rule;
- блокировать mismatch, missing session, insufficient/not-observable authority, missing/stale approval и preflight drift;
- запрещать silent login, refresh и context switching;
- сохранять только value-free preflight evidence.

Runbook должен содержать не только команды, но и критерии интерпретации:

- предварительные условия;
- команды или интерфейсные действия;
- ожидаемые артефакты;
- минимальный пакет доказательств;
- stop conditions;
- как отличить частичный успех от принятого результата;
- что делать при сбое;
- куда записать итоговый verdict.

Runbook не должен становиться сырым списком команд. Если команда проходит, но не оставляет доказательств, runbook должен описывать, чем подтверждается результат.

Каждый DevOps runbook должен иметь блок lessons learned / insights. После операции агент или оператор фиксирует неожиданные наблюдения, почему они важны, команду или evidence, необходимость обновить runbook, целевой слой Memory Bank и promotion decision: `promoted`, `already_documented`, `task_local_only`, `rejected`, `deferred_as_DEF`, `needs_user_confirmation` или `blocked`.

Policy и runbook должны быть различимы. Например:

- `spec/operations/git-policy.md`: branch model, PR requirement, cleanup policy, expected continuation branch.
- `spec/operations/runbooks/git-feature-merge.md`: exact commands, queue/status checks, cleanup steps.
- `spec/operations/deploy-policy.md`: stage gates, approval and rollback requirements.
- `spec/operations/runbooks/deploy-prod.md`: exact deploy command, smoke command, log links and rollback procedure.

## Rollback runbook

Rollback - не "откатить как-нибудь".

Минимум:

- какой предыдущий артефакт или commit считается безопасным;
- какие данные можно откатить, а какие нельзя;
- какие миграции обратимы;
- как остановить внешний канал или провайдера;
- как проверить, что rollback сработал;
- какие follow-up нужны после аварии.

Если rollback невозможен, это должно быть явно сказано до production rollout вместе с roll-forward планом.

## Evidence policy

Операционный evidence должен отвечать на вопрос: "что именно было проверено, где и на каком состоянии кода?"

Полезные поля:

- ветка;
- commit SHA;
- PR/CI статус;
- окружение;
- deployment id или alias;
- миграции и backup id;
- сценарии и verdict;
- screenshots/log notes, если есть UI;
- request/correlation ids для API;
- production approval;
- rollback notes.
- access profile, binding rule and safe-readback procedure ids;
- expected and actual stable public identity/tenant/target identifiers only when policy requires them;
- separate identity, authority, target and approval verdicts;
- observation timestamp, freshness/expiry, run/request id, blocker and next action.

Не нужно хранить сырые километровые логи в Memory Bank. Храни curated summary и ссылки на артефакты.

Не сохраняй credential material, secret values, raw authenticated command/API output, hashes derived from secret values or unnecessary personal usernames/emails. A value-free session/context fingerprint is allowed only when project policy defines it as safe and public.

Для сценарных или релизных проверок предпочтителен машиночитаемый итоговый артефакт: `proof.json`, `run_evidence_manifest.json`, отчет релиза или аналог. Текстовый протокол ссылается на него и объясняет смысл, но не заменяет его.

Доказательство должно явно говорить, чем оно не является. Например:

- локальный replay с кешированной ИИ-фикстурой не является live-provider приемкой;
- preview deploy не является beta acceptance;
- один web deploy не доказывает совместимость server/workflow пары;
- успешная миграция в тестовой базе не является production approval.

## Delivery Decision Gate

После merge stage агент обязан явно сказать, что произошло с delivery:

- source integration completed and no release/deploy/publish was in scope;
- protocol is only queued/waiting in a long-lived merge worker;
- release is required next;
- deploy to a named stage is required next;
- publish is required next because release and delivery are inseparable;
- current gate is blocked.

Отчёт должен дать следующий корректный prompt или operator action. Нельзя закрывать работу словом "готово", если фактически закрыта только локальная проверка или merge в интеграционную ветку.

## Пакет доказательств выкатки

Для существенного релиза (release) или production rollout нужен связанный пакет доказательств выкатки (rollout evidence bundle), а не набор разрозненных команд.

Пакет должен связывать:

- preflight;
- действие продвижения или деплоя (promote/deploy action);
- проверку состояния и чтение результата (inspect/readback);
- verify;
- release verdict;
- rollback handoff.

Минимальные поля:

- branch и commit SHA;
- pull request / CI status, если был push;
- deployment ids и стабильные beta/prod alias;
- снимок готовности (readiness snapshot);
- проверку безопасности (security verification);
- идентификаторы миграций и артефакты применения/идемпотентности (apply/idempotency artifacts);
- идентификатор резервной копии и проверку резервной копии (backup id / backup verification), если данные затронуты;
- scenario ids и verdict;
- release verdict;
- package-registry readback, local CLI/package readback and compatibility verdict, если release включает publish/runtime CLI update;
- rollback target или roll-forward instruction.

Важное правило: release verdict должен быть связан с конкретным rollout id или аналогичным идентификатором. Иначе нельзя понять, какое состояние системы было принято.

## Передача на откат

Передача на откат (rollback handoff) - это минимальный пакет, который позволяет ответственному человеку или агенту выполнить управляемое восстановление (controlled recovery) без гадания.

Он должен содержать:

- предыдущую активную версию, commit, release tag или deployment id;
- backup id, если данные могут быть затронуты;
- failing phase и stop reason;
- какие миграции обратимы, а какие требуют roll-forward;
- команды или runbook для восстановления;
- post-rollback verification scenario или smoke.

Если rollback невозможен, это должно быть записано до production rollout вместе с roll-forward планом.

## Доказательство существования схемы

Проверка security hardening не доказывает, что нужная таблица, колонка или индекс существуют.

Например, SQL вида `alter table if exists ... enable row level security` может быть правильной защитной миграцией для optional/legacy таблицы, но он не доказывает, что таблица есть в целевом окружении.

Если задача будет читать или писать данные, нужно отдельное доказательство существования схемы (schema-existence proof):

- миграция `create/alter` покрывает нужную relation;
- или target-environment catalog/readback показывает таблицу/колонку;
- или добавлена additive repair migration с ledger evidence.

Проверяющий безопасность (security verifier) отвечает на вопрос:

> Если relation существует, защищена ли она правильно?

Доказательство существования схемы (schema-existence proof) отвечает на другой вопрос:

> Существует ли relation, на которую опирается код или rollout?

Эти проверки нельзя подменять друг другом.

## Что НЕ является приемкой

Не считается beta или production acceptance само по себе:

- зеленый CI;
- успешная сборка пакета;
- preview URL;
- один web deploy без server/workflow пары;
- локальный smoke;
- скриншот страницы без проверки данных;
- ручная фраза "вроде работает";
- сценарий без окружения, commit и verdict.

Эти сигналы полезны, но они должны быть названы своим именем.

## Связь с протоколами

Протокол конкретной волны должен записать:

- какие operational gates применялись;
- что было `N/A` и почему;
- был ли push;
- был ли PR;
- запускался ли CI;
- был ли Vercel/другой deploy;
- была ли beta;
- была ли production;
- какие evidence собраны;
- какие deferrals остаются.

Если во время протокола найдено новое операционное правило, его нужно поднять в `spec/operations/`, а не оставить только в протоколе.
