import { describe, expect, it, vi } from "vitest";
import {
  getAbuseHashSalt,
  getRateLimitConfigurationStatus,
  RateLimitUnavailableError,
  resolveRateLimitRuntimeConfig,
} from "@/lib/rate-limit/config";
import { deriveContactPairRateLimitKey } from "@/lib/rate-limit/contact-key";
import { createRateLimiter } from "@/lib/rate-limit/limiter";

const validSalt = "test-only-abuse-hash-salt-which-is-long-enough-123456";
const upstashUrl = "https://example-upstash.upstash.io";
const upstashToken = "test-upstash-token";

describe("rate limit configuration", () => {
  it("rejects missing Upstash configuration in production without memory fallback", async () => {
    const resolveConfig = () => resolveRateLimitRuntimeConfig({
      NODE_ENV: "production",
      ABUSE_HASH_SALT: validSalt,
    });
    const createDistributed = vi.fn();
    const limiter = createRateLimiter(5, "10 m", { resolveConfig, createDistributed });

    await expect(limiter.limit("fingerprint:v1:abc")).rejects.toMatchObject({
      name: "RateLimitUnavailableError",
      reason: "upstash_missing",
    });
    expect(createDistributed).not.toHaveBeenCalled();
  });

  it.each([
    { UPSTASH_REDIS_REST_URL: upstashUrl },
    { UPSTASH_REDIS_REST_TOKEN: upstashToken },
  ])("rejects partial Upstash configuration in production", async (partialConfig) => {
    const config = resolveRateLimitRuntimeConfig({
      NODE_ENV: "production",
      ...partialConfig,
      ABUSE_HASH_SALT: validSalt,
    });
    const limiter = createRateLimiter(3, "1 h", {
      resolveConfig: () => config,
      createDistributed: vi.fn(),
    });

    await expect(limiter.limit("contact-pair:v1:abc")).rejects.toMatchObject({
      name: "RateLimitUnavailableError",
      reason: "upstash_invalid",
    });
  });

  it("rejects a missing production abuse hash salt", () => {
    expect(() => getAbuseHashSalt({ NODE_ENV: "production" })).toThrow(
      expect.objectContaining({
        name: "RateLimitUnavailableError",
        reason: "abuse_hash_salt_missing",
      })
    );
  });

  it("reports secret readiness without returning secret values", () => {
    const status = getRateLimitConfigurationStatus({
      NODE_ENV: "production",
      UPSTASH_REDIS_REST_URL: upstashUrl,
      UPSTASH_REDIS_REST_TOKEN: upstashToken,
      ABUSE_HASH_SALT: validSalt,
    });

    expect(status).toEqual({
      productionRuntime: true,
      localFallbackAllowed: false,
      upstashConfigured: true,
      upstashConfiguration: "configured",
      abuseHashSaltConfigured: true,
      abuseHashSaltConfiguration: "configured",
    });
    expect(JSON.stringify(status)).not.toContain(upstashToken);
    expect(JSON.stringify(status)).not.toContain(validSalt);
  });
});

describe("rate limiter backend behavior", () => {
  it("uses in-memory limiting in development without Upstash", async () => {
    const limiter = createRateLimiter(1, "10 m", {
      resolveConfig: () => resolveRateLimitRuntimeConfig({
        NODE_ENV: "development",
        ABUSE_HASH_SALT: validSalt,
      }),
      createDistributed: vi.fn(),
    });

    expect((await limiter.limit("dev-key")).success).toBe(true);
    expect((await limiter.limit("dev-key")).success).toBe(false);
  });

  it("converts an Upstash service error to a safe typed failure", async () => {
    const providerDetail = "private provider response including token detail";
    const limiter = createRateLimiter(5, "10 m", {
      resolveConfig: () => resolveRateLimitRuntimeConfig({
        NODE_ENV: "production",
        UPSTASH_REDIS_REST_URL: upstashUrl,
        UPSTASH_REDIS_REST_TOKEN: upstashToken,
        ABUSE_HASH_SALT: validSalt,
      }),
      createDistributed: () => ({ limit: vi.fn().mockRejectedValue(new Error(providerDetail)) }),
    });

    const error = await limiter.limit("fingerprint:v1:abc").catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(RateLimitUnavailableError);
    expect(error).toMatchObject({ reason: "upstash_unavailable" });
    expect(String(error)).not.toContain(providerDetail);
    expect(String(error)).not.toContain(upstashUrl);
    expect(String(error)).not.toContain(upstashToken);
  });

  it("preserves the fingerprint/contact limits and adds IP-only and email-only limits", async () => {
    const source = await import("@/lib/rate-limit/limiter");
    expect(source.rateLimitPolicy).toEqual({
      fingerprint: { requests: 5, window: "10 m" },
      ip: { requests: 10, window: "10 m" },
      contactPair: { requests: 3, window: "1 h" },
      email: { requests: 3, window: "1 h" },
    });
  });
});

describe("contact pair rate limit key", () => {
  const email = "Example.User+admissions@example.com";
  const phone = "+1 (415) 555-0199";

  it("is deterministic and excludes raw email and phone", () => {
    const key = deriveContactPairRateLimitKey(email, phone, validSalt);

    expect(key).toBe(deriveContactPairRateLimitKey(email, phone, validSalt));
    expect(key).toMatch(/^contact-pair:v1:[a-f0-9]{64}$/);
    expect(key).not.toContain(email);
    expect(key).not.toContain(email.toLowerCase());
    expect(key).not.toContain(phone);
    expect(key).not.toContain("4155550199");
  });

  it("normalizes equivalent email and phone inputs identically", () => {
    expect(deriveContactPairRateLimitKey(email, phone, validSalt)).toBe(
      deriveContactPairRateLimitKey("  example.user+admissions@EXAMPLE.com ", "+14155550199", validSalt)
    );
  });

  it("changes the HMAC output when the secret changes", () => {
    expect(deriveContactPairRateLimitKey(email, phone, validSalt)).not.toBe(
      deriveContactPairRateLimitKey(email, phone, `${validSalt}-rotated`)
    );
  });
});
