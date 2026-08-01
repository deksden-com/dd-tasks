# Prime Scout: Operations

## Цель

Понять операционный контур работы: ветка, место создания протокола, worktree, bootstrap, push, PR, CI, preview, beta, production и rollback.

## Прочитай и проверь

- `.memory-bank/dd-flow/common/git-ops.md`;
- `.memory-bank/spec/operations/`, если есть;
- `.memory-bank/mbb/operations-release-guide.md`;
- `git status --short --branch`;
- CI и hosting-конфиги: `.github/workflows/`, Vercel, Netlify, Docker, deploy scripts, если есть;
- README или runbook, если проект хранит операционные правила там.
- setup/bootstrap документы, `.env.example`/`.env.local.example`, lockfile и package manager конфиги.

## Ответь

- Какая текущая ветка?
- Есть ли чужие или несвязанные изменения?
- Какая ветка интеграционная?
- Можно ли делать маленькую правку прямо в текущей/интеграционной ветке?
- Нужна ли feature branch или worktree?
- Если нужен worktree, где должен создаваться протокол?
- Какие bootstrap-шаги нужны для нового worktree: секреты без раскрытия значений, зависимости, setup-команды?
- Нужен ли push, PR, CI, preview, beta или production?
- Что произойдет после merge в интеграционную ветку?
- Есть ли rollback или deployment gate?
- Какие policy sources должны войти в будущий `policy_context`: `.memory-bank/project-policy.md`, `spec/operations/*`, CI/check docs, release/deploy/publish runbooks, active `DEF-*`?
- Какая ожидаемая `policy_context.git.delivery_strategy`: `direct_commit`, `direct_commit_push`, `feature_merge`, `pull_request`, `merge_queue`, `squash_merge`, `rebase_ff`, `release_branch`, `external_handoff`, `local_only` или `no_git`?

## Рекомендации для flow profile

Подскажи:

- `route.git`: `integration_branch_direct` или `feature_worktree`;
- `workspace.protocol_location`, `integration_branch`, `feature_branch`, `worktree_path`, `bootstrap`;
- `route.delivery`: `local`, `preview`, `beta` или `production`;
- `route.ci`: `none`, `if_push`, `required` или `unavailable`;
- `policy_context.git.delivery_strategy` and required evidence for closure;
- `impact.operations`: затрагиваются ли CI, deploy, release или rollback;
- `execution.mode`: нужны ли scouts, workers или verifiers для операционного контура.
