import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/home/hero-section";
import { TrustStripSection } from "@/components/sections/home/trust-strip-section";
import { TrustIntroSection } from "@/components/sections/home/trust-intro-section";
import { WhyChooseSection } from "@/components/sections/home/why-choose-section";
import { DestinationsSection } from "@/components/sections/home/destinations-section";
import { FindMyOptionsSection } from "@/components/sections/home/find-my-options-section";
import { ServicesSection } from "@/components/sections/home/services-section";
import { ProcessSection } from "@/components/sections/home/process-section";
import { UniversitiesTeaserSection } from "@/components/sections/home/universities-teaser-section";
import { ParentsSection } from "@/components/sections/home/parents-section";
import { BudgetSection } from "@/components/sections/home/budget-section";
import { FaqSection } from "@/components/sections/home/faq-section";
import { FinalCtaSection } from "@/components/sections/home/final-cta-section";

export const metadata: Metadata = {
  title: "Study Abroad & Overseas Education Consultancy",
  description:
    "Study abroad consultancy in Nizampet, Hyderabad. Help choosing a country, course and university, with applications, visas and career planning. First consultation free.",
  alternates: { canonical: "/" },
};

/**
 * Budget / cost section (brief §14) is built but held back until the
 * client signs off. Set NEXT_PUBLIC_SHOW_BUDGET_SECTION=true in Vercel and
 * redeploy to show it between the Parents section and the FAQ.
 */
const showBudgetSection = process.env.NEXT_PUBLIC_SHOW_BUDGET_SECTION === "true";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStripSection />
      <TrustIntroSection />
      <WhyChooseSection />
      <DestinationsSection />
      <FindMyOptionsSection />
      <ServicesSection />
      <ProcessSection />
      <UniversitiesTeaserSection />
      {/* Success Stories and Video Testimonials: OWNER CONTENT REQUIRED —
          no verified testimonials or genuine videos exist yet (see
          data/testimonials.ts), so both are omitted from the homepage
          rather than shown with placeholder/"coming soon" content. The
          dedicated /success-stories page remains live and truthful. */}
      <ParentsSection />
      {showBudgetSection && <BudgetSection />}
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
