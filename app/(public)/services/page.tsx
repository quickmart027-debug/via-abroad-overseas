import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass, GraduationCap, FileCheck2, Briefcase, FileText, Award } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { ConsultationCtaBanner } from "@/components/sections/consultation-cta-banner";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { services, type Service } from "@/data/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore VIA ABROAD OVERSEAS services: study abroad counselling, university admissions, visa assistance, career counselling, application support, and scholarship guidance.",
  alternates: { canonical: "/services" },
};

const iconMap: Record<Service["icon"], typeof Compass> = {
  Compass,
  GraduationCap,
  FileCheck2,
  Briefcase,
  FileText,
  Award,
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="From dream to departure."
        description="Six services, from the first consultation to pre-departure. Use one or all of them; your counsellor will suggest which you actually need."
        breadcrumb={[{ label: "Services" }]}
      />

      <section className="bg-surface py-20 md:py-28">
        <Container className="grid gap-6 md:grid-cols-2">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon];
            return (
              <Reveal key={service.slug} delay={(index % 2) * 0.08}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border-subtle bg-surface-muted p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-[0_20px_40px_-16px_rgba(13,34,56,0.15)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/5 text-navy-900">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 font-display text-2xl font-semibold text-navy-900">
                    {service.title}
                  </h2>
                  <p className="mt-3 text-ink-muted">{service.shortDescription}</p>
                  <ul className="mt-5 space-y-2 text-sm text-ink-muted">
                    {service.includes.slice(0, 2).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700">
                    Explore {service.title}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </Container>
      </section>

      <ConsultationCtaBanner />
    </>
  );
}
