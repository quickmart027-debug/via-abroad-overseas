import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  extractAddress,
  parseRecipientList,
  resolveEmailRouting,
  RESEND_TEST_SENDER,
} from "@/lib/email/config";

const sendMock = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

describe("parseRecipientList", () => {
  it("parses a single address", () => {
    expect(parseRecipientList("viaabroadoverseas@gmail.com")).toEqual({
      recipients: ["viaabroadoverseas@gmail.com"],
      invalidPositions: [],
    });
  });

  it("parses a comma-separated list, trimming whitespace and empty entries", () => {
    expect(parseRecipientList(" enquiries@example.com , viaabroadoverseas@gmail.com ,, ")).toEqual({
      recipients: ["enquiries@example.com", "viaabroadoverseas@gmail.com"],
      invalidPositions: [],
    });
  });

  it("skips invalid entries and reports their positions only", () => {
    const result = parseRecipientList("good@example.com,not-an-email,also bad@x,ok@example.org");
    expect(result.recipients).toEqual(["good@example.com", "ok@example.org"]);
    expect(result.invalidPositions).toEqual([2, 3]);
  });

  it("removes case-insensitive duplicates, keeping the first", () => {
    expect(parseRecipientList("Team@Example.com,team@example.com").recipients).toEqual([
      "Team@Example.com",
    ]);
  });

  it("returns nothing for unset or blank input", () => {
    expect(parseRecipientList(undefined).recipients).toEqual([]);
    expect(parseRecipientList("   ").recipients).toEqual([]);
  });
});

describe("extractAddress", () => {
  it("handles display-name and bare formats", () => {
    expect(extractAddress("VIA ABROAD OVERSEAS <enquiries@example.com>")).toBe("enquiries@example.com");
    expect(extractAddress("enquiries@example.com")).toBe("enquiries@example.com");
  });
});

describe("resolveEmailRouting", () => {
  it("defaults to the business inbox and the Resend test sender, with a warning", () => {
    const config = resolveEmailRouting({ RESEND_API_KEY: "re_test" });
    expect(config.isConfigured).toBe(true);
    expect(config.from).toBe(RESEND_TEST_SENDER);
    expect(config.businessRecipients).toEqual(["viaabroadoverseas@gmail.com"]);
    expect(config.hasVerifiedSendingDomain).toBe(false);
    expect(config.warnings.join(" ")).toContain("onboarding@resend.dev");
  });

  it("treats an explicit resend.dev sender as unverified", () => {
    const config = resolveEmailRouting({
      RESEND_FROM_EMAIL: "VIA ABROAD OVERSEAS <onboarding@resend.dev>",
    });
    expect(config.hasVerifiedSendingDomain).toBe(false);
    expect(config.from).toBe("VIA ABROAD OVERSEAS <onboarding@resend.dev>");
  });

  it("recognises a custom sending domain without warnings", () => {
    const config = resolveEmailRouting({
      RESEND_API_KEY: "re_test",
      RESEND_FROM_EMAIL: "VIA ABROAD OVERSEAS <enquiries@viaabroadoverseas.com>",
      BUSINESS_NOTIFICATION_EMAIL: "enquiries@viaabroadoverseas.com,viaabroadoverseas@gmail.com",
    });
    expect(config.hasVerifiedSendingDomain).toBe(true);
    expect(config.from).toBe("VIA ABROAD OVERSEAS <enquiries@viaabroadoverseas.com>");
    expect(config.businessRecipients).toEqual([
      "enquiries@viaabroadoverseas.com",
      "viaabroadoverseas@gmail.com",
    ]);
    expect(config.warnings).toEqual([]);
  });

  it("falls back to the test sender when RESEND_FROM_EMAIL is malformed", () => {
    const config = resolveEmailRouting({ RESEND_FROM_EMAIL: "VIA ABROAD <not-an-address>" });
    expect(config.from).toBe(RESEND_TEST_SENDER);
    expect(config.hasVerifiedSendingDomain).toBe(false);
  });

  it("warns about invalid recipients without echoing the value, and falls back when none are valid", () => {
    const config = resolveEmailRouting({
      RESEND_FROM_EMAIL: "enquiries@viaabroadoverseas.com",
      BUSINESS_NOTIFICATION_EMAIL: "typo-at-example.com",
    });
    expect(config.businessRecipients).toEqual(["viaabroadoverseas@gmail.com"]);
    const warnings = config.warnings.join(" ");
    expect(warnings).toContain("entry 1");
    expect(warnings).not.toContain("typo-at-example.com");
  });
});

describe("email sending gates", () => {
  async function loadSend() {
    vi.resetModules();
    return import("@/lib/email/send");
  }

  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "email-id" }, error: null });
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  const notification = {
    enquiryId: "00000000-0000-4000-8000-000000000001",
    enquiryType: "general" as const,
    fullName: "Test Student",
    phone: "+919876543210",
    email: "student@example.com",
    submittedAt: "2026-10-04T06:30:00.000Z",
  };

  it("skips both emails without calling Resend when no API key is set", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const { sendBusinessNotificationEmail, sendStudentConfirmationEmail } = await loadSend();
    expect(await sendBusinessNotificationEmail(notification)).toEqual({ success: false, skipped: true });
    expect(await sendStudentConfirmationEmail("student@example.com")).toEqual({
      success: false,
      skipped: true,
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("on the Resend test sender: notifies the business but skips the student confirmation", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("RESEND_FROM_EMAIL", "");
    vi.stubEnv("BUSINESS_NOTIFICATION_EMAIL", "viaabroadoverseas@gmail.com");
    const { sendBusinessNotificationEmail, sendStudentConfirmationEmail } = await loadSend();

    expect(await sendBusinessNotificationEmail(notification)).toEqual({ success: true });
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0]).toMatchObject({
      from: RESEND_TEST_SENDER,
      to: ["viaabroadoverseas@gmail.com"],
      replyTo: "student@example.com",
    });

    expect(await sendStudentConfirmationEmail("student@example.com")).toEqual({
      success: false,
      skipped: true,
    });
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("with a custom domain: sends to every recipient and sends the student confirmation", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("RESEND_FROM_EMAIL", "VIA ABROAD OVERSEAS <enquiries@viaabroadoverseas.com>");
    vi.stubEnv(
      "BUSINESS_NOTIFICATION_EMAIL",
      "enquiries@viaabroadoverseas.com, viaabroadoverseas@gmail.com"
    );
    const { sendBusinessNotificationEmail, sendStudentConfirmationEmail } = await loadSend();

    await sendBusinessNotificationEmail(notification);
    expect(sendMock.mock.calls[0][0]).toMatchObject({
      from: "VIA ABROAD OVERSEAS <enquiries@viaabroadoverseas.com>",
      to: ["enquiries@viaabroadoverseas.com", "viaabroadoverseas@gmail.com"],
      replyTo: "student@example.com",
    });

    expect(await sendStudentConfirmationEmail("student@example.com")).toEqual({ success: true });
    expect(sendMock.mock.calls[1][0]).toMatchObject({
      to: "student@example.com",
      replyTo: "enquiries@viaabroadoverseas.com",
    });
  });

  it("reports a provider error as a failure without throwing", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    sendMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    const { sendBusinessNotificationEmail } = await loadSend();
    expect(await sendBusinessNotificationEmail(notification)).toEqual({ success: false });
  });
});

describe("business notification content", () => {
  it("includes every Find My Options answer, a readable IST time, and the admin link", async () => {
    const { render } = await import("@react-email/components");
    const { BusinessNotificationEmail } = await import("@/emails/business-notification-email");
    const html = await render(
      BusinessNotificationEmail({
        data: {
          enquiryId: "00000000-0000-4000-8000-000000000002",
          enquiryType: "general",
          fullName: "Test Student",
          phone: "+919876543210",
          email: "student@example.com",
          interestedCountry: "Germany",
          serviceRequired: "Find My Options",
          currentQualification: "B.Tech",
          message: "Find My Options enquiry. Approximate budget (per year, tuition + living): ₹15–25L.",
          sourcePath: "/",
          submittedAt: "2026-10-04T06:30:00.000Z",
        },
      }),
      { plainText: true }
    );
    expect(html).toContain("B.Tech");
    expect(html).toContain("Germany");
    expect(html).toContain("₹15–25L");
    expect(html).toContain("12:00");
    expect(html).toContain("IST");
    expect(html).toContain("/admin/enquiries/00000000-0000-4000-8000-000000000002");
  });
});
