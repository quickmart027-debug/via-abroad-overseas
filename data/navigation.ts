export type NavLink = {
  label: string;
  href: string;
};

export const primaryNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Destinations", href: "/destinations" },
  { label: "Universities", href: "/universities" },
  { label: "Contact", href: "/contact" },
];

export const primaryCta: NavLink = {
  label: "Book Free Consultation",
  href: "/book-consultation",
};

export const secondaryCta: NavLink = {
  label: "Explore Destinations",
  href: "/destinations",
};

export const footerCompanyLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Universities", href: "/universities" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Contact", href: "/contact" },
];

export const legalLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms and Conditions", href: "/terms" },
];
