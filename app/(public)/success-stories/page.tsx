import type { Metadata } from "next";
import Image from "next/image";
import { Quote, UserRound } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { ConsultationCtaLink } from "@/components/analytics/consultation-cta-link";
import { testimonials } from "@/data/testimonials";

export const metadata: Metadata = {
  title: "Student Success Stories",
  description:
    "Stories from VIA ABROAD OVERSEAS students, published with their permission.",
  alternates: { canonical: "/success-stories" },
};

export default function SuccessStoriesPage() {
  return (
    <>
      <PageHero
        title="Student Success Stories"
        breadcrumb={[{ label: "Success Stories" }]}
      />

      <section className="bg-surface py-20 md:py-28">
        <Container>
          {testimonials.length === 0 ? (
            <Reveal className="mx-auto max-w-2xl rounded-[2rem] border border-gold-200 bg-gradient-to-br from-navy-900 to-navy-800 px-8 py-16 text-center text-white sm:px-16">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/15 text-gold-300">
                <Quote className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-balance font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold">
                Student stories are on their way.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/70">
                We only publish stories that students have approved, with their
                real name, course and university. They will appear here as
                students share them.
              </p>
              <div className="mt-8 flex justify-center">
                <ConsultationCtaLink source="success_stories_page" size="lg">
                  Book Free Consultation
                </ConsultationCtaLink>
              </div>
            </Reveal>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Reveal
                  key={testimonial.studentName}
                  className="rounded-2xl border border-border-subtle bg-surface-muted p-7"
                >
                  <div className="flex items-center gap-3">
                    {testimonial.photoUrl ? (
                      <Image
                        src={testimonial.photoUrl}
                        alt={testimonial.studentName}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-900/5 text-navy-900">
                        <UserRound className="h-6 w-6" aria-hidden="true" />
                      </span>
                    )}
                    <div>
                      <p className="font-semibold text-navy-900">{testimonial.studentName}</p>
                      <p className="text-xs text-ink-faint">
                        {testimonial.course ? `${testimonial.course} · ` : ""}
                        {testimonial.university ? `${testimonial.university}, ` : ""}
                        {testimonial.destination}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-ink-muted">&ldquo;{testimonial.quote}&rdquo;</p>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
