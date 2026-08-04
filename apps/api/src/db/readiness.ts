import type { Sql } from "postgres";
import type { RuntimeConfig } from "../runtime.js";
import { SEED_MARKER_KEY, seedMarkerValue } from "./fixtures.js";
import { migrationState } from "./migrations.js";

export type ReadinessCheck = {
  ready: boolean;
  reason:
    | "ready"
    | "invalid_profile"
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
  if (!config.build.sourceRevision || !config.build.artifactDigest) {
    return { ready: false, reason: "build_metadata_missing" };
  }

  try {
    const lock = await sql<{ available: boolean }[]>`
      SELECT pg_try_advisory_lock(42420302) AS available
    `;
    if (!lock[0]?.available)
      return { ready: false, reason: "initialization_in_progress" };
    await sql`SELECT pg_advisory_unlock(42420302)`;

    const state = await migrationState(sql);
    const idsComplete =
      state.applied.length === state.expected.length &&
      state.applied.every((id, index) => id === state.expected[index]);
    if (!idsComplete)
      return { ready: false, reason: "migration_ledger_incomplete" };
    const checksumsMatch = state.expected.every(
      (id) => state.appliedChecksums[id] === state.expectedChecksums[id],
    );
    if (!checksumsMatch)
      return { ready: false, reason: "migration_checksum_mismatch" };

    const tables = await sql<
      { foundation: string | null; tasks: string | null }[]
    >`
      SELECT to_regclass('public.foundation_metadata') AS foundation,
             to_regclass('public.tasks') AS tasks
    `;
    if (
      tables[0]?.foundation !== "foundation_metadata" ||
      tables[0]?.tasks !== "tasks"
    ) {
      return { ready: false, reason: "schema_incomplete" };
    }

    if (config.requireSeedMarker) {
      if (!config.runId || !config.worldId)
        return { ready: false, reason: "world_binding_missing" };
      const marker = await sql<{ value: string }[]>`
        SELECT value FROM foundation_metadata WHERE key = ${SEED_MARKER_KEY}
      `;
      const expected = seedMarkerValue(
        config.profile,
        config.runId,
        config.worldId,
      );
      if (!marker[0]) return { ready: false, reason: "seed_marker_missing" };
      if (marker[0].value !== expected)
        return { ready: false, reason: "seed_marker_mismatch" };
    }
    return { ready: true, reason: "ready" };
  } catch {
    return { ready: false, reason: "database_unavailable" };
  }
}
