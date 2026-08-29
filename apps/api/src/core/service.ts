import { randomUUID } from "node:crypto";
import type { Sql } from "postgres";
import {
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "../auth/password.js";
import { createSessionToken, hashSessionToken } from "../auth/session.js";
import {
  isTaskPriority,
  type TaskJson,
  type TaskPriority,
} from "../contracts/http.js";

export type Role = "owner" | "member";
export type Account = { id: string; email: string };

export class CoreError extends Error {
  public constructor(
    public readonly status: 400 | 401 | 403 | 404 | 409,
    public readonly code:
      | "UNAUTHENTICATED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "VALIDATION_ERROR"
      | "CONFLICT"
      | "REGISTRATION_CLOSED"
      | "PROJECT_ARCHIVED",
    message: string,
  ) {
    super(message);
    this.name = "CoreError";
  }
}

function validateName(value: unknown, label: string, max = 120): string {
  if (
    typeof value !== "string" ||
    value.trim().length < 1 ||
    value.trim().length > max
  ) {
    throw new CoreError(400, "VALIDATION_ERROR", `${label} is required`);
  }
  return value.trim();
}

function validateDescription(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 2000) {
    throw new CoreError(400, "VALIDATION_ERROR", "Description is too long");
  }
  return value.trim() || null;
}

function parseCreatePriority(value: unknown): TaskPriority {
  if (value === undefined) return "medium";
  if (isTaskPriority(value)) return value;
  throw new CoreError(
    400,
    "VALIDATION_ERROR",
    "Priority must be low, medium or high",
  );
}

function parseUpdatePriority(value: unknown): TaskPriority | undefined {
  if (value === undefined) return undefined;
  if (isTaskPriority(value)) return value;
  throw new CoreError(
    400,
    "VALIDATION_ERROR",
    "Priority must be low, medium or high",
  );
}

export class CoreService {
  public constructor(private readonly sql: Sql<Record<string, unknown>>) {}

  public async register(
    emailValue: string,
    password: string,
  ): Promise<{
    account: Account;
    session: ReturnType<typeof createSessionToken>;
  }> {
    const email = normalizeEmail(emailValue);
    const passwordHash = await hashPassword(password);
    const account: Account = { id: randomUUID(), email };
    const session = createSessionToken();
    try {
      await this.sql.begin(async (tx) => {
        await tx`INSERT INTO accounts (id, email, password_hash) VALUES (${account.id}, ${email}, ${passwordHash})`;
        await tx`
          INSERT INTO sessions (id, account_id, token_hash, expires_at)
          VALUES (${session.id}, ${account.id}, ${session.tokenHash}, ${session.expiresAt})
        `;
      });
      return { account, session };
    } catch (error) {
      if ((error as { code?: string }).code === "23505") {
        throw new CoreError(409, "CONFLICT", "Account already exists");
      }
      throw error;
    }
  }

  public async login(
    emailValue: string,
    password: string,
  ): Promise<{
    account: Account;
    session: ReturnType<typeof createSessionToken>;
  }> {
    const email = normalizeEmail(emailValue);
    const rows = await this.sql<
      { id: string; email: string; password_hash: string }[]
    >`
      SELECT id, email, password_hash FROM accounts WHERE email = ${email}
    `;
    const row = rows[0];
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      throw new CoreError(
        401,
        "UNAUTHENTICATED",
        "Email or password is incorrect",
      );
    }
    const session = createSessionToken();
    await this.sql.begin(async (tx) => {
      await tx`UPDATE sessions SET revoked_at = now() WHERE account_id = ${row.id} AND revoked_at IS NULL`;
      await tx`
        INSERT INTO sessions (id, account_id, token_hash, expires_at)
        VALUES (${session.id}, ${row.id}, ${session.tokenHash}, ${session.expiresAt})
      `;
    });
    return { account: { id: row.id, email: row.email }, session };
  }

  public async accountForToken(token?: string): Promise<Account> {
    if (!token)
      throw new CoreError(401, "UNAUTHENTICATED", "Authentication required");
    const rows = await this.sql<{ id: string; email: string }[]>`
      SELECT a.id, a.email
      FROM sessions s JOIN accounts a ON a.id = s.account_id
      WHERE s.token_hash = ${hashSessionToken(token)}
        AND s.revoked_at IS NULL AND s.expires_at > now()
    `;
    const account = rows[0];
    if (!account)
      throw new CoreError(401, "UNAUTHENTICATED", "Authentication required");
    return account;
  }

  public async logout(token?: string): Promise<void> {
    if (!token) return;
    await this
      .sql`UPDATE sessions SET revoked_at = now() WHERE token_hash = ${hashSessionToken(token)}`;
  }

  public async listWorkspaces(accountId: string) {
    return this.sql<{ id: string; name: string; role: Role }[]>`
      SELECT w.id, w.name, m.role
      FROM memberships m JOIN workspaces w ON w.id = m.workspace_id
      WHERE m.account_id = ${accountId}
      ORDER BY w.name, w.id
    `;
  }

  public async createWorkspace(accountId: string, nameValue: unknown) {
    const workspace = {
      id: randomUUID(),
      name: validateName(nameValue, "Workspace name"),
    };
    await this.sql.begin(async (tx) => {
      await tx`INSERT INTO workspaces (id, name) VALUES (${workspace.id}, ${workspace.name})`;
      await tx`INSERT INTO memberships (workspace_id, account_id, role) VALUES (${workspace.id}, ${accountId}, 'owner')`;
    });
    return { ...workspace, role: "owner" as const };
  }

  public async membership(
    accountId: string,
    workspaceId: string,
  ): Promise<Role> {
    const rows = await this.sql<{ role: Role }[]>`
      SELECT role FROM memberships WHERE account_id = ${accountId} AND workspace_id = ${workspaceId}
    `;
    if (!rows[0]) throw new CoreError(404, "NOT_FOUND", "Not found");
    return rows[0].role;
  }

  private async requireOwner(
    accountId: string,
    workspaceId: string,
  ): Promise<void> {
    const role = await this.membership(accountId, workspaceId);
    if (role !== "owner")
      throw new CoreError(403, "FORBIDDEN", "Owner permission required");
  }

  public async listProjects(
    accountId: string,
    workspaceId: string,
    includeArchived: boolean,
  ) {
    await this.membership(accountId, workspaceId);
    return this.sql<{ id: string; name: string; archivedAt: Date | null }[]>`
      SELECT id, name, archived_at AS "archivedAt"
      FROM projects
      WHERE workspace_id = ${workspaceId}
        AND (${includeArchived} OR archived_at IS NULL)
      ORDER BY archived_at NULLS FIRST, name, id
    `;
  }

  public async createProject(
    accountId: string,
    workspaceId: string,
    nameValue: unknown,
  ) {
    await this.requireOwner(accountId, workspaceId);
    const project = {
      id: randomUUID(),
      name: validateName(nameValue, "Project name"),
    };
    await this.sql`
      INSERT INTO projects (id, workspace_id, name) VALUES (${project.id}, ${workspaceId}, ${project.name})
    `;
    return { ...project, archivedAt: null };
  }

  public async renameProject(
    accountId: string,
    workspaceId: string,
    projectId: string,
    nameValue: unknown,
  ) {
    await this.requireOwner(accountId, workspaceId);
    const name = validateName(nameValue, "Project name");
    const rows = await this.sql<
      { id: string; name: string; archivedAt: Date | null }[]
    >`
      UPDATE projects SET name = ${name}, updated_at = now()
      WHERE workspace_id = ${workspaceId} AND id = ${projectId}
      RETURNING id, name, archived_at AS "archivedAt"
    `;
    if (!rows[0]) throw new CoreError(404, "NOT_FOUND", "Not found");
    return rows[0];
  }

  public async setProjectArchived(
    accountId: string,
    workspaceId: string,
    projectId: string,
    archived: boolean,
  ) {
    await this.requireOwner(accountId, workspaceId);
    const rows = await this.sql<
      { id: string; name: string; archivedAt: Date | null }[]
    >`
      UPDATE projects SET archived_at = ${archived ? new Date() : null}, updated_at = now()
      WHERE workspace_id = ${workspaceId} AND id = ${projectId}
      RETURNING id, name, archived_at AS "archivedAt"
    `;
    if (!rows[0]) throw new CoreError(404, "NOT_FOUND", "Not found");
    return rows[0];
  }

  private async project(
    accountId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.membership(accountId, workspaceId);
    const rows = await this.sql<
      { id: string; name: string; archivedAt: Date | null }[]
    >`
      SELECT id, name, archived_at AS "archivedAt"
      FROM projects WHERE workspace_id = ${workspaceId} AND id = ${projectId}
    `;
    if (!rows[0]) throw new CoreError(404, "NOT_FOUND", "Not found");
    return rows[0];
  }

  public async listTasks(
    accountId: string,
    workspaceId: string,
    projectId: string,
  ) {
    const project = await this.project(accountId, workspaceId, projectId);
    const tasks = await this.sql<TaskJson[]>`
      SELECT id, title, description, priority FROM tasks
      WHERE workspace_id = ${workspaceId} AND project_id = ${projectId}
      ORDER BY updated_at, id
    `;
    return { project, tasks };
  }

  private async requireActiveProject(
    accountId: string,
    workspaceId: string,
    projectId: string,
  ) {
    const project = await this.project(accountId, workspaceId, projectId);
    if (project.archivedAt)
      throw new CoreError(
        409,
        "PROJECT_ARCHIVED",
        "Archived projects are read-only",
      );
    return project;
  }

  private async throwIfTaskWriteBlocked(
    accountId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<never> {
    const project = await this.project(accountId, workspaceId, projectId);
    if (project.archivedAt) {
      throw new CoreError(
        409,
        "PROJECT_ARCHIVED",
        "Archived projects are read-only",
      );
    }
    throw new CoreError(404, "NOT_FOUND", "Not found");
  }

  public async createTask(
    accountId: string,
    workspaceId: string,
    projectId: string,
    input: { title?: unknown; description?: unknown; priority?: unknown },
  ) {
    const task = {
      id: randomUUID(),
      title: validateName(input.title, "Task title", 240),
      description: validateDescription(input.description),
      priority: parseCreatePriority(input.priority),
    };
    const rows = await this.sql<TaskJson[]>`
      INSERT INTO tasks (id, workspace_id, project_id, title, description, priority)
      SELECT ${task.id}, p.workspace_id, p.id, ${task.title}, ${task.description}, ${task.priority}
      FROM projects p
      INNER JOIN memberships m
        ON m.workspace_id = p.workspace_id
       AND m.account_id = ${accountId}
      WHERE p.workspace_id = ${workspaceId}
        AND p.id = ${projectId}
        AND p.archived_at IS NULL
      RETURNING id, title, description, priority
    `;
    if (!rows[0]) {
      return await this.throwIfTaskWriteBlocked(
        accountId,
        workspaceId,
        projectId,
      );
    }
    return rows[0];
  }

  public async updateTask(
    accountId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    input: { title?: unknown; description?: unknown; priority?: unknown },
  ) {
    const title = validateName(input.title, "Task title", 240);
    const description = validateDescription(input.description);
    const priority = parseUpdatePriority(input.priority);
    const rows = await this.sql<TaskJson[]>`
      UPDATE tasks t
      SET
        title = ${title},
        description = ${description},
        priority = COALESCE(${priority ?? null}, t.priority),
        updated_at = now()
      FROM projects p
      INNER JOIN memberships m
        ON m.workspace_id = p.workspace_id
       AND m.account_id = ${accountId}
      WHERE t.id = ${taskId}
        AND t.workspace_id = ${workspaceId}
        AND t.project_id = ${projectId}
        AND p.workspace_id = t.workspace_id
        AND p.id = t.project_id
        AND p.archived_at IS NULL
      RETURNING t.id, t.title, t.description, t.priority
    `;
    if (!rows[0]) {
      return await this.throwIfTaskWriteBlocked(
        accountId,
        workspaceId,
        projectId,
      );
    }
    return rows[0];
  }

  public async deleteTask(
    accountId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
  ) {
    await this.requireActiveProject(accountId, workspaceId, projectId);
    const rows = await this.sql<{ id: string }[]>`
      DELETE FROM tasks
      WHERE id = ${taskId} AND workspace_id = ${workspaceId} AND project_id = ${projectId}
      RETURNING id
    `;
    if (!rows[0]) throw new CoreError(404, "NOT_FOUND", "Not found");
  }
}
