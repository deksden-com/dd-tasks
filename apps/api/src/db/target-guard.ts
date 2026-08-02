export type ResetTargetProfile = "local" | "test";

export type TargetClassification = {
  safe: boolean;
  target: string | null;
  hostClass: "loopback" | "remote" | "unknown";
  databaseName: string | null;
  reason: string;
};

const FOUNDATION_DATABASE_PATTERN =
  /^dd_tasks_foundation_(local|test)(?:_[a-z0-9][a-z0-9_-]*)?$/;
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function classifyResetTarget(input: {
  databaseUrl?: string;
  target?: string;
}): TargetClassification {
  const target = input.target ?? null;
  if (target !== "local" && target !== "test") {
    return {
      safe: false,
      target,
      hostClass: "unknown",
      databaseName: null,
      reason: "explicit target must be local or test",
    };
  }

  if (!input.databaseUrl) {
    return {
      safe: false,
      target,
      hostClass: "unknown",
      databaseName: null,
      reason: "database URL is missing",
    };
  }

  let url: URL;
  try {
    url = new URL(input.databaseUrl);
  } catch {
    return {
      safe: false,
      target,
      hostClass: "unknown",
      databaseName: null,
      reason: "database URL is malformed",
    };
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    return {
      safe: false,
      target,
      hostClass: "unknown",
      databaseName: null,
      reason: "database URL must use PostgreSQL",
    };
  }

  const host = url.hostname.toLowerCase();
  const hostClass = LOOPBACK_HOSTS.has(host) ? "loopback" : "remote";
  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));

  if (hostClass !== "loopback") {
    return {
      safe: false,
      target,
      hostClass,
      databaseName: null,
      reason: "database host must be loopback",
    };
  }

  if (!FOUNDATION_DATABASE_PATTERN.test(databaseName)) {
    return {
      safe: false,
      target,
      hostClass,
      databaseName,
      reason:
        "database name must use the dd_tasks_foundation_ local/test prefix",
    };
  }

  if (/(?:^|_)(?:prod|production|staging|shared)(?:_|$)/i.test(databaseName)) {
    return {
      safe: false,
      target,
      hostClass,
      databaseName,
      reason: "production-like database name is not allowed",
    };
  }

  return {
    safe: true,
    target,
    hostClass,
    databaseName,
    reason: "loopback foundation target accepted",
  };
}

export function parseCommandArgs(args: string[]): {
  runId: string | null;
  target: string | null;
} {
  let runId: string | null = null;
  let target: string | null = null;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--run-id") {
      const value = args[index + 1];
      runId = value && /^[A-Za-z0-9_-]+$/.test(value) ? value : null;
      index += 1;
    }
    if (argument === "--target") {
      target = args[index + 1] ?? null;
      index += 1;
    }
  }

  return { runId, target };
}
