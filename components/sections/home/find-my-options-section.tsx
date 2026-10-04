import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { FindMyOptionsWizard } from "@/components/forms/find-my-options-wizard";

export function FindMyOptionsSection() {
  return (
    <section className="bg-surface-muted py-20 md:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <h2 className="text-balance font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-navy-900">
            Not sure where to study?
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted">
            Tell us about yourself. We&rsquo;ll help identify destinations and
            options that fit your profile. Three quick questions and your
            contact details, then a counsellor follows up personally.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="relative">
          <FindMyOptionsWizard />
        </Reveal>
      </Container>
    </section>
  );
}
