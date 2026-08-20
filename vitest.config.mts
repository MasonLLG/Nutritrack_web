import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure unit tests only: domain rules and service-layer calculations.
    // No jsdom — the MVP test scope excludes React components.
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
