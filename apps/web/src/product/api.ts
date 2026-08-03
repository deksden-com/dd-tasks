export type Workspace = { id: string; name: string; role: "owner" | "member" };
export type Project = { id: string; name: string; archivedAt: string | null };
export type Task = { id: string; title: string; description: string | null };

export class ProductApiError extends Error {
  public constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ProductApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (response.status === 204) return undefined as T;
  const value: unknown = await response.json();
  if (!response.ok) {
    const error = value as { code?: unknown; message?: unknown };
    throw new ProductApiError(
      response.status,
      typeof error.code === "string" ? error.code : "INTERNAL_ERROR",
      typeof error.message === "string"
        ? error.message
        : "Unexpected server error",
    );
  }
  return value as T;
}

const json = (value: unknown) => JSON.stringify(value);

export const productApi = {
  login: (email: string, password: string) =>
    request<{ account: { id: string; email: string } }>("/api/auth/login", {
      method: "POST",
      body: json({ email, password }),
    }),
  register: (email: string, password: string) =>
    request<{ account: { id: string; email: string } }>("/api/auth/register", {
      method: "POST",
      body: json({ email, password }),
    }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  workspaces: () => request<{ workspaces: Workspace[] }>("/api/workspaces"),
  createWorkspace: (name: string) =>
    request<{ workspace: Workspace }>("/api/workspaces", {
      method: "POST",
      body: json({ name }),
    }),
  projects: (workspaceId: string, includeArchived = true) =>
    request<{ projects: Project[] }>(
      `/api/workspaces/${workspaceId}/projects?includeArchived=${includeArchived}`,
    ),
  createProject: (workspaceId: string, name: string) =>
    request<{ project: Project }>(`/api/workspaces/${workspaceId}/projects`, {
      method: "POST",
      body: json({ name }),
    }),
  renameProject: (workspaceId: string, projectId: string, name: string) =>
    request<{ project: Project }>(
      `/api/workspaces/${workspaceId}/projects/${projectId}`,
      { method: "PATCH", body: json({ name }) },
    ),
  archiveProject: (workspaceId: string, projectId: string, archived: boolean) =>
    request<{ project: Project }>(
      `/api/workspaces/${workspaceId}/projects/${projectId}/${archived ? "archive" : "restore"}`,
      { method: "POST" },
    ),
  tasks: (workspaceId: string, projectId: string) =>
    request<{ project: Project; tasks: Task[] }>(
      `/api/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    ),
  createTask: (
    workspaceId: string,
    projectId: string,
    title: string,
    description: string,
  ) =>
    request<{ task: Task }>(
      `/api/workspaces/${workspaceId}/projects/${projectId}/tasks`,
      { method: "POST", body: json({ title, description }) },
    ),
  updateTask: (
    workspaceId: string,
    projectId: string,
    taskId: string,
    title: string,
    description: string,
  ) =>
    request<{ task: Task }>(
      `/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
      { method: "PATCH", body: json({ title, description }) },
    ),
  deleteTask: (workspaceId: string, projectId: string, taskId: string) =>
    request<void>(
      `/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
      { method: "DELETE" },
    ),
};
