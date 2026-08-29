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

function configResponse(mode: "open" | "closed" = "open") {
  return new Response(JSON.stringify({ registration_mode: mode }), {
    status: 200,
  });
}

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
      .mockResolvedValueOnce(configResponse())
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
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () =>
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

  it("keeps project creation hidden until it is requested", async () => {
    window.history.replaceState({}, "", "/workspaces/ws-alpha/projects");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ projects: [] }), { status: 200 }),
    );
    render(<ProductApp />);
    expect(
      await screen.findByRole("button", { name: "New project" }),
    ).toBeVisible();
    expect(screen.queryByTestId("project-name")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "New project" }));
    expect(screen.getByTestId("project-name")).toBeVisible();
  });

  it("reflects closed server registration without rendering a signup form", async () => {
    window.history.replaceState({}, "", "/register");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(configResponse("closed"));
    render(<ProductApp />);
    expect(
      await screen.findByTestId("registration-closed-state"),
    ).toHaveTextContent("Registration is closed");
    expect(screen.queryByTestId("auth-email")).not.toBeInTheDocument();
  });

  it("fails closed when the registration policy cannot be read", async () => {
    window.history.replaceState({}, "", "/register");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    render(<ProductApp />);
    expect(
      await screen.findByTestId("registration-closed-state"),
    ).toHaveTextContent("service is not ready");
    expect(screen.queryByTestId("auth-submit")).not.toBeInTheDocument();
  });

  it("exposes task editing and guarded deletion on a deep link", async () => {
    window.history.replaceState(
      {},
      "",
      "/workspaces/ws-alpha/projects/project-alpha/tasks/task-one",
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          project: { id: "project-alpha", name: "Launch", archivedAt: null },
          tasks: [
            {
              id: "task-one",
              title: "First task",
              description: "Existing context",
              priority: "medium",
            },
          ],
        }),
        { status: 200 },
      ),
    );
    render(<ProductApp />);
    const title = await screen.findByTestId("task-detail-title");
    expect(title).toHaveValue("First task");
    fireEvent.click(screen.getByTestId("task-delete"));
    expect(
      screen.getByRole("alertdialog", { name: /Delete “First task”/ }),
    ).toBeVisible();
    expect(screen.getByTestId("task-delete-confirm")).toBeVisible();
  });

  it("shows Low, Medium and High as readable text on task rows", async () => {
    window.history.replaceState(
      {},
      "",
      "/workspaces/ws-alpha/projects/project-alpha",
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          project: { id: "project-alpha", name: "Launch", archivedAt: null },
          tasks: [
            {
              id: "task-low",
              title: "Triage inbox",
              description: null,
              priority: "low",
            },
            {
              id: "task-medium",
              title: "Write notes",
              description: null,
              priority: "medium",
            },
            {
              id: "task-high",
              title: "Ship release",
              description: null,
              priority: "high",
            },
          ],
        }),
        { status: 200 },
      ),
    );
    render(<ProductApp />);
    expect(await screen.findByTestId("project-tasks")).toBeInTheDocument();
    expect(
      screen
        .getByText("Triage inbox")
        .closest(".task-row")
        ?.querySelector(".task-priority"),
    ).toHaveTextContent("Low");
    expect(
      screen
        .getByText("Write notes")
        .closest(".task-row")
        ?.querySelector(".task-priority"),
    ).toHaveTextContent("Medium");
    expect(
      screen
        .getByText("Ship release")
        .closest(".task-row")
        ?.querySelector(".task-priority"),
    ).toHaveTextContent("High");
    expect(screen.queryByText("low")).not.toBeInTheDocument();
    expect(screen.queryByText("medium")).not.toBeInTheDocument();
    expect(screen.queryByText("high")).not.toBeInTheDocument();
  });

  it("fails closed when a listed task priority is not low, medium or high", async () => {
    window.history.replaceState(
      {},
      "",
      "/workspaces/ws-alpha/projects/project-alpha",
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          project: { id: "project-alpha", name: "Launch", archivedAt: null },
          tasks: [
            {
              id: "task-alpha-one",
              title: "Write the first task",
              description: "A deterministic demo task",
              priority: "no_priority",
            },
          ],
        }),
        { status: 200 },
      ),
    );
    render(<ProductApp />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unexpected server error",
    );
    expect(screen.queryByText("Write the first task")).not.toBeInTheDocument();
    expect(screen.queryByText("Medium")).not.toBeInTheDocument();
    expect(screen.queryByText("no_priority")).not.toBeInTheDocument();
  });

  it("posts high, not High, when creating a High task", async () => {
    window.history.replaceState(
      {},
      "",
      "/workspaces/ws-alpha/projects/project-alpha",
    );
    const tasks: Array<{
      id: string;
      title: string;
      description: string | null;
      priority: string;
    }> = [];
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (_input, init) => {
        if (init?.method === "POST") {
          const body = JSON.parse(String(init.body)) as {
            title: string;
            description: string;
            priority: string;
          };
          const created = {
            id: "task-created-high",
            title: body.title,
            description: body.description || null,
            priority: body.priority,
          };
          tasks.push(created);
          return new Response(JSON.stringify({ task: created }), {
            status: 201,
          });
        }
        return new Response(
          JSON.stringify({
            project: { id: "project-alpha", name: "Launch", archivedAt: null },
            tasks,
          }),
          { status: 200 },
        );
      });
    render(<ProductApp />);
    fireEvent.click(await screen.findByRole("button", { name: "New task" }));
    const priority = screen.getByLabelText("Priority");
    expect(priority).toHaveValue("medium");
    fireEvent.change(screen.getByTestId("task-title"), {
      target: { value: "Ship notes" },
    });
    fireEvent.change(priority, { target: { value: "high" } });
    fireEvent.click(screen.getByTestId("task-submit"));
    await waitFor(() => {
      const createCall = fetchSpy.mock.calls.find(
        ([, requestInit]) => requestInit?.method === "POST",
      );
      expect(createCall).toBeTruthy();
      const posted = JSON.parse(String(createCall?.[1]?.body));
      expect(posted.priority).toBe("high");
      expect(posted.priority).not.toBe("High");
    });
    expect(
      (await screen.findByText("Ship notes"))
        .closest(".task-row")
        ?.querySelector(".task-priority"),
    ).toHaveTextContent("High");
  });

  it("posts medium when a task is created without choosing priority", async () => {
    window.history.replaceState(
      {},
      "",
      "/workspaces/ws-alpha/projects/project-alpha",
    );
    const tasks: Array<{
      id: string;
      title: string;
      description: string | null;
      priority: string;
    }> = [];
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (_input, init) => {
        if (init?.method === "POST") {
          const body = JSON.parse(String(init.body)) as {
            title: string;
            description: string;
            priority: string;
          };
          const created = {
            id: "task-created-medium",
            title: body.title,
            description: body.description || null,
            priority: body.priority,
          };
          tasks.push(created);
          return new Response(JSON.stringify({ task: created }), {
            status: 201,
          });
        }
        return new Response(
          JSON.stringify({
            project: { id: "project-alpha", name: "Launch", archivedAt: null },
            tasks,
          }),
          { status: 200 },
        );
      });
    render(<ProductApp />);
    fireEvent.click(await screen.findByRole("button", { name: "New task" }));
    expect(screen.getByLabelText("Priority")).toHaveValue("medium");
    fireEvent.change(screen.getByTestId("task-title"), {
      target: { value: "Default notes" },
    });
    fireEvent.click(screen.getByTestId("task-submit"));
    await waitFor(() => {
      const createCall = fetchSpy.mock.calls.find(
        ([, requestInit]) => requestInit?.method === "POST",
      );
      expect(createCall).toBeTruthy();
      const posted = JSON.parse(String(createCall?.[1]?.body));
      expect(posted.priority).toBe("medium");
      expect(posted.priority).not.toBe("Medium");
    });
    expect(
      (await screen.findByText("Default notes"))
        .closest(".task-row")
        ?.querySelector(".task-priority"),
    ).toHaveTextContent("Medium");
  });

  it("posts low, not Low, when editing a task to Low", async () => {
    window.history.replaceState(
      {},
      "",
      "/workspaces/ws-alpha/projects/project-alpha/tasks/task-one",
    );
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (_input, init) => {
        if (init?.method === "PATCH") {
          const body = JSON.parse(String(init.body)) as {
            title: string;
            description: string;
            priority: string;
          };
          return new Response(
            JSON.stringify({
              task: {
                id: "task-one",
                title: body.title,
                description: body.description || null,
                priority: body.priority,
              },
            }),
            { status: 200 },
          );
        }
        return new Response(
          JSON.stringify({
            project: { id: "project-alpha", name: "Launch", archivedAt: null },
            tasks: [
              {
                id: "task-one",
                title: "First task",
                description: "Existing context",
                priority: "medium",
              },
            ],
          }),
          { status: 200 },
        );
      });
    render(<ProductApp />);
    const priority = await screen.findByLabelText("Priority");
    expect(priority).toHaveValue("medium");
    fireEvent.change(priority, { target: { value: "low" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => {
      const updateCall = fetchSpy.mock.calls.find(
        ([, requestInit]) => requestInit?.method === "PATCH",
      );
      expect(updateCall).toBeTruthy();
      const posted = JSON.parse(String(updateCall?.[1]?.body));
      expect(posted.priority).toBe("low");
      expect(posted.priority).not.toBe("Low");
    });
  });
});
