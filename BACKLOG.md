# Backlog

What is still needed to finish the VIA ABROAD OVERSEAS site, who has to provide
it, and exactly where it goes. Keep this file current: tick items off in the PR
that completes them.

Legend: **Client** = content or decisions only the business can supply ·
**Owner settings** = dashboard changes (Vercel / Supabase / Resend / GitHub) ·
**DB** = database migration, needs owner approval before it touches the live
database · **Code** = can be done without anyone else.

---

## 1. Content needed from the client

| # | What | Format / requirements | Where it goes | Then |
|---|---|---|---|---|
| 1.1 | WhatsApp business number | Digits with country code, no `+` (e.g. `918639996069`) | Vercel env `NEXT_PUBLIC_WHATSAPP_NUMBER` (Production + Preview) | Redeploy. WhatsApp appears in the mobile bottom bar, floating actions, final CTA and contact page automatically. |
| 1.2 | Social profile links | Full `https://` URLs of real, verified profiles | Vercel env `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_YOUTUBE_URL` | Redeploy. Footer icons appear only for the ones set. |
| 1.3 | Genuine trust numbers (students guided, visa success rate, destinations, etc.) | Each figure with the evidence behind it (records, dates). Only verifiable numbers — brief non-negotiable #1 | `components/sections/home/trust-strip-section.tsx` (currently non-numeric on purpose) | Code: swap labels for numbers + count-up animation. |
| 1.4 | Counsellor profile(s) | Photo (portrait, ≥1200px, natural light), full name, role, years of experience, languages spoken (e.g. Telugu / Hindi / English) | Photos → `public/team/<name>.webp`; details → `data/team.ts` (currently empty on purpose) | Code: build the "Your counsellor" block (after "More than a consultancy" and beside the booking form). Top trust lever from the design critique. |
| 1.5 | Office photo, walk-in hours | Landscape photo of the Nizampet office (≥2000px); opening hours | Photo → `public/office/office.webp`; hours → `lib/config.ts` (`business`) | Code: add to contact page and near the final CTA. |
| 1.6 | Student testimonials | Real student photo, name, course, university, country, 1–3 sentence quote, **written consent** to publish | Photos → `public/testimonials/<slug>.webp`; entries → `data/testimonials.ts` | `/success-stories` renders them automatically. Code: add the homepage Success Stories section (brief §11) and move "Success Stories" back into the main nav in `data/navigation.ts`. |
| 1.7 | Video testimonials | 30–60 s genuine student videos; a thumbnail frame | Host on YouTube (unlisted is fine) and send the links | Code: build brief §12 section; allow `https://www.youtube-nocookie.com` in `frame-src` in `next.config.ts`. |
| 1.8 | Universities they genuinely work with / can represent | Official names + logo files (SVG preferred) and confirmation that showing them is allowed | Logos → `public/universities/<slug>.svg`; list → new `data/universities.ts` | Code: logo marquee (brief §10) on homepage + `/universities` (an `animate-marquee` token already exists in `app/globals.css`). |
| 1.9 | Cost figures per destination | Indicative **tuition + living, ₹ lakh per year**, intake months, English-test requirement; each with source + date | New fields in `data/destinations.ts` | Code: show on each destination page; then enable the budget section (1.10). |
| 1.10 | Sign-off on the "Plan your study abroad budget" section | Approve the copy (it carries no figures) | Vercel env `NEXT_PUBLIC_SHOW_BUDGET_SECTION=true` | Redeploy. Appears between Parents and FAQ. |
| 1.11 | Service-fee statement | One honest line: what is free, what (if anything) is charged | Copy for FAQ + booking page | Code: add to `components/sections/home/faq-section.tsx` and `/book-consultation`. |
| 1.12 | Photos for the 6 destinations without one | Italy, Netherlands, Sweden, Singapore, UAE, Malaysia — 1600×1200 (4:3), **no white borders**, student (if any) fully in frame | `public/destinations/<slug>.webp`, then set `imageSrc`, `imageAlt`, `imageObjectPosition` for that country in `data/destinations.ts` | They move from the "More places to study" list into the photo grid automatically. |
| 1.13 | Higher-resolution hero photo | Same composition, ≥2400px wide | Replace `public/hero/hero-student.webp` | Looks soft on large retina screens today. |
| 1.14 | Real logo | SVG wordmark + square mark | `public/brand/`; replace the placeholder "V" in `components/navigation/site-header.tsx`, `components/footer/site-footer.tsx`, `app/icon.tsx`, `app/apple-icon.tsx` | Code. |
| 1.15 | Domain name | e.g. `viaabroadoverseas.com` | See §3 "When you get the domain" | — |
| 1.16 | Owner's list of issues | Pending — owner mentioned issues to check, list not received yet | Add here | — |

---

## 2. Owner settings (dashboards)

### Vercel → Project → Settings → Environment Variables
Set for **Production** (and Preview where noted), then **redeploy** — env changes only apply to new deployments; `NEXT_PUBLIC_*` values are baked in at build time.

| Variable | Value now | Notes |
|---|---|---|
| `RESEND_API_KEY` | Resend API key | Resend account must be owned by `viaabroadoverseas@gmail.com` until a domain is verified. |
| `BUSINESS_NOTIFICATION_EMAIL` | `viaabroadoverseas@gmail.com` | Comma-separate to notify several inboxes. |
| `RESEND_FROM_EMAIL` | unset (or `onboarding@resend.dev`) | Change after domain verification (§3). |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile keys | Restrict the widget to the production hostname(s). Forms fail closed without them. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis | Required in production (rate limiting fails closed). |
| `ABUSE_HASH_SALT` | `openssl rand -hex 32` | ≥32 chars, unique per environment. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | Supabase project | Secret key server-only. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 ID (optional) | Loads only after cookie consent, public pages only. In GA4 → Enhanced measurement, turn **off** "Site search". |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`, social URLs, `NEXT_PUBLIC_SHOW_BUDGET_SECTION` | see §1 | |

Also: enable **Deployment Protection** on Preview deployments.

### Supabase → Authentication (security audit M2)
- [ ] Disable public sign-ups (admins are created manually — see `docs/ADMIN_GUIDE.md`).
- [ ] Minimum password length ≥ 12.
- [ ] Enable **TOTP MFA** and enrol every admin — **only after** the MFA challenge step exists on the login form (§5). The code already requires the second factor (AAL2) for any admin with a verified factor, so enrolling before that step ships would lock the admin out.
- [ ] Enable Auth **CAPTCHA** (Turnstile). Needs a small code follow-up to pass `captchaToken` from the login form (§5).
- [ ] Set session time-box / inactivity timeout.

### GitHub
- [ ] Give the developer account(s) write access to `quickmart027-debug/via-abroad-overseas`, so work can be pushed as branches instead of forks (Vercel then builds preview links automatically).

---

## 3. When you get the domain

Full steps: `docs/DEPLOYMENT.md` ("When you get the domain").

1. Vercel → Domains: add the domain, set DNS, pick the canonical host (www or apex).
2. Resend → Domains: verify the domain (add the SPF, DKIM and DMARC DNS records).
3. Set in Vercel:
   - `RESEND_FROM_EMAIL="VIA ABROAD OVERSEAS <enquiries@<domain>>"`
   - `BUSINESS_NOTIFICATION_EMAIL=<new inbox>,viaabroadoverseas@gmail.com`
   - `NEXT_PUBLIC_SITE_URL=https://<domain>`
4. Redeploy. Student confirmation emails switch on automatically.
5. Code (one line): change the public email shown on the site — `business.email` in `lib/config.ts`.
6. Restrict the Turnstile widget to the new hostname; think before keeping HSTS `includeSubDomains; preload` on the apex (`next.config.ts`).

---

## 4. Database changes (need approval — apply with `supabase db push` after review)

None of these are written yet. Each becomes a new numbered file in `supabase/migrations/`.

| # | Change | Why | Source |
|---|---|---|---|
| 4.1 | `admin_notes.admin_user_id`: fix the `on delete set null` + `not null` conflict (make it `on delete restrict` and add `admin_profiles.disabled_at`, checked by `is_admin()` and `requireAdmin()`) | Today removing an admin who has written notes fails, which breaks the incident-response step in `docs/SECURITY.md`. | Audit L2 |
| 4.2 | Write audit rows from database triggers (SECURITY DEFINER, pinned `search_path`); revoke `INSERT` on `audit_logs` from `authenticated`; tie `admin_notes.admin_user_id` to the caller in its insert policy; audit CSV exports | A stolen admin session can change data through the Supabase API without leaving an audit row. | Audit L3 |
| 4.3 | `alter function public.set_updated_at() set search_path = ''` | Supabase linter warning. | Audit L8 |
| 4.4 | Retention: scheduled job (pg_cron) that nulls `abuse_fingerprint` after N days; documented process for student deletion requests | Column is described as "short-lived" but is never purged. | Audit L9 |
| 4.5 | New enquiry columns: `budget_range`, `is_parent`, `preferred_call_time`, `preferred_language` (+ grants in the style of `0008`) | Find My Options budget is currently folded into `message`; booking form needs parent / call-time / language fields (design critique). | Critique P2 |

---

## 5. Code follow-ups (no client input needed)

- [ ] Nonce-based CSP for `/admin/*` (set in `proxy.ts`), pin `connect-src` to the exact Supabase project URL, `secure` cookie option in production. (Audit L4)
- [ ] **Build the MFA challenge step** in `components/admin/login-form.tsx` (enter the 6-digit TOTP code after password) and a one-time enrolment screen. Required before anyone enables MFA (§2). (Audit M2)
- [ ] Pass Turnstile `captchaToken` on admin login once Supabase Auth CAPTCHA is on. (Audit M2)
- [ ] Dev-only `npm audit`: 5 high advisories in `braces` via `eslint-config-next` (needs an upstream release; `--force` would downgrade). Production dependencies: 0 advisories.
- [ ] CI: add a `permissions:` block and pin GitHub Actions by commit SHA. (Audit info)
- [ ] Booking form: parent / call-time / language fields once 4.5 lands.
- [ ] Find My Options notification email subject says "General Enquiry"; give it its own label.
- [ ] Design critique leftovers: further trim of the homepage middle (Services vs Journey overlap), Find My Options as a hero secondary action (brief currently fixes the hero buttons — needs client OK).

---

## Done (recent)

- Homepage redesign to the brief, cinematic hero, mobile CALL | WHATSAPP | CONSULT bar.
- Budget section built and hidden behind `NEXT_PUBLIC_SHOW_BUDGET_SECTION`.
- Accessibility, contrast, layout-layer CSS bugs, copy rewrite, destination photo fixes.
- Email routing made domain-ready (env-only switch); honeypot and attribution bugs fixed.
- Security audit code fixes (see the PR description for the list).
