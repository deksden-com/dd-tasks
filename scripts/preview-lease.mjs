import { mkdir, rmdir, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// A crashed owner leaves a blocking lease: inspect its Docker world before removing it.
export async function acquirePreviewLease(composeProject) {
  if (!/^[a-z0-9_]+$/.test(composeProject))
    throw new Error("Invalid preview project");
  const root = join(tmpdir(), `${composeProject}.lease`);
  try {
    await mkdir(root);
  } catch (error) {
    if (error.code === "EEXIST")
      throw new Error(`Preview world already leased: ${root}`);
    throw error;
  }
  await writeFile(
    join(root, "owner.json"),
    JSON.stringify({ pid: process.pid, cwd: process.cwd() }),
  );
  return async () => {
    await unlink(join(root, "owner.json"));
    await rmdir(root);
  };
}
