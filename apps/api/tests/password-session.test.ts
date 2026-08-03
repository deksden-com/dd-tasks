import { describe, expect, it } from "vitest";
import {
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "../src/auth/password.js";
import { createSessionToken, hashSessionToken } from "../src/auth/session.js";

describe("account and session primitives", () => {
  it("normalizes email and verifies only the matching password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(normalizeEmail(" Owner@Example.Test ")).toBe("owner@example.test");
    expect(hash).not.toContain("correct horse battery staple");
    await expect(
      verifyPassword("correct horse battery staple", hash),
    ).resolves.toBe(true);
    await expect(verifyPassword("wrong password", hash)).resolves.toBe(false);
  });

  it("creates an opaque token and stores a deterministic hash", () => {
    const session = createSessionToken();
    expect(session.token).not.toBe(session.tokenHash);
    expect(session.tokenHash).toBe(hashSessionToken(session.token));
    expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
