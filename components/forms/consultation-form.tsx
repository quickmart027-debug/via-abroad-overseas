"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClassName, textareaClassName, selectClassName } from "@/components/ui/field";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import {
  consultationFormSchema,
  type ConsultationFormInput,
  HONEYPOT_FIELD,
} from "@/lib/validation/enquiry";
import { destinations } from "@/data/destinations";
import { trackEvent } from "@/lib/analytics/events";
import { getStoredUtmAttribution } from "@/lib/analytics/utm";
import { isTurnstileConfigured } from "@/lib/config";

const countryOptions = [...destinations.map((d) => d.name), "Other"];
const qualificationOptions = ["12th / Intermediate", "Pursuing bachelor's", "Completed bachelor's", "Master's degree", "Other"];

export function ConsultationForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [startedTracked, setStartedTracked] = React.useState(false);
  const [formRenderedAt] = React.useState(() => Date.now());

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormInput>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      formRenderedAt,
      turnstileToken: isTurnstileConfigured ? "" : "turnstile-not-configured",
      consent: false as unknown as true,
    },
  });


  function trackStart() {
    if (startedTracked) return;
    setStartedTracked(true);
    trackEvent("consultation_form_started", { source: "book_consultation_page" });
  }

  async function onSubmit(data: ConsultationFormInput) {
    try {
      const response = await fetch("/api/enquiries/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ...getStoredUtmAttribution(),
          source_path: window.location.pathname,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        toast.error(body.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      trackEvent("consultation_submitted", { source: "book_consultation_page" });
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-success-bg bg-success-bg px-6 py-12 text-center" role="status" aria-live="polite">
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
        <p className="max-w-sm text-success">
          Thanks, your consultation request is in. A counsellor will call you
          on the number you gave to arrange a time.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} onFocus={trackStart} className="flex flex-col gap-5" noValidate>
      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor={HONEYPOT_FIELD}>Company Website</label>
        <input id={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" {...register(HONEYPOT_FIELD)} />
      </div>

      <Field label="Name" htmlFor="fullName" required error={errors.fullName?.message}>
        <input id="fullName" className={inputClassName} autoComplete="name" {...register("fullName")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone" required error={errors.phone?.message}>
          <input id="phone" type="tel" className={inputClassName} autoComplete="tel" {...register("phone")} />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email?.message}>
          <input id="email" type="email" className={inputClassName} autoComplete="email" {...register("email")} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Current Qualification" htmlFor="currentQualification" required error={errors.currentQualification?.message}>
          <select id="currentQualification" className={selectClassName} defaultValue="" {...register("currentQualification")}>
            <option value="" disabled>
              Select your qualification
            </option>
            {qualificationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Preferred Country" htmlFor="preferredCountry" required error={errors.preferredCountry?.message}>
          <select id="preferredCountry" className={selectClassName} defaultValue="" {...register("preferredCountry")}>
            <option value="" disabled>
              Select a country
            </option>
            {countryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Interested Course" htmlFor="interestedCourse" error={errors.interestedCourse?.message}>
        <input
          id="interestedCourse"
          className={inputClassName}
          placeholder="e.g. MS Computer Science"
          {...register("interestedCourse")}
        />
      </Field>

      <Field label="Message" htmlFor="message" error={errors.message?.message}>
        <textarea id="message" rows={4} className={textareaClassName} {...register("message")} />
      </Field>

      <TurnstileWidget action="consultation" onVerify={(token) => setValue("turnstileToken", token, { shouldValidate: true })} />
      {errors.turnstileToken && (
        <p role="alert" className="text-xs font-medium text-error">
          {errors.turnstileToken.message}
        </p>
      )}

      <div className="flex items-start gap-3">
        <input
          id="consent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 shrink-0 rounded border-border-strong text-gold-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-700"
          {...register("consent")}
        />
        <label htmlFor="consent" className="text-sm text-ink-muted">
          I agree that VIA ABROAD OVERSEAS may contact me regarding my
          enquiry.
        </label>
      </div>
      {errors.consent && (
        <p role="alert" className="text-xs font-medium text-error">
          {errors.consent.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Book Free Consultation
      </Button>
    </form>
  );
}
