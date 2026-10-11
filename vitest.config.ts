import { defineConfig } from "vitest/config";
import { TEST_DATABASE_URL } from "./apps/api/tests/global-setup.js";
import { integrationPolicy } from "./apps/api/tests/integration-policy.js";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "api",
          environment: "node",
          include: ["apps/api/tests/**/*.test.ts"],
          env: { DATABASE_URL: TEST_DATABASE_URL },
          globalSetup: ["apps/api/tests/global-setup.ts"],
          ...integrationPolicy,
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
