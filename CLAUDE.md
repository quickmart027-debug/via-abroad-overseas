# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Next.js 16 (App Router) — treat conventions as unfamiliar.** This repo runs Next.js 16 with Turbopack. Notable breaks from older knowledge: the middleware file is `proxy.ts` (not `middleware.ts`) and must export a function named `proxy`; dynamic route `params` and `searchParams` are **Promises** and must be `await`ed before use. When unsure about an API, read `node_modules/next/dist/docs/`.

## Commands

```bash
npm run dev          # dev server (Turbopack) on :3000
npm run build        # production build (also runs full typecheck)
npm run start        # serve the production build
npm run lint         # ESLint (0 errors, 0 warnings)
npm run typecheck    # tsc --noEmit
npm run test         # Vitest unit tests (tests/unit/)
npm run test:e2e     # Playwright e2e — builds + starts the app itself (tests/e2e/)

# Single unit test / single case
npx vitest run tests/unit/validation.test.ts
npx vitest run -t "rejects an oversized message"

# Single e2e spec (avoid running the whole suite while iterating)
npx playwright test tests/e2e/contact-form.spec.ts --project=chromium

# Live production smoke tests (self-skip unless PROD_URL is set; non-destructive)
PROD_URL=https://via-abroad-overseas.vercel.app npx playwright test production-smoke
```

Vitest aliases the `server-only` package to a stub (`tests/stubs/server-only.ts`, wired in `vitest.config.ts`) so server modules can be imported in unit tests. Playwright's config spins up its own web server, so free port 3000 before running it.

## Architecture

Study-abroad consultancy site + lead-management platform. Public marketing site → forms → Supabase Postgres → email, plus an authenticated admin dashboard. Full docs live in `docs/` (`ARCHITECTURE.md`, `SECURITY.md`, `DEPLOYMENT.md`, `ADMIN_GUIDE.md`).

### Route groups define chrome and trust boundary
- `app/layout.tsx` is **chrome-less** (fonts, JSON-LD, toaster only).
- `app/(public)/layout.tsx` adds the site header/footer/floating actions **and the GA4/consent `AnalyticsProvider`**. All marketing pages live here. Never mount analytics in the root layout: `/admin` URLs (e.g. `?search=`) carry student PII.
- `app/admin/(dashboard)/layout.tsx` has its own operational shell and calls `requireAdmin()` at the top. `app/admin/login/` is standalone.
- Both the root and the `(public)` group have their own `not-found.tsx` (sharing `components/sections/not-found-content.tsx`) so `notFound()` inside the group keeps the public chrome.

### Three Supabase clients — do not mix them up (`lib/supabase/`)
- `client.ts` — browser, publishable key only. Used solely by the admin login form.
- `server.ts` (`createServerSupabaseClient`) — server, **session-bound** (publishable key + the user's cookie JWT). Every admin dashboard read/write goes through this, so RLS is genuinely enforced as a second layer.
- `service.ts` (`getServiceSupabaseClient`) — **secret key, bypasses RLS.** The ONLY legitimate use is server-side inserts of public form submissions (`lib/database/enquiries.ts`); admin CSV export uses the session client like every other admin read. Guarded by `import "server-only"`; never import it into a client component.

Every secret-reading module (`lib/supabase/service.ts`, `lib/security/turnstile.ts`, `lib/security/fingerprint.ts`, `lib/rate-limit/limiter.ts`, `lib/email/send.ts`, `lib/database/*`, `lib/auth/admin.ts`) starts with `import "server-only"` — that guard turns an accidental client import into a build error.

### Authorization is defense-in-depth, three layers, none trusted alone
1. `proxy.ts` redirects unauthenticated `/admin/*` (except login) to the login page — UX only.
2. `lib/auth/admin.ts#requireAdmin()` re-checks session + confirms a row in `admin_profiles` at the top of every admin page/action.
3. Postgres RLS (`supabase/migrations/0007_row_level_security.sql`) enforces it again; anon has zero policies. `is_admin()` is `security definer` with `set search_path = public`.

### The form pipeline is the heart of the app (`lib/server/enquiry-pipeline.ts`)
All three `/api/enquiries/{contact,consultation,find-my-options}` routes share one pipeline in this exact order: (route) size/Content-Type guard + Zod → honeypot → timing heuristics → per-source Upstash limits (IP-only + IP/UA fingerprint) → **Turnstile server verification** (incl. hostname) → per-recipient Upstash limits (email-only + email/phone pair; after Turnstile so invalid tokens can't burn a victim's quota) → **DB insert (source of truth)** → best-effort emails via `Promise.allSettled`. Rules: the DB insert result determines success; a failed email is logged (with enquiry id) but never rolls back the lead or flips the 2xx response. Validation uses the **same Zod schema** as the client (`lib/validation/enquiry.ts`) — the server never trusts the client's pass/fail.

### Security invariants that have dedicated tests — preserve them
- **Turnstile fails closed and never bypasses in production.** `lib/security/turnstile.ts#isDevTurnstileBypassAllowed()` requires `NODE_ENV !== "production"` AND `VERCEL_ENV !== "production"` AND `ALLOW_UNVERIFIED_TURNSTILE_IN_DEV === "true"`. Locked by `tests/unit/turnstile-bypass.test.ts`.
- **CSV export is formula-injection-safe** (`lib/utils/csv.ts` prefixes `= + - @` cells). Locked by `tests/unit/csv.test.ts`.

### Configuration & graceful degradation (`lib/config.ts`)
Central business facts + per-integration `isConfigured` flags. The app is fully runnable with zero third-party credentials: WhatsApp/social render disabled, Turnstile shows a note (server fails closed), Upstash falls back to in-memory (with a loud prod warning), Resend skips sends (lead still saved), Supabase-less admin shows "Not Configured". `siteUrl` resolves `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `localhost` so canonical/sitemap URLs are never localhost on a deployed build.

### Data-driven content
`data/services.ts` and `data/destinations.ts` are typed arrays; `/services/[slug]` and `/destinations/[slug]` use `generateStaticParams()`. Add a service/destination by editing the data file — no new route file. `data/testimonials.ts` and `data/team.ts` are intentionally empty (honest empty states); components render real entries automatically once populated.

### Styling
Tailwind CSS v4 — design tokens are defined with `@theme` inside `app/globals.css` (navy/gold palette, not a `tailwind.config`). Use `next/font` (Manrope + Playfair Display).

## Deployment gotcha
`NEXT_PUBLIC_*` values are inlined at **build time**. Setting or changing them in Vercel does nothing until a fresh production deploy. Symptoms of a build made without them: `localhost` in canonical/sitemap, and admin pages showing "Admin System Not Yet Configured". Server-only secrets are read at request time and do not need a rebuild.

## Content rules (enforced throughout)
No fake statistics, testimonials, university partnerships, visa-success rates, or years of experience; never claim guaranteed admission/visa approval. Destination pages carry a "requirements can change, consult official sources" disclaimer. Analytics events must never carry PII (name/email/phone/message) — only `{source}`/`{slug}`.
