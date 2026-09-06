import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { runtimePorts } from "../../../../scripts/runtime-ports.mjs";
import { createSqlClient } from "../../../api/src/db/client.js";
import { seedDemoData } from "../../../api/src/db/fixtures.js";
import { resetAndMigrate } from "../../../api/src/db/migrations.js";
import { requireTestWorld } from "../../../api/src/db/test-world.js";

export default async function setup() {
  const sql = createSqlClient(requireTestWorld());
  try {
    await resetAndMigrate(sql);
    await seedDemoData(sql);
    const ports = runtimePorts();
    const endpoints = {} as Record<string, { url: string; status: number }>;
    for (const [name, url] of [
      ["api", `${ports.apiUrl}/api/health`],
      ["web", `${ports.webUrl}/login`],
    ]) {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.status !== 200)
        throw new Error(`Test endpoint ${name} is not ready`);
      endpoints[name] = { url, status: response.status };
    }
    const file = fileURLToPath(
      new URL(
        `../../../../.test-worlds/${process.env.DD_TASKS_TEST_WORLD}/endpoints.json`,
        import.meta.url,
      ),
    );
    await writeFile(file, JSON.stringify(endpoints, null, 2));
  } finally {
    await sql.end({ timeout: 5 });
  }
}
