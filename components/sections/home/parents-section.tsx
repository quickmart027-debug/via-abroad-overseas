import { Wallet, GraduationCap, FileCheck2, Briefcase } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { ConsultationCtaLink } from "@/components/analytics/consultation-cta-link";

const questions = [
  {
    icon: Wallet,
    title: "What will the total investment be?",
    description: "A clear, honest conversation about tuition, living costs, and planning ahead.",
  },
  {
    icon: GraduationCap,
    title: "Which university is right?",
    description: "Matched to your child's profile, goals, and budget — not a generic ranking.",
  },
  {
    icon: FileCheck2,
    title: "How does the visa process work?",
    description: "Documentation and preparation explained clearly, step by step.",
  },
  {
    icon: Briefcase,
    title: "What are the career opportunities?",
    description: "Course choices connected to real, long-term career direction.",
  },
];

export function ParentsSection() {
  return (
    <section className="bg-surface-muted py-20 md:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-navy-900">
            For students. For parents.
            <br />
            For the future.
          </h2>
          <p className="mt-4 text-ink-muted">
            Choosing to study abroad is a major decision — and we believe
            students and parents deserve clarity at every step.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {questions.map((question, index) => {
            const Icon = question.icon;
            return (
              <Reveal
                key={question.title}
                delay={index * 0.07}
                className="flex gap-4 rounded-2xl border border-border-subtle bg-surface p-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900/5 text-navy-900">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-navy-900">{question.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    {question.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1} className="mt-12 flex justify-center">
          <ConsultationCtaLink source="home_parents" size="lg">
            Book Free Consultation
          </ConsultationCtaLink>
        </Reveal>
      </Container>
    </section>
  );
}
