import {
  isSafeBindingToken,
  parseRuntimeProfile,
  previewBindingFor,
  profileDatabaseName,
  type RuntimeProfile,
} from "./runtime-profile.js";

export type ResetTargetProfile = RuntimeProfile;

export type TargetClassification = {
  safe: boolean;
  target: string | null;
  hostClass: "loopback" | "internal" | "remote" | "unknown";
  databaseName: string | null;
  profile: RuntimeProfile | null;
  runId: string | null;
  binding: "not_required" | "valid" | "missing" | "mismatch";
  reason: string;
};

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export type MutationTargetInput = {
  databaseUrl?: string;
  profile?: string | null;
  target?: string | null;
  runId?: string | null;
  worldId?: string | null;
  composeProject?: string | null;
  volume?: string | null;
  operation?: "migrate" | "reset" | "seed" | "check";
  requireRunId?: boolean;
  requireWorldBinding?: boolean;
};

function rejected(
  input: MutationTargetInput,
  reason: string,
  fields: Partial<TargetClassification> = {},
): TargetClassification {
  return {
    safe: false,
    target: input.profile ?? input.target ?? null,
    hostClass: "unknown",
    databaseName: null,
    profile: parseRuntimeProfile(input.profile ?? input.target),
    runId: input.runId ?? null,
    binding: "not_required",
    reason,
    ...fields,
  };
}

function classifyBinding(
  input: MutationTargetInput,
  profile: RuntimeProfile,
): TargetClassification["binding"] {
  if (profile === "local" || profile === "test") return "not_required";
  if (!input.runId || !isSafeBindingToken(input.runId)) return "missing";
  if (!input.worldId || !input.composeProject || !input.volume)
    return "missing";
  const expected = previewBindingFor(profile, input.runId);
  return input.worldId === expected.worldId &&
    input.composeProject === expected.composeProject &&
    input.volume === expected.volume
    ? "valid"
    : "mismatch";
}

export function classifyMutationTarget(
  input: MutationTargetInput,
): TargetClassification {
  const requestedProfile = input.profile ?? input.target ?? null;
  const profile = parseRuntimeProfile(requestedProfile);
  if (!profile)
    return rejected(
      input,
      "explicit profile must be local, test, preview-checkpoint or preview-eval-output",
    );

  if (
    input.requireRunId &&
    (!input.runId || !isSafeBindingToken(input.runId))
  ) {
    return rejected(input, "a sanitized run id is required before mutation", {
      profile,
    });
  }

  const binding = classifyBinding(input, profile);
  const requiresBinding =
    profile.startsWith("preview-") &&
    (input.requireWorldBinding ??
      (input.operation !== "migrate" && input.operation !== "check"));
  if (requiresBinding && binding !== "valid") {
    return rejected(
      input,
      binding === "missing"
        ? "exact preview world binding is required before mutation"
        : "preview world binding does not match the run id",
      { profile, binding },
    );
  }
  if (binding === "mismatch") {
    return rejected(input, "preview world binding does not match the run id", {
      profile,
      binding,
    });
  }

  if (!input.databaseUrl)
    return rejected(input, "database URL is missing", { profile, binding });

  let url: URL;
  try {
    url = new URL(input.databaseUrl);
  } catch {
    return rejected(input, "database URL is malformed", { profile, binding });
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    return rejected(input, "database URL must use PostgreSQL", {
      profile,
      binding,
    });
  }
  if (url.search || url.hash) {
    return rejected(input, "database URL query and fragment are not allowed", {
      profile,
      binding,
    });
  }

  const host = url.hostname.toLowerCase();
  const isPreview = profile.startsWith("preview-");
  const hostClass = isPreview
    ? host === "postgres"
      ? "internal"
      : "remote"
    : LOOPBACK_HOSTS.has(host)
      ? "loopback"
      : "remote";
  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));
  const expectedPreviewDatabase = profileDatabaseName(profile);
  const databaseMatches = isPreview
    ? databaseName === expectedPreviewDatabase
    : new RegExp(
        `^dd_tasks_foundation_${profile}(?:_[a-z0-9][a-z0-9_-]*)?$`,
      ).test(databaseName);

  if (isPreview && hostClass !== "internal") {
    return rejected(
      input,
      "preview database host must be the exact internal postgres service",
      { profile, hostClass, databaseName, binding },
    );
  }
  if (!isPreview && hostClass !== "loopback") {
    return rejected(input, "database host must be loopback", {
      profile,
      hostClass,
      databaseName,
      binding,
    });
  }
  if (!databaseMatches) {
    return rejected(
      input,
      isPreview
        ? "database name must match the exact preview profile"
        : "database name must use the exact foundation profile prefix",
      { profile, hostClass, databaseName, binding },
    );
  }
  if (/(?:^|_)(?:prod|production|staging|shared)(?:_|$)/i.test(databaseName)) {
    return rejected(
      input,
      "production-like or shared database name is not allowed",
      { profile, hostClass, databaseName, binding },
    );
  }

  return {
    safe: true,
    target: requestedProfile,
    hostClass,
    databaseName,
    profile,
    runId: input.runId ?? null,
    binding,
    reason: "exact database profile and safety boundary accepted",
  };
}

export function classifyResetTarget(input: {
  databaseUrl?: string;
  target?: string;
  profile?: string;
  runId?: string | null;
  worldId?: string | null;
  composeProject?: string | null;
  volume?: string | null;
  operation?: MutationTargetInput["operation"];
  requireRunId?: boolean;
  requireWorldBinding?: boolean;
}): TargetClassification {
  return classifyMutationTarget(input);
}

export function parseCommandArgs(args: string[]): {
  runId: string | null;
  target: string | null;
  profile: string | null;
  worldId: string | null;
  composeProject: string | null;
  volume: string | null;
} {
  let runId: string | null = null;
  let profile: string | null = null;
  let worldId: string | null = null;
  let composeProject: string | null = null;
  let volume: string | null = null;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--run-id") {
      const value = args[index + 1];
      runId = value && /^[A-Za-z0-9_-]+$/.test(value) ? value : null;
      index += 1;
    }
    if (argument === "--target" || argument === "--profile") {
      profile = args[index + 1] ?? null;
      index += 1;
    }
    if (argument === "--world-id") {
      worldId = args[index + 1] ?? null;
      index += 1;
    }
    if (argument === "--compose-project") {
      composeProject = args[index + 1] ?? null;
      index += 1;
    }
    if (argument === "--volume") {
      volume = args[index + 1] ?? null;
      index += 1;
    }
  }

  return { runId, target: profile, profile, worldId, composeProject, volume };
}
