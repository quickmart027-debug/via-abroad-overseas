import { business, siteUrl } from "@/lib/config";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: business.name,
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    description:
      "Study abroad and overseas education consultancy offering counselling, university admissions, visa assistance, and career guidance.",
    telephone: business.phoneE164,
    email: business.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${business.address.line1}, ${business.address.line2}`,
      addressLocality: business.address.locality,
      addressRegion: business.address.city,
      postalCode: business.address.postalCode,
      addressCountry: business.address.countryCode,
    },
    areaServed: "IN",
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so no string value can close the <script> element early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
