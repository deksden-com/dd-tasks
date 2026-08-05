import { relative, resolve } from "node:path";
import { serve } from "@hono/node-server";
import { createApiApp } from "./app.js";
import { createSqlClient, getDatabaseUrl } from "./db/client.js";
import { previewBindingFor } from "./db/runtime-profile.js";
import { classifyMutationTarget } from "./db/target-guard.js";
import { createRuntimeConfig } from "./runtime.js";

const port = Number.parseInt(process.env.PORT ?? "8787", 10);
const hostname = process.env.HOST ?? "0.0.0.0";
const staticRoot = process.env.WEB_DIST_DIR
  ? relative(process.cwd(), resolve(process.env.WEB_DIST_DIR))
  : "../web/dist";
const runtime = createRuntimeConfig();
const profile = runtime.profile;
const previewProfile =
  profile === "preview-checkpoint" || profile === "preview-eval-output"
    ? profile
    : null;
const binding =
  previewProfile && runtime.runId
    ? previewBindingFor(previewProfile, runtime.runId)
    : null;
const target = classifyMutationTarget({
  databaseUrl: getDatabaseUrl(),
  profile,
  runId: runtime.runId,
  worldId: runtime.worldId ?? binding?.worldId,
  composeProject:
    process.env.PREVIEW_COMPOSE_PROJECT ?? binding?.composeProject,
  volume: process.env.PREVIEW_VOLUME ?? binding?.volume,
  operation: "check",
  requireRunId: profile?.startsWith("preview-") === true,
  requireWorldBinding: profile?.startsWith("preview-") === true,
});
if (!target.safe) throw new Error(`Runtime target rejected: ${target.reason}`);
const sql = createSqlClient(getDatabaseUrl());
const app = createApiApp({ staticRoot, sql, runtime });

serve({
  fetch: app.fetch,
  hostname,
  port,
});

console.log(`dd-tasks runtime listening on ${hostname}:${port}`);
