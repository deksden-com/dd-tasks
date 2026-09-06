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
    [
      "json",
      {
        outputFile: `${process.env.SCN003_OUTPUT_DIR ?? "test-results/scn-003"}/scn-003-browser-results.json`,
      },
    ],
  ],
  use: {
    baseURL: process.env.PREVIEW_BASE_URL ?? runtimePorts().previewUrl,
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
