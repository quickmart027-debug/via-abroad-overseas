"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, CalendarCheck } from "lucide-react";
import { whatsapp, callHref } from "@/lib/config";
import { trackEvent } from "@/lib/analytics/events";
import { WhatsAppIcon } from "@/components/ui/social-icons";
import { cn } from "@/lib/utils";

/**
 * Brief §20 mobile bottom bar: CALL | WHATSAPP | CONSULT, within thumb
 * reach on every public page. WhatsApp drops out (rather than rendering a
 * dead link) until NEXT_PUBLIC_WHATSAPP_NUMBER is configured. Desktop keeps
 * the floating actions instead.
 */
export function MobileActionBar() {
  const whatsappHref = whatsapp.href();
  const onBookingPage = usePathname() === "/book-consultation";

  const item =
    "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] transition-colors";

  return (
    <nav
      aria-label="Quick contact"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy-950/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">
        <a
          href={callHref}
          onClick={() =>
            trackEvent("call_clicked", { source: "mobile_action_bar" })
          }
          className={cn(item, "text-white/85 active:bg-white/5")}
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          Call
        </a>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("whatsapp_clicked", { source: "mobile_action_bar" })
            }
            className={cn(
              item,
              "border-l border-white/10 text-white/85 active:bg-white/5",
            )}
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>
        )}
        {!onBookingPage && (
          <Link
            href="/book-consultation"
            onClick={() =>
              trackEvent("consultation_cta_clicked", {
                source: "mobile_action_bar",
              })
            }
            className={cn(item, "bg-gold-500 text-navy-950 active:bg-gold-400")}
          >
            <CalendarCheck className="h-5 w-5" aria-hidden="true" />
            Free Consult
          </Link>
        )}
      </div>
    </nav>
  );
}
