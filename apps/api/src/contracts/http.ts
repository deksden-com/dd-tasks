import { randomUUID } from "node:crypto";
import type { Context, Next } from "hono";

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

export type PublicErrorResponse = {
  code: "NOT_FOUND" | "INTERNAL_ERROR";
  message: "Not found" | "Unexpected server error";
  requestId: string;
};

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
