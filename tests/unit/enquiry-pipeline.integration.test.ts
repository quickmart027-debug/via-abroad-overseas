import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const external = vi.hoisted(() => ({
  ipLimit: vi.fn(),
  fingerprintLimit: vi.fn(),
  contactLimit: vi.fn(),
  emailLimit: vi.fn(),
  insertEnquiry: vi.fn(),
  sendBusinessNotificationEmail: vi.fn(),
  sendStudentConfirmationEmail: vi.fn(),
  siteverifyFetch: vi.fn(),
}));

vi.mock("@/lib/rate-limit/limiter", () => ({
  formIpLimiter: { limit: external.ipLimit },
  formFingerprintLimiter: { limit: external.fingerprintLimit },
  formContactLimiter: { limit: external.contactLimit },
  formEmailLimiter: { limit: external.emailLimit },
}));
vi.mock("@/lib/database/enquiries", () => ({
  insertEnquiry: external.insertEnquiry,
}));
vi.mock("@/lib/email/send", () => ({
  sendBusinessNotificationEmail: external.sendBusinessNotificationEmail,
  sendStudentConfirmationEmail: external.sendStudentConfirmationEmail,
}));

import { POST as contactPost } from "@/app/api/enquiries/contact/route";
import { POST as consultationPost } from "@/app/api/enquiries/consultation/route";
import { POST as findMyOptionsPost } from "@/app/api/enquiries/find-my-options/route";
import { RateLimitUnavailableError } from "@/lib/rate-limit/config";

const INSERTED_ENQUIRY = {
  id: "enquiry-7f3c",
  created_at: "2026-10-04T16:00:00.000Z",
};

let providerAction = "contact";

function contactPayload(overrides: Record<string, unknown> = {}) {
  return {
    fullName: "  Ada   Lovelace ",
    phone: "+1 (415) 555-0199",
    email: " ADA@Example.COM ",
    interestedCountry: "United Kingdom",
    serviceRequired: "Study Abroad Counselling",
    message: " I would like to study mathematics. ",
    consent: true,
    turnstileToken: "turnstile-test-token",
    formRenderedAt: Date.now() - 10_000,
    source_path: "/contact",
    utm_source: "integration-test",
    ...overrides,
  };
}

function requestFor(path: string, payload: unknown) {
  return new Request(`https://example.test${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "pipeline-integration-test",
      "x-forwarded-for": "203.0.113.25",
    },
    body: JSON.stringify(payload),
  });
}

async function responseText(response: Response) {
  return JSON.stringify(await response.json());
}

function expectNoDownstreamSideEffects() {
  expect(external.insertEnquiry).not.toHaveBeenCalled();
  expect(external.sendBusinessNotificationEmail).not.toHaveBeenCalled();
  expect(external.sendStudentConfirmationEmail).not.toHaveBeenCalled();
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("TURNSTILE_SECRET_KEY", "turnstile-integration-secret");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test/forms");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
  vi.stubEnv("ABUSE_HASH_SALT", "test-only-abuse-hash-salt-with-more-than-32-chars");
  vi.stubEnv("ALLOW_UNVERIFIED_TURNSTILE_IN_DEV", "false");

  providerAction = "contact";
  const allowed = { success: true, limit: 5, remaining: 4, reset: Date.now() + 60_000 };
  external.ipLimit.mockResolvedValue(allowed);
  external.emailLimit.mockResolvedValue(allowed);
  external.fingerprintLimit.mockResolvedValue({
    success: true,
    limit: 5,
    remaining: 4,
    reset: Date.now() + 60_000,
  });
  external.contactLimit.mockResolvedValue({
    success: true,
    limit: 3,
    remaining: 2,
    reset: Date.now() + 60_000,
  });
  external.insertEnquiry.mockResolvedValue(INSERTED_ENQUIRY);
  external.sendBusinessNotificationEmail.mockResolvedValue({ success: true });
  external.sendStudentConfirmationEmail.mockResolvedValue({ success: true });
  external.siteverifyFetch.mockImplementation(async () =>
    new Response(
      JSON.stringify({ success: true, hostname: "example.test", action: providerAction }),
      { status: 200 }
    )
  );
  vi.stubGlobal("fetch", external.siteverifyFetch);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("public enquiry pipeline integration", () => {
  it("persists a normalized Contact enquiry and propagates its saved ID", async () => {
    const response = await contactPost(requestFor("/api/enquiries/contact", contactPayload()));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, id: INSERTED_ENQUIRY.id });
    expect(external.ipLimit).toHaveBeenCalledTimes(1);
    expect(external.fingerprintLimit).toHaveBeenCalledTimes(1);
    expect(external.contactLimit).toHaveBeenCalledTimes(1);
    expect(external.emailLimit).toHaveBeenCalledTimes(1);
    expect(external.siteverifyFetch).toHaveBeenCalledTimes(1);
    expect(external.insertEnquiry).toHaveBeenCalledTimes(1);
    expect(external.insertEnquiry).toHaveBeenCalledWith(expect.objectContaining({
      enquiry_type: "general",
      full_name: "Ada Lovelace",
      phone: "+14155550199",
      email: "ada@example.com",
      interested_country: "United Kingdom",
      service_required: "Study Abroad Counselling",
      message: "I would like to study mathematics.",
      source_path: "/contact",
      utm_source: "integration-test",
      consent: true,
      abuse_fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
    }));
    expect(external.sendBusinessNotificationEmail).toHaveBeenCalledTimes(1);
    expect(external.sendBusinessNotificationEmail).toHaveBeenCalledWith(expect.objectContaining({
      enquiryType: "general",
      fullName: "Ada Lovelace",
      phone: "+14155550199",
      email: "ada@example.com",
      interestedCountry: "United Kingdom",
      serviceRequired: "Study Abroad Counselling",
      sourcePath: "/contact",
      submittedAt: INSERTED_ENQUIRY.created_at,
    }));
    expect(external.sendStudentConfirmationEmail).toHaveBeenCalledTimes(1);
    // The confirmation deliberately carries no user-supplied name.
    expect(external.sendStudentConfirmationEmail).toHaveBeenCalledWith("ada@example.com");
  });

  it("maps consultation fields through the route and shared pipeline", async () => {
    providerAction = "consultation";
    const response = await consultationPost(requestFor("/api/enquiries/consultation", {
      ...contactPayload(),
      currentQualification: "Completed bachelor's",
      preferredCountry: "Canada",
      interestedCountry: undefined,
      interestedCourse: "Data Science",
    }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, id: INSERTED_ENQUIRY.id });
    expect(external.insertEnquiry).toHaveBeenCalledTimes(1);
    expect(external.insertEnquiry).toHaveBeenCalledWith(expect.objectContaining({
      enquiry_type: "consultation",
      interested_country: "Canada",
      current_qualification: "Completed bachelor's",
      interested_course: "Data Science",
    }));
    expect(external.siteverifyFetch).toHaveBeenCalledTimes(1);
    expect(external.sendBusinessNotificationEmail).toHaveBeenCalledWith(expect.objectContaining({
      enquiryType: "consultation",
      currentQualification: "Completed bachelor's",
      interestedCourse: "Data Science",
    }));
  });

  it("maps Find My Options answers into the persisted enquiry", async () => {
    providerAction = "find_my_options";
    const response = await findMyOptionsPost(requestFor("/api/enquiries/find-my-options", {
      fullName: "Mina Student",
      phone: "98765 43210",
      email: "MINA@EXAMPLE.COM",
      consent: true,
      turnstileToken: "turnstile-test-token",
      formRenderedAt: Date.now() - 10_000,
      educationLevel: "MBA",
      budgetRange: "15-25L",
      preferredDestination: "Canada",
      source_path: "/",
    }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, id: INSERTED_ENQUIRY.id });
    expect(external.insertEnquiry).toHaveBeenCalledTimes(1);
    expect(external.insertEnquiry).toHaveBeenCalledWith(expect.objectContaining({
      enquiry_type: "general",
      full_name: "Mina Student",
      phone: "9876543210",
      email: "mina@example.com",
      interested_country: "Canada",
      service_required: "Find My Options",
      current_qualification: "MBA",
      message: "Find My Options enquiry. Approximate budget (per year, tuition + living): ₹15–25L.",
      source_path: "/",
    }));
    expect(external.sendBusinessNotificationEmail).toHaveBeenCalledWith(expect.objectContaining({
      enquiryType: "general",
      serviceRequired: "Find My Options",
      currentQualification: "MBA",
      interestedCountry: "Canada",
    }));
  });

  it("keeps persistence authoritative when the notification email rejects", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    external.sendBusinessNotificationEmail.mockRejectedValue(
      new Error("RESEND_PRIVATE_SENTINEL: provider response and stack")
    );

    const response = await contactPost(requestFor("/api/enquiries/contact", contactPayload()));
    const body = await responseText(response);

    expect(response.status).toBe(201);
    expect(body).toContain(INSERTED_ENQUIRY.id);
    expect(body).not.toContain("RESEND_PRIVATE_SENTINEL");
    expect(JSON.stringify(log.mock.calls)).not.toContain("RESEND_PRIVATE_SENTINEL");
    expect(external.insertEnquiry).toHaveBeenCalledTimes(1);
    expect(external.sendBusinessNotificationEmail).toHaveBeenCalledTimes(1);
    expect(external.sendStudentConfirmationEmail).toHaveBeenCalledTimes(1);
  });

  it("returns a controlled server failure and sends no email when persistence fails", async () => {
    external.insertEnquiry.mockRejectedValue(
      new Error("SUPABASE_PRIVATE_SENTINEL: database response and stack")
    );
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await contactPost(requestFor("/api/enquiries/contact", contactPayload()));
    const body = await responseText(response);

    expect(response.status).toBe(500);
    expect(body).toContain("We couldn't process your submission.");
    expect(body).not.toContain("SUPABASE_PRIVATE_SENTINEL");
    expect(body).not.toMatch(/at\s+\S+\s+\(.*:\d+:\d+\)/);
    expect(JSON.stringify(log.mock.calls)).not.toContain("SUPABASE_PRIVATE_SENTINEL");
    expect(external.insertEnquiry).toHaveBeenCalledTimes(1);
    expect(external.sendBusinessNotificationEmail).not.toHaveBeenCalled();
    expect(external.sendStudentConfirmationEmail).not.toHaveBeenCalled();
  });

  it("stops before persistence when Turnstile rejects the action", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    external.siteverifyFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      success: true,
      hostname: "example.test",
      action: "consultation",
    }), { status: 200 }));

    const response = await contactPost(requestFor("/api/enquiries/contact", contactPayload()));
    const body = await responseText(response);

    expect(response.status).toBe(400);
    expect(body).toContain("We couldn't verify your submission.");
    expect(body).not.toContain("Cloudflare");
    expect(body).not.toContain("consultation");
    expect(external.siteverifyFetch).toHaveBeenCalledTimes(1);
    expectNoDownstreamSideEffects();
    expect(JSON.stringify(log.mock.calls)).not.toContain("consultation");
  });

  it("maps Turnstile provider failure to a private, controlled 503", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    external.siteverifyFetch.mockRejectedValueOnce(
      new Error("CLOUDFLARE_PRIVATE_SENTINEL: provider URL, response, stack")
    );

    const response = await contactPost(requestFor("/api/enquiries/contact", contactPayload()));
    const body = await responseText(response);

    expect(response.status).toBe(503);
    expect(body).toContain("Service temporarily unavailable.");
    expect(body).not.toContain("CLOUDFLARE_PRIVATE_SENTINEL");
    expect(body).not.toMatch(/at\s+\S+\s+\(.*:\d+:\d+\)/);
    expect(JSON.stringify(log.mock.calls)).not.toContain("CLOUDFLARE_PRIVATE_SENTINEL");
    expectNoDownstreamSideEffects();
  });

  it("rejects over-limit requests before calling Turnstile or persistence", async () => {
    // Per-source limits run before Turnstile; per-recipient (contact/email)
    // limits only run after Turnstile passes, so they are never reached here.
    external.fingerprintLimit.mockResolvedValueOnce({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60_000,
    });

    const response = await contactPost(requestFor("/api/enquiries/contact", contactPayload()));
    const body = await responseText(response);

    expect(response.status).toBe(429);
    expect(body).toContain("Too many submissions.");
    expect(external.fingerprintLimit).toHaveBeenCalledTimes(1);
    expect(external.contactLimit).not.toHaveBeenCalled();
    expect(external.emailLimit).not.toHaveBeenCalled();
    expect(external.siteverifyFetch).not.toHaveBeenCalled();
    expectNoDownstreamSideEffects();
  });

  it("fails closed when a rate limiter throws and stops before Turnstile", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const rateLimitError = new RateLimitUnavailableError("upstash_unavailable");
    rateLimitError.message = "UPSTASH_PRIVATE_SENTINEL: Redis URL, token, stack";
    external.fingerprintLimit.mockRejectedValueOnce(rateLimitError);

    const response = await contactPost(requestFor("/api/enquiries/contact", contactPayload()));
    const body = await responseText(response);

    expect(response.status).toBe(503);
    expect(body).toContain("Service temporarily unavailable.");
    expect(body).not.toContain("UPSTASH_PRIVATE_SENTINEL");
    expect(body).not.toMatch(/at\s+\S+\s+\(.*:\d+:\d+\)/);
    expect(JSON.stringify(log.mock.calls)).not.toContain("UPSTASH_PRIVATE_SENTINEL");
    expect(log).toHaveBeenCalledWith("[enquiry] Abuse protection unavailable.", {
      reason: "upstash_unavailable",
    });
    expect(external.siteverifyFetch).not.toHaveBeenCalled();
    expectNoDownstreamSideEffects();
  });

  it("rejects implausibly fast submissions before any rate-limit or provider work", async () => {
    const response = await contactPost(requestFor("/api/enquiries/contact", contactPayload({
      formRenderedAt: Date.now(),
    })));

    expect(response.status).toBe(400);
    expect(external.ipLimit).not.toHaveBeenCalled();
    expect(external.fingerprintLimit).not.toHaveBeenCalled();
    expect(external.contactLimit).not.toHaveBeenCalled();
    expect(external.siteverifyFetch).not.toHaveBeenCalled();
    expectNoDownstreamSideEffects();
  });

  it.each([
    ["contact", contactPost, "/api/enquiries/contact"],
    ["consultation", consultationPost, "/api/enquiries/consultation"],
    ["find-my-options", findMyOptionsPost, "/api/enquiries/find-my-options"],
  ] as const)("short-circuits invalid %s schema input before all side effects", async (_name, post, path) => {
    const response = await post(requestFor(path, { fullName: "A" }));

    expect(response.status).toBe(400);
    expect(external.ipLimit).not.toHaveBeenCalled();
    expect(external.fingerprintLimit).not.toHaveBeenCalled();
    expect(external.contactLimit).not.toHaveBeenCalled();
    expect(external.siteverifyFetch).not.toHaveBeenCalled();
    expectNoDownstreamSideEffects();
  });
});
