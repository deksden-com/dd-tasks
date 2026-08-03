import { type Context, Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Sql } from "postgres";
import { validateCredentials } from "./auth/password.js";
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from "./auth/session.js";
import {
  type ApiEnv,
  type ApiEnvironment,
  createRequestId,
  healthResponse,
  notFoundResponse,
  publicErrorResponse,
  requestContext,
  shouldInjectUnexpected,
  unexpectedErrorResponse,
} from "./contracts/http.js";
import { CoreError, CoreService } from "./core/service.js";
import { createSqlClient } from "./db/client.js";

export function createApiApp(
  options: {
    environment?: ApiEnvironment;
    sql?: Sql<Record<string, unknown>>;
  } = {},
) {
  const app = new Hono<ApiEnv>();
  const environment = options.environment;
  const core = new CoreService(options.sql ?? createSqlClient());

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

  const account = async (c: Context<ApiEnv>) =>
    core.accountForToken(getCookie(c, SESSION_COOKIE));
  const body = async (c: Context<ApiEnv>): Promise<Record<string, unknown>> => {
    try {
      return await c.req.json();
    } catch {
      throw new CoreError(400, "VALIDATION_ERROR", "A JSON body is required");
    }
  };
  const setSession = (c: Context<ApiEnv>, token: string) =>
    setCookie(c, SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
      secure: c.get("environment") === "production",
    });

  app.post("/api/auth/register", async (c) => {
    const input = await body(c);
    const validation = validateCredentials(input.email, input.password);
    if (validation) throw new CoreError(400, "VALIDATION_ERROR", validation);
    const result = await core.register(
      String(input.email),
      String(input.password),
    );
    setSession(c, result.session.token);
    return c.json({ account: result.account }, 201);
  });
  app.post("/api/auth/login", async (c) => {
    const input = await body(c);
    const validation = validateCredentials(input.email, input.password);
    if (validation) throw new CoreError(400, "VALIDATION_ERROR", validation);
    const result = await core.login(
      String(input.email),
      String(input.password),
    );
    setSession(c, result.session.token);
    return c.json({ account: result.account }, 200);
  });
  app.post("/api/auth/logout", async (c) => {
    await core.logout(getCookie(c, SESSION_COOKIE));
    deleteCookie(c, SESSION_COOKIE, { path: "/" });
    return c.body(null, 204);
  });
  app.get("/api/auth/me", async (c) => c.json({ account: await account(c) }));

  app.get("/api/workspaces", async (c) => {
    const actor = await account(c);
    return c.json({ workspaces: await core.listWorkspaces(actor.id) });
  });
  app.post("/api/workspaces", async (c) => {
    const actor = await account(c);
    const input = await body(c);
    return c.json(
      { workspace: await core.createWorkspace(actor.id, input.name) },
      201,
    );
  });
  app.get("/api/workspaces/:workspaceId/projects", async (c) => {
    const actor = await account(c);
    const includeArchived = c.req.query("includeArchived") === "true";
    return c.json({
      projects: await core.listProjects(
        actor.id,
        c.req.param("workspaceId"),
        includeArchived,
      ),
    });
  });
  app.post("/api/workspaces/:workspaceId/projects", async (c) => {
    const actor = await account(c);
    const input = await body(c);
    return c.json(
      {
        project: await core.createProject(
          actor.id,
          c.req.param("workspaceId"),
          input.name,
        ),
      },
      201,
    );
  });
  app.patch("/api/workspaces/:workspaceId/projects/:projectId", async (c) => {
    const actor = await account(c);
    const input = await body(c);
    return c.json({
      project: await core.renameProject(
        actor.id,
        c.req.param("workspaceId"),
        c.req.param("projectId"),
        input.name,
      ),
    });
  });
  app.post(
    "/api/workspaces/:workspaceId/projects/:projectId/archive",
    async (c) => {
      const actor = await account(c);
      return c.json({
        project: await core.setProjectArchived(
          actor.id,
          c.req.param("workspaceId"),
          c.req.param("projectId"),
          true,
        ),
      });
    },
  );
  app.post(
    "/api/workspaces/:workspaceId/projects/:projectId/restore",
    async (c) => {
      const actor = await account(c);
      return c.json({
        project: await core.setProjectArchived(
          actor.id,
          c.req.param("workspaceId"),
          c.req.param("projectId"),
          false,
        ),
      });
    },
  );
  app.get(
    "/api/workspaces/:workspaceId/projects/:projectId/tasks",
    async (c) => {
      const actor = await account(c);
      return c.json(
        await core.listTasks(
          actor.id,
          c.req.param("workspaceId"),
          c.req.param("projectId"),
        ),
      );
    },
  );
  app.post(
    "/api/workspaces/:workspaceId/projects/:projectId/tasks",
    async (c) => {
      const actor = await account(c);
      return c.json(
        {
          task: await core.createTask(
            actor.id,
            c.req.param("workspaceId"),
            c.req.param("projectId"),
            await body(c),
          ),
        },
        201,
      );
    },
  );
  app.patch(
    "/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId",
    async (c) => {
      const actor = await account(c);
      return c.json({
        task: await core.updateTask(
          actor.id,
          c.req.param("workspaceId"),
          c.req.param("projectId"),
          c.req.param("taskId"),
          await body(c),
        ),
      });
    },
  );
  app.delete(
    "/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId",
    async (c) => {
      const actor = await account(c);
      await core.deleteTask(
        actor.id,
        c.req.param("workspaceId"),
        c.req.param("projectId"),
        c.req.param("taskId"),
      );
      return c.body(null, 204);
    },
  );

  app.notFound((c) => notFoundResponse(c));
  app.onError((error, c) => {
    if (error instanceof CoreError) {
      return publicErrorResponse(c, error.status, error.code, error.message);
    }
    return unexpectedErrorResponse(c);
  });

  return app;
}
