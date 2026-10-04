import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/footer/site-footer";
import { FloatingActions } from "@/components/navigation/floating-actions";
import { MobileActionBar } from "@/components/navigation/mobile-action-bar";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
      {/* Reserve room so the mobile action bar never covers the footer. */}
      <div className="h-[calc(3.5rem+env(safe-area-inset-bottom))] bg-navy-950 md:hidden" aria-hidden="true" />
      <FloatingActions />
      <MobileActionBar />
      {/* GA4 + consent banner live here, not in the root layout, so they never
          load on /admin/* — admin URLs (e.g. ?search=) can carry student PII. */}
      <AnalyticsProvider />
    </div>
  );
}
