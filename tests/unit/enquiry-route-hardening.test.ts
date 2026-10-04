import { beforeEach, describe, expect, it, vi } from "vitest";

const runPipeline = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/enquiry-pipeline", () => ({ runEnquiryPipeline: runPipeline }));

import { POST as contactPost } from "@/app/api/enquiries/contact/route";
import { POST as consultationPost } from "@/app/api/enquiries/consultation/route";
import { POST as findOptionsPost } from "@/app/api/enquiries/find-my-options/route";

const routes = [
  ["contact", contactPost, "contact"],
  ["consultation", consultationPost, "consultation"],
  ["find my options", findOptionsPost, "find_my_options"],
] as const;

beforeEach(() => runPipeline.mockReset());

describe.each(routes)("%s enquiry route", (_name, post, expectedAction) => {
  it("uses the shared reader to reject unsupported media types", async () => {
    const response = await post(new Request("https://example.test/api", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "{}",
    }));

    expect(response.status).toBe(415);
    expect(runPipeline).not.toHaveBeenCalled();
  });

  it("uses the shared reader to reject malformed JSON", async () => {
    const response = await post(new Request("https://example.test/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    }));

    expect(response.status).toBe(400);
    expect(runPipeline).not.toHaveBeenCalled();
  });

  it("uses the shared reader to reject oversized JSON", async () => {
    const response = await post(new Request("https://example.test/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "x".repeat(20_000) }),
    }));

    expect(response.status).toBe(413);
    expect(runPipeline).not.toHaveBeenCalled();
  });

  it("passes its server-defined Turnstile action to the shared pipeline", async () => {
    runPipeline.mockResolvedValue(new Response(null, { status: 201 }));
    const payload = {
      fullName: "Test Person",
      phone: "+14155550199",
      email: "test@example.com",
      consent: true,
      turnstileToken: "token",
      formRenderedAt: Date.now() - 10_000,
      ...(expectedAction === "contact" ? {
        interestedCountry: "United Kingdom",
        serviceRequired: "Study Abroad Counselling",
      } : expectedAction === "consultation" ? {
        currentQualification: "Pursuing bachelor's",
        preferredCountry: "United Kingdom",
      } : {
        educationLevel: "B.Tech",
        budgetRange: "10-15L",
        preferredDestination: "UK",
      }),
    };

    const response = await post(new Request("https://example.test/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }));

    expect(response.status).toBe(201);
    expect(runPipeline).toHaveBeenCalledWith(expect.objectContaining({
      expectedTurnstileAction: expectedAction,
    }));
    runPipeline.mockReset();
  });
});
