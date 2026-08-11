# Policy presets

Presets are compact vocabulary. They are not strict automation and do not override project policy.

A prompt may use a preset to initialize a policy draft, summarize discovered rules, or ask a shorter user question. Project-specific policy always wins.

## Git flow presets

- `simple-main`: direct integration in `main`; small projects, prototypes, local tools.
- `single-main`: legacy alias for `simple-main`.
- `feature-to-main`: feature branch/worktree from `main`, then PR or merge back to `main`.
- `develop-feature`: feature branches from `develop`, integration back to `develop`.
- `develop-main-release`: `develop` for integration/beta, `main` for release/production.
- `feature-to-develop-main-release`: legacy alias for `develop-main-release`.
- `release-branch`: release branch cut from integration branch, then promote to `main` or production branch.
- `integration-queue`: merge queue owns integration order.
- `worktree-isolated`: feature worktrees are required for agent work.
- `pr-required`: human/platform pull request gate is mandatory.
- `local-only`: no publication yet; final report must say what remains to publish.

When migrating old docs, preserve existing preset names and add aliases. Do not silently rename a project policy.

## Stage chain presets

- `local-only`: local checkout only.
- `local-dev`: local plus shared development stage.
- `local-preview-prod`: local checks, preview smoke, production delivery.
- `local-dev-preview-staging-prod`: development, preview, staging and production.
- `develop-beta-main-prod`: `develop` feeds beta/staging, `main` feeds production/release.
- `package-registry-release`: release artifact is a package registry version.
- `mobile-store-release`: release artifact goes through store review or internal mobile distribution.
- `docs-static-site-release`: documentation/static site deployment is a delivery target.

Use `runtime_stage` for runnable environments such as `local`, `preview`, `beta`, `staging`, `prod`. Use `deploy_provider` for the platform that hosts/executes the runtime, and `deploy_target` for the concrete provider project/environment/deployment URL/id. Use `delivery_target` for destinations such as `package-registry`, `store-review`, `extension-store`, `static-publication-target`, or `container-registry`; call it `publish_target` only when a publish flow uses it.

Vercel, Netlify, Render, Fly, Railway, Cloudflare Pages, Kubernetes and ECS are deploy providers for runtime stages by default. They are not package/store publish targets unless project policy explicitly says that a public static/documentation publication is a release+publish operation.

## Release presets

- `changelog-only`: release is a documented change set without versioned artifact delivery.
- `version-file`: version is stored in a file or manifest.
- `git-tag`: release is fixed by a tag.
- `github-release` / `gitlab-release`: release notes and artifact links live on the hosting platform.
- `package-publish`: package version is the release artifact.
- `container-image`: image tag/digest is the release artifact.
- `mobile-build`: signed build or store submission is the release artifact.
- `docs-site-release`: versioned documentation or static site release.
- `ci-release-pipeline`: CI creates release artifacts.

For each release preset, record version source, changelog target, dry-run support, credentials, idempotency, artifact evidence and user approval requirements.

## Deploy presets

- `manual-command`: operator runs a documented command.
- `git-push-triggered`: branch push or tag push triggers deployment.
- `ci-cd-pipeline`: pipeline deploys to a named stage.
- `vercel-preview`: branch or PR creates a preview.
- `vercel-production`: production deployment to a Vercel runtime stage.
- `container-rollout`: container image rollout to a runtime stage.
- `helm-k8s`: Kubernetes/Helm deployment.
- `package-publish-as-delivery`: publishing is also the delivery event.
- `app-store-submit`: store submission/review is the delivery path.
- `static-site-publish`: static build is published to a hosting target.

For each deploy preset, record pre-deploy gates, command/trigger, target stage, post-deploy checks, rollback or roll-forward, and evidence location.

## Verification contours

- `unit`: local unit tests.
- `integration`: local or CI integration tests.
- `contract`: schema/API/SDK contract proof.
- `browser`: browser or UI proof.
- `fixture_smoke`: smoke with controlled fixtures.
- `e2e`: end-to-end path across system boundaries.
- `migration`: migration/apply/idempotency/rollback proof.
- `manual_acceptance`: human/operator acceptance.
- `production_readonly_smoke`: read-only production check after approval.

Each acceptance scenario should name a target stage, verification contour, evidence, and gate status.
