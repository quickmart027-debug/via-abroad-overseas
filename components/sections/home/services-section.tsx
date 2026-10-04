import Link from "next/link";
import { ArrowUpRight, Compass, GraduationCap, FileCheck2, Briefcase, FileText, Award } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { services, type Service } from "@/data/services";
import { cn } from "@/lib/utils";

const iconMap: Record<Service["icon"], typeof Compass> = {
  Compass,
  GraduationCap,
  FileCheck2,
  Briefcase,
  FileText,
  Award,
};

export function ServicesSection() {
  return (
    <section className="bg-surface py-20 md:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <h2 className="max-w-xl text-balance font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-navy-900">
              From dream to departure.
            </h2>
            <p className="mt-4 max-w-lg text-ink-muted">
              Complete support for your international education journey.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:text-gold-600"
            >
              View all services
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon];
            const featured = index === 0;
            return (
              <Reveal
                key={service.slug}
                delay={(index % 3) * 0.08}
              >
                <Link
                  href={`/services/${service.slug}`}
                  className={cn(
                    "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-7 transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(13,34,56,0.18)] focus-visible:-translate-y-1",
                    featured
                      ? "border-navy-800 bg-navy-900 text-white hover:border-gold-500/60"
                      : "border-border-subtle bg-surface hover:border-gold-300"
                  )}
                >
                  <div>
                    <span
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        featured ? "bg-white/10 text-gold-300" : "bg-navy-900/5 text-navy-900"
                      )}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3
                      className={cn(
                        "mt-5 font-display font-semibold",
                        featured ? "text-xl text-white" : "text-xl text-navy-900"
                      )}
                    >
                      {service.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-2.5 leading-relaxed",
                        featured ? "text-sm text-white/75" : "text-sm text-ink-muted"
                      )}
                    >
                      {service.shortDescription}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "mt-6 inline-flex items-center gap-1.5 text-sm font-semibold",
                      featured ? "text-gold-300" : "text-gold-700"
                    )}
                  >
                    Learn more
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
