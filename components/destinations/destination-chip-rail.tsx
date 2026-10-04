"use client";

import type { Destination } from "@/data/destinations";
import { cn } from "@/lib/utils";

/**
 * Horizontally scrollable chip for every destination — the canonical
 * keyboard/screen-reader interaction surface (the map is aria-hidden).
 * Never depends on map hit targets, so small countries are always
 * selectable. Focus previews on desktop (mirrors map hover); click/Enter
 * persists the selection.
 */
export function DestinationChipRail({
  destinations,
  selectedSlug,
  onPreview,
  onSelect,
}: {
  destinations: Destination[];
  selectedSlug: string | null;
  onPreview: (slug: string | null) => void;
  onSelect: (slug: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Study destinations"
      className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1"
    >
      {destinations.map((destination) => {
        const isSelected = destination.slug === selectedSlug;
        return (
          <button
            key={destination.slug}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(destination.slug)}
            onFocus={() => onPreview(destination.slug)}
            onBlur={() => onPreview(null)}
            onMouseEnter={() => onPreview(destination.slug)}
            onMouseLeave={() => onPreview(null)}
            className={cn(
              "flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150",
              isSelected
                ? "border-gold-500 bg-gold-500 text-navy-950"
                : "border-border-subtle bg-surface text-ink hover:border-gold-400"
            )}
          >
            <span aria-hidden="true">{destination.flag}</span>
            {destination.name}
          </button>
        );
      })}
    </div>
  );
}
