import { defineConfig } from "vitest/config";
import { TEST_DATABASE_URL } from "./tests/global-setup.js";

export default defineConfig({
  test: {
    testTimeout: 30_000,
    environment: "node",
    include: ["tests/**/*.integration.test.ts"],
    env: { DATABASE_URL: TEST_DATABASE_URL },
    globalSetup: ["tests/global-setup.ts"],
    fileParallelism: false,
  },
});
