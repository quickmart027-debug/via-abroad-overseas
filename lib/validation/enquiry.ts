import { z } from "zod";
import { destinations } from "@/data/destinations";
import { services } from "@/data/services";

/**
 * Shared primitives. These are the single source of truth for both
 * client-side (react-hook-form) and server-side (Route Handler)
 * validation — the server re-runs this same schema and never trusts the
 * client's pass/fail result.
 */

function nonEmptyEnum(values: string[]) {
  return z.enum(values as [string, ...string[]]);
}

const countryValues = [...destinations.map((d) => d.name), "Other"];
const serviceValues = [...services.map((s) => s.title), "Not Sure Yet"];
const qualificationValues = [
  "12th / Intermediate",
  "Pursuing bachelor's",
  "Completed bachelor's",
  "Master's degree",
  "Other",
];

export const countrySchema = nonEmptyEnum(countryValues);
export const serviceSchema = nonEmptyEnum(serviceValues);
export const qualificationSchema = nonEmptyEnum(qualificationValues);
export const enquiryTypeSchema = z.enum(["general", "consultation"]);
export const enquiryStatusSchema = z.enum([
  "new",
  "contacted",
  "qualified",
  "closed",
  "spam",
]);

/**
 * Real names only: Unicode letters, combining marks, whitespace, and . ' ’ -
 * (’ because phone keyboards auto-convert apostrophes). Rejecting digits,
 * URLs, and markup characters stops the name field — which is echoed into
 * notification emails — being used to smuggle links or content.
 */
const NAME_PATTERN = /^(?=.*\p{L})[\p{L}\p{M}\s.'’-]+$/u;

const nameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your full name.")
  .max(120, "Name is too long.")
  .regex(NAME_PATTERN, "Please enter your name using letters only.")
  .transform((value) => value.replace(/\s+/g, " "));

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Please enter a valid phone number.")
  .max(20, "Phone number is too long.")
  .regex(/^[+\d][\d\s()-]{5,19}$/, "Please enter a valid phone number.")
  .transform((value) => value.replace(/[\s()-]/g, ""));

const emailSchema = z
  .string()
  .trim()
  .max(254, "Email is too long.")
  .email("Please enter a valid email address.")
  .transform((value) => value.toLowerCase());

const messageSchema = z
  .string()
  .trim()
  .max(4000, "Message is too long.")
  .optional()
  .or(z.literal(""));

const courseSchema = z
  .string()
  .trim()
  .max(160, "Course name is too long.")
  .optional()
  .or(z.literal(""));

const consentSchema = z.literal(true, {
  message: "Please confirm you agree to be contacted before submitting.",
});

/** Honeypot field name shared by both forms — must stay empty. */
export const HONEYPOT_FIELD = "company_website";

const antiSpamFields = {
  // Accept any string here on purpose: a filled honeypot must reach the
  // pipeline's silent fake-success branch, not fail validation with a 400
  // whose fieldErrors would tell the bot exactly which field gave it away.
  [HONEYPOT_FIELD]: z.string().optional(),
  turnstileToken: z.string().min(1, "Please complete the verification challenge."),
  formRenderedAt: z.number(),
};

export const contactFormSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  interestedCountry: countrySchema,
  serviceRequired: serviceSchema,
  message: messageSchema,
  consent: consentSchema,
  ...antiSpamFields,
});

export const consultationFormSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  currentQualification: qualificationSchema,
  preferredCountry: countrySchema,
  interestedCourse: courseSchema,
  message: messageSchema,
  consent: consentSchema,
  ...antiSpamFields,
});

/**
 * "Find My Options" is a separate, self-contained schema rather than a
 * variant of consultationFormSchema — it has its own fixed option sets
 * (education level, budget range, a short destination shortlist) defined
 * by the approved brief, distinct from the full destinations/services
 * catalogues. It reuses the same primitives (name/phone/email/consent/
 * anti-spam) and the same enquiry pipeline, so no new backend
 * infrastructure is introduced.
 */
export const educationLevelSchema = nonEmptyEnum([
  "12th / Intermediate",
  "B.Tech",
  "B.Sc",
  "B.Com",
  "BBA",
  "BCA",
  "MBA",
  "Other",
]);

export const budgetRangeSchema = nonEmptyEnum(["under-10L", "10-15L", "15-25L", "25-40L", "40L+"]);

/** Total per year (tuition + living), as asked in the wizard. */
export const budgetRangeLabels: Record<string, string> = {
  "under-10L": "Under ₹10L",
  "10-15L": "₹10–15L",
  "15-25L": "₹15–25L",
  "25-40L": "₹25–40L",
  "40L+": "₹40L+",
};

export const findMyOptionsDestinationSchema = nonEmptyEnum([
  "UK",
  "USA",
  "Australia",
  "Canada",
  "Germany",
  "Ireland",
  "New Zealand",
  "France",
  "Not Sure",
]);

export const findMyOptionsSchema = z.object({
  educationLevel: educationLevelSchema,
  budgetRange: budgetRangeSchema,
  preferredDestination: findMyOptionsDestinationSchema,
  fullName: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  consent: consentSchema,
  ...antiSpamFields,
});

export type FindMyOptionsInput = z.infer<typeof findMyOptionsSchema>;

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ConsultationFormInput = z.infer<typeof consultationFormSchema>;

/**
 * Attribution metadata captured client-side and re-validated server-side.
 * Each field falls back to undefined on its own (`.catch`), so one bad
 * value (e.g. a very long search-engine referrer) drops only that field
 * instead of silently discarding all attribution for the lead.
 */
export const attributionSchema = z.object({
  source_path: z.string().max(300).optional().catch(undefined),
  referrer: z.string().max(500).optional().catch(undefined),
  utm_source: z.string().max(120).optional().catch(undefined),
  utm_medium: z.string().max(120).optional().catch(undefined),
  utm_campaign: z.string().max(120).optional().catch(undefined),
});
export type Attribution = z.infer<typeof attributionSchema>;
