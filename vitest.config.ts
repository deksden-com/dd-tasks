import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "api",
          environment: "node",
          include: ["apps/api/tests/**/*.test.ts"],
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
