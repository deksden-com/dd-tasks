import type { Sql } from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApiApp } from "../src/app.js";
import { createSqlClient } from "../src/db/client.js";
import {
  DEMO_PASSWORD,
  resetProductData,
  seedDemoData,
} from "../src/db/fixtures.js";
import { applyMigrations, migrationState } from "../src/db/migrations.js";

const sql: Sql<Record<string, unknown>> = createSqlClient();
const app = createApiApp({ environment: "test", sql });

function cookieOf(response: Response): string {
  const value = response.headers.get("set-cookie");
  if (!value) throw new Error("session cookie missing");
  return value.split(";", 1)[0] ?? "";
}

async function login(email: string): Promise<string> {
  const response = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: DEMO_PASSWORD }),
  });
  expect(response.status).toBe(200);
  return cookieOf(response);
}

async function jsonRequest(
  path: string,
  cookie: string,
  method = "GET",
  input?: unknown,
) {
  return app.request(path, {
    method,
    headers: {
      cookie,
      ...(input === undefined ? {} : { "content-type": "application/json" }),
    },
    body: input === undefined ? undefined : JSON.stringify(input),
  });
}

beforeAll(async () => {
  await Promise.all([applyMigrations(sql), applyMigrations(sql)]);
  await resetProductData(sql);
  await seedDemoData(sql);
});

afterAll(async () => {
  await sql`UPDATE sessions SET revoked_at = now() WHERE revoked_at IS NULL`;
  await sql.end({ timeout: 5 });
});

describe("checkpoint-02 core API", () => {
  it("keeps the migration chain complete and constrained", async () => {
    const state = await migrationState(sql);
    expect(state.applied).toEqual(state.expected);
    const rows = await sql<{ constraint_name: string }[]>`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name = 'tasks' AND constraint_name = 'tasks_workspace_project_fk'
    `;
    expect(rows).toHaveLength(1);
  });

  it("supports owner workspace, project lifecycle, and task CRUD", async () => {
    const cookie = await login("owner@example.test");
    const workspaces = await jsonRequest("/api/workspaces", cookie);
    expect(await workspaces.json()).toMatchObject({
      workspaces: [
        { id: "ws-alpha", role: "owner" },
        { id: "ws-beta", role: "member" },
      ],
    });

    const createdProjectResponse = await jsonRequest(
      "/api/workspaces/ws-alpha/projects",
      cookie,
      "POST",
      { name: "Acceptance project" },
    );
    expect(createdProjectResponse.status).toBe(201);
    const createdProject = (await createdProjectResponse.json()).project as {
      id: string;
    };

    const renamed = await jsonRequest(
      `/api/workspaces/ws-alpha/projects/${createdProject.id}`,
      cookie,
      "PATCH",
      { name: "Renamed acceptance project" },
    );
    expect(await renamed.json()).toMatchObject({
      project: { name: "Renamed acceptance project" },
    });

    const createdTaskResponse = await jsonRequest(
      `/api/workspaces/ws-alpha/projects/${createdProject.id}/tasks`,
      cookie,
      "POST",
      { title: "Acceptance task", description: "created through the API" },
    );
    expect(createdTaskResponse.status).toBe(201);
    const createdTask = (await createdTaskResponse.json()).task as {
      id: string;
    };
    const updated = await jsonRequest(
      `/api/workspaces/ws-alpha/projects/${createdProject.id}/tasks/${createdTask.id}`,
      cookie,
      "PATCH",
      { title: "Updated task", description: null },
    );
    expect(await updated.json()).toMatchObject({
      task: { title: "Updated task" },
    });

    expect(
      (
        await jsonRequest(
          `/api/workspaces/ws-alpha/projects/${createdProject.id}/archive`,
          cookie,
          "POST",
        )
      ).status,
    ).toBe(200);

    const defaultProjects = await jsonRequest(
      "/api/workspaces/ws-alpha/projects",
      cookie,
    );
    expect(
      ((await defaultProjects.json()).projects as { id: string }[]).some(
        (project) => project.id === createdProject.id,
      ),
    ).toBe(false);
    const archivedProjects = await jsonRequest(
      "/api/workspaces/ws-alpha/projects?includeArchived=true",
      cookie,
    );
    expect(
      ((await archivedProjects.json()).projects as { id: string }[]).some(
        (project) => project.id === createdProject.id,
      ),
    ).toBe(true);
    const blocked = await jsonRequest(
      `/api/workspaces/ws-alpha/projects/${createdProject.id}/tasks`,
      cookie,
      "POST",
      { title: "Must be blocked" },
    );
    expect(blocked.status).toBe(409);
    expect(await blocked.json()).toMatchObject({ code: "PROJECT_ARCHIVED" });
    expect(
      (
        await jsonRequest(
          `/api/workspaces/ws-alpha/projects/${createdProject.id}/restore`,
          cookie,
          "POST",
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await jsonRequest(
          `/api/workspaces/ws-alpha/projects/${createdProject.id}/tasks/${createdTask.id}`,
          cookie,
          "DELETE",
        )
      ).status,
    ).toBe(204);
  });

  it("enforces owner/member and workspace isolation on the API", async () => {
    const member = await login("member@example.test");
    const forbidden = await jsonRequest(
      "/api/workspaces/ws-alpha/projects",
      member,
      "POST",
      { name: "No" },
    );
    expect(forbidden.status).toBe(403);
    expect(await forbidden.json()).toMatchObject({ code: "FORBIDDEN" });

    const memberTask = await jsonRequest(
      "/api/workspaces/ws-alpha/projects/project-alpha-active/tasks",
      member,
      "POST",
      { title: "Member-owned task path" },
    );
    expect(memberTask.status).toBe(201);
    expect(await memberTask.json()).toMatchObject({
      task: { title: "Member-owned task path" },
    });

    const beta = await jsonRequest("/api/workspaces/ws-beta/projects", member);
    expect(beta.status).toBe(404);
    expect(await beta.json()).toMatchObject({
      code: "NOT_FOUND",
      message: "Not found",
    });

    const outsider = await login("outsider@example.test");
    expect(
      (await jsonRequest("/api/workspaces/ws-alpha/projects", outsider)).status,
    ).toBe(404);
  });

  it("revokes logout sessions and rejects tampered cookies", async () => {
    const cookie = await login("owner@example.test");
    expect((await jsonRequest("/api/auth/me", cookie)).status).toBe(200);
    expect((await jsonRequest("/api/auth/logout", cookie, "POST")).status).toBe(
      204,
    );
    expect((await jsonRequest("/api/auth/me", cookie)).status).toBe(401);
    expect(
      (await jsonRequest("/api/auth/me", "dd_tasks_session=tampered")).status,
    ).toBe(401);
  });

  it("registers exactly once and rotates or expires server-side sessions", async () => {
    const register = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "new.account@example.test",
        password: "new-account-password",
      }),
    });
    expect(register.status).toBe(201);
    expect((await register.json()).account).toMatchObject({
      email: "new.account@example.test",
    });
    const duplicate = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "NEW.ACCOUNT@example.test",
        password: "new-account-password",
      }),
    });
    expect(duplicate.status).toBe(409);

    const first = await login("owner@example.test");
    const second = await login("owner@example.test");
    expect((await jsonRequest("/api/auth/me", first)).status).toBe(401);
    expect((await jsonRequest("/api/auth/me", second)).status).toBe(200);

    await sql`
      UPDATE sessions SET expires_at = now() - interval '1 second'
      WHERE account_id = 'acct-owner' AND revoked_at IS NULL
    `;
    expect((await jsonRequest("/api/auth/me", second)).status).toBe(401);
  });

  it("prevents a task from pointing at a project in another workspace", async () => {
    await expect(
      sql`INSERT INTO tasks (id, workspace_id, project_id, title) VALUES ('bad-cross-scope', 'ws-alpha', 'project-beta-active', 'bad')`,
    ).rejects.toMatchObject({ code: "23503" });
  });
});
