import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { acquirePreviewLease } from "./preview-lease.mjs";

test("same preview world cannot be acquired twice and is reusable after release", async () => {
  const id = `preview_${randomUUID().replaceAll("-", "_")}`;
  const release = await acquirePreviewLease(id);
  try {
    await assert.rejects(acquirePreviewLease(id), /already leased/);
  } finally {
    await release();
  }
  await (await acquirePreviewLease(id))();
});
