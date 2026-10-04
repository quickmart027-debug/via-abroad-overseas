"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/field";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import {
  findMyOptionsSchema,
  type FindMyOptionsInput,
  budgetRangeLabels,
  HONEYPOT_FIELD,
} from "@/lib/validation/enquiry";
import { trackEvent } from "@/lib/analytics/events";
import { getStoredUtmAttribution } from "@/lib/analytics/utm";
import { isTurnstileConfigured } from "@/lib/config";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "educationLevel", label: "Education" },
  { key: "budgetRange", label: "Budget" },
  { key: "preferredDestination", label: "Destination" },
  { key: "contact", label: "Your Details" },
] as const;

const educationOptions = ["12th / Intermediate", "B.Tech", "B.Sc", "B.Com", "BBA", "BCA", "MBA", "Other"] as const;
const budgetOptions = Object.keys(budgetRangeLabels) as (keyof typeof budgetRangeLabels)[];
const destinationOptions = [
  "UK",
  "USA",
  "Australia",
  "Canada",
  "Germany",
  "Ireland",
  "New Zealand",
  "France",
  "Not Sure",
] as const;

export function FindMyOptionsWizard() {
  const [step, setStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [startedTracked, setStartedTracked] = React.useState(false);
  const [formRenderedAt] = React.useState(() => Date.now());

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FindMyOptionsInput>({
    resolver: zodResolver(findMyOptionsSchema),
    defaultValues: {
      formRenderedAt,
      turnstileToken: isTurnstileConfigured ? "" : "turnstile-not-configured",
      consent: false as unknown as true,
    },
  });

  function trackStart() {
    if (startedTracked) return;
    setStartedTracked(true);
    trackEvent("find_my_options_started", { source: "home_find_my_options" });
  }

  async function goNext() {
    trackStart();
    const field = STEPS[step].key;
    if (field === "contact") return;
    const valid = await trigger(field as "educationLevel" | "budgetRange" | "preferredDestination");
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: FindMyOptionsInput) {
    try {
      const response = await fetch("/api/enquiries/find-my-options", {
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
      trackEvent("find_my_options_submitted", { source: "home_find_my_options" });
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    }
  }

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center gap-4 rounded-2xl border border-success-bg bg-success-bg px-6 py-14 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
        <p className="max-w-sm text-success">
          Thanks, we have your answers. A counsellor will call you on the
          number you gave to talk through the options that fit.
        </p>
      </div>
    );
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-[1.75rem] border border-border-subtle bg-surface p-6 sm:p-9"
    >
      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor={HONEYPOT_FIELD}>Company Website</label>
        <input id={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" {...register(HONEYPOT_FIELD)} />
      </div>

      <ol aria-label="Progress" className="flex items-center gap-2">
        {STEPS.map((s, index) => (
          <li key={s.key} className="flex flex-1 items-center gap-2">
            <span
              aria-current={index === step ? "step" : undefined}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                index < step
                  ? "bg-gold-500 text-navy-950"
                  : index === step
                    ? "border-2 border-gold-500 text-navy-900"
                    : "border border-border-strong text-ink-muted"
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-semibold sm:block",
                index === step ? "text-navy-900" : "text-ink-muted"
              )}
            >
              {s.label}
            </span>
            {index < STEPS.length - 1 && (
              <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
      <p className="sr-only" role="status" aria-live="polite">
        Step {step + 1} of {STEPS.length}: {STEPS[step].label}
      </p>

      <div className="mt-8 min-h-[260px]">
        {step === 0 && (
          <fieldset>
            <legend className="font-display text-xl font-semibold text-navy-900">
              What did you study, or what are you studying now?
            </legend>
            <OptionGrid
              name="educationLevel"
              label="Education level"
              options={educationOptions}
              register={register}
              columns={4}
            />
            {errors.educationLevel && (
              <p role="alert" className="mt-3 text-xs font-medium text-error">
                {errors.educationLevel.message}
              </p>
            )}
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="font-display text-xl font-semibold text-navy-900">
              What&rsquo;s your approximate budget per year?
            </legend>
            <p className="mt-1.5 text-sm text-ink-muted">Tuition plus living costs, in rupees.</p>
            <OptionGrid
              name="budgetRange"
              label="Approximate budget"
              options={budgetOptions}
              labels={budgetRangeLabels}
              register={register}
              columns={5}
            />
            {errors.budgetRange && (
              <p role="alert" className="mt-3 text-xs font-medium text-error">
                {errors.budgetRange.message}
              </p>
            )}
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="font-display text-xl font-semibold text-navy-900">
              Where would you like to study?
            </legend>
            <OptionGrid name="preferredDestination" label="Preferred destination" options={destinationOptions} register={register} />
            {errors.preferredDestination && (
              <p role="alert" className="mt-3 text-xs font-medium text-error">
                {errors.preferredDestination.message}
              </p>
            )}
          </fieldset>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h3 className="font-display text-xl font-semibold text-navy-900">
              Almost there &mdash; where should we send your options?
            </h3>
            <Field label="Name" htmlFor="fmo-fullName" required error={errors.fullName?.message}>
              <input id="fmo-fullName" className={inputClassName} autoComplete="name" {...register("fullName")} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone" htmlFor="fmo-phone" required error={errors.phone?.message}>
                <input id="fmo-phone" type="tel" className={inputClassName} autoComplete="tel" {...register("phone")} />
              </Field>
              <Field label="Email" htmlFor="fmo-email" required error={errors.email?.message}>
                <input id="fmo-email" type="email" className={inputClassName} autoComplete="email" {...register("email")} />
              </Field>
            </div>

            <TurnstileWidget action="find_my_options" onVerify={(token) => setValue("turnstileToken", token, { shouldValidate: true })} />
            {errors.turnstileToken && (
              <p role="alert" className="text-xs font-medium text-error">
                {errors.turnstileToken.message}
              </p>
            )}

            <div className="flex items-start gap-3">
              <input
                id="fmo-consent"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 shrink-0 rounded border-border-strong text-gold-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-700"
                {...register("consent")}
              />
              <label htmlFor="fmo-consent" className="text-sm text-ink-muted">
                I agree that VIA ABROAD OVERSEAS may contact me regarding my
                enquiry.
              </label>
            </div>
            {errors.consent && (
              <p role="alert" className="text-xs font-medium text-error">
                {errors.consent.message}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-border-subtle pt-6">
        <Button
          type="button"
          variant="outlineNavy"
          size="sm"
          onClick={goBack}
          disabled={step === 0}
          className={step === 0 ? "invisible" : ""}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        {isLastStep ? (
          <Button type="submit" size="default" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Find My Options
          </Button>
        ) : (
          <Button type="button" size="default" onClick={goNext}>
            Next
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  );
}

function OptionGrid<Name extends "educationLevel" | "budgetRange" | "preferredDestination">({
  name,
  label,
  options,
  labels,
  register,
  columns = 3,
}: {
  name: Name;
  label: string;
  options: readonly string[];
  labels?: Record<string, string>;
  register: ReturnType<typeof useForm<FindMyOptionsInput>>["register"];
  columns?: 3 | 4 | 5;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-required="true"
      className={cn(
        // An odd last option spans the full row on phones instead of sitting alone.
        "mt-5 grid grid-cols-2 gap-3 [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:col-span-1",
        columns === 3 && "sm:grid-cols-3",
        columns === 4 && "sm:grid-cols-4",
        columns === 5 && "sm:grid-cols-5"
      )}
    >
      {options.map((option) => {
        const id = `${name}-${option}`;
        return (
          <div key={option}>
            <input
              id={id}
              type="radio"
              value={option}
              className="peer sr-only"
              {...register(name)}
            />
            <label
              htmlFor={id}
              className="flex h-14 cursor-pointer items-center justify-center rounded-xl border border-border-strong bg-surface px-3 text-center text-sm font-semibold text-navy-900 transition-colors hover:border-gold-400 peer-checked:border-navy-900 peer-checked:bg-navy-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-gold-700"
            >
              {labels?.[option] ?? option}
            </label>
          </div>
        );
      })}
    </div>
  );
}
