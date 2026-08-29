import type { Sql } from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApiApp } from "../src/app.js";
import { createSqlClient } from "../src/db/client.js";
import {
  DEMO_PASSWORD,
  resetProductData,
  seedDemoData,
} from "../src/db/fixtures.js";
import {
  applyMigrations,
  migrationState,
  resetAndMigrate,
} from "../src/db/migrations.js";

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

  it("backfills a 0001-era task without priority to medium after 0002", async () => {
    try {
      await resetAndMigrate(sql, { until: "0001_checkpoint_02_core.sql" });
      await sql`
        INSERT INTO workspaces (id, name)
        VALUES ('ws-upgrade-priority', 'Upgrade workspace')
      `;
      await sql`
        INSERT INTO projects (id, workspace_id, name)
        VALUES ('project-upgrade-priority', 'ws-upgrade-priority', 'Upgrade project')
      `;
      await sql`
        INSERT INTO tasks (id, workspace_id, project_id, title)
        VALUES (
          'task-upgrade-no-priority',
          'ws-upgrade-priority',
          'project-upgrade-priority',
          'Persisted before priority'
        )
      `;
      const before = await sql<{ column_name: string }[]>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tasks'
          AND column_name = 'priority'
      `;
      expect(before).toHaveLength(0);

      const applied = await applyMigrations(sql);
      expect(applied).toEqual(["0002_task_priority.sql"]);

      const rows = await sql<{ priority: string }[]>`
        SELECT priority::text AS priority
        FROM tasks
        WHERE id = 'task-upgrade-no-priority'
      `;
      expect(rows).toEqual([{ priority: "medium" }]);
    } finally {
      await resetAndMigrate(sql);
      await seedDemoData(sql);
    }
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
    const createdTaskJson = await createdTaskResponse.json();
    expect(createdTaskJson).toMatchObject({
      task: { title: "Acceptance task", priority: "medium" },
    });
    const createdTask = createdTaskJson.task as { id: string };
    const updated = await jsonRequest(
      `/api/workspaces/ws-alpha/projects/${createdProject.id}/tasks/${createdTask.id}`,
      cookie,
      "PATCH",
      { title: "Updated task", description: null },
    );
    expect(await updated.json()).toMatchObject({
      task: { title: "Updated task", priority: "medium" },
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
      task: { title: "Member-owned task path", priority: "medium" },
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

    const outsiderTasks = await jsonRequest(
      "/api/workspaces/ws-alpha/projects/project-alpha-active/tasks",
      outsider,
    );
    expect(outsiderTasks.status).toBe(404);
    const outsiderBody = await outsiderTasks.json();
    expect(outsiderBody).toMatchObject({
      code: "NOT_FOUND",
      message: "Not found",
    });
    expect(JSON.stringify(outsiderBody)).not.toMatch(
      /priority|task-alpha-one|"low"|"medium"|"high"/i,
    );
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

  it("assigns, defaults, preserves and rejects task priority on existing routes", async () => {
    const member = await login("member@example.test");
    const tasksPath =
      "/api/workspaces/ws-alpha/projects/project-alpha-active/tasks";

    const highCreate = await jsonRequest(tasksPath, member, "POST", {
      title: "Priority high task",
      priority: "high",
    });
    expect(highCreate.status).toBe(201);
    const highTask = (await highCreate.json()).task as {
      id: string;
      priority: string;
    };
    expect(highTask.priority).toBe("high");

    const listedHigh = await jsonRequest(tasksPath, member);
    expect(listedHigh.status).toBe(200);
    const listedHighBody = await listedHigh.json();
    expect(
      (
        listedHighBody.tasks as {
          id: string;
          title: string;
          priority: string;
        }[]
      ).some(
        (task) =>
          task.id === highTask.id &&
          task.title === "Priority high task" &&
          task.priority === "high",
      ),
    ).toBe(true);

    const omittedCreate = await jsonRequest(tasksPath, member, "POST", {
      title: "Priority omitted task",
    });
    expect(omittedCreate.status).toBe(201);
    const omittedTask = (await omittedCreate.json()).task as {
      id: string;
      priority: string;
    };
    expect(omittedTask.priority).toBe("medium");

    const listedOmitted = await jsonRequest(tasksPath, member);
    expect(
      (
        (await listedOmitted.json()).tasks as {
          id: string;
          priority: string;
        }[]
      ).some(
        (task) => task.id === omittedTask.id && task.priority === "medium",
      ),
    ).toBe(true);

    const toLow = await jsonRequest(
      `${tasksPath}/${omittedTask.id}`,
      member,
      "PATCH",
      { title: "Priority omitted task", priority: "low" },
    );
    expect(toLow.status).toBe(200);
    expect(await toLow.json()).toMatchObject({
      task: { id: omittedTask.id, priority: "low" },
    });
    const listedLow = await jsonRequest(tasksPath, member);
    expect(
      (
        (await listedLow.json()).tasks as { id: string; priority: string }[]
      ).some((task) => task.id === omittedTask.id && task.priority === "low"),
    ).toBe(true);

    const titleOnly = await jsonRequest(
      `${tasksPath}/${highTask.id}`,
      member,
      "PATCH",
      { title: "Priority high task renamed" },
    );
    expect(titleOnly.status).toBe(200);
    expect(await titleOnly.json()).toMatchObject({
      task: {
        id: highTask.id,
        title: "Priority high task renamed",
        priority: "high",
      },
    });

    const beforeInvalid = await jsonRequest(tasksPath, member);
    const beforeCount = ((await beforeInvalid.json()).tasks as unknown[])
      .length;
    for (const priority of [null, "", "High", "urgent"]) {
      const rejectedCreate = await jsonRequest(tasksPath, member, "POST", {
        title: "Must not persist",
        priority,
      });
      expect(rejectedCreate.status).toBe(400);
      expect(await rejectedCreate.json()).toMatchObject({
        code: "VALIDATION_ERROR",
      });
      const rejectedUpdate = await jsonRequest(
        `${tasksPath}/${highTask.id}`,
        member,
        "PATCH",
        { title: "Priority high task renamed", priority },
      );
      expect(rejectedUpdate.status).toBe(400);
      expect(await rejectedUpdate.json()).toMatchObject({
        code: "VALIDATION_ERROR",
      });
    }
    const afterInvalid = await jsonRequest(tasksPath, member);
    const afterBody = await afterInvalid.json();
    expect((afterBody.tasks as unknown[]).length).toBe(beforeCount);
    expect(
      (afterBody.tasks as { id: string; priority: string }[]).some(
        (task) => task.id === highTask.id && task.priority === "high",
      ),
    ).toBe(true);
  });

  it("keeps archived-project task lists readable and rejects priority writes", async () => {
    const owner = await login("owner@example.test");
    const createdProjectResponse = await jsonRequest(
      "/api/workspaces/ws-alpha/projects",
      owner,
      "POST",
      { name: "Priority archive project" },
    );
    expect(createdProjectResponse.status).toBe(201);
    const project = (await createdProjectResponse.json()).project as {
      id: string;
    };
    const tasksPath = `/api/workspaces/ws-alpha/projects/${project.id}/tasks`;
    const createdTaskResponse = await jsonRequest(tasksPath, owner, "POST", {
      title: "Archive priority task",
      priority: "low",
    });
    expect(createdTaskResponse.status).toBe(201);
    const task = (await createdTaskResponse.json()).task as { id: string };

    expect(
      (
        await jsonRequest(
          `/api/workspaces/ws-alpha/projects/${project.id}/archive`,
          owner,
          "POST",
        )
      ).status,
    ).toBe(200);

    const listed = await jsonRequest(tasksPath, owner);
    expect(listed.status).toBe(200);
    expect(await listed.json()).toMatchObject({
      project: { id: project.id },
      tasks: [{ id: task.id, title: "Archive priority task", priority: "low" }],
    });

    const blockedUpdate = await jsonRequest(
      `${tasksPath}/${task.id}`,
      owner,
      "PATCH",
      { title: "Archive priority task", priority: "high" },
    );
    expect(blockedUpdate.status).toBe(409);
    expect(await blockedUpdate.json()).toMatchObject({
      code: "PROJECT_ARCHIVED",
    });
    const blockedCreate = await jsonRequest(tasksPath, owner, "POST", {
      title: "Must stay blocked",
      priority: "high",
    });
    expect(blockedCreate.status).toBe(409);
    expect(await blockedCreate.json()).toMatchObject({
      code: "PROJECT_ARCHIVED",
    });

    const stillListed = await jsonRequest(tasksPath, owner);
    expect(await stillListed.json()).toMatchObject({
      tasks: [{ id: task.id, priority: "low" }],
    });
  });

  it("hides another workspace's tasks and priority from non-members", async () => {
    const member = await login("member@example.test");
    const beta = await jsonRequest(
      "/api/workspaces/ws-beta/projects/project-beta-active/tasks",
      member,
    );
    expect(beta.status).toBe(404);
    const betaBody = await beta.json();
    expect(betaBody).toMatchObject({
      code: "NOT_FOUND",
      message: "Not found",
    });
    expect(JSON.stringify(betaBody)).not.toMatch(
      /priority|task-beta-one|"low"|"medium"|"high"/i,
    );

    const outsider = await login("outsider@example.test");
    const patched = await jsonRequest(
      "/api/workspaces/ws-alpha/projects/project-alpha-active/tasks/task-alpha-one",
      outsider,
      "PATCH",
      { title: "Write the first task", priority: "high" },
    );
    expect(patched.status).toBe(404);
    expect(await patched.json()).toMatchObject({
      code: "NOT_FOUND",
      message: "Not found",
    });
  });
});
