import { siteUrl } from "@/lib/config";

export function BreadcrumbJsonLd({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: item.href ? `${siteUrl}${item.href}` : undefined,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so no string value can close the <script> element early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
