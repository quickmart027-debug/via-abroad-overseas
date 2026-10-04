import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CheckCircle2, TriangleAlert } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { ConsultationCtaBanner } from "@/components/sections/consultation-cta-banner";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { destinations, getDestinationBySlug, destinationNameInSentence } from "@/data/destinations";
import { services } from "@/data/services";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";

export function generateStaticParams() {
  return destinations.map((destination) => ({ slug: destination.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) return {};
  return {
    title: `Study in ${destinationNameInSentence(destination)}`,
    description: destination.overview,
    alternates: { canonical: `/destinations/${destination.slug}` },
  };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) notFound();

  const relatedServices = services.filter((s) =>
    destination.relatedServiceSlugs.includes(s.slug)
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[{ label: "Destinations", href: "/destinations" }, { label: destination.name, href: `/destinations/${destination.slug}` }]}
      />
      <PageViewTracker event="destination_viewed" slug={destination.slug} />
      <PageHero
        title={`Study in ${destinationNameInSentence(destination)}`}
        description={destination.tagline}
        breadcrumb={[{ label: "Destinations", href: "/destinations" }, { label: destination.name }]}
        backgroundImageSrc={destination.imageSrc}
        backgroundImageAlt={destination.imageAlt}
        backgroundImageObjectPosition={destination.imageObjectPosition}
      />

      <section className="bg-surface py-20 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-navy-900">
              Overview
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">{destination.overview}</p>

            <h2 className="mt-10 font-display text-2xl font-semibold text-navy-900">
              What Makes It Popular
            </h2>
            <ul className="mt-4 space-y-3">
              {destination.highlights.map((item) => (
                <li key={item} className="flex gap-3 text-ink-muted">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="space-y-8">
            <Reveal className="rounded-2xl border border-border-subtle bg-surface-muted p-8">
              <h2 className="font-display text-xl font-semibold text-navy-900">
                Popular Study Areas
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {destination.popularAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-navy-900/5 px-3.5 py-1.5 text-sm text-navy-900"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </Reveal>

            {relatedServices.length > 0 && (
              <Reveal delay={0.06} className="rounded-2xl border border-border-subtle bg-surface-muted p-8">
                <h2 className="font-display text-xl font-semibold text-navy-900">
                  Relevant Services
                </h2>
                <ul className="mt-4 space-y-3">
                  {relatedServices.map((service) => (
                    <li key={service.slug}>
                      <Link
                        href={`/services/${service.slug}`}
                        className="group flex items-center justify-between text-ink-muted hover:text-navy-900"
                      >
                        {service.title}
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </Container>

        <Container className="mt-14">
          <Reveal className="flex gap-4 rounded-2xl border border-warning-bg bg-warning-bg/60 p-6">
            <TriangleAlert className="h-6 w-6 shrink-0 text-warning" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-ink-muted">
              Visa policies, tuition costs, and admission requirements can
              change and vary by university and program. The information on
              this page is general in nature — please consult official
              government sources and your counsellor for current,
              individualised guidance.
            </p>
          </Reveal>
        </Container>
      </section>

      <ConsultationCtaBanner
        title={`Ready to Explore ${destination.name}?`}
        description="Book a free consultation to discuss your options in detail."
      />
    </>
  );
}
