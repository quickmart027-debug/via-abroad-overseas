// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const ok = { success: true, limit: 10, remaining: 9, reset: 0 };
const blocked = { success: false, limit: 10, remaining: 0, reset: 0 };

const mocks = vi.hoisted(() => ({
  ipLimit: vi.fn(),
  fingerprintLimit: vi.fn(),
  contactLimit: vi.fn(),
  emailLimit: vi.fn(),
  verifyTurnstile: vi.fn(),
  insertEnquiry: vi.fn(),
}));

vi.mock("@/lib/rate-limit/limiter", () => ({
  formIpLimiter: { limit: mocks.ipLimit },
  formFingerprintLimiter: { limit: mocks.fingerprintLimit },
  formContactLimiter: { limit: mocks.contactLimit },
  formEmailLimiter: { limit: mocks.emailLimit },
}));
vi.mock("@/lib/security/turnstile", () => ({ verifyTurnstileToken: mocks.verifyTurnstile }));
vi.mock("@/lib/database/enquiries", () => ({ insertEnquiry: mocks.insertEnquiry }));
vi.mock("@/lib/email/send", () => ({
  sendBusinessNotificationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendStudentConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import { runEnquiryPipeline } from "@/lib/server/enquiry-pipeline";

function run(userAgent = "browser-agent") {
  return runEnquiryPipeline({
    request: new Request("https://example.test/api/enquiries/contact", {
      headers: { "user-agent": userAgent, "x-forwarded-for": "203.0.113.10" },
    }),
    honeypotValue: undefined,
    formRenderedAt: Date.now() - 10_000,
    turnstileToken: "turnstile-token",
    expectedTurnstileAction: "contact",
    record: {
      enquiry_type: "general",
      full_name: "Test Person",
      phone: "+919876543210",
      email: "victim@example.com",
      interested_country: "UK",
      service_required: "Study Abroad",
      consent: true,
    },
    attribution: {},
  });
}

describe("enquiry pipeline ordering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    mocks.ipLimit.mockResolvedValue(ok);
    mocks.fingerprintLimit.mockResolvedValue(ok);
    mocks.contactLimit.mockResolvedValue(ok);
    mocks.emailLimit.mockResolvedValue(ok);
    mocks.verifyTurnstile.mockResolvedValue({ valid: true });
    mocks.insertEnquiry.mockResolvedValue({ id: "id-1", created_at: "2026-10-04T00:00:00Z" });
  });

  it("does not touch the per-email/per-contact quota when Turnstile fails", async () => {
    mocks.verifyTurnstile.mockResolvedValue({ valid: false, reason: "provider_rejected" });
    const response = await run();
    expect(response.status).toBe(400);
    expect(mocks.ipLimit).toHaveBeenCalledTimes(1);
    expect(mocks.fingerprintLimit).toHaveBeenCalledTimes(1);
    expect(mocks.contactLimit).not.toHaveBeenCalled();
    expect(mocks.emailLimit).not.toHaveBeenCalled();
  });

  it("rejects on the per-IP limit before calling Turnstile", async () => {
    mocks.ipLimit.mockResolvedValue(blocked);
    const response = await run();
    expect(response.status).toBe(429);
    expect(mocks.verifyTurnstile).not.toHaveBeenCalled();
    expect(mocks.insertEnquiry).not.toHaveBeenCalled();
  });

  it("keys the IP limit on the IP only, independent of the User-Agent", async () => {
    await run("agent-one");
    await run("agent-two");
    const [first] = mocks.ipLimit.mock.calls[0];
    const [second] = mocks.ipLimit.mock.calls[1];
    expect(first).toMatch(/^ip:v1:[a-f0-9]{64}$/);
    expect(second).toBe(first);
    expect(mocks.fingerprintLimit.mock.calls[0][0]).not.toBe(mocks.fingerprintLimit.mock.calls[1][0]);
  });

  it("rejects on the per-email limit after Turnstile and stores nothing", async () => {
    mocks.emailLimit.mockResolvedValue(blocked);
    const response = await run();
    expect(response.status).toBe(429);
    expect(mocks.verifyTurnstile).toHaveBeenCalledTimes(1);
    expect(mocks.emailLimit.mock.calls[0][0]).toMatch(/^email:v1:[a-f0-9]{64}$/);
    expect(mocks.insertEnquiry).not.toHaveBeenCalled();
  });

  it("inserts the enquiry when every check passes", async () => {
    const response = await run();
    expect(response.status).toBe(201);
    expect(mocks.insertEnquiry).toHaveBeenCalledTimes(1);
  });
});
