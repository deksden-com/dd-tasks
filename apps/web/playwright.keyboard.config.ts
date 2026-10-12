import { randomUUID } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/browser",
  testMatch: "keyboard-qualification.spec.ts",
  outputDir: `test-results/keyboard-${randomUUID()}`,
  reporter:
    process.env.DD_TASKS_TEST_WATCHDOG === "1"
      ? [["list"], ["../../scripts/playwright-observation.mjs"]]
      : "list",
  ...(process.env.DD_TASKS_TEST_WATCHDOG === "1" ? { timeout: 0 } : {}),
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
