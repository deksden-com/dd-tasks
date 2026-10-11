// These are real database/crypto checks, not latency assertions. Keep a bounded
// hang guard, with headroom for concurrent baseline runs on a loaded host.
export const integrationPolicy = {
  testTimeout: 30_000,
  hookTimeout: 30_000,
  fileParallelism: false,
};
