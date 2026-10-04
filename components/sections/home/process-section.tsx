import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { ConsultationCtaLink } from "@/components/analytics/consultation-cta-link";

const steps = [
  {
    title: "Free Consultation",
    description: "Share your goals and background in an initial, no-cost session.",
  },
  {
    title: "Profile Evaluation",
    description: "A detailed review of your academics, budget, and preferences.",
  },
  {
    title: "Course & University",
    description: "A shortlist built around your goals, not generic rankings.",
  },
  {
    title: "Application",
    description: "Guided, reviewed applications submitted on schedule.",
  },
  {
    title: "Admission",
    description: "Support responding to offers and university communication.",
  },
  {
    title: "Visa",
    description: "Documentation guidance and interview preparation.",
  },
  {
    title: "Pre-Departure",
    description: "Practical guidance to prepare before you travel.",
  },
  {
    title: "Make The Move",
    description: "Begin your international education with confidence.",
  },
];

const rows = [steps.slice(0, 4), steps.slice(4, 8)];

export function ProcessSection() {
  return (
    <section className="bg-surface-muted py-20 md:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-navy-900">
            Your journey. Our guidance.
          </h2>
        </Reveal>

        {/* Desktop: horizontal timeline, two rows of four */}
        <div className="mt-16 hidden flex-col gap-14 lg:flex">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative grid grid-cols-4 gap-6">
              <div
                className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-border-strong"
                aria-hidden="true"
              />
              {row.map((step, index) => {
                const globalIndex = rowIndex * 4 + index;
                return (
                  <Reveal
                    key={step.title}
                    delay={globalIndex * 0.05}
                    className="flex flex-col items-center text-center"
                  >
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold-500 bg-surface-muted font-display text-sm font-bold text-navy-900">
                      {globalIndex + 1}
                    </span>
                    <h3 className="mt-4 font-display text-base font-semibold text-navy-900">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                      {step.description}
                    </p>
                  </Reveal>
                );
              })}
            </div>
          ))}
        </div>

        {/* Mobile / tablet: vertical timeline */}
        <ol className="relative mx-auto mt-14 max-w-md lg:hidden">
          <div
            className="absolute left-5 top-2 bottom-2 w-px bg-border-strong"
            aria-hidden="true"
          />
          {steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              delay={index * 0.05}
              className="relative mb-8 flex items-start gap-5 last:mb-0"
            >
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold-500 bg-surface font-display text-sm font-bold text-navy-900">
                {index + 1}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-navy-900">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-14 flex flex-col items-center gap-3 text-center">
          <ConsultationCtaLink
            source="home_process"
            size="lg"
            className="max-w-full max-sm:h-auto max-sm:whitespace-normal max-sm:py-3 max-sm:text-center"
          >
            Start with Step 1: Free Consultation
          </ConsultationCtaLink>
        </Reveal>
      </Container>
    </section>
  );
}
