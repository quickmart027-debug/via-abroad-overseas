import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { business, addressFull, callHref, emailHref, social } from "@/lib/config";
import { footerCompanyLinks, legalLinks } from "@/data/navigation";
import { getFeaturedDestinations } from "@/data/destinations";
import { services } from "@/data/services";
import {
  InstagramIcon,
  FacebookIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "@/components/ui/social-icons";

const socialIcons = [
  { key: "instagram", Icon: InstagramIcon, label: "Instagram", ...social.instagram },
  { key: "facebook", Icon: FacebookIcon, label: "Facebook", ...social.facebook },
  { key: "linkedin", Icon: LinkedinIcon, label: "LinkedIn", ...social.linkedin },
  { key: "youtube", Icon: YoutubeIcon, label: "YouTube", ...social.youtube },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  const activeSocials = socialIcons.filter((s) => s.isConfigured);
  const featuredDestinations = getFeaturedDestinations();

  return (
    <footer className="bg-navy-950 text-white/80">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        <div className="md:col-span-2 lg:col-span-1">
          <p className="font-display text-xl font-semibold text-white">
            VIA ABROAD <span className="text-gold-400">OVERSEAS</span>
          </p>
          <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold-300/70">
            Make The Move
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Your trusted partner for international education.
          </p>
          {activeSocials.length > 0 && (
            <div className="mt-6 flex gap-3">
              {activeSocials.map(({ key, Icon, label, url }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold-400 hover:text-gold-400"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
            Destinations
          </h2>
          <ul className="mt-3 text-sm md:mt-4 md:space-y-3">
            {featuredDestinations.map((destination) => (
              <li key={destination.slug}>
                <Link
                  href={`/destinations/${destination.slug}`}
                  className="flex min-h-11 items-center text-white/70 hover:text-white md:inline md:min-h-0"
                >
                  {destination.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
            Services
          </h2>
          <ul className="mt-3 text-sm md:mt-4 md:space-y-3">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="flex min-h-11 items-center text-white/70 hover:text-white md:inline md:min-h-0"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
            Company
          </h2>
          <ul className="mt-3 text-sm md:mt-4 md:space-y-3">
            {footerCompanyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="flex min-h-11 items-center text-white/70 hover:text-white md:inline md:min-h-0">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
            Contact
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-white/70 md:mt-4 md:space-y-3">
            <li>
              <a href={callHref} className="flex min-h-11 items-center gap-2 hover:text-white md:min-h-0 md:items-start">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {business.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={emailHref} className="flex min-h-11 items-center gap-2 break-all hover:text-white md:min-h-0 md:items-start">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {business.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{addressFull}</span>
            </li>
            <li className="pt-2">
              <Link
                href="/book-consultation"
                className="inline-flex items-center rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
              >
                Book Free Consultation
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/50 md:flex-row">
          <p>
            &copy; {year} {business.name}. All rights reserved.
          </p>
          <div className="flex gap-5">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center hover:text-white/80 md:min-h-0">
                {link.label}
              </Link>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}
