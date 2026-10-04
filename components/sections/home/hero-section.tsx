import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ConsultationCtaLink } from "@/components/analytics/consultation-cta-link";

/**
 * Full-bleed cinematic hero per the brief: one photograph, subject on the
 * right, a midnight-navy gradient carrying the copy on the left. On phones
 * the subject sits in the upper frame and the copy rises from the bottom.
 */
export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-navy-950 text-white lg:min-h-[94svh] lg:items-center">
      <div className="hero-settle absolute inset-0 -z-10">
        <Image
          src="/hero/hero-student.webp"
          alt="South Asian student standing on an international university campus"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[74%_20%] lg:object-[70%_30%]"
        />
      </div>
      {/* Phones: copy rises from the bottom, subject stays clear above it. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 from-35% via-navy-950/80 via-55% to-navy-950/10 lg:hidden"
        aria-hidden="true"
      />
      {/* Desktop: navy carries the copy on the left, photograph opens on the right. */}
      <div
        className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-navy-950 from-25% via-navy-950/75 via-50% to-navy-950/0 to-80% lg:block"
        aria-hidden="true"
      />
      {/* Top scrim keeps the transparent header legible over a bright sky. */}
      <div
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-navy-950/70 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-navy-950/60 to-transparent"
        aria-hidden="true"
      />

      <Container className="w-full pb-24 pt-[33svh] md:pb-24 lg:py-40">
        <div className="max-w-[46rem]">
          <p
            className="hero-rise flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-300 sm:text-xs"
            style={{ "--hero-step": 0 } as React.CSSProperties}
          >
            <span className="h-px w-8 shrink-0 bg-gold-400" aria-hidden="true" />
            Study Abroad &middot; University Admissions &middot; Visa Guidance
          </p>
          <h1
            className="hero-rise mt-6 font-display text-[clamp(2.6rem,6.2vw,5.25rem)] font-normal leading-[1.02] tracking-[-0.01em]"
            style={{ "--hero-step": 1 } as React.CSSProperties}
          >
            Your dream.
            <br />
            Your destination.
            <br />
            <span className="text-gold-400">Your global future.</span>
          </h1>
          <p
            className="hero-rise mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:mt-6 sm:text-xl"
            style={{ "--hero-step": 2 } as React.CSSProperties}
          >
            Personalised guidance to help you choose the right country,
            university and course — and confidently make your move abroad.
          </p>

          <div
            className="hero-rise mt-7 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:items-center sm:gap-4"
            style={{ "--hero-step": 3 } as React.CSSProperties}
          >
            <ConsultationCtaLink source="home_hero" size="lg">
              Book Free Consultation
            </ConsultationCtaLink>
            {/* Phones: a quiet text link, so the primary CTA leads and both
                clear the bottom action bar in the first viewport. */}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="max-sm:h-11 max-sm:border-transparent max-sm:bg-transparent max-sm:underline max-sm:decoration-gold-400 max-sm:underline-offset-4"
            >
              <Link href="/destinations">
                Explore Destinations
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <p
            className="hero-rise mt-7 max-w-md text-sm leading-relaxed text-white/65"
            style={{ "--hero-step": 4 } as React.CSSProperties}
          >
            From profile evaluation to pre-departure support — we&rsquo;re
            with you every step.
          </p>
        </div>
      </Container>
    </section>
  );
}
