# Architecture

## Route Structure

```
app/
  layout.tsx                 Root layout: fonts, global providers, no chrome
  globals.css                 Design tokens (Tailwind v4 @theme)
  sitemap.ts / robots.ts       Generated SEO files
  icon.tsx / apple-icon.tsx /
  opengraph-image.tsx           Generated images (next/og)

  (public)/                    Route group: public marketing site
    layout.tsx                  Adds SiteHeader / SiteFooter / FloatingActions
    page.tsx                     Home
    about/, services/, services/[slug]/,
    destinations/, destinations/[slug]/,
    success-stories/, contact/, book-consultation/,
    privacy/, terms/

  admin/
    login/page.tsx                Standalone, no dashboard chrome
    (dashboard)/
      layout.tsx                   Calls requireAdmin(), renders sidebar shell
      page.tsx                      /admin overview
      enquiries/page.tsx             /admin/enquiries
      enquiries/[id]/page.tsx         /admin/enquiries/[id]

  api/
    enquiries/contact/route.ts        Public contact form submission
    enquiries/consultation/route.ts    Public consultation form submission
    admin/export/route.ts               Authenticated CSV export

  not-found.tsx / error.tsx / loading.tsx   Global fallbacks
  (public)/not-found.tsx                     Same content, rendered inside
                                               the public chrome for notFound()
                                               calls from within that group
```

The `(public)` route group exists specifically so the admin section never
inherits the public site's header/footer/floating actions — the admin
dashboard uses its own minimal operational shell (`components/admin/`).

## Component Organization

```
components/
  layout/, navigation/, footer/     Global chrome
  sections/                          Reusable page sections (PageHero, CTA banner)
  sections/home/                      Home-page-only sections
  forms/                               Contact/consultation forms + Turnstile widget
  admin/                                Admin-only UI (sidebar, status select, notes)
  ui/                                   Design-system primitives (button, field, accordion)
  motion/                               Framer Motion reveal/stagger wrappers
  three/                                 Signature globe hero + static fallback
  seo/                                    JSON-LD structured data components
  analytics/                              Consent banner, event tracking helpers

lib/
  config.ts                    Central business info + feature-flag-style
                                  "isConfigured" checks for optional integrations
  auth/admin.ts                 requireAdmin() — server-side session + role check
  database/                     Server-only Supabase queries (enquiries, admin data)
  validation/                   Zod schemas (single source of truth, client + server)
  security/                     Turnstile verification, honeypot/timing checks,
                                   privacy-conscious request fingerprint hashing
  rate-limit/limiter.ts          Upstash-backed rate limiter (+ dev in-memory fallback)
  email/                          Resend client + fail-safe send helpers
  supabase/                        Three distinct clients (browser / server session / secret key)
  server/enquiry-pipeline.ts        Shared validate→spam-check→rate-limit→
                                       verify→insert→notify pipeline for both forms
  actions/admin-actions.ts           Server Actions for status updates + notes
```

## Data Flow: Public Form Submission

1. Client form (`react-hook-form` + shared Zod schema) validates for UX.
2. `POST /api/enquiries/{contact,consultation,find-my-options}` rejects
   oversized (413) and non-JSON (415) bodies, then re-validates the same Zod
   schema server-side — the client's validation result is never trusted.
3. Honeypot field and submission-timing heuristics run first (cheap, no
   external calls).
4. Per-source Upstash limits: per-IP (IP only) and per-fingerprint (IP +
   User-Agent).
5. Turnstile token is verified server-side against Cloudflare's API,
   including the hostname it was solved on.
6. Per-recipient Upstash limits, only for verified requests: per-email and
   per-email+phone.
7. The enquiry is inserted using the **secret-key** Supabase client
   (the only code path allowed to bypass RLS), which is the source of
   truth for "did this submission succeed."
8. Business notification + student confirmation emails are sent
   best-effort via `Promise.allSettled` — a failure here is logged but
   never changes the HTTP response, because the lead is already safely
   stored. Routing is env-driven (`lib/email/config.ts`): notifications go
   to every address in `BUSINESS_NOTIFICATION_EMAIL` with Reply-To set to
   the student; the student confirmation is only sent once
   `RESEND_FROM_EMAIL` is on a verified domain (not `resend.dev`).

## Data Flow: Admin Dashboard

Every admin Server Component/Server Action calls `requireAdmin()`, which:

1. Reads the Supabase session from cookies (`@supabase/ssr`).
2. Re-verifies the user exists in `admin_profiles` — independent of the
   middleware/proxy redirect, which is only a first-pass UX layer.
3. Returns a **session-bound** Supabase client (publishable key + user
   JWT), not the secret-key client, so every admin query is still subject
   to Postgres Row Level Security. This makes RLS a genuine second
   enforcement layer rather than a formality.

## Signature 3D Hero

`components/three/globe-hero.tsx` is a client component that:

- Renders the WebGL globe (`globe-scene.tsx`, dynamically imported,
  `ssr: false`) only when: the component has mounted client-side, the
  viewport is not "small" (≤640px), and `prefers-reduced-motion` is not
  set.
- Otherwise renders `static-globe.tsx`, a dependency-free inline SVG with
  the same visual language (navy sphere, gold route arcs, destination
  nodes) — used for the Suspense fallback, the reduced-motion path, the
  small-viewport path, and as the error-boundary fallback if WebGL
  initialization throws.
- Uses an `IntersectionObserver` to unmount the live Canvas when scrolled
  out of view, and caps `dpr` at `[1, 1.5]`.

## Data-Driven Content

Services (`data/services.ts`) and destinations (`data/destinations.ts`) are
typed arrays, not hardcoded JSX. `/services/[slug]` and
`/destinations/[slug]` use `generateStaticParams()` to statically render
one page per entry — adding a new service or destination is a data change,
not a new route file.
