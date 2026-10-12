import { defineConfig } from "vitest/config";
import { managedVitest } from "../../scripts/test-observation.mjs";

export default defineConfig({
  test: {
    ...managedVitest(),
    environment: "jsdom",
    include: ["src/**/*.test.tsx"],
    setupFiles: ["src/test/setup.ts"],
  },
});
