import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { getFeaturedDestinations } from "@/data/destinations";
import { DestinationCard, hasPhoto } from "@/components/sections/destination-card";

export function DestinationsSection() {
  const destinations = getFeaturedDestinations().filter(hasPhoto);

  return (
    <section className="bg-navy-950 py-20 text-white md:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <h2 className="text-balance font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold">
            Your world starts here.
          </h2>
          <p className="mt-4 text-lg text-white/75">
            Explore destinations that combine world-class education, career
            opportunities and global exposure.
          </p>
        </Reveal>

        <div className="mt-12 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
          {destinations.map((destination, index) => (
            <Reveal
              key={destination.slug}
              delay={(index % 4) * 0.06}
              className="min-w-[78%] snap-start sm:min-w-[45%] md:min-w-0"
            >
              <DestinationCard
                destination={destination}
                sizes="(min-width: 1024px) 23vw, (min-width: 768px) 30vw, 78vw"
              />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex justify-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-400 hover:text-gold-300"
          >
            View all destinations
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
