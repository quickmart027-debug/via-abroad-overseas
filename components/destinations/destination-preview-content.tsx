import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Destination } from "@/data/destinations";

/**
 * Shared destination summary — rendered inside both the desktop preview
 * panel and the mobile bottom sheet so the two surfaces never carry their
 * own copy of the same content. Only existing `Destination` fields; no new
 * claims (rankings, tuition, visa rates, etc.) are introduced here.
 */
export function DestinationPreviewContent({ destination }: { destination: Destination }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-muted text-lg"
          aria-hidden="true"
        >
          {destination.flag}
        </span>
        <h3 className="font-display text-xl font-semibold text-navy-900">{destination.name}</h3>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{destination.tagline}</p>

      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Popular areas
        </h4>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {destination.popularAreas.map((area) => (
            <li
              key={area}
              className="rounded-full border border-border-subtle bg-surface-muted px-3 py-1 text-xs font-medium text-ink"
            >
              {area}
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-4 space-y-2">
        {destination.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-2 text-sm leading-relaxed text-ink">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
            {highlight}
          </li>
        ))}
      </ul>

      <Link
        href={`/destinations/${destination.slug}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:text-gold-600"
      >
        Explore {destination.name}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </div>
  );
}
