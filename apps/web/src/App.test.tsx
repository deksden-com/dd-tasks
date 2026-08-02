import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App.js";

const healthyResponse = () =>
  new Response(
    JSON.stringify({
      status: "ok",
      service: "dd-tasks-api",
      requestId: "test-request-id",
    }),
    { headers: { "content-type": "application/json" }, status: 200 },
  );

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("foundation screen", () => {
  it("keeps the loading state observable while the API is pending", () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => undefined));

    render(<App />);

    expect(screen.getByTestId("foundation-screen")).toBeInTheDocument();
    expect(screen.getByTestId("foundation-loading")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Is the core awake?" }),
    ).toBeInTheDocument();
  });

  it("renders the healthy API result with stable selectors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(healthyResponse());

    render(<App />);

    expect(await screen.findByTestId("foundation-success")).toBeInTheDocument();
    expect(screen.getByText("Foundation is ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Probe again" })).toBeEnabled();
  });

  it("renders only the stable public message for an API error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "NOT_FOUND",
          message: "Not found",
          requestId: "secret-like-id",
        }),
        {
          headers: { "content-type": "application/json" },
          status: 404,
        },
      ),
    );

    render(<App />);

    expect(await screen.findByTestId("foundation-error")).toBeInTheDocument();
    expect(screen.getByText("Not found")).toBeInTheDocument();
    expect(screen.queryByText("secret-like-id")).not.toBeInTheDocument();
  });

  it("keeps the retry control keyboard reachable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(healthyResponse());

    render(<App />);
    const button = await screen.findByRole("button", { name: "Probe again" });
    button.focus();
    expect(button).toHaveFocus();
    fireEvent.click(button);
    await waitFor(() =>
      expect(screen.getByTestId("foundation-loading")).toBeInTheDocument(),
    );
  });
});
