import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductApp } from "./ProductApp.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  window.history.replaceState({}, "", "/login");
});

describe("product route shell", () => {
  it("renders an accessible login contract", () => {
    render(<ProductApp />);
    expect(screen.getByTestId("auth-login")).toHaveAttribute(
      "data-screen",
      "auth-login",
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(
      screen.getByRole("button", { name: "Enter workspace" }),
    ).toBeEnabled();
  });

  it("moves from login to API-backed workspaces", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            account: { id: "acct-owner", email: "owner@example.test" },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            workspaces: [
              { id: "ws-alpha", name: "Workspace Alpha", role: "owner" },
            ],
          }),
          { status: 200 },
        ),
      );
    render(<ProductApp />);
    fireEvent.submit(
      screen.getByTestId("auth-submit").closest("form") as HTMLFormElement,
    );
    expect(await screen.findByTestId("workspace-list")).toBeInTheDocument();
    expect(await screen.findByText("Workspace Alpha")).toBeInTheDocument();
  });

  it("shows only the safe public API error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "UNAUTHENTICATED",
          message: "Email or password is incorrect",
          requestId: "hidden-request",
        }),
        { status: 401 },
      ),
    );
    render(<ProductApp />);
    fireEvent.submit(
      screen.getByTestId("auth-submit").closest("form") as HTMLFormElement,
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Email or password is incorrect",
      ),
    );
    expect(screen.queryByText("hidden-request")).not.toBeInTheDocument();
  });
});
