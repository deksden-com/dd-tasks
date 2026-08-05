import { randomUUID } from "node:crypto";
import type { Context, Next } from "hono";
import type { RegistrationMode } from "../runtime.js";

export type ApiEnvironment = "development" | "test" | "production";

export type ApiEnv = {
  Variables: {
    environment: ApiEnvironment;
    requestId: string;
  };
};

export const API_CONTRACT = {
  healthPath: "/api/health",
  missingPath: "/api/__foundation_missing__",
  service: "dd-tasks-api",
  testFaultHeader: "x-foundation-test-fault",
} as const;

export type HealthResponse = {
  status: "ok";
  service: typeof API_CONTRACT.service;
  requestId: string;
};

export type ReadyResponse = {
  status: "ready";
  service: typeof API_CONTRACT.service;
  requestId: string;
  revision: {
    sourceRevision: string;
    artifactDigest: string;
  };
};

export type RegistrationConfigResponse = {
  registration_mode: RegistrationMode;
};

export type PublicErrorResponse = {
  code:
    | "NOT_FOUND"
    | "INTERNAL_ERROR"
    | "UNAUTHENTICATED"
    | "FORBIDDEN"
    | "VALIDATION_ERROR"
    | "CONFLICT"
    | "REGISTRATION_CLOSED"
    | "PROJECT_ARCHIVED"
    | "NOT_READY";
  message: string;
  requestId: string;
};

export function publicErrorResponse(
  c: Context<ApiEnv>,
  status: 400 | 401 | 403 | 404 | 409 | 500 | 503,
  code: PublicErrorResponse["code"],
  message: string,
): Response {
  return c.json({ code, message, requestId: c.get("requestId") }, status);
}

export function resolveEnvironment(
  value = process.env.NODE_ENV,
): ApiEnvironment {
  if (value === "production") {
    return "production";
  }
  if (value === "test") {
    return "test";
  }
  return "development";
}

export function createRequestId(): string {
  return randomUUID();
}

export async function requestContext(
  c: Context<ApiEnv>,
  next: Next,
): Promise<void> {
  c.set("environment", resolveEnvironment());
  c.set("requestId", createRequestId());
  await next();
}

export function shouldInjectUnexpected(c: Context<ApiEnv>): boolean {
  return (
    c.get("environment") !== "production" &&
    c.req.header(API_CONTRACT.testFaultHeader) === "unexpected"
  );
}

export function healthResponse(c: Context<ApiEnv>): Response {
  const body: HealthResponse = {
    status: "ok",
    service: API_CONTRACT.service,
    requestId: c.get("requestId"),
  };
  return c.json(body, 200);
}

export function readyResponse(
  c: Context<ApiEnv>,
  revision: ReadyResponse["revision"],
): Response {
  const body: ReadyResponse = {
    status: "ready",
    service: API_CONTRACT.service,
    requestId: c.get("requestId"),
    revision,
  };
  return c.json(body, 200);
}

export function registrationConfigResponse(
  c: Context<ApiEnv>,
  mode: RegistrationMode,
): Response {
  const body: RegistrationConfigResponse = { registration_mode: mode };
  return c.json(body, 200);
}

export function notFoundResponse(c: Context<ApiEnv>): Response {
  const body: PublicErrorResponse = {
    code: "NOT_FOUND",
    message: "Not found",
    requestId: c.get("requestId"),
  };
  return c.json(body, 404);
}

export function unexpectedErrorResponse(c: Context<ApiEnv>): Response {
  const body: PublicErrorResponse = {
    code: "INTERNAL_ERROR",
    message: "Unexpected server error",
    requestId: c.get("requestId"),
  };
  return c.json(body, 500);
}
