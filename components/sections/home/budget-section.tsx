import { Plus, Equal, GraduationCap, Home, FileCheck2, Plane } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { ConsultationCtaLink } from "@/components/analytics/consultation-cta-link";

/**
 * Brief §14 — Plan your study abroad budget.
 *
 * Deliberately carries NO figures: costs vary by country, university,
 * course and city and change every intake, and the content rules forbid
 * unverified numbers. The section explains what makes up the total and
 * routes to a personalised estimate. If the owner later supplies vetted
 * ranges, they belong in a data file, not hard-coded here.
 *
 * Rendered only when NEXT_PUBLIC_SHOW_BUDGET_SECTION === "true"
 * (see app/(public)/page.tsx).
 */
const costs = [
  {
    icon: GraduationCap,
    title: "Tuition",
    description: "Set by the university and course level — the widest-varying part of the total.",
  },
  {
    icon: Home,
    title: "Living expenses",
    description: "Accommodation, food, transport and insurance, shaped largely by the city.",
  },
  {
    icon: FileCheck2,
    title: "Visa & application",
    description: "Application and visa fees, plus any mandatory charges for your destination.",
  },
  {
    icon: Plane,
    title: "Travel & pre-departure",
    description: "Flights, deposits and the essentials to settle in during your first weeks.",
  },
];

export function BudgetSection() {
  return (
    <section aria-labelledby="budget-heading" className="bg-navy-900 py-20 text-white md:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <h2
            id="budget-heading"
            className="text-balance font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold"
          >
            Plan your study abroad budget.
          </h2>
          <p className="mt-4 text-lg text-white/75">
            Understand the major costs before you make your move.
          </p>
        </Reveal>

        {/* The equation: four terms, then the sum. Operators are structure,
            so they collapse into the vertical rhythm on small screens. */}
        <ol className="mt-14 grid gap-y-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.25fr)] lg:gap-x-0">
          {costs.map((cost, index) => {
            const Icon = cost.icon;
            return (
              <Reveal
                as="li"
                key={cost.title}
                delay={index * 0.05}
                className="relative flex items-start gap-4 border-t border-white/15 py-6 lg:flex-col lg:gap-0 lg:border-t-0 lg:border-l lg:px-6 lg:py-2 lg:first:border-l-0 lg:first:pl-0"
              >
                <Icon className="h-6 w-6 shrink-0 text-gold-400 lg:mb-5" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-xl">{cost.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{cost.description}</p>
                </div>
                <span
                  className="absolute -bottom-3 left-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-gold-400 lg:-right-3 lg:bottom-auto lg:left-auto lg:top-1"
                  aria-hidden="true"
                >
                  {index < costs.length - 1 ? (
                    <Plus className="h-4 w-4" />
                  ) : (
                    <Equal className="h-4 w-4" />
                  )}
                </span>
              </Reveal>
            );
          })}

          <Reveal
            as="li"
            delay={0.2}
            className="mt-6 flex flex-col justify-between rounded-2xl border border-gold-500/50 bg-navy-950 p-7 lg:mt-0 lg:ml-6"
          >
            <div>
              <h3 className="font-display text-2xl text-gold-300">Your estimated investment</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Built from your actual shortlist — real fees, your city, your
                intake — in a free session with a counsellor.
              </p>
            </div>
            <ConsultationCtaLink source="home_budget" className="mt-7 w-full sm:w-auto">
              Get My Personalised Estimate
            </ConsultationCtaLink>
          </Reveal>
        </ol>

        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-white/60">
          Costs differ by country, university, course and city, and change
          every intake. We walk through current published figures for your
          specific options rather than quoting averages.
        </p>
      </Container>
    </section>
  );
}
