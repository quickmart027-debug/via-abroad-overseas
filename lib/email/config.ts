import "server-only";
import { z } from "zod";
import { business } from "@/lib/config";

/**
 * Email routing is driven entirely by environment variables so moving to
 * a custom domain later needs no code change — only new env values and a
 * redeploy (see docs/DEPLOYMENT.md, "When you get the domain").
 *
 *   BUSINESS_NOTIFICATION_EMAIL  comma-separated inbox list for new-enquiry
 *                                notifications. The first valid address is
 *                                the primary inbox (used as reply-to on the
 *                                student confirmation).
 *   RESEND_FROM_EMAIL            sender identity, "Name <addr@domain>" or a
 *                                bare address, on a domain verified in Resend.
 *
 * Until a domain is verified, Resend's shared test sender
 * (onboarding@resend.dev) can only deliver to the Resend account owner's
 * own address — so student confirmations are skipped in that mode.
 */

export const RESEND_TEST_SENDER = "VIA ABROAD OVERSEAS <onboarding@resend.dev>";
const RESEND_TEST_DOMAIN = "resend.dev";

const addressSchema = z.string().email();

export type RecipientParseResult = {
  recipients: string[];
  /** 1-based positions of entries that were not valid email addresses. */
  invalidPositions: number[];
};

/**
 * Parses a comma-separated recipient list. Invalid entries are dropped
 * (reported by position only, so config values never end up in logs) and
 * duplicates are removed case-insensitively, keeping the first occurrence.
 */
export function parseRecipientList(raw: string | undefined): RecipientParseResult {
  const recipients: string[] = [];
  const invalidPositions: number[] = [];
  const seen = new Set<string>();

  (raw ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .forEach((entry, index) => {
      if (!entry) return;
      if (!addressSchema.safeParse(entry).success) {
        invalidPositions.push(index + 1);
        return;
      }
      const key = entry.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      recipients.push(entry);
    });

  return { recipients, invalidPositions };
}

/** Extracts the bare address from `"Name <addr@domain>"` or `addr@domain`. */
export function extractAddress(fromValue: string): string {
  const match = fromValue.match(/<([^<>]+)>\s*$/);
  return (match ? match[1] : fromValue).trim();
}

export type EmailRoutingConfig = {
  isConfigured: boolean;
  from: string;
  businessRecipients: string[];
  /**
   * True only when RESEND_FROM_EMAIL is a valid address on a domain other
   * than resend.dev. The domain must also be verified in Resend for mail
   * to actually deliver — that cannot be checked from here.
   */
  hasVerifiedSendingDomain: boolean;
  /** Human-readable setup warnings (never contain secrets or student data). */
  warnings: string[];
};

type EmailEnv = Record<string, string | undefined>;

export function resolveEmailRouting(env: EmailEnv = process.env): EmailRoutingConfig {
  const warnings: string[] = [];

  const rawFrom = env.RESEND_FROM_EMAIL?.trim() ?? "";
  const fromAddress = rawFrom ? extractAddress(rawFrom) : "";
  const fromIsValid = Boolean(fromAddress) && addressSchema.safeParse(fromAddress).success;
  const fromDomain = fromIsValid ? fromAddress.split("@")[1].toLowerCase() : "";
  const hasVerifiedSendingDomain = fromIsValid && fromDomain !== RESEND_TEST_DOMAIN;

  if (rawFrom && !fromIsValid) {
    warnings.push(
      "RESEND_FROM_EMAIL is not a valid address (expected \"Name <addr@domain>\" or addr@domain); falling back to Resend's test sender."
    );
  }
  if (!hasVerifiedSendingDomain) {
    warnings.push(
      "RESEND_FROM_EMAIL is unset or uses Resend's test sender (onboarding@resend.dev). Resend only delivers test-sender mail to the Resend account owner's own address, so BUSINESS_NOTIFICATION_EMAIL must be that address, and student confirmation emails are skipped. Verify a domain in Resend and set RESEND_FROM_EMAIL to an address on it to lift both limits."
    );
  }

  const { recipients, invalidPositions } = parseRecipientList(env.BUSINESS_NOTIFICATION_EMAIL);
  if (invalidPositions.length > 0) {
    warnings.push(
      `BUSINESS_NOTIFICATION_EMAIL entr${invalidPositions.length === 1 ? "y" : "ies"} ${invalidPositions.join(", ")} ${invalidPositions.length === 1 ? "is" : "are"} not a valid email address and will be skipped.`
    );
  }
  if (recipients.length === 0) {
    if (env.BUSINESS_NOTIFICATION_EMAIL?.trim()) {
      warnings.push(
        "BUSINESS_NOTIFICATION_EMAIL contains no valid addresses; falling back to the default business inbox."
      );
    }
    recipients.push(business.email);
  }

  return {
    isConfigured: Boolean(env.RESEND_API_KEY?.trim()),
    from: fromIsValid ? rawFrom : RESEND_TEST_SENDER,
    businessRecipients: recipients,
    hasVerifiedSendingDomain,
    warnings,
  };
}
