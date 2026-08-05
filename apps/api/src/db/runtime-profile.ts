import { createHash } from "node:crypto";

export const RUNTIME_PROFILES = [
  "local",
  "test",
  "preview-checkpoint",
  "preview-eval-output",
] as const;

export type RuntimeProfile = (typeof RUNTIME_PROFILES)[number];

export type PreviewBinding = {
  profile: Extract<
    RuntimeProfile,
    "preview-checkpoint" | "preview-eval-output"
  >;
  runId: string;
  worldId: string;
  composeProject: string;
  volume: string;
  databaseName: string;
  databaseHost: "postgres";
};

export function parseRuntimeProfile(
  value: string | null | undefined,
): RuntimeProfile | null {
  return RUNTIME_PROFILES.includes(value as RuntimeProfile)
    ? (value as RuntimeProfile)
    : null;
}

export function isSafeBindingToken(
  value: string | null | undefined,
): value is string {
  return Boolean(value && /^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(value));
}

export function profileDatabaseName(profile: RuntimeProfile): string | null {
  if (profile === "preview-checkpoint") return "dd_tasks_preview_checkpoint";
  if (profile === "preview-eval-output") return "dd_tasks_preview_eval_output";
  return null;
}

function bindingSlug(runId: string): string {
  const readable = runId
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 16);
  const identity = createHash("sha256")
    .update(runId)
    .digest("hex")
    .slice(0, 10);
  return `${readable || "run"}_${identity}`;
}

export function previewBindingFor(
  profile: Extract<
    RuntimeProfile,
    "preview-checkpoint" | "preview-eval-output"
  >,
  runId: string,
): PreviewBinding {
  const slug = bindingSlug(runId);
  const profileSlug = profile.replaceAll("-", "_");
  return {
    profile,
    runId,
    worldId: `world_${profileSlug}_${slug}`,
    composeProject: `dd_tasks_${profileSlug}_${slug}`,
    volume: `dd_tasks_${profileSlug}_${slug}_pgdata`,
    databaseName: profileDatabaseName(profile) as string,
    databaseHost: "postgres",
  };
}
