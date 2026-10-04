"use client";

import * as React from "react";
import Link from "next/link";
import { Phone, CalendarCheck } from "lucide-react";
import { whatsapp, callHref } from "@/lib/config";
import { trackEvent } from "@/lib/analytics/events";
import { WhatsAppIcon } from "@/components/ui/social-icons";

/**
 * Tasteful floating contact actions (tablet and desktop — phones get the
 * MobileActionBar instead).
 * Positioned above safe-area / mobile viewport chrome, single subtle
 * entrance animation (no continuous pulsing per spec), and hidden
 * entirely when WhatsApp is not configured rather than rendering a
 * dead link.
 */
export function FloatingActions() {
  const href = whatsapp.href();

  return (
    <div
      className="fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-3 md:flex"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <a
        href={callHref}
        style={{ animationDelay: "600ms" }}
        onClick={() => trackEvent("call_clicked", { source: "floating_action" })}
        aria-label="Call VIA ABROAD OVERSEAS"
        className="pop-in flex h-13 w-13 items-center justify-center rounded-full bg-navy-900 text-white shadow-lg ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-700 focus-visible:ring-offset-2"
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
      </a>

      <Link
        href="/book-consultation"
        style={{ animationDelay: "450ms" }}
        onClick={() => trackEvent("consultation_cta_clicked", { source: "floating_action" })}
        aria-label="Book a free consultation with VIA ABROAD OVERSEAS"
        className="pop-in flex h-13 w-13 items-center justify-center rounded-full bg-gold-500 text-navy-950 shadow-lg ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-700 focus-visible:ring-offset-2"
      >
        <CalendarCheck className="h-5 w-5" aria-hidden="true" />
      </Link>

      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ animationDelay: "350ms" }}
          onClick={() => trackEvent("whatsapp_clicked", { source: "floating_action" })}
          aria-label="Chat with VIA ABROAD OVERSEAS on WhatsApp"
          className="pop-in flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-700 focus-visible:ring-offset-2"
        >
          <WhatsAppIcon className="h-6 w-6" />
        </a>
      )}
    </div>
  );
}
