import { expect, test } from "@playwright/test";

const demoPassword = "local-demo-only";

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.getByTestId("auth-email").fill(email);
  await page.getByTestId("auth-password").fill(demoPassword);
  await page.getByTestId("auth-submit").click();
  await expect(page.getByTestId("workspace-list")).toBeVisible();
}

test.describe("SCN-002 workspace task core", () => {
  test("owner completes project lifecycle and task CRUD", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await login(page, "owner@example.test");
    await page.getByRole("button", { name: /Workspace Beta member/ }).click();
    await expect(page.getByTestId("project-list")).toContainText(
      "Workspace / ws-beta",
    );
    await page.getByRole("button", { name: "← Workspaces" }).click();
    await page.getByRole("button", { name: /Workspace Alpha owner/ }).click();
    await expect(page.getByTestId("project-list")).toHaveAttribute(
      "data-screen",
      "project-list",
    );

    await page.getByTestId("project-name").fill("Browser acceptance project");
    await page.getByTestId("project-create").click();
    const projectRow = page
      .locator(".project-row")
      .filter({ hasText: "Browser acceptance project" });
    await expect(projectRow).toBeVisible();
    page.once("dialog", async (dialog) =>
      dialog.accept("Renamed browser project"),
    );
    await projectRow.getByTestId("project-rename").click();
    const renamedProjectRow = page
      .locator(".project-row")
      .filter({ hasText: "Renamed browser project" });
    await expect(renamedProjectRow).toBeVisible();
    await renamedProjectRow.locator(".project-link").click();

    await expect(page.getByTestId("project-tasks")).toHaveAttribute(
      "data-screen",
      "project-tasks",
    );
    await page.getByTestId("task-title").fill("Browser acceptance task");
    await page
      .getByTestId("task-description")
      .fill("Created through the product UI");
    await page.getByTestId("task-submit").click();
    const taskRow = page
      .locator(".task-row")
      .filter({ hasText: "Browser acceptance task" });
    await expect(taskRow).toBeVisible();
    page.once("dialog", async (dialog) =>
      dialog.accept("Renamed browser task"),
    );
    await taskRow.getByRole("button", { name: "Rename" }).click();
    const renamedTaskRow = page
      .locator(".task-row")
      .filter({ hasText: "Renamed browser task" });
    await expect(renamedTaskRow).toBeVisible();
    page.once("dialog", async (dialog) => dialog.accept());
    await renamedTaskRow.getByTestId("task-delete").click();
    await expect(renamedTaskRow).toHaveCount(0);

    await page.getByRole("button", { name: "← Projects" }).click();
    const lifecycleRow = page
      .locator(".project-row")
      .filter({ hasText: "Renamed browser project" });
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
    await page.getByRole("button", { name: /Workspace Alpha member/ }).click();
    await page.getByTestId("project-name").fill("Forbidden project");
    await page.getByTestId("project-create").click();
    await expect(page.getByTestId("state-error")).toContainText(
      "Owner permission required",
    );
    await page.getByRole("button", { name: /Launch notes Open tasks/ }).click();
    await page.getByTestId("task-title").fill("Member browser task");
    await page.getByTestId("task-submit").click();
    const memberTask = page
      .locator(".task-row")
      .filter({ hasText: "Member browser task" });
    await expect(memberTask).toBeVisible();
    page.once("dialog", async (dialog) => dialog.accept());
    await memberTask.getByTestId("task-delete").click();
    await expect(memberTask).toHaveCount(0);
    const isolation = await page.evaluate(async () => {
      const response = await fetch("/api/workspaces/ws-beta/projects");
      return { status: response.status, body: await response.json() };
    });
    expect(isolation).toMatchObject({
      status: 404,
      body: { code: "NOT_FOUND", message: "Not found" },
    });
  });

  test("validation, keyboard focus, and narrow layout remain usable", async ({
    page,
  }) => {
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
});
