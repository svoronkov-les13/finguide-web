import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  // loadEnv reads .env / .env.local / .env.[mode] — unlike process.env which only sees
  // the shell environment. Without this, VITE_FINGUIDE_BACKEND_URL would always be undefined
  // in vite.config.ts and the proxy would fall back to localhost:8080.
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.VITE_FINGUIDE_BACKEND_URL ?? "http://localhost:8080";

  return {
    base: env.VITE_FINGUIDE_BASE_PATH ?? "/",
    plugins: [react(), tailwindcss()],
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
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
