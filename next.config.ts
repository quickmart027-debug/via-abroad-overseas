import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Only force HTTPS sub-resources on a real HTTPS deployment. On plain
 * http://localhost, Safari honours `upgrade-insecure-requests` and rewrites
 * every CSS/JS/image request to https://localhost, which has no server, so
 * the page renders unstyled. (Chrome exempts localhost, which hides this.)
 */
const isDeployed = isProd && Boolean(process.env.VERCEL);

/**
 * Documented third-party origins required by this application:
 *  - challenges.cloudflare.com  → Turnstile bot-protection widget (script + frame)
 *  - www.googletagmanager.com   → GA4 loader script
 *  - www.google-analytics.com,
 *    *.google-analytics.com,
 *    *.analytics.google.com     → GA4 beacon requests
 *  - *.supabase.co               → Supabase Auth/DB calls from the browser (admin login only)
 *  - www.google.com              → Google Maps embed (contact page)
 *  - *.gstatic.com                → Google Maps static assets
 * Everything else is denied by default.
 */
const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'self'`,
  `frame-src https://challenges.cloudflare.com https://www.google.com`,
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://challenges.cloudflare.com https://www.googletagmanager.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://www.google.com https://*.gstatic.com https://www.google-analytics.com`,
  `font-src 'self' data:`,
  `connect-src 'self' https://challenges.cloudflare.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.supabase.co wss://*.supabase.co`,
  `form-action 'self'`,
  ...(isDeployed ? [`upgrade-insecure-requests`] : []),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: csp },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
