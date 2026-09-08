import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTestWorld } from "../src/db/test-world.js";

const [role, command, ...args] = process.argv.slice(2);
if (!role || !command)
  throw new Error("test-world requires a role and command");
const root = fileURLToPath(new URL("../../../", import.meta.url));
const world = await createTestWorld();
const directory = path.join(root, ".test-worlds", world.token);
const env: NodeJS.ProcessEnv = {
  ...process.env,
  DATABASE_URL: world.url,
  DD_TASKS_TEST_WORLD: world.token,
  DD_TASKS_TEST_ROLE: role,
  RUNTIME_PROFILE: "test",
};
// A managed check already owns its Flow ports. Ordinary pnpm invocations choose
// available local ports; strict server binding detects a subsequent collision.
async function availablePort(): Promise<string> {
  const server = net.createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Port allocation failed");
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return String(address.port);
}
const receipt: Record<string, unknown> = {
  schema_id: "dd-tasks/test-world@1",
  id: world.token,
  role,
  project_root: root,
  database: world.name,
  pid: process.pid,
  state: "running",
  started_at: new Date().toISOString(),
};
let child: ReturnType<typeof spawn> | null = null;
let signal: NodeJS.Signals | null = null;
let escalation: ReturnType<typeof setTimeout> | undefined;
const stopGroup = (value: NodeJS.Signals) => {
  if (child?.pid) {
    try {
      process.kill(-child.pid, value);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
    }
  }
};
const stop = (value: NodeJS.Signals) => {
  signal = value;
  stopGroup(value);
  escalation ??= setTimeout(() => stopGroup("SIGKILL"), 5000).unref();
};
const terminate = () => stop("SIGTERM"),
  interrupt = () => stop("SIGINT");
process.on("SIGTERM", terminate);
process.on("SIGINT", interrupt);
try {
  if (role === "browser" || role === "foundation") {
    env.DD_FLOW_PORT_API ??= await availablePort();
    if (!env.DD_FLOW_PORT_WEB) {
      do {
        env.DD_FLOW_PORT_WEB = await availablePort();
      } while (env.DD_FLOW_PORT_WEB === env.DD_FLOW_PORT_API);
    }
    if (env.DD_FLOW_PORT_WEB === env.DD_FLOW_PORT_API)
      throw new Error("API and Web require distinct ports");
  }
  const migrations = path.resolve(
    process.env.MIGRATIONS_DIR ?? path.join(root, "apps/api/drizzle"),
  );
  const digest = createHash("sha256");
  for (const name of (await readdir(migrations))
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    digest.update(name);
    digest.update(await readFile(path.join(migrations, name)));
  }
  Object.assign(receipt, {
    migrations_sha256: digest.digest("hex"),
    ports: {
      api: env.DD_FLOW_PORT_API ?? null,
      web: env.DD_FLOW_PORT_WEB ?? null,
    },
  });
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "receipt.json"),
    JSON.stringify(receipt, null, 2),
  );
  if (signal) throw new Error("Test invocation cancelled before dispatch");
  const spawned = spawn(command, args, {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
    detached: true,
  });
  child = spawned;
  const code = await new Promise<number>((resolve, reject) => {
    spawned.once("error", reject);
    spawned.once("exit", (code, signal) => resolve(code ?? (signal ? 128 : 1)));
  });
  process.exitCode = code;
  receipt.exit_code = code;
} finally {
  await cleanupOwnedGroup();
  await world.drop();
  receipt.state = "cleaned";
  receipt.finished_at = new Date().toISOString();
  const endpoints = await readFile(
    path.join(directory, "endpoints.json"),
    "utf8",
  ).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  if (endpoints) receipt.observed_endpoints = JSON.parse(endpoints);
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "receipt.json"),
    JSON.stringify(receipt, null, 2),
  );
  process.off("SIGTERM", terminate);
  process.off("SIGINT", interrupt);
}

async function cleanupOwnedGroup() {
  if (escalation) clearTimeout(escalation);
  stopGroup("SIGTERM");
  if (child?.pid) {
    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      try {
        process.kill(-child.pid, 0);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ESRCH") break;
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    stopGroup("SIGKILL");
  }
}
