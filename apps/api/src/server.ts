import { serve } from "@hono/node-server";
import { createApiApp } from "./app.js";

const port = Number.parseInt(process.env.PORT ?? "8787", 10);
const app = createApiApp();

serve({
  fetch: app.fetch,
  hostname: "127.0.0.1",
  port,
});

console.log(`dd-tasks-api listening on 127.0.0.1:${port}`);
