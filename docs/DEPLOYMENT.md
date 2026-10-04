# Deployment

Production model: **Vercel** (app) + **Supabase** (database/auth) +
**Resend** (email) + **Cloudflare Turnstile** (bot protection) +
**Upstash** (rate limiting) + **GitHub** (source control + CI).

## 1. GitHub

1. Push this repository to a GitHub repo (private, unless you choose
   otherwise).
2. Confirm `.github/workflows/ci.yml` runs on pull requests (lint,
   typecheck, unit tests, build, e2e).

## 2. Supabase (Production Database Setup)

1. Create a new Supabase project (separate from any staging/dev project).
2. In **Project Settings → API Keys**, copy the Project URL, the
   `publishable` key (`sb_publishable_...`), and the `secret` key
   (`sb_secret_...`).
3. Apply migrations in order (SQL editor, or `supabase db push` with the
   CLI linked to this project) from `supabase/migrations/`.
4. Confirm Row Level Security is **enabled** on `enquiries`,
   `admin_profiles`, `admin_notes`, and `audit_logs` (Table Editor → each
   table → RLS toggle).
5. Create the first admin user and link their `admin_profiles` row — see
   `docs/ADMIN_GUIDE.md`.
6. Disable public sign-ups for this project if not already the default
   (**Authentication → Providers → Email → disable "Allow new users to
   sign up"** if you want to be extra explicit — this app never exposes a
   sign-up UI regardless).
7. Test: attempt to query `enquiries` with the publishable key and no
   session (should return zero rows / permission denied) — confirms RLS
   is actually enforced, not just enabled.
8. Test: sign in as the admin user at `/admin/login` in a preview
   deployment and confirm the dashboard loads real data.

## 3. Resend (Email)

Email routing is controlled entirely by three server-only env vars — no
code change is needed to move to a custom domain later.

| Variable | What it does |
|---|---|
| `RESEND_API_KEY` | Enables sending. Unset = all emails skipped (leads are still saved). |
| `BUSINESS_NOTIFICATION_EMAIL` | Inbox(es) that get every new enquiry. Comma-separated list allowed; invalid entries are skipped with a server warning. First address = primary inbox. |
| `RESEND_FROM_EMAIL` | Sender. `"VIA ABROAD OVERSEAS <enquiries@yourdomain.com>"` or a bare address. |

Behaviour:

- Every business notification has **Reply-To set to the student's
  email**, so staff can just hit "Reply" in their inbox.
- The student confirmation email is sent **only** when `RESEND_FROM_EMAIL`
  is on a real domain (not `resend.dev`). Its Reply-To is the primary
  business inbox.

### Now (no custom domain yet)

Resend's test sender (`onboarding@resend.dev`) **can only deliver to the
email address that owns the Resend account.** So today:

1. Create the Resend account **with `viaabroadoverseas@gmail.com`** (or
   make sure that is the account owner's address) and create an API key.
2. Set in Vercel (Production):
   - `RESEND_API_KEY=re_...`
   - `BUSINESS_NOTIFICATION_EMAIL=viaabroadoverseas@gmail.com`
   - `RESEND_FROM_EMAIL` — leave unset (or `onboarding@resend.dev`).
3. Student confirmation emails are skipped in this mode (a log line says
   so), and the server logs a one-time warning explaining the test-sender
   limit. Both are expected.

### When you get the domain

1. In Resend → **Domains**, add the domain (e.g. `yourdomain.com`) and add
   the **SPF**, **DKIM** and **DMARC** DNS records it shows at your DNS
   provider. Wait until Resend shows the domain as **Verified**.
2. In Vercel → Project → Settings → Environment Variables (Production):
   - `RESEND_FROM_EMAIL="VIA ABROAD OVERSEAS <enquiries@yourdomain.com>"`
   - `BUSINESS_NOTIFICATION_EMAIL=enquiries@yourdomain.com,viaabroadoverseas@gmail.com`
     (drop the Gmail address if you no longer want copies there)
   - `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` (also see §7)
3. **Redeploy** (Deployments → latest → Redeploy). Vercel only applies env
   changes to new deployments. `NEXT_PUBLIC_SITE_URL` is baked in at build
   time, so it needs that fresh build; the `RESEND_*` /
   `BUSINESS_NOTIFICATION_EMAIL` values are server-only and are read when
   the new deployment runs — no code change or rebuild-time setting.
4. Submit a test enquiry on the live site and confirm: the notification
   arrives in every listed inbox, "Reply" addresses the student, and the
   student confirmation arrives (check spam the first time).

## 4. Cloudflare Turnstile

1. Create a Turnstile widget in the Cloudflare dashboard.
2. Restrict it to the canonical production hostname configured by
   `NEXT_PUBLIC_SITE_URL`. Server verification requires an exact hostname
   match and validates each endpoint's action. The production deployment
   never accepts Vercel preview (or any other `*.vercel.app`) hostnames;
   use the production hostname for real enquiries. A preview deployment
   accepts only its own `VERCEL_URL` / `VERCEL_BRANCH_URL`, and only if you
   also add that preview domain to the widget's hostname list in Cloudflare.
3. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
4. Confirm `ALLOW_UNVERIFIED_TURNSTILE_IN_DEV` is **not** set in
   production environment variables.

## 5. Upstash

1. Create an Upstash Redis database (choose a region close to your Vercel
   deployment region for latency).
2. Set both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in
   production and preview server environments.
3. Set `ABUSE_HASH_SALT` to a unique high-entropy value of at least 32
   characters (generate with `openssl rand -hex 32`). Keep it server-only;
   do not reuse it across environments.
4. Missing/partial/invalid configuration and Upstash outages fail closed
   with HTTP 503 on public enquiry submissions. In-memory rate limiting and
   the local hash-salt fallback are for development/tests only.

## 6. Vercel

1. Import the GitHub repository into Vercel.
2. Configure environment variables for **Production**, **Preview**, and
   **Development** separately in Vercel's Project Settings → Environment
   Variables:
   - Production: real Supabase/Resend/Turnstile/Upstash/GA4 credentials
     pointed at your production project/domain restrictions.
   - Preview: either the same non-destructive values, or a separate
     staging Supabase project — do **not** point Preview at production
     Turnstile hostname restrictions unless preview URLs are allow-listed.
   - Never mark `SUPABASE_SECRET_KEY` or other server-only secrets as
     exposed to the browser (Vercel only exposes `NEXT_PUBLIC_*`
     variables client-side by Next.js convention regardless, but keep
     naming consistent).
3. Set `NEXT_PUBLIC_SITE_URL` to your final production domain
   (`https://www.viaabroadoverseas.com` or similar) — this feeds
   canonical URLs, the sitemap, Open Graph tags, and email links. If you
   do NOT set it, the app now automatically falls back to Vercel's
   production domain (`VERCEL_PROJECT_PRODUCTION_URL`), so canonical/sitemap
   URLs are never `localhost` on a deployed build — but you should still
   set it explicitly once a custom domain exists.
4. Deploy.

> **CRITICAL — `NEXT_PUBLIC_*` values are baked in at BUILD time.** Adding
> or changing any `NEXT_PUBLIC_*` variable in Vercel does nothing to an
> already-running deployment; you MUST trigger a fresh production
> deployment (redeploy) for the new values to take effect. Symptoms of a
> build that ran without them: canonical tags / sitemap show
> `http://localhost:3000`, and the admin pages render "Admin System Not
> Yet Configured" (because `NEXT_PUBLIC_SUPABASE_URL` /
> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` were empty at build time). Server
> secrets (`SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`,
> `UPSTASH_*`) are read at request time and do not require a rebuild, but
> keeping everything set before the first production build is simplest.

## 7. Domain Configuration

1. Add your custom domain in Vercel (**Project → Domains**).
2. Configure DNS per Vercel's instructions (A/CNAME records).
3. Choose a canonical host (e.g. `www`) and let Vercel redirect the other
   (apex → `www` or vice versa) — configure this in the Domains panel.
4. HTTPS is automatic via Vercel; the app additionally sends
   `Strict-Transport-Security` in production (see `next.config.ts`).
5. Update `NEXT_PUBLIC_SITE_URL` to match the final canonical domain and
   redeploy.
6. Re-verify the Resend sending domain's SPF/DKIM/DMARC records once DNS
   has propagated.

## 8. CI/CD

`.github/workflows/ci.yml` runs on every pull request and push to `main`:
install → lint → typecheck → unit tests → production build, followed by a
Playwright e2e job. No secrets are referenced in the workflow — the build
and tests are designed to succeed using the graceful-degradation behavior
described in the root `README.md`, so preview/PR builds never need
production credentials.

## Post-Deployment Checklist

- [ ] Home page and all public routes load over HTTPS on the final domain
- [ ] Contact form submission appears in `/admin/enquiries`
- [ ] Business notification email received (in every inbox listed in
      `BUSINESS_NOTIFICATION_EMAIL`), and "Reply" goes to the student
- [ ] Student confirmation email received (only once a verified domain is
      set in `RESEND_FROM_EMAIL` — skipped by design before that)
- [ ] Admin login works; non-admin Supabase users are correctly denied
- [ ] `/sitemap.xml` and `/robots.txt` resolve and reference the correct
      domain
- [ ] Lighthouse/Core Web Vitals spot-check on the home page (mobile)
- [ ] GA4 realtime report shows a pageview after accepting cookie consent
