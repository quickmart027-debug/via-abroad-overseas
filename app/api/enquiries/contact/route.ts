import { NextResponse } from "next/server";
import { contactFormSchema, attributionSchema, HONEYPOT_FIELD } from "@/lib/validation/enquiry";
import { readJsonRequestBody } from "@/lib/server/read-json-body";
import { runEnquiryPipeline } from "@/lib/server/enquiry-pipeline";

export async function POST(request: Request) {
  // Size (413) and Content-Type (415) guards run before the body is parsed.
  const body = await readJsonRequestBody(request);
  if (!body.ok) return body.response;
  const payload = body.payload;

  const parsed = contactFormSchema.safeParse(payload);
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

  return runEnquiryPipeline({
    request,
    honeypotValue: (payload as Record<string, unknown>)[HONEYPOT_FIELD] as string | undefined,
    formRenderedAt: data.formRenderedAt,
    turnstileToken: data.turnstileToken,
    expectedTurnstileAction: "contact",
    record: {
      enquiry_type: "general",
      full_name: data.fullName,
      phone: data.phone,
      email: data.email,
      interested_country: data.interestedCountry,
      service_required: data.serviceRequired,
      message: data.message || undefined,
      consent: data.consent,
    },
    attribution: attribution.success ? attribution.data : {},
  });
}
