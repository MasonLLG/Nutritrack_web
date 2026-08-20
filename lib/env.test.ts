import { describe, expect, it } from "vitest";

import { envSchema } from "./env";

describe("envSchema", () => {
  it("parses successfully when OPENAI_API_KEY is absent", () => {
    const result = envSchema.safeParse({});

    expect(result.success).toBe(true);
    expect(result.data?.OPENAI_API_KEY).toBeUndefined();
  });

  it("treats an empty OPENAI_API_KEY as invalid rather than as unset", () => {
    // Guards against a blank value in .env silently reading as "configured"
    // and sending an empty key to OpenAI.
    const result = envSchema.safeParse({ OPENAI_API_KEY: "" });

    expect(result.success).toBe(false);
  });

  it("defaults FRUITYVICE_BASE_URL to the URL ported from the Android app", () => {
    const result = envSchema.safeParse({});

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
