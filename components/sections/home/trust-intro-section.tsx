import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";

export function TrustIntroSection() {
  return (
    <section className="bg-surface-muted py-20 md:py-28">
      <Container className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
        <Reveal>
          <h2 className="text-balance font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-navy-900">
            More than a consultancy.
            <br />
            Your partner abroad.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-muted">
            At VIA ABROAD OVERSEAS, we believe studying abroad is more than
            choosing a university. It&rsquo;s about choosing the right
            destination, course and future — with personalised guidance from
            the first counselling session to the day you fly.
          </p>

          <Link
            href="/about"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-navy-900 underline decoration-gold-500 decoration-1 underline-offset-[6px] transition-colors hover:text-gold-700"
          >
            Discover Via Abroad
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="relative hidden lg:block">
          <div className="relative flex h-full min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-border-subtle bg-gradient-to-br from-navy-900 to-navy-950 p-10 text-center text-white">
            <p className="relative font-display text-2xl italic leading-snug text-white/90">
              &ldquo;Every plan starts with one student: your marks, your
              budget, your goals.&rdquo;
            </p>
            <div className="relative mt-8 h-px w-16 bg-gold-400/50" aria-hidden="true" />
            <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">
              Make The Move
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
