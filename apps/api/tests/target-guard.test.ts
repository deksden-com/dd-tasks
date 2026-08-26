import { describe, expect, it } from "vitest";
import { getFlowScopedLocalDatabaseUrl } from "../src/db/client.js";
import { previewBindingFor } from "../src/db/runtime-profile.js";
import {
  classifyMutationTarget,
  classifyResetTarget,
} from "../src/db/target-guard.js";

describe("foundation reset target guard", () => {
  it("isolates a flow-owned local database without changing preview", () => {
    expect(
      getFlowScopedLocalDatabaseUrl(
        "postgresql://dd_tasks@127.0.0.1/dd_tasks_foundation_local",
        "RUN-001-task-priority",
        "a1b2c3d4e5f6",
      ),
    ).toContain("/dd_tasks_foundation_local_a1b2c3d4e5f6");
    expect(
      getFlowScopedLocalDatabaseUrl(
        "postgresql://dd_tasks@postgres/dd_tasks_preview_checkpoint",
        "RUN-001-task-priority",
        "a1b2c3d4e5f6",
      ),
    ).toContain("/dd_tasks_preview_checkpoint");
  });

  it.each([
    [
      "missing target",
      {
        databaseUrl:
          "postgresql://dd_tasks@127.0.0.1/dd_tasks_foundation_local",
      },
    ],
    ["malformed URL", { databaseUrl: "not-a-database-url", target: "local" }],
    [
      "remote host",
      {
        databaseUrl:
          "postgresql://dd_tasks@db.example/dd_tasks_foundation_local",
        target: "local",
      },
    ],
    [
      "production-like name",
      {
        databaseUrl:
          "postgresql://dd_tasks@127.0.0.1/dd_tasks_foundation_production",
        target: "local",
      },
    ],
    [
      "unrecognized profile",
      {
        databaseUrl:
          "postgresql://dd_tasks@127.0.0.1/dd_tasks_foundation_local",
        target: "staging",
      },
    ],
    [
      "profile mismatch",
      {
        databaseUrl:
          "postgresql://dd_tasks@127.0.0.1/dd_tasks_foundation_local",
        target: "test",
      },
    ],
  ])("rejects %s before mutation", (_label, input) => {
    const classification = classifyResetTarget(input);

    expect(classification.safe).toBe(false);
    expect(classification.reason).toEqual(expect.any(String));
    expect(classification.reason).not.toMatch(/postgres:\/\//);
  });

  it("accepts only a loopback foundation database", () => {
    const classification = classifyResetTarget({
      databaseUrl:
        "postgresql://dd_tasks@127.0.0.1/dd_tasks_foundation_local_20260801_001_scn001",
      target: "local",
    });

    expect(classification).toMatchObject({
      databaseName: "dd_tasks_foundation_local_20260801_001_scn001",
      hostClass: "loopback",
      safe: true,
      target: "local",
    });
  });

  it("does not require preview bindings for local reset callers", () => {
    expect(
      classifyMutationTarget({
        databaseUrl:
          "postgresql://dd_tasks@127.0.0.1/dd_tasks_foundation_local",
        profile: "local",
        runId: "SCN002",
        operation: "reset",
        requireRunId: true,
        requireWorldBinding: true,
      }),
    ).toMatchObject({ safe: true, binding: "not_required" });
  });

  it("accepts the exact internal preview binding", () => {
    const binding = previewBindingFor(
      "preview-checkpoint",
      "RUN-300-preview-runtime",
    );
    expect(
      classifyMutationTarget({
        databaseUrl:
          "postgresql://dd_tasks:secret@postgres:5432/dd_tasks_preview_checkpoint",
        profile: "preview-checkpoint",
        runId: binding.runId,
        worldId: binding.worldId,
        composeProject: binding.composeProject,
        volume: binding.volume,
        operation: "seed",
        requireRunId: true,
        requireWorldBinding: true,
      }),
    ).toMatchObject({
      safe: true,
      hostClass: "internal",
      databaseName: "dd_tasks_preview_checkpoint",
      binding: "valid",
    });
  });

  it("rejects preview migrate without the exact world binding", () => {
    const result = classifyMutationTarget({
      databaseUrl: "postgresql://dd_tasks@postgres/dd_tasks_preview_checkpoint",
      profile: "preview-checkpoint",
      runId: "RUN-300-preview-runtime",
      operation: "migrate",
      requireRunId: true,
      requireWorldBinding: true,
    });

    expect(result).toMatchObject({
      safe: false,
      binding: "missing",
    });
    expect(result.reason).toMatch(/world binding/i);
  });

  it.each([
    ["missing profile", { profile: undefined }],
    [
      "remote preview host",
      {
        profile: "preview-checkpoint",
        databaseUrl:
          "postgresql://dd_tasks@db.example/dd_tasks_preview_checkpoint",
      },
    ],
    [
      "preview database mismatch",
      {
        profile: "preview-checkpoint",
        databaseUrl:
          "postgresql://dd_tasks@postgres/dd_tasks_preview_eval_output",
      },
    ],
    [
      "query is not accepted",
      {
        profile: "preview-checkpoint",
        databaseUrl:
          "postgresql://dd_tasks@postgres/dd_tasks_preview_checkpoint?sslmode=disable",
      },
    ],
  ])("rejects %s before a mutating client can be opened", (_label, partial) => {
    const binding = previewBindingFor(
      "preview-checkpoint",
      "RUN-300-preview-runtime",
    );
    const result = classifyMutationTarget({
      databaseUrl:
        partial.databaseUrl ??
        "postgresql://dd_tasks@postgres/dd_tasks_preview_checkpoint",
      profile: partial.profile,
      runId: binding.runId,
      worldId: binding.worldId,
      composeProject: binding.composeProject,
      volume: binding.volume,
      operation: "reset",
      requireRunId: true,
      requireWorldBinding: true,
    });
    expect(result.safe).toBe(false);
    expect(result.reason).not.toMatch(/postgres:|secret|password/i);
  });

  it("rejects a stale world/project/volume tuple", () => {
    const binding = previewBindingFor(
      "preview-eval-output",
      "RUN-300-preview-runtime",
    );
    expect(
      classifyMutationTarget({
        databaseUrl:
          "postgresql://dd_tasks@postgres:5432/dd_tasks_preview_eval_output",
        profile: "preview-eval-output",
        runId: binding.runId,
        worldId: binding.worldId,
        composeProject: `${binding.composeProject}-stale`,
        volume: binding.volume,
        operation: "reset",
        requireRunId: true,
        requireWorldBinding: true,
      }),
    ).toMatchObject({ safe: false, binding: "mismatch" });
  });
});
