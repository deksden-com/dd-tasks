import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/browser-results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4174",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "PORT=8788 pnpm --filter @dd-tasks/api start",
      url: "http://127.0.0.1:8788/api/health",
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command:
        "API_PORT=8788 pnpm --filter @dd-tasks/web exec vite --host 127.0.0.1 --port 4174",
      url: "http://127.0.0.1:4174/login",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
