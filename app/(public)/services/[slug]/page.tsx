import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowUpRight, Compass, GraduationCap, FileCheck2, Briefcase, FileText, Award } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { ConsultationCtaBanner } from "@/components/sections/consultation-cta-banner";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { FaqJsonLd } from "@/components/seo/faq-jsonld";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { services, getServiceBySlug, type Service } from "@/data/services";

const iconMap: Record<Service["icon"], typeof Compass> = {
  Compass,
  GraduationCap,
  FileCheck2,
  Briefcase,
  FileText,
  Award,
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.heroDescription,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const Icon = iconMap[service.icon];
  const related = services.filter((s) => service.relatedSlugs.includes(s.slug));

  return (
    <>
      <BreadcrumbJsonLd
        items={[{ label: "Services", href: "/services" }, { label: service.title, href: `/services/${service.slug}` }]}
      />
      <FaqJsonLd faq={service.faq} />
      <PageViewTracker event="service_viewed" slug={service.slug} />
      <PageHero
        title={service.title}
        description={service.heroDescription}
        breadcrumb={[{ label: "Services", href: "/services" }, { label: service.title }]}
      />

      <section className="bg-surface py-20 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900/5 text-navy-900">
              <Icon className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-6 font-display text-2xl font-semibold text-navy-900">
              The Challenge
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">{service.problem}</p>

            <h2 className="mt-10 font-display text-2xl font-semibold text-navy-900">
              Who This Is For
            </h2>
            <ul className="mt-4 space-y-3">
              {service.whoFor.map((item) => (
                <li key={item} className="flex gap-3 text-ink-muted">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="space-y-10">
            <Reveal className="rounded-2xl border border-border-subtle bg-surface-muted p-8">
              <h2 className="font-display text-2xl font-semibold text-navy-900">
                What&rsquo;s Included
              </h2>
              <ul className="mt-4 space-y-3">
                {service.includes.map((item) => (
                  <li key={item} className="flex gap-3 text-ink-muted">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.08} className="rounded-2xl border border-border-subtle bg-surface-muted p-8">
              <h2 className="font-display text-2xl font-semibold text-navy-900">
                Our Process
              </h2>
              <ol className="mt-4 space-y-4">
                {service.process.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-ink-muted">{step}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-surface-muted py-20 md:py-28">
        <Container className="max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-navy-900">
              Frequently Asked Questions
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            <Accordion type="single" collapsible className="mt-6">
              {service.faq.map((item) => (
                <AccordionItem key={item.question} value={item.question}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="bg-surface py-20 md:py-28">
          <Container>
            <Reveal>
              <h2 className="font-display text-2xl font-semibold text-navy-900">
                Related Services
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {related.map((item, index) => (
                <Reveal
                  key={item.slug}
                  delay={index * 0.06}
                  className="rounded-2xl border border-border-subtle bg-surface-muted p-6"
                >
                  <Link href={`/services/${item.slug}`} className="group">
                    <h3 className="font-display text-lg font-semibold text-navy-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-ink-muted">{item.shortDescription}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700">
                      Learn more
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <ConsultationCtaBanner
        title={`Ready to Get Started with ${service.title}?`}
        description="Book a free consultation and take the first step today."
      />
    </>
  );
}
