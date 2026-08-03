#!/usr/bin/env bash

set -euo pipefail

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)"
workspace_root="$(CDPATH= cd -- "$script_dir/../../../.." && pwd -P)"
cd "$workspace_root"

if [[ "$(git rev-parse --show-toplevel)" != "$workspace_root" ]]; then
  printf 'bootstrap blocked: workspace is not the repository root\n' >&2
  exit 2
fi

if ! command -v node >/dev/null 2>&1; then
  printf 'bootstrap blocked: node is unavailable\n' >&2
  exit 2
fi

if ! command -v pnpm >/dev/null 2>&1; then
  printf 'bootstrap blocked: pnpm is unavailable\n' >&2
  exit 2
fi

node_major="$(node -p 'process.versions.node.split(".")[0]')"
pnpm_major="$(pnpm --version | cut -d. -f1)"
if (( node_major < 22 )); then
  printf 'bootstrap blocked: Node 22 or newer is required\n' >&2
  exit 2
fi
if (( pnpm_major < 10 )); then
  printf 'bootstrap blocked: pnpm 10 or newer is required\n' >&2
  exit 2
fi

# pnpm deliberately refuses to replace an incompatible modules directory in a
# headless process unless CI mode is explicit. Codex and other agents run
# without a TTY, so make that execution context deterministic while preserving
# an operator-supplied CI value.
if [[ ! -t 0 && -z "${CI:-}" ]]; then
  export CI=true
fi

if [[ -f pnpm-lock.yaml ]]; then
  pnpm install --frozen-lockfile
else
  pnpm install --no-frozen-lockfile
fi

if ! command -v docker >/dev/null 2>&1; then
  printf 'bootstrap blocked: Docker is required for the local PostgreSQL contour\n' >&2
  exit 2
fi

docker compose version >/dev/null
docker compose up -d postgres >/dev/null

for attempt in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U dd_tasks -d dd_tasks_foundation_local >/dev/null 2>&1; then
    exit 0
  fi
  sleep 1
done

printf 'bootstrap failed: local PostgreSQL did not become ready within 30 seconds\n' >&2
exit 1
