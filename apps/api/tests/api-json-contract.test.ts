import { describe, expect, it } from "vitest";
import { createApiApp } from "../src/app.js";

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
});
