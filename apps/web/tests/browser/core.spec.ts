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
  test("owner completes project lifecycle and task CRUD", async ({
    page,
  }, testInfo) => {
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

    await page.getByRole("button", { name: "New project" }).click();
    await page.getByTestId("project-name").fill("Browser acceptance project");
    await page.getByTestId("project-create").click();
    const projectRow = page
      .locator(".project-row")
      .filter({ hasText: "Browser acceptance project" });
    await expect(projectRow).toBeVisible();
    await projectRow.getByTestId("project-rename").click();
    await page.locator(".row-editor input").fill("Renamed browser project");
    await page
      .locator(".row-editor")
      .getByRole("button", { name: "Save" })
      .click();
    const renamedProjectRow = page
      .locator(".project-row")
      .filter({ hasText: "Renamed browser project" });
    await expect(renamedProjectRow).toBeVisible();
    await renamedProjectRow.locator(".project-link").click();

    await expect(page.getByTestId("project-tasks")).toHaveAttribute(
      "data-screen",
      "project-tasks",
    );
    await page.getByRole("button", { name: "New task" }).click();
    await page.getByTestId("task-title").fill("Browser acceptance task");
    await page
      .getByTestId("task-description")
      .fill("Created through the product UI");
    await page.getByTestId("task-submit").click();
    const taskRow = page
      .locator(".task-row")
      .filter({ hasText: "Browser acceptance task" });
    await expect(taskRow).toBeVisible();
    await taskRow.locator(".task-link").click();
    await expect(page.getByTestId("task-detail-title")).toHaveValue(
      "Browser acceptance task",
    );
    await page.getByTestId("task-detail-title").fill("Renamed browser task");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByTestId("task-detail-title")).toHaveValue(
      "Renamed browser task",
    );
    await page.getByTestId("task-delete").click();
    await page.getByTestId("task-delete-confirm").click();
    await expect(page.getByTestId("project-tasks")).toBeVisible();
    await expect(
      page.locator(".task-row").filter({ hasText: "Renamed browser task" }),
    ).toHaveCount(0);

    await page.getByRole("link", { name: "Projects" }).click();
    const lifecycleRow = page
      .locator(".project-row")
      .filter({ hasText: "Renamed browser project" });
    await lifecycleRow.getByTestId("project-archive").click();
    await expect(lifecycleRow).toContainText("Archived / read-only");
    await lifecycleRow.getByTestId("project-restore").click();
    await expect(lifecycleRow).toContainText("Open tasks");
    expect(consoleErrors).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath("scn-002-owner.png"),
      fullPage: true,
    });
  });

  test("member receives owner-only denial and cross-workspace isolation", async ({
    page,
  }) => {
    await login(page, "member@example.test");
    await page.getByRole("link", { name: /Workspace Alpha member/ }).click();
    await page.getByRole("button", { name: "New project" }).click();
    await page.getByTestId("project-name").fill("Forbidden project");
    await page.getByTestId("project-create").click();
    await expect(page.getByTestId("state-error")).toContainText(
      "Owner permission required",
    );
    await page.getByRole("link", { name: /Launch notes Open tasks/ }).click();
    await page.getByRole("button", { name: "New task" }).click();
    await page.getByTestId("task-title").fill("Member browser task");
    await page.getByTestId("task-submit").click();
    const memberTask = page
      .locator(".task-row")
      .filter({ hasText: "Member browser task" });
    await expect(memberTask).toBeVisible();
    await memberTask.locator(".task-link").click();
    await page.getByTestId("task-delete").click();
    await page.getByTestId("task-delete-confirm").click();
    await expect(page.getByTestId("project-tasks")).toBeVisible();
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
});
