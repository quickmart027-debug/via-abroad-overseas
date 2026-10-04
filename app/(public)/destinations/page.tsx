import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { ConsultationCtaBanner } from "@/components/sections/consultation-cta-banner";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { destinations } from "@/data/destinations";
import { DestinationCard, hasPhoto } from "@/components/sections/destination-card";

/** Photographed destinations lead as cinematic cards; the rest follow as a
 *  typographic index rather than empty placeholder cards. */
const featured = destinations.filter(hasPhoto);
const more = destinations.filter((destination) => !hasPhoto(destination));

export const metadata: Metadata = {
  title: "Study Destinations",
  description:
    "Explore study abroad destinations including the USA, Canada, UK, Australia, Germany, and more with VIA ABROAD OVERSEAS.",
  alternates: { canonical: "/destinations" },
};

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        title="Study destinations"
        description="Explore popular study destinations. Requirements and policies vary by country and can change — your counsellor will confirm current details for your specific plans."
        breadcrumb={[{ label: "Destinations" }]}
      />

      <section className="bg-navy-950 py-20 md:py-28">
        <Container>
          <h2 className="sr-only">Featured destinations</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((destination, index) => (
              <Reveal key={destination.slug} delay={(index % 4) * 0.06}>
                <DestinationCard
                  destination={destination}
                  headingLevel="h3"
                  sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {more.length > 0 && (
        <section className="bg-surface py-20 md:py-24">
          <Container>
            <Reveal className="max-w-2xl">
              <h2 className="text-balance font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-navy-900">
                More places to study.
              </h2>
              <p className="mt-4 text-ink-muted">
                Further destinations we guide students towards, each with its
                own strengths, costs and entry routes.
              </p>
            </Reveal>

            <ul className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((destination) => (
                <li key={destination.slug} className="border-t border-border-strong">
                  <Link
                    href={`/destinations/${destination.slug}`}
                    className="group flex h-full items-start justify-between gap-6 py-6"
                  >
                    <span>
                      <span className="block font-display text-2xl text-navy-900 transition-colors group-hover:text-gold-700">
                        {destination.name}
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-ink-muted">
                        {destination.tagline}
                      </span>
                    </span>
                    <ArrowRight
                      className="mt-2 h-5 w-5 shrink-0 text-gold-700 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <ConsultationCtaBanner />
    </>
  );
}
