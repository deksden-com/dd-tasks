export const FOUNDATION_SCREEN = {
  screenId: "foundation",
  route: "/foundation",
  selectors: {
    root: "foundation-screen",
    status: "foundation-status",
    loading: "foundation-loading",
    success: "foundation-success",
    error: "foundation-error",
  },
  emptyState: "not_applicable",
} as const;

export type HealthResponse = {
  status: "ok";
  service: "dd-tasks-api";
  requestId: string;
};

export type PublicApiError = {
  code: "NOT_FOUND" | "INTERNAL_ERROR";
  message: "Not found" | "Unexpected server error";
  requestId?: string;
};

export type FoundationState =
  | { kind: "loading" }
  | { kind: "success"; service: HealthResponse["service"] }
  | { kind: "error"; error: PublicApiError };

export function normalizePublicError(
  value: unknown,
  status: number,
): PublicApiError {
  if (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value &&
    (value.code === "NOT_FOUND" || value.code === "INTERNAL_ERROR") &&
    (value.message === "Not found" ||
      value.message === "Unexpected server error")
  ) {
    return {
      code: value.code,
      message: value.message,
    };
  }

  if (status === 404) {
    return { code: "NOT_FOUND", message: "Not found" };
  }
  return { code: "INTERNAL_ERROR", message: "Unexpected server error" };
}
