export type Destination = {
  name: string;
  slug: string;
  countryCode: string;
  flag: string;
  tagline: string;
  overview: string;
  popularAreas: string[];
  highlights: string[];
  relatedServiceSlugs: string[];
  /** Only set for destinations with real photography (public/destinations/). */
  imageSrc?: string;
  imageAlt?: string;
  /** CSS object-position value, e.g. "60% 80%". Defaults to "center" when unset. */
  imageObjectPosition?: string;
};

export const destinations: Destination[] = [
  {
    name: "United States",
    slug: "usa",
    countryCode: "US",
    flag: "🇺🇸",
    tagline: "Every kind of university, with flexible credit-based courses.",
    overview:
      "The US has universities of every size and type, with flexible credit-based courses, strong research, and campus life in every region of the country.",
    popularAreas: ["Business & Management", "Computer Science", "Engineering", "Data Science"],
    highlights: [
      "Wide range of university sizes and specialisations",
      "Flexible credit-based course structures",
      "Strong research and industry connections at many institutions",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
    imageSrc: "/destinations/usa.webp",
    imageAlt: "International student smiling with the New York City skyline at sunset",
    imageObjectPosition: "50% 85%",
  },
  {
    name: "Canada",
    slug: "canada",
    countryCode: "CA",
    flag: "🇨🇦",
    tagline: "Public universities and colleges, with structured post-study work options.",
    overview:
      "Canada is known for its welcoming approach to international students, quality public universities and colleges, and structured post-study work options.",
    popularAreas: ["Engineering", "Business", "Healthcare Programs", "Information Technology"],
    highlights: [
      "Strong network of public universities and colleges",
      "Structured post-study work permit framework",
      "Multicultural, student-friendly cities",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
    imageSrc: "/destinations/canada.webp",
    imageAlt: "International student with the Toronto skyline and CN Tower in autumn",
    imageObjectPosition: "65% 95%",
  },
  {
    name: "United Kingdom",
    slug: "uk",
    countryCode: "GB",
    flag: "🇬🇧",
    tagline: "One-year master's at many universities, and a long academic reputation.",
    overview:
      "The United Kingdom offers a long academic heritage, globally recognised universities, and typically shorter postgraduate course durations compared to many other destinations.",
    popularAreas: ["Business & Finance", "Law", "Engineering", "Design"],
    highlights: [
      "One-year postgraduate programs at many universities",
      "Long-standing academic reputation across disciplines",
      "Graduate route options for post-study experience",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
    imageSrc: "/destinations/uk.webp",
    imageAlt: "International student standing before Gothic university architecture",
    imageObjectPosition: "60% 80%",
  },
  {
    name: "Australia",
    slug: "australia",
    countryCode: "AU",
    flag: "🇦🇺",
    tagline: "Globally ranked universities in cities known for their quality of life.",
    overview:
      "Australia combines internationally ranked universities with a high standard of living, making it a popular destination for students across a wide range of disciplines.",
    popularAreas: ["Engineering", "Healthcare", "Business", "Information Technology"],
    highlights: [
      "Globally ranked universities across major cities",
      "Post-study work options for eligible graduates",
      "Strong support systems for international students",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
    imageSrc: "/destinations/australia.webp",
    imageAlt: "International student near the Sydney Opera House and Harbour Bridge",
    imageObjectPosition: "55% 95%",
  },
  {
    name: "New Zealand",
    slug: "new-zealand",
    countryCode: "NZ",
    flag: "🇳🇿",
    tagline: "Small classes and research-led universities in a consistently safe country.",
    overview:
      "New Zealand offers a safe environment, a research-oriented education system, and a close-knit international student community across its universities.",
    popularAreas: ["Agriculture Sciences", "Business", "Engineering", "Environmental Studies"],
    highlights: [
      "Small class sizes with close faculty interaction",
      "Consistently ranked among the safest countries globally",
      "Research-driven university culture",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
    imageSrc: "/destinations/new-zealand.webp",
    imageAlt: "International student smiling with the Auckland skyline, Sky Tower, and Rangitoto Island",
    imageObjectPosition: "55% 75%",
  },
  {
    name: "Germany",
    slug: "germany",
    countryCode: "DE",
    flag: "🇩🇪",
    tagline: "Low or no tuition at many public universities, with deep engineering roots.",
    overview:
      "Germany is well regarded for engineering and applied sciences, with many public universities offering low or no tuition fees for eligible programs.",
    popularAreas: ["Mechanical Engineering", "Automotive Engineering", "Computer Science", "Renewable Energy"],
    highlights: [
      "Low-cost or tuition-free public university options",
      "Strong industry ties in engineering and manufacturing",
      "Central location for exploring the wider European region",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
    imageSrc: "/destinations/germany.webp",
    imageAlt: "International student smiling in front of the Brandenburg Gate in Berlin",
    imageObjectPosition: "58% 65%",
  },
  {
    name: "Ireland",
    slug: "ireland",
    countryCode: "IE",
    flag: "🇮🇪",
    tagline: "English-taught degrees near the European offices of global tech companies.",
    overview:
      "Ireland offers English-taught programs, a growing technology and pharmaceutical industry presence, and a compact, welcoming higher education system.",
    popularAreas: ["Computer Science", "Pharmaceutical Sciences", "Business", "Data Analytics"],
    highlights: [
      "Home to European offices of major global technology companies",
      "English-speaking academic environment",
      "Stay-back options for eligible graduates",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
    imageSrc: "/destinations/ireland.webp",
    imageAlt: "International student smiling near the Ha'penny Bridge in Dublin",
    imageObjectPosition: "42% 70%",
  },
  {
    name: "France",
    slug: "france",
    countryCode: "FR",
    flag: "🇫🇷",
    tagline: "Grandes écoles and a growing list of English-taught programs.",
    overview:
      "France has a long academic tradition and an increasing number of English-taught programs, particularly in business and specialised graduate schools.",
    popularAreas: ["Business Management", "Fashion & Design", "Culinary Arts", "Engineering"],
    highlights: [
      "Renowned business and grande école institutions",
      "Growing number of English-taught graduate programs",
      "Central access to the wider European continent",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
    imageSrc: "/destinations/france.webp",
    imageAlt: "International student in a beret near the Eiffel Tower in Paris",
    imageObjectPosition: "48% 68%",
  },
  {
    name: "Italy",
    slug: "italy",
    countryCode: "IT",
    flag: "🇮🇹",
    tagline: "Some of the world's oldest universities, strong in design and architecture.",
    overview:
      "Italy is home to some of the world's oldest universities, with particular strengths in design, architecture, and cultural heritage-related programs.",
    popularAreas: ["Architecture", "Design", "Fine Arts", "Business"],
    highlights: [
      "Some of the oldest universities in the world",
      "Strong reputation in design and creative disciplines",
      "Affordable tuition at many public institutions",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
  },
  {
    name: "Netherlands",
    slug: "netherlands",
    countryCode: "NL",
    flag: "🇳🇱",
    tagline: "A wide choice of English-taught programs at highly ranked universities.",
    overview:
      "The Netherlands offers a large number of English-taught programs at highly ranked universities, with a practical, research-oriented teaching style.",
    popularAreas: ["Business & Economics", "Engineering", "Environmental Science", "Data Science"],
    highlights: [
      "Large selection of English-taught bachelor's and master's programs",
      "Highly ranked research universities and universities of applied sciences",
      "Compact country with excellent connectivity",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
  },
  {
    name: "Sweden",
    slug: "sweden",
    countryCode: "SE",
    flag: "🇸🇪",
    tagline: "English-taught master's with a focus on sustainability and design.",
    overview:
      "Sweden is recognised for its innovation-driven education system, sustainability focus, and high overall quality of life for international students.",
    popularAreas: ["Sustainable Engineering", "Design", "Information Technology", "Business"],
    highlights: [
      "Strong focus on innovation and sustainability",
      "English-taught master's programs at leading universities",
      "High quality of life and safety standards",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
  },
  {
    name: "Singapore",
    slug: "singapore",
    countryCode: "SG",
    flag: "🇸🇬",
    tagline: "Globally ranked universities a short flight from India.",
    overview:
      "Singapore has globally ranked universities close to India, strong industry connections, and a large international student community.",
    popularAreas: ["Business Analytics", "Finance", "Engineering", "Information Technology"],
    highlights: [
      "Globally ranked universities in a major Asian financial hub",
      "Strong regional industry and internship connections",
      "Shorter travel distance and time-zone proximity from India",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
  },
  {
    name: "UAE",
    slug: "uae",
    countryCode: "AE",
    flag: "🇦🇪",
    tagline: "Branch campuses of international universities, close to home.",
    overview:
      "The UAE hosts a growing number of international branch campuses and universities, offering globally recognised degrees within a shorter travel distance from India.",
    popularAreas: ["Business", "Engineering", "Hospitality Management", "Information Technology"],
    highlights: [
      "International branch campuses of globally recognised universities",
      "Shorter travel distance and lower relative living costs",
      "Multicultural, business-oriented environment",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
  },
  {
    name: "Malaysia",
    slug: "malaysia",
    countryCode: "MY",
    flag: "🇲🇾",
    tagline: "International branch campuses at a lower overall cost.",
    overview:
      "Malaysia offers affordable tuition and living costs alongside branch campuses of well-known international universities, making it a practical entry point to global education.",
    popularAreas: ["Business", "Engineering", "Hospitality", "Information Technology"],
    highlights: [
      "Branch campuses of recognised international universities",
      "Comparatively affordable tuition and living costs",
      "Culturally familiar and welcoming environment for Indian students",
    ],
    relatedServiceSlugs: ["study-abroad", "visa-assistance"],
  },
];

/** "Study in the United Kingdom", not "Study in United Kingdom". */
export function destinationNameInSentence(destination: Destination) {
  return ["United States", "United Kingdom", "Netherlands", "UAE"].includes(destination.name)
    ? `the ${destination.name}`
    : destination.name;
}

export function getDestinationBySlug(slug: string) {
  return destinations.find((destination) => destination.slug === slug);
}

/**
 * The eight destinations the homepage and footer feature by name, per the
 * approved brief. All 14 destinations remain fully browsable and linked
 * from /destinations and internal pages — this list only curates the
 * homepage/footer spotlight.
 */
export const featuredDestinationSlugs = [
  "uk",
  "usa",
  "australia",
  "canada",
  "germany",
  "ireland",
  "new-zealand",
  "france",
] as const;

export function getFeaturedDestinations() {
  return featuredDestinationSlugs
    .map((slug) => getDestinationBySlug(slug))
    .filter((d): d is Destination => Boolean(d));
}
