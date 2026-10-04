import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export function PageHero({
  title,
  description,
  breadcrumb,
  backgroundImageSrc,
  backgroundImageAlt,
  backgroundImageObjectPosition,
}: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  backgroundImageSrc?: string;
  backgroundImageAlt?: string;
  backgroundImageObjectPosition?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-navy-950 pb-16 pt-32 text-white md:pb-20 md:pt-40",
        backgroundImageSrc && "flex min-h-[72svh] items-end lg:min-h-[64svh]"
      )}
    >
      {backgroundImageSrc ? (
        <>
          <Image
            src={backgroundImageSrc}
            alt={backgroundImageAlt ?? ""}
            fill
            priority
            sizes="100vw"
            style={{ objectPosition: backgroundImageObjectPosition ?? "center" }}
            className="hero-settle object-cover"
          />
          {/* Same treatment as the homepage hero: copy sits on solid navy at
              the bottom (phones) or left (desktop); the photograph stays open. */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950 from-20% via-navy-950/70 via-50% to-navy-950/20 lg:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-navy-950 from-20% via-navy-950/70 via-45% to-navy-950/0 to-80% lg:block"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-navy-950/70 to-transparent"
            aria-hidden="true"
          />
        </>
      ) : (
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_10%_85%,rgba(53,97,159,0.28),transparent)]"
          aria-hidden="true"
        />
      )}
      <Container className="relative w-full">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-white/50">
            <Link href="/" className="hover:text-white/80">
              Home
            </Link>
            {breadcrumb.map((crumb) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-white/80">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-white/80">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="max-w-3xl text-balance font-display text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.1]">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-balance text-lg text-white/70">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
