import { defineConfig } from "vitest/config";
import { TEST_DATABASE_URL } from "./apps/api/tests/global-setup.js";
import { managedVitest } from "./scripts/test-observation.mjs";

export default defineConfig({
  test: {
    ...managedVitest(),
    projects: [
      {
        test: {
          name: "api",
          environment: "node",
          include: ["apps/api/tests/**/*.test.ts"],
          env: { DATABASE_URL: TEST_DATABASE_URL },
          globalSetup: ["apps/api/tests/global-setup.ts"],
          fileParallelism: false,
        },
      },
      {
        test: {
          name: "web",
          environment: "jsdom",
          include: ["apps/web/src/**/*.test.tsx"],
          setupFiles: ["apps/web/src/test/setup.ts"],
        },
      },
    ],
  },
});
