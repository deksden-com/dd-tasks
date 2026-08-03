import { describe, expect, it } from "vitest";
import { classifyResetTarget } from "../src/db/target-guard.js";

describe("foundation reset target guard", () => {
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
});
