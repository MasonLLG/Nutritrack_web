import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  // Mirrors the `@/*` path alias in tsconfig.json. Without this, any module
  // under test that imports across directories fails to resolve.
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    // Pure unit tests only: domain rules and service-layer calculations.
    // No jsdom — the MVP test scope excludes React components.
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
