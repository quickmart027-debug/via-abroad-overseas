import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { ConsultationCtaLink } from "@/components/analytics/consultation-cta-link";
import { business, callHref, whatsapp } from "@/lib/config";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-navy-900 py-20 text-white md:py-28">
      <Container className="relative flex flex-col items-center gap-6 text-center">
        <Reveal>
          <Eyebrow light className="justify-center">
            Your Next Chapter Starts Here.
          </Eyebrow>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="text-balance font-display text-[clamp(2rem,4.5vw,3.25rem)] font-semibold">
            Ready to make the move?
          </h2>
        </Reveal>
        <Reveal delay={0.12} className="max-w-xl text-lg text-white/70">
          Let&rsquo;s turn your study abroad ambition into a clear,
          personalised plan.
        </Reveal>
        <Reveal delay={0.18}>
          <ConsultationCtaLink source="home_final_cta" size="lg">
            Book Free Consultation
          </ConsultationCtaLink>
        </Reveal>
        <Reveal delay={0.24} className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-white/70">
          <a href={callHref} className="font-semibold text-white underline-offset-4 hover:underline">
            {business.phoneDisplay}
          </a>
          {whatsapp.isConfigured && (
            <>
              <span aria-hidden="true" className="text-gold-400">&middot;</span>
              <a
                href={whatsapp.href()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white underline-offset-4 hover:underline"
              >
                Chat with a counsellor on WhatsApp
              </a>
            </>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
