import { defineConfig, devices } from "@playwright/test";

const apiPort = Number(process.env.DD_FLOW_PORT_API ?? 8788);
const webPort = Number(process.env.DD_FLOW_PORT_WEB ?? 4174);

export default defineConfig({
  testDir: "tests/browser",
  testIgnore: "**/preview.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/browser-results.json" }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${webPort}`,
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
      command:
        `PORT=${apiPort} RUNTIME_RUN_ID=SCN002 pnpm --filter @dd-tasks/api start`,
      url: `http://127.0.0.1:${apiPort}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command:
        `API_PORT=${apiPort} pnpm --filter @dd-tasks/web exec vite --host 127.0.0.1 --port ${webPort}`,
      url: `http://127.0.0.1:${webPort}/login`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
