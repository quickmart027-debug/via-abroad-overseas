"use client";

import * as React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import type { Destination } from "@/data/destinations";
import { getTopojsonIdForCountryCode } from "@/lib/geo/country-codes";
import { cn } from "@/lib/utils";

const GEO_URL = "/geo/countries-50m.json";

/**
 * World map rendered from a self-hosted TopoJSON file (see
 * lib/geo/country-codes.ts for provenance). Decorative/supplementary only —
 * the whole SVG is aria-hidden; the chip rail is the canonical keyboard and
 * screen-reader interaction surface. Fixed fit-to-view, no pan/zoom.
 */
export function DestinationMap({
  destinations,
  selectedSlug,
  previewSlug,
  onPreview,
  onSelect,
}: {
  destinations: Destination[];
  selectedSlug: string | null;
  previewSlug: string | null;
  onPreview: (slug: string | null) => void;
  onSelect: (slug: string) => void;
}) {
  const countryIndex = React.useMemo(() => {
    const index = new Map<string, Destination>();
    for (const destination of destinations) {
      const topojsonId = getTopojsonIdForCountryCode(destination.countryCode);
      if (topojsonId) index.set(topojsonId, destination);
    }
    return index;
  }, [destinations]);

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-border-subtle bg-navy-950"
    >
      <ComposableMap
        width={800}
        height={420}
        projectionConfig={{ scale: 130 }}
        className="h-auto w-full"
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const destination = countryIndex.get(String(geo.id));
              const isSupported = Boolean(destination);
              const isSelected = isSupported && destination!.slug === selectedSlug;
              const isPreviewed = isSupported && destination!.slug === previewSlug;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  tabIndex={-1}
                  data-country={isSupported ? destination!.slug : undefined}
                  className={cn(
                    "stroke-navy-950/50 stroke-[0.5] outline-none transition-colors duration-150",
                    isSupported ? "cursor-pointer fill-navy-600" : "fill-navy-900/60",
                    isSupported && isPreviewed && !isSelected && "fill-gold-300",
                    isSelected && "fill-gold-500"
                  )}
                  onMouseEnter={isSupported ? () => onPreview(destination!.slug) : undefined}
                  onMouseLeave={isSupported ? () => onPreview(null) : undefined}
                  onClick={isSupported ? () => onSelect(destination!.slug) : undefined}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
