# Changelog And Versioning Policy

Этот общий блок описывает, когда flow должен включать changelog mode и как фиксировать правила версионирования в Банке памяти.

## Когда включать changelog mode

`changelog mode` включается, если в проекте найден хотя бы один устойчивый источник релизной или версионной практики:

- `CHANGELOG.md`, `changelog.md`, `CHANGES.md`, `HISTORY.md`, `RELEASES.md`, `RELEASE_NOTES.md`;
- разделы `Changelog`, `Release notes`, `Version history`, `История версий`, `Релизы`, `Что нового` в `README.md`, `docs/`, `guides/`, wiki export или аналогичной документации;
- явная release/versioning policy в `CONTRIBUTING.md`, `docs/release*`, `docs/version*`, `.github/`, CI/deploy docs;
- package/app metadata с релизной практикой: `package.json` `version`, Python/Rust/Go/package manifests, mobile app version files, Helm/chart versions, если рядом есть документация или процесс, объясняющий релизы;
- git tags, release branches, GitHub/GitLab release docs или CI jobs, которые явно готовят release notes/changelog.

Один только `package.json` `version` без README/docs/release следа является `changelog_candidate`, а не автоматическим включением. В таком случае задай пользователю короткий вопрос или создай compact stub с `status: DRAFT`, если flow уже создаёт операционный слой.

## Что записывать в Memory Bank

Если changelog mode включён, `mb-init` и `mb-upgrade` должны создать или обновить проектное правило:

```text
.memory-bank/spec/operations/changelog-policy.md
```

Если проект использует другой операционный слой, например `.memory-bank/docs/engineering/` или `.memory-bank/operations/`, используй локальную структуру, но сохрани смысл: changelog/versioning policy относится к operations/release процессу.

Минимальное содержание правила:

- где хранится changelog или release notes;
- кто/что назначает версию;
- когда запись добавляется в changelog;
- какие разделы используются, например `Новое`, `Изменения`, `Фиксы`;
- `Version Map`: где в проекте записана версия и какие поля/файлы надо обновлять при release bump;
- как связаны changelog, release tag, package version и deploy/rollout evidence;
- что делать, если изменение заметно пользователю, но релиз ещё не назначен;
- какие файлы и команды являются источниками правды.

Если проект уже имеет свою политику, не заменяй её канонической. Сохрани локальные названия разделов, формат дат и release workflow, а канон используй только для недостающих правил.

## Как обновлять changelog

Во время обычной работы flow не должен самовольно поднимать версию, если пользователь или проектная политика этого не требуют.

По умолчанию:

- новые заметные изменения попадают в `Нераспределено`, `Unreleased` или локальный аналог;
- если changelog генерируется tooling-ом, например Changesets, release-please, semantic-release or conventional commits, flow обновляет source input этого tooling-а (`.changeset/*`, release note fragment, conventional commit/PR metadata or local equivalent), а не generated `CHANGELOG.md`;
- версию релиза назначает пользователь, maintainer или автоматизированный release process проекта;
- patch/minor/major bump требует явного правила проекта или отдельного решения пользователя;
- changelog не заменяет protocol summary, run artifacts или evidence: он фиксирует пользовательски/операционно заметные изменения, а подробный audit trail остаётся в протоколах и отчетах.

## Multi-Repository And Package Targets

Если протокол меняет несколько репозиториев, пакетов, deployable artifacts или published tools, changelog gate работает не по одному "текущему" репозиторию, а по матрице changelog targets.

Минимальная матрица:

```markdown
| Target | Root / Artifact | Changelog source | Update source | Required entry | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| dd-memorybank canon | <repo> | CHANGELOG.md | manual `Нераспределено` | yes | updated | canonical flow change |
| example package | <repo> | generated CHANGELOG.md | `.changeset/*` | yes | updated | changelog generated at release |
```

Правила:

- каждый touched repository/package/artifact with its own release/version surface получает отдельную строку;
- source of truth для `Update source` берётся из `.memory-bank/project-policy.md`, `spec/operations/changelog-policy.md`, локальных release docs or detected tooling (`.changeset/`, release-please, semantic-release, conventional commits);
- если target имеет `CHANGELOG.md`, release notes, package version, release docs или явную policy/tooling, его changelog contour не может молча считаться `disabled`;
- canonical Memory Bank changelog не заменяет package/tool changelog inputs: если изменён `dd-flow-cli`, `mb-lint`, SDK, app package or deployable artifact, его changelog/release-note source проверяется отдельно;
- если `CHANGELOG.md` generated/derived, не редактируй его вручную в ordinary merge gate; создай или обнови configured source input and report that generated changelog will update during release/version gate;
- если target заметно изменён, но changelog target отсутствует, запиши `candidate`/`missing_target` и создай `DEF-*` or finding only when this affects current/future release work;
- если target изменён только внутренне и не имеет release surface, запиши `not_applicable_reason`;
- merge report должен показать матрицу целиком, чтобы было видно, какие targets updated, not applicable, deferred or blocked.

## Version Map

`Version Map` - это часть `spec/operations/changelog-policy.md`, которая говорит агенту, где в системе живёт версия и что надо обновлять при назначении релиза.

Рекомендуемый формат:

```markdown
## Version Map

| Target | File | Field / Pattern | Update Mode | Notes |
| --- | --- | --- | --- | --- |
| package | package.json | version | release_only | npm package version |
| changelog | CHANGELOG.md | Unreleased / version section | every_merge / release | merge writes Unreleased; release assigns version |
| docs | README.md | Current version text | release_only | human-facing version |
```

`Update Mode`:

- `every_merge` - обновляется после успешного merge, если изменение заметное;
- `release_only` - обновляется только при явном version bump;
- `derived` - генерируется tooling-ом, агент не меняет вручную;
- `manual` - требует решения пользователя или maintainer-а.

Типовые места версии:

- JavaScript/TypeScript/Node: `package.json`, package lockfiles, `.changeset/`, README badges, generated docs.
- Python: `pyproject.toml`, `setup.cfg`, `setup.py`, package `__version__`, generated metadata.
- Rust: `Cargo.toml`, `Cargo.lock`.
- Go: git tags, `ldflags`, generated `version` packages, release docs.
- Java/Kotlin/Gradle/Maven: `pom.xml`, `build.gradle`, `gradle.properties`.
- .NET: `.csproj`, `Directory.Build.props`, `AssemblyVersion`, `FileVersion`.
- Ruby: `.gemspec`, `lib/**/version.rb`.
- PHP: `composer.json`.
- Dart/Flutter: `pubspec.yaml`.
- iOS/macOS: `Info.plist` `CFBundleShortVersionString`, `CFBundleVersion`.
- Android: `versionName`, `versionCode`.
- Electron/Tauri/Expo: `package.json`, `tauri.conf.json`, `app.json`, app config.
- OpenAPI/AsyncAPI: `info.version`.
- Helm/Kubernetes: `Chart.yaml` `version`/`appVersion`, image tags, labels.
- Docker/OCI: image labels and tags, usually derived from CI/release tags.
- Documentation sites: docs config, README, badges, release notes pages.

Для `dd-memorybank` текущая карта версии:

```markdown
| Target | File | Field / Pattern | Update Mode | Notes |
| --- | --- | --- | --- | --- |
| canonical version | VERSION | whole file | release_only | Machine-readable Memory Bank canon version |
| changelog | CHANGELOG.md | `Нераспределено` and version sections | every_merge / release | Merge writes `Нераспределено`; release moves entries under version |
| root index | .memory-bank/index.md | `memory_bank_version` | release_only | Must match `VERSION` |
| repository README | README.md | `Current Memory Bank canon version` | release_only | Human-facing version |
| MBB index | .memory-bank/mbb/index.md | `Текущая версия канона Memory Bank` | release_only | Human-facing canonical version |
| compatibility manifest | .memory-bank/dd-flow/compatibility.json | `memory_bank_version`, `migrations.from_previous`, `migrations.to_this` | release_only | Update on every canon release; CLI/engine values change only when compatibility requirements change |
```

`release_only` означает, что изменение canonical compatibility manifest принадлежит release contour. `mb-upgrade` не придумывает новую migration window: он синхронизирует target copy с выбранным canon release и проверяет её schema/consistency. Если manifest не входит в выбранный project flow pack, upgrade обязан явно записать `not_applicable` с причиной.

## Merge Changelog Gate

После успешного real merge job агент должен обработать changelog до финального закрытия merge stage:

1. Прочитать `spec/operations/changelog-policy.md`, если он есть; иначе выполнить lightweight discovery по этому файлу.
2. Построить changelog target matrix для каждого затронутого repository/package/artifact/release surface.
3. Определить для каждого target, заметно ли изменение пользователю, оператору, интегратору, агентному flow или downstream-проектам.
4. Если изменение заметное и changelog contour существует, обновить configured source для соответствующего target: manual changelog section, `.changeset/*`, release note fragment, conventional commit/PR metadata or local equivalent.
5. Если changelog отсутствует, но changelog mode включён, создать `DEF-*` или finding: changelog policy есть, а changelog target отсутствует.
6. Не назначать новую версию без явного решения пользователя или project release policy.
7. В merge report написать `Version recommendation`: `patch`, `minor`, `major` или `none`, с краткой причиной. Для multi-target changes можно дать recommendation per target плюс общий release-set recommendation.
8. В merge report явно спросить/предложить следующий release шаг: присвоить версию сейчас, оставить в Unreleased или передать release process.

`code/readiness` может определить `changelog_impact` и подготовить draft entry, но финальную запись в changelog делает merge stage, потому что только merge знает, что принято.

## Release Version Gate

Версию можно менять только если:

- пользователь явно сказал присвоить версию;
- проектная release policy говорит, что merge stage обязан выполнить version bump;
- external release tooling already assigned a version, and agent only records the observed fact.

При version bump агент обязан:

1. выбрать patch/minor/major по проектной policy или решению пользователя;
2. обновить все `release_only` targets из `Version Map`;
3. перенести записи из `Нераспределено`/`Unreleased` в секцию новой версии, если changelog формат это требует;
4. обновить lockfiles/generated metadata только через проектные команды или явно пометить как derived/manual;
5. запустить проверки, достаточные для изменённых version files;
6. если релиз связан с package publish или runtime CLI, записать registry readback, local installed/linked readback, build metadata and compatibility verdict, либо явный publish/install deferral;
7. записать в отчёт старую версию, новую версию, изменённые targets и пропущенные targets с причиной.

When `release.md` runs, this gate is the primary version decision gate. When `publish.md` runs, the same gate applies before publication because publish includes release fixation. `deploy.md` should only change versions when project policy explicitly defines deploy as the versioning operation; otherwise it consumes an existing release/artifact.

## Что делать в `mb-init`

`mb-init` должен:

1. проверить README/docs/package/release sources на признаки changelog/versioning;
2. записать результат в `source-map.md` и `aspect-coverage.md` для operations aspect;
3. если changelog mode включён, создать `spec/operations/changelog-policy.md` или compact stub с локальными фактами;
4. связать policy из `.memory-bank/index.md`, `.memory-bank/structure.md` и operations index, если он создан;
5. если данных недостаточно, записать открытый вопрос в `open-questions.md`.

## Что делать в `mb-upgrade`

`mb-upgrade` должен:

1. проверить старый Memory Bank и проектные sources на существующую changelog/versioning практику;
2. не терять существующие release notes или version history при миграции;
3. если changelog mode включён, создать или обновить `spec/operations/changelog-policy.md`;
4. если changelog существует, но не связан из Memory Bank, добавить ссылку в operations/index/root index;
5. если формат changelog конфликтует с новым каноном, не переписывать историю без решения пользователя; создать `DEF-MBU-OPERATIONS-*` или вопрос.

## Отчёт

Итоговый отчёт flow должен содержать короткий `Changelog mode` блок:

- `enabled`, `candidate`, `disabled` или `unknown`;
- найденные sources;
- созданный/обновлённый policy file;
- открытые вопросы или DEF;
- нужно ли пользователю принять решение о версии релиза.
