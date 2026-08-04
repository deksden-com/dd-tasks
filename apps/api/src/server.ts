import { relative, resolve } from "node:path";
import { serve } from "@hono/node-server";
import { createApiApp } from "./app.js";

const port = Number.parseInt(process.env.PORT ?? "8787", 10);
const hostname = process.env.HOST ?? "0.0.0.0";
const staticRoot = process.env.WEB_DIST_DIR
  ? relative(process.cwd(), resolve(process.env.WEB_DIST_DIR))
  : "../web/dist";
const app = createApiApp({ staticRoot });

serve({
  fetch: app.fetch,
  hostname,
  port,
});

console.log(`dd-tasks runtime listening on ${hostname}:${port}`);
