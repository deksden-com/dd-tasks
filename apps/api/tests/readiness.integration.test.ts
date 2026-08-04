import type { Sql } from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApiApp } from "../src/app.js";
import { createSqlClient } from "../src/db/client.js";
import { seedDemoData } from "../src/db/fixtures.js";
import { applyMigrations, migrationState } from "../src/db/migrations.js";
import type { RuntimeConfig } from "../src/runtime.js";

const sql: Sql<Record<string, unknown>> = createSqlClient();
const runtime: RuntimeConfig = {
  profile: "local",
  runId: "SCN002",
  worldId: "world_local_scn002",
  requireSeedMarker: true,
  build: {
    sourceRevision: "2db129c5d16aee8de782dfdcea157897e2777002",
    artifactDigest: "sha256:test-artifact",
    buildRunId: "SCN002",
    builtAt: "2026-08-04T00:00:00Z",
    source: "baked",
  },
};

beforeAll(async () => {
  await applyMigrations(sql);
  await seedDemoData(sql, {
    profile: "local",
    runId: "SCN002",
    worldId: "world_local_scn002",
  });
});

afterAll(async () => {
  await sql.end({ timeout: 5 });
});

describe("readiness contract", () => {
  it("reports liveness and seeded readiness without database values", async () => {
    const app = createApiApp({ environment: "test", sql, runtime });
    const health = await app.request("/api/health");
    const ready = await app.request("/api/ready");
    expect(health.status).toBe(200);
    expect(ready.status).toBe(200);
    const body = await ready.json();
    expect(body).toMatchObject({
      status: "ready",
      service: "dd-tasks-api",
      revision: {
        sourceRevision: runtime.build.sourceRevision,
        artifactDigest: runtime.build.artifactDigest,
      },
    });
    expect(JSON.stringify(body)).not.toMatch(
      /postgres|password|secret|\/Users\//i,
    );
  });

  it("fails closed on a checksum mismatch with a generic response", async () => {
    const state = await migrationState(sql);
    const expectedChecksum = state.expectedChecksums["0000_foundation.sql"];
    await sql`UPDATE foundation_migrations SET checksum = 'tampered' WHERE id = '0000_foundation.sql'`;
    const app = createApiApp({ environment: "test", sql, runtime });
    const ready = await app.request("/api/ready");
    expect(ready.status).toBe(503);
    expect(await ready.json()).toMatchObject({
      code: "NOT_READY",
      message: "Service is not ready",
    });
    await sql`UPDATE foundation_migrations SET checksum = ${expectedChecksum} WHERE id = '0000_foundation.sql'`;
  });
});
