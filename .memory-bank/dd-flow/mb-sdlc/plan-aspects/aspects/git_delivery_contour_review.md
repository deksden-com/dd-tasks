---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/git_delivery_contour_review.md'
description: 'Aspect prompt for Git delivery contour review.'
purpose: 'Check workspace route, branch ownership, fixation evidence and cleanup/retention expectations.'
version: '0.1.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: vertical_slice
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, git, delivery]
---

# Aspect: git_delivery_contour_review

Applies to code/docs changes, feature worktree, merge queue, release/deploy/publish or branch policy.

Grounding sources: project policy, `common/git-ops.md`, plan/code/merge reports, current branch, worktree status, merge queue status and retention policy.

Plan review: identify Git route, integration branch, delivery/fixation strategy, branch cleanup policy and required evidence.

Readiness review: compare actual branch/worktree to policy; ensure merge can produce commit/push/PR/queue evidence and no placeholder "merged" claim remains.

Blocking findings: wrong worktree, untracked required files, missing fixation evidence, manual merge outside CLI queue when queue is required.

Acceptable DEF: future release/deploy/publish gate, not source integration evidence.
