import type { Sql } from "postgres";
import { hashPassword } from "../auth/password.js";

export const DEMO_PASSWORD = "local-demo-only";

export const FIXTURES = {
  accounts: {
    owner: { id: "acct-owner", email: "owner@example.test" },
    member: { id: "acct-member", email: "member@example.test" },
    outsider: { id: "acct-outsider", email: "outsider@example.test" },
  },
  workspaces: {
    alpha: { id: "ws-alpha", name: "Workspace Alpha" },
    beta: { id: "ws-beta", name: "Workspace Beta" },
  },
  projects: {
    active: {
      id: "project-alpha-active",
      workspaceId: "ws-alpha",
      name: "Launch notes",
    },
    archived: {
      id: "project-alpha-archived",
      workspaceId: "ws-alpha",
      name: "Archived ideas",
    },
    beta: {
      id: "project-beta-active",
      workspaceId: "ws-beta",
      name: "Beta plan",
    },
  },
  tasks: {
    alpha: {
      id: "task-alpha-one",
      workspaceId: "ws-alpha",
      projectId: "project-alpha-active",
      title: "Write the first task",
    },
    beta: {
      id: "task-beta-one",
      workspaceId: "ws-beta",
      projectId: "project-beta-active",
      title: "Keep beta isolated",
    },
  },
} as const;

export async function resetProductData(
  sql: Sql<Record<string, unknown>>,
): Promise<void> {
  await sql`TRUNCATE tasks, projects, memberships, workspaces, sessions, accounts CASCADE`;
}

export async function seedDemoData(
  sql: Sql<Record<string, unknown>>,
): Promise<Record<string, unknown>> {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  await sql.begin(async (tx) => {
    await tx`
      INSERT INTO accounts (id, email, password_hash) VALUES
        (${FIXTURES.accounts.owner.id}, ${FIXTURES.accounts.owner.email}, ${passwordHash}),
        (${FIXTURES.accounts.member.id}, ${FIXTURES.accounts.member.email}, ${passwordHash}),
        (${FIXTURES.accounts.outsider.id}, ${FIXTURES.accounts.outsider.email}, ${passwordHash})
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, updated_at = now()
    `;
    await tx`
      INSERT INTO workspaces (id, name) VALUES
        (${FIXTURES.workspaces.alpha.id}, ${FIXTURES.workspaces.alpha.name}),
        (${FIXTURES.workspaces.beta.id}, ${FIXTURES.workspaces.beta.name})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
    `;
    await tx`
      INSERT INTO memberships (workspace_id, account_id, role) VALUES
        ('ws-alpha', 'acct-owner', 'owner'),
        ('ws-beta', 'acct-owner', 'member'),
        ('ws-alpha', 'acct-member', 'member')
      ON CONFLICT (workspace_id, account_id) DO UPDATE SET role = EXCLUDED.role, updated_at = now()
    `;
    await tx`
      INSERT INTO projects (id, workspace_id, name, archived_at) VALUES
        ('project-alpha-active', 'ws-alpha', 'Launch notes', NULL),
        ('project-alpha-archived', 'ws-alpha', 'Archived ideas', now()),
        ('project-beta-active', 'ws-beta', 'Beta plan', NULL)
      ON CONFLICT (workspace_id, id) DO UPDATE SET name = EXCLUDED.name, archived_at = EXCLUDED.archived_at, updated_at = now()
    `;
    await tx`
      INSERT INTO tasks (id, workspace_id, project_id, title, description) VALUES
        ('task-alpha-one', 'ws-alpha', 'project-alpha-active', 'Write the first task', 'A deterministic demo task'),
        ('task-beta-one', 'ws-beta', 'project-beta-active', 'Keep beta isolated', NULL)
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, updated_at = now()
    `;
  });
  return {
    accounts: 3,
    workspaces: 2,
    memberships: 3,
    projects: 3,
    tasks: 2,
    bindings: [
      "owner@example.test:ws-alpha:owner",
      "owner@example.test:ws-beta:member",
      "member@example.test:ws-alpha:member",
      "outsider@example.test:none:none",
    ],
  };
}
