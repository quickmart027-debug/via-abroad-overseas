# VIA ABROAD OVERSEAS

Production website and lead-management platform for **VIA ABROAD OVERSEAS**, a
study abroad and overseas education consultancy based in Hyderabad, India.

This is a real, working application: premium marketing site, lead-capture
forms backed by PostgreSQL, transactional email, bot/spam protection, rate
limiting, and an authenticated admin dashboard for managing enquiries.

## Product Overview

- **Public site** — premium, animated marketing site covering services,
  study destinations, and company information, with a photographic hero.
- **Lead capture** — a general contact form and a free-consultation form,
  both server-validated, bot-protected, and rate-limited, writing directly
  to Postgres and triggering email notifications.
- **Admin dashboard** — authenticated staff-only console to view, filter,
  search, triage, and export enquiries, with internal notes and an audit
  trail.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the technical
architecture, [`docs/SECURITY.md`](docs/SECURITY.md) for the security model,
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the production deployment
procedure, and [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md) for operating the
admin dashboard.

## Technology Stack

| Concern | Technology |
|---|---|
| Framework | Next.js (App Router), React, TypeScript (strict) |
| Styling | Tailwind CSS v4, shadcn/ui-style primitives |
| Animation | CSS (scroll-driven animations, progressive enhancement) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Email | Resend + React Email |
| Bot protection | Cloudflare Turnstile |
| Rate limiting | Upstash Redis |
| Analytics | Google Analytics 4 (consent-gated) |
| Monitoring | Sentry (integration-ready) |
| Testing | Vitest (unit), Playwright (e2e) |
| Deployment | Vercel + GitHub Actions CI |

## Local Setup

```bash
npm install
cp .env.example .env.local   # fill in real values as you provision them
npm run dev
```

The app runs at `http://localhost:3000` and is fully browsable without any
third-party credentials configured — every integration degrades gracefully
(see "Graceful degradation" below) until you provision it.

## Environment Variables

All variables are documented in [`.env.example`](.env.example). Summary:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO/emails |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp contact number (E.164, no `+`) |
| `NEXT_PUBLIC_{INSTAGRAM,FACEBOOK,LINKEDIN,YOUTUBE}_URL` | Footer social links |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase browser credentials |
| `SUPABASE_SECRET_KEY` | **Server-only.** Bypasses RLS — never expose to the browser |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `BUSINESS_NOTIFICATION_EMAIL` | Transactional email |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Bot protection |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Distributed rate limiting |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 (loads only after cookie consent) |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_AUTH_TOKEN` | Error monitoring |
| `ABUSE_HASH_SALT` | Salts the anti-abuse request fingerprint hash |

### Graceful degradation

Every third-party integration is optional in development:

- **WhatsApp** — the floating action button is hidden entirely (rather
  than rendering a dead link) until `NEXT_PUBLIC_WHATSAPP_NUMBER` is set.
- **Social links** — footer icons only render for platforms with a
  configured, valid `https://` URL.
- **Turnstile** — the widget shows an explanatory note instead of a broken
  embed. Server-side verification **fails closed** by default; set
  `ALLOW_UNVERIFIED_TURNSTILE_IN_DEV=true` locally to test the full form
  flow without real Turnstile keys.
- **Upstash** — falls back to an in-memory (single-instance, non-production
  safe) rate limiter.
- **Resend** — email sends are skipped with a logged warning; the enquiry
  is still saved (the database insert is always the source of truth).
- **Supabase** — the admin dashboard and login page render a clear "Admin
  System Not Yet Configured" screen instead of crashing.

## Database Setup

1. Create a Supabase project.
2. Apply the migrations in [`supabase/migrations/`](supabase/migrations) in
   order, via the Supabase SQL editor or the Supabase CLI:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
3. Verify Row Level Security is enabled on all four tables (the migrations
   enable it, but confirm in the dashboard).

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full production
sequence, including creating the first admin user.

## Admin Creation

There is no public admin registration. To create an admin:

1. Create a user in Supabase Auth (dashboard → Authentication → Add User,
   or via the Admin API).
2. Insert a matching row into `admin_profiles` with that user's `id` as
   `auth_user_id`.

Full steps are in [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md).

## Email Setup

Uses [Resend](https://resend.com). Create an API key, verify a sending
domain for production (SPF/DKIM/DMARC — see `docs/DEPLOYMENT.md`), and set
`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `BUSINESS_NOTIFICATION_EMAIL`.

## Turnstile Setup

Create a [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
widget, restrict it to your production hostname(s), and set
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`.

## Rate Limiting Setup

Create an [Upstash Redis](https://upstash.com) database and set
`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.

## Analytics Setup

Create a GA4 property and set `NEXT_PUBLIC_GA_MEASUREMENT_ID`. The script
only loads after a visitor accepts the cookie consent banner, and no
personal or enquiry data is ever sent to analytics (see
`lib/analytics/events.ts`).

## Development Commands

```bash
npm run dev         # start the dev server
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test          # Vitest unit tests
npm run test:watch    # Vitest in watch mode
npm run test:e2e       # Playwright end-to-end tests (builds + starts the app)
npm run build          # production build
npm run start           # run the production build
```

## Testing

- **Unit tests** (`tests/unit/`) cover validation schemas, CSV
  formula-injection sanitization, spam-detection heuristics, and
  configuration parsing.
- **End-to-end tests** (`tests/e2e/`) cover page loads, navigation, mobile
  menu, contact form validation, API error handling, and admin
  access-control (unauthenticated users never see dashboard data).

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full procedure:
Vercel (app), Supabase (database/auth), Resend (email), Cloudflare
Turnstile (bot protection), Upstash (rate limiting), GitHub Actions (CI).

## Security Notes

See [`docs/SECURITY.md`](docs/SECURITY.md) for the full security model.
Highlights:

- The Supabase **secret key never leaves the server** — it is only
  imported in modules guarded by `import "server-only"`.
- Every public form is re-validated server-side (Zod), bot-checked
  (Turnstile), and rate-limited (Upstash), regardless of client-side state.
- Row Level Security is enabled on every table; the admin dashboard uses
  the authenticated user's session (not the secret key) for all reads
  and writes, so RLS is a real second layer of defense, not theater.
- CSV exports sanitize cells against spreadsheet formula injection.
# via-abroad-overseas
