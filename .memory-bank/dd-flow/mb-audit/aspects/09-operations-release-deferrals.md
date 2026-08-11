# Аспект: операции, релизы и открытые отложения

## Цель

Проверить, что Банк памяти честно описывает путь изменения от ветки до окружений, приемки, релиза, отката и незакрытых ворот.

## Когда запускать

- перед релизом;
- после интеграции в develop;
- при настройке нового проекта;
- когда есть много `DEF-*` или неясно, что блокирует production.

## Нормативная база

- `.memory-bank/mbb/operations-release-guide.md`
- `.memory-bank/mbb/named-deferrals-guide.md`
- `.memory-bank/mbb/verification-matrix-guide.md`
- `.memory-bank/mbb/scenario-docs-guide.md`
- `.memory-bank/mbb/sdlc-workflow.md`
- `.memory-bank/defs/index.md`, если есть
- `.memory-bank/dd-flow/common/operational-access.md`
- `.memory-bank/dd-flow/workers/operational-access-discovery.md`
- `.memory-bank/dd-flow/workers/operational-access-review.md`

## Operational access workers

Аудит operational access выполняет focused `operational-access-review.md`. Если accepted discovery inventory отсутствует, устарел или не покрывает текущие scripts/workflows/configs/runbooks, оркестратор сначала запускает read-only `operational-access-discovery.md`, а затем передаёт его отчёт review worker-у.

Task packet должен указывать `common/worker-session.md`, role prompt, review scope, exact source inventory и report path. Оба worker-а read-only по умолчанию: они не логинятся, не обновляют authorization, не переключают account/team/project/subscription/context и не выполняют внешние мутации.

## Что читать в проекте

- `spec/operations/`;
- `.memory-bank/project-policy.md`;
- release docs, runbooks, deploy docs;
- протоколы последних выкладок;
- verification matrix;
- открытые `DEF-*`;
- `.memory-bank/defs/DEF-*.md` как canonical durable project DEF registry;
- active `DEF-MBU-*`, которые были converted to project deferral;
- CI configs, hosting configs и package scripts, если нужны для проверки фактических команд.
- operational-access policy, entity/runbook `access_binding_refs`, safe readback procedures and value-free preflight evidence;
- Git/provider/CLI mutation paths in scripts, task runners, workflows, release/deploy/publish/migration/backup runbooks and infrastructure configs.

## Что проверять

- описан ли поток Git (git flow): ветки, PR, интеграция, beta, production;
- различаются ли локальная готовность, готовность ветки, beta-приемка и production approval;
- описаны ли CI, preview, beta, staging, production;
- есть ли миграции, backup, rollback, секреты и внешние провайдеры;
- открытые `DEF-*` имеют владельца, следующий gate и понятное блокирующее действие;
- project-level DEF видны через `.memory-bank/defs/index.md` or active indexes/profile documents and not only raw `.tasks`;
- project-policy hub отражает Git/check/delivery/release/verification policy statuses and links to detailed owners;
- recent SDLC plan/code/merge stage reports carry `policy_context` or an explicit legacy/degraded reason when Git/check/delivery policy affected the work;
- merge reports distinguish workspace route from Git delivery/fixation strategy and do not claim `merged` with placeholder evidence such as `pending_batch_commit`;
- DEF close condition проверяем и связан с evidence/protocol/scenario/operations gate;
- rollout evidence bundle описан или применён там, где нужен.
- every discovered external mutating command has one explicit disposition: confirmed access binding, source-backed `not_applicable`, or open question/blocker/gate-relevant `DEF-*`;
- profile/binding/rule ids and forward/reverse `access_binding_refs` are valid, without dangling or orphan references;
- each applicable request resolves exactly one `profile + subject/entity + provider target + stage/environment + operation` rule;
- expected identity, authority and target facts have a project-owned source and are not inferred from current authenticated state;
- secrets/configuration availability, external authorization and operation approval remain separate;
- safe readback is exact, bounded, noninteractive and read-only, and mutating flows fail closed on missing, ambiguous, stale, mismatched or `not_observable` evidence;
- matching identity does not bypass authority or scoped, fresh, unrevoked approval.

## Признаки проблемы

- зелёный CI считается полной приемкой без сценариев;
- preview путается с beta;
- нет правил отката для изменения данных;
- `DEF-*` не имеет следующего gate;
- release runbook устарел относительно реальных команд.
- `project-policy.md` противоречит `spec/operations`, CI config, scripts, runbooks or recent protocol evidence.
- SDLC artifacts ignore project policy sources and make route/check/delivery decisions only in prose or runtime state.
- `merged/closed` is claimed while tracked durable changes are only dirty/local/unpushed or have placeholder commit evidence.
- external mutating command is unbound or absent from the investigated inventory;
- expected account/team/tenant/target was copied from `whoami` or current provider context without project policy/user authority;
- binding resolution is zero-match, duplicate, ambiguous or conflicting;
- dangling `access_binding_refs`, duplicated identity facts or secrets mixed into operational-access evidence;
- runtime path logs in, refreshes or switches provider context, treats credential presence as authority, or continues after missing/mismatched/stale/not-observable identity, authority, target or approval evidence.

## Что не считать проблемой

- маленький локальный инструмент может не иметь сложного release flow;
- production approval может быть внешним процессом, если это явно указано;
- не каждый `DEF-*` блокирует текущий scope, если его gate честно назван.
- operation may be source-backed `not_applicable` for operational access when policy proves no external authenticated mutation occurs;
- deterministic lint may validate ids, references and declared outcomes, but is not expected to infer the intended identity, authority or target.

## Какие `DEF-*` создавать

Группы: `OPS` или `DEFERRALS`.

Создавай `DEF-*`, если эксплуатационный путь неясен, опасен, противоречит фактическим командам или открытое отложение потеряло владельца и gate.

Если policy gap виден только как отсутствие зрелого описания, но не влияет на active gate, route selection, future agent work or safety, пометь его как `unknown_not_blocking` в audit report вместо шумного DEF.
