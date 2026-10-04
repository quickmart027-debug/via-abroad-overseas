import "server-only";
import { createHmac } from "node:crypto";

/**
 * Mirrors the email/phone canonicalization in validation/enquiry.ts:
 * email is trimmed and lowercased; phone whitespace, parentheses, and
 * hyphens are removed while its leading plus sign is preserved.
 */
export function deriveContactPairRateLimitKey(email: string, phone: string, secret: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim().replace(/[\s()-]/g, "");
  const digest = createHmac("sha256", secret)
    .update("contact-pair:v1\0")
    .update(normalizedEmail)
    .update("\0")
    .update(normalizedPhone)
    .digest("hex");

  return `contact-pair:v1:${digest}`;
}

/**
 * Per-email key: an HMAC of the normalized email ALONE, so rotating the phone
 * number (or the User-Agent) cannot reset the quota for one inbox. This is
 * what caps confirmation emails sent to any single address.
 */
export function deriveEmailRateLimitKey(email: string, secret: string) {
  const digest = createHmac("sha256", secret)
    .update("email:v1\0")
    .update(email.trim().toLowerCase())
    .digest("hex");

  return `email:v1:${digest}`;
}

/**
 * IPv6 clients usually control a whole /64, so per-address limits would be
 * trivial to rotate around; group IPv6 by its /64 prefix. IPv4 (including
 * IPv4-mapped IPv6) is used as-is.
 */
function normalizeIpForRateLimit(ip: string) {
  const value = ip.trim().toLowerCase();
  const mapped = value.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return mapped[1];
  if (!value.includes(":")) return value;

  const [head, tail = ""] = value.split("%")[0].split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = value.includes("::") && tail ? tail.split(":") : [];
  const missing = Math.max(0, 8 - headGroups.length - tailGroups.length);
  const groups = [...headGroups, ...Array(missing).fill("0"), ...tailGroups];
  return `${groups
    .slice(0, 4)
    .map((group) => group.replace(/^0+(?=.)/, ""))
    .join(":")}::/64`;
}

/**
 * Per-IP key: an HMAC of the client IP only (no User-Agent), so cycling the
 * User-Agent header cannot mint fresh fingerprint buckets. The raw IP never
 * becomes Redis key material.
 */
export function deriveIpRateLimitKey(ip: string, secret: string) {
  const digest = createHmac("sha256", secret)
    .update("ip:v1\0")
    .update(normalizeIpForRateLimit(ip))
    .digest("hex");

  return `ip:v1:${digest}`;
}
