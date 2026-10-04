import { describe, expect, it } from "vitest";
import { contactFormSchema, findMyOptionsSchema } from "@/lib/validation/enquiry";

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

function parseName(fullName: string) {
  return contactFormSchema.safeParse({ ...validContact, fullName });
}

describe("full name validation", () => {
  it.each([
    "Priya Reddy",
    "Anne-Marie O'Neill",
    "Sean O’Brien",
    "Dr. K. Ramesh",
    "José Álvarez",
    "Zoë Ångström",
    "प्रिया रेड्डी",
    "ప్రియా రెడ్డి",
    "李小龍",
  ])("accepts the real name %s", (name) => {
    const result = parseName(name);
    expect(result.success).toBe(true);
  });

  it("collapses internal whitespace after validation", () => {
    expect(parseName("  Priya \t  Reddy  ").data?.fullName).toBe("Priya Reddy");
  });

  it.each([
    "Priya123",
    "https://spam.example",
    "Click <a href=x>here</a>",
    "name@example.com",
    "Visit spam/now",
    "Win: prizes",
    "<script>",
    "-- .",
  ])("rejects %s with a friendly message", (name) => {
    const result = parseName(name);
    expect(result.success).toBe(false);
    const errors = result.error?.flatten().fieldErrors.fullName ?? [];
    expect(errors.join(" ")).toMatch(/letters only|full name/);
  });

  it("shows the letters-only message for a name with digits", () => {
    expect(parseName("Agent 007").error?.flatten().fieldErrors.fullName).toContain(
      "Please enter your name using letters only."
    );
  });

  it("applies the same rule to the Find My Options form", () => {
    const result = findMyOptionsSchema.safeParse({
      educationLevel: "B.Tech",
      budgetRange: "10-15L",
      preferredDestination: "UK",
      fullName: "http://spam.example",
      phone: "9876543210",
      email: "priya@example.com",
      consent: true,
      turnstileToken: "token",
      formRenderedAt: Date.now() - 10_000,
    });
    expect(result.success).toBe(false);
  });
});
