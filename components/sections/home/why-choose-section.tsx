import {
  UserRound,
  GraduationCap,
  FileCheck2,
  ShieldCheck,
  Target,
  Infinity as InfinityIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { ConsultationCtaLink } from "@/components/analytics/consultation-cta-link";

const benefits = [
  {
    number: "01",
    title: "Profile First",
    icon: UserRound,
    description: "We look at your marks, budget and goals before naming a single university.",
  },
  {
    number: "02",
    title: "The Right University",
    icon: GraduationCap,
    description: "Options compared on genuine fit, not just rankings.",
  },
  {
    number: "03",
    title: "Complete Application Support",
    icon: FileCheck2,
    description: "Guided documentation and review at every submission.",
  },
  {
    number: "04",
    title: "Visa Confidence",
    icon: ShieldCheck,
    description: "Structured preparation and interview readiness.",
  },
  {
    number: "05",
    title: "Career-Focused",
    icon: Target,
    description: "Course choices connected to your long-term direction.",
  },
  {
    number: "06",
    title: "Beyond the Visa",
    icon: InfinityIcon,
    description: "Pre-departure guidance so you arrive prepared.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="bg-surface py-20 md:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-navy-900">
            Why students choose Via Abroad
          </h2>
          <p className="mt-4 text-ink-muted">
            Because your journey deserves more than a generic shortlist.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Reveal
                key={benefit.title}
                delay={(index % 3) * 0.08}
                className="rounded-2xl border border-border-subtle bg-surface-muted p-7"
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-3xl font-semibold text-gold-700">
                    {benefit.number}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900/5 text-navy-900">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-navy-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {benefit.description}
                </p>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <ConsultationCtaLink source="home_why" size="lg" variant="outlineNavy">
            Talk to a Counsellor
          </ConsultationCtaLink>
        </Reveal>
      </Container>
    </section>
  );
}
