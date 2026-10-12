import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  liveLeader,
  observeGroupSettlement,
  signalOwnedGroup,
} from "../../../scripts/owned-process.mjs";
import { progress } from "../../../scripts/test-observation.mjs";
import { createTestWorld } from "../src/db/test-world.js";

const [role, command, ...args] = process.argv.slice(2);
if (!role || !command)
  throw new Error("test-world requires a role and command");
const root = fileURLToPath(new URL("../../../", import.meta.url));
let world: Awaited<ReturnType<typeof createTestWorld>> | undefined;
let directory: string | undefined;
const env: NodeJS.ProcessEnv = {
  ...process.env,
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
  role,
  project_root: root,
  pid: process.pid,
  state: "running",
  started_at: new Date().toISOString(),
};
const children: ReturnType<typeof spawn>[] = [];
let primaryError: unknown;
let signal: NodeJS.Signals | null = null;
let escalation: ReturnType<typeof setTimeout> | undefined;
const stopGroup = (value: NodeJS.Signals) => {
  for (const owned of children) signalOwnedGroup(owned, value);
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
  world = await createTestWorld();
  directory = path.join(root, ".test-worlds", world.token);
  Object.assign(env, {
    DATABASE_URL: world.url,
    DD_TASKS_TEST_WORLD: world.token,
  });
  Object.assign(receipt, { id: world.token, database: world.name });
  progress("test_world_created", "startup");
  if (role === "browser" || role === "foundation") {
    env.DD_FLOW_PORT_API ??= await availablePort();
    if (!env.DD_FLOW_PORT_WEB) {
      do {
        env.DD_FLOW_PORT_WEB = await availablePort();
      } while (env.DD_FLOW_PORT_WEB === env.DD_FLOW_PORT_API);
    }
    if (env.DD_FLOW_PORT_WEB === env.DD_FLOW_PORT_API)
      throw new Error("API and Web require distinct ports");
    progress("ports_allocated", "startup");
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
  progress("migrations_hashed", "startup");
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "receipt.json"),
    JSON.stringify(receipt, null, 2),
  );
  if (signal) throw new Error("Test invocation cancelled before dispatch");
  if (role === "browser" && env.DD_TASKS_TEST_WATCHDOG === "1") {
    const start = (args: string[], extra: NodeJS.ProcessEnv = {}) => {
      const server = spawn("pnpm", args, {
        cwd: root,
        env: { ...env, ...extra },
        stdio: "inherit",
        detached: true,
      });
      children.push(server);
      return server;
    };
    const ready = async (
      server: ReturnType<typeof spawn>,
      url: string,
      name: string,
    ) => {
      while (!signal) {
        if (server.exitCode !== null || server.signalCode !== null)
          throw new Error(`${name} exited before readiness`);
        try {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(5000),
          });
          if (response.status === 200) {
            progress(`setup_step_completed:${name}_ready`, "startup");
            return;
          }
        } catch {
          /* Probe retries are not progress; the outer watcher bounds silence. */
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error("Startup cancelled");
    };
    const api = start(["--filter", "@dd-tasks/api", "start"], {
      PORT: env.DD_FLOW_PORT_API,
    });
    await ready(
      api,
      `http://127.0.0.1:${env.DD_FLOW_PORT_API}/api/health`,
      "api",
    );
    const dist = path.join(directory, "web-dist");
    const build = start([
      "--filter",
      "@dd-tasks/web",
      "build",
      "--outDir",
      dist,
    ]);
    const buildCode = await new Promise<number | null>((resolve, reject) => {
      build.once("error", reject);
      build.once("exit", resolve);
    });
    if (buildCode !== 0 || signal)
      throw new Error("Browser build failed or cancelled");
    children.splice(children.indexOf(build), 1);
    progress("setup_step_completed:web_built", "startup");
    const web = start(
      [
        "--filter",
        "@dd-tasks/web",
        "exec",
        "vite",
        "preview",
        "--outDir",
        dist,
        "--host",
        "127.0.0.1",
        "--port",
        String(env.DD_FLOW_PORT_WEB),
        "--strictPort",
      ],
      { API_PORT: env.DD_FLOW_PORT_API },
    );
    await ready(web, `http://127.0.0.1:${env.DD_FLOW_PORT_WEB}/login`, "web");
  }
  const spawned = spawn(command, args, {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
    detached: true,
  });
  children.push(spawned);
  const code = await new Promise<number>((resolve, reject) => {
    spawned.once("error", reject);
    spawned.once("exit", (code, signal) => resolve(code ?? (signal ? 128 : 1)));
  });
  process.exitCode = code;
  receipt.exit_code = code;
} catch (error) {
  primaryError = error;
  throw error;
} finally {
  const cleanupErrors: string[] = [];
  for (const cleanup of [cleanupOwnedGroup, async () => world?.drop()]) {
    try {
      await cleanup();
    } catch (error) {
      cleanupErrors.push(String(error));
    }
  }
  if (cleanupErrors.length) {
    receipt.cleanup_errors = cleanupErrors;
    if (!primaryError && !process.exitCode) process.exitCode = 1;
  }
  receipt.state = cleanupErrors.length ? "cleanup_unconfirmed" : "cleaned";
  receipt.finished_at = new Date().toISOString();
  try {
    const endpoints = directory
      ? await readFile(path.join(directory, "endpoints.json"), "utf8").catch(
          (error) => {
            if (error.code === "ENOENT") return null;
            throw error;
          },
        )
      : null;
    if (endpoints) receipt.observed_endpoints = JSON.parse(endpoints);
    if (directory) {
      await mkdir(directory, { recursive: true });
      await writeFile(
        path.join(directory, "receipt.json"),
        JSON.stringify(receipt, null, 2),
      );
    }
  } catch (error) {
    console.error({ cleanup_error: String(error) });
    if (!primaryError && !process.exitCode) process.exitCode = 1;
  }
  process.off("SIGTERM", terminate);
  process.off("SIGINT", interrupt);
}

async function cleanupOwnedGroup() {
  if (escalation) clearTimeout(escalation);
  stopGroup("SIGTERM");
  const results = await Promise.all(
    children.map(async (owned) => {
      let settlement = await observeGroupSettlement(owned, 2000);
      if (!settlement.settled && liveLeader(owned)) {
        signalOwnedGroup(owned, "SIGKILL");
        settlement = await observeGroupSettlement(owned, 1000);
      }
      return settlement.settled
        ? null
        : `Process group ${owned.pid}: ${settlement.reason}`;
    }),
  );
  const failures = results.filter(Boolean);
  if (failures.length) throw new Error(failures.join("; "));
}
