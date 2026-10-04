"use client";

import * as React from "react";
import Script from "next/script";
import { gaMeasurementId, isAnalyticsConfigured } from "@/lib/config";
import { captureUtmFromLocation } from "@/lib/analytics/utm";

const CONSENT_KEY = "vao_analytics_consent";

type ConsentState = "unknown" | "granted" | "denied";

export function AnalyticsProvider() {
  const [consent, setConsent] = React.useState<ConsentState>("unknown");

  React.useEffect(() => {
    captureUtmFromLocation();
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      if (stored === "granted" || stored === "denied") {
        // One-time sync from localStorage (unavailable during SSR, so this
        // can't be a lazy useState initializer) into React state on mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConsent(stored);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  React.useEffect(() => {
    window.__analyticsConsent = consent === "granted";
    return () => {
      window.__analyticsConsent = false;
    };
  }, [consent]);

  // This provider is mounted only by the (public) layout. If an already-loaded
  // gtag outlives it (client navigation into /admin), GA's opt-out flag stops
  // history-based page views from recording admin URLs, which can carry PII.
  React.useEffect(() => {
    if (!isAnalyticsConfigured) return;
    const optOutFlag = `ga-disable-${gaMeasurementId}`;
    const globals = window as unknown as Record<string, unknown>;
    globals[optOutFlag] = false;
    return () => {
      globals[optOutFlag] = true;
    };
  }, []);

  function decide(next: "granted" | "denied") {
    setConsent(next);
    try {
      window.localStorage.setItem(CONSENT_KEY, next);
    } catch {
      // ignore storage errors
    }
  }

  return (
    <>
      {isAnalyticsConfigured && consent === "granted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}', { anonymize_ip: true });
              window.gtag = gtag;
            `}
          </Script>
        </>
      )}

      {isAnalyticsConfigured && consent === "unknown" && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-border-subtle bg-white/95 backdrop-blur-md px-4 py-4 shadow-[0_-4px_20px_rgba(23,32,42,0.08)] md:px-6"
        >
          <div className="container-outer flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-ink-muted">
              We use privacy-conscious analytics to understand site usage. No
              personal or enquiry information is ever sent to analytics. You
              can decline without affecting your ability to contact us.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="min-h-11 rounded-full border border-border-strong px-4 text-sm font-medium text-ink"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="min-h-11 rounded-full bg-navy-900 px-4 text-sm font-medium text-white"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
