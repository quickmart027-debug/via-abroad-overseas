import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Destination } from "@/data/destinations";
import { cn } from "@/lib/utils";

/**
 * Destination photo card — the original design (landscape proportions, an
 * even navy wash over the whole photograph, flag + name + line up top and
 * the explore link at the foot), shared by the homepage and /destinations.
 *
 * Only for destinations with real photography — the /destinations page
 * lists the rest in a separate typographic index instead of mixing in
 * empty navy cards.
 */
export function DestinationCard({
  destination,
  headingLevel: Heading = "h3",
  sizes,
  className,
}: {
  destination: Destination & { imageSrc: string };
  headingLevel?: "h2" | "h3";
  sizes: string;
  className?: string;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-white transition-colors duration-300 hover:border-gold-400/60",
        className
      )}
    >
      <Image
        src={destination.imageSrc}
        alt={destination.imageAlt ?? destination.name}
        fill
        sizes={sizes}
        style={{ objectPosition: destination.imageObjectPosition ?? "center" }}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/60 to-navy-950/45"
        aria-hidden="true"
      />
      <div className="relative z-10">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm"
          aria-hidden="true"
        >
          {destination.flag}
        </span>
        <Heading className="mt-4 font-display text-xl font-semibold">{destination.name}</Heading>
        <p className="mt-2 text-sm leading-relaxed text-white/80">{destination.tagline}</p>
      </div>
      <span className="relative z-10 mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300">
        Explore {destination.name}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}

export function hasPhoto(destination: Destination): destination is Destination & { imageSrc: string } {
  return Boolean(destination.imageSrc);
}
