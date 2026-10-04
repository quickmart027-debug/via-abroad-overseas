import { describe, expect, it } from "vitest";
import {
  deriveContactPairRateLimitKey,
  deriveEmailRateLimitKey,
  deriveIpRateLimitKey,
} from "@/lib/rate-limit/contact-key";

const salt = "test-only-abuse-hash-salt-which-is-long-enough-123456";

describe("per-email rate limit key", () => {
  it("is keyed on the normalized email alone and never contains it", () => {
    const key = deriveEmailRateLimitKey("Victim@Example.com ", salt);
    expect(key).toMatch(/^email:v1:[a-f0-9]{64}$/);
    expect(key).toBe(deriveEmailRateLimitKey("victim@example.com", salt));
    expect(key).not.toContain("victim");
  });

  it("stays the same when the paired phone changes (unlike the contact-pair key)", () => {
    const email = "victim@example.com";
    expect(deriveContactPairRateLimitKey(email, "+919876543210", salt)).not.toBe(
      deriveContactPairRateLimitKey(email, "+919876543211", salt)
    );
    // The email-only key has no phone input at all, so rotating it can't reset the quota.
    expect(deriveEmailRateLimitKey(email, salt)).toBe(deriveEmailRateLimitKey(email, salt));
  });

  it("is domain-separated from the contact-pair key and changes with the secret", () => {
    expect(deriveEmailRateLimitKey("a@example.com", salt)).not.toBe(
      deriveEmailRateLimitKey("a@example.com", `${salt}-rotated`)
    );
    expect(deriveEmailRateLimitKey("a@example.com", salt).split(":")[2]).not.toBe(
      deriveContactPairRateLimitKey("a@example.com", "", salt).split(":")[2]
    );
  });
});

describe("per-IP rate limit key", () => {
  it("is keyed on the IP only and never contains the raw IP", () => {
    const key = deriveIpRateLimitKey("203.0.113.10", salt);
    expect(key).toMatch(/^ip:v1:[a-f0-9]{64}$/);
    expect(key).not.toContain("203.0.113.10");
    expect(key).toBe(deriveIpRateLimitKey(" 203.0.113.10 ", salt));
    expect(key).not.toBe(deriveIpRateLimitKey("203.0.113.11", salt));
  });

  it("treats an IPv4-mapped IPv6 address as the IPv4 address", () => {
    expect(deriveIpRateLimitKey("::ffff:203.0.113.10", salt)).toBe(
      deriveIpRateLimitKey("203.0.113.10", salt)
    );
  });

  it("groups IPv6 addresses by /64 so rotating within a prefix doesn't help", () => {
    const base = deriveIpRateLimitKey("2001:db8:abcd:12::1", salt);
    expect(deriveIpRateLimitKey("2001:0db8:abcd:0012:ffff:1:2:3", salt)).toBe(base);
    expect(deriveIpRateLimitKey("2001:DB8:ABCD:12::beef", salt)).toBe(base);
    expect(deriveIpRateLimitKey("2001:db8:abcd:13::1", salt)).not.toBe(base);
  });
});
