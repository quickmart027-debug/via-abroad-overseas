import "server-only";
import { Resend } from "resend";
import { BusinessNotificationEmail } from "@/emails/business-notification-email";
import { StudentConfirmationEmail } from "@/emails/student-confirmation-email";
import type { EnquiryEmailData } from "@/lib/email/types";
import { resolveEmailRouting, type EmailRoutingConfig } from "@/lib/email/config";
import { business } from "@/lib/config";

/**
 * Routing (sender, recipients, confirmation gating) is resolved once per
 * server instance from env vars — see lib/email/config.ts. Setup warnings
 * are logged once at that point rather than on every enquiry.
 */
let routing: EmailRoutingConfig | null = null;
let resend: Resend | null = null;

function getRouting(): EmailRoutingConfig {
  if (routing) return routing;
  routing = resolveEmailRouting();
  if (routing.isConfigured) {
    resend = new Resend(process.env.RESEND_API_KEY);
    for (const warning of routing.warnings) console.warn(`[email] ${warning}`);
  }
  return routing;
}

export type EmailResult = { success: boolean; skipped?: boolean };

/**
 * Both send functions are intentionally fail-safe: a failure here must
 * never roll back or block the enquiry, which has already been persisted
 * to the database by the time these are called. Failures are logged
 * (safely — no secrets, no full message bodies) for monitoring so a human
 * can follow up, but the API route always still reports success to the
 * user because their enquiry genuinely was saved.
 */
export async function sendBusinessNotificationEmail(
  data: EnquiryEmailData
): Promise<EmailResult> {
  const config = getRouting();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured — skipping business notification email.");
    return { success: false, skipped: true };
  }

  try {
    const result = await resend.emails.send({
      from: config.from,
      to: config.businessRecipients,
      // Staff can reply straight to the student from their inbox.
      replyTo: data.email,
      subject: `New ${data.enquiryType === "consultation" ? "Consultation Request" : "Enquiry"} — ${data.fullName}`,
      react: BusinessNotificationEmail({ data }),
    });
    if (result.error) {
      console.error("[email] Business notification send failed.");
      return { success: false };
    }
    return { success: true };
  } catch {
    console.error("[email] Business notification send threw.");
    return { success: false };
  }
}

export async function sendStudentConfirmationEmail(toEmail: string): Promise<EmailResult> {
  const config = getRouting();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured — skipping student confirmation email.");
    return { success: false, skipped: true };
  }

  // Resend's test sender can only deliver to the account owner, so a send
  // to a student's address would just fail. Wait for a verified domain.
  if (!config.hasVerifiedSendingDomain) {
    console.info(
      "[email] Student confirmation skipped — no verified sending domain configured (RESEND_FROM_EMAIL)."
    );
    return { success: false, skipped: true };
  }

  try {
    const result = await resend.emails.send({
      from: config.from,
      to: toEmail,
      // Student replies land in the primary business inbox, not the sender mailbox.
      replyTo: config.businessRecipients[0],
      subject: `We received your enquiry — ${business.name}`,
      react: StudentConfirmationEmail(),
    });
    if (result.error) {
      console.error("[email] Student confirmation send failed.");
      return { success: false };
    }
    return { success: true };
  } catch {
    console.error("[email] Student confirmation send threw.");
    return { success: false };
  }
}
