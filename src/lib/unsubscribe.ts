/**
 * Generates one-click unsubscribe URLs for marketing emails.
 * Token = HMAC-SHA256(email, UNSUBSCRIBE_SECRET || JWT_SECRET).
 *
 * Throws if neither secret env var is configured — callers (cron/email
 * senders) must ensure the env is set before generating URLs.
 */
import { createHmac } from "crypto";
import { BASE_URL } from "@/lib/constants";

function getUnsubscribeSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET ?? process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("UNSUBSCRIBE_SECRET (or JWT_SECRET) env var is not set");
  }
  return secret;
}

export function makeUnsubscribeUrl(email: string): string {
  const token = createHmac("sha256", getUnsubscribeSecret())
    .update(email.toLowerCase().trim())
    .digest("hex");
  return `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}
