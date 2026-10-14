export default {
  test: {
    include: ["scripts/fixtures/sql-observation.test.mjs"],
    globalSetup: ["apps/api/tests/global-setup.ts"],
    reporters: ["./scripts/vitest-observation.mjs"],
    fileParallelism: false,
  },
};
