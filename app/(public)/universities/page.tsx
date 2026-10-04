import type { Metadata } from "next";
import { Compass, GraduationCap, MessageSquareText } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { ConsultationCtaBanner } from "@/components/sections/consultation-cta-banner";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Find Your University",
  description:
    "VIA ABROAD OVERSEAS helps you shortlist universities and institutions based on your academic profile, goals, budget, and preferred destination.",
  alternates: { canonical: "/universities" },
};

const points = [
  {
    icon: Compass,
    title: "Matched to your profile",
    description:
      "Your marks, test scores, budget and preferred countries decide the shortlist, not rankings alone.",
  },
  {
    icon: GraduationCap,
    title: "Compared across countries",
    description:
      "See a UK, German or Canadian option side by side on cost, course length and entry requirements.",
  },
  {
    icon: MessageSquareText,
    title: "Honest about fit",
    description:
      "If a university is out of reach or out of budget, we will say so and suggest what to change.",
  },
];

export default function UniversitiesPage() {
  return (
    <>
      <PageHero
        title="Universities that fit you"
        description="Explore universities and institutions that match your ambitions, shortlisted around your profile and budget."
        breadcrumb={[{ label: "Universities" }]}
      />

      <section className="bg-surface py-20 md:py-28">
        <Container>
          <div className="grid gap-6 sm:grid-cols-3">
            {points.map((point, index) => {
              const Icon = point.icon;
              return (
                <Reveal
                  key={point.title}
                  delay={index * 0.08}
                  className="rounded-2xl border border-border-subtle bg-surface-muted p-7"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900/5 text-navy-900">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 font-display text-lg font-semibold text-navy-900">
                    {point.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {point.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <ConsultationCtaBanner
        title="Get your university shortlist"
        description="Share your marks, budget and preferred countries, and a counsellor will build your first shortlist with you."
        source="universities_page"
      />
    </>
  );
}
