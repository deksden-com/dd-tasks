import type { Sql, TransactionSql } from "postgres";
import { hashPassword } from "../auth/password.js";
import type { RuntimeProfile } from "./runtime-profile.js";

export const DEMO_PASSWORD = "local-demo-only";
export const SEED_MARKER_KEY = "dd_tasks_seed_marker";

export type SeedOptions = {
  profile?: RuntimeProfile;
  runId?: string;
  worldId?: string;
  previewPasswords?: Partial<{
    owner: string;
    member: string;
    outsider: string;
  }>;
  failureAfterResetForTest?: boolean;
};

export function seedMarkerValue(
  profile: RuntimeProfile,
  runId: string,
  worldId: string,
): string {
  return JSON.stringify({ profile, runId, worldId });
}

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
  await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(42420302)`;
    await resetProductDataInTransaction(tx);
  });
}

export async function seedDemoData(
  sql: Sql<Record<string, unknown>>,
  options: SeedOptions = {},
): Promise<Record<string, unknown>> {
  const profile = options.profile ?? "local";
  const runId = options.runId ?? "SCN002";
  const worldId =
    options.worldId ??
    `world_${profile.replaceAll("-", "_")}_${runId.toLowerCase()}`;
  const passwords = profile.startsWith("preview-")
    ? {
        owner: options.previewPasswords?.owner,
        member: options.previewPasswords?.member,
        outsider: options.previewPasswords?.outsider,
      }
    : { owner: DEMO_PASSWORD, member: DEMO_PASSWORD, outsider: DEMO_PASSWORD };
  if (!passwords.owner || !passwords.member || !passwords.outsider) {
    throw new Error("preview actor secrets are required");
  }
  const passwordHashes = {
    owner: await hashPassword(passwords.owner),
    member: await hashPassword(passwords.member),
    outsider: await hashPassword(passwords.outsider),
  };
  await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(42420302)`;
    await resetProductDataInTransaction(tx);
    if (options.failureAfterResetForTest) {
      throw new Error("injected seed failure after reset");
    }
    await tx`
      INSERT INTO accounts (id, email, password_hash) VALUES
        (${FIXTURES.accounts.owner.id}, ${FIXTURES.accounts.owner.email}, ${passwordHashes.owner}),
        (${FIXTURES.accounts.member.id}, ${FIXTURES.accounts.member.email}, ${passwordHashes.member}),
        (${FIXTURES.accounts.outsider.id}, ${FIXTURES.accounts.outsider.email}, ${passwordHashes.outsider})
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
    await tx`
      INSERT INTO foundation_metadata (key, value)
      VALUES (${SEED_MARKER_KEY}, ${seedMarkerValue(profile, runId, worldId)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
  });
  return {
    accounts: 3,
    workspaces: 2,
    memberships: 3,
    projects: 3,
    tasks: 2,
    profile,
    runId,
    worldId,
    seedMarker: SEED_MARKER_KEY,
    bindings: [
      "owner:ws-alpha:owner",
      "owner:ws-beta:member",
      "member:ws-alpha:member",
      "outsider:none:none",
    ],
  };
}

async function resetProductDataInTransaction(
  tx: TransactionSql<Record<string, unknown>>,
): Promise<void> {
  await tx`TRUNCATE foundation_metadata, tasks, projects, memberships, workspaces, sessions, accounts CASCADE`;
}
