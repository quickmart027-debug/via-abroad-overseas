# Security

## Authentication Model

- Admin authentication uses **Supabase Auth** (email + password).
- There is **no public registration flow**. Admin users are created
  manually (Supabase dashboard/Admin API) and linked via a row in
  `admin_profiles` — see `docs/ADMIN_GUIDE.md`.
- Login errors are generic (`"Invalid email or password."`) regardless of
  whether the email exists, the password is wrong, or the account isn't an
  admin — this prevents account enumeration.
- The client-side login form applies a soft cooldown after repeated failed
  attempts as a UX safety net; Supabase Auth's own backend rate limiting is
  the real control against brute force.
- MFA step-up: `requireAdmin()` rejects (signs out and redirects to login)
  any admin who has a **verified MFA factor** but whose session is not
  `aal2`. Admins without a factor are not yet forced into MFA, so this
  becomes total only once MFA is mandated for every admin in Supabase Auth.
  The login form has no MFA challenge step yet, so do not enrol a factor
  for an admin until one exists, or that admin will be locked out.

## Authorization Model

Defense in depth, three independent layers — **none of which is trusted
alone**:

1. **Proxy/middleware** (`proxy.ts`) redirects unauthenticated requests to
   `/admin/*` (except `/admin/login`) to the login page. This is a
   first-pass UX redirect only.
2. **Server-side role check** (`lib/auth/admin.ts#requireAdmin`) runs at
   the top of every admin Server Component, layout, and Server Action. It
   re-reads the session from cookies and confirms the user has a row in
   `admin_profiles` — a valid Supabase session alone is not sufficient.
3. **Row Level Security** in Postgres enforces the same rule at the
   database layer. The admin dashboard queries through a session-bound
   Supabase client (publishable key + user JWT), not the secret-key
   client, so RLS is actually exercised on every read/write, not bypassed.

A user cannot become an admin by modifying browser state — the
authorization fact lives exclusively in the `admin_profiles` table, which
anonymous and non-admin authenticated users cannot write to (see RLS
policies in `supabase/migrations/0007_row_level_security.sql`).

## Row Level Security

All four tables (`enquiries`, `admin_profiles`, `admin_notes`,
`audit_logs`) have RLS enabled. Anonymous (`anon`) requests have **zero**
policies granting access — public forms never talk to Postgres directly;
they always go through a server Route Handler using the secret key.
Authenticated users get access only if `is_admin()` (a `SECURITY DEFINER`
SQL function checking `admin_profiles`) returns true.

Migration `0008` adds explicit Data API grants instead of relying on project
defaults. Public enquiry inserts use the server-only secret client; browser
roles receive no table privileges on protected data. Admin session clients
can read the audit history and append rows attributed to their own
`admin_profiles` entry. Audit rows have no client update/delete privileges
or policies.

Status changes and note creation persist their business row and audit row in
separate statements, not one transaction. If an audit insert fails after the
primary mutation succeeds, the Server Action returns a controlled
partial-failure message and asks the admin to refresh and verify before
retrying.

## Secret Management

- `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, and
  `UPSTASH_REDIS_REST_TOKEN` are server-only. They are read exclusively
  inside modules that start with `import "server-only"`, which makes
  accidentally importing them into a Client Component a **build-time
  error**, not a runtime leak.
- `.env.example` contains placeholders only and is explicitly tracked in
  Git (`.gitignore` excludes `.env*` generally but carves out an
  exception for this template file); all other `.env*` files remain
  untracked.
- No secret is ever logged. Error logging (`console.error`) is limited to
  fixed diagnostic messages without provider error text, PII, full request
  bodies, or tokens.

## Public Form Protection

Every public form submission (`/api/enquiries/contact`, `/consultation`,
and `/find-my-options`) passes through, in order:

1. Body guard (`lib/server/read-json-body.ts` over
   `lib/server/bounded-json.ts`): anything other than
   `Content-Type: application/json` gets 415; a `Content-Length` over
   `MAX_REQUEST_BYTES` (20,000 bytes) is rejected with 413 before reading;
   the body is streamed and counted in UTF-8 bytes, cancelling the stream
   with 413 once the cap is crossed; invalid UTF-8 or malformed JSON gets 400.
2. Zod schema validation (never trusts client-side pass/fail). Names are
   restricted to letters, combining marks, spaces and `. ' ’ -`.
3. Honeypot field check. The schema accepts any honeypot value on purpose,
   so a filled honeypot reaches the pipeline, which returns a fake `200
   {success: true}` without storing anything or sending email — bots are
   not told which field gave them away.
4. Submission-timing heuristic (rejects implausibly instant or stale forms).
5. Per-source Upstash limits (per-IP and per-fingerprint) — cheap, so they
   run before any call to Cloudflare.
6. Cloudflare Turnstile server-side verification (`lib/security/turnstile.ts`,
   8-second provider timeout). A token passes only if Siteverify reports
   success, the reported `hostname` is allowed, and the reported `action`
   matches the endpoint (`contact`, `consultation`, `find_my_options`).
   Allowed hostnames are exact matches only: the host of
   `NEXT_PUBLIC_SITE_URL` and of `VERCEL_PROJECT_PRODUCTION_URL`; on a Vercel
   *preview* deployment, that deployment's own `VERCEL_URL` /
   `VERCEL_BRANCH_URL`; and `localhost`/`127.0.0.1` outside production. The
   production deployment never accepts preview or other `*.vercel.app`
   hosts, and a production build whose configured host is loopback is
   treated as unconfigured. Missing configuration (secret key or allowed
   hostname) **fails closed**, unless `ALLOW_UNVERIFIED_TURNSTILE_IN_DEV=true`
   is explicitly set outside production. Invalid, foreign-host, or
   wrong-action tokens get a generic 400; provider or configuration failures
   get a generic 503, logged with only a fixed reason code (never the token
   or provider details).
7. Per-recipient Upstash limits (per-email and per-email+phone pair). These
   run only after Turnstile passes, so requests with invalid tokens cannot
   exhaust a victim's quota.
8. Database insert (source of truth), then best-effort emails.

Turnstile's provider-issued tokens are treated as short-lived and single-use.
The application does not cache or retry a token or maintain a separate replay
database.

See `lib/server/enquiry-pipeline.ts` for the implementation. The student
confirmation email greets the recipient neutrally and echoes no submitted
content, so it cannot be used to relay text to an arbitrary inbox; the
per-email limit caps how many it sends to any one address.

## Rate Limiting

Distributed via Upstash Redis (`@upstash/ratelimit`, sliding window). Four
limits apply (`rateLimitPolicy` in `lib/rate-limit/limiter.ts`):

| Limit | Key | Policy | Runs |
| --- | --- | --- | --- |
| Per-IP | HMAC of client IP only (IPv6 grouped by /64) | 10 / 10 min | before Turnstile |
| Per-fingerprint | SHA-256 of salt + IP + User-Agent | 5 / 10 min | before Turnstile |
| Per-email | HMAC of normalized email only | 3 / hour | after Turnstile |
| Per-contact-pair | HMAC of normalized email + phone | 3 / hour | after Turnstile |

The IP-only key means cycling the User-Agent cannot mint fresh buckets; the
email-only key means pairing one inbox with different phone numbers cannot
reset its quota. All keys are domain-separated HMAC-SHA-256 / SHA-256
digests — raw IPs and contact values are never sent as Redis key material.
The HMACs and request fingerprint use the server-only `ABUSE_HASH_SALT`.

Production requires valid `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`, and a high-entropy `ABUSE_HASH_SALT` (at least
32 characters). Missing/partial/invalid configuration or an Upstash runtime
failure fails closed: public enquiry requests receive a generic HTTP 503.
In-memory rate limiting and the local hash-salt fallback are available only
in development/tests and must not be used as production protection.

## Dependency Maintenance

- `npm audit` is not run automatically in CI (kept intentionally simple);
  run `npm audit --omit=dev` (runtime dependencies) and `npm audit`
  periodically and before releases. As of the last check, `npm audit
  --omit=dev` reports no advisories; the remaining reports are dev-only
  (`braces` via `micromatch`/`fast-glob` in `eslint-config-next`'s lint
  tooling), which never ship to the runtime and need an upstream release
  to clear (`npm audit fix --force` would downgrade `eslint-config-next`).
- Tooling-only packages (e.g. the `react-email` preview CLI) are
  devDependencies; the email templates' runtime import is
  `@react-email/components`.
- Dependencies use caret ranges; `package-lock.json` is committed for
  reproducible installs. CI runs a fresh `npm ci` on every build.

## CSV Export / Formula Injection

`lib/utils/csv.ts#sanitizeCsvCell` prefixes any cell value starting with
`=`, `+`, `-`, `@`, or a tab/CR character with a leading `'`, neutralizing
spreadsheet formula injection when the exported file is opened in
Excel/Sheets. The export endpoint (`/api/admin/export`) is itself gated by
`requireAdmin()` and reads through the same **session-bound** Supabase
client as the dashboard (not the secret key), so RLS applies to exports too.

## Input Safety

- No raw SQL string interpolation — all Postgres access goes through the
  Supabase client's parameterized query builder.
- No `dangerouslySetInnerHTML` is used with user-controlled data. It is
  used only for JSON-LD structured data built from static, server-controlled
  business configuration and content (`components/seo/*-jsonld.tsx`), and
  every `<` in that JSON is escaped as `\u003c` so no value can close the
  `<script>` element.
- Enquiry request bodies must be `application/json` (415) and are
  size-capped in UTF-8 bytes while streaming, before JSON parsing
  (`MAX_REQUEST_BYTES`, 413).

## Security Headers

Configured in `next.config.ts`: `Content-Security-Policy` (explicit
allow-list of the Turnstile, GA4, Google Maps, and Supabase origins this
app actually calls — no wildcard), `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
(camera/microphone/geolocation/browsing-topics/payment denied),
`X-Frame-Options: SAMEORIGIN`, and `Strict-Transport-Security` (production
builds only). `poweredByHeader: false` drops `X-Powered-By`.

## Analytics and Admin Privacy

GA4 and its consent banner (`components/analytics/analytics-provider.tsx`)
are mounted only by `app/(public)/layout.tsx`, never by the root layout, so
they never load on `/admin/*` — admin URLs such as the enquiry search
(`?search=`) can contain student names, emails, and phone numbers. If gtag is
already loaded and the user client-navigates out of the public layout, the
provider sets GA's `ga-disable-<id>` opt-out flag on unmount.

## Logging

Never logged: passwords, Supabase/Resend/Turnstile/Upstash secrets, full
auth cookies, or complete enquiry message bodies. Error logs contain short
diagnostic messages and, where useful, a non-sensitive entity id (e.g. an
enquiry UUID) so a failed notification email can be manually followed up
without exposing the enquiry's content in logs. Provider error text is not
logged because it can contain contact details or request-specific values.

## Error Responses

Production users receive generic messages
(`"We couldn't process your submission. Please try again in a moment."`)
for server failures; a global `app/error.tsx` boundary handles unexpected
render errors the same way. Detailed error information is only ever sent
to `console.error` (intended to be picked up by Sentry once
`NEXT_PUBLIC_SENTRY_DSN` is configured) — never returned in the HTTP
response body.

## Incident Response Basics

1. **Suspected credential leak** — rotate the affected key immediately in
   its provider dashboard (Supabase/Resend/Turnstile/Upstash) and redeploy;
   all secrets are environment variables, so rotation requires no code
   change.
2. **Suspected admin account compromise** — delete the corresponding row
   from `admin_profiles` (revokes dashboard access immediately, even with
   a valid session, because `requireAdmin()` re-checks on every request)
   and disable/reset the Supabase Auth user.
3. **Abuse/spam surge** — the Upstash rate limits are the first control;
   if a determined attacker persists, tighten Turnstile widget settings or
   temporarily block the offending fingerprint pattern at the CDN/WAF
   layer (outside this application's scope).
