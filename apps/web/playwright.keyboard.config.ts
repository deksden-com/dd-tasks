import { randomUUID } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/browser",
  testMatch: "keyboard-qualification.spec.ts",
  outputDir: `test-results/keyboard-${randomUUID()}`,
  reporter: "list",
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
