import type { Destination } from "@/data/destinations";
import { cn } from "@/lib/utils";
import { DestinationPreviewContent } from "@/components/destinations/destination-preview-content";

/** Desktop-only persistent panel beside the map. Hidden on mobile, where
 *  the bottom sheet carries this same content instead. */
export function DestinationPreviewPanel({
  destination,
  className,
}: {
  destination: Destination | null;
  className?: string;
}) {
  return (
    <div
      data-testid="destination-preview-panel"
      className={cn(
        "rounded-2xl border border-border-subtle bg-surface p-6",
        className
      )}
    >
      {destination ? (
        <DestinationPreviewContent destination={destination} />
      ) : (
        <p className="text-sm leading-relaxed text-ink-muted">
          Hover or select a country on the map to preview it here.
        </p>
      )}
    </div>
  );
}
