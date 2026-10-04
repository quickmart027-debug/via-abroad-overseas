"use client";

import * as React from "react";
import type { Destination } from "@/data/destinations";
import { DestinationMap } from "@/components/destinations/destination-map";
import { DestinationChipRail } from "@/components/destinations/destination-chip-rail";
import { DestinationPreviewPanel } from "@/components/destinations/destination-preview-panel";
import { DestinationBottomSheet } from "@/components/destinations/destination-bottom-sheet";

/** True at md (768px) and up. Defaults to false (mobile-safe) until the
 *  media query resolves on mount, so the bottom sheet never opens on
 *  desktop during hydration. */
function useIsDesktopViewport() {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

/**
 * Interactive destination explorer: map + chip rail stay in sync through
 * lifted selection/preview state; desktop gets a persistent side panel,
 * mobile gets a bottom sheet on selection. Local state only — no URL
 * param — and the data/destinations.ts content is never duplicated, only
 * passed through to the shared preview content component.
 */
export function DestinationSelector({ destinations }: { destinations: Destination[] }) {
  const [selectedSlug, setSelectedSlug] = React.useState<string | null>(null);
  const [previewSlug, setPreviewSlug] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const isDesktop = useIsDesktopViewport();

  const handleSelect = React.useCallback(
    (slug: string) => {
      setSelectedSlug(slug);
      if (!isDesktop) setSheetOpen(true);
    },
    [isDesktop]
  );

  const selectedDestination = destinations.find((d) => d.slug === selectedSlug) ?? null;
  const previewDestination = destinations.find((d) => d.slug === previewSlug) ?? null;
  const panelDestination = previewDestination ?? selectedDestination;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
      <div className="flex min-w-0 flex-col gap-6 md:flex-1">
        <DestinationMap
          destinations={destinations}
          selectedSlug={selectedSlug}
          previewSlug={previewSlug}
          onPreview={setPreviewSlug}
          onSelect={handleSelect}
        />
        <DestinationChipRail
          destinations={destinations}
          selectedSlug={selectedSlug}
          onPreview={setPreviewSlug}
          onSelect={handleSelect}
        />
      </div>

      <DestinationPreviewPanel
        destination={panelDestination}
        className="hidden md:block md:w-[22rem] md:shrink-0"
      />

      <DestinationBottomSheet
        destination={selectedDestination}
        open={sheetOpen && !isDesktop}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
