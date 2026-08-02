import { expect, test } from "@playwright/test";

test.describe("foundation surface", () => {
  test("shows a healthy API signal with stable semantics", async ({ page }) => {
    await page.goto("/foundation");

    await expect(page.getByTestId("foundation-screen")).toBeVisible();
    await expect(page.getByTestId("foundation-success")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Is the core awake?" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Probe again" }),
    ).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);

    await page.getByRole("button", { name: "Probe again" }).focus();
    await expect(
      page.getByRole("button", { name: "Probe again" }),
    ).toBeFocused();
  });

  test("shows the expected API error without exposing correlation details", async ({
    page,
  }) => {
    await page.route("**/api/health", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          code: "NOT_FOUND",
          message: "Not found",
          requestId: "browser-correlation-id",
        }),
        contentType: "application/json",
        status: 404,
      });
    });
    await page.goto("/foundation");

    await expect(page.getByTestId("foundation-error")).toBeVisible();
    await expect(page.getByText("Not found")).toBeVisible();
    await expect(page.getByText("browser-correlation-id")).toHaveCount(0);
  });

  test("holds the layout at a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/foundation");

    await expect(page.getByTestId("foundation-screen")).toBeVisible();
    await expect(page.getByTestId("foundation-success")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Probe again" }),
    ).toBeVisible();

    const card = await page
      .locator("[data-testid=foundation-status]")
      .boundingBox();
    const viewport = page.viewportSize();
    expect(card).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(card?.width).toBeLessThanOrEqual((viewport?.width ?? 0) - 24);
  });
});
