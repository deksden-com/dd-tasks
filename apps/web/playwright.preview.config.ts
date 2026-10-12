import { defineConfig, devices } from "@playwright/test";

import { runtimePorts } from "../../scripts/runtime-ports.mjs";

export default defineConfig({
  testDir: "tests/browser",
  testMatch: "preview.spec.ts",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    ...(process.env.DD_TASKS_TEST_WATCHDOG === "1"
      ? [["../../scripts/playwright-observation.mjs"] as [string]]
      : []),
    [
      "json",
      {
        outputFile: `${process.env.SCN003_OUTPUT_DIR ?? "test-results/scn-003"}/scn-003-browser-results.json`,
      },
    ],
  ],
  ...(process.env.DD_TASKS_TEST_WATCHDOG === "1" ? { timeout: 0 } : {}),
  use: {
    baseURL: process.env.PREVIEW_BASE_URL ?? runtimePorts().previewUrl,
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
