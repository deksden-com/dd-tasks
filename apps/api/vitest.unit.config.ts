import { defineConfig } from "vitest/config";
import { managedVitest } from "../../scripts/test-observation.mjs";

export default defineConfig({
  test: {
    ...managedVitest(),
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/**/*.integration.test.ts"],
  },
});
