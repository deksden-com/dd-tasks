import { describe, expect, it } from "vitest";
import { createApiApp } from "../src/app.js";
import {
  isTaskPriority,
  TASK_PRIORITIES,
  type TaskJson,
} from "../src/contracts/http.js";
import { createSqlClient } from "../src/db/client.js";
import { DEMO_PASSWORD, seedDemoData } from "../src/db/fixtures.js";
import { applyMigrations } from "../src/db/migrations.js";
import { TEST_DATABASE_URL } from "./global-setup.js";

const allowedHealthKeys = ["requestId", "service", "status"];
const allowedErrorKeys = ["code", "message", "requestId"];

function keysOf(value: object): string[] {
  return Object.keys(value).sort();
}

function assertJsonContentType(response: Response): void {
  expect(response.headers.get("content-type")).toMatch(/^application\/json/);
}

describe("foundation API JSON contract", () => {
  it("returns a generated request id for health without reflecting caller input", async () => {
    const app = createApiApp({ environment: "test" });
    const response = await app.request("/api/health", {
      headers: { "x-request-id": "caller-controlled-value" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    assertJsonContentType(response);
    expect(keysOf(body)).toEqual(allowedHealthKeys);
    expect(body).toMatchObject({ status: "ok", service: "dd-tasks-api" });
    expect(body.requestId).toEqual(expect.any(String));
    expect(body.requestId).not.toBe("caller-controlled-value");
    expect(JSON.stringify(body)).not.toMatch(
      /caller-controlled|stack|sql|postgres|password/i,
    );
  });

  it("returns the exact expected JSON shape for the foundation missing probe", async () => {
    const app = createApiApp({ environment: "test" });
    const response = await app.request("/api/__foundation_missing__");
    const body = await response.json();

    expect(response.status).toBe(404);
    assertJsonContentType(response);
    expect(keysOf(body)).toEqual(allowedErrorKeys);
    expect(body).toMatchObject({ code: "NOT_FOUND", message: "Not found" });
    expect(body.requestId).toEqual(expect.any(String));
    expect(JSON.stringify(body)).not.toMatch(
      /stack|sql|postgres|password|\/Users\//i,
    );
  });

  it("keeps the bare API prefix out of the SPA fallback", async () => {
    const app = createApiApp({ environment: "test", staticRoot: "." });
    const response = await app.request("/api");
    const body = await response.json();

    expect(response.status).toBe(404);
    assertJsonContentType(response);
    expect(body).toMatchObject({ code: "NOT_FOUND", message: "Not found" });
  });

  it("maps the local/test fault seam to a generic value-free error", async () => {
    const app = createApiApp({ environment: "test" });
    const response = await app.request("/api/health", {
      headers: { "x-foundation-test-fault": "unexpected" },
    });
    const body = await response.json();

    expect(response.status).toBe(500);
    assertJsonContentType(response);
    expect(keysOf(body)).toEqual(allowedErrorKeys);
    expect(body).toMatchObject({
      code: "INTERNAL_ERROR",
      message: "Unexpected server error",
    });
    expect(body.requestId).toEqual(expect.any(String));
    expect(JSON.stringify(body)).not.toMatch(
      /stack|sql|postgres|password|\/Users\//i,
    );
  });

  it("does not advertise credentialed wildcard CORS", async () => {
    const app = createApiApp({ environment: "test" });
    const response = await app.request("/api/health", {
      headers: { Origin: "http://127.0.0.1:4173" },
    });

    expect(response.headers.get("access-control-allow-origin")).not.toBe("*");
    expect(response.headers.get("access-control-allow-credentials")).not.toBe(
      "true",
    );
  });

  it("includes task.priority as low, medium or high on list, create and update JSON", async () => {
    const allowedTaskKeys = ["description", "id", "priority", "title"];
    const sql = createSqlClient(TEST_DATABASE_URL);
    const app = createApiApp({ environment: "test", sql });
    const tasksPath =
      "/api/workspaces/ws-alpha/projects/project-alpha-active/tasks";

    const assertTaskJson = (task: unknown): TaskJson => {
      expect(task).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
        }),
      );
      const record = task as TaskJson;
      expect(keysOf(record)).toEqual(allowedTaskKeys);
      expect(TASK_PRIORITIES).toContain(record.priority);
      expect(isTaskPriority(record.priority)).toBe(true);
      return record;
    };

    try {
      await applyMigrations(sql);
      await seedDemoData(sql);

      const login = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "member@example.test",
          password: DEMO_PASSWORD,
        }),
      });
      expect(login.status).toBe(200);
      const cookie = login.headers.get("set-cookie")?.split(";", 1)[0];
      if (!cookie) throw new Error("session cookie missing");

      const listResponse = await app.request(tasksPath, {
        headers: { cookie },
      });
      expect(listResponse.status).toBe(200);
      assertJsonContentType(listResponse);
      const listBody = await listResponse.json();
      expect(Array.isArray(listBody.tasks)).toBe(true);
      expect(listBody.tasks.length).toBeGreaterThan(0);
      for (const task of listBody.tasks as unknown[]) {
        assertTaskJson(task);
      }

      const createResponse = await app.request(tasksPath, {
        method: "POST",
        headers: { cookie, "content-type": "application/json" },
        body: JSON.stringify({
          title: "Contract high task",
          priority: "high",
        }),
      });
      expect(createResponse.status).toBe(201);
      assertJsonContentType(createResponse);
      const created = assertTaskJson((await createResponse.json()).task);
      expect(created.priority).toBe("high");

      const updateResponse = await app.request(`${tasksPath}/${created.id}`, {
        method: "PATCH",
        headers: { cookie, "content-type": "application/json" },
        body: JSON.stringify({
          title: "Contract low task",
          priority: "low",
        }),
      });
      expect(updateResponse.status).toBe(200);
      assertJsonContentType(updateResponse);
      const updated = assertTaskJson((await updateResponse.json()).task);
      expect(updated.id).toBe(created.id);
      expect(updated.priority).toBe("low");

      expect([...TASK_PRIORITIES]).toEqual(["low", "medium", "high"]);
      expect(isTaskPriority("High")).toBe(false);
      expect(isTaskPriority("Medium")).toBe(false);
      expect(isTaskPriority("Low")).toBe(false);
      expect(isTaskPriority(null)).toBe(false);
      expect(isTaskPriority("")).toBe(false);
      expect(isTaskPriority("urgent")).toBe(false);
    } finally {
      await sql.end({ timeout: 5 });
    }
  });
});
