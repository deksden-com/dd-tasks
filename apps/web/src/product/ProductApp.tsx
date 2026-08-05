import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  ProductApiError,
  type Project,
  productApi,
  type Task,
  type Workspace,
} from "./api.js";
import "./product.css";

type View =
  | { kind: "login" }
  | { kind: "register" }
  | { kind: "workspaces" }
  | { kind: "projects"; workspaceId: string }
  | { kind: "tasks"; workspaceId: string; projectId: string };

function parseView(): View {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts[0] === "register") return { kind: "register" };
  if (
    parts[0] === "workspaces" &&
    parts[1] &&
    parts[2] === "projects" &&
    parts[3]
  ) {
    return { kind: "tasks", workspaceId: parts[1], projectId: parts[3] };
  }
  if (parts[0] === "workspaces" && parts[1])
    return { kind: "projects", workspaceId: parts[1] };
  if (parts[0] === "workspaces") return { kind: "workspaces" };
  return { kind: "login" };
}

function go(path: string): void {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function messageOf(error: unknown): string {
  return error instanceof ProductApiError
    ? error.message
    : "Unexpected server error";
}

function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const [email, setEmail] = useState(
    mode === "login" ? "owner@example.test" : "",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await (mode === "login"
        ? productApi.login(email, password)
        : productApi.register(email, password));
      go("/workspaces");
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main
      className="auth-layout"
      data-screen={`auth-${mode}`}
      data-testid={`auth-${mode}`}
    >
      <section className="auth-story" aria-labelledby="auth-heading">
        <p className="product-kicker">checkpoint 02 / workspace core</p>
        <h1 id="auth-heading">
          Make the work <em>visible.</em>
        </h1>
        <p>
          A focused home for projects and the next concrete task. Local, clear,
          and deliberately small.
        </p>
      </section>
      <form className="auth-card" onSubmit={submit}>
        <p className="product-kicker">
          {mode === "login" ? "Welcome back" : "Create account"}
        </p>
        <h2>{mode === "login" ? "Sign in" : "Start here"}</h2>
        <label>
          Email
          <input
            data-testid="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            data-testid="auth-password"
            type="password"
            minLength={10}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p
            className="notice notice-error"
            data-testid="state-error"
            role="alert"
          >
            {error}
          </p>
        )}
        <button data-testid="auth-submit" type="submit" disabled={busy}>
          {busy
            ? "Working…"
            : mode === "login"
              ? "Enter workspace"
              : "Create account"}
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() => go(mode === "login" ? "/register" : "/login")}
        >
          {mode === "login" ? "Need an account?" : "Already registered?"}
        </button>
      </form>
    </main>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="product-shell">
      <header className="product-header">
        <button
          className="brand"
          type="button"
          onClick={() => go("/workspaces")}
        >
          dd / tasks
        </button>
        <button
          className="text-button"
          type="button"
          onClick={async () => {
            await productApi.logout();
            go("/login");
          }}
        >
          Sign out
        </button>
      </header>
      {children}
    </div>
  );
}

function WorkspaceScreen() {
  const [items, setItems] = useState<Workspace[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setError(null);
    try {
      setItems((await productApi.workspaces()).workspaces);
    } catch (caught) {
      if (caught instanceof ProductApiError && caught.status === 401)
        return go("/login");
      setError(messageOf(caught));
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <Shell>
      <main
        className="workspace-page"
        data-screen="workspace-list"
        data-testid="workspace-list"
      >
        <p className="product-kicker">Your working rooms</p>
        <h1>Workspaces</h1>
        {!items && !error && (
          <p data-testid="state-loading">Loading workspaces…</p>
        )}
        {error && (
          <p
            className="notice notice-error"
            data-testid="state-error"
            role="alert"
          >
            {error}{" "}
            <button type="button" onClick={() => void load()}>
              Retry
            </button>
          </p>
        )}
        {items?.length === 0 && (
          <p data-testid="state-empty">No workspaces yet.</p>
        )}
        <div className="workspace-grid">
          {items?.map((workspace) => (
            <button
              className="workspace-card"
              data-testid="workspace-switcher"
              key={workspace.id}
              type="button"
              onClick={() => go(`/workspaces/${workspace.id}/projects`)}
            >
              <span>{workspace.name}</span>
              <small>{workspace.role}</small>
            </button>
          ))}
        </div>
        <form
          className="inline-form"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              const created = await productApi.createWorkspace(name);
              go(`/workspaces/${created.workspace.id}/projects`);
            } catch (caught) {
              setError(messageOf(caught));
            }
          }}
        >
          <label>
            New workspace
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <button data-testid="workspace-create" type="submit">
            Create workspace
          </button>
        </form>
      </main>
    </Shell>
  );
}

function ProjectScreen({ workspaceId }: { workspaceId: string }) {
  const [items, setItems] = useState<Project[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setItems((await productApi.projects(workspaceId)).projects);
      setError(null);
    } catch (caught) {
      setError(messageOf(caught));
    }
  }, [workspaceId]);
  useEffect(() => {
    void load();
  }, [load]);
  const mutateArchive = async (project: Project) => {
    try {
      await productApi.archiveProject(
        workspaceId,
        project.id,
        !project.archivedAt,
      );
      await load();
    } catch (caught) {
      setError(messageOf(caught));
    }
  };
  return (
    <Shell>
      <main
        className="workspace-page"
        data-screen="project-list"
        data-testid="project-list"
      >
        <button
          className="back"
          type="button"
          onClick={() => go("/workspaces")}
        >
          ← Workspaces
        </button>
        <p className="product-kicker">Workspace / {workspaceId}</p>
        <h1>Projects</h1>
        {!items && !error && (
          <p data-testid="state-loading">Loading projects…</p>
        )}
        {error && (
          <p
            className="notice notice-error"
            data-testid={
              error === "Not found" ? "state-forbidden" : "state-error"
            }
            role="alert"
          >
            {error}
          </p>
        )}
        <form
          className="inline-form"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await productApi.createProject(workspaceId, name);
              setName("");
              await load();
            } catch (caught) {
              setError(messageOf(caught));
            }
          }}
        >
          <label>
            Project name
            <input
              data-testid="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <button data-testid="project-create" type="submit">
            Create project
          </button>
        </form>
        {items?.length === 0 && (
          <p data-testid="state-empty">No projects yet.</p>
        )}
        <div className="project-list">
          {items?.map((project) => (
            <article
              className={
                project.archivedAt ? "project-row archived" : "project-row"
              }
              key={project.id}
            >
              <button
                className="project-link"
                type="button"
                onClick={() =>
                  go(`/workspaces/${workspaceId}/projects/${project.id}`)
                }
              >
                <strong>{project.name}</strong>
                <small>
                  {project.archivedAt ? "Archived / read-only" : "Open tasks"}
                </small>
              </button>
              <button
                data-testid="project-rename"
                type="button"
                onClick={async () => {
                  const next = window.prompt("Rename project", project.name);
                  if (!next) return;
                  try {
                    await productApi.renameProject(
                      workspaceId,
                      project.id,
                      next,
                    );
                    await load();
                  } catch (caught) {
                    setError(messageOf(caught));
                  }
                }}
              >
                Rename
              </button>
              <button
                data-testid={
                  project.archivedAt ? "project-restore" : "project-archive"
                }
                type="button"
                onClick={() => void mutateArchive(project)}
              >
                {project.archivedAt ? "Restore" : "Archive"}
              </button>
            </article>
          ))}
        </div>
      </main>
    </Shell>
  );
}

function TaskScreen({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<Task[] | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      const result = await productApi.tasks(workspaceId, projectId);
      setProject(result.project);
      setItems(result.tasks);
      setError(null);
    } catch (caught) {
      setError(messageOf(caught));
    }
  }, [workspaceId, projectId]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <Shell>
      <main
        className="workspace-page"
        data-screen="project-tasks"
        data-testid="project-tasks"
      >
        <button
          className="back"
          type="button"
          onClick={() => go(`/workspaces/${workspaceId}/projects`)}
        >
          ← Projects
        </button>
        <p className="product-kicker">Project tasks</p>
        <h1>{project?.name ?? "Tasks"}</h1>
        {project?.archivedAt && (
          <p className="notice">This project is archived and read-only.</p>
        )}
        {error && (
          <p
            className="notice notice-error"
            data-testid="state-error"
            role="alert"
          >
            {error}
          </p>
        )}
        <form
          className="task-form"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await productApi.createTask(
                workspaceId,
                projectId,
                title,
                description,
              );
              setTitle("");
              setDescription("");
              await load();
            } catch (caught) {
              setError(messageOf(caught));
            }
          }}
        >
          <label>
            Task title
            <input
              data-testid="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              data-testid="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button
            data-testid="task-submit"
            type="submit"
            disabled={Boolean(project?.archivedAt)}
          >
            Add task
          </button>
        </form>
        {items?.length === 0 && (
          <p data-testid="state-empty">
            No tasks yet. Add the first concrete step.
          </p>
        )}
        <div className="task-list">
          {items?.map((task) => (
            <article className="task-row" key={task.id}>
              <div>
                <strong>{task.title}</strong>
                {task.description && <p>{task.description}</p>}
              </div>
              <div className="row-actions">
                <button
                  type="button"
                  onClick={async () => {
                    const next = window.prompt("Rename task", task.title);
                    if (next) {
                      await productApi.updateTask(
                        workspaceId,
                        projectId,
                        task.id,
                        next,
                        task.description ?? "",
                      );
                      await load();
                    }
                  }}
                >
                  Rename
                </button>
                <button
                  data-testid="task-delete"
                  type="button"
                  disabled={Boolean(project?.archivedAt)}
                  onClick={async () => {
                    if (!window.confirm(`Delete ${task.title}?`)) return;
                    await productApi.deleteTask(
                      workspaceId,
                      projectId,
                      task.id,
                    );
                    await load();
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </Shell>
  );
}

export function ProductApp() {
  const [view, setView] = useState(parseView);
  useEffect(() => {
    const update = () => setView(parseView());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  if (view.kind === "login" || view.kind === "register")
    return <AuthScreen mode={view.kind} />;
  if (view.kind === "workspaces") return <WorkspaceScreen />;
  if (view.kind === "projects")
    return <ProjectScreen workspaceId={view.workspaceId} />;
  return (
    <TaskScreen workspaceId={view.workspaceId} projectId={view.projectId} />
  );
}
