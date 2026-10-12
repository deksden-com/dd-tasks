import { defineConfig } from "vitest/config";
import { managedVitest } from "../../scripts/test-observation.mjs";
import { TEST_DATABASE_URL } from "./tests/global-setup.js";

export default defineConfig({
  test: {
    ...managedVitest(),
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: { DATABASE_URL: TEST_DATABASE_URL },
    globalSetup: ["tests/global-setup.ts"],
    fileParallelism: false,
  },
});
