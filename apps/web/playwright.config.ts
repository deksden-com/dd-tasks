import { defineConfig, devices } from "@playwright/test";

import { runtimePorts } from "../../scripts/runtime-ports.mjs";

const ports = runtimePorts();
const token = process.env.DD_TASKS_TEST_WORLD;
if (!token || !/^[a-f0-9]{32}$/.test(token))
  throw new Error("Use the project browser test launcher");
const webDist = `../../.test-worlds/${token}/web-dist`;

export default defineConfig({
  outputDir: `test-results/${process.env.DD_TASKS_TEST_WORLD ?? "unowned"}/artifacts`,
  globalSetup: "./tests/browser/global-setup.ts",
  testDir: "tests/browser",
  testIgnore: ["**/preview.spec.ts", "**/keyboard-qualification.spec.ts"],
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile:
          process.env.DD_TASKS_BROWSER_RESULTS ??
          `test-results/${process.env.DD_TASKS_TEST_WORLD ?? "unowned"}/browser-results.json`,
      },
    ],
  ],
  use: {
    baseURL: ports.webUrl,
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
      command: `PORT=${ports.api} pnpm --filter @dd-tasks/api start`,
      url: `${ports.apiUrl}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `pnpm --filter @dd-tasks/web build --outDir ${webDist} && API_PORT=${ports.api} pnpm --filter @dd-tasks/web exec vite preview --outDir ${webDist} --host 127.0.0.1 --port ${ports.web} --strictPort`,
      url: `${ports.webUrl}/login`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
