import { expect, test } from "@playwright/test";

const ownerPassword = process.env.SCN003_OWNER_PASSWORD;
const memberPassword = process.env.SCN003_MEMBER_PASSWORD;
const outsiderPassword = process.env.SCN003_OUTSIDER_PASSWORD;

if (!ownerPassword || !memberPassword || !outsiderPassword) {
  throw new Error("SCN-003 actor secret inputs are required");
}

async function login(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  await page.getByTestId("auth-email").fill(email);
  await page.getByTestId("auth-password").fill(password);
  await page.getByTestId("auth-submit").click();
  await expect(page.getByTestId("workspace-list")).toBeVisible();
}

test.describe("SCN-003 private preview source acceptance", () => {
  test("keeps unauthenticated API and SPA boundaries explicit", async ({
    page,
  }) => {
    const unauthenticated = await page.request.get("/api/workspaces");
    expect(unauthenticated.status()).toBe(401);
    expect(await unauthenticated.json()).toMatchObject({
      code: "UNAUTHENTICATED",
    });

    const missingApi = await page.request.get("/api/__missing__");
    expect(missingApi.status()).toBe(404);
    expect(missingApi.headers()["content-type"]).toMatch(/^application\/json/);

    const deepLink = await page.goto("/workspaces/ws-alpha");
    expect(deepLink?.status()).toBe(200);
    expect(deepLink?.headers()["content-type"]).toMatch(/text\/html/);

    const committedDemoPassword = await page.request.post("/api/auth/login", {
      data: { email: "owner@example.test", password: "local-demo-only" },
    });
    expect(committedDemoPassword.status()).toBe(401);
  });

  test("owner completes the browser core path on the built one-port runtime", async ({
    page,
  }) => {
    await login(page, "owner@example.test", ownerPassword);
    await page.getByRole("button", { name: /Workspace Alpha owner/ }).click();
    await expect(page.getByTestId("project-list")).toContainText(
      "Workspace / ws-alpha",
    );
    await page.getByTestId("project-name").fill("SCN-003 preview project");
    await page.getByTestId("project-create").click();
    const projectRow = page
      .locator(".project-row")
      .filter({ hasText: "SCN-003 preview project" });
    await expect(projectRow).toBeVisible();
    await projectRow.locator(".project-link").click();
    await page.getByTestId("task-title").fill("SCN-003 preview task");
    await page
      .getByTestId("task-description")
      .fill("Built private preview path");
    await page.getByTestId("task-submit").click();
    await expect(
      page.locator(".task-row").filter({ hasText: "SCN-003 preview task" }),
    ).toBeVisible();
  });

  test("member and outsider retain safe authorization boundaries", async ({
    page,
  }) => {
    await login(page, "member@example.test", memberPassword);
    await page.getByRole("button", { name: /Workspace Alpha member/ }).click();
    await page.getByTestId("project-name").fill("must be rejected");
    await page.getByTestId("project-create").click();
    await expect(page.getByTestId("state-error")).toContainText(
      "Owner permission required",
    );
    const memberIsolation = await page.evaluate(async () => {
      const response = await fetch("/api/workspaces/ws-beta/projects");
      return { status: response.status, body: await response.json() };
    });
    expect(memberIsolation).toMatchObject({
      status: 404,
      body: { code: "NOT_FOUND", message: "Not found" },
    });

    await page.getByRole("button", { name: "Sign out" }).click();
    await login(page, "outsider@example.test", outsiderPassword);
    const outsiderIsolation = await page.evaluate(async () => {
      const response = await fetch("/api/workspaces/ws-alpha/projects");
      return { status: response.status, body: await response.json() };
    });
    expect(outsiderIsolation).toMatchObject({
      status: 404,
      body: { code: "NOT_FOUND", message: "Not found" },
    });
  });
});
