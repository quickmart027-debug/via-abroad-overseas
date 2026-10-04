import "server-only";
import { NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import {
  formFingerprintLimiter,
  formContactLimiter,
  formEmailLimiter,
  formIpLimiter,
} from "@/lib/rate-limit/limiter";
import { hashRequestFingerprint, getClientIp } from "@/lib/security/fingerprint";
import {
  deriveContactPairRateLimitKey,
  deriveEmailRateLimitKey,
  deriveIpRateLimitKey,
} from "@/lib/rate-limit/contact-key";
import { getAbuseHashSalt, RateLimitUnavailableError } from "@/lib/rate-limit/config";
import { isHoneypotTripped, isSuspiciouslyFast, isFormStale } from "@/lib/security/spam-checks";
import { insertEnquiry, type NewEnquiryRecord } from "@/lib/database/enquiries";
import { sendBusinessNotificationEmail, sendStudentConfirmationEmail } from "@/lib/email/send";
import type { Attribution } from "@/lib/validation/enquiry";

export type EnquiryPipelineInput = {
  request: Request;
  honeypotValue: string | undefined;
  formRenderedAt: number;
  turnstileToken: string;
  expectedTurnstileAction: string;
  record: Omit<NewEnquiryRecord, "abuse_fingerprint">;
  attribution: Attribution;
};

const GENERIC_ERROR = {
  error: "We couldn't process your submission. Please try again in a moment.",
};
const SERVICE_UNAVAILABLE = {
  error: "Service temporarily unavailable. Please try again shortly.",
};

function tooManySubmissions() {
  return NextResponse.json(
    { error: "Too many submissions. Please wait a few minutes and try again." },
    { status: 429 }
  );
}

/** Fail closed: limiter/salt problems become a generic 503, never a pass. */
function abuseProtectionUnavailable(error: unknown) {
  const reason = error instanceof RateLimitUnavailableError ? error.reason : "fingerprint_unavailable";
  console.error("[enquiry] Abuse protection unavailable.", { reason });
  return NextResponse.json(SERVICE_UNAVAILABLE, { status: 503 });
}

export async function runEnquiryPipeline({
  request,
  honeypotValue,
  formRenderedAt,
  turnstileToken,
  expectedTurnstileAction,
  record,
  attribution,
}: EnquiryPipelineInput): Promise<NextResponse> {
  // 1. Honeypot — silently pretend success so bots don't learn anything.
  if (isHoneypotTripped(honeypotValue)) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // 2. Timing heuristics — one signal among several, never sole authority.
  if (isFormStale(formRenderedAt) || isSuspiciouslyFast(formRenderedAt)) {
    return NextResponse.json(GENERIC_ERROR, { status: 400 });
  }

  const ip = getClientIp(request.headers);
  const userAgent = request.headers.get("user-agent") || "unknown";
  let fingerprint: string;
  try {
    fingerprint = await hashRequestFingerprint(ip, userAgent);

    // 3. Cheap per-source limits first — per-IP (IP only, so rotating the
    // User-Agent can't reset it) and per-fingerprint — so bots are turned
    // away before we spend a Turnstile verification on them.
    const ipKey = deriveIpRateLimitKey(ip, getAbuseHashSalt());
    const [ipResult, fingerprintResult] = await Promise.all([
      formIpLimiter.limit(ipKey),
      formFingerprintLimiter.limit(`fingerprint:v1:${fingerprint}`),
    ]);
    if (!ipResult.success || !fingerprintResult.success) return tooManySubmissions();
  } catch (error) {
    return abuseProtectionUnavailable(error);
  }

  // 4. Bot challenge — always re-verified server-side.
  const turnstileResult = await verifyTurnstileToken({
    token: turnstileToken,
    expectedAction: expectedTurnstileAction,
    remoteIp: ip,
  });
  if (!turnstileResult.valid) {
    if (
      turnstileResult.reason === "provider_unavailable" ||
      turnstileResult.reason === "configuration_missing"
    ) {
      console.error("[enquiry] Turnstile verification unavailable.", {
        reason: turnstileResult.reason,
      });
      return NextResponse.json(SERVICE_UNAVAILABLE, { status: 503 });
    }
    return NextResponse.json(
      { error: "We couldn't verify your submission. Please try again." },
      { status: 400 }
    );
  }

  // 5. Per-recipient limits, only after Turnstile passes, so requests with
  // invalid tokens can't exhaust a victim's email/phone quota. The email-only
  // HMAC key caps confirmation emails to one inbox whatever phone is paired.
  try {
    const salt = getAbuseHashSalt();
    const [contactResult, emailResult] = await Promise.all([
      formContactLimiter.limit(deriveContactPairRateLimitKey(record.email, record.phone, salt)),
      formEmailLimiter.limit(deriveEmailRateLimitKey(record.email, salt)),
    ]);
    if (!contactResult.success || !emailResult.success) return tooManySubmissions();
  } catch (error) {
    return abuseProtectionUnavailable(error);
  }

  // 6. Persist — the database insert is the source of truth for success.
  let inserted: { id: string; created_at: string };
  try {
    inserted = await insertEnquiry({
      ...record,
      ...attribution,
      abuse_fingerprint: fingerprint,
    });
  } catch {
    console.error("[enquiry] Database insert failed.");
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  // 7. Notifications — best-effort, never block or fail the response.
  // A failure here is logged for monitoring but the enquiry is already
  // safely stored, so the user still receives a genuine success response.
  const notifyPromise = sendBusinessNotificationEmail({
    enquiryId: inserted.id,
    enquiryType: record.enquiry_type,
    fullName: record.full_name,
    phone: record.phone,
    email: record.email,
    interestedCountry: record.interested_country,
    serviceRequired: record.service_required,
    currentQualification: record.current_qualification,
    interestedCourse: record.interested_course,
    message: record.message,
    sourcePath: attribution.source_path,
    submittedAt: inserted.created_at,
  }).then((result) => {
    if (!result.success && !result.skipped) {
      console.error(
        `[enquiry] Business notification failed for enquiry ${inserted.id}. Lead is safely stored; manual follow-up on the notification may be required.`
      );
    }
  });

  const confirmPromise = sendStudentConfirmationEmail(record.email).then(
    (result) => {
      if (!result.success && !result.skipped) {
        console.error(`[enquiry] Student confirmation failed for enquiry ${inserted.id}.`);
      }
    }
  );

  await Promise.allSettled([notifyPromise, confirmPromise]);

  return NextResponse.json({ success: true, id: inserted.id }, { status: 201 });
}
