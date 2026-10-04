import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fingerprintLimit: vi.fn(),
  ipLimit: vi.fn(),
  contactLimit: vi.fn(),
  emailLimit: vi.fn(),
  hashFingerprint: vi.fn(),
  getClientIp: vi.fn(),
  deriveContactKey: vi.fn(),
  getSalt: vi.fn(),
  verifyTurnstile: vi.fn(),
}));

vi.mock("@/lib/rate-limit/limiter", () => ({
  formFingerprintLimiter: { limit: mocks.fingerprintLimit },
  formIpLimiter: { limit: mocks.ipLimit },
  formContactLimiter: { limit: mocks.contactLimit },
  formEmailLimiter: { limit: mocks.emailLimit },
}));
vi.mock("@/lib/security/fingerprint", () => ({
  hashRequestFingerprint: mocks.hashFingerprint,
  getClientIp: mocks.getClientIp,
}));
vi.mock("@/lib/rate-limit/contact-key", () => ({
  deriveContactPairRateLimitKey: mocks.deriveContactKey,
  deriveEmailRateLimitKey: () => "email:v1:private-digest",
  deriveIpRateLimitKey: () => "ip:v1:private-digest",
}));
vi.mock("@/lib/rate-limit/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit/config")>();
  return { ...actual, getAbuseHashSalt: mocks.getSalt };
});
vi.mock("@/lib/security/spam-checks", () => ({
  isHoneypotTripped: () => false,
  isSuspiciouslyFast: () => false,
  isFormStale: () => false,
}));
vi.mock("@/lib/security/turnstile", () => ({
  verifyTurnstileToken: mocks.verifyTurnstile,
}));
vi.mock("@/lib/database/enquiries", () => ({ insertEnquiry: vi.fn() }));
vi.mock("@/lib/email/send", () => ({
  sendBusinessNotificationEmail: vi.fn(),
  sendStudentConfirmationEmail: vi.fn(),
}));

import { runEnquiryPipeline } from "@/lib/server/enquiry-pipeline";

describe("enquiry Turnstile failure handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getClientIp.mockReturnValue("203.0.113.10");
    mocks.hashFingerprint.mockResolvedValue("safe-fingerprint-digest");
    mocks.getSalt.mockReturnValue("test-only-abuse-hash-salt-which-is-long-enough-123456");
    mocks.deriveContactKey.mockReturnValue("contact-pair:v1:private-digest");
    mocks.fingerprintLimit.mockResolvedValue({ success: true });
    mocks.ipLimit.mockResolvedValue({ success: true });
    mocks.emailLimit.mockResolvedValue({ success: true });
    mocks.contactLimit.mockResolvedValue({ success: true });
    mocks.verifyTurnstile.mockResolvedValue({ valid: false, reason: "provider_unavailable" });
  });

  it("returns a generic 503 for provider failure and never exposes provider details", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await runEnquiryPipeline({
      request: new Request("https://example.test/api/enquiries/contact", {
        headers: { "user-agent": "browser-agent" },
      }),
      honeypotValue: undefined,
      formRenderedAt: Date.now() - 10_000,
      turnstileToken: "secret-token-value",
      expectedTurnstileAction: "contact",
      record: {
        enquiry_type: "general",
        full_name: "Test Person",
        phone: "+14155550199",
        email: "private.person@example.com",
        interested_country: "UK",
        service_required: "Study Abroad",
        consent: true,
      },
      attribution: {},
    });

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toEqual({
      error: "Service temporarily unavailable. Please try again shortly.",
    });
    expect(JSON.stringify(body)).not.toContain("Cloudflare");
    expect(JSON.stringify(body)).not.toContain("secret-token-value");
    expect(JSON.stringify(body)).not.toContain("private.person@example.com");
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret-token-value");
    expect(JSON.stringify(log.mock.calls)).not.toContain("private.person@example.com");
    expect(log).toHaveBeenCalledWith("[enquiry] Turnstile verification unavailable.", {
      reason: "provider_unavailable",
    });
  });

  it("keeps invalid token context failures as a safe validation response", async () => {
    mocks.verifyTurnstile.mockResolvedValue({ valid: false, reason: "hostname_mismatch" });
    const response = await runEnquiryPipeline({
      request: new Request("https://example.test/api/enquiries/contact"),
      honeypotValue: undefined,
      formRenderedAt: Date.now() - 10_000,
      turnstileToken: "secret-token-value",
      expectedTurnstileAction: "contact",
      record: {
        enquiry_type: "general",
        full_name: "Test Person",
        phone: "+14155550199",
        email: "private.person@example.com",
        interested_country: "UK",
        service_required: "Study Abroad",
        consent: true,
      },
      attribution: {},
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "We couldn't verify your submission. Please try again.",
    });
  });
});
