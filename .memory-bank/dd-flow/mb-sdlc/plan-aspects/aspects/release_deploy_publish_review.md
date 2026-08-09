---
file: '.memory-bank/dd-flow/mb-sdlc/plan-aspects/aspects/release_deploy_publish_review.md'
description: 'Aspect prompt for release, deploy and publish review.'
purpose: 'Keep release fixation, deployment and publishing targets distinct and evidence-backed.'
version: '0.1.1'
date: '2026-08-09'
status: 'ACTIVE'
c4_level: 'documentation'
parent: 'index.md'
design_stage: vertical_slice
depends_on: []
tags: [dd-flow, mb-sdlc, aspect, release, deploy, publish]
---

# Aspect: release_deploy_publish_review

Applies to version, changelog, release notes, tags, deploy/publish, registry/store or environment promotion changes.

Grounding sources: project policy, release/deploy/publish runbooks, changelog, package metadata, tags, deploy/provider evidence and rollback docs.

Plan review: distinguish release, deploy and publish; define target stage, rollback, readback and evidence.

Readiness review: ensure merge/delivery report does not claim stronger gate than evidence proves.

Blocking findings: release and deploy conflated, changelog target missing, publish readback omitted, rollback unsafe.

Acceptable DEF: production promotion deferred after source integration with explicit target and approval owner.
