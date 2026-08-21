import { describe, expect, it } from "vitest";

import { envSchema } from "./env";

describe("envSchema", () => {
  it("parses successfully when OPENAI_API_KEY is absent", () => {
    const result = envSchema.safeParse({});

    expect(result.success).toBe(true);
    expect(result.data?.OPENAI_API_KEY).toBeUndefined();
  });

  it("treats a blank OPENAI_API_KEY as unset rather than as a validation error", () => {
    // `OPENAI_API_KEY=` in a .env file arrives as "" and means "not configured".
    // Rejecting it would take down the whole app over an optional feature.
    const result = envSchema.safeParse({ OPENAI_API_KEY: "" });

    expect(result.success).toBe(true);
    expect(result.data?.OPENAI_API_KEY).toBeUndefined();
  });

  it("treats a whitespace-only OPENAI_API_KEY as unset", () => {
    const result = envSchema.safeParse({ OPENAI_API_KEY: "   " });

    expect(result.success).toBe(true);
    expect(result.data?.OPENAI_API_KEY).toBeUndefined();
  });

  it("keeps a real OPENAI_API_KEY value", () => {
    const result = envSchema.safeParse({ OPENAI_API_KEY: "sk-test-123" });

    expect(result.data?.OPENAI_API_KEY).toBe("sk-test-123");
  });

  it("treats a blank DATABASE_URL as unset", () => {
    const result = envSchema.safeParse({ DATABASE_URL: "" });

    expect(result.success).toBe(true);
    expect(result.data?.DATABASE_URL).toBeUndefined();
  });

  it("defaults FRUITYVICE_BASE_URL to the URL ported from the Android app", () => {
    const result = envSchema.safeParse({});

    expect(result.data?.FRUITYVICE_BASE_URL).toBe("https://www.fruityvice.com/");
  });

  it("falls back to the default when FRUITYVICE_BASE_URL is blank", () => {
    const result = envSchema.safeParse({ FRUITYVICE_BASE_URL: "" });

    expect(result.data?.FRUITYVICE_BASE_URL).toBe("https://www.fruityvice.com/");
  });

  it("rejects a malformed FRUITYVICE_BASE_URL", () => {
    const result = envSchema.safeParse({ FRUITYVICE_BASE_URL: "not-a-url" });

    expect(result.success).toBe(false);
  });

  it("defaults NODE_ENV to development", () => {
    const result = envSchema.safeParse({});

    expect(result.data?.NODE_ENV).toBe("development");
  });
});
