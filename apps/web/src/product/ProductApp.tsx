import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { AuthScreen } from "./AuthScreen.js";
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
  | { kind: "tasks"; workspaceId: string; projectId: string }
  | {
      kind: "task";
      workspaceId: string;
      projectId: string;
      taskId: string;
    };

function parseView(): View {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts[0] === "register") return { kind: "register" };
  if (
    parts[0] === "workspaces" &&
    parts[1] &&
    parts[2] === "projects" &&
    parts[3] &&
    parts[4] === "tasks" &&
    parts[5]
  ) {
    return {
      kind: "task",
      workspaceId: parts[1],
      projectId: parts[3],
      taskId: parts[5],
    };
  }
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

function AppLink({
  to,
  className,
  children,
  onNavigate,
}: {
  to: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => boolean;
}) {
  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    if (onNavigate && !onNavigate()) return;
    go(to);
  };
  return (
    <a className={className} href={to} onClick={navigate}>
      {children}
    </a>
  );
}

function messageOf(error: unknown): string {
  return error instanceof ProductApiError
    ? error.message
    : "Unexpected server error";
}

function ErrorNotice({ error }: { error: string | null }) {
  return error ? (
    <p className="notice notice-error" data-testid="state-error" role="alert">
      {error}
    </p>
  ) : null;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="product-shell">
      <header className="product-header">
        <AppLink className="brand" to="/workspaces">
          <span className="brand-mark">dd</span>
          <span>/ tasks</span>
        </AppLink>
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

function PageHeader({
  kicker,
  title,
  backTo,
  backLabel,
  action,
  onNavigate,
}: {
  kicker: string;
  title: string;
  backTo?: string;
  backLabel?: string;
  action?: ReactNode;
  onNavigate?: () => boolean;
}) {
  return (
    <header className="page-heading">
      <div className="page-heading-copy">
        {backTo && backLabel && (
          <AppLink className="back" to={backTo} onNavigate={onNavigate}>
            <span aria-hidden="true">←</span> {backLabel}
          </AppLink>
        )}
        <p className="product-kicker">{kicker}</p>
        <h1>{title}</h1>
      </div>
      {action && <div className="page-heading-action">{action}</div>}
    </header>
  );
}

function WorkspaceScreen() {
  const [items, setItems] = useState<Workspace[] | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
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
        <PageHeader
          kicker="Your working rooms"
          title="Workspaces"
          action={
            <button
              className="primary-button"
              type="button"
              onClick={() => setCreating(true)}
            >
              New workspace
            </button>
          }
        />
        {!items && !error && (
          <p className="state-copy" data-testid="state-loading">
            Loading workspaces…
          </p>
        )}
        <ErrorNotice error={error} />
        {creating && (
          <form
            className="composer-panel inline-form"
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
            <label htmlFor="workspace-name">
              Workspace name
              <input
                id="workspace-name"
                name="workspace-name"
                autoComplete="off"
                placeholder="Design team…"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <div className="form-actions">
              <button className="primary-button" type="submit">
                Create workspace
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setCreating(false);
                  setName("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {items?.length === 0 && (
          <p className="empty-state" data-testid="state-empty">
            No workspaces yet. Create the first working room.
          </p>
        )}
        <div className="workspace-grid">
          {items?.map((workspace) => (
            <AppLink
              className="workspace-card"
              key={workspace.id}
              to={`/workspaces/${workspace.id}/projects`}
            >
              <span>{workspace.name}</span>
              <small>{workspace.role}</small>
            </AppLink>
          ))}
        </div>
      </main>
    </Shell>
  );
}

function ProjectScreen({ workspaceId }: { workspaceId: string }) {
  const [items, setItems] = useState<Project[] | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
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
        <PageHeader
          backTo="/workspaces"
          backLabel="Workspaces"
          kicker={`Workspace / ${workspaceId}`}
          title="Projects"
          action={
            <button
              className="primary-button"
              type="button"
              onClick={() => setCreating(true)}
            >
              New project
            </button>
          }
        />
        {!items && !error && (
          <p className="state-copy" data-testid="state-loading">
            Loading projects…
          </p>
        )}
        <ErrorNotice error={error} />
        {creating && (
          <form
            className="composer-panel inline-form"
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                await productApi.createProject(workspaceId, name);
                setName("");
                setCreating(false);
                await load();
              } catch (caught) {
                setError(messageOf(caught));
              }
            }}
          >
            <label htmlFor="project-name">
              Project name
              <input
                id="project-name"
                data-testid="project-name"
                name="project-name"
                autoComplete="off"
                placeholder="Mobile launch…"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <div className="form-actions">
              <button
                className="primary-button"
                data-testid="project-create"
                type="submit"
              >
                Create project
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setCreating(false);
                  setName("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {items?.length === 0 && (
          <p className="empty-state" data-testid="state-empty">
            No projects yet. Create one when there is real work to track.
          </p>
        )}
        <div className="section-label" aria-hidden="true">
          <span>Project</span>
          <span>Actions</span>
        </div>
        <div className="project-list">
          {items?.map((project) => (
            <article
              className={
                project.archivedAt ? "project-row archived" : "project-row"
              }
              key={project.id}
            >
              {editingId === project.id ? (
                <form
                  className="row-editor"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    try {
                      await productApi.renameProject(
                        workspaceId,
                        project.id,
                        draftName,
                      );
                      setEditingId(null);
                      await load();
                    } catch (caught) {
                      setError(messageOf(caught));
                    }
                  }}
                >
                  <label className="sr-only" htmlFor={`project-${project.id}`}>
                    Project name
                  </label>
                  <input
                    id={`project-${project.id}`}
                    name="project-name"
                    autoComplete="off"
                    required
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                  />
                  <button className="primary-button compact" type="submit">
                    Save
                  </button>
                  <button
                    className="secondary-button compact"
                    type="button"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <AppLink
                  className="project-link"
                  to={`/workspaces/${workspaceId}/projects/${project.id}`}
                >
                  <span className="row-copy">
                    <strong>{project.name}</strong>
                    <small>
                      {project.archivedAt
                        ? "Archived / read-only"
                        : "Open tasks"}
                    </small>
                  </span>
                  <span className="row-arrow" aria-hidden="true">
                    ↗
                  </span>
                </AppLink>
              )}
              {editingId !== project.id && (
                <div className="row-actions">
                  <button
                    className="quiet-button"
                    data-testid="project-rename"
                    type="button"
                    onClick={() => {
                      setEditingId(project.id);
                      setDraftName(project.name);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    className="quiet-button"
                    data-testid={
                      project.archivedAt ? "project-restore" : "project-archive"
                    }
                    type="button"
                    onClick={() => void mutateArchive(project)}
                  >
                    {project.archivedAt ? "Restore" : "Archive"}
                  </button>
                </div>
              )}
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
  const [creating, setCreating] = useState(false);
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
  const projectPath = `/workspaces/${workspaceId}/projects/${projectId}`;
  return (
    <Shell>
      <main
        className="workspace-page"
        data-screen="project-tasks"
        data-testid="project-tasks"
      >
        <PageHeader
          backTo={`/workspaces/${workspaceId}/projects`}
          backLabel="Projects"
          kicker="Project"
          title={project?.name ?? "Tasks"}
          action={
            <button
              className="primary-button"
              type="button"
              disabled={Boolean(project?.archivedAt)}
              onClick={() => setCreating(true)}
            >
              New task
            </button>
          }
        />
        {project?.archivedAt && (
          <p className="notice">This project is archived and read-only.</p>
        )}
        <ErrorNotice error={error} />
        {creating && (
          <form
            className="composer-panel task-form"
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
                setCreating(false);
                await load();
              } catch (caught) {
                setError(messageOf(caught));
              }
            }}
          >
            <label htmlFor="task-title">
              Task title
              <input
                id="task-title"
                data-testid="task-title"
                name="task-title"
                autoComplete="off"
                placeholder="Write release notes…"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label htmlFor="task-description">
              Description
              <textarea
                id="task-description"
                data-testid="task-description"
                name="task-description"
                autoComplete="off"
                placeholder="Add context, acceptance, or links…"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
            <div className="form-actions">
              <button
                className="primary-button"
                data-testid="task-submit"
                type="submit"
              >
                Create task
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setCreating(false);
                  setTitle("");
                  setDescription("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {items?.length === 0 && (
          <p className="empty-state" data-testid="state-empty">
            No tasks yet. Add the first concrete step.
          </p>
        )}
        <div className="section-label" aria-hidden="true">
          <span>Task</span>
          <span>Open</span>
        </div>
        <div className="task-list">
          {items?.map((task) => (
            <article className="task-row" key={task.id}>
              <AppLink
                className="task-link"
                to={`${projectPath}/tasks/${task.id}`}
              >
                <span className="task-status" aria-hidden="true" />
                <span className="row-copy">
                  <strong>{task.title}</strong>
                  <small>{task.description || "No description"}</small>
                </span>
                <span className="row-arrow" aria-hidden="true">
                  →
                </span>
              </AppLink>
            </article>
          ))}
        </div>
      </main>
    </Shell>
  );
}

function TaskDetailScreen({
  workspaceId,
  projectId,
  taskId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const projectPath = `/workspaces/${workspaceId}/projects/${projectId}`;
  const load = useCallback(async () => {
    try {
      const result = await productApi.tasks(workspaceId, projectId);
      const selected = result.tasks.find((item) => item.id === taskId) ?? null;
      setProject(result.project);
      setTask(selected);
      setTitle(selected?.title ?? "");
      setDescription(selected?.description ?? "");
      setError(selected ? null : "Task not found");
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setLoaded(true);
    }
  }, [workspaceId, projectId, taskId]);
  useEffect(() => {
    void load();
  }, [load]);
  const dirty = Boolean(
    task && (title !== task.title || description !== (task.description ?? "")),
  );
  useEffect(() => {
    if (!dirty) return;
    const protect = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty]);
  const mayLeave = () =>
    !dirty || window.confirm("Discard unsaved task changes?");
  return (
    <Shell>
      <main
        className="workspace-page task-detail-page"
        data-screen="task-detail"
        data-testid="task-detail"
      >
        <PageHeader
          backTo={projectPath}
          backLabel={project?.name ?? "Tasks"}
          kicker={`Task / ${taskId}`}
          title={task?.title ?? (loaded ? "Task unavailable" : "Loading task…")}
          onNavigate={mayLeave}
        />
        <ErrorNotice error={error} />
        {task && (
          <form
            className="detail-editor"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              try {
                const updated = await productApi.updateTask(
                  workspaceId,
                  projectId,
                  taskId,
                  title,
                  description,
                );
                setTask(updated.task);
                setTitle(updated.task.title);
                setDescription(updated.task.description ?? "");
                setError(null);
              } catch (caught) {
                setError(messageOf(caught));
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="detail-field title-field">
              <label htmlFor="task-detail-title">Title</label>
              <input
                id="task-detail-title"
                data-testid="task-detail-title"
                name="task-title"
                autoComplete="off"
                required
                disabled={Boolean(project?.archivedAt)}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="detail-field description-field">
              <label htmlFor="task-detail-description">Description</label>
              <textarea
                id="task-detail-description"
                data-testid="task-detail-description"
                name="task-description"
                autoComplete="off"
                placeholder="Add context, acceptance, or links…"
                disabled={Boolean(project?.archivedAt)}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="detail-toolbar">
              <span className={dirty ? "save-state dirty" : "save-state"}>
                {dirty ? "Unsaved changes" : "Up to date"}
              </span>
              <div className="form-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={busy || !dirty || Boolean(project?.archivedAt)}
                >
                  {busy ? "Saving…" : "Save changes"}
                </button>
                <button
                  className="danger-button"
                  data-testid="task-delete"
                  type="button"
                  disabled={Boolean(project?.archivedAt)}
                  onClick={() => setConfirmingDelete(true)}
                >
                  Delete task
                </button>
              </div>
            </div>
          </form>
        )}
        {confirmingDelete && task && (
          <section
            className="delete-confirmation"
            role="alertdialog"
            aria-labelledby="delete-task-heading"
            aria-describedby="delete-task-copy"
          >
            <div>
              <h2 id="delete-task-heading">Delete “{task.title}”?</h2>
              <p id="delete-task-copy">
                This action cannot be undone. The task will be removed from the
                project.
              </p>
            </div>
            <div className="form-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </button>
              <button
                className="danger-button solid"
                data-testid="task-delete-confirm"
                type="button"
                onClick={async () => {
                  try {
                    await productApi.deleteTask(workspaceId, projectId, taskId);
                    go(projectPath);
                  } catch (caught) {
                    setConfirmingDelete(false);
                    setError(messageOf(caught));
                  }
                }}
              >
                Delete task
              </button>
            </div>
          </section>
        )}
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
    return <AuthScreen mode={view.kind} onNavigate={go} />;
  if (view.kind === "workspaces") return <WorkspaceScreen />;
  if (view.kind === "projects")
    return <ProjectScreen workspaceId={view.workspaceId} />;
  if (view.kind === "tasks")
    return (
      <TaskScreen workspaceId={view.workspaceId} projectId={view.projectId} />
    );
  return (
    <TaskDetailScreen
      workspaceId={view.workspaceId}
      projectId={view.projectId}
      taskId={view.taskId}
    />
  );
}
