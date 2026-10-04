import type { Metadata } from "next";
import { Target, Eye, HeartHandshake, ShieldCheck, Users, Compass } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { ConsultationCtaBanner } from "@/components/sections/consultation-cta-banner";
import { Container } from "@/components/ui/container";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { team } from "@/data/team";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Who we are at VIA ABROAD OVERSEAS, a study abroad consultancy in Nizampet, Hyderabad, and how we work with students and parents.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Your goals first",
    description: "Recommendations start from your marks, budget and plans, not from a standard list.",
    icon: HeartHandshake,
  },
  {
    title: "Straight answers",
    description: "What each step involves, how long it takes, and what is realistic for your profile.",
    icon: ShieldCheck,
  },
  {
    title: "Someone who knows your file",
    description: "A counsellor who understands your profile and your circumstances.",
    icon: Users,
  },
  {
    title: "Countries side by side",
    description: "We compare destinations on cost, course length and work options so you see the trade-offs.",
    icon: Compass,
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About VIA ABROAD OVERSEAS"
        description="A study abroad consultancy in Nizampet, Hyderabad, working with students from the first conversation to the day they fly."
        breadcrumb={[{ label: "About" }]}
      />

      <section className="bg-surface py-20 md:py-28">
        <Container className="max-w-3xl">
          <Reveal>
            <p className="text-lg leading-relaxed text-ink-muted">
              We help students decide where and what to study, shortlist
              universities, prepare applications and visa documents, and think
              through the career the course should lead to.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              Most families come to us with the same questions: which country,
              which course, what will it cost, and will the visa come through.
              Our job is to answer them plainly, with your profile in front of us.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-surface-muted py-20 md:py-28">
        <Container className="grid gap-6 md:grid-cols-2">
          <Reveal className="rounded-2xl border border-border-subtle bg-surface p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/5 text-navy-900">
              <Target className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold text-navy-900">
              Our Mission
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              To give every student accurate information and honest advice, so
              they can build a career abroad on a sound decision.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="rounded-2xl border border-border-subtle bg-surface p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/5 text-navy-900">
              <Eye className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold text-navy-900">
              Our Vision
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              To be the consultancy students and parents trust when they plan
              to study abroad.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-surface py-20 md:py-28">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-navy-900">
              What Guides Our Counselling
            </h2>
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <StaggerItem
                  key={value.title}
                  className="rounded-2xl border border-border-subtle bg-surface-muted p-6"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-200 text-gold-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {value.description}
                  </p>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </Container>
      </section>

      {team.length > 0 && (
        <section className="bg-surface-muted py-20 md:py-28">
          <Container>
          </Container>
        </section>
      )}

      <ConsultationCtaBanner />
    </>
  );
}
