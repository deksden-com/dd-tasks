import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseRuntimeProfile,
  type RuntimeProfile,
} from "./db/runtime-profile.js";

export type BuildMetadata = {
  sourceRevision: string;
  artifactDigest: string;
  buildRunId: string | null;
  builtAt: string | null;
  source: "baked" | "development-fallback";
};

export type RegistrationMode = "open" | "closed";

export type RegistrationPolicy = {
  mode: RegistrationMode;
  valid: boolean;
  source: "profile-default" | "explicit" | "invalid";
  reason?: "invalid_profile" | "invalid_registration_mode";
};

export type RuntimeConfig = {
  profile: RuntimeProfile | null;
  registration: RegistrationPolicy;
  runId: string | null;
  worldId: string | null;
  requireSeedMarker: boolean;
  build: BuildMetadata;
};

export function resolveRegistrationPolicy(
  profile: RuntimeProfile | null,
  rawMode: string | undefined,
): RegistrationPolicy {
  if (!profile) {
    return {
      mode: "closed",
      valid: false,
      source: "invalid",
      reason: "invalid_profile",
    };
  }

  if (rawMode === undefined) {
    return {
      mode: profile === "local" || profile === "test" ? "open" : "closed",
      valid: true,
      source: "profile-default",
    };
  }

  if (rawMode === "open" || rawMode === "closed") {
    return { mode: rawMode, valid: true, source: "explicit" };
  }

  return {
    mode: "closed",
    valid: false,
    source: "invalid",
    reason: "invalid_registration_mode",
  };
}

export function readBuildMetadata(
  environment: NodeJS.ProcessEnv = process.env,
): BuildMetadata {
  const metadataPath =
    environment.BUILD_METADATA_PATH ??
    resolve(process.cwd(), "build-metadata.json");
  if (existsSync(metadataPath)) {
    try {
      const value = JSON.parse(readFileSync(metadataPath, "utf8")) as Record<
        string,
        unknown
      >;
      if (
        typeof value.sourceRevision === "string" &&
        typeof value.artifactDigest === "string" &&
        value.sourceRevision.length > 0 &&
        value.artifactDigest.length > 0 &&
        value.sourceRevision !== "unknown" &&
        value.artifactDigest !== "unknown"
      ) {
        return {
          sourceRevision: value.sourceRevision,
          artifactDigest: value.artifactDigest,
          buildRunId:
            typeof value.buildRunId === "string" ? value.buildRunId : null,
          builtAt: typeof value.builtAt === "string" ? value.builtAt : null,
          source: "baked",
        };
      }
    } catch {
      // Readiness reports a generic not-ready state for invalid metadata.
    }
  }
  return {
    sourceRevision:
      environment.NODE_ENV === "production"
        ? ""
        : (environment.SOURCE_REVISION ?? "development"),
    artifactDigest:
      environment.NODE_ENV === "production"
        ? ""
        : (environment.ARTIFACT_DIGEST ?? "development-local"),
    buildRunId: null,
    builtAt: null,
    source: "development-fallback",
  };
}

export function createRuntimeConfig(
  environment: NodeJS.ProcessEnv = process.env,
): RuntimeConfig {
  const rawProfile =
    environment.RUNTIME_PROFILE ??
    (environment.NODE_ENV === "production"
      ? undefined
      : environment.NODE_ENV === "test"
        ? "test"
        : "local");
  const profile = parseRuntimeProfile(rawProfile);
  const registration = resolveRegistrationPolicy(
    profile,
    environment.PREVIEW_REGISTRATION_MODE,
  );
  const requireSeedMarker =
    environment.REQUIRE_SEED_MARKER === "true" ||
    profile?.startsWith("preview-") === true;
  return {
    profile,
    registration,
    runId: environment.RUNTIME_RUN_ID ?? environment.PREVIEW_RUN_ID ?? null,
    worldId: environment.EXPECTED_WORLD_ID ?? null,
    requireSeedMarker,
    build: readBuildMetadata(environment),
  };
}
