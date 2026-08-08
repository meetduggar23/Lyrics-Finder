import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Dev-server middleware that proxies browser API calls to external services.
 * The browser only ever talks to `/api-proxy?url=<encoded-target>`, so no
 * third-party CORS proxy is needed while developing. Works for GET and POST
 * (e.g. AudD multipart uploads) and forwards the raw request body verbatim.
 */
function devApiProxy(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const url = new URL(req.url || "", "http://localhost");
      const target = url.searchParams.get("url");
      if (!target) {
        res.statusCode = 400;
        res.end("Missing ?url= parameter");
        return;
      }

      const body = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
      });

      const headers: Record<string, string> = {};
      const skip = new Set(["host", "connection", "content-length"]);
      for (const [key, value] of Object.entries(req.headers)) {
        if (!skip.has(key.toLowerCase())) {
          headers[key] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
        }
      }

      const upstream = await fetch(target, {
        method: req.method || "GET",
        headers,
        body: body.length > 0 ? body : undefined,
      });

      const data = Buffer.from(await upstream.arrayBuffer());
      res.statusCode = upstream.status;
      res.setHeader("Access-Control-Allow-Origin", "*");
      const skipResponse = new Set([
        "content-encoding",
        "content-length",
        "transfer-encoding",
        "connection",
      ]);
      upstream.headers.forEach((value, key) => {
        if (!skipResponse.has(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });
      res.end(data);
    } catch (error) {
      res.statusCode = 502;
      res.end(String(error));
    }
  };

  return {
    name: "api-proxy",
    configureServer(server) {
      server.middlewares.use("/api-proxy", handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api-proxy", handler);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApiProxy()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
          motion: ["framer-motion"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
