import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/browser-results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
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
      command: "pnpm --filter @dd-tasks/api start",
      url: "http://127.0.0.1:8787/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        "pnpm --filter @dd-tasks/web exec vite --host 127.0.0.1 --port 4173",
      url: "http://127.0.0.1:4173/foundation",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
