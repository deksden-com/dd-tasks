import type { Sql } from "postgres";
import type { RuntimeConfig } from "../runtime.js";
import { SEED_MARKER_KEY, seedMarkerValue } from "./fixtures.js";
import {
  migrationState,
  migrationStateMatches,
  type QuerySql,
} from "./migrations.js";

export type ReadinessCheck = {
  ready: boolean;
  reason:
    | "ready"
    | "invalid_profile"
    | "policy_invalid"
    | "build_metadata_missing"
    | "database_unavailable"
    | "migration_ledger_incomplete"
    | "migration_checksum_mismatch"
    | "schema_incomplete"
    | "initialization_in_progress"
    | "seed_marker_missing"
    | "seed_marker_mismatch"
    | "world_binding_missing";
};

export async function checkReadiness(
  sql: Sql<Record<string, unknown>>,
  config: RuntimeConfig,
): Promise<ReadinessCheck> {
  if (!config.profile) return { ready: false, reason: "invalid_profile" };
  if (!config.registration.valid) {
    return { ready: false, reason: "policy_invalid" };
  }
  const profile = config.profile;
  if (
    !config.build.sourceRevision ||
    !config.build.artifactDigest ||
    (config.requireSeedMarker && config.build.source !== "baked")
  ) {
    return { ready: false, reason: "build_metadata_missing" };
  }

  try {
    return await sql.begin(async (transaction) => {
      const lock = await transaction<{ available: boolean }[]>`
        SELECT pg_try_advisory_xact_lock(42420302) AS available
      `;
      if (!lock[0]?.available)
        return { ready: false, reason: "initialization_in_progress" };

      const state = await migrationState(transaction as unknown as QuerySql);
      if (state.applied.length !== state.expected.length) {
        return { ready: false, reason: "migration_ledger_incomplete" };
      }
      if (!migrationStateMatches(state)) {
        return { ready: false, reason: "migration_checksum_mismatch" };
      }

      const tables = await transaction<{ table_name: string | null }[]>`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN (
            'accounts', 'sessions', 'workspaces', 'memberships',
            'projects', 'tasks', 'foundation_metadata'
          )
        ORDER BY table_name
      `;
      const requiredTables = new Set([
        "accounts",
        "sessions",
        "workspaces",
        "memberships",
        "projects",
        "tasks",
        "foundation_metadata",
      ]);
      if (
        new Set(tables.map((row) => row.table_name)).size !==
          requiredTables.size ||
        tables.some((row) => !requiredTables.has(row.table_name ?? ""))
      ) {
        return { ready: false, reason: "schema_incomplete" };
      }

      if (config.requireSeedMarker) {
        if (!config.runId || !config.worldId)
          return { ready: false, reason: "world_binding_missing" };
        const marker = await transaction<{ value: string }[]>`
          SELECT value FROM foundation_metadata WHERE key = ${SEED_MARKER_KEY}
        `;
        const expected = seedMarkerValue(profile, config.runId, config.worldId);
        if (!marker[0]) return { ready: false, reason: "seed_marker_missing" };
        if (marker[0].value !== expected)
          return { ready: false, reason: "seed_marker_mismatch" };
      }
      return { ready: true, reason: "ready" };
    });
  } catch {
    return { ready: false, reason: "database_unavailable" };
  }
}
