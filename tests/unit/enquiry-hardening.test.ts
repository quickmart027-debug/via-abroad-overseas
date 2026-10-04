import { describe, expect, it } from "vitest";
import { attributionSchema, contactFormSchema, HONEYPOT_FIELD } from "@/lib/validation/enquiry";

const validContact = {
  fullName: "Priya Reddy",
  phone: "9876543210",
  email: "priya@example.com",
  interestedCountry: "United Kingdom",
  serviceRequired: "Not Sure Yet",
  consent: true,
  turnstileToken: "token",
  formRenderedAt: Date.now() - 10_000,
};

describe("honeypot field", () => {
  it("passes schema validation when filled, so the pipeline can fake success silently", () => {
    const result = contactFormSchema.safeParse({
      ...validContact,
      [HONEYPOT_FIELD]: "http://spam.example",
    });
    expect(result.success).toBe(true);
    expect(result.data?.[HONEYPOT_FIELD]).toBe("http://spam.example");
  });
});

describe("attributionSchema", () => {
  it("drops only the invalid field instead of discarding all attribution", () => {
    const result = attributionSchema.parse({
      source_path: "/contact",
      referrer: `https://www.google.com/search?q=${"x".repeat(600)}`,
      utm_source: "instagram",
    });
    expect(result).toEqual({ source_path: "/contact", referrer: undefined, utm_source: "instagram" });
  });

  it("ignores non-string values", () => {
    expect(attributionSchema.parse({ source_path: 42 }).source_path).toBeUndefined();
  });
});
