export default {
  test: {
    include: [
      "scripts/fixtures/observation.test.mjs",
      "scripts/fixtures/collection-error.test.mjs",
    ],
    reporters: ["./scripts/vitest-observation.mjs"],
    fileParallelism: false,
  },
};
