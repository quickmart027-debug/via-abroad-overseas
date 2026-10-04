import { describe, it, expect } from "vitest";
import {
  contactFormSchema,
  consultationFormSchema,
  findMyOptionsSchema,
  countrySchema,
  serviceSchema,
} from "@/lib/validation/enquiry";

const baseAntiSpam = {
  company_website: "",
  turnstileToken: "test-token",
  formRenderedAt: Date.now() - 5000,
};

describe("contactFormSchema", () => {
  it("accepts a valid submission", () => {
    const result = contactFormSchema.safeParse({
      fullName: "Asha Rao",
      phone: "+91 98765 43210",
      email: "Asha@Example.com",
      interestedCountry: "United States",
      serviceRequired: "Study Abroad Counselling",
      message: "I want to study computer science.",
      consent: true,
      ...baseAntiSpam,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // Email is normalized to lowercase.
      expect(result.data.email).toBe("asha@example.com");
    }
  });

  it("rejects an unchecked consent box", () => {
    const result = contactFormSchema.safeParse({
      fullName: "Asha Rao",
      phone: "+919876543210",
      email: "asha@example.com",
      interestedCountry: "United States",
      serviceRequired: "Study Abroad Counselling",
      consent: false,
      ...baseAntiSpam,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a country value that isn't in the known list", () => {
    const result = contactFormSchema.safeParse({
      fullName: "Asha Rao",
      phone: "+919876543210",
      email: "asha@example.com",
      interestedCountry: "Narnia",
      serviceRequired: "Study Abroad Counselling",
      consent: true,
      ...baseAntiSpam,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an implausible phone number", () => {
    const result = contactFormSchema.safeParse({
      fullName: "Asha Rao",
      phone: "abc",
      email: "asha@example.com",
      interestedCountry: "United States",
      serviceRequired: "Study Abroad Counselling",
      consent: true,
      ...baseAntiSpam,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an oversized message", () => {
    const result = contactFormSchema.safeParse({
      fullName: "Asha Rao",
      phone: "+919876543210",
      email: "asha@example.com",
      interestedCountry: "United States",
      serviceRequired: "Study Abroad Counselling",
      message: "a".repeat(5000),
      consent: true,
      ...baseAntiSpam,
    });
    expect(result.success).toBe(false);
  });
});

describe("consultationFormSchema", () => {
  it("accepts a valid submission without a course specified", () => {
    const result = consultationFormSchema.safeParse({
      fullName: "Rohit Sharma",
      phone: "9876543210",
      email: "rohit@example.com",
      currentQualification: "Pursuing bachelor's",
      preferredCountry: "Canada",
      consent: true,
      ...baseAntiSpam,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown qualification value", () => {
    const result = consultationFormSchema.safeParse({
      fullName: "Rohit Sharma",
      phone: "9876543210",
      email: "rohit@example.com",
      currentQualification: "Wizard",
      preferredCountry: "Canada",
      consent: true,
      ...baseAntiSpam,
    });
    expect(result.success).toBe(false);
  });
});

describe("findMyOptionsSchema", () => {
  it("accepts a valid wizard submission", () => {
    const result = findMyOptionsSchema.safeParse({
      educationLevel: "B.Tech",
      budgetRange: "15-25L",
      preferredDestination: "Canada",
      fullName: "Priya Nair",
      phone: "9876543210",
      email: "priya@example.com",
      consent: true,
      ...baseAntiSpam,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a budget value outside the approved options", () => {
    const result = findMyOptionsSchema.safeParse({
      educationLevel: "B.Tech",
      budgetRange: "1Cr+",
      preferredDestination: "Canada",
      fullName: "Priya Nair",
      phone: "9876543210",
      email: "priya@example.com",
      consent: true,
      ...baseAntiSpam,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an education level outside the approved options", () => {
    const result = findMyOptionsSchema.safeParse({
      educationLevel: "PhD",
      budgetRange: "15-25L",
      preferredDestination: "Canada",
      fullName: "Priya Nair",
      phone: "9876543210",
      email: "priya@example.com",
      consent: true,
      ...baseAntiSpam,
    });
    expect(result.success).toBe(false);
  });
});

describe("enum schemas reject arbitrary strings", () => {
  it("country schema only accepts known destinations plus Other", () => {
    expect(countrySchema.safeParse("United States").success).toBe(true);
    expect(countrySchema.safeParse("Other").success).toBe(true);
    expect(countrySchema.safeParse("<script>alert(1)</script>").success).toBe(false);
  });

  it("service schema only accepts known services", () => {
    expect(serviceSchema.safeParse("Not Sure Yet").success).toBe(true);
    expect(serviceSchema.safeParse("Free Money").success).toBe(false);
  });
});
