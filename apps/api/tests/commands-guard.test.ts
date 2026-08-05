import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("database command guard boundary", () => {
  it("rejects preview migrate before opening a SQL client", () => {
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "tsx/esm",
        resolve(process.cwd(), "src/db/commands.ts"),
        "migrate",
        "--profile",
        "preview-checkpoint",
        "--run-id",
        "RUN-300-preview-runtime",
        "--world-id",
        "wrong-world",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          DATABASE_URL:
            "postgresql://dd_tasks@postgres/dd_tasks_preview_checkpoint",
        },
      },
    );

    expect(result.status).toBe(2);
    const rejection = JSON.parse(result.stdout.trim());
    expect(rejection).toMatchObject({
      code: "TARGET_REJECTED",
      binding: "missing",
      mutated: false,
    });
    expect(`${result.stdout}${result.stderr}`).not.toMatch(
      /ECONNREFUSED|password|postgresql:\/\//i,
    );
  }, 20_000);
});
