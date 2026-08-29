import { expect, type Page, test } from "@playwright/test";

const demoPassword = "local-demo-only";
const priorityLabels = ["Low", "Medium", "High"] as const;
const undisclosedPriority =
  /priority|task-alpha-one|task-beta-one|"low"|"medium"|"high"/i;

function uniqueName(prefix: string) {
  return `${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exactText(value: string) {
  return new RegExp(`^${escapeRegExp(value)}$`);
}

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByTestId("auth-email").fill(email);
  await page.getByTestId("auth-password").fill(demoPassword);
  await page.getByTestId("auth-submit").click();
  await expect(page.getByTestId("workspace-list")).toBeVisible();
}

function projectRow(page: Page, name: string) {
  return page.locator(".project-row").filter({
    has: page.locator("strong", { hasText: exactText(name) }),
  });
}

function taskRow(page: Page, title: string) {
  return page.locator(".task-row").filter({
    has: page.locator("strong", { hasText: exactText(title) }),
  });
}

function taskPriority(page: Page, title: string) {
  return taskRow(page, title).locator(".task-priority");
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
}

async function assertReadablePriorityLabels(page: Page) {
  const labels = await page.locator(".task-priority").allTextContents();
  expect(labels.length).toBeGreaterThan(0);
  for (const label of labels) {
    expect(priorityLabels).toContain(label);
  }
}

async function assertSafeNotFound(result: { status: number; body: unknown }) {
  expect(result).toMatchObject({
    status: 404,
    body: { code: "NOT_FOUND", message: "Not found" },
  });
  expect(JSON.stringify(result.body)).not.toMatch(undisclosedPriority);
}

async function fetchJson(
  page: Page,
  path: string,
  method = "GET",
  body?: Record<string, string>,
) {
  return page.evaluate(
    async ({ path, method, body }) => {
      const response = await fetch(path, {
        method,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      return { status: response.status, body: await response.json() };
    },
    { path, method, body },
  );
}

test.describe("SCN-002 workspace task core", () => {
  test("owner completes project lifecycle and task CRUD", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await login(page, "owner@example.test");
    await page.getByRole("link", { name: /Workspace Beta member/ }).click();
    await expect(page.getByTestId("project-list")).toContainText(
      "Workspace / ws-beta",
    );
    await page.getByRole("link", { name: "Workspaces" }).click();
    await page.getByRole("link", { name: /Workspace Alpha owner/ }).click();
    await expect(page.getByTestId("project-list")).toHaveAttribute(
      "data-screen",
      "project-list",
    );

    const createdProjectName = uniqueName("Browser acceptance project");
    const renamedProjectName = uniqueName("Renamed browser project");
    const createdTaskTitle = uniqueName("Browser acceptance task");
    const renamedTaskTitle = uniqueName("Renamed browser task");
    await page.getByRole("button", { name: "New project" }).click();
    await page.getByTestId("project-name").fill(createdProjectName);
    await page.getByTestId("project-create").click();
    const createdProjectRow = projectRow(page, createdProjectName);
    await expect(createdProjectRow).toBeVisible();
    await createdProjectRow.getByTestId("project-rename").click();
    await page.locator(".row-editor input").fill(renamedProjectName);
    await page
      .locator(".row-editor")
      .getByRole("button", { name: "Save" })
      .click();
    const renamedProjectRow = projectRow(page, renamedProjectName);
    await expect(renamedProjectRow).toBeVisible();
    await renamedProjectRow.locator(".project-link").click();

    await expect(page.getByTestId("project-tasks")).toHaveAttribute(
      "data-screen",
      "project-tasks",
    );
    await page.getByRole("button", { name: "New task" }).click();
    await page.getByTestId("task-title").fill(createdTaskTitle);
    await page
      .getByTestId("task-description")
      .fill("Created through the product UI");
    await page.getByTestId("task-submit").click();
    const createdTaskRow = taskRow(page, createdTaskTitle);
    await expect(createdTaskRow).toBeVisible();
    await createdTaskRow.locator(".task-link").click();
    await page.getByTestId("task-detail-title").fill(renamedTaskTitle);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByTestId("task-detail-title")).toHaveValue(
      renamedTaskTitle,
    );
    await page.getByTestId("task-delete").click();
    await page.getByTestId("task-delete-confirm").click();
    await expect(page.getByTestId("project-tasks")).toBeVisible();
    await expect(taskRow(page, renamedTaskTitle)).toHaveCount(0);

    await page.getByRole("link", { name: "Projects" }).click();
    const lifecycleRow = projectRow(page, renamedProjectName);
    await lifecycleRow.getByTestId("project-archive").click();
    await expect(lifecycleRow).toContainText("Archived / read-only");
    await lifecycleRow.getByTestId("project-restore").click();
    await expect(lifecycleRow).toContainText("Open tasks");
    expect(consoleErrors).toEqual([]);
    await page.screenshot({
      path: "test-results/scn-002-owner.png",
      fullPage: true,
    });
  });

  test("member receives owner-only denial and cross-workspace isolation", async ({
    page,
  }) => {
    await login(page, "member@example.test");
    await page.getByRole("link", { name: /Workspace Alpha member/ }).click();
    const forbiddenProjectName = uniqueName("Forbidden project");
    const memberTaskTitle = uniqueName("Member browser task");
    await page.getByRole("button", { name: "New project" }).click();
    await page.getByTestId("project-name").fill(forbiddenProjectName);
    await page.getByTestId("project-create").click();
    await expect(page.getByTestId("state-error")).toContainText(
      "Owner permission required",
    );
    await page.getByRole("link", { name: /Launch notes Open tasks/ }).click();
    await page.getByRole("button", { name: "New task" }).click();
    await page.getByTestId("task-title").fill(memberTaskTitle);
    await page.getByTestId("task-submit").click();
    const memberTask = taskRow(page, memberTaskTitle);
    await expect(memberTask).toBeVisible();
    await memberTask.locator(".task-link").click();
    await page.getByTestId("task-delete").click();
    await page.getByTestId("task-delete-confirm").click();
    await expect(page.getByTestId("project-tasks")).toBeVisible();
    const isolation = await fetchJson(page, "/api/workspaces/ws-beta/projects");
    await assertSafeNotFound(isolation);
    const isolatedTasks = await fetchJson(
      page,
      "/api/workspaces/ws-beta/projects/project-beta-active/tasks",
    );
    await assertSafeNotFound(isolatedTasks);
    await page.getByRole("button", { name: "Sign out" }).click();
    await login(page, "outsider@example.test");
    await expect(page.getByText("Workspace Alpha")).toHaveCount(0);
    await expect(page.getByText("Write the first task")).toHaveCount(0);
    await expect(page.getByText("Medium")).toHaveCount(0);
    const outsiderList = await fetchJson(
      page,
      "/api/workspaces/ws-alpha/projects/project-alpha-active/tasks",
    );
    await assertSafeNotFound(outsiderList);
    const outsiderPatch = await fetchJson(
      page,
      "/api/workspaces/ws-alpha/projects/project-alpha-active/tasks/task-alpha-one",
      "PATCH",
      { title: "Write the first task", priority: "high" },
    );
    await assertSafeNotFound(outsiderPatch);
  });

  test("validation, keyboard focus, and narrow layout remain usable", async ({
    page,
  }) => {
    const config = await page.request.get("/api/config");
    expect(config.status()).toBe(200);
    expect(await config.json()).toEqual({ registration_mode: "open" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    await page.getByTestId("auth-email").fill("");
    await page.getByTestId("auth-password").fill("");
    await page.getByTestId("auth-submit").click();
    await expect(page.getByTestId("auth-email")).toBeFocused();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
    await page.getByTestId("auth-email").press("Tab");
    await expect(page.getByTestId("auth-password")).toBeFocused();
    await page.getByRole("button", { name: "Need an account?" }).click();
    await expect(page.getByTestId("auth-register")).toHaveAttribute(
      "data-screen",
      "auth-register",
    );
  });

  test("member sees list labels and assigns High, omitted Medium, and Low", async ({
    page,
  }) => {
    await login(page, "member@example.test");
    await page.getByRole("link", { name: /Workspace Alpha member/ }).click();
    await page.getByRole("link", { name: /Launch notes Open tasks/ }).click();
    await expect(page.getByTestId("project-tasks")).toBeVisible();
    // Seeded Medium is list presence only; AC-006 upgrade is API/migration.
    await expect(taskPriority(page, "Write the first task")).toHaveText(
      /^Medium$/,
    );

    await page.getByRole("button", { name: "New task" }).click();
    const createPriority = page.getByLabel("Priority");
    await expect(createPriority).toHaveAttribute(
      "data-testid",
      "task-priority",
    );
    await expect(createPriority).toHaveValue("medium");
    await expect(createPriority.locator("option")).toHaveText([
      "Low",
      "Medium",
      "High",
    ]);
    await page.getByTestId("task-title").focus();
    await page.getByTestId("task-title").press("Tab");
    await expect(page.getByTestId("task-description")).toBeFocused();
    await page.getByTestId("task-description").press("Tab");
    await expect(createPriority).toBeFocused();
    const createFocus = await createPriority.evaluate((element) => {
      const style = getComputedStyle(element);
      return { width: style.outlineWidth, style: style.outlineStyle };
    });
    expect(createFocus.style).toBe("solid");
    expect(Number.parseFloat(createFocus.width)).toBeGreaterThanOrEqual(3);

    const highTaskTitle = uniqueName("Priority high task");
    const omittedTaskTitle = uniqueName("Priority omitted task");
    await page.getByTestId("task-title").fill(highTaskTitle);
    await createPriority.selectOption({ label: "High" });
    await page.getByTestId("task-submit").click();
    await expect(taskPriority(page, highTaskTitle)).toHaveText(/^High$/);

    await page.getByRole("button", { name: "New task" }).click();
    const omittedPriority = page.getByLabel("Priority");
    await expect(omittedPriority).toHaveValue("medium");
    await page.getByTestId("task-title").fill(omittedTaskTitle);
    await page.getByTestId("task-submit").click();
    await expect(taskPriority(page, omittedTaskTitle)).toHaveText(/^Medium$/);

    await taskRow(page, omittedTaskTitle).locator(".task-link").click();
    const detailPriority = page.getByLabel("Priority");
    await expect(detailPriority).toHaveAttribute(
      "data-testid",
      "task-detail-priority",
    );
    await expect(detailPriority).toHaveValue("medium");
    await page.getByTestId("task-detail-title").press("Tab");
    await expect(page.getByTestId("task-detail-description")).toBeFocused();
    await page.getByTestId("task-detail-description").press("Tab");
    await expect(detailPriority).toBeFocused();
    const detailFocus = await detailPriority.evaluate((element) => {
      const style = getComputedStyle(element);
      return { width: style.outlineWidth, style: style.outlineStyle };
    });
    expect(detailFocus.style).toBe("solid");
    expect(Number.parseFloat(detailFocus.width)).toBeGreaterThanOrEqual(3);
    await detailPriority.selectOption({ label: "Low" });
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.locator(".save-state")).toHaveText("Up to date");
    await page.getByRole("link", { name: /Launch notes/ }).click();
    await expect(taskPriority(page, omittedTaskTitle)).toHaveText(/^Low$/);
    await expect(taskPriority(page, "Write the first task")).toHaveText(
      /^Medium$/,
    );
    await expect(taskPriority(page, highTaskTitle)).toHaveText(/^High$/);
    await assertReadablePriorityLabels(page);
    await assertNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(taskPriority(page, "Write the first task")).toBeVisible();
    await expect(taskPriority(page, highTaskTitle)).toHaveText(/^High$/);
    await expect(taskPriority(page, omittedTaskTitle)).toHaveText(/^Low$/);
    await assertReadablePriorityLabels(page);
    await page.getByRole("button", { name: "New task" }).click();
    await expect(page.getByLabel("Priority")).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("archived project keeps priority text and rejects changes", async ({
    page,
  }) => {
    await login(page, "owner@example.test");
    await page.getByRole("link", { name: /Workspace Alpha owner/ }).click();
    const archiveProjectName = uniqueName("Priority archive project");
    const archiveTaskTitle = uniqueName("Archive priority task");
    await page.getByRole("button", { name: "New project" }).click();
    await page.getByTestId("project-name").fill(archiveProjectName);
    await page.getByTestId("project-create").click();
    const archiveProjectRow = projectRow(page, archiveProjectName);
    await expect(archiveProjectRow).toBeVisible();
    await archiveProjectRow.locator(".project-link").click();
    await page.getByRole("button", { name: "New task" }).click();
    await page.getByTestId("task-title").fill(archiveTaskTitle);
    await page.getByLabel("Priority").selectOption({ label: "Low" });
    await page.getByTestId("task-submit").click();
    await expect(taskPriority(page, archiveTaskTitle)).toHaveText(/^Low$/);
    const taskHref = await taskRow(page, archiveTaskTitle)
      .locator(".task-link")
      .getAttribute("href");
    const taskPath =
      /^\/workspaces\/ws-alpha\/projects\/([^/]+)\/tasks\/([^/]+)$/.exec(
        taskHref ?? "",
      );
    expect(taskPath).not.toBeNull();
    const projectId = taskPath?.[1];
    const taskId = taskPath?.[2];
    await page.getByRole("link", { name: "Projects" }).click();
    await archiveProjectRow.getByTestId("project-archive").click();
    await expect(archiveProjectRow).toContainText("Archived / read-only");
    await archiveProjectRow.locator(".project-link").click();
    await expect(
      page.getByText("This project is archived and read-only."),
    ).toBeVisible();
    await expect(taskPriority(page, archiveTaskTitle)).toHaveText(/^Low$/);
    await expect(page.getByRole("button", { name: "New task" })).toBeDisabled();
    await taskRow(page, archiveTaskTitle).locator(".task-link").click();
    const archivedPriority = page.getByLabel("Priority");
    await expect(archivedPriority).toBeDisabled();
    await expect(archivedPriority).toHaveValue("low");
    const blocked = await fetchJson(
      page,
      `/api/workspaces/ws-alpha/projects/${projectId}/tasks/${taskId}`,
      "PATCH",
      { title: archiveTaskTitle, priority: "high" },
    );
    expect(blocked).toMatchObject({
      status: 409,
      body: {
        code: "PROJECT_ARCHIVED",
        message: "Archived projects are read-only",
      },
    });
    await page.getByRole("link", { name: archiveProjectName }).click();
    await expect(taskPriority(page, archiveTaskTitle)).toHaveText(/^Low$/);
  });
});
