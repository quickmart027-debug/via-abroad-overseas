import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";

/**
 * No verified university partnerships exist (see Phase 0 audit) — this
 * intentionally does not render a logo marquee. A neutral CTA per the
 * brief's "Option B" rather than implying partnerships that don't exist.
 */
export function UniversitiesTeaserSection() {
  return (
    <section className="bg-surface py-16 md:py-20">
      <Container className="flex flex-col items-center gap-5 text-center">
        <Reveal>
          <h2 className="text-balance font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-navy-900">
            Find your place in the world.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-muted">
            Explore universities and institutions that match your ambitions —
            shortlisted around your academic profile, budget and destination.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <Link
            href="/universities"
            className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
          >
            Get My University Shortlist
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
