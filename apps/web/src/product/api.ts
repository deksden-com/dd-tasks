export type Workspace = { id: string; name: string; role: "owner" | "member" };
export type Project = { id: string; name: string; archivedAt: string | null };
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
};
export type RegistrationMode = "open" | "closed";
export type RegistrationConfig = { registration_mode: RegistrationMode };

export function isTaskPriority(value: unknown): value is TaskPriority {
  return value === "low" || value === "medium" || value === "high";
}

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

export function parseTaskPriority(value: unknown): TaskPriority {
  if (!isTaskPriority(value)) {
    throw new ProductApiError(500, "INTERNAL_ERROR", "Unexpected server error");
  }
  return value;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function parseTask(value: unknown): Task {
  const task = asRecord(value);
  if (!task || typeof task.id !== "string" || typeof task.title !== "string") {
    throw new ProductApiError(500, "INTERNAL_ERROR", "Unexpected server error");
  }
  return {
    id: task.id,
    title: task.title,
    description: typeof task.description === "string" ? task.description : null,
    priority: parseTaskPriority(task.priority),
  };
}

function parseTaskPayload(value: unknown): { task: Task } {
  const payload = asRecord(value);
  if (!payload) {
    throw new ProductApiError(500, "INTERNAL_ERROR", "Unexpected server error");
  }
  return { task: parseTask(payload.task) };
}

function parseTaskList(value: unknown): { project: Project; tasks: Task[] } {
  const payload = asRecord(value);
  const project = asRecord(payload?.project);
  if (
    !payload ||
    !project ||
    typeof project.id !== "string" ||
    typeof project.name !== "string" ||
    !Array.isArray(payload.tasks)
  ) {
    throw new ProductApiError(500, "INTERNAL_ERROR", "Unexpected server error");
  }
  return {
    project: {
      id: project.id,
      name: project.name,
      archivedAt:
        typeof project.archivedAt === "string" ? project.archivedAt : null,
    },
    tasks: payload.tasks.map(parseTask),
  };
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
  config: () => request<RegistrationConfig>("/api/config"),
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
  tasks: async (workspaceId: string, projectId: string) =>
    parseTaskList(
      await request<unknown>(
        `/api/workspaces/${workspaceId}/projects/${projectId}/tasks`,
      ),
    ),
  createTask: async (
    workspaceId: string,
    projectId: string,
    title: string,
    description: string,
    priority: TaskPriority,
  ) =>
    parseTaskPayload(
      await request<unknown>(
        `/api/workspaces/${workspaceId}/projects/${projectId}/tasks`,
        { method: "POST", body: json({ title, description, priority }) },
      ),
    ),
  updateTask: async (
    workspaceId: string,
    projectId: string,
    taskId: string,
    title: string,
    description: string,
    priority: TaskPriority,
  ) =>
    parseTaskPayload(
      await request<unknown>(
        `/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
        { method: "PATCH", body: json({ title, description, priority }) },
      ),
    ),
  deleteTask: (workspaceId: string, projectId: string, taskId: string) =>
    request<void>(
      `/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
      { method: "DELETE" },
    ),
};
