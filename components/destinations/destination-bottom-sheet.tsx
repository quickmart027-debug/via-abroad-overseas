"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { Destination } from "@/data/destinations";
import { DestinationPreviewContent } from "@/components/destinations/destination-preview-content";

/** Mobile-only. Opens on destination selection; the map/chip tap that
 *  triggered it regains focus on close via Radix's default behavior. */
export function DestinationBottomSheet({
  destination,
  open,
  onOpenChange,
}: {
  destination: Destination | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-navy-950/60 data-[state=open]:animate-[overlay-in_0.18s_ease-out] data-[state=closed]:animate-[overlay-out_0.15s_ease-in] md:hidden" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[60] max-h-[85vh] overflow-y-auto rounded-t-3xl bg-surface p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl motion-safe:data-[state=open]:animate-[bottom-sheet-in_0.22s_cubic-bezier(0.16,1,0.3,1)] motion-safe:data-[state=closed]:animate-[bottom-sheet-out_0.18s_ease-in] md:hidden">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border-strong" aria-hidden="true" />
          <Dialog.Title className="sr-only">
            {destination ? `${destination.name} overview` : "Destination overview"}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            {destination
              ? `Quick overview of study options in ${destination.name}.`
              : "Quick overview of the selected destination."}
          </Dialog.Description>
          <Dialog.Close className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted">
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
          {destination && <DestinationPreviewContent destination={destination} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
