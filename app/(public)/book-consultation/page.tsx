import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { ConsultationForm } from "@/components/forms/consultation-form";

export const metadata: Metadata = {
  title: "Book Free Consultation",
  description:
    "Book a free, no-obligation consultation with a VIA ABROAD OVERSEAS counsellor.",
  alternates: { canonical: "/book-consultation" },
};

const expectations = [
  "A one-on-one discussion about your academic background and goals",
  "Honest guidance on realistic country and course options",
  "A clear explanation of next steps and timelines",
];

export default function BookConsultationPage() {
  return (
    <>
      <PageHero
        title="Book Your Free Consultation"
        description="Share a few details and a counsellor will reach out to schedule your session."
        breadcrumb={[{ label: "Book Consultation" }]}
      />

      <section className="bg-surface py-20 md:py-28">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <Reveal>
              <h2 className="font-display text-xl font-semibold text-navy-900">
                What to Expect
              </h2>
              <ul className="mt-5 space-y-4">
                {expectations.map((item) => (
                  <li key={item} className="flex gap-3 text-ink-muted">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.08} className="rounded-2xl border border-border-subtle bg-surface-muted p-6 text-sm text-ink-muted">
              This consultation is completely free with no obligation. We
              will never guarantee a specific admission, visa, or
              scholarship outcome — our role is to give you clear,
              realistic guidance for your next steps.
            </Reveal>
          </div>

          <Reveal delay={0.05} className="rounded-2xl border border-border-subtle bg-surface-muted p-8">
            <ConsultationForm />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
