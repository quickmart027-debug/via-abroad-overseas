import { NextResponse } from "next/server";
import {
  findMyOptionsSchema,
  attributionSchema,
  budgetRangeLabels,
  HONEYPOT_FIELD,
} from "@/lib/validation/enquiry";
import { readJsonRequestBody } from "@/lib/server/read-json-body";
import { runEnquiryPipeline } from "@/lib/server/enquiry-pipeline";

/**
 * Reuses the exact same validated enquiry pipeline as /contact and
 * /consultation (honeypot -> timing -> rate limit -> Turnstile -> DB
 * insert -> best-effort email), with its own schema. No database schema
 * change: education level maps to `current_qualification`, destination to
 * `interested_country`, and `budgetRange` (no dedicated column) is folded
 * into the free-text `message`. All three are therefore stored in Supabase,
 * shown in the admin dashboard, and included in the business notification
 * email. Add a dedicated budget column later if it needs to be queryable.
 */
export async function POST(request: Request) {
  // Size (413) and Content-Type (415) guards run before the body is parsed.
  const body = await readJsonRequestBody(request);
  if (!body.ok) return body.response;
  const payload = body.payload;

  const parsed = findMyOptionsSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const attribution = attributionSchema.safeParse(
    typeof payload === "object" && payload !== null ? payload : {}
  );

  const data = parsed.data;
  const budgetLabel = budgetRangeLabels[data.budgetRange] ?? data.budgetRange;

  return runEnquiryPipeline({
    request,
    honeypotValue: (payload as Record<string, unknown>)[HONEYPOT_FIELD] as string | undefined,
    formRenderedAt: data.formRenderedAt,
    turnstileToken: data.turnstileToken,
    expectedTurnstileAction: "find_my_options",
    record: {
      enquiry_type: "general",
      full_name: data.fullName,
      phone: data.phone,
      email: data.email,
      interested_country: data.preferredDestination,
      service_required: "Find My Options",
      current_qualification: data.educationLevel,
      message: `Find My Options enquiry. Approximate budget (per year, tuition + living): ${budgetLabel}.`,
      consent: data.consent,
    },
    attribution: attribution.success ? attribution.data : {},
  });
}
