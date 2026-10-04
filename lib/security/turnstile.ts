import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileFailureReason =
  | "missing_token"
  | "provider_rejected"
  | "hostname_mismatch"
  | "action_mismatch"
  | "provider_unavailable"
  | "configuration_missing";

export type TurnstileVerification =
  | { valid: true }
  | { valid: false; reason: TurnstileFailureReason };

type TurnstileSiteverifyResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  challenge_ts?: string;
  "error-codes"?: string[];
};

/** The env variables this module reads; a plain object so tests can pass one. */
export type TurnstileEnv = {
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
  VERCEL_BRANCH_URL?: string;
  ALLOW_UNVERIFIED_TURNSTILE_IN_DEV?: string;
};

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

/**
 * A Vercel production deployment always sets `VERCEL_ENV=production`, and
 * every Vercel deployment (preview included) runs with
 * `NODE_ENV=production`, so either one marks a non-local runtime.
 */
function isProductionRuntime(env: TurnstileEnv = process.env): boolean {
  return env.NODE_ENV === "production" || env.VERCEL_ENV === "production";
}

function normalizeHostname(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

/** Extracts a bare hostname from a URL or naked host (`Example.com/path`). */
function hostOf(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    if (parsed.username || parsed.password || !parsed.hostname) return null;
    return normalizeHostname(parsed.hostname);
  } catch {
    return null;
  }
}

/**
 * The exact hostnames a Turnstile token may have been solved on:
 * - the canonical site host (`NEXT_PUBLIC_SITE_URL`) and the Vercel
 *   production domain (`VERCEL_PROJECT_PRODUCTION_URL`);
 * - on a Vercel *preview* deployment only, that deployment's own hosts
 *   (`VERCEL_URL`, `VERCEL_BRANCH_URL`) — never arbitrary `*.vercel.app`
 *   hosts, and never any preview host on the production deployment;
 * - outside production runtimes only, with nothing configured, `localhost`.
 * A loopback host is never a valid configured host in production, so a
 * production build pointed at localhost yields an empty list (fail closed).
 */
export function getAllowedTurnstileHostnames(env: TurnstileEnv = process.env): string[] {
  const production = isProductionRuntime(env);
  const candidates = [hostOf(env.NEXT_PUBLIC_SITE_URL), hostOf(env.VERCEL_PROJECT_PRODUCTION_URL)];
  if (env.VERCEL_ENV === "preview") {
    candidates.push(hostOf(env.VERCEL_URL), hostOf(env.VERCEL_BRANCH_URL));
  }
  const hosts = candidates.filter(
    (host): host is string => host !== null && !(production && LOCAL_HOSTNAMES.has(host))
  );
  if (hosts.length === 0 && !production) hosts.push("localhost");
  return [...new Set(hosts)];
}

/**
 * Checks the `hostname` Siteverify reports the token was solved on, so a
 * token minted on some other site using our (public) site key is rejected.
 * Accepted: an exact match against `getAllowedTurnstileHostnames()`, plus
 * loopback hosts outside production runtimes. Anything else — including a
 * missing hostname — fails closed.
 */
export function isAllowedTurnstileHostname(
  hostname: unknown,
  env: TurnstileEnv = process.env
): boolean {
  if (typeof hostname !== "string") return false;
  const host = normalizeHostname(hostname);
  if (!host) return false;
  if (LOCAL_HOSTNAMES.has(host)) return !isProductionRuntime(env);
  return getAllowedTurnstileHostnames(env).includes(host);
}

/**
 * Decides whether the local-development Turnstile bypass may apply.
 *
 * The bypass is permitted ONLY when the app is definitively NOT running as
 * a production deployment. It requires BOTH:
 *   - the runtime is not production — `NODE_ENV !== "production"` AND
 *     `VERCEL_ENV !== "production"` (belt-and-suspenders: a Vercel
 *     production deployment always sets `VERCEL_ENV=production`, even in
 *     the unlikely event `NODE_ENV` were mis-set), AND
 *   - `ALLOW_UNVERIFIED_TURNSTILE_IN_DEV` is explicitly the string "true".
 *
 * Consequence: a Vercel Production deployment can never accept an
 * unverified form because of this development variable. Kept as a pure
 * function of its env input so the invariant is directly unit-tested.
 */
export function isDevTurnstileBypassAllowed(env: TurnstileEnv = process.env): boolean {
  return !isProductionRuntime(env) && env.ALLOW_UNVERIFIED_TURNSTILE_IN_DEV === "true";
}

/**
 * Verifies a Turnstile token server-side. The client-side widget alone is
 * never trusted — every form submission is re-checked here before any
 * database write happens. A token passes only if Siteverify reports
 * success AND it was solved on an allowed hostname AND for the endpoint's
 * expected action. The provider call times out after 8 seconds.
 *
 * When Turnstile configuration (secret key or an allowed hostname) is
 * missing, this fails closed with `configuration_missing` UNLESS explicitly
 * relaxed outside production via ALLOW_UNVERIFIED_TURNSTILE_IN_DEV=true, so
 * contributors can exercise the rest of the form flow without provisioning
 * real Turnstile keys. Provider failures never log the token or details.
 */
export async function verifyTurnstileToken(input: {
  token: string;
  expectedAction: string;
  remoteIp?: string;
}): Promise<TurnstileVerification> {
  const { token, expectedAction, remoteIp } = input;
  if (!token) return { valid: false, reason: "missing_token" };

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || getAllowedTurnstileHostnames().length === 0) {
    return isDevTurnstileBypassAllowed()
      ? { valid: true }
      : { valid: false, reason: "configuration_missing" };
  }

  try {
    const formData = new URLSearchParams();
    formData.set("secret", secret);
    formData.set("response", token);
    if (remoteIp) formData.set("remoteip", remoteIp);

    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return { valid: false, reason: "provider_unavailable" };
    const result = (await response.json()) as TurnstileSiteverifyResponse;
    if (result.success !== true) {
      return {
        valid: false,
        reason: result["error-codes"]?.includes("internal-error")
          ? "provider_unavailable"
          : "provider_rejected",
      };
    }
    if (!isAllowedTurnstileHostname(result.hostname)) {
      return { valid: false, reason: "hostname_mismatch" };
    }
    if (result.action !== expectedAction) return { valid: false, reason: "action_mismatch" };
    return { valid: true };
  } catch {
    return { valid: false, reason: "provider_unavailable" };
  }
}
