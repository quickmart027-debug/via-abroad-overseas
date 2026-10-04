import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  RateLimitUnavailableError,
  resolveRateLimitRuntimeConfig,
  type RateLimitRuntimeConfig,
} from "@/lib/rate-limit/config";

type Window = `${number} ${"s" | "m" | "h"}`;
type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};
type Limiter = { limit(key: string): Promise<RateLimitResult> };
type DistributedLimiterFactory = (
  requests: number,
  window: Window,
  url: string,
  token: string
) => Limiter;

class InMemoryRateLimiter implements Limiter {
  private hits = new Map<string, number[]>();

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  async limit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const existing = (this.hits.get(key) ?? []).filter((time) => time > windowStart);
    existing.push(now);
    this.hits.set(key, existing);
    const success = existing.length <= this.maxRequests;
    return {
      success,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - existing.length),
      reset: windowStart + this.windowMs,
    };
  }
}

const createUpstashLimiter: DistributedLimiterFactory = (requests, window, url, token) => {
  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: "vao-ratelimit",
  });
};

function assertUsableConfiguration(config: RateLimitRuntimeConfig) {
  if (config.abuseHashSalt.kind === "missing") {
    if (!config.localFallbackAllowed) {
      throw new RateLimitUnavailableError("abuse_hash_salt_missing");
    }
  } else if (config.abuseHashSalt.kind === "invalid") {
    throw new RateLimitUnavailableError("abuse_hash_salt_invalid");
  }
}

/**
 * Creates one limiter policy while deferring runtime/config checks until a
 * request invokes limit(). This keeps production secrets out of build-time
 * route evaluation. In-memory behavior is restricted to development/tests.
 */
export function createRateLimiter(
  requests: number,
  window: Window,
  dependencies: {
    resolveConfig?: () => RateLimitRuntimeConfig;
    createDistributed?: DistributedLimiterFactory;
  } = {}
): Limiter {
  const resolveConfig = dependencies.resolveConfig ?? (() => resolveRateLimitRuntimeConfig());
  const distributedFactory = dependencies.createDistributed ?? createUpstashLimiter;
  const [amount, unit] = window.split(" ");
  const multiplier = unit === "h" ? 3_600_000 : unit === "m" ? 60_000 : 1000;
  let memoryLimiter: InMemoryRateLimiter | undefined;
  let distributedLimiter: Limiter | undefined;

  return {
    async limit(key: string) {
      const config = resolveConfig();
      assertUsableConfiguration(config);

      if (config.upstash.kind === "invalid") {
        throw new RateLimitUnavailableError("upstash_invalid");
      }

      if (config.upstash.kind === "missing") {
        if (!config.localFallbackAllowed) {
          throw new RateLimitUnavailableError("upstash_missing");
        }
        memoryLimiter ??= new InMemoryRateLimiter(requests, Number(amount) * multiplier);
        return memoryLimiter.limit(key);
      }

      try {
        distributedLimiter ??= distributedFactory(
          requests,
          window,
          config.upstash.url,
          config.upstash.token
        );
        return await distributedLimiter.limit(key);
      } catch {
        // Never retain provider messages, URLs, tokens, or request keys.
        throw new RateLimitUnavailableError("upstash_unavailable");
      }
    },
  };
}

export const rateLimitPolicy = {
  fingerprint: { requests: 5, window: "10 m" },
  ip: { requests: 10, window: "10 m" },
  contactPair: { requests: 3, window: "1 h" },
  email: { requests: 3, window: "1 h" },
} as const;

/** Per-fingerprint burst limit: 5 submissions per 10 minutes. */
export const formFingerprintLimiter = createRateLimiter(
  rateLimitPolicy.fingerprint.requests,
  rateLimitPolicy.fingerprint.window
);

/** Stricter limit keyed on the HMAC of the normalized email+phone pair. */
export const formContactLimiter = createRateLimiter(
  rateLimitPolicy.contactPair.requests,
  rateLimitPolicy.contactPair.window
);

/**
 * Per-IP limit: 10 submissions per 10 minutes, keyed on the client IP alone
 * (IPv6 grouped by /64). Looser than the fingerprint limit so a shared
 * office/college NAT isn't blocked, but it can't be reset by changing the
 * User-Agent.
 */
export const formIpLimiter = createRateLimiter(
  rateLimitPolicy.ip.requests,
  rateLimitPolicy.ip.window
);

/**
 * Per-email limit: 3 submissions per hour, keyed on the HMAC of the
 * normalized email alone. Caps confirmation emails to any one inbox no
 * matter which phone number is paired with it.
 */
export const formEmailLimiter = createRateLimiter(
  rateLimitPolicy.email.requests,
  rateLimitPolicy.email.window
);

/** Safe runtime status for health/preflight checks; it contains no secrets. */
export { getRateLimitConfigurationStatus } from "@/lib/rate-limit/config";
