import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { runtimePorts } from "../../scripts/runtime-ports.mjs";

const ports = runtimePorts();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: ports.web,
    strictPort: true,
    proxy: {
      "/api": ports.apiUrl,
    },
  },
  preview: {
    host: "127.0.0.1",
    port: ports.preview,
    strictPort: true,
    proxy: {
      "/api": ports.apiUrl,
    },
  },
});
