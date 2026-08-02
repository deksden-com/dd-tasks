import { Hono } from "hono";
import {
  type ApiEnv,
  type ApiEnvironment,
  createRequestId,
  healthResponse,
  notFoundResponse,
  requestContext,
  shouldInjectUnexpected,
  unexpectedErrorResponse,
} from "./contracts/http.js";

export function createApiApp(options: { environment?: ApiEnvironment } = {}) {
  const app = new Hono<ApiEnv>();
  const environment = options.environment;

  app.use("*", async (c, next) => {
    if (environment) {
      c.set("environment", environment);
      c.set("requestId", createRequestId());
      await next();
      return;
    }
    await requestContext(c, next);
  });

  app.get("/api/health", (c) => {
    if (shouldInjectUnexpected(c)) {
      return unexpectedErrorResponse(c);
    }
    return healthResponse(c);
  });

  app.notFound((c) => notFoundResponse(c));
  app.onError((_error, c) => unexpectedErrorResponse(c));

  return app;
}
