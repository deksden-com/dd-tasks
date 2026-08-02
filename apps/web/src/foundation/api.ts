import {
  type HealthResponse,
  normalizePublicError,
  type PublicApiError,
} from "./foundation-contract.js";

export class FoundationApiError extends Error {
  public readonly publicError: PublicApiError;

  public constructor(publicError: PublicApiError) {
    super(publicError.message);
    this.name = "FoundationApiError";
    this.publicError = publicError;
  }
}

export async function fetchFoundationHealth(
  signal?: AbortSignal,
): Promise<HealthResponse> {
  try {
    const response = await fetch("/api/health", { signal });
    const body: unknown = await response.json();
    if (!response.ok) {
      throw new FoundationApiError(normalizePublicError(body, response.status));
    }
    if (
      typeof body !== "object" ||
      body === null ||
      !("status" in body) ||
      !("service" in body) ||
      !("requestId" in body) ||
      body.status !== "ok" ||
      body.service !== "dd-tasks-api" ||
      typeof body.requestId !== "string"
    ) {
      throw new FoundationApiError({
        code: "INTERNAL_ERROR",
        message: "Unexpected server error",
      });
    }
    return body as HealthResponse;
  } catch (error) {
    if (error instanceof FoundationApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new FoundationApiError({
      code: "INTERNAL_ERROR",
      message: "Unexpected server error",
    });
  }
}
