import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { ConsultationCtaLink } from "@/components/analytics/consultation-cta-link";

export function ConsultationCtaBanner({
  title = "Not sure what to do next?",
  description = "Book a free consultation. We will look at your profile and tell you where you stand.",
  source = "consultation_cta_banner",
}: {
  title?: string;
  description?: string;
  source?: string;
}) {
  return (
    <section className="bg-navy-950 py-16 text-white md:py-20">
      <Container className="flex flex-col items-center gap-6 text-center">
        <Reveal>
          <h2 className="text-balance font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold">
            {title}
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="max-w-xl text-white/70">
          {description}
        </Reveal>
        <Reveal delay={0.14}>
          <ConsultationCtaLink source={source} size="lg">
            Book Free Consultation
          </ConsultationCtaLink>
        </Reveal>
      </Container>
    </section>
  );
}
