import { createHash, randomBytes, randomUUID } from "node:crypto";

export const SESSION_COOKIE = "dd_tasks_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

export function createSessionToken(): {
  id: string;
  token: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const token = randomBytes(32).toString("base64url");
  return {
    id: randomUUID(),
    token,
    tokenHash: hashSessionToken(token),
    expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
  };
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
