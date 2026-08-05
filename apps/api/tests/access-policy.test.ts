import { describe, expect, it } from "vitest";
import { createApiApp } from "../src/app.js";
import {
  createRuntimeConfig,
  type RuntimeConfig,
  resolveRegistrationPolicy,
} from "../src/runtime.js";

const build = {
  sourceRevision: "revision-test",
  artifactDigest: "sha256:test",
  buildRunId: null,
  builtAt: null,
  source: "baked" as const,
};

const runtime = (
  registration: RuntimeConfig["registration"],
): RuntimeConfig => ({
  profile: "preview-checkpoint",
  registration,
  runId: "policy-test",
  worldId: "world_preview_policy_test",
  requireSeedMarker: false,
  build,
});

describe("preview access policy", () => {
  it("keeps local and test defaults open while preview defaults closed", () => {
    expect(resolveRegistrationPolicy("local", undefined)).toMatchObject({
      mode: "open",
      valid: true,
      source: "profile-default",
    });
    expect(resolveRegistrationPolicy("test", undefined)).toMatchObject({
      mode: "open",
      valid: true,
    });
    expect(
      resolveRegistrationPolicy("preview-checkpoint", undefined),
    ).toMatchObject({
      mode: "closed",
      valid: true,
    });
  });

  it("fails closed for unknown profiles and unsupported registration values", () => {
    expect(resolveRegistrationPolicy(null, undefined)).toMatchObject({
      mode: "closed",
      valid: false,
      reason: "invalid_profile",
    });
    expect(resolveRegistrationPolicy("preview-checkpoint", "")).toMatchObject({
      mode: "closed",
      valid: false,
      reason: "invalid_registration_mode",
    });
    expect(
      createRuntimeConfig({
        NODE_ENV: "production",
        RUNTIME_PROFILE: "unknown",
      }),
    ).toMatchObject({
      profile: null,
      registration: { mode: "closed", valid: false },
    });
  });

  it("serves the exact public config shape", async () => {
    const app = createApiApp({ environment: "test" });
    const response = await app.request("/api/config");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ registration_mode: "open" });
  });

  it("rejects closed registration before parsing or mutating the request", async () => {
    const app = createApiApp({
      environment: "production",
      runtime: runtime({ mode: "closed", valid: true, source: "explicit" }),
    });
    const response = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not-json",
    });
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({
      code: "REGISTRATION_CLOSED",
      message: "Registration is closed",
    });
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("fails closed for invalid policy without reaching body validation", async () => {
    const app = createApiApp({
      environment: "production",
      runtime: runtime({
        mode: "closed",
        valid: false,
        source: "invalid",
        reason: "invalid_registration_mode",
      }),
    });
    expect((await app.request("/api/config")).status).toBe(503);
    const response = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not-json",
    });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: "NOT_READY" });
  });
});
