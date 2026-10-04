import type { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/forms/contact-form";
import { ContactMap } from "@/components/sections/contact-map";
import { business, addressFull, callHref, emailHref, whatsapp } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with VIA ABROAD OVERSEAS for study abroad counselling, university admissions, and visa assistance.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const whatsappHref = whatsapp.href();

  return (
    <>
      <PageHero
        title="Talk to a counsellor"
        description="Call, email or send an enquiry below, and a counsellor will get back to you."
        breadcrumb={[{ label: "Contact" }]}
      />

      <section className="bg-surface py-20 md:py-28">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-8">
            <Reveal className="rounded-2xl border border-border-subtle bg-surface-muted p-7">
              <h2 className="font-display text-xl font-semibold text-navy-900">
                Get in Touch
              </h2>
              <ul className="mt-5 space-y-4">
                <li>
                  <a href={callHref} className="flex items-start gap-3 text-ink-muted hover:text-navy-900">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                    {business.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={emailHref} className="flex items-start gap-3 text-ink-muted hover:text-navy-900">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                    {business.email}
                  </a>
                </li>
                <li className="flex items-start gap-3 text-ink-muted">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                  {addressFull}
                </li>
                {whatsappHref ? (
                  <li>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 text-ink-muted hover:text-navy-900"
                    >
                      <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                      Chat on WhatsApp
                    </a>
                  </li>
                ) : (
                  <li className="flex items-start gap-3 text-ink-faint" title="WhatsApp will be available once configured">
                    <MessageCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    WhatsApp (coming soon)
                  </li>
                )}
              </ul>
            </Reveal>

            <Reveal delay={0.08}>
              <ContactMap />
            </Reveal>
          </div>

          <Reveal delay={0.05} className="rounded-2xl border border-border-subtle bg-surface-muted p-8">
            <h2 className="font-display text-xl font-semibold text-navy-900">
              Submit an Enquiry
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Tell us about your goals and a counsellor will get back to you.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
