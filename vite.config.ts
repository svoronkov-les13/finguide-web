import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import { appManifest, localizeHtml } from "./src/config/metadata";

export default defineConfig(({ mode }) => {
  // loadEnv reads .env / .env.local / .env.[mode] — unlike process.env which only sees
  // the shell environment. Without this, VITE_FINGUIDE_BACKEND_URL would always be undefined
  // in vite.config.ts and the proxy would fall back to localhost:8080.
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.VITE_FINGUIDE_BACKEND_URL ?? "http://localhost:8080";

  const keycloakUrl = (() => {
    const issuer = env.VITE_FINGUIDE_OIDC_ISSUER_URL;
    if (issuer) {
      try { return new URL(issuer).origin; } catch { /* fall through */ }
    }
    return backendUrl;
  })();

  return {
    base: env.VITE_FINGUIDE_BASE_PATH ?? "/",
    plugins: [react(), tailwindcss(), {
      name: "app-brand-metadata",
      transformIndexHtml: localizeHtml,
      generateBundle() {
        this.emitFile({ type: "asset", fileName: "site.webmanifest", source: JSON.stringify(appManifest(), null, 2) });
      },
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (!request.url?.split("?")[0].endsWith("/site.webmanifest")) return next();
          response.setHeader("Content-Type", "application/manifest+json");
          response.end(JSON.stringify(appManifest()));
        });
      },
    }],
    test: {
      environment: "node",
      globals: true,
      include: ["src/**/*.test.{ts,tsx}"],
      exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      allowedHosts: [
        "welcome-primate-specially.ngrok-free.app",
      ],
      proxy: {
        // Forward all /finguide-api/* requests to the real backend in dev mode.
        // In prod this is handled by nginx; set VITE_FINGUIDE_BACKEND_URL in .env.
        "/finguide-api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        // Only proxy Keycloak realm paths — NOT /auth/callback which is a React route.
        "/auth/realms": {
          target: keycloakUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
